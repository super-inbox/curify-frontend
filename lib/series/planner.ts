import { randomUUID } from "node:crypto";

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import {
  loadSeriesTemplate,
  type SeriesTemplateParameter,
} from "./templateLoader";
import {
  clampCardCount,
  planTravelDayCards,
  seriesSpecJsonSchema,
  seriesSpecSchema,
  validateCardCount,
  SERIES_CARD_COUNT_MAX,
  SERIES_CARD_COUNT_MIN,
  TRAVEL_MAX_DAYS,
  TRAVEL_MAX_TOTAL_CARDS,
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
- User provides card_count N (clamped to ${SERIES_CARD_COUNT_MIN}-${SERIES_CARD_COUNT_MAX}). The exact required count is given in the user message under "Card plan"; cards.length MUST equal it.
- First card: card_id "cover", role "cover" — the book's title card.
- Remaining cards: role "content", with short unique descriptive card_ids (e.g. "themes", "quotes", "ideas", "relations", "structure", "characters", "context", "takeaways"). Pick the most relevant book-analysis sections for the requested count: with few cards choose the most essential, with more cards add depth. Do NOT pad with filler.
- Every card.image_prompt places the book name prominently at the top.`,

  "template-series-infographic": `Template: template-series-infographic.
- User provides card_count N (clamped to ${SERIES_CARD_COUNT_MIN}-${SERIES_CARD_COUNT_MAX}). The exact required count is given in the user message under "Card plan"; cards.length MUST equal it.
- Decide a logical, coherent section list adapted to the topic, sized to the requested count.
- First card: card_id "cover", role "cover"; remaining cards role "section" with short unique descriptive card_ids.
- Each card.image_prompt incorporates the user's art_style and the shared single-card layout (top title bar, central visual, content modules, bottom summary highlight).`,

  "template-hotspot-card": `Template: template-hotspot-card.
- User provides card_count N (clamped to ${SERIES_CARD_COUNT_MIN}-${SERIES_CARD_COUNT_MAX}). The exact required count is given in the user message under "Card plan"; cards.length MUST equal it.
- Reason about the hotspot topic and break it into coherent dimensions sized to the requested count.
- First card: card_id "cover", role "cover" — an overview knowledge card for the hotspot. Remaining cards role "section", each a hand-drawn watercolor knowledge card on one dimension, with short unique descriptive card_ids.
- Keep the shared hand-drawn watercolor style across all cards: top title banner ("知识卡片 | {hotspot_name}" or "Knowledge Card | {hotspot_name}"), 3 keyword subtitles, soft watercolor gradient background in a topic-appropriate palette, clear black hand-drawn outlines with low-saturation fills, content modules with icons + cause/effect links, and a one-line summary quote box at the bottom.`,

  "template-series-travel": `Template: template-series-travel.
- User provides trip_duration N (positive integer). Long trips are grouped so the series never exceeds ${TRAVEL_MAX_TOTAL_CARDS} cards (1 overview + up to ${TRAVEL_MAX_TOTAL_CARDS - 1} day cards); trips longer than ${TRAVEL_MAX_DAYS} days are clamped to ${TRAVEL_MAX_DAYS}.
- The exact required cards and the day range each day card must cover are given in the user message under "Travel day plan". Produce EXACTLY those cards, in that order, with those card_ids.
- First card: card_id "overview", role "cover", title "{destination_name} Travel Guide".
- Each day card: role "day". If it covers a single day, title "DAY {d}"; if it covers a range, title "DAYS {start}-{end}".
- For each day card, reason about its whole day range: pick local foods, attractions, transport types, and Morning/Afternoon/Evening activities with costs + simplified routes covering those days.`,
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

  let planText = "";
  if (templateId === "template-series-travel") {
    planText = buildTravelPlanText(filledParams);
  } else {
    planText = buildCardCountPlanText(filledParams);
  }

  return [
    `Template id: ${templateId}`,
    `Locale: ${locale} (all visible text in image_prompts must be in this language)`,
    "",
    "Template-specific rules:",
    TEMPLATE_RULES[templateId],
    planText,
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

function buildCardCountPlanText(params: Record<string, string>): string {
  const requested = Number.parseInt(params.card_count ?? "", 10);
  if (!Number.isFinite(requested) || requested < 1) return "";

  const count = clampCardCount(requested);
  const note =
    requested !== count
      ? ` (card_count ${requested} clamped to ${SERIES_CARD_COUNT_MIN}-${SERIES_CARD_COUNT_MAX})`
      : "";

  return [
    "",
    `Card plan${note}: produce EXACTLY ${count} card(s) — 1 "cover" card plus ${count - 1} content card(s).`,
  ].join("\n");
}

function buildTravelPlanText(params: Record<string, string>): string {
  const n = Number.parseInt(params.trip_duration ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return "";

  const plan = planTravelDayCards(n);
  const note =
    plan.rawDays > plan.effectiveDays
      ? ` (trip_duration ${plan.rawDays} clamped to ${plan.effectiveDays} days)`
      : "";

  const lines = plan.dayCards.map((c) => {
    const label =
      c.startDay === c.endDay
        ? `DAY ${c.startDay}`
        : `DAYS ${c.startDay}-${c.endDay}`;
    return `  - ${c.card_id} (role "day"): cover ${label}`;
  });

  return [
    "",
    `Travel day plan${note} — produce these ${plan.numDayCards + 1} cards in order:`,
    `  - overview (role "cover")`,
    ...lines,
  ].join("\n");
}
