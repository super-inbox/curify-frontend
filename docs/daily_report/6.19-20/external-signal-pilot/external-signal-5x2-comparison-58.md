# External Signal 5×2 Comparison — 58 Query Set

_Generated: 2026-06-21 | Queries: 58 | Platforms: Google Images, Bing Images, Pinterest, Canva, Curify_

## 1. Executive Summary

- **All five platforms collected:** Google Images, Bing Images, Pinterest Search, Canva Search, and Curify Search each have 58-query observations, per-query JSONs, screenshots, and validation reports.
- **Google Images and Bing Images are the most reliable external signals:** full top10 coverage on all 58 queries; Bing has the highest avg labels (39.9). Both are suitable as ground-truth visual-signal benchmarks.
- **Pinterest top10 results are usable, but labels/chips are unreliable:** 40/58 queries returned 0 labels due to login modal intercepting the chip bar. Pinterest top10 still provides strong consumer/browse and aesthetic-intent signal.
- **Canva is valuable for English creative/template queries** (36/58 ok, avg 59 labels, avg 10 results) but **CJK and fandom queries are blocked** (21/58 login_required, mainly pure-CJK and chiikawa/genshin). Use Canva signal for English creative queries only.
- **Curify has 5 ok_empty queries and 20 topResults<10 queries.** The empty queries cluster in consumer recipes (easy weeknight dinners, gluten free, meal prep) and educational (phonics worksheets). The thin queries cluster in creative/template categories (recipe poster, flashcards, compatibility chart, watercolor map).
- **Curify's gap is not about replicating Google/Bing image search.** Consumer browse queries (植物, chiikawa, maps, spring flowers) surfacing only a few results is acceptable — the strategic move is converting these to actionable, generative, remixable entry points rather than expanding generic image coverage.
- **Top P0 actions:** Add recipe / meal-prep templates; add phonics / ESL printable templates; fix alias coverage for homophones, cuban sandwich, red envelope graphic design, watercolor map.
- **Top P1 actions:** Template gap for wedding planner, bilingual flashcards, compatibility chart, before/after kitchen makeover, book lovers gift guide; retrieval gap for 电商详情图, mbti marvel, historical character.

## 2. Goal

This report uses external platform search data as a **signal for Curify optimization** — not as a direct replication target.

Specifically, the external platforms help Curify identify:

| Area | How external signal helps |
|---|---|
| **Search recall** | Queries where Google/Bing return rich results but Curify is empty/thin → content or retrieval gap |
| **Intent routing** | Queries where external platforms show a clear creative output intent that Curify should route to template generation |
| **Labels / chips** | External label lists (especially Bing, Google, Canva) provide raw material for Curify's query expansion chips |
| **Query expansion** | Related searches / filter chips from external platforms suggest alias sets Curify should add |
| **Template coverage** | Canva's search results for creative queries show which template types users expect |
| **Ranking / precision** | Comparing top-result relevance across platforms highlights Curify intent-mismatch cases |

## 3. Data Sources and Collection Status

| Platform | Status | Queries | Avg Labels | Avg TopResults | Key Limitation | Output Path |
|---|---|---|---|---|---|---|
| Google Images | PASS | 58/58 complete | 17.8 | 0 top10 (image tiles, not links) | None — most reliable signal | `docs/external-signal-pilot/google-image-eval-58/` |
| Bing Images | PASS | 58/58 ok | 39.9 | 10.0/10 | None — highest avg labels | `docs/external-signal-pilot/bing-image-eval-58/` |
| Pinterest Search | WARN | 58/58 ok | 0.6 | 10.0/10 | 40/58 labels=0 (login modal blocks chip bar) | `docs/external-signal-pilot/pinterest-search-eval-58/` |
| Canva Search | WARN | 36/58 ok, 21/58 login_required, 1 partial | 36.5 | 59 labels (ok queries) | CJK+fandom queries login_required | `docs/external-signal-pilot/canva-search-eval-58/` |
| Curify Search | PASS | 53/58 ok, 5/58 ok_empty | 8.8 | 7.7/10 | 5 ok_empty, 20 topResults<10 — primary analysis focus | `docs/external-signal-pilot/curify-search-eval-58/` |

