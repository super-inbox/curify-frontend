# Search Quality Improvement — Status & Audit

_Last updated: 2026-05-28 (CTR re-pull: 17.1% vs 5.5% baseline, 3.1x lift; data-driven top-up shipped with 5 new families covering chiikawa / 下雨 / samurai / 歷史 / 路书 — all surfaced from the now-live admin panel; `_inspiration_matches_filter` extended to support `fields_any` for multi-field franchise aliasing). Owner: jay. Update after every push that touches `app/[locale]/(public)/search/page.tsx`, `lib/searchIndex.ts`, `lib/searchRewrite.ts`, `lib/searchTemplateMatch.ts`, `scripts/enrich_search_aliases.cjs`, `scripts/topup_search_aliases.py`, `scripts/eval_search.cjs`, `scripts/configs/search_eval_set.json`, or `scripts/lib/auto_tag.cjs`._

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
| 2026-05-18 | `fe3a4d7` | **Low-result query logging** (shortlist item 2) | New `search_lowresult` action type fires from `SearchResultsClient` when total results across grid + matched templates + gallery prompts is 1-2 (threshold = 3). `contentId` carries the query + result count so admin can rank queries by how close they are to the threshold. Existing `search_noresult` event continues to fire for zero-result queries unchanged. Backend SQL panel extension still needed (`curify-studio`) to surface "Low-result queries (last 14 days)" in admin. |
| 2026-05-18 | `4aa1dad` | **`search_aliases` top-up audit** (shortlist item 1) | Appended targeted aliases to 775 inspirations across 48 templates in 6 families — per-country MBTI / culture (23 templates → `global`, `world`, `international`, `cross-cultural`, `country`, plus zh equivalents), synonym / advanced-expression (3 → `theory`, `linguistics`, `synonym`, `antonym`, `advanced expressions`, etc.), travel / destination (13 → `remote`, `destination`, `hidden gems`, `city escape`, `weekend getaway`), expat / lifestyle culture (5 → `expat`, `living abroad`, `cross-cultural living`), spring / aesthetic / watercolor (11 → `spring`, `aesthetic`, `floral`, `botanical`, plus `唯美` / `春天` covering the 2026-05-18 `唯美春天` report), photorealistic portrait / ID photo (3 → `证件照`, `passport photo`, `headshot`, plus `身份证照`, `id photo style` covering the `证件照` report). ~11,841 alias entries added net of dedup. Reproducible via `scripts/topup_search_aliases.py`. |
| 2026-05-18 | _(pending push)_ | **LLM query rewrite** (shortlist item 3) | New module `lib/searchRewrite.ts` calls `gpt-4o-mini` server-side when the original query returns <3 strict-template hits. Up to 3 alternate phrasings per call, rescored against the catalog via a refactored `scoreQueryTokens` helper, results unioned with the original by inspiration id (max-score-wins). UI shows "Few results for X. Also showing results for: …" hint above the grid when the rewrite contributed. Tracking events (`search_noresult` / `search_lowresult`) now fire on the POST-rewrite count, so the admin failing-query backlog only surfaces queries the rewriter couldn't rescue. Process-local LRU cache (256 / 7-day) — Vercel KV upgrade deferred until traffic warrants. Requires `OPENAI_API_KEY` on Vercel — falls back to no-op when key is absent. |
| 2026-05-19 | `6ea0d36` | **Eval-driven alias top-up** | 9 new families in `scripts/topup_search_aliases.py` closing the rewriter-dependency gap surfaced by the 28-query eval (wedding/marriage, antonym 中英, animal-vocab crosslingual, expression/phrase, english-chinese hyphenated, handcraft/diy/scrapbook, world-cuisines comfort food, paper-cutting kirigami, fashion red-carpet). After this pass: `english-chinese` 0→301, `手作` 0→173, `met gala` 1→83, `wedding planner` 15→252, `paper cutting` 1→66. All 28 queries land in `rich` at base scoring without rewriter. |
| 2026-05-19 | `af42851` | **Gallery tag taxonomy** | 3 new tier-3 buckets (`mood`, `lighting`, `seasonal`), 45 `EXTRA_TAG_TO_TOPICS` entries. Coverage 58.9% → 96.9% of tag-occurrences mapped. Plus a `TAG_DENYLIST` in `scripts/regen_nanobanana_metadata.cjs` that filters ingestion noise (`none`, `subject`, `text`, `realistic`, `photograph`). Proposal + decision queue at `docs/gallery-tag-taxonomy.md`. |
| 2026-05-19 | `cca9eee` | **Content drops: hongjie28-patch-2/4/5** | 11 new templates wired with topics + rank_score + creation_date + i18n + auto-tagged inspirations. 58 new inspirations across the 11 templates with `search_aliases` LLM-enriched. |
| 2026-05-20 | `7727d3e` | **Wine batch** | `scripts/configs/wine_examples_2026-05-20.json` + run of `scripts/generate_template_examples.cjs`. 10 new wine-focused examples closing the `葡萄酒` gap (2 → 5 inspirations matching the literal CJK query, plus broader auto-tagged alias coverage). |
| 2026-05-20 | `33a625d` | **Precision tightening** | Relevance audit via `scripts/eval_relevance_audit.cjs` surfaced template-level alias overspread. New `scripts/prune_search_aliases.py` removes aliases from over-broad parents; `topup_search_aliases.py` gains `inspiration_filter` for re-attachment at inspiration granularity. Net: 16,936 alias entries pruned, 2,182 re-added at inspiration level. `global influence` 479→38, `wedding planner` 252→88, `动物 词汇` 310→166, `唯美春天` 133→58. Recall preserved — eval 28/28 PASS. |
| 2026-05-20 | _(this commit)_ | **Eval set refresh** | Dropped 8 tier-1 anchor queries (those redirect to /topics/<slug>, no fresh signal). Added 16 real production queries from admin search-log + GSC zero-CTR list. Net 36 queries, all PASS at base scoring. |
| 2026-05-26 | `7f980e6` | **Search → generation bridge Phase 1** | `lib/searchTemplateMatch.ts` calls gpt-4o-mini against the 200-template catalog blob (~11K tokens); `GenerableTemplatesSection` renders "Generate from a template" cards with prefilled params on `/search`. Top-3 100% / top-1 90% on the expanded baseline per `scripts/eval_template_matcher.cjs`. Click tracking via `search_generable_template:<template_id>`. Phase 2 measurement panel (per-query Generate-card → downstream-generate conversion) NOT yet built. Phase 3 taxonomy backfill gated on Phase 2 data. Spec: `docs/search-generation-bridge.md`. |
| 2026-05-27 | `9bcc991` | **Eval set: ProgSEO expansion + template-richness scoring** | Appended 10 ProgSEO long-tail queries to `search_eval_set.json` (cuban sandwich recipe poster, monstera plant care, marvel mbti chart 16 types, etc — the empty-inspiration-rich-template case the bridge was built for). Added `expected_templates` field to every query; `eval_search.cjs --matcher` now scores both inspiration richness AND LLM matcher template richness, ±1 bucket tolerance for matcher noise. 46 queries total. |
| 2026-05-28 | _(this commit)_ | **CTR re-pull + data-driven alias top-up** | First admin-panel-driven iteration of the recall feedback loop. Pulled 14-day search panel via the section-6 SQL: 111 searches across 91 unique queries, **17.1% result CTR vs 5.5% baseline (3.1x lift)**. Still 33% no/low-result rate; matched-templates rail still gets zero clicks. From the top failing queries identified 5 with existing template content but missing alias coverage: `chiikawa` (3 searches, content match 5 records via params.theme/character_set), `下雨` (2, weather-template alias gap), `samurai` (1, 3 records via params.theme/character_set), `歷史` (1, 13 history templates lacked CJK aliases), `路书` (1, 4 itinerary templates lacked CJK aliases). Extended `_inspiration_matches_filter` to support `fields_any` (multi-field-OR) so franchise names spread across `params.theme` / `params.theme_name` / `params.character_set` / `params.mbti_topic` / etc. can be aliased in one family. Net: 5 new families in `scripts/topup_search_aliases.py`, ~169 inspirations aliased, ~3,950 alias entries added. Eval regression: 45 PASS / 1 WARN / 0 FAIL — sole WARN is `watercolor map of europe travel destinations` (over-shoot from itinerary_cjk family broadening, benign over-recall). |

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

