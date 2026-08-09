# Authoritative 326-Query Input — Provenance (Phase 0)

All inspection was read-only against sibling repositories under `/Users/baobaoli/Desktop/`.
No sibling repository was modified.

## AUTHORITATIVE CANDIDATE

**Path (public/derived release):**
`/Users/baobaoli/Desktop/visual-search-benchmark/data/326-query/queries.csv`
(plus `evaluations.csv`, `schema.json`, `provenance.json`, `google-images/`, `curify/`)

**Path (original source, inside visual-search-adhoc):**
`/Users/baobaoli/Desktop/visual-search-adhoc/docs/daily_report/7.16/easy-query-bank-v3/easy_query_bank_v2_2026-07-16.csv`
cross-joined with query IDs from
`/Users/baobaoli/Desktop/visual-search-adhoc/docs/daily_report/7.16/easy-query-v2-validation/query_input/easy_query_v2_input_with_ids.csv`

**Format:** CSV. `queries.csv` columns: `query_id, query, language, scenario, category, reason`.

**Row count:** 326 data rows (verified: `awk 'END{print NR-1}' queries.csv` → 326).

**Unique query count:** 326 (verified: unique values in the `query` column → 326, no duplicates).

**Language split:** 163 `zh` / 163 `en` (verified via column count).

**Scenario split (verified via column count):**
- `creative_merch`: 82
- `brand_business`: 82
- `marketing_ecommerce`: 82
- `education`: 80

**Schema:** Documented in `visual-search-benchmark/data/326-query/schema.json`. `queries.csv` holds
raw query bank rows (query text, language, scenario, category, free-text inclusion rationale) — it
is a raw input list, not a generated/derived output. `evaluations.csv` (652 rows = 326 × 2 run
variants) is a separate, clearly-labeled derived evaluation output layered on top of the same
`query_id`s and is not itself being treated as the query input.

**Provenance evidence:**
- `visual-search-benchmark/data/326-query/provenance.json` records exact source file paths, a
  full transformation summary, and SHA-256 hashes of both the original adhoc-repo source files and
  the public release files.
- Independently recomputed in this session:
  `shasum -a 256` on the two original files in `visual-search-adhoc` —
  `easy_query_bank_v2_2026-07-16.csv` → `c5b1368e...4a08c6`, and
  `easy_query_v2_input_with_ids.csv` → `f51bd68e...c13fa7a` —
  **both match `provenance.json` exactly.** This confirms the public 326-query CSV is a byte-faithful,
  hash-verified derivative of the original working files, not a re-typed or re-generated set.
- The originating generation report,
  `visual-search-adhoc/docs/daily_report/7.16/easy-query-bank-v3/easy_query_bank_v2_generation_report_2026-07-16.md`,
  documents the query bank's design process: it started from an older, structurally different
  328-term "seed bank" (`docs/daily_report/7.7/05_simple_head_term_seed_bank_2026-07-07.csv`,
  designed for long-tail content-generation expansion, not for simulating direct visual-search
  queries) and was rebuilt from scratch as 326 queries meant to simulate "a real user typing a
  simple, single, clear visual target into a visual-search product," organized under four scenarios
  (Creative/Merch, Brand/Business, Marketing/Ecommerce, Education) explicitly given as the task's
  classification system at the time (2026-07-16).

**Why authoritative:** This is the only 326-count query set found anywhere across curify-frontend
and all inspected sibling repositories (a repo-wide `326` grep was run against curify-frontend,
visual-search-adhoc, curify-studio, visual-search-benchmark, and several other curify-frontend-*
worktrees — see full list below). Its provenance chain is hash-verified end-to-end, its row/unique
counts match exactly, and it is not a screenshot manifest, not a re-written-query output, and not a
visualization export — it is the raw query bank plus a separately-labeled evaluation layer.

**IMPORTANT CAVEAT — terminology gap, not yet fully closed:** The source material itself labels this
the "Easy Query Benchmark v2" and describes its purpose as *search-relevance regression testing*
("模拟真实用户在视觉搜索产品中输入的...query"), not explicitly as "Curify's creative-query set for
Creative Exploration/Inspiration" in the sense Workstream C's prompt describes. The link between this
326-query set and the manager's "authoritative 326 creative-query set" is inferred from (a) the exact
count match, (b) the four-scenario taxonomy's strong overlap with 4 of the 5 Workstream B/C domains,
and (c) it being the only 326-count set in existence — not from an explicit label in the source docs
tying it to "Creative Exploration." This inference is reasonable but should be **explicitly confirmed
with the manager before Phase C1 begins**, per this task's evidence policy (inference must never be
treated as proof).

