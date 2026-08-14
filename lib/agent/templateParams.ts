/**
 * Fill a ladder step's template parameters from the user's brief.
 *
 * WHY THIS EXISTS (measured 2026-08-14): workflow expansion shipped with
 * `params: {}` and an invented `style_direction` key that no template declares.
 * Templates fall back to their placeholder default when a parameter is missing,
 * so every workflow run generated the template's demo content:
 *
 *   brief "a modern coffee shop for young professionals"
 *     -> template-theme-color-palette-card, param `color_theme_info` unset
 *     -> placeholder "深海鲸鲨蓝紫水彩插画配色色卡"
 *     -> a deep-sea whale shark palette card
 *
 * Eight test generations, eight template defaults, nothing related to the input.
 * The single-template path never had this bug because buildSearchGenerationPlan
 * fills declared parameters; ladder expansion bypassed it entirely.
 */
import OpenAI from "openai";
import nanoTemplates from "@/public/data/nano_templates.json";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;

type ParamSpec = { name?: string; label?: string; placeholder?: string | string[] };
type TemplateShape = {
  id: string;
  requires_image_upload?: boolean;
  locales?: Record<string, { parameters?: ParamSpec[] } | undefined>;
};

const BY_ID = new Map((nanoTemplates as TemplateShape[]).map((t) => [t.id, t]));

/** Does this template refuse to run without a reference image? */
export function templateNeedsImage(templateId: string): boolean {
  return Boolean(BY_ID.get(templateId)?.requires_image_upload);
}

/** Declared parameters, preferring English then any locale that has them. */
export function paramSpecs(templateId: string): ParamSpec[] {
  const t = BY_ID.get(templateId);
  return (
    t?.locales?.en?.parameters ??
    Object.values(t?.locales ?? {}).find((l) => l?.parameters)?.parameters ??
    []
  );
}

/**
 * Is this value just the field label reworded?
 *
 * Observed: `color_theme_info` (label "色彩主题+画面风格描述") came back as
 * "温暖简约调色板 + 现代风格描述" — the label's own structure with an adjective
 * bolted on. That renders as a caption about the field instead of the design.
 * Compares on content characters so CJK and latin are both covered.
 */
function restatesLabel(value: string, label?: string): boolean {
  if (!label) return false;
  const norm = (t: string) => t.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
  const v = norm(value);
  const l = norm(label);
  if (!v || !l) return false;
  if (v === l || v.includes(l)) return true;
  // Substantial overlap with a value no longer than the label means it carries
  // the label's words rather than the brief's.
  const chars = new Set(Array.from(l));
  let hit = 0;
  for (const c of new Set(Array.from(v))) if (chars.has(c)) hit++;
  return v.length <= l.length * 1.4 && hit / chars.size > 0.7;
}

let _client: OpenAI | null | undefined;
function getClient(): OpenAI | null {
  if (_client !== undefined) return _client;
  const key = process.env.OPENAI_API_KEY;
  _client = key ? new OpenAI({ apiKey: key, timeout: TIMEOUT_MS }) : null;
  return _client;
}

/**
 * Deterministic fallback: put the brief (plus the chosen direction) into every
 * declared parameter. Crude for multi-parameter templates, but on-subject —
 * which beats the placeholder default by a wide margin, and it is what runs
 * whenever the model call is unavailable or malformed.
 */
function naiveFill(specs: ParamSpec[], brief: string, direction?: string): Record<string, string> {
  const value = direction ? `${brief} — ${direction}` : brief;
  const out: Record<string, string> = {};
  for (const s of specs) if (s.name) out[s.name] = value;
  return out;
}

/**
 * Fill parameters for every step in ONE model call. Per-step calls would
 * multiply latency across a five-step ladder for no gain — the steps share a
 * brief and a direction, so they are better filled together and stay coherent.
 */
export async function fillLadderParams(
  steps: Array<{ n: number; label: string; template_id?: string }>,
  brief: string,
  direction?: string,
): Promise<Record<number, Record<string, string>>> {
  const specsByStep = new Map<number, ParamSpec[]>();
  for (const s of steps) {
    if (!s.template_id) continue;
    const specs = paramSpecs(s.template_id).filter((p) => p.name);
    if (specs.length) specsByStep.set(s.n, specs);
  }
  if (!specsByStep.size) return {};

  const fallback: Record<number, Record<string, string>> = {};
  for (const [n, specs] of specsByStep) fallback[n] = naiveFill(specs, brief, direction);

  const client = getClient();
  if (!client) return fallback;

  const spec = steps
    .filter((s) => specsByStep.has(s.n))
    .map((s) => ({
      step: s.n,
      deliverable: s.label,
      parameters: specsByStep.get(s.n)!.map((p) => ({
        name: p.name,
        describes: p.label ?? p.name,
        examples: Array.isArray(p.placeholder) ? p.placeholder.slice(0, 3) : [p.placeholder].filter(Boolean),
      })),
    }));

  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Fill design-template parameters from a creative brief. The `examples` show the FORMAT " +
            "and length expected — match their shape, never their subject. Every value must describe the " +
            "user's brief; if a shared creative direction is given, reflect it in every step so the " +
            "set looks like one family. Write values in the same language as the examples. " +
            "NEVER restate the parameter's `describes` text — that is a field label, not content. " +
            "A value like 'colour theme + style description' is a restatement and is WRONG; " +
            "'warm beige and pale-wood palette for a modern coffee shop' is right: concrete, " +
            "specific to the brief, and shaped like the examples. " +
            // The literal word "json" is REQUIRED by the API whenever
            // response_format is json_object; without it the call 400s and the
            // run silently falls back to the naive fill.
            'Return JSON: {"steps":[{"step":N,"params":{"<name>":"<value>"}}]} and nothing else.',
        },
        {
          role: "user",
          content: JSON.stringify({ brief, direction: direction ?? null, steps: spec }),
        },
      ],
    });
    const parsed = JSON.parse(res.choices[0]?.message?.content ?? "{}");
    const out: Record<number, Record<string, string>> = {};
    for (const row of parsed.steps ?? []) {
      const n = Number(row?.step);
      const specs = specsByStep.get(n);
      if (!specs || !row?.params) continue;
      const clean: Record<string, string> = {};
      for (const p of specs) {
        const v = p.name ? row.params[p.name] : undefined;
        if (typeof v !== "string" || !v.trim()) continue;
        if (restatesLabel(v, p.label)) {
          console.warn("[templateParams] step %d param %s restated its label (%j) — dropping",
            n, p.name, v.trim().slice(0, 60));
          continue;                       // incomplete row -> falls back below
        }
        clean[p.name!] = v.trim().slice(0, 400);
      }
      // A partially-filled step would silently reintroduce placeholder defaults
      // for the missing keys, so take the model's row only when it is complete.
      if (Object.keys(clean).length === specs.length) out[n] = clean;
      else
        console.warn(
          "[templateParams] step %d filled %d/%d params (%s) — using fallback",
          n, Object.keys(clean).length, specs.length,
          specs.map((p) => p.name).join(","),
        );
    }
    return { ...fallback, ...out };
  } catch (e) {
    // Silent fallback hid a real failure during testing; a filled-from-brief
    // run and a placeholder-default run look similar until you inspect output.
    console.warn("[templateParams] fill failed, using naive fallback:", (e as Error)?.message);
    return fallback;
  }
}