## Regression eval set (added 2026-05-19)

`scripts/configs/search_eval_set.json` holds a curated 28-query suite that exercises:

- **8 tier-1 category anchors** (`character`, `language`, `learning`, `travel`, `lifestyle`, `design`, `product`, `personality`) — should always return rich results on `/search`. Sentinels for catalog-wide regressions.
- **10 reddit-eval queries** (with structural-stopword noise stripped — the tokenizer already drops `topics` / `theme` / etc., so the eval feeds the clean form a real user would type). Tracks all the recall buckets the Reddit comparison flagged.
- **3 user-reported regressions** — `唯美春天`, `证件照` (alias-top-up rescues), `手作` (LLM-rewrite rescue).
- **7 long-tail / popular queries** — `mbti marvel`, `spring flowers`, `反义词`, `paper cutting`, `met gala`, `动物 词汇`, `wedding planner`. Mix of working queries and known content gaps.

**The eval intentionally bypasses the topic-page redirect.** Tier-1 slugs and tag slugs like `english-chinese` would redirect to `/topics/<slug>` on the live page; the eval scores them against the catalog directly so we know the `/search` results page itself stays healthy. If the redirect ever broke and users landed on `/search?q=character`, the eval guarantees that page still renders a rich grid rather than an empty state.

The runner is `scripts/eval_search.cjs`:

```
node scripts/eval_search.cjs              # catalog scoring only (~1 s)
node scripts/eval_search.cjs --rewrite    # also calls gpt-4o-mini per query (~2 min, ~$0.003)
node scripts/eval_search.cjs --quiet      # summary table only
```

