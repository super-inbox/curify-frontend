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

// Inlined catalog context. Each bullet lists 3-8 concrete sub-examples
// in parens so the LLM can extrapolate "the catalog has X, Y, Z
// specifically" rather than reasoning from a brochure summary. Without
// these sub-examples, weather / cultural-festival / cycling / wine /
// aromatherapy queries got routed to Path B because the model didn't
// realize the catalog covered them. CJK forms inlined for terms where
// the Chinese name is the canonical user-typed query (`香薰`, `端午节`).
//
// Last refresh: 2026-05-22. Update when:
//   - A new tier-1 topic ships
//   - A new template family covers a concept users will search for
//     (cycling, aromatherapy, wine, finance, etc.)
//   - The rewriter eval surfaces a thin-query class that still routes
//     to Path B despite content existing
const CATALOG_CONTEXT = `Curify is an AI image-template platform. Its catalog includes:

- Bilingual vocabulary flashcards (en-zh, en-ja, en-ko, en-es, en-fr) covering animals (cats, dogs, ocean animals, butterflies), food (fruits, vegetables, desserts, coffee, wine), family (parents, siblings), body (head, hands), weather (rain, snow, storms, sunny, windy), daily routines, sports/cycling, transportation (bikes, cars).

- MBTI personality character cards across universes: Marvel, Studio Ghibli, NBA, Harry Potter, Friends, Naruto, Yellowstone, Silicon Valley, Breaking Bad, Princess Pearl, Zhenhuan — plus group-comparison scenarios (office meeting, group chat, weekend plans).

- Infographic posters: history (eras, civilizations), culture (Lunar New Year, Diwali, Dragon Boat Festival 端午节, regional traditions), science (physics, biology, weather education), learning, herbal medicine, evolution timelines, world cuisines (regional dishes, comfort food), finance (saving vs investing, money comparison), wine varieties (red wine, champagne, sake), music styles (jazz, hip-hop, kpop, romantic, classical).

- Travel content: city posters (Paris, Tokyo, Shanghai), watercolor maps, region landmarks, itinerary guides (packing, day trips, cycling tours), vintage travel scrapbooks, country dos-and-donts.

- Watercolor and aesthetic illustrations: flowers (cherry blossom, lily, spring florals), botanical, scrapbooks, lifestyle collages, seasonal themes (cozy winter, summer beach), watercolor travel journals.

- Portraits: character profile cards, hairstyle recommendations, portrait retouching (passport photos / ID photos / professional headshots), lifestyle photo grids, fashion try-on, costume / traditional dress (kimono, hanfu, hanbok, ethnic costume).

- Lifestyle / design: aromatherapy 香薰 and home decor (interior mood boards, spa corner, scented candles, 精油), fashion (red carpet, met gala, jersey, ecommerce), pet care, fitness, kids worksheets.

- Topics by tier-1 group: character, language, learning, travel, culture, lifestyle, design, product, personality. Tier-2 axes include mood (cozy, playful, serene, romantic), lighting (golden hour, soft light, sunset), seasonal (winter, summer, festive), cultural-festivals, costumes.

MBTI / fandom / historical / cultural-festival templates support ANY proper noun the user names — not just the universes shipped as example inspirations above. Genshin Impact, Bridgerton, Taylor Swift, Chiikawa, samurai legends, any country's wine variety, any regional festival can all be templated by the existing infrastructure.`;

const SYSTEM_PROMPT = `You help users find templates on Curify.
${CATALOG_CONTEXT}

A user search returned no useful results. You will receive the original query and decide whether to propose alternate phrasings.

DECISION TREE — pick exactly one path:

Path A — the query is interpretable AND maps to catalog content
(e.g. "手作" → handcraft / watercolor / scrapbooks, "唯美春天" → aesthetic spring,
"证件照" → passport photo, "kawaii fashion" → kawaii character fashion,
"wedding planner" → wedding vocabulary or celebration posters,
"下雨" → rainy weather / weather education / cozy rainy day,
"打雷" → thunderstorm / weather / storm education,
"火山" → volcano / nature science / weather education):
  → Return a JSON array of 1-3 alternate phrasings.
  → Each phrasing is 1-5 words.
  → If the original is in any non-English language (Chinese, Spanish,
    French, Japanese, Korean, etc.), include English alternates — the
    template index is English-heavy and English rewrites match more.
  → Prefer concrete catalog nouns (vocabulary, mbti, watercolor, infographic,
    portrait, travel, food, fashion, character) over abstract qualifiers.
  → Don't return the original query verbatim.

Path B — the query is NOT a catalog-mappable concept
(personal/brand name you don't recognize, untranslatable language, random
keystrokes / garbled text, query that maps to a topic Curify clearly does not
cover like "stock prices" or "tax software"):
  → Return [].
  → DO NOT default to "watercolor flowers" or "lifestyle collages" or other
    generic catalog terms when you can't confidently map the query. That's
    a misleading rewrite — worse than an empty result page.

Examples of empty-return (use Path B ONLY when the query is clearly outside
any visual / creative / cultural domain — NOT for pop-culture names you
don't recognize, which the catalog CAN template via fandom-grid / MBTI):
- "زوحين" → [] (random non-Latin letters that don't form a recognizable word)
- "ddd" → [] (random keystrokes)
- "asjdkfh" → [] (random)
- "Salesforce" → [] (business / enterprise software — not visual content)
- "QuickBooks" → [] (accounting software — not visual content)
- "Zhang Wei" → [] (private individual name, no public/cultural relevance)
- "stock prices" → [] (finance data, not visual)
- "tax software" → [] (business utility, not visual)

CRITICAL: pop-culture names, anime / game franchises, celebrities, public
figures, films, TV shows, fashion brands → ALWAYS Path A (template-mbti-*
or template-fandom-character-grid-poster can handle them):
- "Genshin Impact", "Genshin", "原神" → Path A (anime / fandom MBTI)
- "Bridgerton" → Path A (period drama / regency fashion)
- "Taylor Swift" → Path A (celebrity / music portrait)
- "Stranger Things" → Path A (fandom MBTI / character grid)
- "Chiikawa" → Path A (kawaii anime characters)

Examples of valid rewrites:
- "手作" → ["crafting templates", "diy watercolor", "scrapbook design"]
- "唯美春天" → ["watercolor spring", "spring flowers", "aesthetic florals"]
- "证件照" → ["passport photo portrait", "professional headshot", "证件 风格头像"]

LITERAL-NOUN RULE: a literal noun query (single object the user wants
to see — 鲜花 fresh flowers, 蛋糕 cake, 戒指 ring, 蜡烛 candle, 茶具 teapot,
水杯 cup, 帽子 hat) should be rewritten ONLY to other literal nouns or
direct settings where that object appears — NOT to stylized variants
("watercolor X" / "aesthetic X" / "X illustration") unless the user
explicitly asked for a style. Stylizing a literal-noun query
misleads users who wanted the actual object.
- "鲜花" → ["bouquet", "flower arrangement", "cherry blossom"]  (concrete
  forms of fresh flowers — bouquet, arrangement, specific blossoms —
  NOT "watercolor flowers" or "floral aesthetic")
- "戒指" → ["wedding ring", "jewelry design", "engagement ring"]
- "蜡烛" → ["scented candle", "candle holder", "aromatherapy candle"]

Return ONLY a JSON array (0-3 strings). No prose, no fences, no keys.`;

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
