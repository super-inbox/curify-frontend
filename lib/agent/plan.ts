/**
 * Design-agent planner — intent → an ordered plan of tool steps.
 *
 * Follows the routing ladder from the SOTA digest: cheap deterministic rules
 * first, then the existing KB-grounded matcher, and a reasoning pass only when
 * the request is genuinely multi-step. It deliberately does NOT re-implement
 * routing — `buildSearchGenerationPlan` already does multi-route retrieval +
 * LLM rerank against the 227-entry capability KB and fills parameters.
 *
 * Abstention is a first-class outcome. The matcher's own eval shows gap queries
 * still scoring ~0.75, so a low-confidence result must produce an `abstain`
 * plan (ask, or fall back to freeform) rather than a confidently wrong template.
 */
import OpenAI from "openai";
import { buildSearchGenerationPlan } from "@/lib/searchGenerationPlan";
import { AGENT_TOOLS, TOOLS_BY_ID, toolCatalogForPrompt } from "@/lib/agent/tools";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;
/** Below this the matcher is not trustworthy — abstain instead of committing. */
const CONFIDENCE_FLOOR = 0.6;
const MAX_STEPS = 6;

export type PlanStep = {
  n: number;
  tool_id: string;
  label: string;
  /** Why this step exists — rendered in the UI. (No trace store exists yet.) */
  reason: string;
  template_id?: string;
  params?: Record<string, string>;
  prompt?: string;
  /** Declared but not executable yet; carries the tool that implements it. */
  blocked?: { implementedBy: string; blocker: string };
};

export type AgentPlan = {
  query: string;
  routing: {
    confidence: number;
    abstained: boolean;
    /** Present when abstained — what we need from the user. */
    clarification?: string;
    matched_templates: Array<{ template_id: string; title: string; confidence: number }>;
  };
  steps: PlanStep[];
  gaps: Array<{ tool_id: string; implementedBy: string; blocker: string }>;
  notice?: string;
};

let _client: OpenAI | null | undefined;
function getClient(): OpenAI | null {
  if (_client !== undefined) return _client;
  const key = process.env.OPENAI_API_KEY;
  _client = key ? new OpenAI({ apiKey: key, timeout: TIMEOUT_MS }) : null;
  return _client;
}

const SYSTEM = `You plan a short design workflow for Curify.

Available tools:
{tools}

Rules:
- Output 1-{max} steps. Fewer is better. Do not pad.
- Prefer generate_from_template over generate_freeform whenever a template matched.
- If the user asks for an exact number of items (a 20-SKU sheet, a 3x3 set), generate the
  cells and then add a compose_grid step. Never expect one generation to emit an exact count.
- If the deliverable is physical (sticker, packaging, print), the LAST step must be a
  production step (export_print_package / fold_dieline_3d / assemble_pdf) even though those
  are NOT_YET_EXECUTABLE — a generated image is not a production file.
- Only use a tool marked image:required if the user supplied a reference image.
- Every step needs a short concrete reason.

Return JSON: {"steps":[{"tool_id":"...","reason":"...","prompt":"optional"}]}`;