`expected` is calibrated to current catalog so the baseline run is **28 PASS / 0 WARN / 0 FAIL** on 2026-05-19. A regression that drops a `rich` query to `moderate` flips it to WARN; a `rewrite_recovery` query no longer rescued flips to FAIL. Re-run after any change to `search/page.tsx`, `lib/searchRewrite.ts`, the alias top-up data, or the nano_inspiration catalog.

The eval expected legend (in the JSON):

| Bucket | Means |
| --- | --- |
| `rich` | ≥ 10 effective inspirations (strict if any, else relaxed-OR fallback) |
| `moderate` | 3-9 effective inspirations |
| `thin` | 1-2 — should also fire `search_lowresult` event |
| `empty` | 0 — should fire `search_noresult` event (unless rewriter recovers) |
| `rewrite_recovery` | Base is thin/empty, LLM rewrite expected to surface catalog hits via union |
| `rewrite_empty` | LLM rewrite should return `[]` (unmappable query — gibberish, proper noun, off-catalog) |

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

### ~~2. Low-result query logging~~ ✓ shipped 2026-05-18 (frontend) + admin panel shipped (backend)
Frontend instrumentation landed 2026-05-18. `SearchResultsClient` fires:
- `search_noresult` when total results = 0 (existing event, backward compat).
- **NEW** `search_lowresult` when total results is 1-2 (threshold = 3). `contentId` is `<query>|n=<count>` so admin can rank queries by how close they are to the threshold without joining against the results table.

Total result count = `gridItems.length + matchedTemplates.length + galleryPrompts.length` (covers all three result surfaces, not just inspirations).

**Backend admin panel: SHIPPED** at `curify-studio/curify_background/app/crud/admin.py` section 6 ("Search queries (last 14 days)"). Surfaces per query: searches, no_results (NORESULT + LOWRESULT collapsed into one column), users, noresult_pct, result_clicks, chip_clicks, escape_clicks, result_ctr_pct. Test users 155 and 1117 excluded. The alias top-up audit (item 1) is now data-driven via this panel — see the 2026-05-28 entry in the shipped table for the first iteration.

### ~~3. LLM query rewrite on no/low-result queries~~ ✓ shipped 2026-05-18
**Recall floor.** When the original query returns fewer than `LOW_RESULT_THRESHOLD` (3) strict-template hits, the server calls `gpt-4o-mini` for 1-3 alternate phrasings, scores each rewrite against the catalog, and unions the results into the page.

Implementation:
- New module `lib/searchRewrite.ts` — server-only. Inlines a compact catalog-context system prompt (templates we have: vocabulary, MBTI, infographics, travel, watercolor, portrait, etc.) so the model proposes catalog-aligned terms instead of generic alternates. 5s timeout, fails safe to an empty rewrite list.
- `search/page.tsx` — refactored the strict/relaxed scoring loop into a `scoreQueryTokens` helper, called once for the original tokens and once per rewrite. Results merged by inspiration id (max score across passes), strict-template matches unioned, gallery prompts fetched for the first tag-matching rewrite when the original wasn't a tag.
- `SearchResultsClient.tsx` — accepts a new `usedRewrites?: string[]` prop. When non-empty AND results landed, an amber-tinted hint renders above the grid: "Few results for &ldquo;…&rdquo;. Also showing results for: …" so the reader knows we expanded the search.

**Tracking is the post-rewrite count.** The `search_noresult` / `search_lowresult` events fire from `useEffect` on the FINAL `totalResults` — when the rewrite recovers the query (total ≥ 3), no event fires. The admin's failing-query backlog stays focused on "tried everything and still empty." When the rewrite ran but didn't recover, contentId gains a `|rw=1` suffix so admin can split "thin after rescue attempt" from "thin without rescue attempt."

**Caching:** process-local LRU (256 entries, 7-day TTL) in `lib/searchRewrite.ts`. Vercel serverless invocations don't share memory so this saves nothing across requests in prod — it's mainly a dedupe inside a warm container and a free dev-mode win. Upgrade to Vercel KV or Upstash Redis once we have enough traffic to care.

**Production env requirement.** `OPENAI_API_KEY` needs to be set on Vercel — add it via the Vercel dashboard. Without the key, `getClient()` returns null and the rewriter falls through to an empty list (no-op). No deployment breakage if the key is missing; rewrite just stops working.

The two 2026-05-18 user reports are now the regression test:
- `唯美春天` → rewriter should propose `watercolor spring flowers`, `春天插画`, `aesthetic spring` (or similar). Combined with the alias top-up these now resolve to watercolor / gardening / herbal templates.
- `证件照` → rewriter should propose `passport photo portrait`, `professional headshot`, `证件 风格头像`. Hits the portrait-retouching templates.

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
| LLM query rewriter (server-only, gpt-4o-mini) | `lib/searchRewrite.ts` |
| Regression eval set (30 queries) | `scripts/configs/search_eval_set.json` |
| Eval runner (catalog scoring + optional rewriter) | `scripts/eval_search.cjs` |
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
