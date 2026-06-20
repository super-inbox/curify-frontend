# Multi-intent Search V0 — Design Document

_Status: design, not built. Filed 2026-06-18. Owner: jay._  
_Companion eval set: `docs/multi-intent-eval-v0.md` (empty — to be populated in the Eval phase)._

---

## 1. Background

Curify's search page today answers the question "what does the catalog have for this query?" It surfaces four content surfaces: Inspirations, Templates, Generable Templates, and Gallery Prompts.

Broad queries — a single word like `北京`, `wedding`, `football` — mask several distinct user goals simultaneously. A user typing `北京` might want a travel itinerary poster, a city map, a food guide, or a historical culture infographic. Today the search page shows all matching content in a flat grid, leaving the user to infer which goal each result serves.

Multi-intent search exposes those distinct goals explicitly: given a broad query, generate 3–5 sub-intents that represent meaningfully different user purposes, render them as clickable chips, and let the user drill into the intent that matches their actual goal.

---

## 2. Current search architecture

### Query entry point

- `app/[locale]/(public)/search/page.tsx` is a **Server Component**.
- The query is read at line 224: `const { q = "" } = await searchParams;`
- It is trimmed and lower-cased before any processing.
- An empty query immediately redirects to `/${locale}` (line 226).

### Topic-slug shortcut

Before any search occurs, the server checks if the query exactly matches (or uniquely contains) a known topic slug in `ALL_SUGGESTIONS`. If it does (and the topic is not a `searchFallback` entry), the server redirects to `/topics/<slug>`, bypassing free-text search entirely.

A similar WC-country redirect runs even earlier (lines 242–254).

### Free-text matching

Token-based matching runs entirely on the server with zero network I/O:
1. `buildSearchTokens(query)` → `{ primary[], bigrams[] }` (CJK bigram expansion, English plural stemming, stopword removal).
2. `scoreQueryTokens(tokens)` scores every inspiration in `nano_inspiration.json` and every template's i18n blob across `[locale, "en", "zh"]`.
3. Results are bucketed into strict (all primary tokens matched, or bigram threshold met) and relaxed (≥ ⌈N/2⌉ tokens matched).

### Query Rewrite trigger

`rewriteQuery()` (`lib/searchRewrite.ts`) is called only when all three conditions hold:
- `initialThinCount < LOW_RESULT_THRESHOLD` (3) — i.e., fewer than 3 strict inspirations + matched templates
- UA does not match `BOT_UA_REGEX`
- Query does not match `looksLikeGarbageQuery()`

Rewrites are re-scored and merged into the inspiration map by ID (highest score wins; strict flag is promoted across passes). Rewrites are passed to the client as `usedRewrites[]`.

### Rewrite banner

`SearchResultsClient.tsx` lines 179–187: an amber `<div>` is rendered when `usedRewrites.length > 0 && hasResults`. It is purely a display hint — it does not affect which content is shown.

### Generable Templates

`GenerableTemplatesSection.tsx` is a **Client Component**. After mount (`useEffect`), it `POST`s to `/api/search-template-match` with `{ query }` and renders matching "Generate yourself" cards. The API calls `matchTemplatesForQuery()` in `lib/searchTemplateMatch.ts`. This is lazy-loaded so the initial page render is unblocked.

### Server vs Client split

| Component | Type | When |
|---|---|---|
| `page.tsx` | Server Component | At request time; handles tokens, rewrite, gallery prompts |
| `SearchResultsClient.tsx` | Client Component | Renders server-delivered data; owns search input, tracking |
| `GenerableTemplatesSection.tsx` | Client Component | Lazy — fires `useEffect` after mount |

### Locale handling

- `locale` comes from `params.locale` (the `[locale]` segment).
- `resolveContentLocale(locale)` normalizes it to a content-addressable locale.
- Template i18n blobs are built for `[locale, "en", "zh"]`.
- `getTranslations` / `useTranslations` wire next-intl for UI strings.
- All navigation URLs are prefixed `/${locale}/…`.

### Reusable OpenAI patterns (from `lib/searchRewrite.ts` and `lib/searchTemplateMatch.ts`)

