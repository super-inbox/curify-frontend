# Research Environment — Vertical Content Professionalism Research v2 (Run 2)

Recorded once for the whole research run, instead of per-row in
`COMPETITOR_RESEARCH_RESULTS.csv`. Fill in the actual values here before or during Phase 1 manual
search; leave a field blank rather than guessing if it's not yet known.

- **research_run_id:** `vertical-content-professionalism-research-v2-run2`
- **search_locale:** _(not yet set — e.g. `us`, `en-US`)_
- **search_language:** _(not yet set — e.g. `English`)_
- **browser_mode:** _(not yet set — e.g. `incognito` / `logged-out`)_
- **google_login_state:** _(not yet set — e.g. `logged_out`)_
- **search_date:** _(not yet set — the actual date each vertical's searches are run; may differ per
  vertical if Phase 1 spans multiple sessions)_

## Ranking counting rules

- Only organic, non-ad, non-sponsored results count toward `organic_rank`.
- Rank position is counted from 1, organic-only (ads, "People also ask", image/video packs, and other
  non-organic SERP features do not consume a rank number).
- If a query's target result (or Curify's own page) is not found within the checked range, record
  `not observed within top N organic results` in the relevant field — never guess or estimate a rank.
- `checked_rank_range` (per row, in `COMPETITOR_RESEARCH_RESULTS.csv`) records how far down the
  organic results were actually checked for that query (e.g. `top 20 organic`), so a blank/negative
  result is falsifiable rather than ambiguous.
