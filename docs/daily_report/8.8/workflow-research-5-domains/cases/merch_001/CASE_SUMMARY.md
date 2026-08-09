# CASE_SUMMARY — merch_001

## Source
"把自己的插画做成产品：从构思到销售变现的心路历程" ("Turning My Own Illustrations Into Products: The Journey From Concept to Sale") by 安娜 (Anna), an independent illustrator/designer, published on ZCOOL (站酷), a Chinese design community platform.
URL: https://www.zcool.com.cn/article/ZMTE3OTk3Mg==.html

The article documents her self-funded, small-batch production of NUS/NTU campus-architecture illustration merchandise (postcards, phone cases, magnets, badges, mugs) across a 2018 and a 2020 round, told first-person from initial reference-gathering through post-sale operations.

## Why selected (per SELECTION RULE)
Two candidates tied at 9/10 in the B1 pass: MERCH-01 (this case) and MERCH-02 (LKK Design's Forbidden City Cat / 故宫猫 case study, https://www.lkkdesign.com/anli/anlilook/id/65.html). Both were independently re-fetched via WebFetch on 2026-08-09 to verify actual page content rather than trusting the B1 summaries.

- **Process visibility (priority 1):** MERCH-01 wins decisively. The source page is explicitly organized into 12 numbered, sequential sections (【1】 reference/conceptualization through 【12】 ongoing operations), each describing a concrete production stage. MERCH-02, on independent re-fetch, was confirmed to contain strong business narrative (brief, market research method, scale figures, symbolic rationale for the cat IP, output/SKU figures) but the extraction explicitly found "no sequential design stages, sketches, prototypes, or iteration evidence" — it reads as a business case study, not a reconstructible production sequence.
- **Evidence completeness (priority 2):** MERCH-01 provides concrete numbers throughout — throughput rates, discarded-draft counts, MOQ figures (10,000 vs. actual need of ~500), a real pricing table, named defect categories with refund handling, and delivery-channel-specific packaging rationale. MERCH-02 is comparatively evidence-thin: numbers and narrative only, no visible intermediate artifacts.
- **Professional knowledge (priority 3):** Both candidates show genuine professional knowledge (MERCH-01: MOQ economics, QC defect taxonomy, IP/trademark law; MERCH-02: crowdsourced design methodology, IP-symbolism reasoning). Roughly comparable, slight edge to MERCH-01 for specificity.
- **Source authority (priority 4):** MERCH-02 is stronger here (LKK Design is a major, established Chinese design consultancy; MERCH-01 is an individual's personal blog post). This is the only criterion favoring MERCH-02, and per the SELECTION RULE it is explicitly lower-priority than process visibility and evidence completeness.
- **Curify relevance (priority 5):** Roughly comparable — both describe an illustration/character IP being turned into a multi-SKU merchandise line.

Because priorities 1 and 2 override priority 4 per the stated rule, MERCH-01 was selected as merch_001. MERCH-03 (Pop Mart, prose journalism, B1 score 6) and MERCH-04 (Darin Michau mascot, final-gallery-only, B1 score 4, correctly REJECTed by B1) were not competitive.

## Input
On-site scouting/photography of NUS and NTU campus buildings (supplemented by Google Street View, aerial photography, and original architectural drawings where site visits were impossible), across two production rounds (2018, 2020).

## Verified workflow sequence (12 steps, all EXTERNAL_SOURCE_CONFIRMED)
1. Reference gathering & conceptualization
2. Illustration drawing pipeline (PS photo base -> sketch tracing -> line cleanup -> AI vector -> color blocking -> PS refinement -> multi-size adaptation)
3. Product design / per-format recomposition (2 weeks) — postcard/phone case/badge/magnet each required full background/scenery repositioning, not simple resize
4. Packaging design (1 week) — MOQ workaround via custom stamp + hand-folded boxes
5. Manufacturer sampling / vendor selection (3-5 vendors per product, judged on color/price/packaging spec)
6. Legal / trademark / copyright clearance (Singapore Trade Mark Act, Copyright Act, lawyer consultation; no institutional logos/names; architectural portrait-rights exclusions)
7. Pricing strategy (Singapore market-anchored, bundle/spend-tier promotions)
8. Incoming quality inspection (documented defect categories, refunds, largest source of loss)
9. Listing preparation / product photography (~100+ SKUs)
10. Marketing/promotion preparation (~200 images, delivery-team coordination) — sequenced strictly after inventory in hand
11. Logistics & delivery packaging (food-delivery channel risk mitigation via multi-layer protective packaging)
12. Ongoing operations (~1 month): order processing, customer service, inventory, fulfillment, after-sales, financial reporting

See workflow_extraction.json for full per-step detail and evidence_manifest.csv for source citations (EV-01 through EV-12, all DIRECT support, all from the single source URL).

## Outputs
Postcards, phone cases, refrigerator magnets, badges, mugs — approximately 100+ total product variants, sold at Singapore-market prices via a campus food-delivery channel.

## Professional knowledge found
- Manufacturer MOQ economics and small-batch workaround strategies (custom stamp, hand-folded packaging in lieu of factory print runs)
- Multi-vendor sampling methodology with defined comparison criteria (color/price/spec) before committing to production
- A named, specific incoming-QC defect taxonomy (dimensional tolerance, magnet displacement, glass integrity, print ghosting/misalignment) with a documented refund process
- Real IP/trademark legal constraints specific to referencing real institutions (Singapore Trade Mark Act, Copyright Act, architectural portrait rights) — not generic "be careful with IP" advice, but named statutes and concrete exclusions
- Channel-aware packaging engineering (multi-layer protection specifically because the delivery channel was food delivery, not a dedicated parcel service)
- Sequencing discipline: promotion/marketing explicitly withheld until inventory was physically in hand

## Important production/industry constraints
- Each product SKU format requires dedicated illustration recomposition, not mechanical resizing, due to differing aspect ratios
- Custom/branded packaging factory MOQs (~10,000 units) are a hard constraint against small-batch designer production (~500 units), forcing manual/DIY substitutes
- IP/trademark clearance is a real, statute-referenced constraint when merchandise references real institutions, not a formality
- QC investment directly determines profitability at small batch scale — under-investment in QC was cited as the designer's largest source of financial loss

## Evidence completeness
All 12 workflow steps are supported by DIRECT evidence quoted/paraphrased directly from the source page, independently confirmed via WebFetch on 2026-08-09 (not solely from the B1 candidate summary). The source's own explicit numbered section structure (【1】-【12】) means the step sequence is source-declared, not inferred from image ordering — the image-sequence-as-process fallacy does not apply here since no visual-only inference was used.

## Limitations
- Single first-person source; no independent corroboration of specific figures (defect rates, loss amounts, exact pricing, MOQ numbers)
- WebFetch text extraction did not retrieve embedded images; illustration-stage visual claims rest on surrounding text, not independently viewed sketches/images
- The article's numbered sections reflect the author's own narrative organization; this order may not perfectly match strict chronological production order (e.g., legal clearance appears as section 6, after sample testing in section 5, though IP clearance plausibly needed to run earlier/in parallel in practice) — flagged in workflow_extraction.json source_limitations rather than silently reordered
- Describes one independent creator's small-batch (~500 unit), single-market (Singapore) production run; scale-dependent figures (MOQ, pricing) may not generalize to other contexts