Both files share the same patterns, reusable verbatim:
- Lazy `_client` init: re-checks `process.env.OPENAI_API_KEY` on each call so cold-start env-injection works.
- Process-local LRU cache: `Map<string, { …; at: number }>`, max 256 entries, 7-day TTL, LRU eviction.
- `cacheGet` / `cacheSet` helpers.
- JSON parse with code-fence stripping and graceful fallback to `[]` / `{}`.
- Duplicate dedup via `Set` before returning results.
- `console.error` with structured context on every failure path (not `throw`).

---

## 3. Multi-intent definition

Multi-intent search decomposes a broad query into 3–5 **user goals** — distinct reasons a real person would type that query. Each sub-intent is a (label, searchQuery) pair:

- **label**: a short UI label (2–5 words) shown on the chip.
- **searchQuery**: a complete search query the user would have typed if they had known their goal upfront. Used as `?q=<searchQuery>` when the chip is clicked.

Sub-intents are **goal-level decompositions**, not keyword expansions. They answer the question: "What different things could someone want when they type `<query>`?"

---

## 4. Difference from existing search surfaces

| Surface | What it is |
|---|---|
| **Inspirations** | Existing generated images that match the query |
| **Templates** | Template cards that own matched inspirations or whose i18n blob matches |
| **Generable Templates** | LLM-matched templates that *could* generate the query even with no existing inspiration |
| **Gallery Prompts** | Redis-backed user-contributed prompts tagged with the query |
| **Multi-intent chips** | Distinct *user goals* hidden inside a broad query — orthogonal to content type |

The existing surfaces are **content-type axes** (images vs templates vs prompts). Multi-intent is a **user-goal axis**. A broad query can produce 4 sub-intents; each sub-intent then produces its own set of images, templates, and prompts when searched.

---

## 5. Difference from Query Rewrite

| | Query Rewrite | Multi-intent |
|---|---|---|
| **Trigger** | Only when results < 3 (thin query) | Broad queries regardless of result count |
| **Goal** | Expand recall by finding alternate phrasings that match catalog content | Expose distinct user goals hidden in the query |
| **Output** | 1–3 alternate search strings used silently during the same page load | 3–5 labeled goal chips displayed to the user |
| **User interaction** | None — transparent, shown only as an amber banner hint | Explicit — user clicks a chip to navigate |
| **Effect on current results** | Merged into the same page's result set | Produces a new search page with narrower intent |
| **Language** | Produces English rewrites for CJK to match the English-heavy template index | Preserves the original query language |
| **Failure mode** | Empty array → page shows original (possibly thin) results | Empty array → chips section not rendered |

Multi-intent and Query Rewrite are **parallel features**, not alternatives. A thin query can trigger both simultaneously.

---

## 6. Goals

1. Help users narrow broad queries to their actual goal without retyping.
2. Increase conversion (click → generate / download) by reducing mismatch between query intent and content shown.
3. Surface catalog depth that gets buried under a broad flat results grid.
4. Work across all languages — especially CJK queries where a two-character query can mask five different intents.
5. Degrade gracefully: no impact on the existing search experience when multi-intent is unavailable.

---

## 7. Non-goals

V0 does not:
- Generate sub-intents for sub-intent search results (nested expansion).
- Persist sub-intent history across sessions.
- Personalize sub-intents per user.
- Pre-compute sub-intents at build time (queries are too open-ended for static pre-computation).
- Replace or modify Query Rewrite behavior.
- Add any new content to the catalog.
- Add any feature to the topic pages, template pages, or gallery pages.

---

## 8. Input schema

```typescript
type SubIntentRequest = {
  query: string;   // The user's original broad query (UTF-8, any language, max 200 chars)
  locale: string;  // BCP-47 locale string, e.g. "en", "zh", "zh-TW", "ja"
};
```

The API route validates: non-empty query, length ≤ 200, valid string type. Invalid requests return `{ subIntents: [] }` silently.

---

## 9. Output schema

```typescript
type SubIntent = {
  label: string;        // Short UI label, 2–5 words, in the original query language
  searchQuery: string;  // Complete search query to execute on chip click
};

type SubIntentResponse = {
  query: string;
  subIntents: SubIntent[];  // 0–5 items; 0 = no chips rendered
};
```

