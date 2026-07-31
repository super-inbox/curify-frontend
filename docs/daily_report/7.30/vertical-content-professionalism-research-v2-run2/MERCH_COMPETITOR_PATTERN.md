# Merch Competitor Pattern Summary

**research_run_id:** vertical-content-professionalism-research-v2-run2
**source:** `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` (Merch rows) + `SELECTED_PAGE_EVIDENCE_INDEX.md`
§Merch + `CURRENT_IMPLEMENTATION_AUDIT.md` for Curify's existing implementation state.

---

## 1. Research scope

- **Search queries used:** 6 (`MER_01`–`MER_06`)
- **SERP results viewed:** 6
- **Internal pages opened:** 6 (every query has a `*_content.png` click-through screenshot)
- **Final representative pages selected:** 4 (`MER_01`, `MER_04`, `MER_05`, `MER_06`); 2 excluded as
  visual references only (`MER_02`, `MER_03`)

## 2. Selected competitors

| Page | Rank | Page type | Key professional modules | Strength | Limitation |
|---|---|---|---|---|---|
| MER_01 — Yellowstone triple decal (shop.americasnationalparks.org) | 1 | Single-SKU product detail page | Cultural/background story, size specs, Made-in-USA note, nonprofit trust badges, related-product recs, reviews | Clearest "story + spec + trust + related" combination found in this vertical | Transactional layer (cart/price/stock) doesn't apply to Curify |
| MER_04 — Funny Cats sticker pack (getstickerpack.com) | 1 | Digital product detail page | Author/theme title, full sheet preview grid, copyright attribution, author's other works, related packs | Closest structural match to Curify's own digital/creative-asset nature | No material/size/print-process specs — digital, not physical, merch |
| MER_05 — Custom Pet Magnet (etsy.com/market) | 1 | Marketplace / category collection page | Personalization/price/shipping filters, sort, dense per-card info (style/price/rating/shipping) | Strong personalized-merch discovery pattern | No unified material/size/process/file spec anywhere on the page |
| MER_06 — Wedding Favor Stickers (etsy.com/market) | 1 | Marketplace / category collection page | Same filter/card structure as MER_05, different theme (occasion-based) | Confirms MER_05's pattern generalizes across themes | Same spec gap as MER_05 |

## 3. Repeated patterns

Only patterns confirmed on **2 or more** of the 4 selected pages are listed.

### Pattern: Cultural/contextual story tied to the product
- **What users see:** prose explaining *why* the design/product exists — a place's meaning (MER_01's
  "why YELL?" explainer), a theme's identity — before or alongside the spec/purchase module.
- **Why it helps SEO:** unique, topic-specific prose is exactly the kind of content generic product
  pages lack, giving the page something to rank for beyond the bare product name.
- **Why it helps user intent:** buyers of themed/personalized merch are often buying the *meaning*
  (a place they visited, a hobby, an occasion), not just the object — the story is part of the pitch.
- **Evidence pages:** MER_01 (explicit background story); MER_04 (author/theme framing serves a similar
  narrative-context role, though thinner than MER_01's).
- **Curify status:** the schema already has a `cultural_background` knowledge slot
  (`lib/vertical_schema.ts:105`), but per `CURRENT_IMPLEMENTATION_AUDIT.md` Q5, **zero** Merch
  templates have any authored `content.vertical` values — this slot has never been populated or
  rendered on a real page.

### Pattern: Related-product / related-pack recommendations
- **What users see:** a "you may also like" or "related packs" module surfacing adjacent products in
  the same family (other national parks, other sticker packs, other custom-magnet styles).
- **Why it helps SEO:** internal linking across a product family concentrates authority and gives
  crawlers a path to the rest of the catalog from any single entry point.
- **Why it helps user intent:** merch buyers browsing one themed item are commonly interested in the
  sibling set (other parks, other characters, other occasions).
- **Evidence pages:** MER_01, MER_04, MER_05, MER_06 (all 4 — MER_05/MER_06 express this as the entire
  page being a same-family grid rather than a discrete "related" module, but the underlying pattern —
  never dead-ending on one item — is the same).
- **Curify status:** **missing** as a dedicated module on either the template or example route; no
  related-product/related-example linking mechanism was found in the template page code beyond the
  generic sr-only topic chip (same gap noted in the MBTI and Education pattern docs).

### Pattern: Dense per-item spec/status information shown inline
- **What users see:** price, rating, review count, and (where relevant) shipping/personalization
  status shown directly on each card or on the product itself, not hidden behind a click.
- **Why it helps SEO:** this content usually powers `Product`/`Offer` rich-result eligibility
  (price, review count, availability).
- **Why it helps user intent:** lets a buyer compare options without navigating away.
- **Evidence pages:** MER_01 (single-product version: price/rating/stock), MER_05, MER_06 (grid version:
  price/discount/rating/reviews/shipping per card).
- **Curify status:** **not applicable in the same form.** Curify's Product/Offer-style data (price,
  stock, reviews) doesn't exist because Curify is not a storefront — this pattern is noted for
  completeness but is explicitly flagged in §7 as something not to copy literally.

