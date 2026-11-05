# Weekly search review — November 5, 2026

Previous full review: [October 20](./search-quality-2026-10-20.md). October 21 tool routing, October 27 ASL content/entry point, and subsequent editorial drops are follow-ups. Review completed November 5 on branch `codex/search-gap-20261105`, based on main `4f4fdb85`. The deployed ASL topic returned HTTP 200 with the translator link; the November 5 changes are for review, not confirmed in production.

Read-only production interaction aggregates. Current window: Oct 29–Nov 4 inclusive; preceding: Oct 22–28; selected sparse terms also checked Oct 6–Nov 4. All are complete Asia/Shanghai calendar days. Excluded admin search-panel test accounts and backend bot UA pattern. Lowercased, collapsed whitespace, removed instrumentation suffixes. Clicks on search or locale-prefixed search routes were joined by account/session within five minutes; fixed-ID redirect arrivals are counted separately. A click near multiple searches may be attributed more than once. No private identifiers or pasted URLs are reproduced.

| Observed metric | Previous | Current |
|---|---:|---:|
| SEARCH events | 63 | 49 |
| SEARCH with example-grid/template-card interaction | 12/63 (19.0%) | 0/49 |
| SEARCH with redirect arrival | 21/63 | 19/49 |
| SEARCH with any non-redirect interaction in the window | 19/63 | 12/49 |
| LOWRESULT (with tracked tile interaction) | 3 (2) | 1 (0) |
| NORESULT | 11 | 10 |

SEARCH and result-state markers are separate events, not disjoint visitor counts. The tile measure excludes gallery cards, topic chips and tool arrivals; it is not site-wide CTR. The drop merits another measurement. Shared grid click handlers are present on mobile and desktop; this review did not establish a tracking outage, thumbnail defect, or latency regression.

| Query / signal | Finding and action |
|---|---|
| ASL video translator | Prior 10/10 and current 4/4 searches had a tool redirect; this week's four came from four distinct user/session keys. The topic-form query had 1/3 redirects this week (one key), versus 6/6 previously. The live topic CTA exists. Arrival does not establish translation completion or downstream CTA clicks. Keep routing and monitor. |
| Salvador Dalí | One search/one low-result marker; one user/session over 30 days. The existing *Persistence of Memory* example matches the accented spelling. A local server-page replay put Dali travel first for the unaccented full name and surfaced unrelated rewritten templates for the accented name. P2 retrieval fix: alias the existing record and retain the full-name subject across result paths. Both spellings now surface the painting first with its matching template. Bare Dali is unchanged. |
| Damien Hirst / flanderization | In 30 days: three Hirst searches from one key, two with a menu interaction; one flanderization search and two no-result markers from one key. No matching catalog entry. In a controlled replay with irrelevant rewrite paths, both returned wildlife and unrelated templates. Exact-query constraints now suppress those false matches. Reconsider generation if independent demand recurs. |
| Tool coverage | One `chinese costume tryon` search had no attributed interaction: pin the observed spelling to the existing tool. The registry evaluation also exposed missing coverage for image-to-PSD; add English/Chinese tasks and a reference-content negative. PSD is a coverage finding, not a measured demand spike. |

Content decision: no generated assets or new record IDs. Enriched existing `template-classical-famous-painting-analysis-cartoon-infographic-the-persistence-of-memory`. No evidenced P1 content gap; no speculative drop. Replays use the real server page with deliberately irrelevant rewrite paths and a stubbed gallery API, not live rankings.

Verification: 243 tool/search tests passed. Content richness: 99 PASS, 42 WARN, 0 FAIL across 141 queries, including all four new cases. This is not evidence of improved production CTR. Next cycle: verify deployment, remeasure tile versus gallery/tool/topic interaction separately, revisit independent demand for the two absent subjects, and track the ASL topic-to-tool step separately if downstream usage needs measurement.
