# C2 Source Discovery Findings — Inspiration Source Pilot

Covers the 10 approved pilot queries from `PILOT_QUERY_RECOMMENDATIONS.csv`
(2 per domain × 5 domains). All discovery, persistence, and validation
described here happened in this recovery session; no prior partial C2
discovery output existed on disk at session start (only the C1 audit files
were present — see final response for the recovery-audit detail).

## 1. Pilot query count

**10 of 10** approved pilot queries processed: V004, V014 (merch); V174,
V216 (ecommerce); V248, V260 (education); V084, V094 (brand_logo); V098,
V120 (packaging). No unauthorized query was substituted or added — see
`SOURCE_DISCOVERY_PROGRESS.csv` for the per-query record and
`PILOT_QUERY_RECOMMENDATIONS.csv` for the authoritative list.

## 2. Candidate count

**47 total candidates** persisted to `SOURCE_CANDIDATES.csv`, matched 1:1 by
`inspirations.jsonl` (47 lines) and by `thumbnails/` (47 files). Per query:
7 of 10 queries reached the ~5-candidate target exactly (V004, V014, V174,
V084, V094, V098, V120); 3 queries (V216, V248, V260) reached 4 candidates
each and are marked `PARTIAL` in the progress file rather than padded to 5
with weak filler — see point 4 and point 14 below for why.

## 3. Retained candidates

All 47 discovered candidates that were fetched and evidence-checked were
retained (no formal `REJECT` rows were persisted). Several additional weak
leads (0–1 appreciations, no extractable visual description, or unresolvable
Behance URLs) were identified during search but deliberately **not**
persisted, per the instruction not to retain irrelevant/weak results just to
hit a target — this is why 3 queries landed at 4 candidates instead of 5.

## 4. A/B/C/REJECT counts

| Grade | Count |
|---|---|
| A | 22 |
| B | 23 |
| C | 2 |
| REJECT | 0 (weak leads were dropped before persistence rather than recorded as REJECT) |

The 2 C-grade candidates are `ecom_v216_004` (a UGC-style video ad with
minimal extractable visual detail) and `ecom_v174_005` (a generic
freelance-solicitation Amazon-listing page with an unverified marketing
claim). No candidate was graded A purely because its host platform is
well-known — each A grade required an independently-verifiable real client,
studio, or personal site, or a distinctive stated design rationale (see
`source_quality_reason` column for the specific justification on every row).

## 5. Best-performing source types

`source_type` breakdown (see `SOURCE_CANDIDATES.csv`): 24
`designer_portfolio_project`, 9 `studio_portfolio_project`, 4
`designer_product_portfolio`, plus single instances of
`agency_self_branding_project`, `institutional_inhouse_team_project`,
`designer_own_site_project`, `studio_collaboration_project`, and others.

