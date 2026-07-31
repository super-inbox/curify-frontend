LEGACY_RESEARCH_DO_NOT_REUSE_AS_EVIDENCE

# Legacy Research Inventory

**research_run_id:** N/A (this file is an inventory of *prior* runs, not a new research run)
**research_run_date:** 2026-07-30
**compiled_by_run:** vertical-content-professionalism-research-v2-run2 (Phase 0 audit)
**access_mode:** read-only (`find`, `wc`, `head`, `cut`, `python3 -c` for CSV parsing). No file in
`visual-search-adhoc` was created, renamed, moved, deleted, or modified during this inventory.

All materials listed below are marked:

> **LEGACY_RESEARCH_DO_NOT_REUSE_AS_EVIDENCE**

They may be used only for: archival awareness, defect identification, and later before/after
comparison. None of their content (queries, ranks, URLs, `selected_reason`, `manual_notes`,
screenshots, or Pattern conclusions) was copied into any file produced by this round.

---

## 1. Paths checked

| Path | Access result |
|---|---|
| `/Users/baobaoli/Desktop/visual-search-adhoc/docs/daily_report/` | Accessible (read-only) |
| `/Users/baobaoli/Desktop/visual-search-adhoc/docs/daily_report/7.29/vertical-page-seo-research/` | Accessible — found, inventoried below |
| `/Users/baobaoli/Desktop/visual-search-adhoc/docs/daily_report/7.30/vertical-page-seo-competitor-research/` | Accessible — found, inventoried below |

No path in the boss's instructions was inaccessible, so this run does not need to report an
"unable to confirm" case for directory access itself. (Individual competitor URLs referenced
*inside* the legacy files were not re-visited — that is out of scope for this audit-only phase,
see §4 below.)

---

## 2. Legacy directory 1 — `7.29/vertical-page-seo-research/`

**LEGACY_RESEARCH_DO_NOT_REUSE_AS_EVIDENCE**

| File | Purpose (as stated in the file itself) |
|---|---|
| `CURRENT_CURIFY_PAGE_AUDIT.md` | Prior round's own code audit of nano-template pages vs. `VerticalPageSchema v1`, 7 sections |
| `RESEARCH_RUBRIC.md` | Prior round's page-analysis rubric (identification, on-page SEO structure, core content modules, site architecture signals, category differentiators, assessment) — per `PROGRESS_STATUS.md`, never actually applied to a page |
| `SEARCH_QUERY_PLAN.md` | Prior round's 24 queries (4 categories × 6), one intent-slot per query: template / generator / guide / examples / printable-or-platform / commercial-use |
| `TOP_PAGE_INPUT.csv` (25 lines incl. header) | Prior round's filled-in results: 10 of 24 query rows have data (6 MBTI + 4 Education); Creative Merch and Ecommerce Content are 100% empty |
| `TOP_PAGE_INPUT_TEMPLATE.csv` (24 lines incl. header) | Blank template counterpart to the above |
| `PROGRESS_STATUS.md` | Prior round's own status snapshot — explicitly says "IN_PROGRESS," "not the final deliverable" |
| `logs/TOP_PAGE_INPUT_TEMPLATE_encoding_conversion_note.md` | Documents a `mac_roman`→UTF-8 re-encoding of the template CSV performed on copy |
| `logs/TOP_PAGE_INPUT_TEMPLATE.csv.original-mac_roman.bak` | Raw pre-conversion backup bytes |
| `screenshots/mbti/mbti-0{1..6}-page.png` (6 files) | **Google SERP screenshots**, not competitor-page screenshots — confirmed by this round via file naming and cross-referenced against the 7.30 dir's `VALIDATION_REPORT.md` (§3 below), which directly viewed two of the equivalent files and confirmed SERP content (search result list, "People also search for," pagination) |
| `screenshots/education/education-0{1..4}-page.png` (4 files) | Same SERP-only caveat, explicitly stated in the source CSV's own `manual_notes` per `PROGRESS_STATUS.md` §5 |
| `screenshots/creative-merch/`, `screenshots/ecommerce/` | Empty — 0 files in each (verified via `find`) |

### 2a. Query/page counts (7.29)

| Category | Queries planned | Queries with data | Pages FINAL SELECTED | Screenshots present |
|---|---|---|---|---|
| MBTI | 6 | 6 | 5 (1 NOT SELECTED) | 6 (SERP-only) |
| Education | 6 | 4 | 4 | 4 (SERP-only) |
| Creative Merch | 6 | 0 | 0 | 0 |
| Ecommerce Content | 6 | 0 | 0 | 0 |
| **Total** | **24** | **10** | **9** | **10** |

---

## 3. Legacy directory 2 — `7.30/vertical-page-seo-competitor-research/`