## 4. Intent Taxonomy

### Creative intent
User wants to **create, design, generate, print, or visually produce** an output.
Signals: `poster`, `printable`, `worksheet`, `flashcard`, `chart`, `guide`, `planner`, `graphic design`, `illustration`, `recipe poster`, `compatibility chart`, `before/after`, `gift guide`, `证件照`, `电商详情图`, `paper cutting`, `手作`.

### Consumer / browse intent
User wants to **browse, discover, reference, or visually absorb** content without explicit creation goal.
Signals: bare nouns (植物, 音乐, 食物, 葡萄酒), character names (吉伊卡哇, chiikawa, genshin, samurai), event names (met gala), destinations (remote destination, maps, short city escapes), aesthetic terms (春天, spring flowers).

### Hybrid intent
Query has both browse and creation aspects. A `primaryIntent` is assigned for the 5×2 matrix.
Examples: `cozy reading aesthetic` (→ consumer), `mbti marvel` (→ creative, Curify angle is chart creation),
`watercolor map of europe travel destinations` (→ creative, explicit illustration output),
`monstera plant care guide infographic` (→ creative, explicit infographic),
`book lovers gift guide` (→ creative, explicit guide output).

## 5. Query Classification Summary

| Intent | Count | Example queries |
|---|---|---|
| creative | 30 | 水果中文, 电商详情图, 词汇, 趣味经济学知识科普, 证件照, 手作, … |
| consumer | 28 | 单词, 卡通, 吉伊卡哇, 家居装饰, 工程, 植物, … |
| hybrid   | 11 | 家居装饰, 词汇, creative comfort food, mbti marvel, minimalist autumn outfit for japan travel, watercolor map of europe travel destinations, … |

Of the 11 hybrid queries: 7 have primaryIntent=creative, 4 have primaryIntent=consumer.

**primaryIntent totals:** creative=30 | consumer=28

## 6. 5×2 Platform Matrix

| Platform | Creative performance | Consumer performance | Key strengths | Key limitations | Curify relevance |
|---|---|---|---|---|---|
| **Google Images** | moderate — visual reference + labels for creative context; not template-first | strong — best-in-class visual signal; stable full top10 all 58 queries | Most reliable ground-truth visual signal; consistent coverage | Not template-aware; top10 image tiles lack templateUrl | Use Google labels as alias seeds; compare top-result domains for content gap evidence |
| **Bing Images** | moderate — stable creative coverage; highest avg labels (39.9) | strong — full top10 all 58; rich related-search labels | Highest label richness; stable retrieval across all query types | Image results only; no template awareness | Best single source for Curify alias/chip expansion; use Bing labels as primary label signal |
| **Pinterest Search** | strong — DIY/aesthetic/inspiration creative; stable top10 | strong — lifestyle/aesthetic/fandom browse | Strong for aesthetic + fandom + recipe visual browsing | 40/58 labels=0 (login modal blocks chips); labels not suitable for comparison | Top results confirm content demand; use for fandom/aesthetic/recipe browse signal |
| **Canva Search** | strong — English template/design queries; avg 59 labels for ok queries | weak/limited — CJK and fandom queries blocked (login wall) | Best template-type signal for English creative queries; Canva labels = design types | 21/58 login_required (all CJK + chiikawa/genshin); CJK data incomplete | Use Canva for English creative template benchmarking; skip CJK gap analysis |
| **Curify Search** | moderate but uneven — good for core chart/vocabulary/illustration; gaps in recipe/printable/education | moderate — results exist for most; should convert browse to generative entry points | Template-first; generation/remix capability; CJK query support | 5 ok_empty; 20 topResults<10; recipe/printable/education category thin | Primary optimization target |

## 7. Creative Intent Findings

**30 queries classified as primary creative intent.**

- Bing covers all creative queries with full top10 (avg 10.0 results). Google covers all creative queries.
- Canva covers the majority of English creative queries (strong for recipe poster, compatibility chart, character chart, red envelope design, phonics worksheets).
- Pinterest top10 is available for all creative queries; labels unreliable.

