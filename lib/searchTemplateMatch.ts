// Search ⇄ generation bridge — candidate reranker.
//
// Multi-route vector retrieval happens in searchTemplateRetrieval.ts. This
// module performs the final LLM pass over that bounded candidate pool, checks
// the returned IDs, and fills every required generation parameter.

import OpenAI from "openai";
import nanoTemplates from "@/public/data/nano_templates.json";
import enNano from "@/messages/en/nano.json";
import capabilityKb from "@/scripts/configs/template_capability_kb.json";
import { getOutputIntent, INTENT_META, type OutputIntent } from "@/lib/output_intent";
import { retrieveTemplateCandidatesForQuery } from "@/lib/searchTemplateRetrieval";

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
  title?: string;
  category?: string;
  description?: string;
  template_topics?: string[];
};

const CAPABILITY_BY_ID = new Map(
  (capabilityKb.templates as CapabilityEntry[]).map((entry) => [
    entry.template_id,
    entry,
  ]),
);

/**
 * Build a generic capability catalog for the final rerank. Search aliases and
 * sample values are intentionally excluded because they may contain evaluation
 * queries; runtime routing must remain independent from benchmark inputs.
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
    lines.push(
      [
        `- ${t.id}`,
        kb?.title ? `title=${kb.title}` : "",
        kb?.category ? `category=${kb.category}` : "",
        `required_params=[${params.join(",")}]`,
        kb?.description || desc,
        kb?.template_topics?.length
          ? `capabilities=[${kb.template_topics.join(", ")}]`
          : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
  return lines.join("\n");
}

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

const SYSTEM_PROMPT = `You rerank a bounded candidate set of Curify image-generation templates for a user query.

For the query, decide:
- the top 1-3 best-fit candidates, ordered by confidence descending
- concrete values for every required parameter
- confidence in 0.0..1.0
- short reason (<= 80 chars)

Treat subject compatibility as a hard gate. Then evaluate explicit style,
format/layout, audience, and artifact modifiers. A shared word or shared layout
does not compensate for a mismatched core subject. Return fewer candidates, or
an empty list, instead of padding with weak matches. Never select a template
outside the supplied candidate catalog. A generic template explicitly designed
for any topic is subject-compatible when its required parameters can faithfully
carry the query. When several candidates are valid, prefer complementary
information structures instead of near-duplicate directions.

Candidate catalog:
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

/** Compatibility entry point for the existing API: retrieve across independent
 * semantic routes, then rerank the merged candidate IDs. */
export async function matchTemplatesForQuery(
  query: string,
): Promise<TemplateMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = `final:${trimmed.toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const candidates = await retrieveTemplateCandidatesForQuery(trimmed);
  const matches = await rerankTemplateCandidatesForQuery(
    trimmed,
    candidates.map((candidate) => candidate.template_id),
  );
  if (matches.length > 0) cacheSet(cacheKey, matches);
  return matches;
}

/**
 * Final similarity-planner pass over the global semantic candidate pool.
 * Reuses the production matcher contract, supplies richer evidence, and never
 * lets the model select outside the provided candidates.
 */
export async function rerankTemplateCandidatesForQuery(
  query: string,
  candidateIds: string[],
): Promise<TemplateMatch[]> {
  const trimmed = query.trim();
  const allowedIds = [...new Set(candidateIds)]
    .filter((id) => TEMPLATE_IDS.has(id))
    .slice(0, 18);
  if (trimmed.length < 2 || allowedIds.length === 0) return [];

  const client = getClient();
  if (!client) return [];

  const catalog = buildTargetedCatalogBlob(allowedIds);
  if (!catalog) return [];
  const cacheKey = `targeted:${trimmed.toLowerCase()}:${allowedIds.join(",")}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const allowed = new Set(allowedIds);
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await client.chat.completions.create({
        model: MODEL,
        temperature: 0,
        seed: 42,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              SYSTEM_PROMPT.replace("{catalog}", catalog) +
              "\n\nEvery required_params key must be present and non-empty. " +
              "Return 1-3 candidates only when confidence is at least 0.60. " +
              "Do not pad the list and do not select a template outside this catalog." +
              (attempt > 0
                ? " This is a recovery pass: assess every candidate independently before returning an empty list. Generic any-topic templates remain valid when they can faithfully carry the query."
                : ""),
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
      if (cleanedMatches.length > 0) {
        cacheSet(cacheKey, cleanedMatches);
        return cleanedMatches;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    console.error("[search-template-rerank] failed after retry", lastError);
  }
  return [];
}
