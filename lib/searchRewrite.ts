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
const TIMEOUT_MS = 8_000;  // bumped from 5s — gives cold-start OpenAI clients more headroom
const MAX_REWRITES = 3;
const MAX_TOKENS = 400;    // bumped from 200 — multi-rewrite JSON for CJK queries can exceed 200
const MAX_TOKENS_MULTI = 600;  // multi-query JSON adds decomposition slots

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
any visual / creative / cultural domain — NOT for pop-culture names,
historical figures, places, or generic concepts in any language):
- "زوحين" → [] (random non-Latin letters that don't form a recognizable word)
- "ddd" → [] (random keystrokes)
- "asjdkfh" → [] (random)
- "Salesforce" → [] (business / enterprise software — not visual content)
- "QuickBooks" → [] (accounting software — not visual content)
- "Zhang Wei" → [] (private individual name, no public/cultural relevance)
- "stock prices" → [] (finance data, not visual)
- "tax software" → [] (business utility, not visual)

CRITICAL: any of the following → ALWAYS Path A. The catalog can template
them via mbti-*, fandom-character-grid, historical-figure-profile,
artist-biography, travel, culture, music-style-visual, dance, or vocabulary
templates. Recognize transliterations across Chinese / Japanese / Korean /
Russian / Spanish / French / Arabic and route them the same way as the
English form:

  - Pop-culture: anime/manga, game franchises, films, TV shows
    e.g. "Genshin Impact" / "原神" / "겐신" → Path A
    e.g. "Bridgerton" → Path A
    e.g. "Stranger Things" → Path A
    e.g. "Chiikawa" / "ちいかわ" / "吉伊卡哇" → Path A

  - Celebrities, athletes, artists, public figures:
    e.g. "Taylor Swift" / "테일러 스위프트" → Path A
    e.g. "BTS" / "방탄소년단" → Path A

  - Historical / notable figures (scientists, philosophers, leaders, artists):
    e.g. "Einstein" / "아인슈타인" / "爱因斯坦" → Path A (character-analysis,
         historical-figure-profile, artist-biography templates)
    e.g. "Newton" / "뉴턴" / "牛顿" → Path A
    e.g. "Marie Curie" / "퀴리 부인" → Path A
    e.g. "Confucius" / "孔子" → Path A

  - Country / region / city names in ANY language:
    e.g. "Korea" / "한국" / "韓国" → Path A (travel + culture + food + costume)
    e.g. "China" / "中国" / "중국" → Path A
    e.g. "Paris" / "巴黎" / "파리" → Path A
    e.g. "Japan" / "日本" / "일본" → Path A

  - Generic creative-domain concepts even when stated as bare nouns:
    e.g. "music" / "音乐" / "음악" → Path A (music-style-visual-infographic)
    e.g. "animation" / "动画" / "애니메이션" → Path A (animation-studio-comparison)
    e.g. "company" / "회사" / "公司" → Path A (business / professional vocabulary
         or category-guide-infographic — DON'T conflate with "Salesforce")

Examples of valid rewrites:
- "手作" → ["crafting templates", "diy watercolor", "scrapbook design"]
- "唯美春天" → ["watercolor spring", "spring flowers", "aesthetic florals"]
- "证件照" → ["passport photo portrait", "professional headshot", "证件 风格头像"]
- "아인슈타인" → ["Einstein character poster", "Einstein historical figure", "scientist biography infographic"]
- "한국" → ["Korea travel poster", "Korean culture infographic", "Korean food vocabulary"]
- "음악" → ["music style infographic", "music genre poster", "music vocabulary card"]
- "회사" → ["company professional guide", "business category infographic", "office lifestyle"]

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

NAMED-ENTITY RELAXATION RULE: when the query names a SPECIFIC entity
nested inside a broader category that the catalog can template
(sub-character of a franchise, sub-period of a culture, sub-region of
a country, lesser-known historical figure), the rewrites should include
BOTH the literal entity AND a broader-category fallback. The catalog
often has the broader content but lacks the specific entity, so the
broader fallback rescues recall while the literal kept in slot 1
preserves intent. Slot 2-3 climb the hierarchy.
- "服部平次" / "Heiji Hattori" → ["Heiji Hattori Detective Conan",
  "Detective Conan supporting characters", "anime detective character"]
- "detective conan character" → ["Detective Conan character card",
  "anime detective protagonist", "manga detective franchise"]
- "阿兹特克" / "Aztec" → ["Aztec culture poster", "ancient Mexico infographic",
  "Mesoamerican civilization"]
- "敦煌" / "Dunhuang" → ["Dunhuang Mogao caves", "China silk road",
  "Chinese ancient art"]
- "Lamine Yamal" → ["Lamine Yamal soccer profile", "Spanish national team",
  "young soccer star portrait"]
- "아인슈타인" / "Einstein" → ["Einstein physicist profile",
  "20th century scientist", "physics historical figure"]
- "박지성" / "Park Ji-sung" → ["Park Ji-sung soccer profile",
  "Korean national football team", "Asian soccer star portrait"]
Do NOT collapse to ONLY the broader category — that loses the user's
intent. Keep the literal in slot 1; add 1-2 hierarchical parents.
Korean and other CJK scripts follow the same rule — examples above
demonstrate KR + JP + CN; relax the literal entity into the same
hierarchical pattern regardless of source script.

Return ONLY a JSON array (0-3 strings). No prose, no fences, no keys.`;

// P0.2 multi-query system prompt — same DECISION TREE, same CATALOG_CONTEXT,
// but the LLM now ALSO decomposes the query into orthogonal retrieval slots
// (subject / style / scene / output / era / mood). Each slot becomes an
// additional Section A retrieval path on top of the 3 paraphrase rewrites.
// Records hit by multiple paths get a multi-hit rank boost in
// app/[locale]/(public)/search/page.tsx.
//
// Why one combined call: each path costs the same downstream
// (scoreQueryTokens is local), so the marginal cost of going from 3 → 8
// paths is one LLM round-trip's extra output tokens, not 5 extra calls.
const SYSTEM_PROMPT_MULTI = `${SYSTEM_PROMPT}

────────────────────────────────────────────────────────────
MULTI-QUERY MODE OVERRIDE — read this carefully.

You will now return BOTH the Path A rewrites array AND a decomposition object that breaks the query into orthogonal retrieval facets. The decomposition slots are optional — only fill the ones the query actually expresses.

Output schema (JSON object, no fences, no prose):
{
  "rewrites": [up to 3 alternate phrasings, same Path A rules as above — or [] for Path B],
  "decomposition": {
    "subject": "the literal object/person/place — bronze artifact / Einstein / Paris — or omit",
    "style":   "the aesthetic/medium — kawaii / watercolor / Y2K / vintage — or omit",
    "scene":   "the setting — office / kitchen / beach / classroom — or omit",
    "output":  "the format — sticker / infographic / poster / comic — or omit",
    "era":     "the time signal — Tang dynasty / Y2K / mid-century — or omit",
    "mood":    "the emotional tone — cozy / dramatic / minimalist — or omit"
  }
}

Decomposition rules:
- Each slot value should be 1-3 words, English, lowercase preferred.
- If the query doesn't contain a slot's facet, OMIT the key. Don't invent.
- Don't repeat the original query verbatim in any slot.
- For Path B queries, return {"rewrites": [], "decomposition": {}}.

Examples:
- "青铜打工小兽" / "bronze worker mythical beast" →
  {"rewrites": ["bronze beast office worker", "bronze worker mascot", "bronze artifact employee"],
   "decomposition": {"subject": "bronze artifact", "style": "anthropomorphic", "scene": "office daily life", "output": "character poster"}}
- "kawaii museum sticker" →
  {"rewrites": ["kawaii museum sticker pack", "cute museum gift sticker", "japanese museum stickers"],
   "decomposition": {"style": "kawaii", "scene": "museum", "output": "sticker"}}
- "唯美春天" →
  {"rewrites": ["watercolor spring", "spring flowers", "aesthetic florals"],
   "decomposition": {"subject": "spring flowers", "style": "watercolor", "mood": "aesthetic"}}
- "鲜花" (literal noun) →
  {"rewrites": ["bouquet", "flower arrangement", "cherry blossom"],
   "decomposition": {"subject": "fresh flowers"}}
- "stock prices" →
  {"rewrites": [], "decomposition": {}}

Return ONLY the JSON object. No prose, no fences.`;

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

// Lazy-init the OpenAI client. Re-checks env on each call so a transient
// env miss (Vercel cold-start before env injection) doesn't permanently
// disable the rewriter for the lifetime of the serverless instance.
let _client: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (_client) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("[searchRewrite] OPENAI_API_KEY not set in env — rewriter disabled");
    return null;
  }
  try {
    _client = new OpenAI({ apiKey: key, timeout: TIMEOUT_MS });
    return _client;
  } catch (e) {
    console.error("[searchRewrite] OpenAI client init failed:", e instanceof Error ? e.message : String(e));
    return null;
  }
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
    const t0 = Date.now();
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Original query: ${trimmed}` },
      ],
    });
    const elapsedMs = Date.now() - t0;
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    const finishReason = res.choices?.[0]?.finish_reason;
    // Strip code fences if the model added them despite the instruction.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error(`[searchRewrite] JSON parse failed for query=${JSON.stringify(trimmed)} finish=${finishReason} rawLen=${raw.length} elapsedMs=${elapsedMs}: ${parseErr instanceof Error ? parseErr.message : String(parseErr)} | raw="${raw.slice(0, 200)}"`);
      return [];  // do NOT cache empty — let the next attempt retry
    }
    if (!Array.isArray(parsed)) {
      console.error(`[searchRewrite] response not an array for query=${JSON.stringify(trimmed)} finish=${finishReason} parsed=${JSON.stringify(parsed).slice(0, 200)}`);
      return [];  // do NOT cache empty — let the next attempt retry
    }
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
    if (rewrites.length === 0) {
      console.error(`[searchRewrite] zero usable rewrites for query=${JSON.stringify(trimmed)} parsed=${JSON.stringify(parsed).slice(0, 200)}`);
    }
    cacheSet(cacheKey, rewrites);
    return rewrites;
  } catch (e) {
    // Surface what actually failed (OpenAI timeout, network, auth, etc).
    // Do NOT cache empty on transient errors — failed cache eats 7 days
    // of retries for what may be a one-off cold-start hiccup.
    console.error(`[searchRewrite] OpenAI call failed for query=${JSON.stringify(trimmed)}: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// P0.2 multi-query retrieval
//
// Returns the same 1-3 paraphrase rewrites as `rewriteQuery` PLUS a
// decomposition object that splits the query into orthogonal facets.
// Each non-empty slot becomes an additional Section A retrieval path.
//
// Total paths fed to scoreQueryTokens from the call site:
//   1 (original) + up-to-3 (rewrites) + up-to-6 (decomposition slots)
//   = up to 10 paths in practice (the doc spec calls this "3 → 8").
//
// Tracking: emit `|paths=<n>` suffix on the search event from the client.
// ─────────────────────────────────────────────────────────────────────────
export type QueryDecomposition = {
  subject?: string;
  style?: string;
  scene?: string;
  output?: string;
  era?: string;
  mood?: string;
};

export type MultiQueryPaths = {
  rewrites: string[];
  decomposition: QueryDecomposition;
};

const MULTI_CACHE: Map<string, { paths: MultiQueryPaths; at: number }> = new Map();

function multiCacheGet(key: string): MultiQueryPaths | null {
  const hit = MULTI_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    MULTI_CACHE.delete(key);
    return null;
  }
  MULTI_CACHE.delete(key);
  MULTI_CACHE.set(key, hit);
  return hit.paths;
}

function multiCacheSet(key: string, paths: MultiQueryPaths) {
  if (MULTI_CACHE.size >= CACHE_MAX) {
    const first = MULTI_CACHE.keys().next().value;
    if (first !== undefined) MULTI_CACHE.delete(first);
  }
  MULTI_CACHE.set(key, { paths, at: Date.now() });
}

const DECOMPOSITION_KEYS: (keyof QueryDecomposition)[] = [
  "subject", "style", "scene", "output", "era", "mood",
];

/** Flatten paths in priority order. Caller uses this to drive
 * scoreQueryTokens; dedupes against the original query. */
export function flattenPaths(original: string, paths: MultiQueryPaths): string[] {
  const out: string[] = [];
  const seen = new Set([original.trim().toLowerCase()]);
  const push = (s: string | undefined) => {
    if (!s) return;
    const t = s.trim();
    if (!t) return;
    const k = t.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(t);
  };
  for (const r of paths.rewrites) push(r);
  for (const k of DECOMPOSITION_KEYS) push(paths.decomposition[k]);
  return out;
}

export async function getMultiQueryPaths(query: string): Promise<MultiQueryPaths> {
  const empty: MultiQueryPaths = { rewrites: [], decomposition: {} };
  const trimmed = query.trim();
  if (trimmed.length < 2) return empty;

  const cacheKey = trimmed.toLowerCase();
  const cached = multiCacheGet(cacheKey);
  if (cached) return cached;

  const client = getClient();
  if (!client) return empty;

  try {
    const t0 = Date.now();
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_tokens: MAX_TOKENS_MULTI,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT_MULTI },
        { role: "user", content: `Original query: ${trimmed}` },
      ],
    });
    const elapsedMs = Date.now() - t0;
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "{}";
    const finishReason = res.choices?.[0]?.finish_reason;
    let parsed: { rewrites?: unknown; decomposition?: unknown };
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error(`[searchRewrite.multi] JSON parse failed query=${JSON.stringify(trimmed)} finish=${finishReason} elapsedMs=${elapsedMs} err=${e instanceof Error ? e.message : String(e)} raw="${raw.slice(0, 200)}"`);
      return empty;
    }

    // Sanitize rewrites
    const rewrites: string[] = [];
    const seen = new Set([cacheKey]);
    if (Array.isArray(parsed.rewrites)) {
      for (const r of parsed.rewrites) {
        if (typeof r !== "string") continue;
        const s = r.trim();
        if (!s) continue;
        const k = s.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        rewrites.push(s);
        if (rewrites.length >= MAX_REWRITES) break;
      }
    }

    // Sanitize decomposition
    const decomposition: QueryDecomposition = {};
    const decRaw = (parsed.decomposition && typeof parsed.decomposition === "object")
      ? (parsed.decomposition as Record<string, unknown>)
      : {};
    for (const key of DECOMPOSITION_KEYS) {
      const v = decRaw[key];
      if (typeof v !== "string") continue;
      const s = v.trim();
      if (!s) continue;
      // Drop slots that are identical to the original or a rewrite —
      // running the same string twice through scoreQueryTokens is pure
      // wasted compute (the merge is a no-op for that record).
      const k = s.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      decomposition[key] = s;
    }

    const out: MultiQueryPaths = { rewrites, decomposition };
    multiCacheSet(cacheKey, out);
    return out;
  } catch (e) {
    console.error(`[searchRewrite.multi] OpenAI call failed for query=${JSON.stringify(trimmed)}: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
    return empty;
  }
}
