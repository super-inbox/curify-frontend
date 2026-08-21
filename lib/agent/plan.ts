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
import { classifyDeliverable, type DeliverableRoute } from "@/lib/agent/deliverable";
import { WORKFLOWS_BY_DOMAIN } from "@/lib/topic_workflows";
import { directionCaseFor, directionRationale, requiresDirection } from "@/lib/agent/direction";
import { fillLadderParams, templateNeedsImage } from "@/lib/agent/templateParams";

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
  /** `choose_direction` only — which creative-exploration case to borrow. */
  direction_case?: string;
  /** `choose_direction` only — the ladder to expand once a direction is picked. */
  domain?: string;
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
    /** What SHAPE of job this is — see lib/agent/deliverable.ts. */
    deliverable?: DeliverableRoute;
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

/**
 * Expand an expert-authored ladder into plan steps. Shared by the inferred path
 * (a query classified as a `system`) and the stated path (a workflow button), so
 * both produce byte-identical plans — one entry point cannot drift from the other.
 */
async function expandWorkflowPlan(
  query: string,
  domain: string,
  routing: AgentPlan["routing"],
  opts: { hasImage?: boolean; direction?: string } = {},
): Promise<AgentPlan> {
  const wf = WORKFLOWS_BY_DOMAIN[domain];
  const { hasImage = false, direction } = opts;

  // This ladder's FIRST deliverable may be image-to-image (merch starts from
  // your character, product from your product shot). Measured: a text-only merch
  // run passed the direction gate and then died at step 1 with "This template
  // requires a reference image upload." Ask for the image instead of planning a
  // run that cannot start.
  const firstTemplate = wf.steps[0]?.href.replace("/nano-template/", "template-");
  if (!hasImage && firstTemplate && templateNeedsImage(firstTemplate)) {
    const why =
      `The ${domain} workflow starts from your own image — ${wf.steps[0].name.toLowerCase()} ` +
      "is generated from it. Add a reference image to continue.";
    return {
      query,
      routing,
      steps: [{ n: 1, tool_id: "needs_image", label: "Add a reference image", reason: why, domain }],
      gaps: [],
      notice: why,
    };
  }

  // Gate BEFORE expanding. Running the ladder without a shared direction
  // produces five assets that do not match each other, and costs 5x a single
  // generation to find that out — so an unset direction yields ONE step, not
  // five. A reference image can satisfy the gate outright (see direction.ts).
  if (!direction && requiresDirection(domain, hasImage)) {
    return {
      query,
      routing,
      steps: [
        {
          n: 1,
          tool_id: "choose_direction",
          label: "Choose a creative direction",
          reason: directionRationale(domain, hasImage),
          direction_case: directionCaseFor(domain) ?? undefined,
          domain,
        },
      ],
      gaps: [],
      notice: directionRationale(domain, hasImage),
    };
  }
  const steps: PlanStep[] = wf.steps.slice(0, MAX_STEPS).map((s, i) => ({
    n: i + 1,
    tool_id: "generate_from_template",
    label: s.name,
    reason: s.desc,
    template_id: s.href.replace("/nano-template/", "template-"),
    params: {},
  }));

  // Fill each template's DECLARED parameters from the brief. Without this the
  // backend falls back to placeholder defaults and the run generates the
  // template's demo content — see templateParams.ts for the measurement. The
  // direction is threaded in here rather than as its own key, because
  // `style_direction` is not a parameter any template declares.
  const filled = await fillLadderParams(steps, query, direction);
  for (const st of steps) st.params = filled[st.n] ?? {};
  return {
    query,
    routing,
    steps,
    gaps: collectGaps(steps),
    notice: routing.deliverable?.rationale,
  };
}

/**
 * Try-on / lookbook posters are a commercial SET. Returns the distinct
 * directions to generate, or a single empty entry when the ask is a plain edit.
 *
 * The three treatments are standard ecommerce poster framings, kept generic so
 * they read as art direction rather than a fixed template — subject and garment
 * still come from the user's own references, and each prompt says so.
 */
// Keyed on TRY-ON, not on "poster". Matching 海报/poster anywhere fired on
// "把海报的标题放大一点" — a plain edit — and would have tripled the user's
// credits for a one-line change. A try-on request is the commercial deliverable
// where three directions is the norm; editing an existing poster is not.
const POSTER_SET_RE = /\btry[\s-]?on\b|\blookbook\b|试穿|穿搭/i;