### Curify creative query gaps

**Creative ok_empty (4):**

| Query | Google | Bing | Pinterest | Canva | Recommended action |
|---|---|---|---|---|---|
| phonics worksheets kindergarten | 10 | 10 | 10 | 10 | Add templates / inspirations for this query; run content generation batch |
| easy weeknight dinners healthy | 10 | 10 | 10 | 10 | Add templates / inspirations for this query; run content generation batch |
| gluten free dinner ideas | 10 | 10 | 10 | 10 | Add templates / inspirations for this query; run content generation batch |
| meal prep weekly recipes | 10 | 10 | 10 | 10 | Add templates / inspirations for this query; run content generation batch |

**Creative topResults<10 (P0/P1) — 18 queries:**

| Query | Curify count | Google | Bing | Issue | Severity | Action |
|---|---|---|---|---|---|---|
| phonics worksheets kindergarten | 0 | 10 | 10 | content_gap | P0 | Add templates / inspirations for this query; run content generation batch |
| easy weeknight dinners healthy | 0 | 10 | 10 | content_gap | P0 | Add templates / inspirations for this query; run content generation batch |
| gluten free dinner ideas | 0 | 10 | 10 | content_gap | P0 | Add templates / inspirations for this query; run content generation batch |
| meal prep weekly recipes | 0 | 10 | 10 | content_gap | P0 | Add templates / inspirations for this query; run content generation batch |
| watercolor map of europe travel destinations | 2 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| book lovers gift guide | 2 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| before after kitchen organization makeover | 3 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| 电商详情图 | 4 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| homophones and homonyms | 4 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| cuban sandwich recipe poster | 4 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| lunar new year red envelope graphic design | 4 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| mbti marvel | 5 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| 趣味经济学知识科普 | 6 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| 证件照 | 6 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| bilingual flashcards for kids learning korean fruits | 6 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| Spanish vocabulary printable | 6 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| wedding planner | 7 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |
| marvel mbti character chart 16 types | 7 | 10 | 10 | template_gap | P1 | Add dedicated templates for this creative intent; check alias coverage |

### Key creative query categories requiring attention

**Recipe / food creation:** `cuban sandwich recipe poster` (4 results), `easy weeknight dinners healthy` (0), `gluten free dinner ideas` (0), `meal prep weekly recipes` (0)
> Bing returns full top10 for all; Canva returns full template sets. Curify has recipe templates but aliases/retrieval are failing for these specific query shapes.

**Printable / worksheet / education:** `phonics worksheets kindergarten` (0), `Spanish vocabulary printable` (6), `ESL flashcards printable` (ok but check), `bilingual flashcards for kids learning korean fruits` (6)
> Bing+Google return 10 results each. Curify has these templates but 'printable'/'worksheet'/'kindergarten' aliases are incomplete.

**Compatibility / personality charts:** `infj vs entp dating compatibility chart` (ok), `marvel mbti character chart 16 types` (7), `mbti marvel` (5)
> Curify has MBTI template catalog; retrieval gap for long-form queries and 16-type framing.

**Travel / map creation:** `watercolor map of europe travel destinations` (2), `lunar new year red envelope graphic design` (4)
> Content and template gap — these specific creative output types need dedicated templates or alias expansion.

**Wedding / event:** `wedding planner` (7 results)
> Template gap — Curify has some wedding content but planner-type templates are thin.

**Kitchen / home makeover:** `before after kitchen organization makeover` (3)
> Specific before/after format needs dedicated template or alias.

**Book / reading gift guide:** `book lovers gift guide` (2)
> Gift guide template type missing or under-aliased.

## 8. Consumer / Browse Intent Findings

**28 queries classified as primary consumer intent.**

- Google Images and Bing Images both return full top10 for **all** consumer queries — these are the gold standard for browse intent visual signal.
- Pinterest returns full top10 for all consumer queries, especially strong for fandom (chiikawa, genshin, samurai), aesthetic (唯美春天, cozy reading), and lifestyle (食物, 植物).
- Canva is **not suitable** as a consumer benchmark — CJK consumer queries are mostly login_required.

### Curify strategic note on consumer queries