**Example for `北京`:**

```json
{
  "query": "北京",
  "subIntents": [
    { "label": "旅行攻略",   "searchQuery": "北京旅行攻略" },
    { "label": "景点推荐",   "searchQuery": "北京景点推荐" },
    { "label": "美食指南",   "searchQuery": "北京美食指南" },
    { "label": "历史文化",   "searchQuery": "北京历史文化" },
    { "label": "城市地图",   "searchQuery": "北京城市地图" }
  ]
}
```

---

## 10. Generation rules

Rules enforced in the LLM system prompt and post-processing:

1. **Goal diversity**: each sub-intent must represent a meaningfully different user goal. "北京旅行" and "北京游" are not both acceptable — they are synonyms.
2. **Language preservation**: `label` and `searchQuery` must be in the same language as the input query. For English queries → English output. For Chinese queries → Chinese output. Do not mix scripts within a single sub-intent.
3. **No original-query echo**: no sub-intent's `searchQuery` may equal the original query verbatim.
4. **Avoid style modifiers as primary differentiators**: "watercolor 北京" and "illustration 北京" are not meaningfully different user goals. Style is a secondary dimension.
5. **Label ≤ 5 words**: displayed on a chip; must be scannable at a glance.
6. **searchQuery must be searchable**: it should be a query a user could have typed — no internal syntax, no quotes, no special characters.
7. **3–5 sub-intents**: fewer than 3 is too sparse for a chip row; more than 5 is overwhelming on mobile.
8. **Catalog-grounded but not catalog-limited**: sub-intents should reflect real user goals, even if today the catalog is thin for some. The chip click will show what we have (and the Generable Templates section fills gaps).
9. **Duplicate dedup in post-processing**: case-insensitive comparison on normalized `searchQuery`; keep only the first occurrence.

---

## 11. Examples

### `北京`

```json
[
  { "label": "旅行攻略",   "searchQuery": "北京旅行攻略" },
  { "label": "景点推荐",   "searchQuery": "北京景点推荐" },
  { "label": "美食指南",   "searchQuery": "北京美食指南" },
  { "label": "历史文化",   "searchQuery": "北京历史文化" },
  { "label": "城市地图",   "searchQuery": "北京城市地图" }
]
```

### `plants`

```json
[
  { "label": "plant care guide",    "searchQuery": "plant care guide" },
  { "label": "houseplants",         "searchQuery": "houseplant infographic" },
  { "label": "plant vocabulary",    "searchQuery": "plants vocabulary flashcard" },
  { "label": "botanical art",       "searchQuery": "botanical illustration" },
  { "label": "herbs & medicine",    "searchQuery": "herbal medicine plants" }
]
```

### `football`

```json
[
  { "label": "player profiles",     "searchQuery": "football player profile card" },
  { "label": "team posters",        "searchQuery": "football team poster" },
  { "label": "World Cup 2026",      "searchQuery": "football world cup 2026" },
  { "label": "tactics & positions", "searchQuery": "football tactics positions infographic" },
  { "label": "historic moments",    "searchQuery": "football iconic moments" }
]
```

### `wedding`

```json
[
  { "label": "invitation design",   "searchQuery": "wedding invitation design" },
  { "label": "planning checklist",  "searchQuery": "wedding planning checklist" },
  { "label": "floral decoration",   "searchQuery": "wedding flowers decoration" },
  { "label": "vocabulary cards",    "searchQuery": "wedding vocabulary flashcard" },
  { "label": "photo memories",      "searchQuery": "wedding photo memory collage" }
]
```

---

## 12. Recommended technical architecture

**Recommendation: Option B — new API route, client-side async load**

### Three options compared

