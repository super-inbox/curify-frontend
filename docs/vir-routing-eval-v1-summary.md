# Visual Intent Routing / Template Retrieval Eval — v1 Summary

**Date:** 2026-06-24 · **Branch:** `pr-intern` (branched off `jwang/vercel`, nothing committed/pushed) · **Status:** Phase 1 done (Path A baseline live); Path B + human review pending.

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

## 3. Path A baseline (offline, no API key — real numbers now)

### How Path A is scored
`node scripts/eval_template_routing.cjs --path=a`

Pipeline per query (the retrieval scorer is ported verbatim from `scripts/eval_search.cjs::scoreOnce`, a mirror of production `app/[locale]/(public)/search/page.tsx`):

1. **Tokenize** the query (whitespace/punct split, stopword strip, CJK bigram fallback for single-token CJK).
2. **Two-tier match** over local JSON: a *strict* pass (all tokens hit) and, when strict is empty, a *relaxed* fallback (≥ ⌈tokens/2⌉ hit), run against both the template i18n text and all 3,115 inspirations.
3. **Derive the matched template set** = templates that matched on their own i18n text ∪ the `template_id` of every matched inspiration, keeping only `allow_generation` templates (parity with Path B's catalog).
4. **Rank** them: strict-i18n matches first, then by number of matched inspirations under each template.
5. **Score vs gold**: `top-1` (rank-1 ∈ acceptable), `top-3` (any of top-3 ∈ acceptable), `hit@any` (matched set ∩ acceptable ≠ ∅), bucketed by ambiguity. Content-gap queries are scored separately (a path is "clean" iff it returns nothing but known near-misses).

### Results

| bucket | n | top-1 | top-3 | hit@any |
|---|---|---|---|---|
| **overall** | 51 | **53%** | **78%** | **86%** |
| low | 11 | 55% | 82% | 82% |
| medium | 30 | 43% | 73% | 83% |
| high | 10 | 80% | 90% | 100% |

Content-gap behavior: **2/7 clean (29%)**.

### Takeaways
- **Medium-ambiguity is the hard middle** (top-1 43%): subject clear, format implied, small acceptable set — exactly where routing matters most, and where Path A surfaces the right *family* but the wrong *member* or ranks it below noise.
- **High-ambiguity scores highest** (top-1 80%) partly as a large-target effect (its gold is a 3–4 template set); the real challenge there is ranking the single best one first.
- **Descriptive long-tail queries recall-miss entirely** — `minimalist autumn outfit for japan travel`, `infj vs entp dating compatibility chart`, `phonics worksheets kindergarten` return nothing from Path A. This is precisely the empty-inspiration / rich-template case the LLM matcher (Path B) was built for; we expect Path B to dominate this slice.
- **Content-gap precision is weak (29% clean):** Path A keeps routing queries that have no honest answer (`wedding planner`, `1950s vintage diner`, `easy weeknight dinners healthy`). A known recall-over-precision trait — and a concrete argument for the matcher/filter layer.

Full per-query diagnostic (recall-miss / rank-miss / gap-confusion verdicts): `docs/vir-routing-eval-v1-results.md`.

---

## 4. Future work

### a) Human review of `vir_routing_gold.json`
The gold is a Claude draft pending sign-off. A prioritized checklist is in `docs/vir-routing-eval-v1-review-checklist.md`, covering:
- **7 content-gap calls** (acceptable = []) — esp. 4 queries where our "gap" verdict conflicts with the eval note's `expected_templates=moderate` (is it a routing error, or a real content gap?).
- **6 capability-driven overrides** of the eval notes (e.g. `homophones and homonyms` → `english-grammar-wordlist-infographic`, whose examples are literally "20 common homophones").
- **12 subject-gate drops** (templates the note named but we rejected on subject mismatch).

### b) Path B + union evaluation (needs a key)
1. Put `OPENAI_API_KEY` in `curify-frontend/.env.local` (read from env only; never logged/committed; `.env.local` is gitignored).
2. `cd curify-frontend && npm install` (installs `openai`, `dotenv`).
3. `node scripts/eval_template_routing.cjs --path=all --out=<results.md>` — runs Path A, Path B, and the A∪B union; ≈ **$0.06** for 58 queries. The run also writes `<results>.pathB.json` so Path B can be re-scored offline later with `--replay` (no re-spend).
- Cross-check: confirm the 10 ProgSEO queries score consistently against the existing `scripts/eval_template_matcher.cjs`.

### c) Scale-up (later)
Extend the gold toward the spec's balanced 100 (low/med/high ≈ 30/50/20), and fold in the **real user search queries** the mentor will provide — appended in the same schema (`source: "user-queries-<date>"`), re-scored with no code change.

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