> Curify should **not** try to match Google/Bing top10 counts for pure consumer queries like `植物`, `音乐`, `葡萄酒`, `chiikawa`, `genshin`. These are visual-browse queries where Google/Bing serves photos and Curify serves templates.
> The strategic opportunity is: convert consumer browse intent → **generative/remixable entry point**.
> e.g. `genshin` → 'Create a Genshin MBTI character chart'; `maps` → 'Create a custom travel map'; `植物` → 'Create a plant care guide infographic'.

### Consumer queries where Curify is thin

| Query | Curify count | Issue | Note |
|---|---|---|---|
| historical character | 5 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| global influence | 8 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| samurai | 8 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| 工程 | 9 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |

### Fandom / character browse queries

| Query | Curify | Google | Bing | Pinterest | Canva | Note |
|---|---|---|---|---|---|---|
| 吉伊卡哇 | 10 | 10 | 10 | 10 | 0 | Performing adequately; monitor for regression |
| chiikawa | 10 | 10 | 10 | 10 | 0 | Performing adequately; monitor for regression |
| genshin | 10 | 10 | 10 | 10 | 0 | Performing adequately; monitor for regression |
| samurai | 8 | 10 | 10 | 10 | 10 | Audit aliases and tokenization; check if content exists but isn't being recalled |
| mbti marvel | 5 | 10 | 10 | 10 | 10 | Add dedicated templates for this creative intent; check alias coverage |
| met gala | 10 | 10 | 10 | 10 | 10 | Performing adequately; monitor for regression |

**Key fandom insight:** `chiikawa` and `genshin` are blocked on Canva (login_required). Google/Bing/Pinterest all return rich fandom imagery. Curify should convert fandom browse intent to MBTI/grid character chart templates.

## 9. Curify Gap Analysis

### P0 — Curify empty but external signal rich

| Query | Intent | Google | Bing | Pinterest | External rich | Issue | Recommended action |
|---|---|---|---|---|---|---|---|
| **unique cultural experiences** | consumer | 10 | 10 | 10 | True | content_gap | Add templates / inspirations for this query; run content generation batch |
| **phonics worksheets kindergarten** | creative | 10 | 10 | 10 | True | content_gap | Add templates / inspirations for this query; run content generation batch |
| **easy weeknight dinners healthy** | creative | 10 | 10 | 10 | True | content_gap | Add templates / inspirations for this query; run content generation batch |
| **gluten free dinner ideas** | creative | 10 | 10 | 10 | True | content_gap | Add templates / inspirations for this query; run content generation batch |
| **meal prep weekly recipes** | creative | 10 | 10 | 10 | True | content_gap | Add templates / inspirations for this query; run content generation batch |

**Root causes:** These 5 ok_empty queries all have rich results on Google, Bing, and Pinterest.
- `unique cultural experiences` — broad consumer query; Curify's cultural-experience templates exist but the alias chain (`unique+cultural+experiences` 3-token AND) fails strict matching.
- `phonics worksheets kindergarten` — education printable category; Curify has phonics templates but 'worksheets'/'kindergarten' aliases are incomplete.
- `easy weeknight dinners healthy`, `gluten free dinner ideas`, `meal prep weekly recipes` — recipe subcategory; Curify has recipe templates but these adjective-first query shapes aren't aliased.

### P1 — Curify thin (topResults<10)

| Query | Intent | Curify | Google | Bing | Issue | Recommended action |
|---|---|---|---|---|---|---|
| watercolor map of europe travel destinations | creative | 2 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| book lovers gift guide | creative | 2 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| before after kitchen organization makeover | creative | 3 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| 电商详情图 | creative | 4 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| homophones and homonyms | creative | 4 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| cuban sandwich recipe poster | creative | 4 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| lunar new year red envelope graphic design | creative | 4 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| historical character | consumer | 5 | 10 | 10 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| mbti marvel | creative | 5 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| 趣味经济学知识科普 | creative | 6 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| 证件照 | creative | 6 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| bilingual flashcards for kids learning korean fruits | creative | 6 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| Spanish vocabulary printable | creative | 6 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| wedding planner | creative | 7 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |
| marvel mbti character chart 16 types | creative | 7 | 10 | 10 | template_gap | Add dedicated templates for this creative intent; check alias coverage |

