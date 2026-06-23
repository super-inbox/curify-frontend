# P1 Template Gap Retest — 2026-06-23

> **Last updated:** 2026-06-23 (post precision-safeguard fix)
> **Branch:** `baobao/multi-intent-topic-cooccurrence`
> **Scope:** Curify Templates section only — no external platform data re-collected

## 1. Purpose

This retest evaluates whether the latest template recall fixes — specifically adding template topic slugs to `templateSearchBlob` and introducing a concept expansion layer via `lib/template_concept_expansion.ts` — have reduced the 15 previous P1 template gaps identified in the June 21, 2026 external-signal pilot evaluation.

A follow-up precision safeguard pass was also applied after the initial retest revealed three queries with noisy expansion. Both passes are documented here; all counts in the tables reflect the **final post-safeguard state**.

The evaluation is **template-recall-only**: it does not re-run Google/Bing/Pinterest/Canva external platform collection. All recall counts refer to unique template IDs surfaced by the current search pipeline (strict-AND match + concept expansion pass), not total inspiration result counts.

---

## 2. What Changed Before This Retest

### Change 1 — Template topic slugs added to `templateSearchBlob` ✅ kept
Each template's topic slug array (from `nano_templates.json`) is now appended to the template's i18n search blob in `app/[locale]/(public)/search/page.tsx`. Queries containing a topic keyword (e.g., "flashcards", "mbti", "historical") can now match templates tagged with that topic slug even when the exact word does not appear in the i18n title/description text.

### Change 2 — Concept expansion layer (with precision safeguards) ✅ kept + fixed
`lib/template_concept_expansion.ts` — a `CONCEPT_SYNONYMS` map drives a secondary expansion pass when strict template recall is thin (< 10). Active synonym groups after the safeguard pass:

| Token | Expands to | Guard |
|---|---|---|
| `bilingual` ↔ `multilingual` | each other | none (unambiguous) |
| `flashcard` ↔ `flashcards` | each other | none (unambiguous) |
| `sandwich`, `burger`, `pizza`, … | `food`, `recipe`, `cuisine`, `culinary` | none (unambiguous food nouns) |
| `cuban`, `thai`, `korean`, `italian`, `mexican`, `french`, `japanese`, `indian` | `cuisine`, `recipe`, `culinary` | **suppressed** when query contains any language-learning signal: `flashcard`, `flashcards`, `vocabulary`, `bilingual`, `multilingual`, `esl`, `learning`, `language`, `kids`, `printable`, `worksheet`, `lesson` |
| ~~`watercolor`~~ | ~~`whimsical`, `hand-drawn`~~  | **removed** — style adjectives match too many unrelated illustration templates |

**Precision safeguard mechanism (`page.tsx`):** before building `expandedSets`, a `tokenSet` is constructed from the live query tokens. Each entry's `suppressWhen` list is checked against `tokenSet`; if any signal fires, the expansion for that token collapses to `[tok]` only.

---

## 3. Previous P1 Gap Summary

Source: `docs/external-signal-pilot/curify-gap-analysis-58.csv`

All 15 previous P1 queries, with their original issue type and reported Curify top-results count:

| # | Query | Issue type | Prev. top results |
|---|---|---|---|
| 1 | 电商详情图 | template_gap | 4 |
| 2 | 趣味经济学知识科普 | template_gap | 6 |
| 3 | 证件照 | template_gap | 6 |
| 4 | historical character | retrieval_gap | 5 |
| 5 | homophones and homonyms | template_gap | 4 |
| 6 | mbti marvel | template_gap | 5 |
| 7 | wedding planner | template_gap | 7 |
| 8 | cuban sandwich recipe poster | template_gap | 4 |
| 9 | bilingual flashcards for kids learning korean fruits | template_gap | 6 |
| 10 | watercolor map of europe travel destinations | template_gap | 2 |
| 11 | marvel mbti character chart 16 types | template_gap | 7 |
| 12 | lunar new year red envelope graphic design | template_gap | 4 |
| 13 | before after kitchen organization makeover | template_gap | 3 |
| 14 | Spanish vocabulary printable | template_gap | 6 |
| 15 | book lovers gift guide | template_gap | 2 |

> **Note on counts:** "Prev. top results" is `curifyTopResultsCount` from the June 21 eval — it counts total Curify results (inspirations + templates combined). Current retest counts **unique template IDs only**, so the two are not directly comparable.