## 4. Page-type differences

- **Single-SKU product detail page** (MER_01): one physical product, full spec + story + trust + related.
- **Digital product detail page** (MER_04): one digital asset pack, preview-grid + attribution + related
  — structurally closer to a Curify template/example page than any other Merch sample.
- **Marketplace / category collection page** (MER_05, MER_06): many products at once, browse/filter
  first, spec depth traded for breadth and comparison.

These three page types serve different intents (learn about one product vs. discover many), and none
of them is a "professional knowledge" page in the MBTI_05/EDU_04 sense — Merch's professional signal in
this evidence set comes from **spec + story + trust**, not from long-form editorial content.

## 5. Curify gap analysis

| Dimension | Finding |
|---|---|
| Current support | `VerticalSchema` for Merch is fully coded (7 attributes incl. `material`, `process`, `dimensions`; 3 knowledge slots incl. `cultural_background`; `schemaOrgType: "Product"`) and wired into the template page the same way as Education/MBTI (audit Q5, Q10-12) |
| Missing | Any authored content — **zero** Merch templates have populated attributes/knowledge (audit Q5, Q29); no related-product internal-linking module; no example-page rendering (audit Q13-16, applies to all 3 coded verticals identically) |
| Too generic | Merch templates today show no material/process/dimension identity — indistinguishable from any other flat template page |
| Needs vertical-specific data | `product_type`, `material`, `process`, `dimensions` attribute values, and `cultural_background` / `design_requirements` / `manufacturing_notes` prose, per template |
| Needs stronger internal linking | No related-product/related-template module confirmed anywhere in the current code |
| Needs structured data | `buildVerticalJsonLd` already maps `material` and `category` (from `product_type`) to schema.org `Product` fields (`lib/nano_seo_utils.ts:468-470`) — works today the moment content is authored, no code change needed |
| Needs professional copy | All 3 knowledge slots empty for every Merch-routed template |
| Needs trust/source/methodology signals | MER_01's "Made in USA" / nonprofit-partnership trust badges have no Curify equivalent — not necessarily applicable (Curify doesn't manufacture/ship), but the underlying idea of a short trust/provenance line is transferable |

## 6. Recommended Curify modules

- **P0 — required:**
  - Author `product_type` / `material` / `process` / `dimensions` attributes for the confirmed real
    Merch templates (see `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`) — activates the existing chip strip
    and `Product` JSON-LD immediately.
  - Author the `cultural_background` knowledge slot — this is the single highest-leverage piece of
    prose per MER_01's evidence (the "why this design" story is what differentiates a themed product
    from a generic one).
- **P1 — valuable:**
  - A related-template/related-example module surfacing sibling products in the same theme/family
    (parks, cities, IP sets), addressing the "related recommendations" pattern found on all 4 selected
    pages.
  - `design_requirements` / `manufacturing_notes` slots authored for templates where Curify's output is
    intended for physical production (print-ready spec expectations).
- **P2 — optional:**
  - Any trust/provenance micro-copy pattern (short "how this is made / sourced" line) — valuable but
    lower priority than the P0/P1 content gaps, and only meaningful once Curify has a real
    manufacturing/fulfillment story to state accurately.

## 7. What should not be copied

- **Etsy's marketplace/checkout/personalization-order infrastructure** (MER_05, MER_06) — filters,
  cart, seller reviews, and shipping logic are marketplace-specific; Curify is not a marketplace and
  should not attempt to replicate the transactional layer.
- **The "You may also like" price/rating/stock card format taken literally** (MER_01, MER_05, MER_06) —
  Curify has no price/stock/review data to show; copying the *visual card format* without the
  underlying commerce data would be misleading. Only the underlying principle (never dead-end on one
  item; surface siblings) should be adopted, not the literal Offer-style card fields.
- **getstickerpack.com's "install/download count" popularity signal** (MER_04) — an app-install metric
  with no Curify equivalent; do not fabricate a similar-looking popularity number.
- **Pinterest/low-relevance stock-photo grids** (excluded `MER_02`, `MER_03`) — MER_03 in particular
  had weak topical relevance to begin with; ranking is not itself evidence of a reusable content
  pattern.