### P2 — Query expansion / labels opportunity

| Query | Intent | Curify labels | Bing labels | Issue | Opportunity |
|---|---|---|---|---|---|
| 工程 | consumer | 8 | 40 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| global influence | consumer | 9 | 40 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| 反义词 | creative | 6 | 40 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| paper cutting | creative | 9 | 40 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |
| samurai | consumer | 10 | 40 | retrieval_gap | Audit aliases and tokenization; check if content exists but isn't being recalled |

### P3 — Platform limitation / low priority

| Query | Issue | Reason |
|---|---|---|
| 单词 | ok | Performing adequately; monitor for regression |
| 卡通 | ok | Performing adequately; monitor for regression |
| 吉伊卡哇 | ok | Performing adequately; monitor for regression |
| 家居装饰 | ok | Performing adequately; monitor for regression |
| 植物 | ok | Performing adequately; monitor for regression |
| 水果中文 | ok | Performing adequately; monitor for regression |
| 自行车 | ok | Performing adequately; monitor for regression |
| 葡萄酒 | ok | Performing adequately; monitor for regression |
| 蔬菜 | ok | Performing adequately; monitor for regression |
| 词汇 | ok | Performing adequately; monitor for regression |
| 音乐 | ok | Performing adequately; monitor for regression |
| 食物 | ok | Performing adequately; monitor for regression |
_33 total P3 queries_

## 10. External Labels / Chips Opportunities

Google and Bing labels are the most reliable source for Curify alias/chip expansion. Pinterest labels are too sparse. Canva labels are useful for English creative queries.

### Food / recipe

**Representative queries:** `cuban sandwich recipe poster`, `easy weeknight dinners healthy`, `gluten free dinner ideas`, `meal prep weekly recipes`, `creative comfort food`

**External labels (Bing/Canva sample):** `Cuban Sandwich
Bread`, `Best Bread for
Cuban Sandwich`, `Classic
Cuban Sandwich`, `Easy
Cuban Sandwich`, `Authentic
Cuban Sandwich`, `Easy Weeknight Dinners
for Family`, `Healthy Weeknight Dinners`, `Easy Healthy
Chicken Dinners`

**Curify opportunity:** Add aliases: `recipe poster`, `meal prep`, `weeknight`, `healthy dinner`, `gluten free`; add filter chips for recipe type

### Education / printable / worksheet

**Representative queries:** `phonics worksheets kindergarten`, `Spanish vocabulary printable`, `ESL flashcards printable`, `bilingual flashcards for kids learning korean fruits`, `homophones and homonyms`

**External labels (Bing/Canva sample):** `Free
Kindergarten Phonics Worksheets`, `Phonics Reading Worksheets
for Kindergarten`, `Phonics a Worksheet
for Kindergarten`, `Phonics
Activities for Kindergarten`, `Kindergarten Worksheets
Free Printable`, `Spanish Vocabulary
Flashcards Printable`, `Teaching Spanish
Worksheets`, `Free
Printable Spanish Vocabulary`

**Curify opportunity:** Add aliases: `printable`, `worksheet`, `kindergarten`, `phonics`, `flashcard`; ensure `ESL`/`TEFL`/`language learner` aliases exist

### Fandom / character

**Representative queries:** `吉伊卡哇`, `chiikawa`, `genshin`, `samurai`, `mbti marvel`

**External labels (Bing/Canva sample):** `吉伊卡哇
角色`, `吉伊卡哇电脑壁纸`, `及一卡哇`, `吉伊卡哇壁纸`, `吉伊卡哇
電腦桌布`, `Chiikawa
PNG`, `Chiikawa
Emoji`, `Chiikawa
Bunny`

**Curify opportunity:** Expand character aliases for chiikawa/genshin/samurai; add 'character chart' chip; add fandom-specific MBTI templates

### Travel / map

**Representative queries:** `watercolor map of europe travel destinations`, `remote destination`, `short city escapes`, `maps`, `minimalist autumn outfit for japan travel`

