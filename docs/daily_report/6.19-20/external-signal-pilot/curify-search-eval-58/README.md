# Curify Search 58-Query Collection

Side-by-side companion to `docs/external-signal-pilot/google-image-eval-58/`.

## What this is

Batch collection of Curify search results for the same 58 queries used in the Google Images eval,
enabling a direct surface-level comparison:

- **Google Images** → what users expect to see for these queries "in the wild"
- **Curify Search** → what Curify actually returns today

## Collected fields per query

| Field | Description |
|-------|-------------|
| `labels` | Intent chips (`?intent=`), topic chips (`?within=`), related-topic links — all clickable chips near the search results |
| `topResults` | Up to 10 result cards from the Examples grid and Templates rail |
| `screenshots.page1` | First viewport after page load |
| `screenshots.page2` | One scroll (~900px) below page1 |
| `redirected` | Whether `/search?q=` redirected to another page |
| `redirectType` | `"topic"` when redirected to `/topics/<slug>` |

## Query set

- **58 queries** — exact same list as `scripts/google-image-eval/queries.ts`
- **cat is NOT in the set** — cat was only used as a Google Images debugging example, not a formal eval query
- Why 58 and not 57: query #58 (`maps`) was added 2026-06-05 following a user-reported precision issue
- Query 1: `单词`
- Query 35: `动物 词汇` (note the space)
- Query 48: `Spanish vocabulary printable` (capital S)
- Query 49: `ESL flashcards printable` (all caps ESL)
- Query 58: `maps`

## Curify base URL

Default: `http://localhost:3000/en`

Override with: `CURIFY_BASE_URL=http://localhost:3001/en`

## How to run

```bash
# Start dev server first
npm run dev

# Dry run
npm run collect:curify-search -- --dry-run

# Full collection
CURIFY_BASE_URL=http://localhost:3000/en npm run collect:curify-search -- --force

# Validate
npm run validate:curify-search
```

## Data layout

```
data/
  observations.json        — master JSON (all 58 queries)
  observations.csv         — flat CSV for spreadsheet analysis
  collection_progress.csv  — lightweight status tracker
  run.log                  — append-only run log
  validation-report.json   — output of validate:curify-search
  per-query/
    001-dan-ci.json
    ...
    058-maps.json
screenshots/
  001-dan-ci/
    curify-search-page1.png
    curify-search-page2.png
  ...
  058-maps/
    curify-search-page1.png
    curify-search-page2.png
```

## Redirect handling

- Collector always starts at `/search?q=<query>`
- If the page redirects (e.g. `maps` → `/topics/map`), `redirected: true` is recorded
- Labels and top-10 are collected from the final page, not the original `/search` page
- No production code is modified to bypass redirects

## Empty / error handling

- **`ok_empty`**: Page loaded successfully but returned 0 result cards; screenshots are still saved
- **`error`**: Server error or navigation failure; error message and debug screenshot saved; collection continues with next query

## Collection summary

Populated after running `npm run validate:curify-search`.
