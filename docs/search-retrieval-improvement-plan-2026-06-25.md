# Search Retrieval Improvement Plan — 2026-06-25

_Owner: jay. Status: **P0.1 + P0.1b + P0.2 shipped 2026-06-25 / 2026-06-26**. Measure recall lift on the bronze-worker / 青铜打工小兽 class of viral-compound queries; the `|paths=N` tracking suffix gives the admin SQL handle._

**Live status:**
- ✅ Task #121 — P0.1b: templates re-enriched with narrow prompt (15 avg topics, 0 new subject leak).
- ✅ Task #122 — P0.2: `getMultiQueryPaths` returns 3 paraphrases + 6 decomposition slots; multi-hit re-rank applied; `|paths=N` suffix on search events.

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

### P0.1 — Offline Metadata Expansion v2 (✅ shipped 2026-06-25 — inspirations + gallery)

**Result of the full pass:**

| Surface | Records | Avg before | Avg after | Sweet spot | <10 tags |
|---|---|---|---|---|---|
| Inspirations | 3,134 | ~5 | **25.5** | 65% at 25+ | 4% |
| Gallery prompts | 4,117 | ~5 | **26.3** | 70% at 25+ | 1% |
| Templates (P0.1b) | 297 | ~5 | **15.0** | 95% in 12-25 | 0% |

Cost: ~$12 total. Commits: `f2255f52` (inspirations), `ce2b696d` (gallery), `2c0b8668` (templates narrow prompt). Run script: [`scripts/enrich_metadata_v2_2026-06-25.py`](../scripts/enrich_metadata_v2_2026-06-25.py).

### Original spec (kept for reference)

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

> ⚠️ **Templates excluded from the broad 9-axis prompt.** Per the `template.topics = boilerplate (Info-Type + Layout), Subject on examples` rule (memory: `feedback_template_topics_should_be_boilerplate.md`), templates must NOT carry subject/scene/material/era tags — those belong on individual inspirations/gallery prompts. A separate **P0.1b** is queued: re-enrich templates with a narrower prompt covering only output-type + composition + style + audience axes.

**Reuse:** the `scripts/enrich_inspiration_tags_phase3_2026-06-18.py` script as the template, broaden the prompt, validate against taxonomy (adding new T3/T4 entries for novel slugs that surface, per the 2026-06-18 fill pattern).

**Pilot first:** 20 records to verify quality + average tag count + validation rate before burning full budget. Sign-off after pilot review.

**Expected lift:** recall on long-tail / viral-compound queries (`青铜打工小兽`, `cozy bronze office worker`, `kawaii museum gift`) jumps meaningfully. Direct-match queries shouldn't move much.

**Pipeline:** [`scripts/enrich_metadata_v2_2026-06-25.py`](../scripts/enrich_metadata_v2_2026-06-25.py) → run pilot → run full → commit `nano_inspiration.json` + `nanobanana.json` + (if templates touched) `nano_templates.json`.

### P0.1b — Templates re-enrichment with narrow prompt (✅ shipped 2026-06-26)

**The fix:** built a templates-only `SYSTEM_PROMPT_TEMPLATES` + `build_template_allow_set()` partition of the taxonomy. Allow-set = tier3 under `{design, lifestyle, product}` + tier2 under `{design, product}` + audience = **147 slugs**, vs the full 807-slug set used for inspirations/gallery. Subject tiers are entirely absent from both the vocab surfaced to the LLM and the validation filter, so neither the prompt nor the post-filter ever lets a subject slug land on a template.

**Result:** 297 templates → avg 15.0 topics (was ~5), 95% in the 12-25 sweet spot, 0 errors, **0 new subject additions** (verified by cross-checking proposed slugs against subject tier3 + tier4). Commit `2c0b8668`.

Pre-existing tier1 memberships (e.g. `character` on `template-character`) remain — they're load-bearing for `/topics/<slug>` routing and out of scope for this pass.

### P0.2 — Multi-query Retrieval expansion (✅ shipped 2026-06-26)

