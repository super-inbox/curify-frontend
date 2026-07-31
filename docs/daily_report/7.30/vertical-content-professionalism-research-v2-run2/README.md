# Vertical Content Professionalism Research v2 (Run 2)

**research_run_id:** `vertical-content-professionalism-research-v2-run2`
**Phase 1 completed:** 2026-07-31

## Purpose

Identify recurring professional page patterns from real competitor pages for Curify's vertical
templates, and turn those patterns into (a) a unified page framework, (b) a `VerticalPageSchema` v2
design recommendation, and (c) a short list of real, verified pilot pages — without changing any
product code or committing anything this round.

## Phase 1 scope

- **Completed verticals:** MBTI, Education, Merch — 6 search queries each, 6 SERP results each, 6
  internal-page click-throughs each, 4 selected representative pages each (12 selected pages total).
- **Deferred vertical:** **Ecommerce.** Explicitly out of scope this round per the brief. The existing
  6 Ecommerce search rows and screenshots are retained as historical evidence only — `selected=NO` on
  all 6 rows in the canonical CSV — and were **not** used to define any Ecommerce page pattern. Do not
  cite `ECO_01`–`ECO_06` as validated professional-page evidence; re-research Ecommerce from scratch in
  a future round.

## Authoritative files

| File | Role |
|---|---|
| **`COMPETITOR_RESEARCH_RESULTS_FINAL.csv`** | **The final, authoritative result CSV.** 24 rows, 10 columns, `selected=YES` resolved for MBTI/Education/Merch, `selected=NO` for all Ecommerce rows |
| `COMPETITOR_RESEARCH_RESULTS.csv` | Raw/original evidence file — kept unmodified as the source of truth for what was actually searched/observed; **not** the final result, do not treat its `selected=PENDING` values as current |
| `VERTICAL_CONTENT_PROFESSIONALISM_PHASE1_REPORT.md` | Main boss-facing report — executive summary, requirement mapping, gaps, next actions |
| `VERTICAL_PAGE_SCHEMA_V2_RECOMMENDATION.md` | Schema design recommendation (pseudo-code only, no source file changed) |
| `SELECTED_PAGE_EVIDENCE_INDEX.md` | Per-vertical index of every selected and excluded page with screenshot paths |
| `MBTI_COMPETITOR_PATTERN.md`, `EDUCATION_COMPETITOR_PATTERN.md`, `MERCH_COMPETITOR_PATTERN.md` | Per-vertical Pattern summaries |
| `VERTICAL_PAGE_COMMON_FRAMEWORK_V2.md` | Unified common/vertical-specific/conditional module framework |
| `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md` | 11 real, repo-verified candidate templates for future content pilots |
| `FILE_INVENTORY.md` | Full inventory of every file in this directory, what's canonical vs. historical |
| `DATA_QUALITY_ISSUES.md` | Every data-quality issue found and how each was (or wasn't) resolved |

## Evidence locations

- `screenshot/MBTI/`, `screenshot/Education/`, `screenshot/Merch/`, `screenshot/Ecommerce/` — each has
  one subfolder per `query_id` with a `*_serp.png` (ranking evidence) and `*_content.png` (internal
  page evidence). Only `*_content.png` paths are cited as `internal_page_screenshot_paths` in the final
  CSV — SERP screenshots are ranking evidence, not page-content evidence.

## Known limitations

- MBTI's actual 6th query (`MBTI comparison chart`) does not match the originally planned 6th query
  (`mbti jude bellingham`) — see `DATA_QUALITY_ISSUES.md` item 2. Not re-searched this round.
- `RESEARCH_ENVIRONMENT.md`'s locale/language/browser-mode/login-state fields were never filled in for
  the search session that produced the raw CSV — the exact search environment is not verifiable.
- Pilot GSC signal figures (`PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`) are carried over from the design
  doc's 2026-07-28 mining pass, not freshly pulled this round — re-pull before implementation.
- Ecommerce has zero validated pattern evidence — see "Deferred vertical" above.

## Next step

Review `VERTICAL_CONTENT_PROFESSIONALISM_PHASE1_REPORT.md` § Next actions. No product code, schema
source file, or `nano.json` content was modified this round; nothing was committed or pushed.
