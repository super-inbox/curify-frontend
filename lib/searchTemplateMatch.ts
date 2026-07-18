// Search ⇄ generation bridge — LLM matcher.
//
// Given a search query, asks gpt-4o-mini which Curify templates could
// GENERATE content for that query (with concrete params filled in),
// even when no inspirations exist today. Used by the search page to
// surface a "Generate from these templates" section alongside the
// existing inspirations grid.
//
// Validated against the 10-query ProgSEO baseline at top-3 100%,
// top-1 90% (see scripts/eval_template_matcher.cjs).
//
// Same prompt + scoring + cache shape as lib/searchRewrite.ts.

import OpenAI from "openai";
import nanoTemplates from "@/public/data/nano_templates.json";
import enNano from "@/messages/en/nano.json";
import capabilityKb from "@/scripts/configs/template_capability_kb.json";
import { getOutputIntent, INTENT_META, type OutputIntent } from "@/lib/output_intent";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 15_000;

type TemplateShape = {
  id: string;
  allow_generation?: boolean;
  og_image?: string;
  locales?: Record<string, { parameters?: Array<{ name?: string }> } | undefined>;
};

type NanoMessages = Record<string, { description?: string } | undefined>;

type CapabilityEntry = {
  template_id: string;
  sample_param_values?: string[];
  search_aliases?: string[];
  inspiration_topics?: string[];
  template_topics?: string[];
};

const CAPABILITY_BY_ID = new Map(
  (capabilityKb.templates as CapabilityEntry[]).map((entry) => [
    entry.template_id,
    entry,
  ]),
);

// Build the catalog blob once at module load. Limits to templates with
// allow_generation=true so the matcher can't suggest a template the
// user can't actually generate from. ~11K tokens at the current 200-
// template catalog.
function buildCatalogBlob(): string {
  const lines: string[] = [];
  const en = enNano as NanoMessages;
  for (const t of nanoTemplates as TemplateShape[]) {
    if (t.allow_generation !== true) continue;
    const desc = (en[t.id]?.description ?? "")
      .replace(/\s+/g, " ")
      .slice(0, 180);
    const params = (t.locales?.en?.parameters ?? [])
      .map((p) => p?.name)
      .filter((n): n is string => Boolean(n))
      .join(",");
    lines.push(`- ${t.id} | params=[${params}] | ${desc}`);
  }
  return lines.join("\n");
}

/**
 * Build a small evidence-rich catalog for the hybrid planner's final pass.
 * The global matcher stays description-only for recall diversity; only the
 * union of Path A + Path B candidates receives capability evidence here, so
 * real aliases/examples help the decision without sending the entire 500KB KB
 * to the model on every search.
 */
