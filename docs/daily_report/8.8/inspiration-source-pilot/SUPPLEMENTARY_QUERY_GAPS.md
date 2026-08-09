# Supplementary Query Gaps — C2 Notes

## Status of this document

This document is **informational only**. Nothing here:
- alters `QUERY_326_AUDIT.csv` (the authoritative 326-query source, unchanged),
- entered the C2 source-discovery pilot (only the 10 queries in
  `PILOT_QUERY_RECOMMENDATIONS.csv` were used for discovery — see
  `SOURCE_DISCOVERY_FINDINGS.md` for confirmation),
- should be read as manager-approved. Every query listed below is explicitly
  tagged **`PROPOSED_NEW_QUERY`** and requires separate review/approval before
  it could be added to any future query bank.

This restates and lightly extends the gap analysis already produced in C1's
`QUERY_COVERAGE_REPORT.md`, plus a small number of gaps observed empirically
during C2 discovery itself (i.e., cases where the *approved* pilot query
returned unusually thin or low-quality results on the discovery surfaces
tested, which is itself a signal about query specificity, not a claim about
query wording).

---

## BRAND_LOGO — thin query coverage and limited sub-intents

C1 finding: brand_logo has only 10 rows in the 326-query bank (8 KEEP / 2
MERGE), collapsing to just **4 distinct concepts**: logo, business card,
branded stationery/envelope, storefront signage. This is the thinnest of the
five target domains by row count, and the domain exists in the source bank
almost entirely as a sub-set of the original `brand_business` scenario rather
than a purpose-built "Brand + Logo" category.

**PROPOSED_NEW_QUERY** candidates to close this gap (none of these entered
the C2 pilot; all require manager review):

1. `PROPOSED_NEW_QUERY: wordmark logo` — distinct from generic "logo"; the
   pilot's V084 discovery skewed toward emblem/mascot/symbol marks (Uncle
   Joe's engraving portrait, Goufoo's organic mark) with only Design Monks
   as a clean minimal wordmark example. A dedicated wordmark-only query would
   test a narrower, high-frequency real-world sub-intent.
2. `PROPOSED_NEW_QUERY: brand style guide` / `brand guidelines document` —
   no query in the current bank targets the guideline/rulebook artifact
   itself (typography scale, clear-space rules, do/don't examples), which is
   a distinct visual format from a logo or a single collateral piece.
3. `PROPOSED_NEW_QUERY: brand mascot design` — several V084/V094 pilot
   candidates (CLIFFARD's elf, Nook's monogram) leaned toward
   character-driven brand marks, suggesting mascot-as-logo is a real,
   currently undertested sub-intent distinct from Curify's merch/figure
   domain.
4. `PROPOSED_NEW_QUERY: letterhead design` — named explicitly in C1 as
   missing; a natural third member of the logo+business-card+letterhead
   stationery trio, and distinct in composition (full-page layout vs. a
   small card).
5. `PROPOSED_NEW_QUERY: social media profile kit` / `brand cover kit` — no
   query targets the now-common deliverable of adapting a logo/identity into
   profile photo + cover image + highlight-icon sets across platforms.
6. `PROPOSED_NEW_QUERY: favicon / app icon design` — a small-format
   identity-application query with no current representative in the bank.
7. `PROPOSED_NEW_QUERY: rebrand before/after` — no query captures the
   rebrand-comparison framing, which is a distinct and popular case-study
   format (old mark vs. new mark, rationale for change) not reducible to a
   plain "logo" query.

**Empirical note from C2 discovery:** V094 ("business card") surfaced
several strong candidates that were actually broader *stationery systems*
(Jahan Ullah's 8-piece kit; GOOD Interior Studio's business
card+folder+door-hanger+gift-certificate+bag set) rather than a business
card in isolation — suggesting the domain's real-world query behavior may
already lean toward "full collateral system" rather than single-artifact
searches, which the current 4-concept query set does not test directly.

---

## PACKAGING — missing categories/formats

C1 finding: packaging has no dedicated scenario in the original benchmark
taxonomy at all; its 66 rows were reclassified from `brand_business`, and
coverage skews heavily toward food/beverage (22 rows) and cosmetic (10 rows)
packaging — about 61% of all packaging rows combined — with several major
verticals and almost all format-specific phrasing entirely absent.

**PROPOSED_NEW_QUERY** candidates to close this gap (none of these entered
the C2 pilot; all require manager review):

1. `PROPOSED_NEW_QUERY: toy packaging` / `blister pack` / `window box` —
   explicitly named as missing in C1 despite "toy"/"figure" already existing
   as merch queries; no query asks for the *packaging* of a toy, which is a
   distinct visual/structural target (window die-cuts, blister-card
   mounting) from the toy/figure itself.
2. `PROPOSED_NEW_QUERY: electronics packaging` — C1-confirmed gap; notably,
   the strongest V120 pilot candidate found organically (Edifier gift box)
   was electronics packaging, suggesting real discoverable supply exists for
   this vertical even though no approved query currently targets it.
3. `PROPOSED_NEW_QUERY: supplement / nutraceutical packaging` — C1-confirmed
   gap in a large, format-distinctive vertical (bottles, blister strips,
   sachets) adjacent to but distinct from cosmetic packaging.
4. `PROPOSED_NEW_QUERY: apparel / textile packaging` — C1-confirmed gap
   (poly bags, garment boxes, folded-shirt packaging).
5. `PROPOSED_NEW_QUERY: shipping / mailer packaging` — C1-confirmed gap in
   industrial/e-commerce-fulfillment packaging, structurally distinct from
   retail-shelf packaging.
6. `PROPOSED_NEW_QUERY: stand-up pouch` / `pump bottle` / `sachet` /
   `tube packaging` — C1 flagged that even the domain's two strong verticals
   (food/beverage, cosmetic) are covered only by generic nouns ("cosmetic
   package") rather than the format-specific terms real packaging-design
   users would type; these format-specific queries would test that gap
   directly.
7. `PROPOSED_NEW_QUERY: sustainable / eco packaging` / `kraft packaging` —
   C1-confirmed gap; notably, kraft-paper construction appeared organically
   in two different V098/V120 pilot candidates (Swerl Coffee Roasters'
   retro kraft-adjacent aesthetic references, and the Xiaohongshu campus
   gift box's kraft-paper exterior) without any query specifically seeking
   it, again suggesting real discoverable supply exists.
8. `PROPOSED_NEW_QUERY: packaging mockup` / `die-line` / `flat lay
   packaging` — C1-confirmed gap in render/presentation-format phrasing
   distinct from the packaging design itself.

**Empirical note from C2 discovery:** Both V098 and V120 pilot queries
("coffee package", "gift box") returned strong, well-documented candidates
relatively easily compared to V216 and V260 (see
`SOURCE_DISCOVERY_FINDINGS.md`), suggesting food/beverage and gift-occasion
packaging remain the domain's healthiest sub-intents even at pilot scale —
consistent with C1's finding that these two verticals already carry 61% of
the domain's existing query-bank weight. The proposed queries above target
the *other* 39% (or entirely absent) territory, not a replacement for the
strong core.

---

## Other domains (not requested for gap analysis, no proposals made)

Per task scope, this document focuses on brand_logo and packaging only, per
C1's identification of these as the two domains needing supplementary query
work "more than any of the other four domains" (packaging) and having "the
thinnest representation of the five target domains by row count" (brand_logo).
Merch, ecommerce, and education were not flagged for supplementary query
authoring in C1 and are not addressed here.
