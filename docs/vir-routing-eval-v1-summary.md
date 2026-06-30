# Visual Intent Routing / Template Retrieval Eval — v1 Summary

**Date:** 2026-06-25 (KB try-out added 2026-06-26) · **Branch:** `pr-intern` (branched off `jwang/vercel`) · **Status:** Path A (offline) **and** Path B (live gpt-4o-mini) + union all scored; Option D (KB-enriched matcher) prototyped + tried locally (§3.5). Remaining: human review of the gold; per-query targeted KB injection.

**Goal.** First executable version of the routing eval from `docs/eval-framework-visual-intent-routing-2026-06-15.md` (P1 / Layer 1 — Template Routing Accuracy): a labeled gold set + a baseline **top-1 / top-3 routing accuracy** for the current template-recall layer, scoring the two recall paths separately:
- **Path A** — keyword/alias retrieval (the `/search` scorer). Offline, no API key.
- **Path B** — the "Generate xxx yourself" LLM matcher (`lib/searchTemplateMatch.ts`, gpt-4o-mini). Needs a key.

All work reads only local JSON (no production DB), touches no production config, and leaks no API key.

---

## 1. Build the template-capability KB (`scripts/configs/template_capability_kb.json`)

`scripts/build_template_capability_kb.cjs` aggregates, per `allow_generation=true` template, its static metadata (description / params / topics) **plus capability evidence mined from its real inspirations (examples)**: the actual param values used, tags, search aliases, and topics.

**Why this matters:** a template's real generative range is broader than its name/description. Example — `template-celebrity-movie-group-poster` is described as a "celebrity/movie poster collage", but its 85 examples span NBA legends, BLACKPINK/BTS, anime squads, and World Cup posters (single free-text param `star_movie_group`). Labeling ground truth from descriptions alone would be wrong; the examples reveal what the template can actually generate.

- Output: **227 generatable templates, 2,804 examples attributed.**
- Pure over local JSON. Re-runnable: `node scripts/build_template_capability_kb.cjs`.
- Lookup aid for review: `node scripts/kb_lookup.cjs <template-id>` prints one template's real capability evidence.

---

## 2. Generate the routing gold set with Claude (`scripts/configs/vir_routing_gold.json`)

Queries = the **58-query core eval set** (`docs/search-eval-set.md`). For each query, Claude annotated ground truth **using the capability KB + the human-authored eval notes** (not the template name): `acceptable_template_ids` (a SET — handles multi-valid queries), `primary_template_id`, `ambiguity` (low/medium/high), `canonical_slots`, `rationale`, `evidence`, and `near_miss_template_ids`.

Annotation rules applied: a **subject gate** (reject a template whose subject is disjoint from the query even if the layout matches); and for queries with no honest route, `acceptable_template_ids = []` (an empty set is a valid "no route" gold), with adjacent-but-wrong templates moved to `near_miss_template_ids`.

| Dimension | Composition |
|---|---|
| Ambiguity | low 11 · medium 37 · high 10 |
| Locale | en 37 · zh 21 |
| Content-gap (acceptable = []) | 7 |
| Source | user 23 · reddit 10 · progseo 10 · pinterest 8 · popular 4 · synthetic 2 · gsc 1 |

**Anti-contamination:** labels were NOT produced by running Path A or Path B (the systems under test) — they come from the KB + human notes + judgment, so the eval doesn't grade the matcher against its own output.

**Validation:** `scripts/validate_gold.cjs` checks every id exists and is `allow_generation`, primaries are in the acceptable set, slot keys are real params, and ambiguity/locale are valid → **58 queries, 0 errors.**

---

## 3. Results — Path A, Path B, and union

`node scripts/eval_template_routing.cjs --path=all`. Path A = keyword/alias retrieval (offline, ported from `scripts/eval_search.cjs::scoreOnce`). Path B = live `gpt-4o-mini` using the **exact production prompt/params** from `lib/searchTemplateMatch.ts` (reproduces the live "Generate xxx yourself" rail). Metrics: top-1/top-3 routing accuracy + hit@any, bucketed by ambiguity; content-gap queries scored separately ("clean" = returns nothing but known near-misses).

| | overall top-1 | top-3 | hit@any | low | medium | high | gap clean |
|---|---|---|---|---|---|---|---|
| **Path A** (retrieval) | **53%** | 78% | 86% | 55% | 43% | 80% | 29% |
| **Path B** (LLM matcher) | 33% | 41% | 41% | **82%** | 20% | 20% | **57%** |
| **A∪B** (B-first union) | 53% | 76% | 88% | **82%** | 33% | 80% | 14% |