/** Deterministic pre-checks that don't need a model. */
function wantsExactGrid(query: string): number | null {
  const m = query.match(/(\d{1,3})\s*(?:个|张|款|sku|skus|items?|cells?|grid)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 4 && n <= 100 ? n : null;
}
function wantsPhysicalOutput(query: string): boolean {
  return /sticker|贴纸|die.?cut|刀线|packaging|包装|print|印刷|cmyk|出血|pdf|dieline|刀版/i.test(query);
}

export async function buildAgentPlan(
  query: string,
  opts: { hasImage?: boolean; locale?: string } = {},
): Promise<AgentPlan> {
  const { hasImage = false, locale = "en" } = opts;

  // --- 1. route against the existing KB-grounded matcher -------------------
  let directions: Awaited<ReturnType<typeof buildSearchGenerationPlan>>["directions"] = [];
  let notice: string | undefined;
  try {
    const routed = await buildSearchGenerationPlan(query, locale);
    directions = routed.directions ?? [];
    notice = routed.notice;
  } catch {
    notice = "template matcher unavailable — planned as freeform";
  }

  const best = directions[0]?.confidence ?? 0;
  const abstained = directions.length === 0 || best < CONFIDENCE_FLOOR;

  const routing: AgentPlan["routing"] = {
    confidence: best,
    abstained,
    matched_templates: directions.slice(0, 3).map((d) => ({
      template_id: d.template_id,
      title: d.title,
      confidence: d.confidence,
    })),
  };

  // --- 2. abstain rather than commit to a weak match -----------------------
  if (abstained) {
    routing.clarification =
      "No template matched confidently. Generating freeform instead — " +
      "tell me the format (poster / sticker sheet / packaging / worksheet) for a stronger match.";
    const steps: PlanStep[] = [
      {
        n: 1,
        tool_id: "generate_freeform",
        label: TOOLS_BY_ID.generate_freeform.label,
        reason: hasImage
          ? "No confident template match — running image-to-image from your reference."
          : "No confident template match — running text-to-image.",
        prompt: query,
      },
    ];
    return { query, routing, steps, gaps: collectGaps(steps), notice };
  }

  // --- 3. plan the steps ---------------------------------------------------
  const steps = await planSteps(query, directions, { hasImage });
  return { query, routing, steps, gaps: collectGaps(steps), notice };
}

async function planSteps(
  query: string,
  directions: Array<{ template_id: string; title: string; params: Record<string, string>; confidence: number; reason: string }>,
  opts: { hasImage: boolean },
): Promise<PlanStep[]> {
  const top = directions[0];
  const gridN = wantsExactGrid(query);
  const physical = wantsPhysicalOutput(query);

  // Simple, unambiguous case — no model call needed.
  if (!gridN && !physical) {
    return finalize([
      {
        tool_id: "generate_from_template",
        reason: `Matched "${top.title}" at ${(top.confidence * 100) | 0}% — parameters already filled.`,
        template_id: top.template_id,
        params: top.params,
      },
    ], opts);
  }

  const client = getClient();
  if (!client) {
    // Deterministic fallback keeps the demo functional without a key.
    const s: Array<Partial<PlanStep> & { tool_id: string; reason: string }> = [
      {
        tool_id: "generate_from_template",
        reason: `Matched "${top.title}" — generating the artwork.`,
        template_id: top.template_id,
        params: top.params,
      },
    ];
    if (gridN) s.push({ tool_id: "compose_grid", reason: `Compose the ${gridN} cells into an exact grid.` });
    if (physical) s.push({ tool_id: "export_print_package", reason: "Physical deliverable — needs a production package, not a PNG." });
    return finalize(s, opts);
  }

  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0,
      seed: 42,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM.replace("{tools}", toolCatalogForPrompt()).replace("{max}", String(MAX_STEPS)),
        },
        {
          role: "user",
          content:
            `Request: ${query}\n` +
            `Reference image supplied: ${opts.hasImage ? "yes" : "no"}\n` +
            `Best template match: ${top.template_id} ("${top.title}", ${top.confidence})\n` +
            (gridN ? `User asked for an exact count: ${gridN}\n` : "") +
            (physical ? "Deliverable is physical/print.\n" : ""),
        },
      ],
    });
    const raw = res.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/, ""));
    const out = Array.isArray(parsed.steps) ? parsed.steps : [];
    const mapped = out
      .filter((s: { tool_id?: string }) => s?.tool_id && TOOLS_BY_ID[s.tool_id])
      .slice(0, MAX_STEPS)
      .map((s: { tool_id: string; reason?: string; prompt?: string }) => ({
        tool_id: s.tool_id,
        reason: s.reason || "",
        prompt: s.prompt,
        ...(s.tool_id === "generate_from_template"
          ? { template_id: top.template_id, params: top.params }
          : {}),
      }));
    if (mapped.length) return finalize(mapped, opts);
  } catch {
    /* fall through to the deterministic plan below */
  }

  return finalize(
    [
      {
        tool_id: "generate_from_template",
        reason: `Matched "${top.title}" — generating the artwork.`,
        template_id: top.template_id,
        params: top.params,
      },
    ],
    opts,
  );
}

/**
 * Tools that are part of ROUTING, not of the plan. The model sometimes emits
 * search_templates as step 1 because it is in the catalog, but routing already
 * ran server-side before planning — leaving it in produces a dead step the
 * client can only mark "blocked".
 */
const ROUTING_ONLY_TOOLS = new Set(["search_templates"]);

function finalize(
  raw: Array<Partial<PlanStep> & { tool_id: string; reason: string }>,
  opts: { hasImage: boolean },
): PlanStep[] {
  return raw
    .filter((s) => !ROUTING_ONLY_TOOLS.has(s.tool_id))
    // drop steps that need an image we don't have
    .filter((s) => !(TOOLS_BY_ID[s.tool_id]?.acceptsImage === "required" && !opts.hasImage
      && TOOLS_BY_ID[s.tool_id]?.status === "available"))
    .map((s, i) => {
      const tool = TOOLS_BY_ID[s.tool_id];
      return {
        n: i + 1,
        tool_id: s.tool_id,
        label: tool.label,
        reason: s.reason,
        template_id: s.template_id,
        params: s.params,
        prompt: s.prompt,
        ...(tool.status === "gap" ? { blocked: tool.gap } : {}),
      } as PlanStep;
    });
}

function collectGaps(steps: PlanStep[]): AgentPlan["gaps"] {
  return steps
    .filter((s) => s.blocked)
    .map((s) => ({ tool_id: s.tool_id, ...s.blocked! }));
}

export { AGENT_TOOLS };
