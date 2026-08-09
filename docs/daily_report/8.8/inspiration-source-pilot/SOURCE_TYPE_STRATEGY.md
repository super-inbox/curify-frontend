# Source-Type Strategy — C3

Phase C3, Part 2. Grouped by the actual `source_type` values present in
`SOURCE_CANDIDATES.csv`/`SOURCE_QUALITY_REVIEW.csv` (47 retained candidates
from the 10-query C2 pilot). No source class below was invented — every
type listed here is a value that actually appears in the persisted C2
records. Counts independently recomputed from `SOURCE_QUALITY_REVIEW.csv`
in this session.

---

## Source-type breakdown

| source_type | candidate_count | A | B | C | traceability | thumbnail_reliability | creator_attribution_quality | content_depth | expansion_success | technical_access_issues | recommended_role |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `designer_portfolio_project` | 24 | 10 | 13 | 1 | 24/24 DIRECT (canonical=source), 100% ACCESSIBLE | 24/24 AVAILABLE | Named individual in every row; verified external presence (site/social) in ~half | LOW–HIGH, wide spread — single final render up to full process documentation | 7 tested; 5 reached L5, 1 reached L4, 1 blocked at L3 (HTTP 402) | 1 access block (creator's own external site, not the Behance page itself) | Mixed PRIMARY/SECONDARY — grade by grade, not as a block |
| `studio_portfolio_project` | 9 | 6 | 3 | 0 | 9/9 DIRECT, 100% ACCESSIBLE | 9/9 AVAILABLE | Named studio (2+ people) in every row; social presence common | MEDIUM–HIGH — several show end-to-end deliverable sets | 1 tested (L5 supported) | None | Strongest average grade of any multi-instance type — mostly PRIMARY |
| `designer_product_portfolio` | 4 | 0 | 4 | 0 | 4/4 DIRECT, 100% ACCESSIBLE | 4/4 AVAILABLE | Named designer/studio selling a real product (Etsy/GraphicRiver) | LOW–MEDIUM — generic, customizable, or template-oriented by nature | 2 tested; both PARTIAL (creator-level link not independently re-confirmed) | 0 hard blocks, but 2/2 tested had unconfirmable creator-level claims | SECONDARY_SOURCE — real but capped below primary by template-ness |
| `designer_studio_project_for_named_brand` | 2 | 2 | 0 | 0 | 2/2 DIRECT, 100% ACCESSIBLE | 2/2 AVAILABLE | Named studio(s) + a real, independently verifiable named brand client | HIGH — both show structural/material production detail | 1 tested (L5 supported — Edifier) | None | PRIMARY_SOURCE — small n but the strongest client-authority pattern found |
| `agency_self_branding_project` | 1 | 1 | 0 | 0 | DIRECT, ACCESSIBLE | AVAILABLE | Named, independently-verified fully operational agency | HIGH | Tested, L5 supported | None | PRIMARY_SOURCE |
| `designer_own_site_project` | 1 | 1 | 0 | 0 | INDIRECT (canonical ≠ discovery URL, by design) | AVAILABLE | Independently verified real, award-recognized business | HIGH — richest single case study in the whole pilot | Tested, L5 supported (strongest chain in the pilot) | None | PRIMARY_SOURCE |
| `studio_collaboration_project` | 1 | 1 | 0 | 0 | DIRECT, ACCESSIBLE | AVAILABLE | Two named studios, extensive social presence | HIGH — cross-touchpoint (packaging + digital) | Not tested | None | PRIMARY_SOURCE |
| `institutional_inhouse_team_project` | 1 | 1 | 0 | 0 | DIRECT, ACCESSIBLE | AVAILABLE | Named in-house team at a real, well-known institution (KakaoBank) | MEDIUM-HIGH | Not tested | None | PRIMARY_SOURCE |
| `designer_agency_collab_project` | 1 | 0 | 1 | 0 | DIRECT, ACCESSIBLE | AVAILABLE | Named designer + named agency, fictional/conceptual client | MEDIUM | Not tested | None | SECONDARY_SOURCE |
| `freelance_service_portfolio` | 1 | 0 | 0 | 1 | DIRECT, ACCESSIBLE | AVAILABLE | Named individual, unverified marketing claim, solicitation framing | LOW | Not tested | None | DO_NOT_SCALE |
| `vendor_guidance_article` | 1 | 0 | 1 | 0 | DIRECT, ACCESSIBLE | AVAILABLE | Real, identifiable company (Meitu), but editorial/guidance content not a single case study | MEDIUM — reusable specs, no worked example | Not tested | None (access is fine; the *shape* of the content is the open question) | NEEDS_HUMAN_REVIEW — different kind of source, see Q1 below |
| `recipient_shared_real_credential` | 1 | 0 | 1 | 0 | DIRECT, ACCESSIBLE | AVAILABLE | Real issuer (Anthropic), but poster is the recipient, not the designer | LOW | Not tested | None | NEEDS_HUMAN_REVIEW — see Q1 below |

**Total: 47** (10 + 6 + 1 + 8 grouped instances of the 12 types above = 47; reconciles with `SOURCE_QUALITY_REVIEW.csv`).

---

## Answers to the 8 required questions

### 1. Which source types performed best?

By concentration of `PRIMARY_SOURCE` grading and clean expansion results:
**`studio_portfolio_project`** (6 of 9 PRIMARY, 0 grade C) and
**`designer_studio_project_for_named_brand`** (2 of 2 PRIMARY, both tied to
independently-verifiable real client brands) performed best as *types*.
Individually, the single strongest records were the five "type of one"
rows — `agency_self_branding_project`, `designer_own_site_project`,
`studio_collaboration_project`, `institutional_inhouse_team_project` — each
graded A with a real, independently verifiable business/institution behind
it. The common thread across all of these is not the platform (all but one
were discovered on Behance) but **a named studio/agency/institution with an
independently verifiable identity beyond the page itself** — see the
cross-domain finding in point 7.

### 2. Which source types should Curify treat as discovery-only?

**None of the 47 retained candidates were classified `DISCOVERY_ONLY`** in
`SOURCE_QUALITY_REVIEW.csv` — every retained record was either a real
professional publication worth scaling at some tier (`PRIMARY_SOURCE`/
`SECONDARY_SOURCE`), unsuitable for scaling (`DO_NOT_SCALE`), or a
genuinely ambiguous type needing a policy decision
(`NEEDS_HUMAN_REVIEW`). The actual discovery-only *surfaces* found in this
pilot were **Pinterest and ZCOOL** — both were searched as discovery
surfaces per the task's discovery model, but neither yielded a candidate
strong enough to retain for any of the 10 pilot queries (`SOURCE_DISCOVERY_FINDINGS.md`,
§6). That is the honest finding: this pilot demonstrates Pinterest/ZCOOL as
routing layers *in principle*, not as a source that produced any of the 47
records — because in this pilot, Behance itself supplied the
professional-grade candidates before a Pinterest/ZCOOL hop was ever needed.

### 3. When is Behance itself a valid canonical source?

In 45 of 47 candidates (all but `pack_v098_003`), Behance **is** the
canonical source — because the page *is* the creator's or studio's own
original publication of their own work, not a re-post or aggregation of
someone else's content. The rule that held throughout this pilot:
Behance is a valid canonical source whenever the named creator/studio on
the page is verifiably the work's author (confirmed either by the page's
own stated authorship plus reasonable internal consistency, or by
independent verification of the creator's identity/portfolio). It stops
being sufficient as a canonical source only when a richer, more
authoritative version of the same case study exists elsewhere under the
same creator's control (see Q4).

### 4. When should Curify follow beyond Behance to a creator/studio website?

The one tested case in this pilot (`pack_v098_003`, Swerl Coffee Roasters)
shows the pattern clearly: follow beyond Behance when a high-engagement or
otherwise strong Behance candidate **links out** to the creator's own
domain, and that domain is confirmed live. In that case the designer's own
site carried materially richer design-rationale detail (1972 Mercedes van
inspiration, the Falkenberg falcon-crest mascot, a stated Matisse
influence) that the shorter Behance listing omitted. This was cheap to
check (one outbound link, one fetch) and worth doing routinely for
high-engagement candidates, per `SOURCE_DISCOVERY_FINDINGS.md` §15 — but it
is not universally beneficial: `edu_v260_002`'s outbound link
(kotomkina.com) returned HTTP 402 on independent re-fetch, so the
follow-the-link step must degrade gracefully (keep the Behance canonical,
note the external site as currently inaccessible) rather than assume
success.

### 5. How did ZCOOL compare where present?

ZCOOL was searched directly for the V216 (influencer/种草 content)
sub-intent but **returned template-marketplace and generic-tool pages
rather than individual case studies with clear provenance; none were
retained from ZCOOL in this pilot** (`SOURCE_DISCOVERY_FINDINGS.md` §6).
No ZCOOL-sourced record exists anywhere in the 47 retained candidates, so
no quality/traceability/expansion comparison against Behance can be made
from this pilot's evidence — this is a **data gap**, not a finding that
ZCOOL underperforms Behance in general. The one Chinese-language source
that *was* retained (`ecom_v216_002`, designkit.cn) was found via a
station-specific WebSearch, not via ZCOOL directly.

### 6. Are original studio/creator sites worth prioritizing despite harder access?

On the one fully-worked example in this pilot, yes: `pack_v098_003`
produced the richest single case study of the entire 47 and its own
commerce site (swerl.se), social channels, and a municipal tourism listing
were all independently confirmable — a real, currently operating,
award-ranked business. But the pilot also shows the real cost: `edu_v260_002`'s
creator-owned site was inaccessible (HTTP 402) on the very next
verification attempt, meaning a strategy that *requires* the creator-owned
site would have failed for that candidate even though the underlying
designer and Behance case study are legitimate and accessible. **Recommendation:**
treat creator/studio own-sites as an enrichment step to attempt
opportunistically on strong candidates (per Q4), not a hard requirement —
the discovery-platform page should remain the fallback canonical source
when the creator's own site is unavailable.

### 7. What risks exist if Curify relies too heavily on a single platform?

45 of 47 retained candidates (96%) were discovered via Behance. This pilot
did not stress-test platform diversity because Behance reliably produced
enough quality candidates for every query it was tried against — but that
is itself the risk signal: **the pilot's own methodology concentrated
almost entirely on one platform**, so this result cannot distinguish
"Behance is uniquely strong for these domains" from "Behance is the only
surface this pilot searched thoroughly." Concrete risks of continuing that
concentration at scale: (a) content-diversity risk — one platform's
editorial/curation biases (skews toward Western/design-agency-style
portfolios) shape what Curify's whole Inspiration surface looks like; (b)
availability risk — a ToS change, rate limit, or access restriction on a
single platform would stall the entire acquisition pipeline; (c) coverage
risk — V216 (influencer/UGC content) already showed Behance's blind spot
directly: native UGC content lives on Instagram/TikTok/Xiaohongshu, not
portfolio platforms, so Behance-only sourcing will systematically
under-serve that sub-intent no matter how much query volume is thrown at
it.

### 8. Which source types should be prioritized in the next acquisition pilot?

In priority order, based on this pilot's actual evidence:
1. **`studio_portfolio_project` and `designer_studio_project_for_named_brand`** —
   highest PRIMARY-grade concentration and cleanest traceability.
2. **Named-creator/named-studio + independently-verifiable real client**
   pattern generally (spans multiple `source_type` labels above) — this,
   not the platform or the type label, was the actual common factor behind
   every A-grade, Level-5-expansion candidate.
3. **The Behance-outbound-link-to-creator-site check** (Q4) — cheap, and
   the one time it was tried it produced the pilot's single richest
   record.
4. Deliberately **test a second discovery platform for V216-shaped queries**
   (influencer/UGC/social-commerce content) before scaling that sub-intent
   further on Behance alone, since this pilot's evidence says Behance
   under-serves it.
5. Resolve the two `NEEDS_HUMAN_REVIEW` types
   (`vendor_guidance_article`, `recipient_shared_real_credential`) as a
   policy question before they recur at scale — see
   `INSPIRATION_INTEGRATION_FINDINGS.md` and `SOURCE_QUALITY_REVIEW.csv`
   notes for the specific ambiguity in each.