(n = 51 scored; low 11 / medium 30 / high 10. "low/medium/high" columns are top-1. Path B hit@any = top-3 since it returns ≤3 picks.)

### Takeaways
- **A and B are complementary, split by query type.** Path B wins the **descriptive long-tail** it was built for (low-ambiguity top-1 **82%** vs A's 55%) — rescuing exactly what A recall-misses (`minimalist autumn outfit for japan travel`: A miss → B top-1). Path A wins **broad nouns + CJK** (high-ambiguity top-1 **80%** vs B's 20%).
- **Path B returns `[]` on CJK and capability-dependent queries — the key finding.** Its catalog is **English descriptions only**, so: bare Chinese nouns (`单词`/`植物`/`食物`/`english-chinese`) → `[]`; and `chiikawa` → generic `template-character`, NOT the `fandom-character-grid-poster` that actually has Chiikawa examples (the description never reveals that). This is measured evidence for **Option D / the "b3" KB-routing idea**: enrich the matcher catalog with the capability KB (topics + real example values + aliases).
- **The union needs a confidence gate.** Naive "B-confident-first" lifts low (82%) and keeps high (80%) and best hit@any (88%), but a confident-wrong B pick displaces A's correct rank-1 on **medium** (33% vs A's 43%).
- **Content gaps:** Path B is cleanest (57% returns honest `[]`) vs Path A (29%); the union is worst (14%) by inheriting A's noise.

Full per-query A/B/union diagnostic: `docs/vir-routing-eval-v1-results.md`.

---

## 3.5 KB-enriched matcher (Option D / "b3") — local try-out

Per the mentor's suggestion, we stood up the **KB-based LLM matcher locally** and tried it on a handful of queries, to see whether enriching the catalog with `template_capability_kb.json` recovers what the current matcher (Path B) leaves on the table. Tool: `scripts/try_kb_matcher.cjs` — runs three variants side by side per query (**Path A** retrieval, **Path B (desc)** = current production catalog, **Path B (KB)** = same prompt/model/params, catalog enriched with real example param-values + search aliases incl. CJK + topics). **Only the catalog differs between the two B variants**, so any delta is attributable to the KB.

This is a **diagnostic try-out (trend only), not a final score** — the gold was drafted reading the KB, so a fair quantification of KB lift requires finalizing the gold by human review first (see §4a).

### Result (6 queries, KB field cap = 20, 3 trials each for stability)

| query | gold hit-zone | Path A | Path B (desc) | Path B (KB) | KB effect |
|---|---|---|---|---|---|
| `植物` | species / gardening | top1 ✓ | recall-miss ✗ ×3 | **top3 ✓ ×3** | ✅ **stably recovered** |
| `单词` | vocabulary family | top1 ✓ | recall-miss ✗ (2/3) · **1/3 top1 `vocabulary`** | recall-miss ✗ ×3 | flaky on desc; KB no change |
| `食物` | food / cuisine-vocab | top1 ✓ | recall-miss ✗ ×3 | recall-miss ✗ ×3 | — no change |
| `chiikawa` | fandom-character-grid | top1 ✓ | recall-miss ✗ ×3 | recall-miss ✗ ×3 | — no change |
| `证件照` | (content-gap) | gap-clean ✓ | gap-clean ✓ | gap-clean ✓ | — correct, no change |
| `minimalist autumn outfit for japan travel` | fashion / travel | recall-miss ✗ | top1 ✓ ×3 | top1 ✓ ×3 | — already good |

**Net on this slice: KB stably recovered 1 (`植物`), 0 regressions, rest unchanged.** Catalog size grows ~1.6× (≈12.6K → ≈20K tokens/query).

> **Methodology — every Path B verdict is the majority of ≥3 trials.** Path B runs at `temperature 0.2`, which has **real single-shot variance on boundary queries**: the same query can return `[]` on one call and a valid pick on the next. A single Path B run is therefore not trustworthy — all Path B numbers in this doc (desc *and* KB) are the majority verdict over ≥3 trials.

**Sanity re-run (Path B desc-only = current production, ×3 each):**

| query | trial 1 | trial 2 | trial 3 | majority verdict |
|---|---|---|---|---|
| `单词` | `vocabulary` (conf 0.9) → **top1 ✓** | `[]` | `[]` | recall-miss (2/3), but **not a hard zero — 1/3 top1** |
| `食物` | `[]` | `[]` | `[]` | recall-miss ✗ (stable) |

So `单词` is **not** an absolute miss: the model *can* ground it to `vocabulary` (a gold-acceptable id, conf 0.9) — it just declines ~2/3 of the time. `食物` is stably empty (treated as too broad a category to anchor a concrete subject/param). This is the **probabilistic subject-gate** firing — high-precision-by-design collateral, not a bug — and is exactly why a single Path B run misreads as "always empty" and ≥3-trial majority is mandatory. (Cross-path check: Path A recalls all of `植物`/`单词`/`食物` at **top1**, so the union is unaffected.)

