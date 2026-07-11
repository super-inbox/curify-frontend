# Search-query analytics — bot/eval pollution & CTR measurement (2026-07-09)

**Status:** #2 shipped; backend + attribution TODOs open.
**Workstream:** A. Search & Content.
**Trigger:** operator saw ~0% Result CTR across the admin "Search Queries (last 7 days)" table and `|within=` strings dominating the rows.

## TL;DR

The near-zero CTR is a **measurement/instrumentation artifact, not a results-quality or click-attribution problem**. The search-query table is ~88% distributed-crawler traffic + ~7% unauthenticated eval traffic; genuine organic search is ~5% of rows and converts at **~25% CTR** (healthy). Click attribution was verified correct.

## What `|within=` means

`X|within=Y` = user searched **X**, then clicked an "Explore further: **Y**" intent chip that narrows results to an output-type facet (infographic / flashcards / wall-art / …). Suffixes: `|rw=1` = LLM rewrite fired, `|paths=N` = N retrieval paths unioned, `|n=K` = low-result count.

Key instrumentation detail: `SearchResultsClient` fired a `SEARCH`/`search_noresult`/`search_lowresult` beacon in a **page-load `useEffect`** whenever `?within=` was set. Since the chip destinations (`/search?q=X&within=Y`) are crawlable `<Link>`s, every crawl/prefetch/refresh minted a phantom search event.

## Evidence (last 7 days, test users 155/1117/1267 excluded)

Composition of all `SEARCH*` events:

| Source | Events | Raw SEARCH | No/Low-result | Distinct sessions |
|---|---|---|---|---|
| Distributed crawlers (`within=` grid) | 596 (88%) | 219 | 377 | 596 |
| Eval actor `31.22.111.19` (likely baobao) | 48 (7%) | 23 | 25 | 6 |
| Genuine organic | 36 (5%) | 28 | 8 | 18 |

CTR split (blended headline ≈ 3.7% is misleading):

| Bucket | Searches | Result clicks | CTR |
|---|---|---|---|
| Raw typed queries | 51 | 7 | 13.7% |
| `within=` chip-narrows | 219 | 0 | 0.0% |
| **Organic only** (raw minus eval actor) | ~28 | ~7 | **~25%** |

Signatures that classify the pollution:
- **Crawlers (`within=`):** distinct IP per event, spread across 5 days, 100% anonymous, 1 event/session, `SEARCH`+`VIEW` only (zero clicks of any kind), spoofed old-browser UAs (`Android 5.0 … Build/LRX21T`, `iPhone OS 11_0`). Systematic term×facet grid = crawlers following the chip link structure.
- **Eval actor `31.22.111.19`:** real Mac UA, **not logged in**, 6 sessions, ~48 deliberate bilingual queries (ESL / aesthetics / Amazon A+ / TikTok / RedNote / 私域运营), many no/low-result, chip+escape clicks but **zero result-tile clicks**. Human eval probing coverage.
- **Attribution verified correct:** all result-tile clicks on `/search` log `current_page_route='/search'` + `NANO_INSPIRATION_EXAMPLE_GRID`/`_TEMPLATE_CARD` and attribute within the 5-min window. Not a click-logging bug.
- Baobao logged in as user **1267** fired **zero** SEARCH events in 7d/30d — her eval runs unauthenticated, so the `1267` exclusion does **not** catch it.

## Done

- **[#2] Gate the `within=` beacon behind a genuine chip click.**
  `SearchResultsClient.tsx`: chip `onClick` stamps a fresh `{slug, ts}` marker in `sessionStorage` (`WITHIN_INTENT_KEY`); the results-page effect emits the `within=` event only on a fresh matching marker (consumed once, 15s freshness). Crawlers/prefetch/direct-nav/refresh no longer log. Raw searches untouched; genuine narrows still log with result-count.
  Commit `f361f29a` (local main) → `ac66b6c4` on `jwang/vercel`.
- **Test user `1267` (lbaobao462@gmail.com) added to analytics exclusions** across `admin.py` (×6) + `search_no_result_utils.py`. Branch `jwang/exclude-test-user-1267` (commit `800707c`) in curify-studio — PR open, not merged.

## Open TODOs

- [ ] **T1 — Verify #2 post-deploy.** After `jwang/vercel` ships, re-run the composition query (below). Expect the `within=` grid to collapse from ~596/wk to just genuine human narrows (multiple facets per real session, not 1-event-per-IP). Owner: in-session, ~a few days out.
- [ ] **T2 — Attribute the eval actor.** Confirm `31.22.111.19` is baobao's search eval. Fix: have her run the eval **logged in as user 1267** so the existing exclusion catches it (IP exclusion is fragile — IPs rotate). If she can't log in, add `31.22.111.19` as a stopgap IP exclusion.
- [ ] **T3 — Backend bot filter on the §6 search CTE (`curify-studio admin.py`, lines ~1145-1201).** It currently applies test-user exclusion but **no** `_BOT_UA_REGEX`/behavioral filter (other CTEs do). UA regex alone won't catch the spoofed-browser crawlers, so reuse the refined-DAU behavioral cohort (anonymous + view-only + zero-action) or drop `within=` rows. Cleans historical/mixed data that #2 can't (go-forward only).
- [ ] **T4 — Split CTR raw vs within in the admin table.** The `|within=` marker already enables a one-line SQL split; surface `raw_ctr` and `within_ctr` separately (+ `admin_portal/js/fetchData.js` column) so operators see the real ~25%, not a blended number.
- [ ] **T5 — Resolve `punyung163@gmail.com`.** Requested as a test user to exclude but **absent** from the `"user"` table (nearest: unrelated `punkaaw@gmail.com`, user_id 732). Get the correct address, then add to the same exclusion list as 1267.
- [ ] **T6 (optional) — `nofollow`/`noindex` the `?within=` chip links** so crawlers stop discovering/generating them at the source (belt-and-suspenders with #2).

## Reference queries (psql, curify-studio backend DB)

```sql
-- Composition by source (7d), test users excluded
WITH s AS (
  SELECT content_id, action_type::text AS at, user_ip::text AS ip,
         COALESCE(user_id::text,session_id) AS who
  FROM user_interactions
  WHERE action_type::text IN ('SEARCH','SEARCH_NORESULT','SEARCH_LOWRESULT')
    AND created_at >= NOW() - INTERVAL '7 days'
    AND (user_id IS NULL OR user_id NOT IN (155,1117,1267)))
SELECT CASE
         WHEN content_id LIKE '%|within=%' THEN 'crawler within= grid'
         WHEN ip LIKE '31.22.111.19%'      THEN 'eval actor 31.22.111.19'
         ELSE 'other (organic?)' END AS source,
       COUNT(*) events,
       COUNT(*) FILTER (WHERE at='SEARCH') searches,
       COUNT(*) FILTER (WHERE at!='SEARCH') no_low_result,
       COUNT(DISTINCT who) whos
FROM s GROUP BY 1 ORDER BY 2 DESC;

-- CTR split raw vs within (7d) — see the effect of #2 over time
-- (raw ~13.7%, within ~0% pre-fix; within volume should crater post-fix)
```

## Related

- `admin.py` §6 search-query analysis + `search_no_result_utils.py` (curify-studio).
- Instrumentation lives in `app/[locale]/(public)/search/SearchResultsClient.tsx` + `SearchBar.tsx`.
- Bot-signal precedent: refined-DAU cohort (anonymous + no-action = bot) — `docs/dau-activation-analysis-2026-06-12.md` / memory `project_dau_activation_analysis`.