function buildTargetedCatalogBlob(templateIds: string[]): string {
  const wanted = new Set(templateIds);
  const lines: string[] = [];
  const en = enNano as NanoMessages;
  for (const t of nanoTemplates as TemplateShape[]) {
    if (!wanted.has(t.id) || t.allow_generation !== true) continue;
    const desc = (en[t.id]?.description ?? "")
      .replace(/\s+/g, " ")
      .slice(0, 240);
    const params = (t.locales?.en?.parameters ?? [])
      .map((p) => p?.name)
      .filter((n): n is string => Boolean(n));
    const kb = CAPABILITY_BY_ID.get(t.id);
    const examples = (kb?.sample_param_values ?? []).slice(0, 8);
    const evidence = [
      ...(kb?.search_aliases ?? []),
      ...(kb?.inspiration_topics ?? []),
      ...(kb?.template_topics ?? []),
    ];
    const aliases = [...new Set(evidence)].slice(0, 12);
    lines.push(
      [
        `- ${t.id}`,
        `required_params=[${params.join(",")}]`,
        desc,
        examples.length ? `examples=[${examples.join("; ")}]` : "",
        aliases.length ? `capabilities=[${aliases.join(", ")}]` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
  return lines.join("\n");
}

const CATALOG_BLOB = buildCatalogBlob();
const TEMPLATE_IDS = new Set(
  (nanoTemplates as TemplateShape[])
    .filter((t) => t.allow_generation === true)
    .map((t) => t.id),
);
// id → og_image preview. Attached to each match server-side so the client
// GenerableTemplatesSection doesn't have to import the 842K templates JSON
// just to look up a preview thumbnail (it shipped in the /search bundle).
const TEMPLATE_OG = new Map<string, string>();
for (const t of nanoTemplates as TemplateShape[]) {
  if (t.og_image) TEMPLATE_OG.set(t.id, t.og_image);
}

const SYSTEM_PROMPT = `You match user search queries to Curify image-generation templates that could create content for those queries.

For EACH query, decide:
- top 2-3 best-fit templates (ordered by confidence desc; fewer is fine if no clear fit)
- for each pick: concrete parameter values extracted from the query
- confidence in 0.0..1.0 (be honest — 0.3 + reason is fine if uncertain)
- short reason (<= 80 chars)

CRITICAL — read EVERY modifier in the query, not just the subject noun. Templates are differentiated by visual style AND layout, not only topic:

- **Style modifiers** (watercolor / retro / vintage / minimalist / photorealistic / anime / kawaii / ink / monochrome) — pick a template whose OUTPUT natively has that style. "Watercolor map" needs a watercolor map template, not a generic destination list.
- **Format / layout modifiers** (chart / grid / list of N / top 10 / 16 types / dual / before-after / comparison / timeline) — pick the template whose LAYOUT matches. "Chart of 16 MBTI types" needs a grid/chart template, NOT a single-character profile.
- **Audience modifiers** (for kids / for beginners / educational) — pick the template whose style fits.
- **Artifact-type modifiers** (recipe poster / promotional poster / care guide / how-to / infographic) — these name the artifact directly. Prefer the template that explicitly produces that artifact.

Pick templates that can GENERATE content for the query AS TYPED, not just templates whose tags overlap with one word.

SUBJECT MATCH IS A HARD GATE (from human eval 2026-06-17). Verify the template's CORE SUBJECT actually serves the query's specific noun BEFORE you return it:

- **REJECT a template whose subject-axis is disjoint from the query, even if it shares the layout/format axis.**
  · "Brazil national team" wants a SQUAD POSTER → do NOT return mbti-of-team templates (different subject-axis: personality typing vs roster lineup).
  · "english spanish word comparison" → do NOT return english-CHINESE comparison templates (language-pair mismatch is a subject mismatch).
  · "diy craft tutorial poster" → do NOT return vegetable-planting-tutorial or action-vocab-card templates (their subjects are vegetables / language, not crafts).
  · "evolution snacks infographic" → do NOT return history-timeline or fashion-evolution templates (subjects are history / clothing, not food).
  · "amusement park map infographic" → do NOT return generic travel-poster templates (subject is parks / rides, not destinations).
  · "1950s vintage diner illustration" → do NOT return evolution / travel-journal / festival templates (none match the era + venue).

- **Franchise / IP-specific queries need IP-aware templates.** Generic "character info card" is NOT a fit for "chiikawa" or named characters — return the kawaii / franchise-specific template if one exists; if not, return [] rather than a generic fallback.

- **Iconic-moment / event-analysis intent ≠ team-or-player templates.** "Maradona Hand of God" / "most memorable World Cup moments" want sports iconic-event-analysis-poster (single-moment deep-dive), NOT squad poster or schedule.

- **When NO catalog template has the right subject, return fewer picks — or [] — rather than padding with layout-matching but subject-wrong templates.** An honest [] is a real signal that beats a confident wrong pick.

Quick worked examples (from human eval ground truth):
  Q: "fifa 2026" → ✓ world cup poster + world cup schedule (subject + format align)
  Q: "Maradona Hand of God" → ✓ sports iconic-event-analysis-poster; ✗ generic football poster
  Q: "english spanish word comparison" → ✓ english-spanish vocabulary template if any; ✗ english-chinese comparison
  Q: "chiikawa" → ✓ kawaii-IP profile/grid template; ✗ generic character analysis
  Q: "diy craft tutorial poster" → ✓ crafting-step-by-step-tutorial template; ✗ vegetable planting or action vocab
  Q: "证件照 / id photo" → ✓ portrait-id-photo template; ✗ product poster

Catalog:
{catalog}

Return ONLY a JSON object: {"matches": [{"template_id": "template-...", "params": {"key": "value"}, "confidence": 0.85, "reason": "..."}]}.
No prose, no markdown fences.`;

export type TemplateMatch = {
  template_id: string;
  params: Record<string, string>;
  confidence: number;
  reason: string;
  /** og_image preview URL, attached server-side from the templates catalog. */
  og_image?: string;
  /** Output Intent (JTBD) + its differentiated Key Action CTA, attached
   *  server-side so the search UI can show the right verb (P0-2). */
  output_intent?: OutputIntent;
  cta?: string;
};

type MatchCache = Map<string, { matches: TemplateMatch[]; at: number }>;
const CACHE: MatchCache = new Map();
const CACHE_MAX = 256;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

function cacheGet(key: string): TemplateMatch[] | null {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  CACHE.delete(key);
  CACHE.set(key, hit);
  return hit.matches;
}

function cacheSet(key: string, matches: TemplateMatch[]) {
  if (CACHE.size >= CACHE_MAX) {
    const first = CACHE.keys().next().value;
    if (first !== undefined) CACHE.delete(first);
  }
  CACHE.set(key, { matches, at: Date.now() });
}

let _client: OpenAI | null | undefined;
function getClient(): OpenAI | null {
  if (_client !== undefined) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    _client = null;
    return null;
  }
  try {
    _client = new OpenAI({ apiKey: key, timeout: TIMEOUT_MS });
  } catch {
    _client = null;
  }
  return _client;
}

function sanitizeParams(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || !k) continue;
    if (v === null || v === undefined) continue;
    out[k] = String(v);
  }
  return out;
}

