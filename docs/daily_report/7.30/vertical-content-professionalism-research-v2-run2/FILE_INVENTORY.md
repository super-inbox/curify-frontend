# File Inventory — Phase 1 (MBTI / Education / Merch)

**research_run_id:** vertical-content-professionalism-research-v2-run2
**this document's run:** Phase 1 synthesis pass (2026-07-31) — MBTI, Education, Merch only.
Ecommerce is explicitly deferred; its rows/files below are retained as evidence but not summarized
into a Pattern this round.

This file supersedes the Phase-0-only version of `FILE_INVENTORY.md` (the 10-file index of the audit/
scope/query-planning deliverables). It now inventories **every file in this research directory**,
including the Phase-0 docs, the raw CSV, the screenshots, and the new Phase-1 synthesis output.

No file was deleted. `.DS_Store` files are macOS Finder artifacts, not research content — listed once
below and excluded from the per-file tables after that.

---

## 1. Canonical result CSV

**`COMPETITOR_RESEARCH_RESULTS_FINAL.csv` is the single canonical source of truth for this round's
selected/excluded competitor pages.** It is derived from `COMPETITOR_RESEARCH_RESULTS.csv` (the raw
evidence file — every `search_query`, `result_url`, `organic_rank`, `curify_rank_observed`, and
`page_notes` value is carried over unchanged except one correction, see `DATA_QUALITY_ISSUES.md`
item 1 for the `MBTI_06` `page_notes` fix). The FINAL file adds two things the raw file didn't have:
a resolved `selected` value (`YES`/`NO`, replacing `PENDING`) and an `internal_page_screenshot_paths`
column pointing at the actual `*_content.png` file for that row. `COMPETITOR_RESEARCH_RESULTS.csv` is
**not** overwritten and remains on disk as the raw/original evidence file.

## 2. Phase 0 documents (unchanged this round — audit/scope/planning)

| # | File | Purpose | Currently valid? | Duplicate/outdated? | Keep? |
|---|---|---|---|---|---|
| 1 | `CURRENT_IMPLEMENTATION_AUDIT.md` | Read-only code audit of `VerticalPageSchema` (34 questions, file/line evidence) | Yes — used directly as evidence for §7 (schema recommendation) and §8 (pilot picks) of this round | No | Yes |
| 2 | `VERTICAL_SCHEMA_GAP_ANALYSIS.md` | Candidate code gaps derived from the audit | Yes — used as input to the schema recommendation | No | Yes |
| 3 | `LEGACY_RESEARCH_INVENTORY.md` | Inventory of two prior (pre-this-run) research folders in `visual-search-adhoc`, blanket-marked `LEGACY_RESEARCH_DO_NOT_REUSE_AS_EVIDENCE` | Yes, as a negative reference (what NOT to reuse) | No | Yes |
| 4 | `NEW_RESEARCH_SCOPE.md` | Scope statement + query-generation methodology + reset log for the 24-query plan | Yes, historical record of how the query set was built | No | Yes |
| 5 | `EXECUTION_PLAN.md` | Phase 0–7 plan with human-checkpoint table | Partially superseded — Phase 1 (per-vertical browser research) has since been executed for MBTI/Education/Merch outside a literal per-query walkthrough of this exact document's steps; the plan's checkpoint structure is still the reference for what "done" means | No (not a duplicate; still the process reference) | Yes |
| 6 | `RESEARCH_ENVIRONMENT.md` | Run-level search environment fields (locale/language/browser mode/login state) — template was left blank | **Incomplete** — the locale/language/browser_mode/login_state/search_date fields were never filled in during the actual manual search session that produced `COMPETITOR_RESEARCH_RESULTS.csv` | No | Yes, but flagged as an open gap in `DATA_QUALITY_ISSUES.md` |
| 7 | `NEW_SEARCH_QUERY_PLAN.csv` | 24 blindly-generated candidate queries (6/vertical), `query_id` format `MBTI-01` etc. (hyphen) | **Partially superseded by what was actually searched** — see `DATA_QUALITY_ISSUES.md` item 2 for the query-set drift between this file and the actual results | Yes, partially (drifted from actual execution) | Keep as historical planning record, not as the query-of-record |
| 8 | `NEW_TOP_PAGE_INPUT_TEMPLATE.csv` | Blank 49-column data-collection template | Superseded in practice — the actual research used the simpler 9-column `COMPETITOR_RESEARCH_RESULTS.csv` schema instead of this 49-column template | Yes (superseded, never filled) | Keep as historical record of a discarded schema design |

## 3. Raw evidence CSV (this round's actual input)

