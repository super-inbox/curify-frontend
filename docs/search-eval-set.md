# Search Evaluation Query Set

_Auto-generated from `scripts/configs/search_eval_set.json` (2026-05-19, last recalibrated 2026-05-20 (dropped 8 tier-1 anchor queries; added 16 real production queries pulled from admin search-log + GSC zero-CTR list. Net set: 36 queries — broader coverage of true user intent vs sentinel checks)). Re-run `python3 scripts/render_eval_set_md.py` after editing the JSON._

36-query regression + coverage set for /search. Mix of (a) real user queries (post-tightening drop of tier-1 sentinels — those topics have abundant content via /topics/<slug> redirect and were not surfacing fresh signal), (b) Reddit-eval queries with structural-stopword noise stripped, (c) user-reported bad cases as a regression suite, (d) long-tail / popular / gsc-zero queries we have tested. `expected` is calibrated to the current catalog so the baseline run is mostly PASS; re-run scripts/eval_search.cjs after any change to search/page.tsx, lib/searchRewrite.ts, scripts/topup_search_aliases.py, scripts/prune_search_aliases.py, or the inspiration data and watch for verdicts shifting to WARN/FAIL.

## Expected legend

| Bucket | Means |
| --- | --- |
| `rich` | >= 10 effective inspirations (strict if any; else relaxed-OR fallback) |
| `moderate` | 3-9 effective inspirations |
| `thin` | 1-2 — should also fire search_lowresult event |
| `empty` | 0 — should fire search_noresult event (UNLESS rewriter recovers, in which case page renders rewrites and no event fires) |
| `rewrite_recovery` | original is thin/empty, LLM rewrite is expected to surface catalog hits via union |
| `rewrite_empty` | LLM rewrite should return [] (unmappable query — gibberish, proper noun, off-catalog) |

**Redirect bypass note:** Some queries (tag slugs like `english-chinese`) trigger a redirect to /topics/<slug> on the live /search page. The eval intentionally bypasses that redirect and scores the query against the catalog directly — same scoring path /search would take if redirects were disabled. The point: even for queries that redirect today, we want to know that the search-results page itself stays healthy, since a regression in the redirect logic could land users on /search instead.