**LEGACY_RESEARCH_DO_NOT_REUSE_AS_EVIDENCE**

This is a **same-date** (2026-07-30) prior session's output, produced before this run started. It is
still legacy under the boss's instructions ("此前已经做过的搜索...全部视为旧版本") and is treated identically
to the 7.29 folder — not as a partial draft of this round.

| File | Purpose (as stated in the file itself) |
|---|---|
| `COMPETITOR_PAGE_ANALYSIS.csv` (25 lines incl. header) | Extends the 7.29 template CSV with `key_page_modules`, `vertical_attributes`, `curify_gap`, `recommended_change` columns. Join keys (`category`, `search_query`, `url`, `page_type`, `screenshot_path`) copied verbatim from the 7.29 source per this file's own `VALIDATION_REPORT.md` |
| `TOP_PAGE_INPUT_TEMPLATE.csv` (24 lines incl. header) | Same blank template as 7.29's, re-copied |
| `COMPETITOR_MODULE_MATRIX.md` | Cross-page module sequencing — **MBTI + Education only** (Merch/Ecommerce explicitly excluded, no data) |
| `CURIFY_GAP_ANALYSIS.md` | Gap analysis with explicit BLOCKED sections for Merch and Ecommerce |
| `COMMON_VERTICAL_PAGE_FRAMEWORK.md` | States its own coverage as 2 verticals, not 4, with an explicit section explaining why |
| `FOUR_VERTICAL_PAGE_SCHEMAS.md` | Schema field listing for education/mbti/merch (from code) plus culture/ecommerce (doc-only, unshipped) |
| `PILOT_RECOMMENDATIONS.md` | Tiered pilot suggestions, separating confirmed vs. BLOCKED items |
| `VALIDATION_REPORT.md` | This session's own self-audit — final status recorded as **BLOCKED** |
| `screenshots/mbti/` (6 files), `screenshots/education/` (4 files) | Re-copies of the same 7.29 SERP-only screenshots (identical counts) |
| `screenshots/creative-merch/`, `screenshots/ecommerce/` | Empty — 0 files in each |

### 3a. Query/page counts (7.30)

Identical to 7.29's underlying data — this folder is an analysis pass layered on top of the same
10-of-24 filled rows, not a new round of searching:

| Category | Queries with data | Screenshots |
|---|---|---|
| MBTI | 6 of 6 | 6 (SERP-only) |
| Education | 4 of 6 | 4 (SERP-only) |
| Creative Merch | 0 of 6 | 0 |
| Ecommerce Content | 0 of 6 | 0 |

### 3b. Self-reported defects (from the legacy `VALIDATION_REPORT.md` itself)

The prior session's own validation report already flags most of the same problems this round's
brief anticipates, which is why it is not usable as evidence:

1. All 10 available screenshots are **Google SERP screenshots**, not competitor internal-page
   screenshots — verified by the prior session directly viewing 2 of them.
2. Creative Merch and Ecommerce Content have **zero** recorded competitor data — no rank, URL,
   title, page type, or screenshot for any of the 12 combined queries.
3. 2 of 6 Education queries never got a result recorded.
4. **No Curify ranking data exists anywhere** in either legacy folder, for any query.
5. Page-module analysis for MBTI/Education in `COMPETITOR_PAGE_ANALYSIS.csv` was produced by
   directly fetching competitor URLs after the fact — not by clicking through from a fresh Google
   search — so it does not satisfy this round's requirement that screenshots/ranks come from an
   actual observed search.
6. Its own final status line: **BLOCKED**, not READY.

---

## 4. Answers to the required audit questions (§十二 of the brief)

1. **旧研究位于哪些目录** — Two: `7.29/vertical-page-seo-research/` and
   `7.30/vertical-page-seo-competitor-research/`, both under
   `/Users/baobaoli/Desktop/visual-search-adhoc/docs/daily_report/`.
2. **旧研究包含哪些文件** — See file tables in §2 and §3 above (19 files total across both dirs,
   excluding `.DS_Store`).
3. **每个文件的用途** — See "Purpose" column in §2/§3 tables.
4. **四个垂类分别完成了多少搜索词** — MBTI 6/6, Education 4/6, Creative Merch 0/6, Ecommerce
   Content 0/6 (both legacy dirs share these same counts — the 7.30 dir did not add new searches).
5. **四个垂类分别记录了多少页面** — Same as above: rows with a URL = MBTI 6, Education 4, Merch 0,
   Ecommerce 0.
6. **分别保留了多少有效竞品页面** — FINAL SELECTED per `PROGRESS_STATUS.md`: MBTI 5, Education 4,
   Merch 0, Ecommerce 0 (1 additional MBTI row marked NOT SELECTED / kept as supporting evidence).
