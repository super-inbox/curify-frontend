# Visual Intent Routing / Template Retrieval Eval — v1 Summary

**Date:** 2026-06-25 · **Branch:** `pr-intern` (branched off `jwang/vercel`) · **Status:** Path A (offline) **and** Path B (live gpt-4o-mini) + union all scored. Remaining: human review of the gold; Option D (KB-enriched matcher).

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

## 4. Future work

### a) Human review of `vir_routing_gold.json`
The gold is a Claude draft pending sign-off. A prioritized checklist is in `docs/vir-routing-eval-v1-review-checklist.md`, covering:
- **7 content-gap calls** (acceptable = []) — esp. 4 queries where our "gap" verdict conflicts with the eval note's `expected_templates=moderate` (is it a routing error, or a real content gap?).
- **6 capability-driven overrides** of the eval notes (e.g. `homophones and homonyms` → `english-grammar-wordlist-infographic`, whose examples are literally "20 common homophones").
- **12 subject-gate drops** (templates the note named but we rejected on subject mismatch).

### b) Option D — KB-enriched matcher catalog (the "b3" path)
The biggest measured lever: Path B is blind to CJK queries and to template capability because its catalog is description-only. Build a Path-B variant whose catalog blob includes the capability KB (topics + real example param-values + aliases) and re-run — expected to recover most of the CJK + broad-noun slice Path B currently returns `[]` on. (Mind contamination: keep gold human-reviewed/independent of the KB before scoring a KB-driven router.)

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
| `scripts/kb_lookup.cjs` | Per-template capability lookup (review aid) |
| `docs/vir-routing-eval-v1-{report,results,review-checklist,summary}.md` | Reports + review checklist |
