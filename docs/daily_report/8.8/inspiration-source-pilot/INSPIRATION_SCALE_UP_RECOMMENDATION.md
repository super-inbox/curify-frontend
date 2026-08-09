# Inspiration Source Pilot — Scale-Up Recommendation

Phase C3, Part 6. Based entirely on the persisted C1/C2 evidence
(`SOURCE_CANDIDATES.csv`, `SOURCE_EXPANSION_RESULTS.csv`,
`SOURCE_DISCOVERY_FINDINGS.md`, `SOURCE_DISCOVERY_PROGRESS.csv`,
`SOURCE_QUALITY_REVIEW.csv`, `QUERY_COVERAGE_REPORT.md`) recomputed
directly from the CSVs in this session, not carried in from any prior
summary.

---

### 1. Did the 10-query pilot work?

Yes. All 10 approved pilot queries (2 per domain × 5 domains) were
processed; 47 candidates were retained; every candidate has an available
thumbnail, a resolvable canonical URL, and a content-understanding field
grounded in the actual source page. No query returned zero usable results.

### 2. What evidence says it worked or did not work?

- **Grade distribution:** 22 A / 23 B / 2 C / 0 REJECT — 96% of retained
  candidates graded B or better; no candidate was retained purely to hit a
  quota (`SOURCE_DISCOVERY_FINDINGS.md` §3-4).
- **Thumbnail success:** 47/47 (100%), all sourced from each page's own
  OpenGraph image, none fabricated.
- **Canonical-source identification:** 47/47 ACCESSIBLE
  (`access_status` in `SOURCE_CANDIDATES.csv`); 46 of 47 use their
  discovery URL directly as the canonical source (the original creator's
  own Behance publication); 1 (`pack_v098_003`) was successfully traced
  *past* the discovery surface to a materially richer canonical source on
  the creator's own site. Zero candidates had an unresolvable or blocked
  canonical URL.
- **Where it did not fully work:** 3 of 10 queries (V216, V248, V260)
  landed at 4 candidates instead of 5 because the remaining leads were
  low-engagement or generic and were deliberately excluded rather than
  padded in — itself a sign the methodology is being applied honestly, not
  a sign of pipeline failure.

### 3. Which source types produced the best Inspiration records?

`studio_portfolio_project` (6 of 9 PRIMARY_SOURCE) and
`designer_studio_project_for_named_brand` (2 of 2 PRIMARY_SOURCE), plus
every "type of one" A-graded record tied to an independently verifiable
real business or institution (`agency_self_branding_project`,
`designer_own_site_project`, `studio_collaboration_project`,
`institutional_inhouse_team_project`). See `SOURCE_TYPE_STRATEGY.md` for
the full breakdown. The common factor was never the platform — it was a
named creator/studio with an independently verifiable identity beyond the
page itself.

### 4. Which discovery surfaces were useful only as routing layers?

**Pinterest and ZCOOL.** Both were tested as discovery surfaces per the
task's discovery model; neither yielded a candidate that outperformed
Behance for any of the 10 pilot queries, and no candidate was retained
from either. This pilot cannot confirm they add value beyond Behance —
only that they did not, in this specific 10-query sample.

### 5. What percentage/count of records had usable thumbnails?

**47 / 47 (100%).**

### 6. How often could canonical-source tracing succeed?

**47 / 47 (100%)** resolved to an accessible canonical URL. 46 used the
discovery page itself; 1 was successfully traced to a richer, independently
confirmed original beyond the discovery surface. Zero blocked or
unresolvable cases at the canonical-URL level (distinct from
Level-3-creator-site access, which did hit one blocker — see Q7).

### 7. How far could source expansion usually go?

13 of 47 candidates (roughly 1-2 per query) were put through the 5-level
expansion test:

| Level | Supported | Partial | Access-blocked |
|---|---|---|---|
| L1 (asset) | 13/13 | 0 | 0 |
| L2 (project page) | 13/13 | 0 | 0 |
| L3 (creator) | 10/13 | 2 | 1 |
| L4 (collection/section) | 11/13 | 2 | 0 |
| L5 (domain/subdomain) | 13/13 | 0 | 0 |

8 of 13 tested candidates reached full Level 5 (asset all the way to a
verified real creator/business and its broader category context). One
genuine real-world blocker occurred: `edu_v260_002`'s linked personal site
returned HTTP 402 on independent re-fetch.

### 8. Which parts still need human review?