### Findings
1. **The KB matcher runs locally and the A/B harness is clean** — prompt/model/params held constant, only the catalog blob changes. Re-runnable on any query: `node scripts/try_kb_matcher.cjs 单词 chiikawa …`.
2. **Enrichment must be "CJK-aliases-first + adequate cap", or it does nothing.** A naive `cap=6` took the first 6 aliases per template — all English slugs (`en-zh` / `chinese-english` …) — and silently **truncated every CJK alias**, so CJK queries didn't improve at all. With CJK-first selection + `cap=20`, the catalog actually contains `单词` / `植物`, and `植物` is recovered. Lesson: KB signal only helps once it actually reaches the prompt.
3. **Naive enrichment is NOT a complete fix for the CJK / IP blind spot.** Even with their evidence present in the catalog, gpt-4o-mini still returns `[]` on bare CJK nouns (`单词` / `食物`) and IP terms (`chiikawa` — which the prompt's subject-gate actively rules `[]`). The bottleneck is partly missing catalog info, but also **(a) the model's weak bridging of bare CJK → template id, and (b) evidence dilution** from cramming all 227 templates' KB blobs into one prompt.

### Implication for the design
Rather than "dump the whole KB into the catalog", the more promising levers are:
- **Per-query targeted injection** — use Path A / retrieval to pre-select candidate templates, then feed only *their* KB evidence to the LLM (smaller, sharper catalog; fewer tokens; less dilution). Expected to beat the naive blob.
- **Query normalization** — lightly translate/expand CJK queries before the matcher.
- Or simply **lean on Path A (which already nails all these CJK/IP queries) via the union** — the KB's value to Path B is then incremental, not load-bearing.

---

## 4. Future work

### a) Human review of `vir_routing_gold.json`
The gold is a Claude draft pending sign-off. A prioritized checklist is in `docs/vir-routing-eval-v1-review-checklist.md`, covering:
- **7 content-gap calls** (acceptable = []) — esp. 4 queries where our "gap" verdict conflicts with the eval note's `expected_templates=moderate` (is it a routing error, or a real content gap?).
- **6 capability-driven overrides** of the eval notes (e.g. `homophones and homonyms` → `english-grammar-wordlist-infographic`, whose examples are literally "20 common homophones").
- **12 subject-gate drops** (templates the note named but we rejected on subject mismatch).

### b) Option D — KB-enriched matcher catalog (the "b3" path)
Prototyped and tried locally (see §3.5). The naive "whole-KB-into-the-catalog" form is **not** the slam-dunk first expected: on the 6-query try-out it stably recovered only `植物` (0 regressions), and bare CJK / IP queries still return `[]`. Next iterations to pursue (in priority order): **(1) per-query targeted KB injection** — retrieve candidate templates first, feed only their KB evidence (smaller/sharper catalog), expected to beat the naive blob; (2) CJK query normalization before the matcher; (3) full 58-query desc-vs-KB lift table (with variance) once gold is finalized. **Mind contamination: gold was KB-drafted, so finalize it by human review (§4a) before scoring a KB-driven router.**

### c) Union ranking fix
Replace blind "B-first" with a confidence-gated merge so a low-confidence B pick can't displace A's correct rank-1 on medium-ambiguity queries.

### d) Scale-up
Extend the gold toward the spec's balanced 100 (low/med/high ≈ 30/50/20), and fold in the **real user search queries** the mentor will provide — appended in the same schema (`source: "user-queries-<date>"`), re-scored with no code change. Cross-check the 10 ProgSEO queries against the existing `scripts/eval_template_matcher.cjs`.

---

### Deliverables (all on `pr-intern`, untracked / not pushed)
| File | Role |
|---|---|
| `scripts/build_template_capability_kb.cjs` + `scripts/configs/template_capability_kb.json` | Capability KB |
| `scripts/configs/vir_routing_gold.json` | 58-query routing gold set |
| `scripts/validate_gold.cjs` | Gold validator |
| `scripts/eval_template_routing.cjs` | Routing scorer (`--path=a\|b\|union\|all`, `--replay`, `--out`) |
| `scripts/try_kb_matcher.cjs` | Local A/B try-out: Path A vs Path B (desc) vs Path B (KB-enriched) per query (Option D, §3.5) |
| `scripts/kb_lookup.cjs` | Per-template capability lookup (review aid) |
| `docs/vir-routing-eval-v1-{report,results,review-checklist,summary}.md` | Reports + review checklist |

