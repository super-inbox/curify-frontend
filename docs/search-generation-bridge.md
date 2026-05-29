# Search ⇄ generation bridge — design spec

_Status: spec, not built. Filed 2026-05-26. Motivated by the ProgSEO demo. Updates after build land in Thread d open item 8 of `docs/search-and-content.md`._

## The gap today

Search results page (`/search?q=...`) returns two surfaces:

1. **Inspirations** — existing examples that match the query (strict + relaxed)
2. **Templates** — but only templates whose i18n blob matched OR whose inspirations matched

The Templates surface is **reactive**: it only shows templates that have already been used to generate content matching the query. For a query like `cuban sandwich` (0 inspirations today, though `template-recipe` and `template-food` can obviously generate it), the user sees nothing useful in the Templates rail.

The ProgSEO demo manually closed this gap: given a long-tail query, hand-curate the 2-3 templates that COULD generate it with concrete params, and let the user one-click generate. That intuition belongs in production search.

## What we want

For any query, the search page surfaces **two distinct sections**:

| Section | What it is | When it's empty |
|---|---|---|
| **Examples generated** | Existing inspirations matching the query (current behavior) | "No images for `<query>` yet. Be the first — pick a template below to generate one." |
| **Generate from a template** | Templates that COULD generate `<query>` with suggested params filled in | "We don't have a template ready for `<query>` — try a related search or browse the catalog." |

Both sections rendered together. The user understands at a glance whether to (a) browse existing content or (b) generate something new.

## Two design paths

### Option A — Pre-computed taxonomy layer

Annotate each template with the kinds of queries it can answer:

```jsonc
// In nano_templates.json or a sidecar file
{
  "id": "template-recipe",
  "accepts": {
    "primary_subject": "dish_name",
    "subject_class": "food",      // pulled from lib/taxonomy.json tier3
    "query_patterns": ["* recipe", "how to make *", "* recipe poster"]
  }
}
```

At query time:
1. Classify the query into a subject_class (food / fashion / mbti / etc.) — use existing topic registry or a small LLM
2. Match templates with `accepts.subject_class === query_class`
3. Extract the primary subject from the query (e.g. "cuban sandwich" from "cuban sandwich recipe poster") and fill into `accepts.primary_subject`

**Pros**: deterministic, fast (no per-query LLM), cacheable, auditable
**Cons**: ~200 templates × ~5 fields = 1000 cells to author + maintain; hard to handle compound queries cleanly; brittle to new template families

### Option B — LLM matcher at query time

Reuse `proposal_matching.py` from the existing Reddit adapter (already battle-tested):

```python
async def match_demands_to_templates(
    signals: list[str],  # = [query]
    templates: list[dict],  # full catalog
    batch_size: int = 1,
) -> list[{"template_id", "params", "confidence", "reason"}]
```

At query time:
1. Build catalog blob (one-time at module load)
2. Send `(query, catalog_blob)` to gpt-4o-mini
3. Receive top 2-3 (template_id, params, confidence) tuples
4. Render those as generation cards

**Pros**: handles arbitrary queries (compound, multi-language, ambiguous); zero taxonomy maintenance; same infrastructure as the existing proposal matcher; can leverage already-cached LLM rewriter for queries that ALSO need rewriting
**Cons**: per-query latency (~1-2s for gpt-4o-mini); cost ($0.0001-0.001 per query depending on catalog blob size); LLM can hallucinate template_ids (existing matcher already validates against template set)

### Recommended: hybrid

| Stage | Source | Latency |
|---|---|---|
| 1. Tier-1/2 obvious matches | topic registry (already there) | 0ms |
| 2. Cache lookup | process-local LRU (same as existing `searchRewrite.ts`) | 1-2ms |
| 3. LLM matcher | gpt-4o-mini, only when 1 + 2 thin | 800-1500ms |
| 4. Taxonomy fallback (long-term) | precomputed `accepts.*` annotations | 0ms |

Start with B (LLM matcher) — same code path as the rewriter, minimal new infra. Layer A on top later as accepted classifications accumulate (LLM verdicts → taxonomy entries → caching avoids re-LLM).