**The implementation:** [`lib/searchRewrite.ts`](../lib/searchRewrite.ts) gains `getMultiQueryPaths(query)` — one LLM round-trip returning both 1-3 paraphrase rewrites AND a decomposition object with up to 6 facet slots (subject / style / scene / output / era / mood). `flattenPaths()` orders + dedupes them. [`search/page.tsx`](../app/[locale]/(public)/search/page.tsx) runs the original query as baseline, then re-scores each non-empty path through the same `scoreQueryTokens(_, false)` codepath as before, unions by record id (max score wins), and tracks **hits-across-paths** per record. Records hit by multiple paths get an `+8% per extra path, capped at +40%` score boost — small enough that it adjusts ordering without flipping strict/relaxed gates, large enough that records covering several facets of the query outrank records that only matched one decomposition slot.

**Tracking:** SearchResultsClient appends `|paths=N` to the `content_id` on `SEARCH_NORESULT` / `SEARCH_LOWRESULT` / `SEARCH` (within-chip) events when multi-query fired. Admin SQL can now split "thin after 8 paths tried" from "thin after no expansion attempt".

**Cost:** still one LLM call per thin query (same gating as before — bot/garbage/healthy-result short-circuits skip the LLM); the extra output tokens for the decomposition object are negligible.

Commit: `<HEAD on jwang/vercel>`.

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

## Worked example: `青铜打工小兽` end-to-end

The canonical compound query used as the benchmark across this plan. The progression below is concrete and verifiable — each row is something we shipped or are about to ship.

### Step 0 — pre-2026-06-23: the floor

`/search?q=青铜打工小兽` returned **0 results**. The query is a viral Chinese compound (bronze + 打工 office-worker + 神兽 mythical-beast). No template existed for anthropomorphized cultural artifacts; the rewriter's catalog context didn't recognize 青铜 as a route-able tier-3; no inspiration carried `打工` or `office worker` as a tag.

### Step 1 — 2026-06-23: A+C content gen (commit `224b3aa9`)

Filed as the **bronze-worker case study** before P0 work began.
- Added 5 tier-3 slugs: `original-ip`, `modernized-artifact`, `cultural-fusion`, `daily-life-grid`, `narrative-comic`.
- Authored 3 new templates: `template-original-character-daily-life-grid`, `template-original-character-sticker-pack`, `template-modernized-artifact-poster`.
- Generated 12 seed inspirations (4 per template) including a literal `bronze-worker` mascot card.
- Added 16 fresh aliases on 3 existing bronze-mentioning records: `打工/working/office/grind/9-to-5`, `神兽/mythical creature/mascot`, `青铜/bronze/ancient artifact/文物`, `拟人/anthropomorphic`.

After this drop, `/search?q=青铜打工小兽` returned **~6-8 hits via the rewriter path** but the **base (no-rewrite) match was still 0** — the original CJK tokens couldn't match anything; only the LLM rewrites rescued recall.

### Step 2 — 2026-06-25 (P0.1): inspirations + gallery enriched

Tag corpus jumped 5 → 25.5 avg per inspiration, 5 → 26.3 per gallery prompt. The 12 bronze-worker seeds now carry 25-30 tags each spanning the 9 axes — concretely:
```
template-original-character-daily-life-grid-bronze-worker:
  subject:     anthropomorphic, character, character-ip, mascots,
               original-ip, modernized-artifact
  style:       illustration, cartoon, kawaii, 3d
  scene:       office, daily-life-grid, workplace-dynamics
  material:    bronze, metallic
  era:         vintage, ancient
  mood:        playful, cozy, modern
  audience:    (none — adult-audience by default)
  output:      character-ip, narrative-comic, daily-life-grid
  composition: grid
```

A user query of just `bronze worker` (no original Chinese) now matches this record on **subject + material + scene** simultaneously instead of only via aliases.

### Step 3 — 2026-06-26 (P0.1b): templates re-enriched with narrow prompt