| | Option A: server-side in page.tsx | Option B: new API route + client component | Option C: reuse Query Rewrite output |
|---|---|---|---|
| **Page latency** | Adds ~1–3s to TTFB for every broad search | Zero — lazy-loaded after initial render | Zero — rewrite already runs for thin queries |
| **Duplicate LLM calls** | Single call but blocks page | Single call, non-blocking | No extra call, but rewrite only fires for thin queries |
| **API key security** | Server-only ✓ | Server-only ✓ | Server-only ✓ |
| **Caching** | Process-local LRU same as Rewrite | Same, in new lib file | Shares rewrite cache |
| **Bot filtering** | Inherited from page.tsx BOT_UA_REGEX | Must re-implement in route | Inherited |
| **Missing API key** | Returns page without sub-intents (need to thread through) | Route returns `{ subIntents: [] }` | N/A |
| **Invalid JSON** | Falls back to `[]`, page still renders | Route returns `{ subIntents: [] }` | N/A |
| **Request timeout** | Blocks initial page if not carefully gated | Non-blocking; timeout in lib | N/A |
| **Nested search loops** | Need to check searchParams before calling | `from_intent=1` param check in page.tsx | N/A |
| **Locale handling** | Locale available server-side | Send `locale` in POST body | Rewrite ignores locale |
| **Interaction with rewrite banner** | Both run on page load; careful ordering needed | Independent; chips appear after initial render | Conflated — rewrite goals ≠ user goals |

**Why Option B:**

1. **Consistent with existing pattern**: `GenerableTemplatesSection.tsx` uses exactly this pattern — a `useEffect` POST to an API route. The new component can be a sibling and follow the same lifecycle.
2. **Zero regression risk**: the initial search page render is completely unchanged. Multi-intent chips only appear after the first paint.
3. **Independent lifecycle**: multi-intent can fail silently without affecting the existing result surfaces.
4. **Locale-aware**: the POST body can carry `locale` for language-preserving generation.
5. **Clean separation from Query Rewrite**: rewrite is a server-side, thin-query-only mechanism that expands recall. Multi-intent is a user-facing goal decomposition that runs regardless of result count. Sharing the code path would conflate two different concerns.
6. **Option A latency risk**: broad queries (the primary trigger for multi-intent) often return rich results — the rewrite doesn't even fire. Option A would add 1–3s to the TTFB of already-good search pages.
7. **Option C is disqualified**: Query Rewrite only fires for thin queries. Most broad queries return rich results and never touch the rewriter. Multi-intent should fire precisely when results ARE rich — "you have results for 北京; here are 5 more specific angles to explore."

---

## 13. Proposed data flow

```
User types "北京" → Enter
         │
         ▼
page.tsx (Server Component)
  - reads q="北京" from searchParams
  - checks for WC redirect: no match
  - tokenizes + scores inspirations
  - LLM rewrite check: initialThinCount ≥ 3, no rewrite fired
  - passes { query, locale, inspirations, …, usedRewrites=[] }
    to SearchResultsClient
         │
         ▼
SearchResultsClient renders immediately:
  - Examples grid (50+ images)
  - Templates rail
  - [MultiIntentChips placeholder: loading spinner]
  - GenerableTemplatesSection (its own useEffect, separate POST)
         │
         ▼  (useEffect in MultiIntentChips, ~200ms after mount)
POST /api/search-multi-intent
  { query: "北京", locale: "zh" }
         │
         ▼
lib/searchMultiIntent.ts
  - bot UA check (forward header from client via request)
  - garbage-query guard (reuse looksLikeGarbageQuery pattern)
  - cache lookup: miss
  - gpt-4o-mini call (OPENAI_API_KEY server-side)
  - parse JSON, dedup, validate 3–5 items
  - cache set
  - return { subIntents: [...] }
         │
         ▼
MultiIntentChips renders 5 chips:
  [旅行攻略]  [景点推荐]  [美食指南]  [历史文化]  [城市地图]
         │
  User clicks [美食指南]
         │
         ▼
router.push("/${locale}/search?q=北京美食指南&from_intent=1")
         │
         ▼
page.tsx (new request)
  - reads q="北京美食指南", searchParams has from_intent=1
  - skips multi-intent generation (nested expansion prevention)
  - returns normal search results for the narrower query
```

---

## 14. Proposed new files

| File | Purpose |
|---|---|
| `lib/searchMultiIntent.ts` | OpenAI client, system prompt, LRU cache, `generateSubIntents(query, locale)` export. Mirrors the structure of `lib/searchRewrite.ts` and `lib/searchTemplateMatch.ts`. |
| `app/api/search-multi-intent/route.ts` | POST handler. Reads `{ query, locale }`, calls `generateSubIntents`, returns `{ subIntents }`. Max query length 200. Returns `{ subIntents: [] }` on any error. |
| `app/[locale]/(public)/search/MultiIntentChips.tsx` | Client Component. `useEffect` POST to `/api/search-multi-intent`. Renders chip row. Handles loading, empty, error states. Accepts `query`, `locale`, `disabled` (nested prevention). |