## UI / copy proposals

### Page-level header (the meta-message)

When the page loads with `q=<query>`, today shows: `Results for "<query>"`. Replace with a richer status:

| State | Message |
|---|---|
| Both sections populated | `<N> examples + <M> templates for "<query>"` |
| Only examples | `<N> examples for "<query>"` |
| Only templates (content gap) | `No examples for "<query>" yet — generate one below` |
| Neither | `No results for "<query>". Try a related topic.` (existing fallback) |

### Section A — Examples generated

Same as today's "Inspirations" grid. Header:

> **Examples generated**
> `<N> images created with our templates that match "<query>".`

When empty (but templates exist):

> **No examples yet.** Be the first to generate one — pick a template below.

### Section B — Generate from a template (NEW)

Header:

> **Generate "<query>" yourself**
> These templates can create new images for your query. Click any card to customize and generate.

Per card:

```
[Template preview image]
[Template name — small]
title_text: Lunar New Year Red Envelope
language: Bilingual
[Generate →]  (or: card itself is the click target)
```

The Generate button (or card click) takes the user to `/nano-template/<slug>?title_text=...&language=...#reproduce` (same query-string-prefill pattern that `NanoInspirationCard.remixHref` already uses). The reproduce section is scrolled into view, params are prefilled, user hits Generate.

### When confidence is borderline

LLM matcher returns confidence ∈ [0, 1]. Above 0.7: surface directly. Between 0.4–0.7: surface but with a hedge in the label:

> **Might work for "<query>"**
> *Lower confidence — the template can generate similar content but may need parameter tweaks.*

Below 0.4: drop entirely.

### Mobile + accessibility

- Section A and Section B stack vertically on mobile (Section A first — existing content lands faster)
- Each generate card has `aria-label="Generate <query> with <template name>"` so screen readers articulate the action
- LLM-matching latency: render Section A immediately, Section B with a skeleton loader; show a single inline progress message: `Looking for templates that can generate "<query>"…`

## Implementation phases

### Phase 1 — Wire LLM matcher into search (~3 days)

1. Port `proposal_matching.py` to TS as `lib/searchTemplateMatch.ts` (or call Python via API route — your call). Reuse catalog blob shape.
2. In `app/[locale]/(public)/search/page.tsx`, after the existing scoring:
   - If `inspirations.length < LOW_RESULT_THRESHOLD` OR `matchedTemplates.length < 2`, call the matcher
   - Pass results to client as `generableTemplates: [{template_id, params, confidence, reason}]`
3. Render Section B below Section A in `SearchResultsClient.tsx`
4. Add page-level meta-message per the table above
5. Process-local LRU cache (same shape as `searchRewrite.ts` LRU)

### Phase 2 — Tracking + measurement (~half-day)

- Track CLICK on generate cards with content_id `search_generable_template:<template_id>` so we can measure whether users actually click through
- Track GENERATE downstream on the destination template page (already tracked, just attribute back via session)
- Admin panel: per-query, what % of sessions generated something after seeing Section B?

### Phase 3 — Taxonomy backfill (~half-week)

After Phase 1 has run for ~2 weeks, mine the LLM verdicts:

- Aggregate (query, template_id, confidence ≥ 0.8) pairs
- Convert to `template.accepts.*` annotations
- Skip LLM call when a cache + taxonomy hit covers the query (cost reduction)

#### Design decisions (locked 2026-05-29)

**Where the `accepts` annotation lives:** on each template in `nano_templates.json` (Option A from the design discussion). Rejected the alternative of a centralized block in `taxonomy.json` because the annotation is template metadata (what queries this template can serve), not part of the topic hierarchy itself. Putting `accepts` next to `topics` / `rank_score` / `allow_generation` keeps template-related fields co-located.