`template-original-character-daily-life-grid.topics[]` went from `["character", "design", "narrative-comic"]` to **~15 boilerplate topics** including `daily-life-grid`, `grid`, `playful`, `whimsical`, `narrative-comic`, `comic`, `social-media-posts`, `cozy`, `modern`, `dynamic`. Critically, **no new subject tags** leaked onto the template — `anthropomorphic` and `bronze` stay on the *examples*, not the template itself.

This means a query for `daily life grid` or `narrative comic` (output-type queries with no subject) now surfaces this template, while `anime` (an unrelated subject) does not over-match it.

### Step 4 — 2026-06-26 (P0.2): multi-query retrieval

A user types `青铜打工小兽`. The full pipeline now executes:

**(a) Baseline pass.** `scoreQueryTokens(['青铜','打工','小兽'], true)` runs first. Suppose this returns 2 strict hits (the 2 records whose aliases were hand-curated in Step 1). Below `LOW_RESULT_THRESHOLD=5` (raised from 3 on 2026-06-26) → expansion fires.

**(b) One LLM call returns 7 extra paths.**
```json
{
  "rewrites": ["bronze beast office worker", "bronze worker mascot", "bronze artifact employee"],
  "decomposition": {
    "subject": "bronze artifact",
    "style":   "anthropomorphic",
    "scene":   "office daily life",
    "output":  "character poster"
  }
}
```
`flattenPaths` dedupes them against each other and the original → **7 unique extra paths**. Combined with the baseline = **8 retrieval paths**.

**(c) Each path is re-scored.** Same `scoreQueryTokens` engine, union by record id, max score per record wins. A parallel `pathHitsById` counts how many paths matched each record:

| Record | original | rw1 | rw2 | rw3 | subject | style | scene | output | hits | base |
|---|---|---|---|---|---|---|---|---|---|---|
| `bronze-worker-seed-1` | ✅ (3) |  |  |  | ✅ (2) | ✅ (1) | ✅ (1) |  | **4** | 3 |
| `bronze-misc-B` |  | ✅ (2) |  |  | ✅ (1) |  |  |  | **2** | 2 |
| `kawaii-mascot-D` |  |  | ✅ (1) |  |  | ✅ (1) |  |  | **2** | 1 |
| `office-meme-C` |  |  |  |  |  |  | ✅ (1) |  | **1** | 1 |

**(d) Multi-hit re-rank.** `+8% per extra hit, capped at +40%`:

| Record | base | hits | boost | final |
|---|---|---|---|---|
| `bronze-worker-seed-1` | 3.00 | 4 | ×1.24 | **3.72** |
| `bronze-misc-B` | 2.00 | 2 | ×1.08 | 2.16 |
| `kawaii-mascot-D` | 1.00 | 2 | ×1.08 | 1.08 |
| `office-meme-C` | 1.00 | 1 | ×1.00 | 1.00 |

`bronze-worker-seed-1` widens its lead because it covers 4 facets of the query; `kawaii-mascot-D` (kawaii bronze mascot — 2 facets) gets pushed above the single-facet `office-meme-C`.

**(e) Tracking emits `|paths=8`.** If the union is still thin, the event reads:
```
content_id  = "青铜打工小兽|n=2|rw=1|paths=8"
action_type = "search_lowresult"
```
That lets admin SQL distinguish "thin after 8 paths tried" (real content gap → file new content gen) from "thin without expansion attempt" (rewriter gated off — bot/garbage UA).

### Current status (as of 2026-06-26)

- ✅ Step 0 → Step 3: shipped. The query now lands on real content with 9-axis tagging.
- ✅ Step 4: multi-query retrieval expansion live in prod via `c8504f27`.
- 🔭 **Open**: monitor admin SEARCH events filtered to `LIKE '%青铜%' OR LIKE '%bronze%worker%'` for the next 7 days. If `|paths=8` events still show `n<3`, file a content-gen follow-up (more seed examples). If `|paths=8` events show healthy `n` AND CLICK follow-through, this query class is solved and the playbook generalizes to the next viral compound.

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
