# New Research Scope — Vertical Content Professionalism Research v2 (Run 2)

**research_run_id:** vertical-content-professionalism-research-v2-run2
**research_run_date:** 2026-07-30
**phase:** 0 — audit, scope, and query planning only (no browser research executed)
**revision:** query-plan reset (this document supersedes the query-generation section of the prior
revision; all 24 prior queries are invalidated — see §3a)

---

## 1. Objective

Reset and re-run competitor research for 4 Curify verticals — MBTI, Education, Merch, Ecommerce
Content — from zero, to identify recurring professional page patterns (information architecture,
domain-knowledge modules, structured attributes) that Curify's flat `title → examples → Generate`
template/example pages currently lack. Output feeds a unified visual container design, an updated
`VerticalPageSchema`, and eventually a small Pilot rebuild — none of which happens in this phase.

## 2. What this phase actually produced

1. `CURRENT_IMPLEMENTATION_AUDIT.md` — real-code state of `VerticalPageSchema` (unchanged this
   revision).
2. `LEGACY_RESEARCH_INVENTORY.md` — inventory of the two prior research folders in
   `visual-search-adhoc` (unchanged this revision).
3. `NEW_SEARCH_QUERY_PLAN.csv` — **reset**. 24 candidate queries (6 per vertical) generated under a
   new set of rules that removes the forced 6-intent-category requirement and bans `what is` / `how
   to` / `buy` / `hire` / `A vs B` / `which is better` / full-question query forms. Described in §3-4
   below.
4. `NEW_TOP_PAGE_INPUT_TEMPLATE.csv` — blank data-collection template for Phase 1 (unchanged).
5. `VERTICAL_SCHEMA_GAP_ANALYSIS.md`, `EXECUTION_PLAN.md`, `FILE_INVENTORY.md`.

## 3a. Reset log — why the prior 24 queries were invalidated

The prior query set leaned on `what is` / `how to` / `buy` / `hire` / `A vs B` / `which is better` /
scoring-method / requirements-explained phrasing, driven by a forced requirement to hit 6 fixed
search-intent categories (informational, professional/domain knowledge, creation, commercial,
comparison, technical/specification) once per vertical. That 6-intent rule was never a requirement
from the business owner — it was invented in the prior round and produced generic-article,
purchase-page, and service-marketplace queries that don't represent what a visual-content template
page actually competes for. All 24 prior queries are marked `INVALID_QUERY_DIRECTION` and are not
reused, synonym-swapped, reordered, or otherwise carried forward in any form. The 6-intent-category
rule itself is also retired — this revision does not require or track intent coverage per vertical.

The business owner's brief instead specifies: short, concrete, entity/topic-anchored queries (their
example: `mbti jude bellingham`) that plausibly reach a real, well-built page — not full questions,
not purchase/service queries, not generic definitional queries.

## 3b. Query generation methodology (this revision)

Per the brief, new queries must be generated *before* any old query or Curify inventory is used as an
input, using a process demonstrably blind to both. This revision used a **freshly-spawned subagent
with zero file/tool access** (`general-purpose` agent type, explicitly instructed not to call any
tool — verified after the fact: `tool_uses: 0` in its run metadata, i.e. it made no Read/Grep/Bash/
WebSearch/Glob calls of any kind). That subagent received only:

- the 4 vertical names (MBTI, Education, Merch, Ecommerce Content);
- the business owner's example query, `mbti jude bellingham`, framed as a representative pattern
  (specific entity + vertical word, not a full question);
- one sentence of product context ("a visual content / image creation website");
- the query-form rules from the brief (preferred structures: person/entity + vertical, franchise +
  vertical, type + visual format, level + subject + visual format, theme + product type, attribute +
  product type, etc.; banned primary forms: `what is`, `how to`, `why`, `buy`, `hire`, `which is
  better`, `A vs B`, full questions, service-purchase queries, product-purchase queries, industry-
  definition queries, testing-methodology queries).

It had no access to this conversation, this repository, `visual-search-adhoc`, Curify's template/
example data, `nano.json`, GSC data, or the prior `NEW_SEARCH_QUERY_PLAN.csv`. Its raw output
(24 queries, 6 per vertical, with per-query rationale and expected page/module notes) was reformatted
into the CSV schema below **without altering the query strings, entities, or visual-format choices**.

**Disclosed limitation:** the orchestrating agent (this document's author) *had already read* the
prior 24-query CSV earlier in this same session, in order to identify it for invalidation and to
understand the old CSV's column schema. The orchestrating agent did not feed any of that content into
the blind subagent's prompt, and the blind subagent's `tool_uses: 0` confirms it read nothing from
disk. The overlap-tagging step (§5) was performed by the orchestrating agent — which had seen the
legacy queries — strictly as a post-hoc, read-only comparison, per the brief's allowance for this
role. No legacy query text, URL, rank, or screenshot was fed back into query generation.

## 4. Query fields (new schema)

Each row in `NEW_SEARCH_QUERY_PLAN.csv` now carries: `category`, `query_id`, `search_query`,
`query_pattern`, `entity_or_topic_type`, `visual_content_type`, `reason_for_selection`,
`expected_competitor_page_type`, `expected_professional_modules`, `research_status`,
`generation_method`, `legacy_overlap_status`, `human_review_status`. No row contains a real rank,
competitor URL, screenshot path, Curify template slug, Curify example mapping, or GSC data — all of
that is out of scope until Phase 1+ (see `EXECUTION_PLAN.md`).

`research_status` is `NOT_STARTED` for all 24 rows. `generation_method` is
`blind_independent_generation` for all 24 rows. `human_review_status` is `PENDING` for all 24 rows.

## 5. Overlap outcome (read-only, post-hoc)

0 of 24 new queries are exact or near-identical duplicates of a legacy query — `EXACT_OVERLAP` does
not appear anywhere in the new CSV. 12 of 24 share a format or product keyword with a legacy query in
the same vertical (e.g. both sets reference "sticker", "worksheet", "vocabulary flashcards", "product
photo") but differ in entity, specificity, and framing — tagged `PARTIAL_SEMANTIC_OVERLAP`. 12 of 24
are in a direction the legacy plan never touched at all (e.g. a specific footballer's MBTI, a Naruto
character chart, a national-park sticker, a packaging-design query) — tagged `NEW_DIRECTION`. No
overlap, of either kind, caused any legacy result, URL, rank, or screenshot to be inherited — overlap
tags describe topical proximity only.

## 6. Explicitly out of scope this phase

No Google searches, no browser automation, no screenshots, no product code changes, no schema/
`nano.json`/template/example page edits, no reading of Curify template/example inventory or GSC data,
no Pilot work, no commit/push/PR, no writes to `visual-search-adhoc`.

## 7. Next single step

Human review of the 24 candidate queries in `NEW_SEARCH_QUERY_PLAN.csv`. Once reviewed and confirmed,
the query set is marked `QUERY_SET_FROZEN` (a manual status change, not automated by this document).
Only after that may Phase 1 (fresh Google search, MBTI first) begin, per `EXECUTION_PLAN.md`.
