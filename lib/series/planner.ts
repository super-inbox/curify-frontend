import { randomUUID } from "node:crypto";

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import {
  loadSeriesTemplate,
  type SeriesTemplateParameter,
} from "./templateLoader";
import {
  seriesSpecJsonSchema,
  seriesSpecSchema,
  validateCardCount,
  type SeriesLocale,
  type SeriesSpec,
  type SeriesTemplateId,
} from "./types";

const PLANNER_MODEL = "gpt-4o-mini";
const MAX_PLANNER_ATTEMPTS = 3;

export type PlanSeriesInput = {
  templateId: string;
  params: Record<string, string>;
  locale: string;
  openai?: OpenAI;
};

export type PlanSeriesResult =
  | { ok: true; spec: SeriesSpec; attempts: number }
  | { ok: false; reason: string; attempts: number };

const SYSTEM_PROMPT = `You are a template-aware series planner for an AI image-generation product.
Given a template's base prompt and user-provided parameters, you produce a strict JSON "series spec" describing a sequence of independent images (cards) to render.

Rules:
- Output MUST conform exactly to the provided JSON schema. No extra keys, no missing keys.
- Every card.image_prompt MUST be a fully self-contained instruction for an image-generation model. It should include:
  * the shared visual style (palette, typography, layout aesthetic, watermark, aspect)
  * any text that must appear in the image
  * the specific content of that card
- All visible text in image_prompts MUST be written in the requested locale's language.
- Set series_id to "placeholder" (any non-empty string); the orchestrator overwrites it.
- Do NOT add commentary. Do NOT wrap JSON in markdown.`;

const TEMPLATE_RULES: Record<SeriesTemplateId, string> = {
  "template-book-series": `Template: template-book-series.
- cards.length MUST equal 6.
- card_ids in order: "cover", "themes", "quotes", "ideas", "relations", "structure".
- First card role "cover"; the rest role "content".
- Every card.image_prompt places the book name prominently at the top.`,

  "template-series-infographic": `Template: template-series-infographic.
- Decide a logical, coherent section list adapted to the topic.
- cards.length MUST be between 4 and 8 inclusive.
- First card role "cover"; remaining cards role "section".
- Each card.image_prompt incorporates the user's art_style and the shared single-card layout (top title bar, central visual, content modules, bottom summary highlight).`,

  "template-series-travel": `Template: template-series-travel.
- User provides trip_duration N (positive integer).
- cards.length MUST equal N + 1.
- First card: card_id "overview", role "cover", title "{destination_name} Travel Guide".
- Remaining N cards: card_id "day-1"..."day-N" in order, role "day", title "DAY {i}".
- Reason about destination: pick 5 local foods, 4-5 attractions, 4 transport types, and Morning/Afternoon/Evening activities with costs + simplified routes per day.`,
};

export async function planSeries(
  input: PlanSeriesInput,
): Promise<PlanSeriesResult> {
  const loaded = loadSeriesTemplate(input.templateId, input.locale);
  if (!loaded.ok) return { ok: false, reason: loaded.reason, attempts: 0 };
  const tpl = loaded.data;

  const client = input.openai ?? new OpenAI();

  const conversation: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserPrompt(
        tpl.base_prompt,
        tpl.parameters,
        input.params,
        tpl.locale,
        tpl.template_id,
      ),
    },
  ];

  let lastReason = "";
  for (let attempt = 1; attempt <= MAX_PLANNER_ATTEMPTS; attempt++) {
    const completion = await client.chat.completions.create({
      model: PLANNER_MODEL,
      messages: conversation,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "series_spec",
          strict: true,
          schema: seriesSpecJsonSchema as unknown as Record<string, unknown>,
        },
      },
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch (e) {
      lastReason = `attempt ${attempt}: non-JSON response (${(e as Error).message})`;
      pushCorrection(
        conversation,
        raw,
        "Previous response was not valid JSON. Return a single JSON object matching the schema exactly. No prose, no markdown.",
      );
      continue;
    }

    const zodResult = seriesSpecSchema.safeParse(parsedJson);
    if (!zodResult.success) {
      lastReason = `attempt ${attempt}: schema validation failed: ${zodResult.error.message}`;
      pushCorrection(
        conversation,
        raw,
        `Previous response failed schema validation: ${zodResult.error.message}\nReturn a corrected JSON object that matches the schema exactly.`,
      );
      continue;
    }

    const structural = validateCardCount(zodResult.data, input.params);
    if (!structural.ok) {
      lastReason = `attempt ${attempt}: structural check failed: ${structural.reason}`;
      pushCorrection(
        conversation,
        raw,
        `Previous response failed a structural rule: ${structural.reason}\nReturn a corrected JSON object respecting the count and card_id rules.`,
      );
      continue;
    }

    return {
      ok: true,
      attempts: attempt,
      spec: { ...zodResult.data, series_id: randomUUID() },
    };
  }

  return {
    ok: false,
    attempts: MAX_PLANNER_ATTEMPTS,
    reason: `Planner failed after ${MAX_PLANNER_ATTEMPTS} attempts. Last error: ${lastReason}`,
  };
}

function pushCorrection(
  conversation: ChatCompletionMessageParam[],
  rawAssistant: string,
  correction: string,
): void {
  conversation.push({ role: "assistant", content: rawAssistant });
  conversation.push({ role: "user", content: correction });
}

function buildUserPrompt(
  basePrompt: string,
  parameters: SeriesTemplateParameter[],
  filledParams: Record<string, string>,
  locale: SeriesLocale,
  templateId: SeriesTemplateId,
): string {
  const paramLines = parameters.length
    ? parameters
        .map(
          (p) =>
            `  - ${p.name}: ${JSON.stringify(filledParams[p.name] ?? null)}`,
        )
        .join("\n")
    : "  (none)";

  return [
    `Template id: ${templateId}`,
    `Locale: ${locale} (all visible text in image_prompts must be in this language)`,
    "",
    "Template-specific rules:",
    TEMPLATE_RULES[templateId],
    "",
    "Base prompt (the original template authoring prompt — interpret and expand into a structured per-card plan):",
    "---",
    basePrompt,
    "---",
    "",
    "User parameters:",
    paramLines,
    "",
    "Return the series spec JSON now.",
  ].join("\n");
}
