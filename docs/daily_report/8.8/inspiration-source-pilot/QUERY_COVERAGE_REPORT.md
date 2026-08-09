# Query Coverage Report — 326-Query Set vs. 5 Target Domains

Phase C1. Companion to `QUERY_326_AUDIT.csv` (all 326 rows + classification columns) and
`PILOT_QUERY_RECOMMENDATIONS.csv`. Method: no embeddings/vector similarity anywhere — domain,
subdomain, intent, and duplicate/redundancy judgments were made by reading each query's actual
text against its `reason` column, grouped mechanically by cross-language row-adjacency and by
`(scenario, category)` for a first pass, then corrected by hand where the query text disagreed with
its `scenario`/`category` label. A reproducible script
(`process_326.py`, kept in this directory's working notes — see "Reproducibility" below) generated
the CSV deterministically from an explicit mapping table; nothing was inferred by a model reading
row-by-row without a rule to point to.

## Cross-language duplicate rule (stated once, applied everywhere)

The 326-row set is 163 zh / 163 en, and rows are stored as adjacent translation pairs throughout the
file (V001/V002, V003/V004, ... V325/V326) — confirmed by reading all 326 rows directly, not sampled.

**Rule applied:** every verified cross-language translation pair is tagged `duplicate_type =
NEAR_DUPLICATE`, sharing a `duplicate_group` id, and **both members are marked `decision = KEEP`**
(never REMOVE or auto-MERGE) — because Curify serves both languages, a zh/en pair is not redundant
content to prune, it is required bilingual coverage of the same sub-intent. This is different from
same-language redundancy (see below), which *can* lead to MERGE.

**One exception found and hand-flagged:** V063 (公仔盒, "figure display/storage box") and V064
("sticker pack") sit in the expected adjacent-pair position but are **not** translations of each
other — a mistranslation/pairing artifact in the source file. Both are kept as standalone rows
(`duplicate_type = NONE` for this pair only) rather than forced into a false NEAR_DUPLICATE
relationship. This is the only pairing break found across all 163 pairs.

**Same-language redundancy** (both members of a pair effectively duplicate another pair's concept in
the *same* language) was found in a handful of clusters and handled with `MERGE`, not silently
dropped:
- 店招/shop sign (V129/V130) vs. 门店招牌/storefront sign (V131/V132) — same real-world visual
  target (exterior signage); V131→merges into V129, V132→merges into V130.
- 电商横幅/ecommerce banner (V193/V194) vs. 网店横幅/online store banner (V211/V212) — same visual
  target; V211→V193, V212→V194.
- 会员卡/membership card (V223/V224) vs. 积分卡/loyalty card (V225/V226) — near-synonymous card
  template; V225→V223, V226→V224.

Three further overlaps were identified but **kept as separate KEEP rows** rather than merged, because
each represents a generic term plus one or more genuine specializations, not a pure duplicate:
generic 标签/label vs. 产品标签/product label; generic 菜单/menu vs. 餐厅菜单/restaurant menu vs.
咖啡馆菜单/cafe menu; generic 图表/chart vs. 学习图表/learning chart (this last one flagged
`confidence = MEDIUM` — the distinction is thin and a human reviewer may reasonably choose to merge
it).

Two pairs were downgraded to `decision = REVIEW` rather than KEEP or REMOVE: 促销活动/promotion
(V175/V176) and 广告/advertisement (V177/V178) are abstract campaign/media concepts, not single
concrete visual targets — they arguably violate the source bank's own stated inclusion rule ("具体...
视觉目标清晰" / concrete item, clear visual target). Rather than unilaterally removing them, they are
flagged for human judgment, contrasted with more specific sibling queries that ARE kept outright
(社交媒体广告/social media ad, V213/214).

## Domain counts (all six buckets, sum = 326)

| domain | rows | KEEP | MERGE | REVIEW | REMOVE |
|---|---|---|---|---|---|
| merch | 82 | 82 | 0 | 0 | 0 |
| ecommerce | 66 | 58 | 4 | 4 | 0 |
| education | 80 | 80 | 0 | 0 | 0 |
| brand_logo | 10 | 8 | 2 | 0 | 0 |
| packaging | 66 | 66 | 0 | 0 | 0 |
| other_unmapped | 22 | 22 | 0 | 0 | 0 |
| **total** | **326** | **316** | **6** | **4** | **0** |

No row was marked REMOVE outright — every query in the source bank was judged to represent *some*
genuine, findable real-world visual target; the two REVIEW rows are flagged as candidates a human
might choose to drop, not pre-removed.

## Per-domain coverage analysis

### merch (82 rows, 100% KEEP)

All 82 rows come from the original `creative_merch` scenario and re-classify cleanly into `merch`
with no scenario-column disagreement — this is the one domain where the original label and the
re-classified domain match almost perfectly (subject to the V063/064 mistranslation).

**Represented subdomains (36 distinct):** toy, figure_generic, action_figure, mini_figure,
pop_figure_designer_toy, cultural_figure, ip_figure, plush, doll, mascot, character_ip, sticker,
keychain, collectible_generic, trading_card, model_kit, statue, designer_vinyl, puzzle,
building_blocks, art_print, bobblehead, diorama, blind_box, capsule_toy_gacha, mystery_box,
bag_accessory, tech_accessory, badge_pin, magnet_charm, wearable_accessory, drinkware, home_goods,
cultural_museum_merch, anime_merch, print_merch, figure_box.

**Strong coverage:** the "collectible physical object" space (figures, plush, dolls, collectibles,
blind box/gacha mechanics, trading cards, model kits) is deep and well-differentiated — 10+ distinct
collectible subdomains alone. Cultural-creative/文创 intent is explicitly represented (cultural
figure, museum souvenir, IP figure, 国潮/guochao) rather than assumed, which matters since "merch" here
is defined as "Merch / cultural creative design, 文创设计."

**Weak / missing coverage:** no queries for apparel-as-merch (T-shirts, hoodies — a very common
literal "merch" category), no home/lifestyle merch beyond mug/pillow (no tumbler, tote-adjacent
drinkware variety, no plant pot / stationery-as-merch beyond what's covered), no NFT/digital-collectible
adjacent queries, no seasonal/holiday-themed merch queries, no query for "art toy" as a term distinct
from "designer vinyl"/"pop figure" (may be redundant with those — not necessarily a gap).

**Overrepresented intent:** `merch_item` (26 rows / 13 pairs) and `collectible` (20 rows / 10 pairs)
together are nearly half the domain — reasonable given genuine sub-diversity within each, but this
means "collectible object variety" dominates over "wearable/apparel merch," which barely exists.

### ecommerce (66 rows, 58 KEEP / 4 MERGE / 4 REVIEW)

**This domain required the most scenario-label correction.** Of the 66 rows classified `ecommerce`,
54 originally carried the `marketing_ecommerce` scenario label and 0 carried `brand_business` —
however, 28 rows that *did* carry `marketing_ecommerce` were reclassified **out** of `ecommerce`
(20 to `other_unmapped`, i.e. flyers, movie poster, trade-show banner, offline window display).
Examples of the reclassification, as required:
- V233/V234 ("展会展架"/"trade show banner") — carried `marketing_ecommerce`, but a trade-show
  exhibition banner is B2B/offline event signage, not "ecommerce design" → `other_unmapped`.
- V185/V186 ("电影海报"/"movie poster") — carried `marketing_ecommerce`, but a movie poster is
  entertainment marketing with no commerce/product content → `other_unmapped`.
- V231/V232 ("橱窗展示"/"window display") — carried `marketing_ecommerce`, but a physical storefront
  window display is offline retail merchandising, not online ecommerce → `other_unmapped`.
- V167–V236 flyer family (10 rows: generic/restaurant/discount/event/exhibition flyer) — carried
  `marketing_ecommerce`, but a printed flyer is offline marketing collateral, not "ecommerce design"
  → `other_unmapped`.

No `brand_business`-labeled row was reclassified into `ecommerce` in this pass (brand_business's
non-packaging, non-brand_logo remainder went to `other_unmapped` instead — see menu example below) —
worth noting since the task flagged this direction as plausible too; in this dataset it did not
materialize, likely because `brand_business` in the source bank leans toward physical
product/packaging assets rather than online storefront assets.

**Strong coverage:** promotional posters and campaign banners (14 banner subdomains, 8 poster rows),
loyalty/gift/membership cards, product photography basics (product photo, listing image, unboxing,
before/after).

**Weak / missing:** no queries for the actual product-listing-page composition itself (hero shot +
lifestyle shot + size chart as a set), no marketplace-specific formats (Amazon A+ content, Shopify
collection banner), no livestream-commerce beyond one banner query, no email-marketing creative, no
mobile-app storefront UI. `promotion` (V175/176) and `advertisement` (V177/178) are flagged REVIEW
for being too abstract to be single visual targets.

**Redundant clusters:** ecommerce banner / online store banner (merged), the 14-subdomain banner
family as a whole is the single most overrepresented intent in the entire 326-set (28 raw rows before
any merge) — legitimate diversity of campaign types, but worth knowing if template-supply effort will
be spent proportionally to query volume.

### education (80 rows, 100% KEEP)

Cleanest domain in the set — every row's original `education` scenario label matches its
re-classified domain; no cross-domain leakage found in either direction. 33 distinct subdomains
spanning flashcards (6 variants), worksheets (5 variants), charts (7 variants), certificates (4
variants), classroom equipment/decor, and school stationery.

**Strong coverage:** K-12 classroom material is deep and varied (flashcard sub-intents alone span
alphabet/phonics/vocabulary/spelling/animal). **Weak/missing coverage:** no higher-ed / university
content (no course syllabus, no academic poster/research poster, no thesis/dissertation cover), no
STEM-lab-report or rubric queries, no e-learning/online-course UI assets (no course thumbnail, no
LMS banner), no early-childhood non-flashcard formats (no story book page, no coloring page), no
language-learning-specific material beyond generic flashcards/worksheets.

### brand_logo (10 rows, 8 KEEP / 2 MERGE) — smallest domain, biggest coverage gap after packaging

Only 5 raw pairs exist for this domain across the whole 326-set, and 2 of those pairs (storefront
sign) merge into the other 2 (shop sign), leaving effectively **4 distinct concepts**: logo,
business card, branded stationery/envelope, storefront signage. This domain has by far the thinnest
representation of the five target domains by row count.

**Missing coverage — extensive:** no wordmark/monogram-specific query (distinct from generic "logo"),
no brand style guide / brand guidelines document, no color palette / brand pattern / brand mascot
mockup, no letterhead, no social media profile/cover kit, no favicon/app-icon, no brand pitch deck
cover, no rebrand-comparison query. The domain exists in the query bank almost entirely as an
afterthought inside the `brand_business` scenario (10 of `brand_business`'s 82 rows), which itself
was named "Brand/Business" rather than "Brand + Logo" — consistent with Phase 0's provenance finding
that this scenario doesn't map 1:1 to domain 4.

**Reclassification example (menu):** V091–V128 menu rows (菜单/menu, 餐厅菜单/restaurant menu,
咖啡馆菜单/cafe menu — 6 rows) carried `brand_business` but were reclassified to
`other_unmapped/restaurant_menu_design` rather than `brand_logo` — a restaurant menu is hospitality
collateral, not a logo/brand-identity asset, even though it shares the "printed brand material"
flavor with business cards. This is a deliberate, debatable call (see decision_reason on those rows)
and is flagged `confidence = MEDIUM`-equivalent territory; a reasonable alternative reading would
place it in `brand_logo` as "brand collateral." Signage (店招/shop sign, 门店招牌/storefront sign) was
kept in `brand_logo` on the same "brand collateral" logic — the difference in call is that signage is
a direct, unambiguous extension of a logo/wordmark onto a storefront, while a menu's primary content
(dish names/prices/food photography) is not brand-identity content.

### packaging (66 rows) — special attention, per task instructions

**The original benchmark taxonomy has no dedicated `packaging` scenario at all** — confirmed again in
this pass (scenario values are only `creative_merch` / `brand_business` / `marketing_ecommerce` /
`education`; Phase 0's provenance doc already established this). **However, re-classifying by actual
query text/intent (not by scenario) finds that 66 of the 326 rows — 20% of the entire query bank —
genuinely represent packaging design intent.** All 66 originally carried the `brand_business`
scenario label; this is effectively half of that scenario's 82 rows (`package`, `product_box`, most
of `label`, `bottle`, `cup`, and the retail-bag half of `merch_item`).

**How thin/absent is it, concretely:**
- Coverage is **real but entirely borrowed** — no query in the bank was written with "packaging" as
  its intended scenario; every packaging row here was harvested from queries the original authors
  filed under generic "Brand/Business" assets (bottle, box, label, package).
- Coverage **skews heavily toward food/beverage and cosmetic packaging** (22 food_beverage_packaging
  + 10 cosmetic_packaging + 4 beverage_packaging(cup/sleeve) + 4 beverage_packaging_label = 40 of 66
  rows, ~61%) with no other vertical anywhere near that depth.
- **Missing entirely:** apparel/textile packaging (poly bags, garment boxes, folded-shirt packaging),
  electronics/tech packaging, pharma/supplement/nutraceutical packaging, industrial/shipping/mailer
  packaging, toy packaging specifically (blister pack, window box — despite "toy"/"figure" existing
  as merch queries, no query asks for *packaging* of a toy), sustainable/eco/kraft packaging, and any
  packaging-mockup/render-specific phrasing (flat lay, 3D mockup, die-line) that a packaging-design
  tool's users would plausibly type.
- Even within its two strong verticals, coverage is generic-noun-only (e.g. "cosmetic package,"
  "skincare package") rather than format-specific (no "tube," "jar," "sachet," "pump bottle,"
  "stand-up pouch" as explicit terms) — real packaging-design search behavior is often
  format-specific, which this set cannot test.
- Two rows (V133/134 "product tag," V135/136 "price tag," V137/138 "clothing tag") were pulled from
  the `label` category into a new `hangtag` subdomain — these are packaging-adjacent (attached
  product tags) but arguably closer to a merchandising/retail-fixture concept than "packaging" in the
  box/bottle/label sense; flagged here for transparency rather than silently bucketed.

**Bottom line for Phase C2 planning:** if packaging is to be a first-class pilot domain, the 326-query
bank should not be treated as sufficient on its own — the 66 rows found here are useful as a *seed*
(especially food/cosmetic packaging) but the domain needs supplementary query authoring before pilot
scale, more than any of the other four domains.

### other_unmapped (22 rows)

Deliberately not forced into the five domains: print flyers (10, offline marketing collateral),
restaurant/cafe menus (6, hospitality collateral), entertainment poster (2, movie poster — no
commerce/product content), offline window display (2, physical retail merchandising, not online
ecommerce), and trade-show/exhibition banner (2, B2B event signage). All 22 originate from
`marketing_ecommerce` (16) or `brand_business` (6) scenario labels — none from `creative_merch` or
`education` — consistent with those two scenarios being the cleanest 1:1 mappings to their domains.

## Reproducibility

The row-by-row classification was generated by a small Python script that encodes the mapping
decisions above as explicit lookup tables (default domain/subdomain per `(scenario, category)`, plus
per-query-id overrides for every reclassification and redundancy call documented in this report) and
writes `QUERY_326_AUDIT.csv` deterministically — no LLM free-generation per row, no embeddings/vector
similarity/FAISS/pgvector/Pinecone/Milvus, no vector index of any kind. Token/phrase overlap and
category grouping were used only to *find candidate* near-duplicate clusters (e.g. the banner/label/
menu/chart families discussed above); every cluster's actual MERGE/KEEP call and every domain
override was a direct human-style reading of the query text and its `reason` column, encoded into the
script as an explicit override, not computed similarity.