```jsonc
// nano_templates.json — new optional field per template
{
  "id": "template-recipe",
  "topics": ["food", "lifestyle", "guides"],
  "rank_score": 90,
  "allow_generation": true,
  "batch": true,
  // NEW:
  "accepts": {
    "subject_class": "food-and-drink",         // references taxonomy.tier3 subject names
    "primary_param": "dish_name",              // which template param the extracted entity binds to
    "query_patterns": [
      "* recipe",
      "how to make *",
      "* recipe card",
      "* recipe poster"
    ]
  }
}
```

**How `taxonomy.json` is referenced** (NOT modified structurally):

1. `accepts.subject_class` references an existing tier-3 subject name from `taxonomy.tier3` — e.g., `food-and-drink`, `animals`, `nature`, `phonics`. The classification vocabulary already exists in taxonomy.json; Phase 3 just consumes it.

2. `accepts.query_patterns` can be **seeded from `taxonomy.tier4`** — for `template-recipe`, the patterns auto-expand from `tier4.food-and-drink` (`Fruits recipe`, `Vegetables recipe`, `Desserts recipe`, ...) on top of the hand-authored generic patterns (`* recipe`, `how to make *`). Natural reuse of the existing leaf seeds — no duplication.

3. **No new tier or field added to taxonomy.json**. The integration is one-way: nano_templates.json reads from taxonomy.json's existing structure.

#### Data-source workaround for the offline backfill

There's no persistent logging of `lib/searchTemplateMatch.ts` verdicts today — the LRU cache is process-local and blows on Vercel cold starts. So the seed data for Phase 3 has to come from an offline run, not production logs.

Backfill source — total ~140-300 queries depending on synthesis decision:

| Source | Count | Notes |
|---|---|---|
| Real prod queries from 14-day admin panel (section 6) | ~91 unique | Grounded — these are queries users actually typed |
| `scripts/configs/search_eval_set.json` | 46 | Includes ProgSEO entity-shape queries the matcher was already validated against |
| Optional: synthesized from `tier4` seeds | ~50-200 | "* recipe", "* travel", "* mbti" expanded over each tier4 leaf — broader coverage but risks queries no real user will type |

Total cost at gpt-4o-mini pricing: ~$0.0015/query × ~200 queries = **~$0.30 one-off** to seed the initial annotations across all ~200 `allow_generation: true` templates.

#### At query time (changes to `app/[locale]/(public)/search/page.tsx`)

```
1. For each template with `accepts`, scan its query_patterns against the
   query (in-memory regex match, microseconds).
2. If ≥ 2 templates pattern-match → build TemplateMatch[] from those,
   extract the entity via the * wildcard position, SKIP the LLM matcher
   call entirely.
3. If < 2 → fall back to existing LLM matcher (current behavior).
4. The LLM matcher's verdicts when it does run get logged to a new
   persistent store (Vercel KV / Postgres sidecar), so Phase 3's
   annotations grow organically over time.
```

Performance: pattern-matching ~200 templates × ~5 patterns each = ~1000 regex evaluations per query, all in-memory. Should be sub-millisecond. The LLM call (which this replaces on cache hit) is ~800-1500ms.

#### Implementation breakdown (~1 day total)

| Step | Deliverable | Effort |
|---|---|---|
| 1 | `scripts/backfill_template_accepts.cjs` — offline runner over the query set above, writes `accepts` to `nano_templates.json` | 3-4 hrs |
| 2 | `lib/searchAcceptsMatcher.ts` — pattern-matcher loader that bypasses the LLM call on hit; same output shape as `searchTemplateMatch.ts` | 2-3 hrs |
| 3 | `app/[locale]/(public)/search/page.tsx` — wire matcher gate (try pattern-match first; fall back to LLM matcher) | 1 hr |
| 4 | Eval validation that the pattern-matcher's verdicts agree with the LLM matcher's on the 46-query eval set (top-1 agreement ≥ 85%) | 1 hr |
| 5 | (Deferred follow-up) Persistent verdict logging in `curify_background` so annotations grow over time | half-day, P2 |

#### Validation criteria