**All of it.** `human_review_status = PENDING` on all 47 records, with no
exceptions — nothing in this pilot auto-approved a candidate, and this
document does not recommend changing that. Beyond the blanket PENDING
status, 2 records specifically need a **policy** decision before a
strategic role can even be assigned (`ecom_v216_002`, a vendor-guidance
article rather than a project case study; `edu_v260_004`, a recipient's
repost of a real credential rather than the designer's own publication) —
see `SOURCE_QUALITY_REVIEW.csv` notes for both.

### 9. Should Curify immediately run all 326 queries at full scale?

**No.** Nothing in this pilot's evidence justifies that jump. The pilot
tested 10 of 326 queries (3%); extrapolating pipeline behavior, per-query
candidate yield, or grade distribution across the other 316 queries from a
10-query sample — especially across domains as differently-shaped as
merch (deep, 82 queries) and brand_logo (thin, 10 queries) — is not
supported by the data collected here.

### 10. Should query gaps be repaired first?

**Yes, for two domains specifically: brand_logo and packaging** (see
`QUERY_BANK_RECOMMENDATIONS.md`, both rated `NEEDS_SUPPLEMENT`). Both
produced the *best* source-quality results in the pilot (7/10 and 8/10
A-grade respectively) on their existing queries, but brand_logo has only 4
distinct concepts and packaging is 61% concentrated in two verticals —
there is no more untested breadth to scale into for either domain without
new queries. Merch, ecommerce, and education can scale further on their
existing query bank without a repair step first (though ecommerce and
education both have imbalances worth tracking — see Q12).

### 11. What next pilot size is justified?

A **modest, staged expansion — on the order of 20-30 queries, not 326** —
distributed to (a) test 4-6 more queries in the two domains that already
performed best (merch, and the strong-but-narrow brand_logo/packaging) to
confirm the pilot's grade distribution holds beyond 2 queries per domain,
(b) deliberately test a small number of PROPOSED_SUPPLEMENT queries in
brand_logo/packaging under human review before they're treated as real
query-bank additions, and (c) test a second discovery surface
specifically against V216-shaped (influencer/UGC) queries, since Behance
underperformed there. This is sized to answer the open questions this
pilot raised, not to front-load coverage.

### 12. Which domains should receive more queries first?

**Brand_logo and packaging**, per Q10 and `QUERY_BANK_RECOMMENDATIONS.md`
— both are breadth-constrained despite excellent demonstrated source
quality. Ecommerce (specifically non-banner/UGC sub-intents) and
education (specifically higher-ed/e-learning, entirely untested) are
second-priority: usable now but with known imbalances worth closing before
heavy scale.

### 13. Which source classes should be prioritized?

Per `SOURCE_TYPE_STRATEGY.md` Q8: named-studio/named-designer case studies
tied to an independently verifiable real client or business
(`studio_portfolio_project`, `designer_studio_project_for_named_brand`,
and the pattern behind every A-grade "type of one" record), plus routinely
checking Behance-outbound links to creator-owned sites for high-engagement
candidates (cheap, and produced the pilot's single richest record when
tried).

### 14. What should intentionally remain out of scope?

- Running all 326 queries in one pass (Q9).
- Treating any `PROPOSED_NEW_QUERY` from `SUPPLEMENTARY_QUERY_GAPS.md` or
  `QUERY_BANK_RECOMMENDATIONS.md` as approved without separate manager
  review.
- Any automated promotion of `human_review_status` from `PENDING`.
- A schema rewrite of Curify's production nano image catalog — the
  integration findings (`INSPIRATION_INTEGRATION_FINDINGS.md`) support
  additive fields only.

### 15. What should NOT be built yet?

- **No embeddings, vector search, image-similarity, or vector database** —
  confirmed unnecessary by this pilot's own evidence
  (`INSPIRATION_INTEGRATION_FINDINGS.md`, "Can V1 work WITHOUT
  embeddings?").
- **No automated human-review approval workflow** — every candidate is
  still `PENDING`; building an approval pipeline before any human has
  reviewed pilot output would be premature.
- **No bulk thumbnail/full-portfolio caching** — this pilot fetched one
  OpenGraph preview image per candidate deliberately; scaling to
  full-resolution multi-image caching needs a separate storage/licensing
  review not attempted here.
- **No production schema change** — the additive fields identified in
  `INSPIRATION_INTEGRATION_FINDINGS.md` are a recommendation for *future*
  implementation, not something this research pilot built or shipped.
- **No second-discovery-surface build-out** until the V216 gap is
  deliberately tested at small scale (Q11) — don't build broad
  multi-platform infrastructure on a single untested hypothesis.