**External labels (Bing/Canva sample):** `Europe Map
Colorful`, `Europe Travel Map`, `Watercolor Map`, `Watercolor
World Map`, `Map of Europe
to Print`, `Remote
Beach`, `Remote
Travel`, `Remote
Location`

**Curify opportunity:** Add `watercolor map` template; expand `travel destinations`, `city guide`, `vintage poster` aliases

### Plant / home / lifestyle

**Representative queries:** `植物`, `monstera plant care guide infographic`, `before after kitchen organization makeover`, `家居装饰`, `香薰`

**External labels (Bing/Canva sample):** `植物
卡通`, `盆栽`, `大自然`, `仙人掌`, `蔬菜`, `Monstera Plant Care`, `Monstera Deliciosa
Plant Care`, `Monstera Plant Care
Indoor`

**Curify opportunity:** Expand `care guide`, `infographic`, `before after`, `organization` aliases for home/plant templates

### Design / template / creative

**Representative queries:** `lunar new year red envelope graphic design`, `wedding planner`, `met gala`, `paper cutting`, `手作`

**External labels (Bing/Canva sample):** `Templates Marketplace`, `Happy lunar new year`, `Red And Cream Illustrative Happy Lunar New Year Instagram Story`, `Red Simple Happy Lunar New Year Instagram Story`, `Red Minimalist Happy Lunar New Year Instagram Story`, `1 of 7 7 slides`, `White and Black Minimalist Wedding Checklist A4 Document`, `1 of 3 3 slides`

**Curify opportunity:** Use Canva labels as design-type chips: add `red envelope`, `wedding`, `event poster`, `ID photo` template type chips

### Language learning / vocabulary

**Representative queries:** `单词`, `词汇`, `反义词`, `homophones and homonyms`, `english-chinese`

**External labels (Bing/Canva sample):** `英语单词`, `Ture
单词`, `Lucky
单词`, `英文单词`, `单词表`, `GRE
词汇`, `词汇表`, `English
Skills`

**Curify opportunity:** Expand `vocabulary`, `bilingual`, `language pair`, `antonym`, `homophone` aliases; add printable/worksheet suffix aliases

## 11. Recommended Backlog

| Priority | Query / group | Issue | Evidence | Recommended action | Owner area |
|---|---|---|---|---|---|
| **P2** | 工程 | retrieval_gap | Curify ok(9); Google=10,Bing=10,Pinterest=10… | Audit aliases and tokenization; check if content exists but  | search/retrieval |
| **P1** | 电商详情图 | template_gap | Curify ok(4); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | 趣味经济学知识科普 | template_gap | Curify ok(6); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | 证件照 | template_gap | Curify ok(6); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | historical character | retrieval_gap | Curify ok(5); Google=10,Bing=10,Pinterest=10… | Audit aliases and tokenization; check if content exists but  | search/retrieval |
| **P1** | homophones and homonyms | template_gap | Curify ok(4); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P2** | global influence | retrieval_gap | Curify ok(8); Google=10,Bing=10,Pinterest=10… | Audit aliases and tokenization; check if content exists but  | search/retrieval |
| **P0** | unique cultural experiences | content_gap | Curify ok_empty(0); Google=10,Bing=10,Pinterest=10… | Add templates / inspirations for this query; run content gen | content/template |
| **P1** | mbti marvel | template_gap | Curify ok(5); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P2** | 反义词 | retrieval_gap | Curify ok(9); Google=10,Bing=10,Pinterest=10… | Audit aliases and tokenization; check if content exists but  | search/retrieval |
| **P2** | paper cutting | retrieval_gap | Curify ok(9); Google=10,Bing=10,Pinterest=10… | Audit aliases and tokenization; check if content exists but  | search/retrieval |
| **P1** | wedding planner | template_gap | Curify ok(7); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | cuban sandwich recipe poster | template_gap | Curify ok(4); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | bilingual flashcards for kids learning korean fruits | template_gap | Curify ok(6); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | watercolor map of europe travel destinations | template_gap | Curify ok(2); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | marvel mbti character chart 16 types | template_gap | Curify ok(7); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | lunar new year red envelope graphic design | template_gap | Curify ok(4); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P1** | before after kitchen organization makeover | template_gap | Curify ok(3); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P0** | phonics worksheets kindergarten | content_gap | Curify ok_empty(0); Google=10,Bing=10,Pinterest=10… | Add templates / inspirations for this query; run content gen | content/template |
| **P1** | Spanish vocabulary printable | template_gap | Curify ok(6); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P0** | easy weeknight dinners healthy | content_gap | Curify ok_empty(0); Google=10,Bing=10,Pinterest=10… | Add templates / inspirations for this query; run content gen | content/template |
| **P0** | gluten free dinner ideas | content_gap | Curify ok_empty(0); Google=10,Bing=10,Pinterest=10… | Add templates / inspirations for this query; run content gen | content/template |
| **P0** | meal prep weekly recipes | content_gap | Curify ok_empty(0); Google=10,Bing=10,Pinterest=10… | Add templates / inspirations for this query; run content gen | content/template |
| **P1** | book lovers gift guide | template_gap | Curify ok(2); Google=10,Bing=10,Pinterest=10… | Add dedicated templates for this creative intent; check alia | content/template |
| **P2** | samurai | retrieval_gap | Curify ok(8); Google=10,Bing=10,Pinterest=10… | Audit aliases and tokenization; check if content exists but  | search/retrieval |

