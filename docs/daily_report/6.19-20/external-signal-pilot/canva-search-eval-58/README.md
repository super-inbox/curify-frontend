# Canva Search — 58-query Evaluation Collection

Side-by-side comparison data from Canva template search, using the same 58 queries used for
Google Images, Bing Images, Pinterest Search, and Curify Search evaluations.

## Why 58 queries?

The eval set is 58 (not 57) because it includes `maps` (query #58), added on 2026-06-05 following a
user-reported precision issue on `/search?q=maps`. The `cat` query sometimes seen in early Google
Images examples is **not** part of the formal eval set.

## Query source

Queries are defined in `scripts/canva-search-eval/queries.ts`, which mirrors
`scripts/pinterest-search-eval/queries.ts` exactly. See `scripts/configs/search_eval_set.json`
for the canonical source with full annotation.

## What was collected

For each of the 58 queries:

- **labels / chips / filters / related suggestions** — design-type filter pills, category chips,
  and related search suggestions visible on the Canva template search result page.
- **top 10 Canva template/design results** — title, template URL, image URL, isPro flag, visible
  text — extracted from DOM without clicking into the editor.
- **two screenshots** — `canva-search-page1.png` (above the fold) and `canva-search-page2.png`
  (after scrolling ~900px).

## Canva URL Pattern

```
https://www.canva.com/templates/?query=<url-encoded-query>
```

`finalUrl` in each per-query JSON captures the actual URL after any Canva-side redirects.

## Output structure

```
docs/external-signal-pilot/canva-search-eval-58/
  README.md
  data/
    observations.json          — all 58 queries, full structure
    observations.csv           — flat CSV for spreadsheet analysis
    per-query/
      001-dan-ci.json          — query 1: 单词
      ...
      058-maps.json            — query 58: maps
    collection_progress.csv    — live progress during collection
    collection_errors.json     — per-query errors
    run.log                    — timestamped log
    validation-report.json     — validate:canva-search output
  screenshots/
    001-dan-ci/
      canva-search-page1.png
      canva-search-page2.png
    ...
    058-maps/
      canva-search-page1.png
      canva-search-page2.png
```

## How to run

```bash
# Dry run — verify query list
npm run collect:canva-search -- --dry-run

# Single query test (e.g., query 58 = maps)
npm run collect:canva-search -- --query-id 58

# Full headful collection (recommended — allows manual login/CAPTCHA handling)
npm run collect:canva-search -- --force

# Headless
npm run collect:canva-search -- --force --headless

# Validate results
npm run validate:canva-search
```

## Login wall / CAPTCHA / blocked handling

Canva may require login or show bot-detection challenges.

| Situation | Script behaviour |
|---|---|
| Cookie consent banner | Auto-accepted (Accept / Got it style buttons only) |
| Login modal, results visible behind it | Collects results, notes `"login modal present but template results visible behind it"` |
| Hard login wall (results hidden) | Pauses for manual resolution in open browser; if non-TTY marks `status = "login_required"` |
| CAPTCHA / bot detection | Pauses for manual resolution; non-TTY marks `status = "captcha"` |
| Geo / region block | Marks `status = "blocked"`, saves screenshot |

The browser profile is persisted at `.cache/canva-search-eval-profile/` (git-ignored) so login
sessions carry over between runs.

## Status values

| Status | Meaning |
|---|---|
| `ok` | >= 5 results extracted, screenshots saved |
| `ok_empty` | Page loaded, no template results |
| `partial` | Some results but below threshold |
| `blocked` | Access blocked (geo / region) |
| `login_required` | Login wall not cleared |
| `captcha` | CAPTCHA / bot detection not cleared |
| `error` | Navigation or extraction failure |

## Collection summary

_Updated after each run. See `data/validation-report.json` for full details._

| Metric | Count |
|---|---|
| Total queries | 58 |
| ok | — |
| ok_empty | — |
| blocked / login_required / captcha | — |
| error | — |
| labels=0 | — |
| topResults=0 | — |
| topResults<10 | — |
