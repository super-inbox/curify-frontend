# Search Evaluation Query Set

Tool navigation has a separate executable set: [`tool_search_eval_set.json`](../scripts/configs/tool_search_eval_set.json). Run `npm run eval:tools` for tool destinations, non-tool controls, locale fallbacks, dropdown discovery, and actual server redirects. The inspiration-richness set below does not evaluate tool routing.

_Auto-generated from `scripts/configs/search_eval_set.json` (2026-05-19, last recalibrated 2026-05-30 (weekly cycle 1: appended 3 user-weekly-2026-05-30 queries — chiikawa, samurai, genshin — surfaced as under-served fandoms by the 14d admin /interaction-analytics pull and shipped a content topup the same cycle. Net set: 57 queries — 54 prior + 3 weekly. Prior recalibration 2026-05-29 appended 8 Pinterest discovery keywords.) | 2026-06-14 (added 57 prefill pool + popular WC queries — calibration pending eval_search run)). Re-run `python3 scripts/render_eval_set_md.py` after editing the JSON._

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

## user-report-2026-06-05 (1 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `maps` | `rich` | User-reported precision issue 2026-06-05: /search?q=maps surfaced off-intent template examples (recall-high, precision-weak). Fix shipped same day: added `map` slot to TIER2_SUGGESTIONS in searchIndex.ts with multi-language aliases (地图/地圖/地図/マップ/mapa/carte/landkarte/지도/नक्शा/карта/harita/...), so `maps` + `map` + foreign-language equivalents now REDIRECT to /topics/map (8 templates, 75 inspirations). This eval entry intentionally still scores the underlying /search matcher per redirect_bypass_note — when the matcher precision gets a separate fix, recall/precision should improve here too. Open: investigate alongside `吉伊卡哇` and `short city escapes` (other intent-mismatch cases). |