## 12. Platform Limitations

### Pinterest
- **Top10 results:** Available and usable for all 58 queries.
- **Labels/chips:** **40/58 queries returned 0 labels** because the login modal intercepts the search chip bar. Pinterest labels are not suitable for query expansion comparison with Google/Bing.
- **Recommendation:** Use Pinterest top10 results as browse-intent signal; do not use Pinterest label counts as a benchmark.

### Canva
- **21/58 queries login_required**, primarily:
  - All pure-CJK queries (单词, 卡通, 吉伊卡哇, 植物, 葡萄酒, etc.)
  - Short romanized fandom terms (chiikawa, genshin)
  - Some mixed queries (反义词, 动物词汇, chiikawa)
- **English creative queries (36/58):** ok with avg 59 labels and 10 results — highly informative for template-type signal.
- **Recommendation:** Use Canva for English creative query benchmarking only. Do not use Canva to assess CJK or fandom query gaps.

### Google Images
- Google collector uses `top10` field (not `topResults`) and image tiles rather than URLs. The `topResults` avg is 0 in observations but the top10 image data is available per-query.
- Labels are extracted from Google related searches and are highly informative (avg 17.8 labels).

## 13. Appendix

### Input observations paths
- `docs/external-signal-pilot/google-image-eval-58/data/observations.json`
- `docs/external-signal-pilot/bing-image-eval-58/data/observations.json`
- `docs/external-signal-pilot/pinterest-search-eval-58/data/observations.json`
- `docs/external-signal-pilot/canva-search-eval-58/data/observations.json`
- `docs/external-signal-pilot/curify-search-eval-58/data/observations.json`

### Output paths
- `docs/external-signal-pilot/external-signal-5x2-query-classification-58.csv`
- `docs/external-signal-pilot/external-signal-5x2-summary.csv`
- `docs/external-signal-pilot/curify-gap-analysis-58.csv`
- `docs/external-signal-pilot/external-signal-5x2-comparison-58.md`

### Rerun commands

```bash
python3 scripts/external-signal-analysis/generate_report.py
```

### Screenshots
Screenshot files are **not committed to git** because of size (72.5 MB for Canva alone). They live in `docs/external-signal-pilot/*/screenshots/` and are excluded via `.gitignore` (or by not staging them).

### Validation reports
- `docs/external-signal-pilot/google-image-eval-58/data/validation-report.json` — exists
- `docs/external-signal-pilot/bing-image-eval-58/data/validation-report.json` — exists
- `docs/external-signal-pilot/pinterest-search-eval-58/data/validation-report.json` — exists
- `docs/external-signal-pilot/canva-search-eval-58/data/validation-report.json` — exists
- `docs/external-signal-pilot/curify-search-eval-58/data/validation-report.json` — exists

