# Search Evaluation Query Set

_Auto-generated from `scripts/configs/search_eval_set.json` (2026-05-19, last recalibrated 2026-05-30 (weekly cycle 1: appended 3 user-weekly-2026-05-30 queries — chiikawa, samurai, genshin — surfaced as under-served fandoms by the 14d admin /interaction-analytics pull and shipped a content topup the same cycle. Net set: 57 queries — 54 prior + 3 weekly. Prior recalibration 2026-05-29 appended 8 Pinterest discovery keywords.)). Re-run `python3 scripts/render_eval_set_md.py` after editing the JSON._

54-query regression + coverage set for /search, now scoring TWO surfaces: (a) inspiration richness via the strict/relaxed matcher (existing `expected` field), and (b) template richness via the LLM matcher (`expected_templates` — # templates with matcher confidence >= 0.4, mirroring the production GenerableTemplatesSection threshold).

Mix: (a) real user queries, (b) Reddit-eval queries with structural-stopword noise stripped, (c) user-reported bad cases, (d) long-tail / popular / gsc-zero queries, (e) ProgSEO long-tail queries (added 2026-05-27) covering the empty-inspiration + rich-template case the Generation Bridge was built for, (f) Pinterest discovery keywords (added 2026-05-29) — real Pinterest search terms harvested while doing B2B lead discovery, that double as entity-shape queries Curify users would type.

Re-run `scripts/eval_search.cjs` (cheap) for inspiration drift; re-run `scripts/eval_search.cjs --matcher` (incurs LLM cost ~$0.09 across the full set) to also check template-richness drift after any change to lib/searchTemplateMatch.ts, the taxonomy, or the template catalog.

## Expected legend — inspiration richness (`expected`)

| Bucket | Means |
| --- | --- |
| `rich` | >= 10 effective inspirations (strict if any; else relaxed-OR fallback) |
| `moderate` | 3-9 effective inspirations |
| `thin` | 1-2 — should also fire search_lowresult event |
| `empty` | 0 — should fire search_noresult event (UNLESS rewriter recovers, in which case page renders rewrites and no event fires) |
| `rewrite_recovery` | original is thin/empty, LLM rewrite is expected to surface catalog hits via union |
| `rewrite_empty` | LLM rewrite should return [] (unmappable query — gibberish, proper noun, off-catalog) |

## Expected legend — template richness (`expected_templates`)

| Bucket | Means |
| --- | --- |
| `rich` | 3+ templates surfaced by matchTemplatesForQuery with confidence >= 0.4 — query has a clear generative answer + alternatives |
| `moderate` | 2 templates — one primary + one backup |
| `thin` | 1 template — single option, ok for narrow queries |
| `empty` | 0 templates — no generative answer (true concept gap) |

**Tolerance:** template-richness verdict accepts ±1 bucket drift as PASS (LLM matcher temperature 0.2 produces run-to-run noise at that level). 2-bucket drift → WARN, 3-bucket drift → FAIL.

**Redirect bypass note:** Some queries (tag slugs like `english-chinese`) trigger a redirect to /topics/<slug> on the live /search page. The eval intentionally bypasses that redirect and scores the query against the catalog directly — same scoring path /search would take if redirects were disabled. The point: even for queries that redirect today, we want to know that the search-results page itself stays healthy, since a regression in the redirect logic could land users on /search instead.

## user-2026-05-20 (16 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `单词` | `rich` | `moderate` | Real user query (zero CTR on prod). Means `word/vocabulary` — top templates: mbti-animal, word-scene, kids-vocabulary, species-science. 211 hits. |
| 2 | `卡通` | `rich` | `moderate` | Real user query (zero CTR). Means `cartoon`. Top: education-card, travel, mbti-contrast — cartoon-style templates dominate. 191 hits. |
| 3 | `吉伊卡哇` | `rich` | `thin` | Real user query (zero CTR — production users don't click these results, suggesting low precision). Chiikawa is a Japanese kawaii character franchise; no template covers it specifically. CJK bigram match on `卡哇` surfaces 11 kawaii-tagged inspirations from 2 templates — recall-positive but intent-mismatch. True content gap for the specific franchise; precision issue worth a future ranker fix. |
| 4 | `家居装饰` | `rich` | `moderate` | Real user query (zero CTR). Means `home decoration`. Top: interior-design-mood-board-generator, houseplant-care-guide, soft-decoration-design-guide. 17 hits. |
| 5 | `工程` | `rich` | `empty` | Real user query (zero CTR). Means `engineering`. Sits just above the rich threshold at 10 hits — architecture, industrial-design-concept-sketch, mbti-siliconvalley. Borderline; a content removal could flip to moderate. |
| 6 | `植物` | `rich` | `rich` | Real user query (zero CTR). Means `plants`. Top: herbal, species-science, country-souvenirs-watercolor, CVC-flower-card. 174 hits. |
| 7 | `水果中文` | `empty` | `moderate` | Real user query (zero CTR). Means `fruits Chinese` — concatenated form (no space). Bigrams `水果`/`果中`/`中文` should match en-zh fruit vocab BUT current matcher fails the multi-token strict path. Tokenization gap candidate — suggest user types `水果 中文` with space, or upgrade bigram-OR fallback. |
| 8 | `电商详情图` | `rich` | `moderate` | Real user query (zero CTR). Means `e-commerce detail image`. Top: fashion-ecommerce. 21 hits — narrow but rich. |
| 9 | `自行车` | `rich` | `moderate` | Real user query (100% CTR in source data). Means `bicycle`. Was thin (2 hits) until 2026-05-20 bike batch added 6 new examples (mountain-bike + road-bike object-labeling, en-zh cycling vocab, en-fr bike anatomy, cycling tour packing guide, cycling apparel guide). Base now 6. Adjacent queries also lifted: bike 3→6, cycling 0→4, 骑行 0→9. |
| 10 | `葡萄酒` | `rich` | `moderate` | Real user query (100% CTR). Means `wine`. Path: 2 (pre-batch) → 5 (2026-05-20 wine batch) → 10 (2026-05-21 patch-6 + wine-variety-intro batch + improved auto-tag bilingual coverage). Now rich at 10 hits across regional-alcoholic-drinks, vocabulary, food, lifestyle-info-card, wine-variety-intro. |
| 11 | `蔬菜` | `rich` | `moderate` | Real user query (zero CTR). Means `vegetables`. Top: vocabulary, word-scene, gardening-how-to-infographic. 23 hits. |
| 12 | `词汇` | `rich` | `moderate` | Real user query (zero CTR). Means `vocabulary`. Top: mbti-animal, vocabulary, kids-vocabulary-poster, language-word-comparison. 265 hits. |
| 13 | `趣味经济学知识科普` | `rich` | `rich` | Real user query (zero CTR). Means `interesting economics knowledge popularization`. Compound CJK query — bigrams (趣味/经济/学知/知识/科普) match broadly across science-popularization and trending-knowledge templates. 15 base hits via bigram-OR. Precision likely loose given the zero CTR — top templates may not be specifically economics-themed. Open content gap for economics-specific infographics. |
| 14 | `音乐` | `rich` | `thin` | Real user query (100% CTR). Means `music`. Top: music-style-visual-infographic, vocabulary, movie-poster. 29 hits — well-covered by the 2026-05-19 patch-5 drop. |
| 15 | `食物` | `rich` | `moderate` | Real user query (zero CTR). Means `food`. Top: cuisine-food-vocab-poster, vocabulary, food-photo-doodle-sticker-overlay, bilingual-object-structure-labeling. 69 hits. |
| 16 | `香薰` | `moderate` | `thin` | Real user query (zero CTR pre-2026-05-20). Means `aromatherapy / scented candle`. 2026-05-20 content-gap batch added 5 dedicated examples (product-poster aromatherapy diffuser, soft-decoration aromatherapy spa retreat bedroom, interior-design aromatherapy spa corner, herbal lavender, lifestyle-info aromatherapy essential oils) with `香薰` / `精油` / `aromatherapy` aliases. Was empty/gap; now moderate at 5 hits across 4 distinct templates. |

## user-report-2026-05-18 (3 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `唯美春天` | `rich` | `rich` | Was empty pre-alias-topup. Pruned 2026-05-20 to drop herbal template (off-intent medicinal botanical) — base from 133 to 58, top now country-souvenirs-watercolor + CVC-flower-card + gardening + country-top10-travel-destinations. |
| 2 | `证件照` | `rich` | `thin` | Was empty pre-alias-topup. Post-topup: 16 hits via CJK bigram on 证件 + 件照 against portrait-retouching aliases. Regression target. |
| 3 | `手作` | `rich` | `moderate` | Was rewrite_recovery (base=0) until 2026-05-19 alias top-up. Pruned 2026-05-20 to drop template-multilingual-vocabulary-poster-watercolor — base from 37 to 32, all hits now on actual handcraft/scrapbook templates. |

## reddit (10 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `historical character` | `rich` | `moderate` | Was reddit theme 1 `historical · character_name`. Post-tokenizer-fix + alias top-up surfaces ~80+ via character/history templates |
| 2 | `future characters` | `rich` | `moderate` | Was theme 3. Sci-fi/silicon-valley/AI templates |
| 3 | `homophones and homonyms` | `moderate` | `moderate` | Was theme 4. Real content gap — no homophone templates in catalog. Should fire search_noresult |
| 4 | `english-chinese` | `rich` | `moderate` | Tag slug. Live page redirects to /topics/english-chinese; the eval bypasses redirect and scores /search directly. Was rewrite_recovery until 2026-05-19 alias top-up; further tightened 2026-05-20 to use inspiration-level language_pair filter — base now ~251 |
| 5 | `language learning expressions` | `rich` | `moderate` | Was theme 7. Native-english-expressions + chinese-verb-opposite + kids-opposite-concept. 2026-05-19 top-up added explicit phrase / idiom / 表达 aliases — base ~65 |
| 6 | `global influence` | `rich` | `empty` | Was theme 9. Pruned 2026-05-20 to drop universe-specific MBTI templates (Marvel/Naruto/etc.) — base went from 479 (with false positives) to 38 (clean country-themed templates). Verify the 38 stays >= 10. |
| 7 | `remote destination` | `rich` | `empty` | Was theme 10. Travel destination / map templates aliased post-2026-05-18 |
| 8 | `unique cultural experiences` | `empty` | `moderate` | Was theme 11. Strict-AND on all 3 tokens too narrow; relaxed-OR also empty. Open content gap |
| 9 | `short city escapes` | `rich` | `thin` | Was theme 12. Relaxed-OR catches via `city` + `escapes`. Intent-mismatch flagged: architectural 3D models surface instead of itineraries — open P1 |
| 10 | `creative comfort food` | `rich` | `moderate` | Was theme 13. Was thin (2 hits) until 2026-05-19 alias top-up added world-cuisines / comfort-food / 家常菜 to recipe / food / cuisine-vocab — base ~107 |

## popular (4 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `mbti marvel` | `rich` | `thin` | Direct template match — template-mbti-marvel has 66+ examples |
| 2 | `spring flowers` | `rich` | `rich` | Watercolor + gardening templates. Pruned 2026-05-20 to drop herbal — base from 133 to 63. |
| 3 | `反义词` | `rich` | `thin` | Should hit chinese-verb-opposite + kids-opposite-concept via CJK bigram. Pruned 2026-05-20 to drop mbti-contrast (loose match on personality opposites != linguistic antonyms) — base from 83 to 56. |
| 4 | `paper cutting` | `rich` | `moderate` | Was thin (1 hit) until 2026-05-19 alias top-up. Pruned 2026-05-20 to drop clothing-evolution-poster — base from 66 to 49. |

## gsc-zero (1 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `met gala` | `rich` | `moderate` | From the 2026-05-15 0%-CTR list. Was thin (1 hit) until 2026-05-19 alias top-up added red-carpet / met-gala / couture / 红毯 to fashion family — base ~83. |

## synthetic (2 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `动物 词汇` | `rich` | `moderate` | Multi-token zh: animal + vocabulary. Was moderate until 2026-05-19 top-up; pruned 2026-05-20 to drop template-vocabulary parent (heterogeneous), re-added via inspiration-level filter on animal topic_names — base from 310 to 166. |
| 2 | `wedding planner` | `rich` | `empty` | Should hit weddings vocab + celebration posters. Pruned 2026-05-20 to drop template-vocabulary parent, re-added via inspiration-level filter on wedding topic_names — base from 252 to 88. |

## progseo-2026-05-26 (10 queries)

| # | Query | Expected (inspirations) | Expected (templates) | Notes |
| --- | --- | --- | --- | --- |
| 1 | `minimalist autumn outfit for japan travel` | `empty` | `moderate` | ProgSEO long-tail. Inspiration: no exact match in catalog. Template: fashion-ecommerce + fashion-inspired-gown-design-sheet + travel-packing-guide could each angle this. |
| 2 | `infj vs entp dating compatibility chart` | `empty` | `moderate` | ProgSEO long-tail. Inspiration: no INFJxENTP-specific example. Template: mbti-relationship-infographic + mbti-comparison-infographic + mbti-in-love all fit; matcher should return all 3. |
| 3 | `cuban sandwich recipe poster` | `rich` | `moderate` | ProgSEO long-tail. Inspiration: post 2026-05-25 batch-gen has 9 sandwich examples (cuban + philly + reuben + etc.) so rich. Template: template-recipe + template-food + template-varieties-food-poster all fit. |
| 4 | `bilingual flashcards for kids learning korean fruits` | `rich` | `moderate` | ProgSEO long-tail. Inspiration: template-vocabulary en-ko fruits example exists. Template: template-vocabulary (canonical) + kids-vocabulary-poster (watercolor variant) + cartoon-english-vocabulary-flashcards (cartoon variant). All 3 acceptable. |
| 5 | `watercolor map of europe travel destinations` | `moderate` | `moderate` | ProgSEO long-tail. Inspiration: watercolor-world-map for Europe not yet generated. Template: template-watercolor-world-map-illustration is canonical; watercolor-travel-journal-collage and whimsical-travel-map are adjacent. |
| 6 | `monstera plant care guide infographic` | `rich` | `moderate` | ProgSEO long-tail. Inspiration: houseplant-care-guide-infographic has a monstera example. Template: template-houseplant-care-guide-infographic is the canonical match. Adjacent gardening-how-to-infographic is a stretch. |
| 7 | `marvel mbti character chart 16 types` | `rich` | `moderate` | ProgSEO long-tail. Inspiration: mbti-marvel and mbti-generic both have Marvel examples. Template: mbti-generic (grid) + mbti-marvel (single-char) + fandom-character-grid-poster (multi-char grid). |
| 8 | `lunar new year red envelope graphic design` | `empty` | `moderate` | ProgSEO long-tail. Inspiration: no red-envelope-specific example yet. Template: product-theme-promotional-poster (graphic design) + cultural-festival-poster (festival angle). |
| 9 | `1950s vintage diner illustration retro poster` | `rich` | `moderate` | ProgSEO long-tail. Inspiration: no 1950s diner example yet. Template: watercolor-theme-collage-illustration + nostalgic-first-item-poster + vintage-travel-scrapbook-poster all fit the retro brief. |
| 10 | `before after kitchen organization makeover` | `moderate` | `thin` | ProgSEO long-tail. Inspiration: home-organization-before-after has kitchen examples. Template: template-home-organization-before-after is the canonical match — narrow but precise. |

## pinterest-discovery-2026-05-29 (8 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `phonics worksheets kindergarten` | `empty` | Pinterest edu-printable keyword. Inspiration: empty — no inspiration carries the exact 3-token combo even though 50 phonics templates exist (shipped 5/27). Template: phonics-consonant-blend canonical, plus english-grammar-wordlist + english-homograph-educational-poster + kids-vocabulary-poster all plausible. |
| 2 | `Spanish vocabulary printable` | `rich` | Pinterest edu-printable keyword. Inspiration: 15 hits — Spanish vocab examples + 'printable' alias from prior topup land enough to surface as rich. Template: template-vocabulary (en-es) + cartoon-english-vocabulary-flashcards + kids-vocabulary-poster all fit. |
| 3 | `ESL flashcards printable` | `empty` | Pinterest edu-printable keyword. Same shape as Spanish vocabulary — ESL templates exist but printable/flashcards aren't aliased on every record. Template: vocabulary + cartoon-english-vocabulary-flashcards + english-grammar-wordlist. |
| 4 | `easy weeknight dinners healthy` | `empty` | Pinterest recipe-creator keyword. Inspiration: empty — recipe examples are dish-named not adjective-named. Template: template-recipe + premium-recipe-card-infographic + food-recipe-tip-infographic all plausible. |
| 5 | `gluten free dinner ideas` | `empty` | Pinterest recipe-creator keyword. Inspiration: empty (no gluten-free-specific examples). Template: recipe + premium-recipe-card-infographic + dessert-color-lab-infographic adjacent. |
| 6 | `meal prep weekly recipes` | `empty` | Pinterest recipe-creator keyword. Same shape — template-recipe + premium-recipe-card-infographic + food-recipe-tip-infographic. |
| 7 | `cozy reading aesthetic` | `thin` | Pinterest book/literary keyword. Inspiration: 1 hit (incidental — alias overlap from 'aesthetic' family). Template: self-help-book-visual-summary + watercolor-theme-collage + lifestyle-watercolor-infographic — all serve the cozy-reading-aesthetic vibe. |
| 8 | `book lovers gift guide` | `thin` | Pinterest book/literary keyword. Inspiration: 1 hit (incidental — alias overlap from 'gift guide' family). Template: self-help-book-visual-summary + country-souvenirs-watercolor (gift-guide layout) + top10-visual-guide-infographic. |

## user-weekly-2026-05-30 (3 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `chiikawa` | `moderate` | Weekly cycle 1: 14d admin pull showed 3 NR / 3 escape-clicks (highest user-gave-up signal in the set). Pre-topup base was 5 hits (1 example each across fandom-grid + pop-culture-matching + celebrity-group + mbti-generic) — alias-driven, content-thin. After 2026-05-30 fandom topup (+3 net chiikawa examples; 1 dedup skip on pop-culture-matching), base = 8 hits across 4 templates (mbti×3 + fandom-grid×2 + pop-culture×1 + celebrity-group×1). Moderate is the honest bucket for a niche fandom. Companion: existing CJK form 吉伊卡哇 already in the set. |
| 2 | `samurai` | `moderate` | Weekly cycle 1: 14d admin pull showed 1 NR. Pre-topup base was 3 hits (1 each across fandom-grid + mbti-generic + historical-figure-profile from 2026-05-19 batch). After 2026-05-30 fandom topup (+4 samurai examples: female samurai grid, sengoku warlords grid, anime-samurai mbti, samurai-of-anime pop-culture), base = 7 hits across 4 templates. Adjacent 武士 also covered via CJK bigram. |
| 3 | `genshin` | `moderate` | Weekly cycle 1: 14d admin pull showed 1 NR. Pre-topup base was 3 hits (1 each across fandom-grid + mbti-generic + pop-culture-matching from 2026-05-19 batch). After 2026-05-30 fandom topup (+4 genshin examples: Liyue grid, Fontaine grid, by-element mbti, Archons pop-culture), base = 7 hits across 3 templates. Adjacent 原神 (Genshin CJK) = 4 hits. |

## user-report-2026-06-05 (1 query)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `maps` | `rich` | User-reported precision issue 2026-06-05: `/search?q=maps` surfaces irrelevant template examples. Intent is clearly map-themed templates (travel-map, region-landmark-map, world-travel-map-illustration, tourist-spot-watercolor-map-infographic, mole-varieties-map etc.) but the matcher pulls in adjacent off-intent examples. Recall is high (broad token), precision is weak — likely needs (a) map-specific alias gating in the matcher and (b) audit of which template_subjects contain `map` token to prune false positives. Open precision item alongside `吉伊卡哇` and `short city escapes`. |

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
