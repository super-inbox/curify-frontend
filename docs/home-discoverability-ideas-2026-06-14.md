# Home discoverability ideas — 2026-06-14

Two small-effort levers proposed to lift home-page engagement, both staying inside the search + content workstream.

---

## Idea A — Mix gallery images into the home feed

**What:** Today the home feed shows template cards (each represents a generator + "click → template detail page"). Gallery prompts live separately at `/nano-banana-pro-prompts/*`. Idea: interleave gallery cards (single image + prompt + copy CTA) into the home template grid.

**Why now:**
- We have 4,117 gallery prompts vs ~270 templates — the gallery pool is 15× richer.
- Per memory `project_key_actions_strategy.md`, copy/download underperform across surfaces. Gallery cards are copy-natives — surfacing them on the highest-traffic page captures intent we currently leak.
- Per memory `project_conversion_funnel_auth_wall.md`, prompt-detail (gallery's surface) converts 47.7% vs template-page 13.6%. Putting the higher-conversion content type in front of more eyeballs is mechanically obvious.

**MVP scope:**
1. Pull the top-20 most-copied gallery prompts via admin SQL (use `user_interactions` PROMPT_COPY events, 30-day window).
2. Hardcode the list in `lib/featuredGalleryPrompts.ts` (slug + image URL + short label).
3. On home render, randomly sample 4–6 of the 20 and interleave them with template cards (every 4th-or-5th slot).
4. Click → existing `/nano-banana-pro-prompts/[slug]` route (no new routing).
5. Refresh the hardcoded top-20 list weekly (could become a script + cron later).

**Effort:** ~1–2 hours. Reuse the existing `NanoBananaPromptCard` component from `/nano-banana-pro-prompts`.

**Risks / things to think about:**
- Visual coherence — gallery cards have single image + caption, template cards have multi-example carousel. Need a layout review.
- Tracking — add a `content_type=gallery_prompt` discriminator on the home-card click event so we can A/B-evaluate.
- Cannibalization — gallery copy ≠ template generation in the funnel; we should track downstream key actions per source to confirm net lift.

---

## Idea B — Prefilled rotating search keywords

**What:** SearchBar.tsx currently shows static placeholder `"Search templates, styles, topics…"`. Idea: prefill with a rotating list of popular queries (e.g. `"argentina world cup"`, `"brazil 2002"`, `"mbti enfp"`, `"japan travel"`), rotating every 3–4 seconds.

**Why now:**
- Solves blank-search-bar paralysis — users see *what to type*, not just the abstract idea.
- Builds directly on today's bare-country routing — prefilling `"argentina"` is now a confident suggestion because the redirect lands on a populated topic page.
- Per memory `project_funnel_instrumentation_5d_check.md`, we just shipped `searchbar-focus` tracking — we'll have data to validate this in 5 days.
- The data pull behind it (top-N queries last 7d) is the same one the weekly search-evolution cycle already runs.

**MVP scope:**
1. Pull top-15 queries last 7d, filter to ones with ≥1 click (active intent).
2. Hardcode as `const POPULAR_QUERIES = [...]` constant in SearchBar.tsx (or `lib/popularQueries.ts`).
3. `setInterval` rotates the placeholder every 3500ms; pause rotation when the input is focused or has user-typed content.
4. Per-locale list (queries are localized — `"world cup"` for en, `"世界杯"` for zh, etc.).
5. Each placeholder swap fires a tracking event (`placeholder-shown:<query>`) so we can measure which prefills users actually adopt.

**Effort:** ~30 min for the component change; +1 SQL pull for the seed list.

**Risks / things to think about:**
- Animation distraction — too-fast rotation = annoying. Test at 3500ms first; allow override.
- A11y — `aria-live="polite"` on the placeholder OR don't animate for users with `prefers-reduced-motion`.
- Stale list — hardcoded list ages quickly during news-driven content cycles. Plan to refresh weekly in the search-evolution review.

---

## P0 recommendation

**Ship Idea B first.** Rationale:

1. **Lowest effort** (~30 min vs 1–2 hours).
2. **Highest immediate visibility** — every visit, every visitor.
3. **Completes a story we already started today** — bare-country routing + prefilled keywords are the two halves of "make typing easier and have it land somewhere good."
4. **Generates its own measurement** — the `placeholder-shown` + `searchbar-focus` + downstream click events will tell us if it helps within days.
5. **Zero risk to existing flows** — purely additive UI animation.

**Idea A is P1** — bigger leverage but needs:
- The top-20 SQL pull
- Visual design pass on the mixed grid (gallery vs template card shapes)
- Per-source key-action tracking to measure cannibalization

Both are within the current search + content workstream scope — same team, same surfaces.

---

## Where these slot vs other open work

| Item | Status | When |
|---|---|---|
| **Idea B — prefilled search rotation** | proposed P0 | this week (30 min) |
| Funnel instrumentation 5d data check (#78) | queued | 2026-06-17 (3 days) |
| **Idea A — gallery + template home mix** | proposed P1 | next week (1–2 hr + design pass) |
| WC schedule TZ fix Option A (#82) | queued | before 2026-06-28 |
| WC slot per-locale top queries (#65) | needs #78 data first | post-2026-06-17 |
| WC top-queries content fidelity (#66) | rolling | as queries surface |
| MBTI mass enrichment (#79) | queued | when bandwidth |
| audit_taxonomy_completeness.cjs (#56) | queued | when bandwidth |