- The eval-set top-1 verdict from the pattern matcher must agree with the LLM matcher's top-1 on **≥ 85%** of queries with no LLM call.
- For the remaining ≤ 15%, the LLM matcher falls back automatically and the user sees the same cards either way.
- LLM cost should drop by **~70-80%** at steady state (real prod queries are dominated by repeats — the long tail keeps the LLM matcher alive).

## Open taxonomy followups (revisit before/during Phase 3 implementation)

Three insights surfaced from the 2026-05-29 taxonomy audit (commit `8d3fc6d`, which built `template_subjects`). Documented here as a TODO list to revisit when the bridge implementation actually starts.

### TODO 1 — Tier-3 ↔ template tag alignment is sparse

**Insight:** The original Phase 3 spec assumed `template.topics ∩ tier3` would yield a meaningful per-template subject map. Audit showed it doesn't — only **65 of 215 templates** reference any tier-3 subject directly. Most templates' `topics[]` use tier-1/tier-2 names (`posters`, `design`, `learning`, `guides`, `composition`) because that's how content creators naturally tag.

**Current mitigation:** `template_subjects` map uses inclusive matching across tier1 ∪ tier2 ∪ tier3 → 215/215 coverage.

**Followup decision points:**
- (a) **Accept** the current state — inclusive matching works for the bridge, and forcing creators to tag at tier-3 would be an unnatural authoring constraint.
- (b) **Auto-promote** common template tags to tier-3 entries (e.g., `posters`, `guides`, `composition` become tier-3 subjects with their own tier-4 leaves). Restructures the taxonomy meaningfully.
- (c) **Re-tag** templates to include tier-3 subjects in their `topics[]` — could be done via the LLM matcher's existing verdict logic.

Recommendation: (a) for now; revisit if Phase 3 implementation reveals routing issues that tier-3 specificity would solve.

### TODO 2 — 52 tier-3 "orphan" entries are entity values, not subject categories

**Insight:** 52 tier-3 entries are referenced by zero templates: 16 MBTI types (`mbti-intj`, `mbti-intp`, ...), 22 country names (`spain`, `france`, ...), 9 style names (`minimalist`, `chic`, `vintage-retro`, ...), and 5 other subjects (`nature`, `food-and-drink`, `phonics`, etc — these last 5 appear in `tier3.language` but templates tag at the tier-2 level).

The MBTI types and country names ARE in templates — but via `params.country = "Spain"` or `params.mbti_type = "INTJ"`, not via `topics[]`. They're entity values, not subjects templates self-categorize under.

**Followup decision points:**
- (a) **Leave as-is.** They document the entity vocabulary and could be used by the entity-extraction step of the bridge (`accepts.primary_param` extraction).
- (b) **Move to a new `entity_values` section** in taxonomy.json, structured by entity type (mbti types under `entity_values.mbti`, countries under `entity_values.geo`, etc). Cleaner separation.
- (c) **Delete** them from tier-3 if they don't carry semantic weight beyond the entity vocabulary. Likely too aggressive — they're documented vocabulary that downstream tools could need.

Recommendation: (b) when the bridge implementation needs entity-type metadata. Until then, (a) is fine.

### TODO 3 — Tier-4 enrichment from template placeholders is deferred

**Insight:** The 34 templates with `allow_generation: true` + `batch: true` have 45+14+11+6 = ~76 unique placeholder values that could become tier-4 leaves. But they cluster under TIER-2 style descriptors (`kawaii`, `watercolor`, `photorealistic`) that aren't currently tier-3 subjects with their own tier-4 keys.

Top 5 candidate clusters:
- **kawaii** — 45 placeholder candidates (no tier-4 key today)
- **watercolor** — 14 candidates (no tier-4 key)
- **photorealistic** — 11 candidates (no tier-4 key)
- **celebration** — 6 candidates (tier-4 has 8 today, can extend)
- (others below threshold)

