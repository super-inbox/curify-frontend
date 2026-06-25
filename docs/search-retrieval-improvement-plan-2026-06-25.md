# Search Retrieval Improvement Plan — 2026-06-25

_Owner: jay. Status: P0.1 in progress; P0.2 queued. Re-rank after each ship + measure recall lift on the bronze-worker / 青铜打工小兽 class of viral-compound queries._

## Why this doc exists

GPT-side audit (2026-06-25) suggested four search retrieval upgrades:

| # | Item | Difficulty | Value |
|---|---|---|---|
| 1 | Multi-query Retrieval (1 query → 5-10 paths) | low | extreme |
| 2 | Offline Metadata Expansion (30-100 tags per record) | medium | extreme |
| 3 | Query Decomposition (object/style/scene/output slots) | medium | high |
| 4 | Topic/Intent Routing (topic first, then template) | medium | high |

This doc maps each against what Curify already ships, picks the **P0 subset by ROI**, and lays out the implementation order. It's a sibling of [`docs/search-and-content.md`](./search-and-content.md) (the strategic umbrella) and [`docs/search-quality.md`](./search-quality.md) (the operational tuning runbook).

---

## What we already have (audit)

| Capability | Where it lives | Coverage |
|---|---|---|
| LLM query rewriter | `lib/searchRewrite.ts` | 3 rewrites per query, union of results |
| Merged-blob matching | `app/[locale]/(public)/search/page.tsx` (commit `00b8587f`) | `template.topics ∪ record.topics ∪ record.tags` |
| Per-record search aliases | `nano_inspiration.json` fields | 5-50 aliases/record (highly variable) |
| Phase 3 LLM tag enrichment | commit `df03c8cb` (2026-06-18) | **avg 5 tags/record** on 2913/3071 inspirations |
| Phase 1 intent chip aggregator | commit `17b56686` (2026-06-19) | post-results chip surface, `?within=` intersect filter |
| Subject-match hard gate | Section B (commit `369d0f22`) | tightened false-positives |
| Section A tokenizer + CJK bigram | `/search/page.tsx` | strict → relaxed → bigram fallback |

## What's missing

| GPT item | Gap |
|---|---|
| **#1 Multi-query Retrieval** | ~3 paths today (rewrites), not 5-10. No DECOMPOSITION-style paths (object-only / style-only / scene-only / output-only) |
| **#2 Offline Metadata Expansion** | 5 tags/record vs the 30-50 the GPT audit recommends. Templates (~296) and gallery prompts (~4117) much thinner than inspirations |
| **#3 Query Decomposition surface** | No structured slot extraction visible to user ("Searched as: bronze + anthropomorphic + sticker pack") |
| **#4 Pre-retrieval intent routing** | Intent narrowing happens POST-results via chip; primary matcher still goes query → templates directly |

---

## P0 — pick two, ship in order

### P0.1 — Offline Metadata Expansion v2 (in progress)

**What:** re-run Phase-3-style LLM enrichment with a broader prompt asking for **30-50 tags per record** spanning 9 axes:

```
1. subject          (what is shown — fruit, animal, character, object, person)
2. style            (illustration, photorealistic, kawaii, vintage, isometric, …)
3. scene/setting    (office, kitchen, beach, museum, outdoor, …)
4. material/medium  (bronze, watercolor, embroidery, ceramic, paper-craft, …)
5. era/period       (Tang dynasty, Y2K, retro, futuristic, mid-century, …)
6. mood/aesthetic   (cozy, edgy, chic, serene, dramatic, whimsical, …)
7. audience         (kids, professionals, fans, parents, hobbyists, …)
8. output type      (poster, sticker, infographic, comic — already covered)
9. composition      (centered, grid, layered, isometric, split-screen, …)
```

**Scope:** 3071 inspirations + 4117 gallery prompts + 296 templates = ~7,500 records × ~$0.0015 each = **~$11**.

**Reuse:** the `scripts/enrich_inspiration_tags_phase3_2026-06-18.py` script as the template, broaden the prompt, validate against taxonomy (adding new T3/T4 entries for novel slugs that surface, per the 2026-06-18 fill pattern).

**Pilot first:** 20 records to verify quality + average tag count + validation rate before burning full budget. Sign-off after pilot review.

**Expected lift:** recall on long-tail / viral-compound queries (`青铜打工小兽`, `cozy bronze office worker`, `kawaii museum gift`) jumps meaningfully. Direct-match queries shouldn't move much.

**Pipeline:** [`scripts/enrich_metadata_v2_2026-06-25.py`](../scripts/enrich_metadata_v2_2026-06-25.py) → run pilot → run full → commit `nano_inspiration.json` + `nanobanana.json` + (if templates touched) `nano_templates.json`.

### P0.2 — Multi-query Retrieval expansion (queued, after P0.1 ships)

**What:** extend `lib/searchRewrite.ts` to generate 8 retrieval paths instead of 3:

| Path | Source | Example for `青铜打工小兽` |
|---|---|---|
| 1 | original query | `青铜打工小兽` |
| 2-4 | LLM rewrites (existing) | `bronze beast office worker`, `bronze worker mascot`, `bronze artifact employee` |
| 5 | **object/subject** decomposition | `bronze artifact` |
| 6 | **output type** extraction | (none explicit; skip) |
| 7 | **style/aesthetic** extraction | `anthropomorphic`, `cute illustrated` |
| 8 | **scene/setting** extraction | `office daily life` |

Run all 8 in parallel, union results, **re-rank by hit-count-across-paths** (records hit by multiple paths rank higher — natural relevance signal).

**Tracking:** add `|paths=<n>` content_id suffix on the existing search events so admin SQL can measure which queries benefit from multi-path expansion vs which already had good recall (records that hit on 5+ paths are obviously well-served, records that hit on 1 path are pure rewrite-rescue cases).

**Expected lift:** compound queries that today get only rewriter recall (`base 0 → union 266` per `search-and-content.md` Thread a) get broader coverage. Direct-match queries get slightly higher precision via the rank boost from multi-path hits.

---

## P1 — after P0.1 + P0.2 measure clean

- **Query Decomposition surface** — show "Searched as: bronze + anthropomorphic + sticker pack" pill row above results. Transparency UX; doesn't move recall but improves user trust.
- **Pre-retrieval Intent Routing** — LLM classifies query into intent slots before template matching, filters template universe upstream. High effort, risk of breaking the subject-match hard gate (`369d0f22`); only worth it if P0.1+P0.2 don't move the bronze-worker class enough.

---

## Measurement plan

Before P0.1 ships, snapshot baseline:
- Top 20 queries from prior 7d (admin SQL: `SEARCH` + `SEARCH_NORESULT` + `SEARCH_LOWRESULT` with frequency)
- Hit count per query (Section A blob match count)
- Click-through rate per query (admin SQL: SEARCH → CLICK within 5 min)

After P0.1 ships:
- Re-run the same metrics
- Diff per query
- Flag queries that went `LOWRESULT → SEARCH` (recall recovered) and queries that show no change

Same protocol after P0.2.

---

## See also

- [`docs/search-and-content.md`](./search-and-content.md) — strategic umbrella across the four content threads
- [`docs/search-quality.md`](./search-quality.md) — operational search-side tuning, low-result review, alias work
- [`docs/template-matching-section-a-vs-b-2026-06-17.md`](./template-matching-section-a-vs-b-2026-06-17.md) — Section A vs B matcher design
- [`docs/onboarding-runbook.md`](./onboarding-runbook.md) — operator-level how-to for the workflows
- `feedback_*` memory files — operator-level gotchas surfaced automatically per session
