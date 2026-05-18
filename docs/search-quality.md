# Search Quality Improvement — Status & Audit

_Last updated: 2026-05-18 (item 1 — search_aliases top-up audit — shipped). Owner: jay. Update after every push that touches `app/[locale]/(public)/search/page.tsx`, `lib/searchIndex.ts`, `scripts/enrich_search_aliases.cjs`, `scripts/topup_search_aliases.py`, or `scripts/lib/auto_tag.cjs`._

## Framing

Three parallel tracks:

1. **Recall** — when content exists but search returns zero or thin results. Diagnosed by qualitative competitive analysis (analyst-driven, e.g. the Reddit-search-comparison doc at the repo root) and by zero-CTR queries in production Search Console / admin logs.
2. **Intent** — when content exists and is returned, but the wrong _kind_ of content is surfaced for the query intent (`character_name` returning character infographics instead of name references; `city escapes` returning 3D landmark models instead of itineraries).
3. **CTR / ranking** — once recall and intent are sane, the remaining lever is which results appear above the fold and whether the on-page UX gets the user to click. Driven by `/search` click-attribution analysis (cron on/after 2026-05-22).

Tracks are interleaved but distinct. Recall fixes ship in `search/page.tsx` (tokenizer, matcher) or in `search_aliases` data. Intent fixes need query-shape parsing or tag-routing logic. CTR fixes need analytics first, code second.

---

## What's already shipped

