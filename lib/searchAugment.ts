// Server-only LLM-driven catalog mapper. Called from
// app/[locale]/(public)/search/page.tsx when the lexical matcher returns
// thin / empty results. Replaces the earlier string-rewrite-then-re-score
// approach (lib/searchRewrite.ts).
//
// What's different: instead of asking gpt-4o-mini for "alternate strings
// the user might type" and feeding those back to the lexical matcher
// (which depends on the rewrite happening to overlap with our alias
// index), this module passes a compact per-template index into the
// system prompt and asks the model to pick template_ids directly. The
// caller then promotes all inspirations under those templates as
// rescue matches. No alias-coverage dependency.
//
// Production env: needs OPENAI_API_KEY on Vercel. Falls back to an empty
// pick list on any failure (missing key, timeout, malformed JSON,
// hallucinated ids) so the search page still serves its
// no-results experience without breaking.

import OpenAI from "openai";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import nanoMessages from "@/messages/en/nano.json";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 8_000; // larger budget than the old rewriter because
                          // the input prompt is ~10× bigger
const MAX_PICKS = 5;
const DESCRIPTION_CHAR_CAP = 140;
const EXAMPLES_CHAR_CAP = 320;
const EXAMPLES_PER_TEMPLATE = 20;

type TemplateRow = {
  id: string;
  topics?: string | string[];
  locales?: Record<string, { base_prompt?: string } | undefined>;
};

type InspirationRow = {
  template_id?: string;
  params?: Record<string, unknown>;
  search_aliases?: string[];
};

type NanoMessage = { description?: string; category?: string };

// For each template, give the LLM visibility into the specific INSTANCES
// it can generate. Two signal sources, combined:
//
//   1. ALL distinct param values across the template's inspirations.
//      These are named-noun queries that users actually type (Chiikawa,
//      Marvel, Italy, Champagne). Frequency-rank loses single-instance
//      proper nouns, so we keep them all.
//   2. Top-N most-frequent search_aliases. Picks up the thematic /
//      cross-language signal (rainy weather, 证件照, 葡萄酒).
//
// Without this, a generic template description like "portrait retouching
// blueprint" never matches user queries like `证件照` (ID photo) where
// the specificity lives at the inspiration level.
const exampleSignalsByTemplate: Map<string, string> = (() => {
  const paramsByTpl = new Map<string, Set<string>>();
  const aliasCountByTpl = new Map<string, Map<string, number>>();

  for (const insp of nanoInspiration as unknown as InspirationRow[]) {
    const tid = insp.template_id;
    if (!tid) continue;

    let paramSet = paramsByTpl.get(tid);
    if (!paramSet) {
      paramSet = new Set<string>();
      paramsByTpl.set(tid, paramSet);
    }
    for (const v of Object.values(insp.params ?? {})) {
      if (typeof v !== "string" || v.length === 0 || v.length > 40) continue;
      paramSet.add(v);
    }

    let aliasBag = aliasCountByTpl.get(tid);
    if (!aliasBag) {
      aliasBag = new Map<string, number>();
      aliasCountByTpl.set(tid, aliasBag);
    }
    for (const a of insp.search_aliases ?? []) {
      if (typeof a !== "string" || a.length === 0 || a.length > 40) continue;
      aliasBag.set(a, (aliasBag.get(a) ?? 0) + 1);
    }
  }

  const out = new Map<string, string>();
  const tids = new Set([...paramsByTpl.keys(), ...aliasCountByTpl.keys()]);
  for (const tid of tids) {
    const params = Array.from(paramsByTpl.get(tid) ?? []);
    const topAliases = Array.from((aliasCountByTpl.get(tid) ?? new Map()).entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, EXAMPLES_PER_TEMPLATE)
      .map(([term]) => term);
    // Params first (they're the named-noun signal users query by); top
    // aliases follow as thematic fallback. Dedupe just in case an alias
    // happens to also be a param value.
    const seen = new Set<string>();
    const terms: string[] = [];
    for (const t of [...params, ...topAliases]) {
      if (!seen.has(t)) {
        seen.add(t);
        terms.push(t);
      }
    }
    let joined = terms.join(", ");
    if (joined.length > EXAMPLES_CHAR_CAP) {
      joined = joined.slice(0, EXAMPLES_CHAR_CAP - 1).trimEnd() + "…";
    }
    out.set(tid, joined);
  }
  return out;
})();