Three new files total: one lib, one API route, one component. Zero changes to existing TypeScript or TSX files except `SearchResultsClient.tsx` (one new component mount).

---

## 15. Existing files requiring minimal changes

Only two existing files need any change, and both changes are additive (no existing code altered):

### `app/[locale]/(public)/search/SearchResultsClient.tsx`

Add `MultiIntentChips` to the render tree. Placement: between the rewrite banner and the "Results for…" paragraph (see Section 16 for exact placement). One `import` + one JSX element. No props changes to `SearchResultsClient` itself. The `disabled` prop passed to `MultiIntentChips` comes from a check on `searchParams` (see next item).

### `app/[locale]/(public)/search/page.tsx`

Read the `from_intent` searchParam (line ~224) and pass a `isFromIntent` boolean to `SearchResultsClient`. This prevents nested expansion. No change to any existing search logic.

```typescript
// In Props.searchParams:
searchParams: Promise<{ q?: string; from_intent?: string }>;

// In page.tsx body:
const { q = "", from_intent } = await searchParams;
const isFromIntent = from_intent === "1";

// Pass to SearchResultsClient:
<SearchResultsClient
  ...existing props...
  isFromIntent={isFromIntent}
/>
```

`SearchResultsClient` passes `disabled={isFromIntent}` to `MultiIntentChips`. When disabled, the chip component renders `null` immediately.

---

## 16. UI placement

```
[mobile search input — lg:hidden]

[amber rewrite banner — only when usedRewrites.length > 0]

[MultiIntentChips — visible for broad queries; loading → chips → null on empty/error]
  ← 旅行攻略 →  ← 景点推荐 →  ← 美食指南 →  ← 历史文化 →  ← 城市地图 →

"Results for 北京"

[Examples section]
[Templates section]
[Generable Templates section]
[Gallery Prompts section]

[Related topics chips — existing]
```

### Design

- Chips displayed as a horizontally-scrollable row (similar to `relatedTopics` chips already in `SearchResultsClient.tsx`).
- Visual treatment: slightly distinct from the existing "Browse:" chips to signal these are sub-goals, not topic navigations. Suggested: filled pill with a subtle gradient or soft background, vs the border-only chips currently used for relatedTopics.
- Label only: `← 旅行攻略 →` — no emoji needed (these are goal labels, not topic pills).
- On mobile: horizontal scroll, no line-wrap.

---

## 17. Chip click behavior

1. The chip's `href` is `/${locale}/search?q=${encodeURIComponent(searchQuery)}&from_intent=1`.
2. The click is handled as a `<Link>` navigation (Next.js), not a `router.push`, so it is preloadable and browser-back works.
3. The `from_intent=1` query param signals to the next page to skip multi-intent generation (nested expansion prevention — see Section 18).
4. A tracking event fires on click (see Section 22).
5. The target page is a full search results page for the narrower query, with all four existing surfaces (Inspirations, Templates, Generable Templates, Gallery Prompts).

---

## 18. Nested expansion prevention

A user clicking a chip navigates to `/search?q=北京美食指南&from_intent=1`. On that page:

1. `page.tsx` reads `from_intent` from `searchParams`.
2. Passes `isFromIntent={true}` to `SearchResultsClient`.
3. `SearchResultsClient` passes `disabled={true}` to `MultiIntentChips`.
4. `MultiIntentChips` returns `null` immediately when `disabled` is true — no API call is made.

This is a single-level gate: the narrowed search page shows no chips. If the user manually navigates back and types a new broad query without `from_intent=1`, chips appear normally.

The gate is carried in the URL (not in React state or localStorage), so browser back/forward and page refresh all behave correctly.

---

## 19. Loading, empty, and error states

### Loading state

While the `POST /api/search-multi-intent` is in flight (~0.5–2s), render a subtle skeleton:

```jsx
<div className="mb-6 flex gap-2 overflow-x-auto">
  {[1, 2, 3, 4].map(i => (
    <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-neutral-100" />
  ))}
</div>
```

This preserves layout space and avoids a jarring content-shift when chips appear. Four skeleton pills closely approximate the final chip row width.

### Empty state

When `subIntents.length === 0` (API returned empty, query was too specific, or API key missing), render `null`. The section disappears cleanly — no "No sub-intents found" message. The existing search results are already visible above.

### Error state

On `fetch` failure or non-2xx response, call `setSubIntents([])` and render `null`. Log the error to `console.error` on the client for debugging. Do not surface an error message to the user — the main search results are already visible.

---

## 20. Error handling

| Failure mode | Handling |
|---|---|
| `OPENAI_API_KEY` not set | `lib/searchMultiIntent.ts` returns `[]`; route returns `{ subIntents: [] }`; component renders null |
| OpenAI timeout (>8s) | Caught in try/catch; returns `[]`; NOT cached (let next request retry) |
| Malformed JSON from model | `JSON.parse` wrapped in try/catch; returns `[]`; NOT cached |
| Model returns fewer than 3 sub-intents | Return what we have (could be 1 or 2); component renders chips if ≥1 |
| Model returns > 5 sub-intents | Post-processing slices to 5 |
| Duplicate `searchQuery` values | Post-processing deduplicates (case-insensitive normalized comparison) |
| Bot UA detected in API route | Return `{ subIntents: [] }` immediately; no LLM call |
| Garbage query | Return `{ subIntents: [] }` immediately via `looksLikeGarbageQuery()` check |
| Sub-intent `searchQuery` equals original query | Post-processing drops the item |
| `from_intent=1` in client request | `MultiIntentChips` disabled; no fetch fired |
| Network error from client | `catch` in `useEffect`; `setSubIntents([])`; renders null |
| Request body malformed or query too long | Route returns `{ subIntents: [] }` with status 200 |

All failures result in the chip section silently disappearing. The existing search page is **never blocked or broken** by a multi-intent failure.

---

## 21. Performance and caching considerations

### Process-local LRU cache

Same pattern as `lib/searchRewrite.ts` and `lib/searchTemplateMatch.ts`:
- `Map<string, { subIntents: SubIntent[]; at: number }>`
- Max 256 entries, 7-day TTL, LRU eviction on overflow.
- Cache key: `${query.toLowerCase().trim()}::${locale}` (locale is part of the key because the same query in "en" vs "zh" locale produces different language output).
- Cache on success only. Transient failures (timeout, network) are NOT cached so retries work.

### Vercel serverless reality

Like the existing rewrite and matcher, the process-local cache does not persist across Vercel serverless invocations. In practice this means cache hit rate is limited to within-warm-container deduplication (useful for local dev and short bursts of same-query traffic). A Redis upgrade (same Upstash used elsewhere) would make the cache cross-request without changing the call site.

### LLM call cost

`gpt-4o-mini` at ~$0.15/1M input tokens. A multi-intent prompt is ~900 input tokens (system prompt + query). At 10,000 searches/day with a 20% broad-query rate and 30% cache hit rate: ~1,400 uncached calls/day × ~900 tokens = 1.26M tokens/day ≈ $0.19/day. Negligible.

### Token budget

- System prompt: ~600 tokens (see Section 14 guidance — no catalog blob needed).
- User message: ~10 tokens.
- Expected response: ~80 tokens (5 sub-intents × ~16 tokens each).
- `max_tokens: 300` is sufficient.

### Page performance

Multi-intent chips load asynchronously after the initial page render. They do not affect:
- Time to First Byte (TTFB) — server does zero multi-intent work.
- First Contentful Paint (FCP) — client render shows existing results first.
- Largest Contentful Paint (LCP) — typically the Examples grid, which is unaffected.

---

## 22. Analytics events to consider

| Event | When | Suggested fields |
|---|---|---|
| `search_multi_intent_shown` | `subIntents.length > 0` after chips render | `query`, `count` (number of chips), `locale` |
| `search_multi_intent_click` | User clicks a chip | `query` (original), `subIntent_label`, `subIntent_query`, `position` (1–5), `locale` |
| `search_multi_intent_empty` | API returned 0 sub-intents | `query`, `locale` (for quality monitoring) |
| `search_multi_intent_error` | Fetch failed | `query` (for error rate monitoring) |

