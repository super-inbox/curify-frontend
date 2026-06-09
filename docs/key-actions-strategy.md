# Key Actions — Strategy Notes

> Status: **thinking / parked** (2026-06-09). Captured while the focus shifts to
> growing the user base; revisit when we invest in conversion. This is a framing
> doc, not a plan — add to it as thinking develops.

## The problem

Key actions — **CLICK, COPY, GENERATE, REMIX, FAVORITE, SHARE, DOWNLOAD** — across
our many surfaces (home, search, topic pages, gallery/`nano-banana-pro-prompts`,
template detail, example detail, carousel, inspiration-hub) "aren't doing well."

What exists today:
- Admin-portal analysis SQLs (`/admin/interaction-analytics`, `curify_background`
  `app/crud/admin.py`), bot-filtered via the inline `_bot_free_cte` chain.
- Template + example **ranking** that weights key actions (KA) against clicks.
  Current replication score: `click + 5·copy + 10·generate + 8·remix`.

The gap: we measure actions in **aggregate counts**, ranked by **fixed guessed
weights**. That's enough to rank content, not to reason about *why* actions
underperform or *what to fix*.

## Five reframes

### 1. Actions are a value LADDER — measure the leak, not the count
`VIEW → CLICK → COPY → GENERATE/REMIX → DOWNLOAD/SHARE`. "Generate is low" is
ambiguous until we know which rung leaks:
- **Discovery** leak — not enough VIEW→CLICK into detail/example.
- **Intent** leak — CLICK but no GENERATE/REMIX.
- **Fulfillment** leak — GENERATE started, no DOWNLOAD/SHARE.

Each leak has a different fix. We need **per-surface step-conversion funnels**, not
totals.

### 2. Separate value-CAPTURING from value-LEAKING actions
- **Capturing:** on-platform GENERATE/REMIX → signup → paid.
- **Potentially leaking:** COPY-prompt (paste into ChatGPT/elsewhere) and
  DOWNLOAD-and-leave (grab asset, bounce). These are intent we may be *losing*.

Yet the score rewards COPY (×5). Open question: is COPY a positive KA, or a
churn-to-competitor signal we should be *converting away from* ("generate it here
instead")? SHARE is ambiguous too — viral growth vs. leaving.

### 3. Give each surface ONE job (surface↔action fit)
Most "underperformance" is a surface↔action mismatch.
- **Discovery surfaces** (home, search, topic, gallery, inspiration-hub): job =
  **CLICK-through** to detail/example. Their KA is the click, not generate.
- **Conversion surfaces** (template detail, example detail, carousel): job =
  **GENERATE/REMIX** — the value moment; buttons should work hardest here.

Measuring all actions equally on all surfaces hides which surface is failing at
*its own* job.

### 4. Calibrate weights to downstream value (don't conflate ranking with UX)
The 5/10/8 weights are guesses. The right weight for an action ≈ how strongly it
predicts what we actually want (return visit, signup, paid). If GENERATE doesn't
predict retention, weighting it 10× is miscalibrated. And: the KA-vs-clicks score
is the right tool for **what to surface** (ranking), the wrong tool for **what UX
to fix** (conversion) — keep them separate.

### 5. Name the north-star action
Pick the single action that most moves the business — almost certainly
**on-platform GENERATE**. Then every other action is either a *step toward it*
(optimize the funnel) or a *substitute that leaks* (reconsider). That one decision
reorganizes the entire metric set.

## Open questions / decisions

- Is COPY (and DOWNLOAD) net-capturing or net-leaking? Should COPY's positive
  weight be removed or inverted?
- What is the north-star action, and does it correlate with retention/conversion?
- Per surface: what is the single primary action it should drive?
- Are the KA weights empirically justified, or should they be re-derived from
  downstream value?

## Proposed next analysis (when picked up)

Extend the admin analytics from "actions per template/example" to **surface-level
step-conversion funnels**: per surface, the VIEW→CLICK→GENERATE→DOWNLOAD rates, so
we can locate the leak and classify actions as capturing vs leaking. **Reuse**
`/admin/interaction-analytics` + the bot-free CTE — do not fork a new puller
(see the "reuse admin panel" convention). This is analysis-first; UX/weight
changes follow the leak diagnosis.
