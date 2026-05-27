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