Using the existing `useTracking` / `useClickTracking` pattern from `services/useTracking` (already imported in `SearchResultsClient.tsx`). The `search_multi_intent_click` event is the primary conversion metric — it measures how often users find the chip decomposition useful enough to drill down.

A secondary metric: compare `search_noresult` and `search_lowresult` rates before/after for queries where chips were shown, to confirm that narrowed-intent searches return richer results.

---

## 23. Evaluation plan — 20 broad queries

The eval set lives at `docs/multi-intent-eval-v0.md`. For each query, human-judge the following:

1. Are all 3–5 sub-intents meaningfully distinct (not synonyms)?
2. Does each `label` clearly name the user goal (scannable in ≤1 second)?
3. Does each `searchQuery` return ≥1 result in the current catalog?
4. Is the language of `label` and `searchQuery` consistent with the input query language?
5. Is the original query's language preserved (no script-switching)?

**Proposed 20 seed queries for the eval:**

| # | Query | Language | Rationale |
|---|---|---|---|
| 1 | 北京 | zh | Flagship example from the PRD |
| 2 | wedding | en | High-traffic, catalog-rich |
| 3 | football | en | Ambiguous (sport vs league vs team) |
| 4 | plants | en | Multiple dimensions (care, art, vocab, medicine) |
| 5 | 日本 | zh | Country — travel + culture + food + costume |
| 6 | 猫 | zh | Single CJK noun — animal care, vocab, portrait |
| 7 | anime | en | Genre — character, mbti, fandom, art |
| 8 | travel | en | Broad domain |
| 9 | music | en | Genre, vocab, mbti, history |
| 10 | Christmas | en | Holiday — culture, design, vocabulary, poster |
| 11 | fashion | en | Broad style domain |
| 12 | coffee | en | Drink — recipe, culture, vocabulary, lifestyle |
| 13 | 旅行 | zh | Travel in Chinese |
| 14 | dog | en | Animal — care, breed, portrait, vocabulary |
| 15 | paris | en | City — travel, food, fashion, art |
| 16 | love | en | High-ambiguity — relationship, quote, vocabulary, mbti |
| 17 | 美食 | zh | Food/cuisine — regional, recipe, vocabulary, culture |
| 18 | sport | en | Variant of football/athletics — team, infographic, fitness |
| 19 | space | en | Science — infographic, timeline, vocabulary |
| 20 | history | en | Domain — timeline, profile, comparison, infographic |

Scoring rubric: 1 (fail) / 2 (partial) / 3 (pass) per criterion per query. A query passes overall if average criterion score ≥ 2.5. Ship criterion: ≥ 16/20 queries pass.

---

## 24. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM produces synonyms not goals | Medium | System prompt rule + human eval gating |
| LLM switches language (e.g., adds English to a Chinese query) | Low | System prompt rule + post-processing script-check |
| Sub-intent `searchQuery` returns 0 results (wasted click) | Medium | Acceptable in V0; V1 can pre-screen against catalog |
| Chips appear for narrow queries that don't need them | Low | LLM system prompt should detect narrow queries and return `[]`; fallback: min query length guard |
| Bot abuse of the new API route | Low | Same `BOT_UA_REGEX` check in the route |
| `from_intent` param is forged or missing | Low | Missing param = treated as not-from-intent; forge just enables chips on a sub-intent page (acceptable) |
| Cache miss storms during cold start | Very low | Process-local cache warms within minutes; same risk profile as rewrite/matcher |
| User confusion between chips and "Browse:" topic chips | Medium | Visual differentiation (see Section 16); distinct label tone |
| Multi-intent fires for a WC country query that already redirected | Not possible | Country queries redirect before SearchResultsClient renders |
| Nested expansion via direct URL editing (e.g. removing `from_intent=1`) | Acceptable | This is an intentional URL-param gate, not a security control |

---

## 25. Acceptance criteria

### Functional