| Date | Commit | What | Why |
| --- | --- | --- | --- |
| 2026-05-14 | `f9e0e5d` | Word-boundary token matching + strict-only template auto-elevation | Stop `met` from matching `metropolitan` / `metallic`; stop relaxed-template matches from auto-promoting every child inspiration to score 100. |
| 2026-05-14 | `f9e0e5d` | Drop `festival` from celebration aliases in `lib/searchIndex.ts` | Was conflating festival-style content with celebration-tier topic. |
| 2026-05-15 | `000da63` | LLM enrichment of `search_aliases` on 1,932 of 1,967 inspirations | Cross-language synonyms users type that don't appear in title/params (e.g. zh "鲜花" on a herbal-lily record). gpt-4o-mini batches via `scripts/enrich_search_aliases.cjs`. |
| 2026-05-15 | `a203ce6` | Catch-up `search_aliases` enrichment for 97 newly-added inspirations | Same script, re-run after a content drop. |
| 2026-05-15 | `ee1e5cc` | Share the enricher with the daily auto-tag pipeline (`scripts/lib/auto_tag.cjs`) | Future content drops auto-enrich; no separate maintenance step. |
| 2026-05-17 | `7df4425` | **Strip structured-syntax noise from query tokenizer** (P0 fix #1) | Tokenizer was preserving meta-words (`topics`, `theme`, `insights`, `highlights`) and punctuation (`: = ·`) as literal tokens. Strict-AND failed; relaxed-OR inflated past threshold. Identified by the Reddit-search-comparison eval. |
| 2026-05-18 | `fe3a4d7` | **Low-result query logging** (shortlist item 2) | New `search_low_result` action type fires from `SearchResultsClient` when total results across grid + matched templates + gallery prompts is 1-2 (threshold = 3). `contentId` carries the query + result count so admin can rank queries by how close they are to the threshold. Existing `search_noresult` event continues to fire for zero-result queries unchanged. Backend SQL panel extension still needed (`curify-studio`) to surface "Low-result queries (last 14 days)" in admin. |
| 2026-05-18 | _(pending push)_ | **`search_aliases` top-up audit** (shortlist item 1) | Appended targeted aliases to 775 inspirations across 48 templates in 6 families — per-country MBTI / culture (23 templates → `global`, `world`, `international`, `cross-cultural`, `country`, plus zh equivalents), synonym / advanced-expression (3 → `theory`, `linguistics`, `synonym`, `antonym`, `advanced expressions`, etc.), travel / destination (13 → `remote`, `destination`, `hidden gems`, `city escape`, `weekend getaway`), expat / lifestyle culture (5 → `expat`, `living abroad`, `cross-cultural living`), spring / aesthetic / watercolor (11 → `spring`, `aesthetic`, `floral`, `botanical`, plus `唯美` / `春天` covering the 2026-05-18 `唯美春天` report), photorealistic portrait / ID photo (3 → `证件照`, `passport photo`, `headshot`, plus `身份证照`, `id photo style` covering the `证件照` report). ~11,841 alias entries added net of dedup. Reproducible via `scripts/topup_search_aliases.py`. |

---

## Diagnostics — Reddit search comparison eval (2026-05-17)

`reddit搜索对比.docx` at the repo root is a 13-query qualitative comparison of Curify search vs Pinterest. The analyst noted, recurringly: _"之前有做过 ... 但搜索结果未显示"_ — content exists, search doesn't surface it. **The full doc reflects post-2026-05-15-fix behavior** — i.e. these failures persist after the word-boundary + `search_aliases` enrichment.

Three failure buckets:

### Bucket A — Recall (4 themes, content exists)
| Theme | Query | What should match |
| --- | --- | --- |
| 5 | `word1=theory · word2` | advanced-synonym / one-word-many-meanings templates |
| 8 | `China expat lifestyle insights topics: english-chinese` | English-Chinese travel / food / culture cards |
| 9 | `global influence topics` | per-country culture cards, MBTI series, animal personality cards |
| 10 | `remote destination highlights topics` | travel destination / map templates |

**Status (after P0 fix #1):** themes 4, 8, 10 should resolve based on token-strip simulation; **needs production verification**. Themes 9 and 5 likely still thin because the per-country MBTI and synonym templates don't yet carry the matching content nouns in their `search_aliases`.

### Bucket B — Intent mismatch (2 themes)
| Theme | Query | What Curify returned | What query meant |
| --- | --- | --- | --- |
| 1 | `historical · character_name` | character-themed infographics | name lists / naming references |
| 12 | `short city escapes topics` | 3D city-landmark decorative models | travel itineraries + planning |

### Bucket C — Single-result thinness (3 themes)
| Theme | Query | Curify result count |
| --- | --- | --- |
| 2 | `culture-inspired characters · art_style` | 1 (Harry Potter MBTI) |
| 7 | `language learning struggles topics: expressions` | 1 (basic expression card) |
| 10 | `remote destination highlights topics` | 1 (unrelated finance template) |

### Genuine content gap (1 theme)
Theme 4 (`homophones / homonyms`) is the only entry the analyst flagged with no _"we made this before"_ note. Real authoring gap, not a search bug.

### Ad-hoc user reports (2026-05-18)
Two CJK no-result queries surfaced via manual report:

| Query | Length | Bigrams the matcher tries | Likely cause | Bucket |
| --- | --- | --- | --- | --- |
| `唯美春天` (aesthetic spring) | 4 char | `唯美` / `美春` / `春天` | Spring / flower / seasonal templates exist but their EN-authored blobs don't carry these zh terms in `search_aliases`. | Recall (A) — fix via alias top-up |
| `证件照` (ID photo / passport photo) | 3 char | `证件` / `件照` | No ID-photo template in the catalog. Could partially fix by aliasing the photorealistic-portrait templates to `证件照` / `身份证` / `passport photo`, or treat as a real content gap. | Mixed — alias top-up first, content gap as fallback |

These are the kind of failure we shouldn't be discovering by user report — see the new low-result logging item in the shortlist.

---

## Baseline metrics (2026-05-15, 30-day window)

From the `/search` click-attribution analysis in `curify-studio/curify_background/app/crud/admin.py` (section "Search queries (last 14 days)"):

- **36 searches → 2 result-tile clicks**. Overall result CTR = **5.5%**.
- **Zero-CTR queries that the fixes should have addressed:** `广州`, `guangzhou`, `shanghai`, `met gala`, `festivals`, `dragon boat`, `mood board`, `vocabulary`, `woman`, `健身`, `减脂`, `反义词中英`, `the psychology of self discipline`.
- **Matched-templates rail got zero clicks** in 30 days.
- **10 of 17 clicks were header-escape** (`header_home`, `header_gallery`, `header_tools`) — users gave up.

Re-pull on/after 2026-05-22 (see `project_search_ctr_followup.md`).

---

## Next-up shortlist

### ~~1. P0 fix #2 — `search_aliases` top-up audit~~ ✓ shipped 2026-05-18
First pass complete via `scripts/topup_search_aliases.py`. Appended targeted aliases to **775 inspirations across 48 templates** in 6 families:

| Family | Templates | Aliases appended (en + zh) |
| --- | --- | --- |
| Per-country MBTI / culture | 23 | `global`, `world`, `international`, `cross-cultural`, `country`, `global influence` + zh equivalents |
| Synonym / advanced-expression | 3 | `theory`, `linguistics`, `synonym`, `antonym`, `advanced expressions`, `one-word-many-meanings`, `word theory`, `language theory` + zh |
| Travel / destination | 13 | `remote`, `destination`, `off-the-beaten-path`, `hidden gems`, `weekend getaway`, `city escape`, `itinerary`, `escapes` + zh (`远程目的地`, `隐藏景点`, `小众景点`) |
| Expat / lifestyle culture | 5 | `expat`, `expatriate`, `living abroad`, `cross-cultural living`, `china expat` + zh (`外籍`, `海外生活`, `在华外籍`) |
| Spring / aesthetic / watercolor | 11 | `spring`, `aesthetic`, `floral`, `flower`, `botanical`, `spring flowers`, `watercolor spring` + zh (`春天`, `唯美`, `唯美春天`, `美感`, `花卉`, `植物`) — covers the 2026-05-18 `唯美春天` user report |
| Photorealistic portrait / ID photo | 3 | `ID photo`, `passport photo`, `headshot`, `professional headshot`, `id photo style`, `retouched portrait` + zh (`证件照`, `身份证照`, `护照照`, `头像`, `证件 风格头像`) — covers the 2026-05-18 `证件照` user report |

11,841 alias entries added net of dedup. The family list + aliases are captured at the top of `scripts/topup_search_aliases.py`, so the next pass — once item 2's low-result logging accumulates a week of data — can rerun the script with refreshed family/alias tables.

Open follow-up: **727 templates aren't in any of the 6 families.** The next audit pass should rank failing queries from the new low-result logging and add new families as needed. Expect content gaps as well (e.g. `证件照` is a partial match — there's no dedicated ID-photo template in the catalog).

### ~~2. Low-result query logging~~ ✓ shipped 2026-05-18 (frontend side)
Frontend instrumentation landed. `SearchResultsClient` now fires:
- `search_noresult` when total results = 0 (existing event, backward compat).
- **NEW** `search_low_result` when total results is 1-2 (threshold = 3). `contentId` is `<query>|n=<count>` so admin can rank queries by how close they are to the threshold without joining against the results table.

Total result count = `gridItems.length + matchedTemplates.length + galleryPrompts.length` (covers all three result surfaces, not just inspirations).

**Backend follow-up (still open):** add a "Low-result queries (last 14 days)" panel to `curify-studio/curify_background/app/crud/admin.py` that surfaces both `search_noresult` and `search_low_result` events, grouped by query, sorted by frequency. Once that lands, the alias top-up audit (item 1) becomes data-driven rather than analyst-driven.

### 3. NEW — LLM query rewrite on no/low-result queries
**Owner / priority TBD — pending your call.** Recall floor: when a query returns 0 or thin results, call `gpt-4o-mini` server-side to rewrite the query into 1-3 alternate phrasings, then re-match against the catalog. Returns the union of original + best-scoring rewrite.

Constraints:
- **Server-side only.** Cannot expose `OPENAI_API_KEY` to the browser. Run inside the search server component (the file is already a server component, `nanoPromptsService` calls Redis from there). Add the OpenAI call in the same path.
- **Cache aggressively.** Same failed query shouldn't trigger an LLM call twice — cache results in Redis (or in a process-local LRU as a stop-gap) keyed by normalized query.
- **Latency / cost.** `gpt-4o-mini` returns rewrites in ~300-500 ms. Cost ≈ $0.0001 per query. At today's traffic (~1-2 thin queries / day per the GSC baseline) this is negligible; at scale we'd want to throttle.
- **Failure mode.** If the LLM call fails or returns no usable rewrite, fall back to current behavior (empty results page with "no matching topics — press Enter to search").

The two 2026-05-18 reports are good test cases:
- `唯美春天` → expected rewrites: "aesthetic spring", "春天插画", "spring flowers", "唯美 风景". The "春天" alias top-up (from item 1) gets us part of the way; LLM rewrite generalizes to queries we didn't pre-alias.
- `证件照` → expected rewrites: "ID photo style portrait", "passport photo", "professional headshot", "证件 风格头像". If we have photorealistic-portrait templates and we alias them well (item 1), the rewrite recovers; if we don't, the rewrite still won't help and the query is a content gap.

The script `scripts/enrich_search_aliases.cjs` already uses `gpt-4o-mini` for offline enrichment — the same prompt scaffolding can move into the request-time rewrite path.

### 4. P1 — Travel-intent ranker weighting (theme 12)
Queries containing `city escapes`, `escapes`, `destinations`, `itinerary`, `travel`, `trip`, `weekend getaway` should weight toward templates tagged `travel` / `city` / `itinerary` and away from `architecture` (where 3D decorative landmark models live). Ranker tweak in `search/page.tsx`, not a content change.

### 5. P1 — `character_name` query mode (theme 1)
The `_name` suffix is a structured signal. Two options:
- **Option A** (smaller): treat queries ending in `_name` or `name` as a routing hint — boost templates that have `name`, `naming`, `names` in title/aliases.
- **Option B** (larger): introduce a "name-list / naming-reference" content type. Likely a content authoring task if the catalog doesn't have these.

Verify Option A first; if the catalog has no name-list templates, escalate to Option B as a content drop.

### 6. P2 — Single-result thinness (themes 2, 7)
After P0 fix #2 (alias top-up) and re-running the eval, if 2 / 7 still return 1 result each:
- **Theme 2** (culture-inspired characters): check if there are multiple `art_style`-tagged character templates. If yes → relax ranker precision on this tag combination. If no → content debt.
- **Theme 7** (language-learning expressions): same triage.

### 7. P3 — Author homophones / homonyms templates
Real content gap. Add to the daily-content-drop backlog if homophones is a topic worth covering.

### 8. CTR follow-up (cron on/after 2026-05-22)
Re-run the click-attribution SQL. Compare result_ctr_pct against the 5.5% baseline. Call out:
- Queries that flipped from 0% to positive CTR (success).
- Queries still at 0% (escalate).
- Whether the matched-templates rail received any clicks (if still zero, drop it or reorder sections).

---

## Where things live

| Surface | Path |
| --- | --- |
| Search page (tokenizer, matcher, redirect rules) | `app/[locale]/(public)/search/page.tsx` |
| Search results client | `app/[locale]/(public)/search/SearchResultsClient.tsx` |
| Suggestion entries (tier-1/2/3, aliases) | `lib/searchIndex.ts` |
| `search_aliases` enrichment script | `scripts/enrich_search_aliases.cjs` |
| Auto-tag pipeline (shared enricher) | `scripts/lib/auto_tag.cjs` |
| Inspiration records (carry `search_aliases`) | `public/data/nano_inspiration.json` |
| Template records | `public/data/nano_templates.json` |
| Topic registry | `lib/topicRegistry.ts`, `lib/topic_tag_mappings.json` |
| Click-attribution SQL | `curify-studio/curify_background/app/crud/admin.py` ("Search queries" section) |
| CTR follow-up reminder | `project_search_ctr_followup.md` (memory) |
| Latest eval | `reddit搜索对比.docx` (repo root) |

---

_This doc is the source of truth for search quality work. Update after each push that touches the surfaces above._