| # | File | Rows | Purpose | Currently valid? | Keep? |
|---|---|---|---|---|---|
| 9 | `COMPETITOR_RESEARCH_RESULTS.csv` | 24 data rows (6 MBTI + 6 Education + 6 Merch + 6 Ecommerce) | The actual filled-in manual search results — organic rank, result title/URL, Curify's own rank, and Chinese-language `page_notes` per query. `selected` column was left as `PENDING` for every row (not yet resolved) | Yes — this is the **source evidence**; every fact in the Pattern docs traces back to a row here (or to a screenshot referenced by it) | Yes — do not overwrite, do not delete |

## 4. Phase 1 synthesis output (new this round)

| # | File | Purpose |
|---|---|---|
| 10 | `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` | **Canonical** result CSV — see §1 above |
| 11 | `DATA_QUALITY_ISSUES.md` | Documents the query-set drift, the `MBTI_06` notes bug and its fix, the blank `RESEARCH_ENVIRONMENT.md` fields, and other data-quality notes |
| 12 | `SELECTED_PAGE_EVIDENCE_INDEX.md` | Per-vertical index of the 12 selected (`YES`) pages + the 6 excluded (`NO`) pages as visual references, MBTI/Education/Merch only |
| 13 | `MBTI_COMPETITOR_PATTERN.md` | MBTI Pattern summary (scope, selected competitors, repeated patterns, page-type differences, Curify gap analysis, recommended modules, what not to copy) |
| 14 | `EDUCATION_COMPETITOR_PATTERN.md` | Same structure, Education |
| 15 | `MERCH_COMPETITOR_PATTERN.md` | Same structure, Merch |
| 16 | `VERTICAL_PAGE_COMMON_FRAMEWORK_V2.md` | Unified page framework — common/vertical-specific/conditional modules, template-vs-example division of labor |
| 17 | `VERTICAL_PAGE_SCHEMA_V2_RECOMMENDATION.md` | Audit of `lib/vertical_schema.ts` + `docs/vertical-page-schema-v1.md` against this round's findings; proposed schema additions (design only, no code changed) |
| 18 | `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md` | 1–3 candidate pilot pages per vertical, using real template slugs confirmed to exist in `public/data/nano_templates.json` |
| 19 | `VERTICAL_CONTENT_PROFESSIONALISM_PHASE1_REPORT.md` | Boss-facing executive summary and requirement-mapping report |
| 20 | `FILE_INVENTORY.md` | This file |
| 21 | `README.md` | Directory-level orientation, points to the canonical CSV and main report |

## 5. Screenshots

| Directory | Files | Type | Notes |
|---|---|---|---|
| `screenshot/MBTI/MBTI_01..06/` | 12 PNGs (`*_serp.png` + `*_content.png` per query) | SERP + internal-page pairs | Complete — 6 of 6 queries have both a SERP and a content screenshot |
| `screenshot/Education/EDU_01..06/` | 12 PNGs | SERP + internal-page pairs | Complete — 6 of 6 |
| `screenshot/Merch/MER_01..06/` | 12 PNGs | SERP + internal-page pairs | Complete — 6 of 6 |
| `screenshot/Ecommerce/ECO_01..06/` | 12 PNGs | SERP + internal-page pairs | Complete — 6 of 6, but Ecommerce is deferred (see §六 of the boss brief); retained as evidence only, not summarized into a Pattern this round |
| `screenshot/Ecommerce/关于包装的AI.png` | 1 PNG | Unlabeled stray file, not referenced by any CSV row or `query_id` | Not used as evidence anywhere in this round's docs; flagged in `DATA_QUALITY_ISSUES.md` rather than deleted |

Only `*_content.png` paths are used in `internal_page_screenshot_paths` (per the boss's instruction not
to put SERP images in that column). `*_serp.png` files remain on disk as ranking evidence but are not
cited as page-content evidence.

## 6. Non-research files

`screenshot/.DS_Store`, `screenshot/MBTI/.DS_Store`, `screenshot/Education/.DS_Store`,
`screenshot/Merch/.DS_Store`, `screenshot/Ecommerce/.DS_Store`, and the top-level `.DS_Store` — macOS
Finder metadata, not research content. Not inventoried further, not deleted.

---

## 7. Summary

- **Canonical CSV:** `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` (24 rows: 6 MBTI + 6 Education + 6 Merch +
  6 Ecommerce; `selected=YES` on 4 MBTI + 4 Education + 4 Merch + 0 Ecommerce rows).
- **Raw/original CSV (do not treat as final):** `COMPETITOR_RESEARCH_RESULTS.csv`.
- **No file was deleted or overwritten in place.** All Phase 0 planning documents remain as historical
  record even where the actual research diverged from the plan (see `DATA_QUALITY_ISSUES.md`).