- [ ] Chips appear within 3 seconds of the search page's initial render for broad queries.
- [ ] Chips do not appear when `from_intent=1` is in the URL.
- [ ] Chips do not appear when the API returns `{ subIntents: [] }`.
- [ ] Clicking a chip navigates to `/${locale}/search?q=<searchQuery>&from_intent=1`.
- [ ] The navigated-to page shows normal search results with no chips.
- [ ] The existing search page renders identically with and without `OPENAI_API_KEY` set (chips section absent when key is missing).
- [ ] Query Rewrite behavior is unchanged (same eval set pass rate ≥ 52/55 PASS).

### Quality (from eval plan above)

- [ ] ≥ 16/20 eval queries produce non-synonym, language-consistent, goal-distinct sub-intents.
- [ ] For each query in the eval set, ≥ 2 of the 3–5 `searchQuery` values return ≥ 1 result in the current catalog (confirms chips are useful, not purely aspirational).

### Performance

- [ ] TTFB and LCP for `/search?q=…` pages are unchanged vs. baseline (A/B measurement with multi-intent deployed but chips not yet rendered).
- [ ] API route p95 response time ≤ 3s (OpenAI timeout is 8s; typical gpt-4o-mini response is 0.5–1.5s).

### Analytics

- [ ] `search_multi_intent_shown` and `search_multi_intent_click` events appear in the admin analytics panel.
- [ ] `search_multi_intent_click` / `search_multi_intent_shown` CTR is measurable after 7 days.

---

## 26. Implementation steps for the next phase

Ordered by dependency. All steps are isolated from existing search logic.

**Step 1 — Create `lib/searchMultiIntent.ts`**  
Copy the LRU cache + lazy-client-init pattern from `lib/searchRewrite.ts`. Write the multi-intent system prompt (language-preservation rules, goal-diversity rules, 3–5 output constraint, no-synonym rule, label-length rule). Export `generateSubIntents(query: string, locale: string): Promise<SubIntent[]>`. Unit-testable in isolation before the route exists.

**Step 2 — Create `app/api/search-multi-intent/route.ts`**  
POST handler. Reads `{ query, locale }`. Validates. Calls `generateSubIntents`. Returns `{ subIntents }`. Add bot UA check (forward `User-Agent` header). Add `MAX_QUERY_LEN = 200` guard. Add `looksLikeGarbageQuery` guard (import from page.tsx or extract to a shared lib).

**Step 3 — Create `app/[locale]/(public)/search/MultiIntentChips.tsx`**  
Client Component. `useEffect` POST to `/api/search-multi-intent`. State: `subIntents | null | []`. Render: skeleton on `null`, `null` on `[]`, chips on populated array. Track `search_multi_intent_shown` and `search_multi_intent_click` using `useTracking` / `useClickTracking`. Chip `href` = `/${locale}/search?q=<encodeURIComponent(searchQuery)>&from_intent=1`. Accept `disabled` prop; return `null` immediately when `disabled`.

**Step 4 — Update `app/[locale]/(public)/search/page.tsx`**  
Read `from_intent` from `searchParams`. Pass `isFromIntent` boolean to `SearchResultsClient`. Additive only — no existing logic changes.

**Step 5 — Update `app/[locale]/(public)/search/SearchResultsClient.tsx`**  
Accept `isFromIntent` prop. Import and mount `<MultiIntentChips query={query} locale={locale} disabled={isFromIntent} />` between the rewrite banner and the "Results for" paragraph. Additive only.

**Step 6 — Run eval set**  
Execute `scripts/eval_search.cjs` to confirm no regression. Then manually judge the 20-query multi-intent eval set in `docs/multi-intent-eval-v0.md` against the rubric in Section 23. Iterate on the system prompt in `lib/searchMultiIntent.ts` until ≥ 16/20 queries pass.

**Step 7 — Deploy and measure**  
Ship behind the existing `OPENAI_API_KEY` gate (no new config needed — missing key = chips absent). Monitor `search_multi_intent_shown` CTR and `search_multi_intent_click` rate for 7 days.

---

_This document is the complete design specification for Multi-intent Search V0. Do not begin Step 1 until the eval plan (Section 23) is confirmed and `docs/multi-intent-eval-v0.md` is populated with expected sub-intents._
