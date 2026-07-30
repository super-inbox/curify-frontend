# Execution Plan — Vertical Content Professionalism Research v2 (Run 2)

**research_run_id:** vertical-content-professionalism-research-v2-run2
**research_run_date:** 2026-07-30
**status of this document:** plan only — no phase below has started except Phase 0, which is what
produced this document.
**revision note:** `NEW_SEARCH_QUERY_PLAN.csv` was reset on 2026-07-30. The original 24 queries are
invalidated (`INVALID_QUERY_DIRECTION`) and replaced with 24 queries generated under a different
rule set — see `NEW_RESEARCH_SCOPE.md` §3a-3b. Phase 0 is not re-marked complete until the reset
query set clears human review.

---

## Phase 0 — Audit & Scope (this round, query plan RESET — pending re-review)

Deliverables: `CURRENT_IMPLEMENTATION_AUDIT.md`, `LEGACY_RESEARCH_INVENTORY.md`,
`NEW_RESEARCH_SCOPE.md`, `NEW_SEARCH_QUERY_PLAN.csv`, `NEW_TOP_PAGE_INPUT_TEMPLATE.csv`,
`VERTICAL_SCHEMA_GAP_ANALYSIS.md`, this file, `FILE_INVENTORY.md`.

**Human checkpoint:** required before Phase 1 starts. Reviewer confirms: the reset 24-query set in
`NEW_SEARCH_QUERY_PLAN.csv` is acceptable, the audit's factual claims match their own understanding
of the code, and the new CSV schema (`query_pattern`, `entity_or_topic_type`, `visual_content_type`,
`legacy_overlap_status`, `human_review_status`, etc.) is sufficient. Once accepted, the query set is
marked `QUERY_SET_FROZEN` and Phase 1 may begin.

---

## Phase 1 — Fresh Google Competitor Research (one vertical at a time)

**Order: MBTI → Education → Merch → Ecommerce.** Each vertical is a separate work session; do not
proceed to the next vertical without explicit human sign-off on the current one.

Per vertical:
1. Run all 6 queries from `NEW_SEARCH_QUERY_PLAN.csv` in a real browser session (incognito/logged-out
   where possible), record `google_login_state`, `search_locale`, `search_language`, `browser_mode`,
   `capture_time` for every query.
2. Record organic-only ranks in `rank_observed`; explicitly write `not observed within top N organic
   results` when Curify does not appear within the checked range — never guess a rank.
3. Screenshot the SERP (ranking evidence only) — save under a path clearly separated from internal-
   page screenshots.
4. For each selected competitor page, click through and screenshot the live site: header/hero,
   professional/knowledge module(s), lower section (FAQ/related/CTA) — per the brief's screenshot
   taxonomy (§五). Reject SERP-only, ad, paywalled, or non-loading pages as primary evidence.
5. Fill one row per query in a copy of `NEW_TOP_PAGE_INPUT_TEMPLATE.csv`.
6. Record Curify's own rank for the same query under `curify_rank_observed` /
   `curify_checked_rank_range`, with the same "not observed within top N" discipline.
7. Output for the vertical: completed CSV rows, screenshot set, exclusion list (pages considered and
   rejected, with reason), open questions/uncertain items.

**Human checkpoint:** after each vertical, before starting the next.

---

## Phase 2 — Per-Page Module Analysis

For every FINAL SELECTED page from Phase 1, tag which of the 19 module types (§十二 Phase 2 list —
`SERP_PREVIEW` through `STRUCTURED_DATA`) are actually present, using only what is visible on the
captured screenshots/page. Anything not directly confirmed is marked `NOT_CONFIRMED_FROM_PAGE` — no
inference from category norms.

**Human checkpoint:** after all 4 verticals' module analysis is complete (this phase can run across
all verticals once Phase 1 is fully done and reviewed, since it works from already-approved evidence).

---

## Phase 3 — Per-Vertical Pattern Summaries

Produce `MBTI_PAGE_PATTERN.md`, `EDUCATION_PAGE_PATTERN.md`, `MERCH_PAGE_PATTERN.md`,
`ECOMMERCE_PAGE_PATTERN.md`, each grounded in this round's Phase 1/2 evidence only (queries, pages,
module tags, screenshot paths) — every claim must cite a specific page/screenshot.

**Human checkpoint:** required before Phase 4.

---

## Phase 4 — Cross-Vertical Framework

Produce `CROSS_VERTICAL_PAGE_FRAMEWORK.md`, `VERTICAL_SCHEMA_RECOMMENDATIONS.md`,
`TEMPLATE_EXAMPLE_CONTENT_MODEL.md` — synthesizing the 4 Pattern docs into a shared visual
container + schema recommendation, addressing template-hub vs. example-spoke division of labor,
desktop/mobile layout, and how it aligns with the existing taxonomy (`lib/taxonomy.json` tier1-4) and
`VerticalPageSchema` gaps identified in `VERTICAL_SCHEMA_GAP_ANALYSIS.md`.

**Human checkpoint:** required before Phase 5.

---

## Phase 5 — Pilot Page Selection

Pull fresh GSC data (impressions/clicks/CTR/avg. position/ranking-query count) for candidate
template/example pages in the 4 verticals; select a small Pilot cohort using the criteria in the
brief §十五 Phase 5 (existing `content.sections`, stable non-seasonal traffic, clear schema mapping,
sufficient example-family size). Output `PILOT_PAGE_SELECTION.csv`, `PILOT_SELECTION_RATIONALE.md`,
`BEFORE_METRICS.csv`.

**Human checkpoint:** required before Phase 6 — this is the last gate before any code is touched.

---

## Phase 6 — Code Implementation (gated on explicit instruction, not just review)

Only after Phase 5's human checkpoint AND an explicit go-ahead: update `VerticalPageSchema` per the
gap analysis, add Ecommerce, implement `deriveExampleAttributes`, wire example-page chips/knowledge/
JSON-LD, i18n attribute labels, author English + Chinese content for the Pilot cohort, rebuild the
selected template/example pages. Scope limited to the approved Pilot cohort — no batch/site-wide
content generation.

---

## Phase 7 — QA & Monitoring

TypeScript/lint/build checks, JSON/schema validation, desktop+mobile screenshots, responsive/overflow
checks (chips wrapping, long text), internal links, canonical/hreflang, structured-data validation,
regression check on non-pilot pages and existing gallery/Generate-CTA behavior, git diff scope review,
secrets check, before/after metrics plan, Search Console measurement plan (4–6 week window).

---

## Checkpoint summary

| Phase | Human checkpoint before proceeding? |
|---|---|
| 0 → 1 | Yes |
| 1 (MBTI) → 1 (Education) | Yes |
| 1 (Education) → 1 (Merch) | Yes |
| 1 (Merch) → 1 (Ecommerce) | Yes |
| 1 (all) → 2 | Yes |
| 2 → 3 | Yes |
| 3 → 4 | Yes |
| 4 → 5 | Yes |
| 5 → 6 | Yes (explicit go-ahead, not just review) |
| 6 → 7 | Implicit — QA always follows implementation |