## user-2026-05-20 (16 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `单词` | `rich` | Real user query (zero CTR on prod). Means `word/vocabulary` — top templates: mbti-animal, word-scene, kids-vocabulary, species-science. 211 hits. |
| 2 | `卡通` | `rich` | Real user query (zero CTR). Means `cartoon`. Top: education-card, travel, mbti-contrast — cartoon-style templates dominate. 191 hits. |
| 3 | `吉伊卡哇` | `rich` | Real user query (zero CTR — production users don't click these results, suggesting low precision). Chiikawa is a Japanese kawaii character franchise; no template covers it specifically. CJK bigram match on `卡哇` surfaces 11 kawaii-tagged inspirations from 2 templates — recall-positive but intent-mismatch. True content gap for the specific franchise; precision issue worth a future ranker fix. |
| 4 | `家居装饰` | `rich` | Real user query (zero CTR). Means `home decoration`. Top: interior-design-mood-board-generator, houseplant-care-guide, soft-decoration-design-guide. 17 hits. |
| 5 | `工程` | `rich` | Real user query (zero CTR). Means `engineering`. Sits just above the rich threshold at 10 hits — architecture, industrial-design-concept-sketch, mbti-siliconvalley. Borderline; a content removal could flip to moderate. |
| 6 | `植物` | `rich` | Real user query (zero CTR). Means `plants`. Top: herbal, species-science, country-souvenirs-watercolor, CVC-flower-card. 174 hits. |
| 7 | `水果中文` | `empty` | Real user query (zero CTR). Means `fruits Chinese` — concatenated form (no space). Bigrams `水果`/`果中`/`中文` should match en-zh fruit vocab BUT current matcher fails the multi-token strict path. Tokenization gap candidate — suggest user types `水果 中文` with space, or upgrade bigram-OR fallback. |
| 8 | `电商详情图` | `rich` | Real user query (zero CTR). Means `e-commerce detail image`. Top: fashion-ecommerce. 21 hits — narrow but rich. |
| 9 | `自行车` | `moderate` | Real user query (100% CTR in source data). Means `bicycle`. Was thin (2 hits) until 2026-05-20 bike batch added 6 new examples (mountain-bike + road-bike object-labeling, en-zh cycling vocab, en-fr bike anatomy, cycling tour packing guide, cycling apparel guide). Base now 6. Adjacent queries also lifted: bike 3→6, cycling 0→4, 骑行 0→9. |
| 10 | `葡萄酒` | `rich` | Real user query (100% CTR). Means `wine`. Path: 2 (pre-batch) → 5 (2026-05-20 wine batch) → 10 (2026-05-21 patch-6 + wine-variety-intro batch + improved auto-tag bilingual coverage). Now rich at 10 hits across regional-alcoholic-drinks, vocabulary, food, lifestyle-info-card, wine-variety-intro. |
| 11 | `蔬菜` | `rich` | Real user query (zero CTR). Means `vegetables`. Top: vocabulary, word-scene, gardening-how-to-infographic. 23 hits. |
| 12 | `词汇` | `rich` | Real user query (zero CTR). Means `vocabulary`. Top: mbti-animal, vocabulary, kids-vocabulary-poster, language-word-comparison. 265 hits. |
| 13 | `趣味经济学知识科普` | `rich` | Real user query (zero CTR). Means `interesting economics knowledge popularization`. Compound CJK query — bigrams (趣味/经济/学知/知识/科普) match broadly across science-popularization and trending-knowledge templates. 15 base hits via bigram-OR. Precision likely loose given the zero CTR — top templates may not be specifically economics-themed. Open content gap for economics-specific infographics. |
| 14 | `音乐` | `rich` | Real user query (100% CTR). Means `music`. Top: music-style-visual-infographic, vocabulary, movie-poster. 29 hits — well-covered by the 2026-05-19 patch-5 drop. |
| 15 | `食物` | `rich` | Real user query (zero CTR). Means `food`. Top: cuisine-food-vocab-poster, vocabulary, food-photo-doodle-sticker-overlay, bilingual-object-structure-labeling. 69 hits. |
| 16 | `香薰` | `moderate` | Real user query (zero CTR pre-2026-05-20). Means `aromatherapy / scented candle`. 2026-05-20 content-gap batch added 5 dedicated examples (product-poster aromatherapy diffuser, soft-decoration aromatherapy spa retreat bedroom, interior-design aromatherapy spa corner, herbal lavender, lifestyle-info aromatherapy essential oils) with `香薰` / `精油` / `aromatherapy` aliases. Was empty/gap; now moderate at 5 hits across 4 distinct templates. |

## user-report-2026-05-18 (3 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `唯美春天` | `rich` | Was empty pre-alias-topup. Pruned 2026-05-20 to drop herbal template (off-intent medicinal botanical) — base from 133 to 58, top now country-souvenirs-watercolor + CVC-flower-card + gardening + country-top10-travel-destinations. |
| 2 | `证件照` | `rich` | Was empty pre-alias-topup. Post-topup: 16 hits via CJK bigram on 证件 + 件照 against portrait-retouching aliases. Regression target. |
| 3 | `手作` | `rich` | Was rewrite_recovery (base=0) until 2026-05-19 alias top-up. Pruned 2026-05-20 to drop template-multilingual-vocabulary-poster-watercolor — base from 37 to 32, all hits now on actual handcraft/scrapbook templates. |

## reddit (10 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `historical character` | `rich` | Was reddit theme 1 `historical · character_name`. Post-tokenizer-fix + alias top-up surfaces ~80+ via character/history templates |
| 2 | `future characters` | `rich` | Was theme 3. Sci-fi/silicon-valley/AI templates |
| 3 | `homophones and homonyms` | `empty` | Was theme 4. Real content gap — no homophone templates in catalog. Should fire search_noresult |
| 4 | `english-chinese` | `rich` | Tag slug. Live page redirects to /topics/english-chinese; the eval bypasses redirect and scores /search directly. Was rewrite_recovery until 2026-05-19 alias top-up; further tightened 2026-05-20 to use inspiration-level language_pair filter — base now ~251 |
| 5 | `language learning expressions` | `rich` | Was theme 7. Native-english-expressions + chinese-verb-opposite + kids-opposite-concept. 2026-05-19 top-up added explicit phrase / idiom / 表达 aliases — base ~65 |
| 6 | `global influence` | `rich` | Was theme 9. Pruned 2026-05-20 to drop universe-specific MBTI templates (Marvel/Naruto/etc.) — base went from 479 (with false positives) to 38 (clean country-themed templates). Verify the 38 stays >= 10. |
| 7 | `remote destination` | `rich` | Was theme 10. Travel destination / map templates aliased post-2026-05-18 |
| 8 | `unique cultural experiences` | `empty` | Was theme 11. Strict-AND on all 3 tokens too narrow; relaxed-OR also empty. Open content gap |
| 9 | `short city escapes` | `rich` | Was theme 12. Relaxed-OR catches via `city` + `escapes`. Intent-mismatch flagged: architectural 3D models surface instead of itineraries — open P1 |
| 10 | `creative comfort food` | `rich` | Was theme 13. Was thin (2 hits) until 2026-05-19 alias top-up added world-cuisines / comfort-food / 家常菜 to recipe / food / cuisine-vocab — base ~107 |

## popular (4 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `mbti marvel` | `rich` | Direct template match — template-mbti-marvel has 66+ examples |
| 2 | `spring flowers` | `rich` | Watercolor + gardening templates. Pruned 2026-05-20 to drop herbal — base from 133 to 63. |
| 3 | `反义词` | `rich` | Should hit chinese-verb-opposite + kids-opposite-concept via CJK bigram. Pruned 2026-05-20 to drop mbti-contrast (loose match on personality opposites != linguistic antonyms) — base from 83 to 56. |
| 4 | `paper cutting` | `rich` | Was thin (1 hit) until 2026-05-19 alias top-up. Pruned 2026-05-20 to drop clothing-evolution-poster — base from 66 to 49. |

## gsc-zero (1 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `met gala` | `rich` | From the 2026-05-15 0%-CTR list. Was thin (1 hit) until 2026-05-19 alias top-up added red-carpet / met-gala / couture / 红毯 to fashion family — base ~83. |

## synthetic (2 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `动物 词汇` | `rich` | Multi-token zh: animal + vocabulary. Was moderate until 2026-05-19 top-up; pruned 2026-05-20 to drop template-vocabulary parent (heterogeneous), re-added via inspiration-level filter on animal topic_names — base from 310 to 166. |
| 2 | `wedding planner` | `rich` | Should hit weddings vocab + celebration posters. Pruned 2026-05-20 to drop template-vocabulary parent, re-added via inspiration-level filter on wedding topic_names — base from 252 to 88. |

## How to use this set for side-by-side comparison

For each query in this table, type it verbatim into both
Curify (`/search?q=<query>`) and Pinterest, then compare:

- Does the platform return any results at all?
- How relevant are the top 4–6 results to the query intent?
- Are CJK queries handled (`葡萄酒`, `音乐`, `自行车`, `端午节`)?
- Are hyphenated / compound queries handled (`english-chinese`, `水果中文`)?
- Where the `expected` column says `empty`, do both platforms
  fail equally, or does one surface adjacent content the other
  misses?

Capture findings in a sibling table for each platform; any
query where Curify is materially worse than Pinterest becomes
a thread-a (recall) or thread-c (content) backlog item.