Qualitatively, the strongest-performing pattern was **named-designer or
named-studio case studies with a real, independently verifiable client or
business** (Nook Coffee — a real currently-operating café; Swerl Coffee
Roasters — a real award-winning roastery; Edifier — a real global
electronics brand; KakaoBank — a real Korean digital bank; UNHCR — a real UN
agency; Design Monks — a real multi-office agency). These consistently
earned grade A and supported the deepest source-expansion chains (see point
8). Generic customizable-template listings (Jahan Ullah's stationery kit,
Fallon Gerst's media-kit templates) were real and useful but capped at B —
strong specialist value without a specific documented project.

## 6. Discovery surfaces tested

- **Behance** — used for 45 of 47 candidates (via WebSearch queries into
  Behance's curated galleries, tag search, and free-text project search).
  By far the dominant surface for this pilot; Behance's search/gallery pages
  reliably yielded named designers/studios with fetchable individual project
  pages.
- **Meitu Design Studio (designkit.cn)** — 1 candidate (`ecom_v216_002`), a
  vendor-authored Chinese-language guidance article, surfaced via a
  China-specific search query for Xiaohongshu content design.
- **Designer's own portfolio site** (andreaspedersen.se) — 1 candidate's
  *canonical* source, reached by following a link from the Behance
  discovery listing (see point 7).
- **Pinterest** — searched as a discovery surface per the task's discovery
  model but did not yield a candidate that outperformed Behance results for
  any of the 10 queries in this pilot; no Pinterest URL was stored as
  canonical, consistent with the instruction not to default to Pinterest as
  canonical.
- **ZCOOL** — searched directly for the V216 sub-intent (Xiaohongshu/种草
  content) but returned template-marketplace and generic-tool pages rather
  than individual case studies with clear provenance; none were retained
  from ZCOOL in this pilot.

## 7. Canonical-source tracing success

In the large majority of cases, Behance itself was the canonical source —
the actual designer/studio's own project publication, not a re-post. One
candidate (`pack_v098_003`, Swerl Coffee Roasters) was explicitly traced
past Behance to the designer's own portfolio site
(andreaspedersen.se/work/swerlcoffeeroasters), which carried materially
richer design-rationale detail (1972 Mercedes van inspiration, Falkenberg
falcon-crest mascot, Matisse influence) than the shorter Behance listing —
`discovered_via` is recorded as Behance while `canonical_url` points to the
designer's own site, per the instruction to keep these fields distinct.

## 8. Source-expansion feasibility

13 of 47 candidates (roughly 1–2 per query, the "selected strong
candidates" called for by the task) were put through the 5-level expansion
test. Results:

| Level | Supported | Partial | Access-blocked |
|---|---|---|---|
| L1 (asset) | 13/13 | 0 | 0 |
| L2 (project page) | 13/13 | 0 | 0 |
| L3 (creator) | 10/13 | 2 | 1 |
| L4 (collection/section) | 11/13 | 2 | 0 |
| L5 (domain/subdomain) | 13/13 | 0 | 0 |

8 of 13 tested candidates reached full **Level 5** support (a single
discovered result expanding all the way to a verified real creator/business
and its broader category context). The two most convincing chains were
`pack_v098_003` (Swerl Coffee Roasters — an independently-confirmed,
award-ranked real micro-roastery) and `merch_v004_003` (RACCOON FACTORY —
a real character-brand studio active since 2017 across 10+ dated projects).
One chain hit a genuine real-world blocker: `edu_v260_002`'s linked personal
site (kotomkina.com) returned HTTP 402 Payment Required on independent
re-fetch, recorded honestly as `ACCESS_BLOCKED` at Level 3 rather than
assumed working.

## 9. Thumbnail success rate

**47/47 (100%)** — every retained candidate has an `AVAILABLE` thumbnail,
sourced from each page's own OpenGraph preview image and downloaded as a
single file per candidate (no bulk/full-portfolio downloads). No thumbnail
was fabricated; had any OpenGraph image been missing, the record would have
been marked `UNAVAILABLE` rather than substituted.

## 10. Content-understanding quality

Every `content_understanding` field is grounded in what was directly stated
or visually described on the fetched page (subject, style, composition,
materials/format, stated production technique) — nothing was inferred
beyond the source. Where a page made an unverifiable claim (e.g., the
Novara skincare "efficiency" framing, or `edu_v260_004`'s note that its
subject is the *recipient's* repost rather than the designer's own case
study), the `source_quality_reason` field flags that distinction explicitly
rather than presenting it uncritically.

## 11. Existing-data-structure compatibility

Per `EXISTING_STRUCTURE_FIELD_MAPPING.csv` (C1 output, not modified in this
session):

| C2 field | Compatibility |
|---|---|
| thumbnail | **FIT** — `asset.preview_image_url` is populated at production scale |
| title | **FIT** — `locales.<lang>.title` exists on `RawNanoImageRecord`/`ImageView` |
| tags | **PARTIAL_FIT** — `tags: string[]` exists at the raw-registry layer but is not re-exposed on the client-rendering `ImageView` type |
| domain / subdomain | **PARTIAL_FIT** — `topics`/`category` exist structurally but are not pre-aligned to the 5 target domains; would need a new mapping layer |
| source_url / canonical_url / source_domain | **NO_EXISTING_FIELD** — confirmed as the single biggest schema gap; no attribution/origin field exists anywhere in the production image/template types |
| creator_or_author | **NO_EXISTING_FIELD** |
| discovered_via | **NO_EXISTING_FIELD** — closest analog is System A's `signal_source`, a different-shaped field on video-idea records only |
| content_understanding | **PARTIAL_FIT** — `category`+`title` give a short label; no long-form description/caption field exists at the per-image level |
| human_review_status | **PARTIAL_FIT** — System A's `review_status` enum is conceptually close but exists only on video-idea cards, not on any image record in System B |

**No production code or schema was modified in this session** — this is a
research-normalization finding only, consistent with the C1 mapping.

## 12. Brand/Logo query gaps

See `SUPPLEMENTARY_QUERY_GAPS.md` for the full list. Summary: brand_logo has
only 4 distinct concepts in the 326-query bank (logo, business card,
stationery/envelope, signage); missing entirely are wordmark-specific,
brand-guideline-document, mascot, letterhead, social-profile-kit,
favicon/app-icon, and rebrand-comparison query types. All proposals are
tagged `PROPOSED_NEW_QUERY` and were not used in this pilot.

## 13. Packaging query gaps

See `SUPPLEMENTARY_QUERY_GAPS.md` for the full list. Summary: packaging has
no dedicated original scenario and skews 61% toward food/beverage+cosmetic;
missing entirely are toy, electronics, supplement/nutraceutical,
apparel/textile, and shipping/mailer packaging, plus nearly all
format-specific phrasing (pouch, tube, sachet, pump bottle) and
mockup/die-line presentation queries. Notably, two of the gap categories
(electronics packaging, kraft/eco-material packaging) appeared
**organically** among this pilot's strongest V098/V120 candidates
(Edifier, the Xiaohongshu campus gift box) despite no current query
targeting them directly — a signal that real discoverable supply exists
ahead of query-bank coverage for these verticals.

## 14. Technical blockers

- **V216 ("influencer post")**: genuinely harder to source than the other
  9 queries. Native influencer/UGC content lives on Instagram/TikTok/
  Xiaohongshu, not on portfolio platforms like Behance, so most Behance
  results in this space were either video-ad case studies with minimal
  extractable static-image description, or media-kit *templates* rather
  than real documented campaigns. Landed at 4 candidates (3B/1C).
- **V248 ("flashcard")** and **V260 ("certificate")**: both landed at 4
  candidates because a meaningful fraction of Behance search results for
  these terms were low-engagement (0–1 appreciations), generic freelance
  template listings with no extractable distinguishing detail — these were
  identified and deliberately excluded rather than padded in.
- **One access blocker**: `edu_v260_002`'s linked external site
  (kotomkina.com) returned HTTP 402 Payment Required on independent
  re-verification — recorded as `ACCESS_BLOCKED`, not silently ignored.
- **One unverifiable link**: `edu_v248_001`'s referenced Etsy shop could not
  be independently re-confirmed by a separate search in this session;
  recorded as `PARTIAL` rather than `SUPPORTED` at the creator level.
- No embeddings, vector search, or vector database of any kind was built,
  used, or considered at any point in this pilot, consistent with the
  explicit product constraint.

## 15. What should scale next

- The **Behance search → individual project page → creator profile**
  discovery chain worked reliably across all 5 domains and both languages
  (English and Chinese sub-intents) and is the strongest candidate for
  scaling to more of the 326-query bank.
- The **canonical-vs-discovered-via distinction** (proven out on
  `pack_v098_003`) is worth deliberately testing more often at scale —
  following outbound links from strong Behance candidates surfaced richer,
  independently-verifiable source material in at least one case and is
  cheap to check for high-engagement candidates.
- The **source-expansion 5-level test** is a useful, cheap-to-run signal
  for candidate strength (all 8 candidates that reached Level 5 were
  independently graded A) and could be run more broadly, not just on 1–2
  "selected strong candidates" per query.
- A lightweight **query-specificity heuristic** — flag a query as likely
  to underperform if early search results show mostly single-digit
  engagement metrics (as happened for V216/V248/V260) — would help route
  effort before spending full discovery time on a thin query.

## 16. What should NOT be built yet

- **No embeddings, vector search, image-similarity, or vector database** —
  explicitly out of scope per the product constraint, and this pilot
  confirms text/keyword-driven WebSearch + direct page fetch is sufficient
  to reach ~5 quality candidates per query without one.
- **No automated human-review approval** — every one of the 47 candidates
  is `human_review_status = PENDING`; nothing in this pilot auto-approved a
  candidate, and no workflow for doing so should be built without explicit
  design.
- **No bulk thumbnail/portfolio caching** — this pilot deliberately fetched
  one OpenGraph preview image per candidate; a production system should not
  scale this into full-resolution multi-image caching without a separate
  storage/licensing review.
- **No schema change to production Curify types** — the compatibility gaps
  in point 11 (especially the missing `source_url`/`creator`/`discovered_via`
  fields) are real and load-bearing for any future Inspiration V1 build, but
  designing and shipping that schema change is out of scope for this
  research pilot and was not attempted.
- **No expansion to the full 326-query bank** — this pilot used exactly the
  10 approved queries; scaling to more queries should be a deliberate
  follow-on decision, not an automatic next step from this pilot's results.