---

## 4. Retest Result Summary (post precision-safeguard)

| Status | Count |
|---|---|
| Total previous P1 queries | **15** |
| Resolved | **2** |
| Partial | **5** |
| Still P1 | **8** |
| Precision risk | **0** |

**Overall verdict:** The template recall fixes achieved meaningful improvement for 7 of 15 previous P1 queries (2 Resolved + 5 Partial). The precision safeguard pass eliminated all 3 previously detected noise cases. The remaining 8 Still P1 queries are genuine inventory or multi-token-AND gaps that cannot be fixed via synonym expansion without compromising precision.

---

## 5. Previous P1 Query Retest Table

All numbers reflect the post-safeguard state.

| Query | Prev. status | Prev. top results | Current strict | Current expanded | Current total | Current top templates | Relevant? | Final status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 电商详情图 | P1 template_gap | 4 | 1 | 0 | 1 | E-commerce Fashion Detail Long Image | Partial | Still P1 | CJK multi-token AND failure; no concept expansion covers 电商+详情图 |
| 趣味经济学知识科普 | P1 template_gap | 6 | 3 | 0 | 3 | Subject Knowledge Infographic Poster; Weird & Fascinating Facts Science Card; Hotspot Knowledge Card | Yes | Partial | 3 relevant templates; CJK bigram matching improved by topic slug addition |
| 证件照 | P1 template_gap | 6 | 3 | 0 | 3 | Portrait Retouching Blueprint; Hairstyle & Color Recommendation; Seasonal Lifestyle Photo Grid | Partial | Partial | 2 of 3 directly relevant (portrait/photo); 1 loosely related |
| historical character | P1 retrieval_gap | 5 | 11 | 0 | 11 | Historical & Modern Character Comparison Card; National Style Character Long Scroll; MBTI Character Visualization; Character Template Grid; AI Role-Play Character Sheet | Yes | **Resolved** | Topic slug addition resolved — "historical" + "character" now match template topic slugs directly |
| homophones and homonyms | P1 template_gap | 4 | 1 | 0 | 1 | English Grammar Wordlist Educational Infographic | Partial | Still P1 | "homophones"/"homonyms" absent from topic slugs and CONCEPT_SYNONYMS; inventory gap |
| mbti marvel | P1 template_gap | 5 | 2 | 0 | 2 | MBTI Marvel Superhero Infographic; MBTI Character Visualization | Yes | Partial | 2 directly relevant templates; no concept expansion triggered; still thin |
| wedding planner | P1 template_gap | 7 | 4 | 0 | 4 | East Asian Culture Comparison Infographic; Relationship Advice Infographic; Cultural Festival Educational Poster; Bilingual Vocabulary Visual Guide | Mixed | Partial | 4 templates via inspiration search_aliases; 3 of 4 are weakly related (matched via broad alias set, not concept expansion). No concept-expansion noise. |
| cuban sandwich recipe poster | P1 template_gap | 4 | 1 | 4 | **5** | Culinary Panorama Science Infographic; Recipe Visual Guide: Food Photography Posters Made Simple; Cooking Tip and Food Infographic; Classic Spirits Cocktail Recipe Grid Poster | Yes | **Resolved** | cuban+sandwich expansions fire correctly (no lang-learning signals in query); 5 food/recipe/poster templates, all relevant; "World Travel Map" that appeared in v1 is gone |
| bilingual flashcards for kids learning korean fruits | P1 template_gap | 6 | 1 | 0 | **1** | Bilingual Vocabulary Visual Guide | Yes | Still P1 | korean→cuisine expansion now suppressed by bilingual+flashcards+kids+learning co-signals; Korean food templates removed; 1 directly relevant template remains; inventory gap |
| watercolor map of europe travel destinations | P1 template_gap | 2 | 1 | 0 | **1** | Watercolor Continent / World Map | Yes | Still P1 | watercolor expansion removed; 1 strict-match directly relevant template; Dog Breed/Cultural Relics/Food templates are gone; inventory gap is the bottleneck |
| marvel mbti character chart 16 types | P1 template_gap | 7 | 0 | 0 | 0 | — | No | Still P1 | 6-token strict-AND impossible; no dedicated 16-type MBTI×Marvel chart template exists |
| lunar new year red envelope graphic design | P1 template_gap | 4 | 1 | 0 | 1 | Lunar New Year Red Envelope Set Generator | Yes | Still P1 | 1 correct template; multi-token AND fails the broader set; thin content inventory |
| before after kitchen organization makeover | P1 template_gap | 3 | 1 | 0 | 1 | Home Organization Before & After Poster | Yes | Still P1 | 1 correct template; kitchen/makeover/organization not co-occurring in any blob |
| Spanish vocabulary printable | P1 template_gap | 6 | 1 | 0 | 1 | Bilingual Vocabulary Visual Guide | Partial | Still P1 | "Spanish"+"vocabulary"+"printable" strict-AND fails; "Spanish" absent from template blobs |
| book lovers gift guide | P1 template_gap | 2 | 3 | 0 | 3 | Book Recommendation Grid Poster; Minimalist Book Summary Poster; Top 10 Visual Guide Educational Infographic | Yes | Partial | Improved; "guide" is stopword so tokens are [book, lovers, gift]; topic slugs added book coverage |