function posterSetDirections(
  query: string,
): Array<{ label: string; reason: string; prompt: string }> {
  if (!POSTER_SET_RE.test(query)) return [{ label: "", reason: "", prompt: "" }];
  return [
    {
      label: "studio",
      reason: "Clean studio direction — the safe ecommerce hero.",
      prompt:
        "Direction 1 of 3 — STUDIO: seamless neutral backdrop, even soft light, " +
        "product-forward framing. Keep the supplied person and garment exact.",
    },
    {
      label: "lifestyle",
      reason: "Lifestyle direction — context and mood.",
      prompt:
        "Direction 2 of 3 — LIFESTYLE: real-world setting, natural light, shallow " +
        "depth of field. Keep the supplied person and garment exact.",
    },
    {
      label: "editorial",
      reason: "Editorial direction — stronger styling for campaign use.",
      prompt:
        "Direction 3 of 3 — EDITORIAL: bolder composition, considered colour and " +
        "negative space for copy. Keep the supplied person and garment exact.",
    },
  ];
}

export async function buildAgentPlan(
  query: string,
  opts: {
    hasImage?: boolean;
    locale?: string;
    workflowDomain?: string;
    /** Set once the user confirms a direction — unblocks the ladder. */
    direction?: string;
  } = {},
): Promise<AgentPlan> {
  const { hasImage = false, locale = "en", workflowDomain, direction } = opts;

  // A one-click workflow entry states its domain outright. Do NOT round-trip
  // that through the lexical classifier: the caller already knows which ladder
  // the user clicked, and making the button depend on a regex matching the
  // sentence the button itself generated is a failure waiting to happen (a copy
  // tweak silently reroutes the workflow). Explicit intent wins over inference —
  // the same rule §7g settled for stated-vs-scored deliverable shape.
  if (workflowDomain && WORKFLOWS_BY_DOMAIN[workflowDomain]) {
    return await expandWorkflowPlan(query, workflowDomain, {
      confidence: 1,
      abstained: false,
      deliverable: {
        type: "system",
        domain: workflowDomain,
        rationale: "Started from a workflow entry point — the ladder is stated, not inferred.",
      },
      matched_templates: [],
    }, { hasImage, direction });
  }

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

  // --- 1b. what SHAPE of job is this? --------------------------------------
  // Replaces the old "abstain below 0.60" rule. A weak single-template score is
  // now read as "not a one-template job" rather than "give up" — see
  // lib/agent/deliverable.ts for the measurement that motivated this.
  const deliverable = classifyDeliverable(query, { hasImage, topConfidence: best });
  const abstained = deliverable.type === "unsupported" || directions.length === 0;

  const routing: AgentPlan["routing"] = {
    confidence: best,
    abstained,
    deliverable,
    matched_templates: directions.slice(0, 3).map((d) => ({
      template_id: d.template_id,
      title: d.title,
      confidence: d.confidence,
    })),
  };

  // A multi-asset system: expand the matching ladder instead of collapsing the
  // request onto whichever single template happened to score highest.
  if (deliverable.type === "system" && deliverable.domain) {
    return await expandWorkflowPlan(query, deliverable.domain, routing, { hasImage, direction });
  }

  // Editing an image the user already has — freeform image-to-image.
  if (deliverable.type === "edit") {
    // A commercial try-on / lookbook poster is a SET, not one image: three
    // directions to choose between, the same "offer three" pattern the
    // direction step already uses. One poster is not a usable commercial
    // deliverable.
    //
    // Deliberately narrow — only the poster/lookbook shape expands. A plain
    // "make the title bigger" stays one step, because tripling a routine edit
    // would triple the user's credits for nothing.
    const directions = posterSetDirections(query);
    if (directions.length > 1) {
      const steps: PlanStep[] = directions.map((d, i) => ({
        n: i + 1,
        tool_id: "generate_freeform",
        label: `${TOOLS_BY_ID.generate_freeform.label} — ${d.label}`,
        reason: d.reason,
        prompt: `${query}\n\n${d.prompt}`,
      }));
      return {
        query,
        routing,
        steps,
        gaps: collectGaps(steps),
        notice:
          `Commercial poster — generating ${directions.length} distinct directions ` +
          `so there is something to choose between (${directions.length} images).`,
      };
    }
    const steps: PlanStep[] = [
      {
        n: 1,
        tool_id: "generate_freeform",
        label: TOOLS_BY_ID.generate_freeform.label,
        reason: deliverable.rationale,
        prompt: query,
      },
    ];
    return { query, routing, steps, gaps: collectGaps(steps), notice: deliverable.rationale };
  }

  // --- 2. abstain only when the catalog genuinely cannot do it -------------
  if (abstained) {
    routing.clarification =
      deliverable.type === "unsupported"
        ? deliverable.rationale +
          " I can still generate a visual concept of it — say the word."
        : "No template matched. Generating freeform instead — tell me the format " +
          "(poster / sticker sheet / packaging / worksheet) for a stronger match.";
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