7. **截图是 SERP 截图还是网站内部页面截图** — **All 10 screenshots in both legacy dirs are Google
   SERP screenshots.** Zero competitor internal-page screenshots exist in either legacy directory.
8. **是否记录 Curify rank** — No. Confirmed absent in both legacy dirs' own validation notes.
9. **是否存在空字段** — Yes — 14 of 24 rows in both CSVs are fully blank (Merch ×6, Ecommerce ×6,
   Education ×2).
10. **是否存在 URL 和截图路径不一致** — Not directly checked cell-by-cell in this audit-only pass
    (would require opening each URL, which is out of scope for Phase 0); flagged as unconfirmed.
11. **是否存在截图文件名和页面不一致** — Same caveat as #10 — filenames are generic
    (`<category>-NN-page.png`) and, per the legacy files' own admission, all show SERP content
    rather than a specific competitor page, so filename-to-page correspondence cannot be verified
    from the SERP screenshots at all.
12. **是否存在编码问题** — Yes, documented: `TOP_PAGE_INPUT_TEMPLATE.csv` in 7.29 was originally
    `mac_roman`-encoded (`UnicodeDecodeError` at byte offset 345) and was converted to UTF-8 on
    copy; the original bytes were preserved in `logs/*.bak`.
13. **是否存在 CSV 字段不一致** — Yes: the 7.29 `TOP_PAGE_INPUT.csv` header
    (`category,search_query,rank_observed,page_title,url,page_type,selected_reason,screenshot_path,manual_notes`)
    differs from the 7.30 `COMPETITOR_PAGE_ANALYSIS.csv` header
    (`category,search_query,url,page_type,screenshot_path,analysis_source,key_page_modules,vertical_attributes,curify_gap,recommended_change`)
    — the 7.30 file drops `rank_observed`, `page_title`, `selected_reason`, `manual_notes` and adds
    analysis-only columns instead.
14. **是否存在重复 URL** — Not checked (12 of 24 rows are blank; among the 10 filled MBTI/Education
    rows, no duplicate `search_query` value was found by a `uniq -c` pass on the 7.30 CSV, but URL
    duplication itself was not separately verified). Flagged as unconfirmed.
15. **是否存在重复搜索词** — No duplicate `search_query` values found in the 7.30 CSV via `uniq -c`
    (verified for that file only).
16. **是否存在旧 Pattern 报告** — Yes: `COMMON_VERTICAL_PAGE_FRAMEWORK.md`, `FOUR_VERTICAL_PAGE_SCHEMAS.md`,
    `COMPETITOR_MODULE_MATRIX.md` in the 7.30 dir. All three self-report as partial (2 of 4 verticals)
    and are marked LEGACY here regardless.
17. **旧 Pattern 是否有页面内部证据支持** — Partially, and only for MBTI/Education — and even that
    support came from a post-hoc direct URL fetch, not a fresh click-through from an actual Google
    search result, per the legacy `VALIDATION_REPORT.md` §1 item 2. Merch/Ecommerce Pattern content
    does not exist because no competitor pages were ever selected for those categories.
18. **哪些旧研究问题导致必须从头重做** — (a) All primary-evidence screenshots are SERP-only, not
    internal-page evidence, which this round's brief explicitly disallows as primary evidence; (b)
    Merch and Ecommerce have zero competitor data — 2 of 4 target verticals were never researched;
    (c) no Curify ranking was ever recorded; (d) Education is incomplete (4/6); (e) page-module
    analysis that does exist (MBTI/Education) was derived from an after-the-fact URL fetch rather
    than a real click-through-from-search session, so even the "supported" Pattern claims don't meet
    this round's evidence bar.
19. **哪些旧文件只能保留为历史记录** — All of them (both directories in full) — retained on disk,
    read-only, for future before/after comparison only.
20. **哪些旧文件不得用于新研究** — All of them — see the blanket marking below.

---

## 5. Blanket marking

Every file inventoried in §2 and §3 — including the CSVs, the Pattern/framework docs, the pilot
recommendations, and all 10 screenshots — is marked:

> **LEGACY_RESEARCH_DO_NOT_REUSE_AS_EVIDENCE**

No content from these files was copied into `NEW_SEARCH_QUERY_PLAN.csv`,
`NEW_TOP_PAGE_INPUT_TEMPLATE.csv`, or any other file produced by this round. The independent
search-query generation in `NEW_SEARCH_QUERY_PLAN.csv` was written before this inventory file's
§2/§3 tables were cross-checked for overlap (see that CSV's `legacy_overlap_status` column and
`NEW_RESEARCH_SCOPE.md` §4 for the overlap-check methodology and order of operations).