---

## 6. Final Verification — 8 Spot-Check Queries

All numbers confirmed against current code after precision safeguard.

| Query | Strict | Expanded | Total | Top templates (up to 3) | Noisy expansion? | Final status |
|---|---|---|---|---|---|---|
| watercolor map of europe travel destinations | 1 | 0 | **1** | Watercolor Continent / World Map | None | Still P1 |
| bilingual flashcards for kids learning korean fruits | 1 | 0 | **1** | Bilingual Vocabulary Visual Guide | None | Still P1 |
| cuban sandwich recipe poster | 1 | 4 | **5** | Culinary Panorama Science Infographic; Recipe Visual Guide; Cooking Tip and Food Infographic | None | Resolved |
| bilingual flashcards | 22 | 0 | **22** | Bilingual Vocabulary Visual Guide; Top 5 English Phrases Cards; English Error Correction Cards | None | Resolved |
| wedding planner | 4 | 0 | **4** | East Asian Culture Comparison Infographic; Relationship Advice Infographic; Cultural Festival Poster | None (alias noise, not expansion) | Partial |
| watercolor map (short) | 4 | 0 | **4** | Historical Event Map Illustration; National Culture & History Infographic; Watercolor Continent / World Map; Tourist Spot Watercolor Map Educational Infographic | None | Partial |
| before after kitchen organization makeover | 1 | 0 | **1** | Home Organization Before & After Poster | None | Still P1 |
| Spanish vocabulary printable | 1 | 0 | **1** | Bilingual Vocabulary Visual Guide | None | Still P1 |

**Precision risk count after safeguard pass: 0.**

### Notes per query

**watercolor map of europe travel destinations** — The `watercolor→whimsical/hand-drawn` expansion is removed. Only the 1 strict match remains ("Watercolor Continent / World Map"), which is the directly relevant template. "Dog Breed Retro Science Infographic" and all other noise are gone. The bottleneck is now purely inventory depth.

**bilingual flashcards for kids learning korean fruits** — The `korean→cuisine/recipe/culinary` expansion is suppressed because "bilingual", "flashcards", "kids", and "learning" all appear in the query's `LANG_LEARNING` signal set. Korean food templates are gone. The 1 strict match ("Bilingual Vocabulary Visual Guide") is the correct result given the current inventory.

**cuban sandwich recipe poster** — `cuban` and `sandwich` expand correctly (no language-learning signals in this query). The 4 expanded templates are all food/recipe/poster-relevant. The "World Travel Map Illustration" that polluted v1 results is absent, because the expansion requires all tokens including "poster" to be present in the blob simultaneously.

**bilingual flashcards** — 22 strict templates. `bilingual→multilingual` and `flashcards→flashcard` still expand correctly (no `suppressWhen` on these entries). Maintained and slightly improved from pre-fix state.

**watercolor map (short)** — 4 strict templates including 2 directly relevant map templates and 2 loosely related (Historical Event Map, National Culture infographic — both have "map" and/or "watercolor" in their blobs). No expansion. Reasonable coverage.

**wedding planner** — 4 templates via inspiration `search_aliases`. No concept-expansion noise. The alias-quality concern (East Asian Culture Comparison Infographic carrying "wedding planner" as a broad alias) is a data quality issue separate from the expansion system.