/**
 * Ask gpt-4o-mini for up to 3 templates that could generate content
 * matching `query`. Returns [] on any failure (missing key, timeout,
 * malformed response, hallucinated template_ids) — caller should treat
 * empty as "no matcher rail to show this query."
 */
export async function matchTemplatesForQuery(
  query: string,
): Promise<TemplateMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const client = getClient();
  if (!client) return [];

  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT.replace("{catalog}", CATALOG_BLOB) },
        { role: "user", content: `Query: ${trimmed}` },
      ],
    });
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];
    const cleanedMatches: TemplateMatch[] = [];
    const seen = new Set<string>();
    for (const m of matches) {
      if (!m || typeof m !== "object") continue;
      const tid = (m as { template_id?: unknown }).template_id;
      if (typeof tid !== "string") continue;
      if (!TEMPLATE_IDS.has(tid)) continue; // reject hallucinations
      if (seen.has(tid)) continue;
      seen.add(tid);
      const confRaw = (m as { confidence?: unknown }).confidence;
      const conf =
        typeof confRaw === "number" ? Math.max(0, Math.min(1, confRaw)) : 0.5;
      const intent = getOutputIntent(tid);
      cleanedMatches.push({
        template_id: tid,
        params: sanitizeParams((m as { params?: unknown }).params),
        confidence: conf,
        reason: String((m as { reason?: unknown }).reason ?? ""),
        og_image: TEMPLATE_OG.get(tid),
        output_intent: intent,
        cta: INTENT_META[intent].cta,
      });
      if (cleanedMatches.length >= 3) break;
    }
    cacheSet(cacheKey, cleanedMatches);
    return cleanedMatches;
  } catch {
    return [];
  }
}

/**
 * Final hybrid-planner pass over a targeted Path A + Path B candidate pool.
 * Reuses the production matcher contract, but supplies richer evidence and
 * never lets the model select outside the provided candidates.
 */
export async function rerankTemplateCandidatesForQuery(
  query: string,
  candidateIds: string[],
): Promise<TemplateMatch[]> {
  const trimmed = query.trim();
  const allowedIds = [...new Set(candidateIds)]
    .filter((id) => TEMPLATE_IDS.has(id))
    .slice(0, 14);
  if (trimmed.length < 2 || allowedIds.length === 0) return [];

  const client = getClient();
  if (!client) return [];

  const catalog = buildTargetedCatalogBlob(allowedIds);
  if (!catalog) return [];
  const cacheKey = `targeted:${trimmed.toLowerCase()}:${allowedIds.join(",")}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            SYSTEM_PROMPT.replace("{catalog}", catalog) +
            "\n\nEvery required_params key must be present and non-empty. " +
            "Return 1-3 candidates only when confidence is at least 0.60. " +
            "Do not pad the list and do not select a template outside this catalog.",
        },
        { role: "user", content: `Query: ${trimmed}` },
      ],
    });
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];
    const allowed = new Set(allowedIds);
    const cleanedMatches: TemplateMatch[] = [];
    const seen = new Set<string>();
    for (const m of matches) {
      if (!m || typeof m !== "object") continue;
      const tid = (m as { template_id?: unknown }).template_id;
      if (typeof tid !== "string" || !allowed.has(tid) || seen.has(tid)) {
        continue;
      }
      const confRaw = (m as { confidence?: unknown }).confidence;
      const confidence =
        typeof confRaw === "number"
          ? Math.max(0, Math.min(1, confRaw))
          : 0;
      if (confidence < 0.6) continue;
      seen.add(tid);
      const intent = getOutputIntent(tid);
      cleanedMatches.push({
        template_id: tid,
        params: sanitizeParams((m as { params?: unknown }).params),
        confidence,
        reason: String((m as { reason?: unknown }).reason ?? ""),
        og_image: TEMPLATE_OG.get(tid),
        output_intent: intent,
        cta: INTENT_META[intent].cta,
      });
      if (cleanedMatches.length >= 3) break;
    }
    cacheSet(cacheKey, cleanedMatches);
    return cleanedMatches;
  } catch {
    return [];
  }
}