**Domain-mapping note (for future Phase C1, not resolved here):** The 4 scenarios in this set —
`creative_merch`, `brand_business`, `marketing_ecommerce`, `education` — do not have a 1:1 mapping to
the 5 Workstream B/C domains. Notably:
- `packaging` (domain 5) has **no dedicated scenario** in this query set at all.
- `brand_business` is a combined "Brand/Business" scenario, not cleanly "Brand + Logo design" (domain 4).
- `marketing_ecommerce` combines marketing and ecommerce, where domain 2 is specifically "Ecommerce design."

This is a coverage gap to flag for Phase C1, not something to silently paper over.

---

## OTHER 326 CANDIDATES REJECTED

### 1. Repo-wide "326" text mentions in curify-frontend (current worktree)

**Files:** `app/[locale]/(public)/blog/red-carpet-ai-looks/content.tsx`,
`public/data/nanobanana.json`, `public/data/blogs.json`,
`public/data/titanic-enhanced-storyboard.json`, `public/data/titanic-storyboard.json`,
`public/data/03_27_output.json`, `public/data/top_remix_prompts.json`,
`scripts/configs/jun26_new_gallery_ids.json`, and two GSC/performance CSVs under `raw/`.

**Reason rejected:** None of these are query lists. They are incidental numeric matches (e.g. "326"
appearing as a price, pixel dimension, row index, or unrelated ID inside blog content, storyboard
data, remix-prompt data, or search-console analytics exports). No file among these is a 326-row query
bank.

### 2. The older 328-term "seed bank"

**Path:** `visual-search-adhoc/docs/daily_report/7.7/05_simple_head_term_seed_bank_2026-07-07.csv`

**Reason rejected:** 328 rows, not 326. Explicitly superseded by the 326-query bank above — the
generation report for the 326-query bank documents auditing this 328-term seed bank and rebuilding
from scratch because it was designed for a different purpose (long-tail content-generation term
expansion, with abstract style/material/audience/action words) rather than simulating direct
visual-search queries. 170 of its 328 terms were marked REMOVE, 19 REPLACE, 139 KEEP_AS_REFERENCE
during that audit — it was not carried forward as-is.

### 3. "easy-query-bank-v2" (5-category Object/Merch/Education/Food/Nature version)

**Reason rejected:** Referenced by name only in the 326-query bank's generation report as a prior,
differently-classified version ("此前生成的 easy-query-bank-v2"). No corresponding directory or file
was found in `visual-search-adhoc` or any other inspected repository during this Phase 0 search — it
could not be located, so it cannot be evaluated as a candidate. Not authoritative by default (no
evidence of its existence beyond a text reference), and superseded in any case by the object of this
document.

### 4. Screenshot/manifest/evaluation files under `visual-search-benchmark/data/326-query/`

**Files:** `evaluations.csv` (652 rows), `curify/manifest.csv` / `manifest.jsonl` (326 screenshot
records), `google-images/manifest.csv` / `manifest.jsonl` (326 screenshot records).

**Reason rejected:** All three are 326-row (or 326×2-row) **derived outputs** keyed off the same
`query_id`s as `queries.csv` — relevance evaluation results and screenshot-capture manifests,
respectively — not raw query input. Per this task's explicit instruction, evaluation result files and
screenshot manifests are not to be treated as authoritative query input even when their row count
matches. `queries.csv` remains the single raw-query-input file.

---

## Repositories searched for "326" (read-only)

- `curify-frontend` (current clean worktree)
- `visual-search-adhoc`
- `curify-studio`
- `visual-search-benchmark`
- `visual-search-adhoc-zcool-creative-exploration-2026-08-07`
- `curify-frontend-brand-direction-explorer`
- `curify-studio-brand-direction-explorer`
- `brand-direction-explorer-assets`
- `brand-direction-explorer-real-runs-2026-08-06`

No repository in this list was modified.