**Followup decision points:**
- (a) **Promote style descriptors to tier-3 subjects** (add `kawaii` / `watercolor` / `photorealistic` to a new `tier3.style` cluster) and add their tier-4 leaves. Largest restructuring.
- (b) **Add placeholder-derived leaves under EXISTING tier-3 subjects** where the template references both a style and a concrete subject (e.g., a kawaii template that's about food would contribute its placeholders to `tier4.food-and-drink`, not a new `tier4.kawaii`). More effort, more accurate.
- (c) **Keep tier-4 as category-level only** (current state: `tier4.animals: ["Forest Animals", "Ocean Animals", ...]`) and rely on the LLM matcher to bridge query → template without per-leaf annotations. Simplest.

Recommendation: (c) for now; the LLM matcher (Phase 1) handles the entity-shape queries well enough that fine-grained tier-4 leaves aren't blocking. Revisit if/when query patterns show systematic gaps the LLM can't handle.

### When to revisit these

Trigger conditions for re-opening each TODO:
- **TODO 1**: when implementing the bridge's pattern matcher (Step 1-2 of the Phase 3 implementation breakdown above), if eval shows < 85% top-1 agreement and the gap is attributable to missing tier-3 specificity.
- **TODO 2**: when the bridge's entity-extraction step needs to know "what TYPE of entity does this param accept" (e.g., to validate that an extracted entity is a valid country before binding to `params.country`).
- **TODO 3**: when the LLM matcher's gpt-4o-mini cost becomes a real concern at scale (currently ~$0.0015/query, basically free at current traffic).

## Risks + open questions

1. **LLM hallucination**: matcher returns template_ids that don't exist. Existing matcher already validates against the template set; same guard applies here.

2. **Catalog blob token cost**: ~200 templates × ~50 tokens each = ~10K tokens per call. At gpt-4o-mini pricing (~$0.15/1M input) → ~$0.0015 per query. Acceptable. At 10K queries/day → $15/day. Cache deduplication cuts this 5–10x.

3. **Confidence calibration**: the 0.7 / 0.4 cutoffs are heuristic. Will need an eval set (~30 queries, hand-labeled "should-surface / should-hedge / should-drop") to tune. Same approach as the gap-classifier Phase 1 eval.

4. **Param prefill quality**: LLM-generated params look like `{food_name: "Cuban Sandwich"}` — direct extraction. For multi-param templates (`mbti_type_a + mbti_type_b`), the LLM may only fill one. Render even partially-filled cards so the user can complete the rest.

5. **Privacy / abuse**: bot traffic could hammer the matcher endpoint, blowing up LLM cost. Apply the existing bot filter (UA regex + first-page-view exclusion) at the matcher gate. Or: only matcher-on-explicit-button (`Looking for more templates? ↻`) instead of automatic.

6. **Interaction with existing rewriter**: rewriter rewrites queries into catalog-friendly phrasings. Matcher matches queries to templates. Don't run both — if rewriter fires and finds inspirations, skip matcher. If rewriter finds nothing, matcher takes over.

7. **Multi-locale**: catalog blob today is English-heavy. For Chinese / Korean / etc. queries, matcher might miss matches because catalog descriptions are EN. Workarounds: (a) translate query before matcher, (b) include zh descriptions in catalog blob, (c) accept English bias (current rewriter behavior).

## What this unlocks beyond search

- **Long-tail SEO** — the ProgSEO use case. Every long-tail query the catalog can theoretically generate becomes a discoverable "generate this" landing page.
- **Dynamic /topics/<slug> pages** — even before a topic has content, the topic page can show "templates that can generate this topic" as a generate-grid.
- **Content gap automation** — pair with gap-classifier (Thread d open item 6); when the classifier verdicts `CONTENT_GAP_BATCH_GEN`, this matcher provides the (template, params) tuple to author the batch config.
- **In-product chat** — "I want to make X" → matcher returns templates → user picks one. Same primitive.

## File layout (when built)

```
curify-frontend/
  lib/
    searchTemplateMatch.ts          (Phase 1 — TS port of proposal_matching)
    searchTemplateMatchCache.ts     (Phase 1 — LRU)
  app/[locale]/(public)/search/
    page.tsx                        (Phase 1 — wire matcher into the data flow)
    SearchResultsClient.tsx         (Phase 1 — Section B render)
  docs/
    search-generation-bridge.md     (this spec)
```