// Build the compact catalog index once at module load. Each line is
// `template-id | topics | description | Examples: <top inspiration
// aliases + param values>`. Average ~260 chars × 187 templates ≈ 48K
// chars ≈ 12K input tokens — well inside gpt-4o-mini's 128K context
// window. The Examples suffix is critical for inspiration-specific
// queries (Chiikawa, 证件照, aromatherapy) where the template
// description alone is too generic.
const TEMPLATE_INDEX_LINES: string[] = (() => {
  const lines: string[] = [];
  for (const t of nanoTemplates as unknown as TemplateRow[]) {
    const topics = Array.isArray(t.topics)
      ? t.topics
      : String(t.topics ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
    const i18n = (nanoMessages as Record<string, NanoMessage | undefined>)[t.id] ?? {};
    const rawDesc = i18n.description ?? t.locales?.en?.base_prompt ?? "";
    const desc = rawDesc.length > DESCRIPTION_CHAR_CAP
      ? rawDesc.slice(0, DESCRIPTION_CHAR_CAP - 1).trimEnd() + "…"
      : rawDesc;
    const examples = exampleSignalsByTemplate.get(t.id) ?? "";
    const exampleSuffix = examples ? ` | Examples: ${examples}` : "";
    lines.push(
      `${t.id} | ${topics.join(",")} | ${desc.replace(/\s+/g, " ")}${exampleSuffix}`,
    );
  }
  return lines;
})();

const TEMPLATE_INDEX = TEMPLATE_INDEX_LINES.join("\n");

// Authoritative set for filtering hallucinated ids out of the LLM
// response. Built at module load alongside the index.
const VALID_TEMPLATE_IDS: Set<string> = new Set(
  (nanoTemplates as unknown as TemplateRow[]).map((t) => t.id),
);

const SYSTEM_PROMPT = `You help users find templates on Curify, an AI image-template platform.

You will receive a user query and the FULL catalog of templates (one per line, format: \`template-id | topics | description | Examples: <distinctive instance keywords>\`).

The \`Examples\` segment is a small sample of the SPECIFIC INSTANCES each template has generated — proper nouns, regions, themes. It is NOT exhaustive: a template that has produced "Italian wine" examples can also generate French/Spanish/etc. variants. Use Examples as a signal of what the template handles WELL, then generalize.

Pick the templates that match the user's INTENT, not just keyword overlap. Cross-language matches count (e.g. \`下雨\` ⇨ a "weather education" template; \`唯美春天\` ⇨ "watercolor spring"; \`证件照\` ⇨ "portrait retouching"; \`葡萄酒\` ⇨ "wine variety intro"). Generalize from Examples — e.g. if a template's Examples include "Italy, France" and the query is "Japan", it can still apply.

Intent-mapping cheat sheet (treat as guidance, not exhaustive):
  - Weather / nature CJK queries (下雨, 打雷, 火山, 下雪) ⇨ weather-education + seasonal templates
  - Cultural-festival queries (端午节, lunar new year, diwali) ⇨ cultural-festival / intangible-heritage / solar-term templates
  - Aesthetic / mood queries (唯美春天, cozy, romantic) ⇨ watercolor / floral / mood-themed templates
  - Bilingual / vocabulary queries (单词, 词汇, animal vocabulary) ⇨ vocabulary / dialogue / phonics templates
  - Personality / character queries (mbti, 性格, character_name, fandom name like Chiikawa) ⇨ mbti / fandom-grid / pop-culture templates
  - Specific-product queries (aromatherapy diffuser, smart cycling computer) ⇨ product-poster / lifestyle templates
  - Off-catalog: random keystrokes (ddd, asjdkfh), unfamiliar personal/brand names (Zhang Wei, Salesforce) ⇨ []

Output rules:
  - Return ONLY a JSON array of template_id strings from the catalog. No prose, no fences.
  - Maximum ${MAX_PICKS} ids. Order most-relevant first.
  - Return [] only for clearly off-catalog queries — otherwise pick at least 1.
  - Do NOT invent template ids — use only ids that appear in the catalog.

CATALOG:
${TEMPLATE_INDEX}`;

type AugmentCache = Map<string, { ids: string[]; at: number }>;

// Process-local LRU. Vercel serverless invocations don't share memory so
// this only saves repeats inside a single warm container. A Vercel KV or
// Upstash Redis upgrade can swap in without changing the call site.
const CACHE: AugmentCache = new Map();
const CACHE_MAX = 256;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

function cacheGet(key: string): string[] | null {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  // touch for LRU
  CACHE.delete(key);
  CACHE.set(key, hit);
  return hit.ids;
}

function cacheSet(key: string, ids: string[]) {
  if (CACHE.size >= CACHE_MAX) {
    const first = CACHE.keys().next().value;
    if (first !== undefined) CACHE.delete(first);
  }
  CACHE.set(key, { ids, at: Date.now() });
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

/**
 * Ask gpt-4o-mini to pick up to MAX_PICKS template_ids that match the
 * user's query intent. Returns an empty array on any failure (missing
 * key, timeout, malformed response, hallucinated-only ids).
 */
export async function augmentWithLLM(query: string): Promise<string[]> {
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
      temperature: 0.4, // matches the old rewriter — gives the model room
                       // to generalize from Examples to nearby instances
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Query: ${trimmed}` },
      ],
    });
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      cacheSet(cacheKey, []);
      return [];
    }
    const ids: string[] = [];
    const seen = new Set<string>();
    for (const r of parsed) {
      if (typeof r !== "string") continue;
      const s = r.trim();
      if (!s || seen.has(s)) continue;
      // Filter hallucinations against the authoritative id set.
      if (!VALID_TEMPLATE_IDS.has(s)) continue;
      seen.add(s);
      ids.push(s);
      if (ids.length >= MAX_PICKS) break;
    }
    cacheSet(cacheKey, ids);
    return ids;
  } catch {
    // Cache empty on failure so the page doesn't retry the same broken
    // query every render within the TTL window.
    cacheSet(cacheKey, []);
    return [];
  }
}

// Back-compat alias for the old function name. Code that still imports
// `rewriteQuery` will get the new direct-mapping behavior — the returned
// strings are now template_ids, not user-facing rewrite text. Callers
// must be updated to use them as ids, not as search-query rewrites.
export { augmentWithLLM as rewriteQuery };