## wc-top-query-2026-06-07 (5 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `Argentina vs Brazil all time` | `moderate` | WC top-query content fidelity batch (Task #66). Pre-topup: 2 hits thin. After 2026-06-07 alias top-up at template level: inflated to 34 (false-positive timelines like apple inc / coffee history matched). Precision pass same day re-scoped via inspiration_filter — argentina_brazil_rivalry family now matches only inspirations whose title or params contain argentina/brazil/messi/maradona. Honest count: 6 hits (4 sports-battle + 2 WC timelines). All on-intent. |
| 2 | `England 1966 World Cup` | `thin` | WC top-query content fidelity batch (Task #66). Pre-topup: 1 hit thin (group-team-vertical-banner). Alias top-up inflated to 17 (all 16 timelines incl. non-WC ones). Precision pass same day re-scoped via inspiration_filter `title contains 1966`: 2 hits — WC Host Nations timeline (mentions 1966 host-winning year) + group-team-vertical-banner. Honest thin count, on-intent. Lift requires actual 1966-England-squad content gen. |
| 3 | `Brazil 2002 squad` | `thin` | WC top-query content fidelity batch (Task #66). Pre-topup: 3 hits scattered. Alias top-up inflated to 16 (all 16 timelines). Precision pass same day re-scoped via inspiration_filter `title contains 2002`: 1 hit — Brazil WC history timeline (1958-2022 incl. 2002 championship). Honest count, single perfect match. Lift requires actual 2002-Brazil-squad-roster content gen. |
| 4 | `Maradona Hand of God` | `moderate` | WC top-query content fidelity batch (Task #66). Pre-topup: 0 hits empty. Alias top-up inflated to 16. Precision pass same day re-scoped via inspiration_filter `title contains world cup / fifa`: 7 hits — only the 7 WC-themed timelines (Brazil/Germany/Italy/Argentina/France/Pelé/Hosts). Argentina WC history is the most on-intent (mentions Maradona 1986) but the other WC timelines are reasonable adjacent context. Story-shape content gen filed as follow-up. |
| 5 | `most memorable World Cup moments` | `moderate` | WC top-query content fidelity batch (Task #66). Pre-topup: 0 hits empty. Alias top-up inflated to 16. Precision pass same day same `wc_history_general` family: 7 hits — only WC-themed timelines. Each timeline is a moments-collection per country, so the match is on-shape. Sourced from the WC card slot rotating-query surface (commit 0fe3da09). |

## prefill-pool-2026-06-14 (42 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `england 1966 world cup squad` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (5 hits). |
| 2 | `world cup 2026 schedule` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (7 hits). |
| 3 | `anime character group poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (4 hits). |
| 4 | `celebrity movie group poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 5 | `mbti relationship compatibility chart` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 6 | `dual character comparison infographic` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (4 hits). |
| 7 | `kids english animals vocabulary cards` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 8 | `kids english food vocabulary poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (3 hits). |
| 9 | `english spanish word comparison` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 10 | `asl sign language tutorial` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (4 hits). |
| 11 | `ielts vocabulary upgrade poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (8 hits). |
| 12 | `watercolor travel journal collage` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (9 hits). |
| 13 | `vintage travel scrapbook poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (5 hits). |
| 14 | `ethnic costume deconstruction board` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (6 hits). |
| 15 | `east asian culture comparison` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 16 | `world cuisine food poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 17 | `cultural festival illustration poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 18 | `generation comparison nostalgia infographic` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 19 | `vintage stamp collection illustration` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (5 hits). |
| 20 | `diy home decor ideas` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (3 hits). |
| 21 | `home organization tips guide` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (5 hits). |
| 22 | `quick recipe meal prep guide` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (4 hits). |
| 23 | `vintage fashion lookbook` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (6 hits). |
| 24 | `fitness anatomy guide infographic` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 25 | `pet care guide infographic` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 26 | `weird science facts infographic` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (8 hits). |
| 27 | `world history timeline poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 28 | `ai workflow infographic guide` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (9 hits). |
| 29 | `ai outfit try-on poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (5 hits). |
| 30 | `product packaging mockup display` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. |
| 31 | `evolution snacks infographic` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (8 hits). |
| 32 | `brazil world cup squad poster` | `moderate` | Adopted (was) 'brazil 2026 world cup squad' |
| 33 | `kids english colors vocabulary cards` | `rich` | Adopted (was) 'kids english body parts flashcards' |
| 34 | `vintage nostalgia infographic poster` | `rich` | Adopted (was) 'old times nostalgia poster' |
| 35 | `lifestyle guide infographic poster` | `rich` | Adopted (was) 'life hack daily tips infographic' |
| 36 | `interior design home guide` | `rich` | Adopted (was) 'interior design bedroom guide' |
| 37 | `beauty step by step guide` | `moderate` | Adopted (was) 'skincare routine step guide' |
| 38 | `paris travel itinerary` | `rich` | Adopted to pool (path A from inspect_prefill_pool_quality findings) |
| 39 | `architecture empire state building` | `rich` | Adopted to pool (path A from inspect_prefill_pool_quality findings) |
| 40 | `childhood snacks then vs now` | `rich` | Adopted to pool (path A from inspect_prefill_pool_quality findings) |
| 41 | `warmup routine running checklist` | `rich` | Adopted to pool (path A from inspect_prefill_pool_quality findings) |
| 42 | `vintage stamp collection garden birds` | `rich` | Adopted to pool (path A from inspect_prefill_pool_quality findings) |

## prefill-pool-2026-06-14-dropped-quality (13 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `mbti enfp career poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 2 | `mbti infj workplace traits` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 3 | `italy city map poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 4 | `3d landmark map illustration` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 5 | `vintage childhood memories illustration` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 6 | `retro 90s aesthetic poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 7 | `diy craft tutorial poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (6 hits). \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 8 | `morning routine checklist poster` | `moderate` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. Calibrated 2026-06-14: actual=moderate (6 hits). \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 9 | `architecture style guide poster` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 10 | `brand logo design board` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 11 | `amusement park map infographic` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 12 | `dubai map travel guide` | `rich` | Prefill pool entry (taxonomy-driven). Expected to surface ≥10 inspirations across 2+ templates for a good first-impression landing. \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |
| 13 | `japan culture travel poster` | `rich` | Adopted (was) 'japan travel itinerary infographic' \| 2026-06-14: dropped from rotating pool (off-topic top hits via matcher's relaxed-fallback or template-blob overlap). Kept here as known content/matcher gap. See task #86 for matcher fix path. |

## wc-data-2026-06-14 (7 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `france 2026 world cup` | `moderate` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. Calibrated 2026-06-14: actual=moderate (3 hits). |
| 2 | `france wins fifa 2026` | `rich` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. |
| 3 | `brazil 2026 national team` | `thin` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. Calibrated 2026-06-14: actual=thin (2 hits). |
| 4 | `brazil national team` | `moderate` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. Calibrated 2026-06-14: actual=moderate (9 hits). |
| 5 | `england football` | `moderate` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. Calibrated 2026-06-14: actual=moderate (5 hits). |
| 6 | `fifa 2026` | `moderate` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. Calibrated 2026-06-14: actual=moderate (6 hits). |
| 7 | `ai dub` | `rich` | Real user query from 30d admin pull (100% CTR in data). Validates long-form WC query intent. |

## search-relevance-phrase-alias-2026-07-09 (12 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `NCT Dream photocard template` | `empty` | Fix 1 (phrase protection + alias injection). BEFORE: bucket=moderate (4 relaxed hits) — all 4 were false positives, generic 'dream'+'template' token collisions against 'Dream of the Red Chamber' character-card inspirations and a 'dream career' kids worksheet, unrelated to K-pop/NCT/photocards. AFTER: bucket=empty (0) — the nct-dream phrase rule protects 'dream' and the false positives are gone. No genuine NCT-Dream/photocard catalog content exists (confirmed by direct grep), so empty is the honest floor; the kpop-idol-profile-vintage-passport-poster template now surfaces in the relaxed *template* rail (i18n-tpl=1) via the kpop/idol/card alias groups as the closest fallback. expected_templates left unset (not matcher-verified — skipped the LLM cost per Fix 1 scope). |
| 2 | `maker space label set printable` | `empty` | Fix 1 (phrase protection + alias injection). BEFORE and AFTER both bucket=empty (0) — no astronomy/space-topic false positive materialized with the current catalog+query combination even pre-fix (the compound-noun collision this rule guards against is a structural risk from lib/searchIndex.ts's `space` topic alias set, not one that happened to be triggered by this exact 5-token query). The maker-space phrase rule still protects 'space' defensively and adds workshop/label/diy alias vocabulary; a relaxed template hit (template-lifestyle-watercolor-infographic) surfaces via generic 'label'/'printable' token overlap — pre-existing generic-word noise, not introduced by this fix. No maker-space-specific catalog content exists (confirmed by grep) — a genuine content gap, out of scope (no public/data changes). |
| 3 | `光与夜之恋 卡面设计参考图` | `empty` | Fix 1 (phrase protection). Spaced variant — tokenizes as 2 whitespace-split primary tokens, so the bigram-decomposition fallback never fires regardless (only triggers for a single whitespace-free CJK token). BEFORE and AFTER both bucket=empty (0); no regression. Companion case to the unspaced variant below, which DOES demonstrate the bug this rule fixes. No 光与夜之恋 catalog content exists (confirmed by grep) — genuine content gap, out of scope. |
| 4 | `光与夜之恋卡面设计参考图` | `empty` | Fix 1 (atomic-entity phrase protection). BEFORE: bucket=rich (13 strict hits!) — a pure false positive. Unspaced, this query collapses to ONE primary token and hits the bigram-decomposition fallback, producing bigrams 光与/与夜/夜之/之恋/恋卡/卡面/面设/设计/计参/参考/考图; 3 unrelated templates (template-mood-board-interior-designgenerator, template-educational-topic-cheat-sheet-poster, template-theme-color-palette-card) strict-matched purely via the generic bigrams 设计('design')/参考('reference')/考图/面设 — none related to the named IP. AFTER: the atomicEntity guard on '光与夜之恋' skips bigram decomposition entirely for this query, bucket=empty (0). This is the clearest evidence case for the phrase-protection fix. No genuine content exists for this entity (confirmed by grep), so empty is the correct, honest result post-fix. |
| 5 | `小红书香薰产品种草图` | `moderate` | UPDATED BY FIX 2 — this is a CORRECTION, not a regression. Fix 1 shipped this query as bucket=rich (23 strict hits) and its own regression test asserted 'stays rich' as a success. That was wrong: all 23 hits came from template-fashion-ecommerce's inspiration cascade (eyemask/pendant/ring/scarf/musical-instrument/...), triggered purely because that template's audience blurb contains the boilerplate phrase '小红书种草内容创作者' (Xiaohongshu content-marketing creators) — the bigrams 小红/红书/种草 coincidentally cleared the strict bigram threshold against ANY template mentioning that generic audience line, independent of the query's actual subject. NONE of the 23 were about aromatherapy. Fix 2 adds a '小红书' atomicEntity rule (lib/query_phrase_aliases.ts) that suppresses bigram decomposition for this and any other query embedding the Xiaohongshu platform name, while leaving the existing '香薰' alias group (aromatherapy/fragrance/scent/candle/diffuser, added in Fix 1) fully intact and independently functional. AFTER Fix 2: bucket=moderate (6 hits), and all 6 are genuinely aromatherapy-related — template-product-poster-aroma-diffuser, template-product-poster-aromatherapy-diffuser, template-soft-decoration-design-guide-aromatherapy-spa-retreat-bedroom, template-interior-design-mood-board-generator-aromatherapy-spa-corner, template-herbal-lavender-aromatherapy, template-lifestyle-info-card-aromatherapy-essential-oils. Lower count, correct content — the eval bucket alone cannot distinguish 'rich but wrong' from 'moderate but right', which is exactly why this note exists. |
| 6 | `Amazon EBC enhanced brand content layout` | `empty` | Fix 1 (acronym alias injection). BEFORE: strict=0, i18n-tpl=11 (relaxed template pool) — 11 templates incidentally cleared the old relaxedThr=3 via scattered generic word overlap ('brand'/'content'/'layout' individually), a noisy/imprecise signal. AFTER: strict=0, i18n-tpl=1 — the ebc alias group ('enhanced brand content'/'amazon') raises the required-slot denominator, which filters out the 11 incidental relaxed hits and leaves exactly template-amazon-long-scroll-product-infographic-template (the one genuinely relevant catalog template, verified: it strict-matches at 4/4 required slots with the alias group satisfied by 'amazon'). Inspirations grid stays empty (0) — no inspiration for that template carries EBC-specific vocabulary in its own tags/aliases, a data-level gap (out of scope, no public/data changes). |
| 7 | `Amazon brand story module design` | `thin` | Fix 1 (phrase alias injection). BEFORE and AFTER both bucket=thin (1 relaxed hit, same template-amazon-long-scroll-product-infographic-template both times) — no regression, no change. The brand-story phrase rule matches ('brand' immediately followed by 'story') and adds an alias group, but the Amazon template was already reachable via plain generic-word overlap ('amazon'+'brand'+'design') at the old threshold too, so this query didn't demonstrate a failure the rule needed to fix — kept as a coverage/regression case. |
| 8 | `Y2K chrome skincare launch poster` | `empty` | Fix 1 (phrase alias injection) — coverage case, genuine content gap. Both chrome-skincare and launch-poster phrase rules fire (adding y2k/skincare and product-launch-poster/campaign-poster/brand-launch-visual alias groups respectively), but no catalog template combines the Y2K aesthetic with skincare/beauty product-launch content (confirmed by grep — only generic Y2K fashion-outfit templates and a generic skincare-tutorial template exist, no overlap). BEFORE and AFTER both bucket=empty (0) — no regression; closing this gap would require public/data content additions, explicitly out of scope for Fix 1. |
| 9 | `K-beauty glass skin brand launch visual` | `empty` | Fix 1 (phrase alias injection). BEFORE: bucket=moderate (4 relaxed hits, all 4 from template-product-theme-promotional-poster variants — baby-care-brand/spring-beauty-festival/summer-beach-sale/summer-snack-festival) matched purely via 3 generic marketing words ('brand'+'launch'+'visual'), none specifically about K-beauty or glass skin. AFTER: bucket=empty (0) — the glass-skin alias group raises the required-slot denominator past what those 4 generic-overlap inspirations clear. This is the same class of generic-word coincidental match the rest of Fix 1 targets (comparable to the NCT-Dream and 光与夜之恋 cases), not a loss of genuine relevant content — no K-beauty/glass-skin-specific catalog content exists (confirmed by grep). |
| 10 | `手冲咖啡工作室视觉手册` | `rich` | Fix 2 (atomicEntity + alias group). BEFORE Fix 2: bucket=rich (11 strict hits, ALL WRONG) — unspaced query collapsed to one primary token, bigram-decomposed, and 工作/作室/视觉 coincidentally strict-matched template-ethnic-costume-deconstruction-board ('时尚工作室摄影' fashion-studio-photography style copy) and template-animation-studio-comparison-infographic ('动画工作室对比' anime studio comparison) — neither related to coffee or brand visual manuals. AFTER Fix 2: the '手冲咖啡' atomicEntity rule suppresses bigram decomposition (the 2 wrong templates no longer match), and its 'brand identity'/'visual identity' alias group (verified narrow — only 2 templates catalog-wide contain that literal English phrase) surfaces bucket=rich (16 relaxed hits) from the CORRECT family: template-brand-identity-moodboard-visual-system-poster and template-brand-vi-full-visual-pack-mockup, including genuine coffee-brand instances (...brew-and-co-coffee-shop, ...riseup-coffee). Same bucket label as before (rich), but the underlying content flipped from 100% wrong to genuinely on-topic — verify by inspection, not just the bucket count. |
| 11 | `二手奢侈品鉴定品牌视觉` | `empty` | Fix 2 (atomicEntity, purely defensive). BEFORE Fix 2: bucket=moderate (31 strict hits, ALL WRONG) — 品牌/牌视/视觉 bigrams coincidentally strict-matched template-fashion-ecommerce via its boilerplate '品牌视觉团队' (brand visual team) audience blurb, completely ignoring the query's actual distinguishing subject (二手奢侈品鉴定 = secondhand luxury goods AUTHENTICATION). AFTER Fix 2: the '二手奢侈品' atomicEntity rule suppresses bigram decomposition, bucket=empty (0). No alias tokens added — no secondhand-luxury-authentication content exists anywhere in the catalog (confirmed by grep for 二手/奢侈品/鉴定, all zero hits), so empty is the honest, correct floor rather than inventing an unsupported fallback. Same class of fix as 光与夜之恋 above: eliminate the false positive, don't fabricate a match. |
| 12 | `低饱和国风茶包装设计` | `rich` | Fix 2 no-op guard — deliberately NOT given a phrase rule. BEFORE and AFTER both bucket=rich (84 strict hits), unchanged. Verified via direct inspection that the match is genuine: template-food-product-packaging-design and template-eco-farm-food-uniform-product-label both strict-match via 包装/装设/设计 bigrams against their own '食品包装设计' (food packaging design) text — a real, on-topic match, just broader than tea/guofeng-specific (no 国风-tea-packaging-specific content exists, confirmed by grep). Kept in the eval set as a regression guard proving Fix 2's new rules don't touch queries that were never broken — 低饱和/国风/茶 do not appear in any Fix 2 phrase rule. |

## weekly-search-2026-11-05 (4 queries)

| # | Query | Expected | Notes |
| --- | --- | --- | --- |
| 1 | `Salvador Dalí` | `thin` | Use the companion server-page regression to check subject relevance after rewrite. |
| 2 | `Salvador Dali` | `thin` | Use the companion server-page regression to check subject relevance after rewrite. |
| 3 | `Damien Hirst` | `empty` | Use the companion server-page regression to check subject relevance after rewrite. |
| 4 | `flanderization` | `empty` | Use the companion server-page regression to check subject relevance after rewrite. |

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
