// Server-only LLM query rewriter. Called from app/[locale]/(public)/search/
// page.tsx when the user's original query returns 0 or thin results. The
// rewriter takes the original query plus Curify catalog context and proposes
// 1-3 alternate phrasings that are more likely to match the templates we
// actually have.
//
// Why this exists: alias top-ups (see docs/search-quality.md item 1) cover
// known failure clusters. LLM rewrite covers the long tail — queries we
// could never have pre-aliased, especially short Chinese phrases like
// 唯美春天 or 证件照 where the user's intent maps to a template family they
// would have phrased differently in English.
//
// Production env: needs OPENAI_API_KEY on Vercel. Falls back to a safe
// empty rewrite list on any failure (missing key, timeout, malformed JSON)
// so the search page still serves the original empty-results experience.

import OpenAI from "openai";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 5_000;
const MAX_REWRITES = 3;

// Inlined catalog context. Kept compact because gpt-4o-mini handles short
// system prompts faster. When the catalog drifts substantially (e.g. a
// new tier-1 topic ships), update this block.
const CATALOG_CONTEXT = `Curify is an AI image-template platform. Its catalog includes:
- Bilingual vocabulary flashcards (en-zh, en-ja, en-ko, en-es, en-fr) covering animals, food, family, body, weather, daily routines.
- MBTI personality character cards across universes: Marvel, Studio Ghibli, NBA, Harry Potter, Friends, Naruto, Yellowstone, Silicon Valley, Breaking Bad, Princess Pearl, Zhenhuan.
- Infographic posters: history, culture, science, learning, herbal medicine, evolution timelines, world cuisines.
- Travel content: city posters, watercolor maps, region landmarks, itinerary guides, vintage travel scrapbooks.
- Watercolor and aesthetic illustrations: flowers, botanical, scrapbooks, lifestyle collages.
- Portraits: character profile cards, hairstyle recommendations, portrait retouching, lifestyle photo grids.
- Topics by tier-1 group: character, language, learning, travel, lifestyle, design, product, personality.`;

const SYSTEM_PROMPT = `You help users find templates on Curify.
${CATALOG_CONTEXT}

A user search returned no useful results. You will receive the original query and propose 1-3 alternate phrasings more likely to match the catalog.

Rules:
- Each phrasing is 1-5 words.
- If the original is in Chinese, include both Chinese and English alternates.
- Map vague or culture-specific phrases to broader template-aligned terms (e.g. "证件照" → "passport photo portrait", "唯美春天" → "watercolor spring flowers").
- Prefer concrete catalog nouns (vocabulary, mbti, watercolor, infographic, portrait, travel) over abstract qualifiers.
- Don't return the original query.
- Return ONLY a JSON array of 1-3 strings. No prose, no fences, no keys.`;

type RewriteCache = Map<string, { rewrites: string[]; at: number }>;

// Process-local LRU. Vercel serverless invocations don't share memory so
// this saves nothing across requests in prod — it's mainly here to dedupe
// within a single warm container and to make local dev cheap. A Vercel KV
// or Upstash Redis upgrade can swap in without changing the call site.
const CACHE: RewriteCache = new Map();
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
  return hit.rewrites;
}

function cacheSet(key: string, rewrites: string[]) {
  if (CACHE.size >= CACHE_MAX) {
    const first = CACHE.keys().next().value;
    if (first !== undefined) CACHE.delete(first);
  }
  CACHE.set(key, { rewrites, at: Date.now() });
}

// Lazy-init the OpenAI client so a missing key fails gracefully at call
// time, not at module load. The search page calls this only on the
// failure path, so no overhead on the typical request.
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
 * Ask gpt-4o-mini for up to MAX_REWRITES alternate phrasings of `query`.
 * Returns an empty array on any failure (missing key, timeout, malformed
 * response) — caller should treat empty as "no rewrite available, use the
 * original empty-results experience."
 */
export async function rewriteQuery(query: string): Promise<string[]> {
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
      temperature: 0.4,
      max_tokens: 200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Original query: ${trimmed}` },
      ],
    });
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    // Strip code fences if the model added them despite the instruction.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    const rewrites: string[] = [];
    const seen = new Set([cacheKey]);
    for (const r of parsed) {
      if (typeof r !== "string") continue;
      const s = r.trim();
      if (!s) continue;
      const k = s.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      rewrites.push(s);
      if (rewrites.length >= MAX_REWRITES) break;
    }
    cacheSet(cacheKey, rewrites);
    return rewrites;
  } catch {
    // Cache empty on failure so we don't retry the same broken query
    // every page load within the TTL window.
    cacheSet(cacheKey, []);
    return [];
  }
}