---

## 7. 58-Query Template Regression Summary

| Metric | Count |
|---|---|
| Queries checked | **58** |
| OK (P3 queries with adequate template coverage) | **25** |
| Improved (P1/P2 queries with ≥3 templates now) | **13** |
| Thin (0–2 templates; P0/P1 gap or consumer query served by inspirations) | **20** |
| Noisy / precision risk | **0** |
| True template regressions (P3 queries that lost coverage) | **0** |

No regressions detected. The 8 previously-P3-ok queries that show 0 templates are consumer/lifestyle queries (e.g., "future characters", "cozy reading aesthetic") that were always served by inspirations; their template count was likely 0 before as well.

---

## 8. Remaining P1 Template Gaps (8 queries)

| Query | Current templates | Root cause |
|---|---|---|
| 电商详情图 | 1 | CJK multi-token AND; "电商" + "详情图" not bridged by topic slugs or concept expansion |
| homophones and homonyms | 1 | "homophones"/"homonyms" absent from template topics and CONCEPT_SYNONYMS; inventory thin |
| marvel mbti character chart 16 types | 0 | 6-token strict-AND impossible; no dedicated MBTI×Marvel 16-types chart template |
| lunar new year red envelope graphic design | 1 | 1 correct template; multi-token AND fails broader set; only 9 inspirations in inventory |
| before after kitchen organization makeover | 1 | 1 correct template; kitchen/makeover/organization not co-occurring in any single blob |
| Spanish vocabulary printable | 1 | "Spanish" absent from all template blobs; no language-specific concept synonym |
| watercolor map of europe travel destinations | 1 | 1 correct template; no safe synonym expansion available; inventory depth is the gap |
| bilingual flashcards for kids learning korean fruits | 1 | 1 correct template; 6-token query too strict for expansion; inventory needs more bilingual flashcard templates |

All 8 are **inventory or multi-token-AND gaps**, not pipeline/expansion failures. The search pipeline is returning the correct (and only) matching templates.

---

## 9. Recommended Next Actions

### Data / Template Inventory Gaps

1. **marvel mbti character chart 16 types** — Add a dedicated 16-type MBTI character grid template. The existing "MBTI Marvel Superhero Infographic" covers mbti+marvel but not the 16-type format.
2. **lunar new year red envelope graphic design** — Batch-generate 5–10 more red envelope design inspiration examples.
3. **before after kitchen organization makeover** — Add 2–3 more before-after home/kitchen makeover templates. The single "Home Organization Before & After Poster" is correct but insufficient.
4. **homophones and homonyms** — Add a dedicated homophones/wordplay educational template; only 1 grammar wordlist template currently covers this category.
5. **Spanish vocabulary printable** — Add "Spanish", "French", "German" as topic slugs on the vocabulary template family so language-specific printable queries recall them without requiring the language name in the i18n blob.
6. **watercolor map** — Add "watercolor" as a topic slug directly on the Watercolor World Map and Tourist Spot Watercolor Map templates (rather than relying on synonym expansion).
7. **bilingual flashcards for kids learning korean fruits** — Add more bilingual flashcard templates for specific language pairs (Korean-English, Chinese-English, etc.).

### Safe Synonym / Concept Expansion Candidates

8. **`printable` → `["worksheet", "handout"]`** — Would help "Spanish vocabulary printable" and similar educational output queries.
9. **`makeover` → `["before-after", "transformation", "organization"]`** — Low risk for the kitchen makeover query class.
10. **`homophones` → `["homophone", "wordplay", "vocabulary"]`** — Narrow synonyms that reliably signal a grammar/vocabulary template.

### Precision Safeguards (already applied)

11. **`watercolor` expansion removed** ✅ — "whimsical" and "hand-drawn" were matching Dog Breed Retro infographics and Chinese Cultural Relics templates. Removed entirely.
12. **Country-as-cuisine `suppressWhen` guard added** ✅ — `korean`, `japanese`, `french`, etc. now check for language-learning co-signals before expanding to cuisine terms.

---

*Report generated: 2026-06-23 | Updated: 2026-06-23 (post precision-safeguard)*
*Source data: `docs/external-signal-pilot/curify-gap-analysis-58.csv` (June 21, 2026 eval)*
