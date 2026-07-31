# Data Quality Issues — Phase 1 (MBTI / Education / Merch)

**research_run_id:** vertical-content-professionalism-research-v2-run2
**scope:** issues found while producing `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` from
`COMPETITOR_RESEARCH_RESULTS.csv`. Nothing below was silently fixed without being logged here; where
evidence was insufficient to fix something, it is left as-is and marked `EVIDENCE_INSUFFICIENT`.

---

## 1. `MBTI_06` `page_notes` were copy-pasted from `MBTI_05` — FIXED

`MBTI_05` (`search_query = "MBTI comparison chart"`, url `jobcannon.io/compatibility/mbti`) and
`MBTI_06` (`search_query = "16 personality types infographic"`, url
`pinterest.com/ideas/16-personality-types-infographic/...`) are two different pages. In the raw
`COMPETITOR_RESEARCH_RESULTS.csv`, `MBTI_06`'s `page_notes` field described the *wrong* page — it
repeated MBTI_05's content almost verbatim ("MBTI compatibility 定义、16×16 全类型配对矩阵...Top 10
compatible pairs...FAQ"), which does not match a Pinterest image-collection page at all.

**Fix applied:** re-viewed `screenshot/MBTI/MBTI_06/MBTI_06_content.png` directly and rewrote
`MBTI_06`'s `page_notes` in `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` to describe what is actually on
that screenshot — a Pinterest "Explore" image-waterfall page (keyword title + one-line description,
a large grid of infographic images from different source sites, "Explore related boards," and
"Related Interests" at the bottom). No compatibility matrix, no FAQ, and no unified text explanation
are present on this page. This does not change `MBTI_06`'s `selected=NO` status — it was already
correctly excluded as a visual-reference-only sample; only the *description* of why was wrong.

## 2. Query-set drift between `NEW_SEARCH_QUERY_PLAN.csv` and the actual results CSV — NOTED, NOT FIXED

`NEW_SEARCH_QUERY_PLAN.csv` (Phase 0's frozen query plan, `query_id` format `MBTI-01`…`MBTI-06` with a
hyphen) and `COMPETITOR_RESEARCH_RESULTS.csv` / `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` (`query_id`
format `MBTI_01`…`MBTI_06` with an underscore) do not contain the same six MBTI queries:

| Plan (`MBTI-0N`) | Actual result (`MBTI_0N`) |
|---|---|
| `mbti jude bellingham` | *(not present in results — dropped)* |
| `naruto characters mbti chart` | `naruto characters mbti chart` |
| `infj personality poster` | `infj personality poster` |
| `enfp cognitive functions chart` | `enfp cognitive functions chart` |
| `taylor swift mbti` | `taylor swift mbti` |
| `16 personality types infographic` | `MBTI comparison chart` *(not in the plan)* → shifted `16 personality types infographic` to `MBTI_06` |

Education and Merch query sets match their plans 1:1 (`EDU-01`…`EDU-06` and `MERCH-01`…`MERCH-06` line
up with `EDU_01`…`EDU_06` / `MER_01`…`MER_06` by search string). Only MBTI drifted: the business
owner's own example query (`mbti jude bellingham`) was never actually searched, and an unplanned query
(`MBTI comparison chart`) was substituted in. This round did not re-run `mbti jude bellingham` (the
brief prohibits new Google searches this round) — it is flagged here rather than silently reconciled.
`COMPETITOR_RESEARCH_RESULTS_FINAL.csv` is built from the **actual results**, which is the only place
real ranks/URLs/screenshots exist, so this is the correct source of truth going forward; the query
*plan* document is retained only as a historical record (see `FILE_INVENTORY.md` §2).

**Action for a future round:** decide whether `mbti jude bellingham` should be searched to complete the
originally-planned set, or whether the substituted `MBTI comparison chart` query is accepted as the
final 6th MBTI query. Not decided in this round.

## 3. `RESEARCH_ENVIRONMENT.md` fields were never filled in — NOTED, NOT FIXED

`search_locale`, `search_language`, `browser_mode`, `google_login_state`, and `search_date` in
`RESEARCH_ENVIRONMENT.md` are all still placeholder text (`_(not yet set...)_`). The manual search
session that produced `COMPETITOR_RESEARCH_RESULTS.csv` did not record these values at the time. This
round did not re-run any search, so these fields cannot be filled retroactively without guessing —
left blank per the brief's "leave blank rather than guess" rule. This means the exact search
environment (device/locale/logged-in state) behind the current results is **not verifiable** from the
research directory alone.

## 4. `MER_01` URL check — VERIFIED, NO ISSUE FOUND

Checked per the boss's explicit instruction ("MER_01 不得使用 Google 搜索 URL"). `MER_01`'s
`result_url` is `https://shop.americasnationalparks.org/products/yellowstone-national-park-triple-decal-1?srsltid=...` —
a real merchant product-detail URL, not a `google.com/search` URL. Confirmed by directly viewing
`screenshot/Merch/MER_01/MER_01_content.png`, which shows the actual America's National Parks product
page (title, price, reviews, "Why this abbreviation?" copy, product details, related products,
customer reviews) — consistent with the existing `page_notes`. No fix needed.

## 5. Stray unlabeled screenshot in `Ecommerce/` — NOTED, NOT USED AS EVIDENCE

`screenshot/Ecommerce/关于包装的AI.png` is a Chinese-named file with no corresponding `query_id` in
either CSV and no reference from any row's `internal_page_screenshot_paths`. Not deleted (files are
not removed per instructions), but explicitly **not** used as evidence in any Pattern or index
document this round.

## 6. `curify_rank_observed` field mixes two different kinds of content — NOTED, NOT FIXED

Some rows (`MBTI_01`) record a specific observed ranking fact ("Instagram @curify.ai 排名 8；
curify-ai.com 官网在 page 4"); most other rows record only the fixed phrase "not found in first 5
pages." This is inconsistent granularity (one row reports an actual observed position for a
Curify-adjacent account, the rest report only a negative result), inherited unchanged from the raw
CSV. Left as-is — reformatting this field was not requested and doing so would risk altering evidence
text. Flagged so it is not mistaken for a uniform, directly-comparable ranking signal across rows.

## 7. Encoding / column-count check — NO ISSUES FOUND

`COMPETITOR_RESEARCH_RESULTS_FINAL.csv` was validated programmatically: 24 data rows, 10 columns on
every row (no ragged rows), all 24 `query_id` values unique, plain UTF-8 (no BOM — the raw source file
had a UTF-8 BOM which is not carried into the FINAL file), no missing `result_url` or `result_title`
values, no `google.com/search` URLs in any row.

---

## Summary of fixes actually applied to the canonical CSV

1. `MBTI_06` `page_notes` rewritten to match its actual screenshot (item 1).
2. `selected` column resolved from `PENDING` to the boss-confirmed `YES`/`NO` values for MBTI/
   Education/Merch, and to `NO` for all 6 Ecommerce rows (deferred, not evaluated this round).
3. `internal_page_screenshot_paths` column added (did not exist in the raw CSV).

Everything else in `DATA_QUALITY_ISSUES.md` above is a **flagged, unresolved** item — carried forward
for a future round rather than guessed at in this one.
