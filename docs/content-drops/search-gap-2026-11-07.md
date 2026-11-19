# Complete zero-click search quality audit — November 7, 2026

Previous review: November 5; PR #608 merged November 5 at 11:50 UTC. This run starts from main 71255692 in an isolated worktree. No visitor private paths, URLs, identities or pasted gloss text are included.

## Evidence and coverage

Read-only production aggregates for Oct 31–Nov 6 inclusive, Asia/Shanghai (UTC bounds Oct 30 16:00–Nov 6 16:00); previous comparison Oct 24–30. Current: 53 SEARCH events, 2 with attributed result-card interactions, 20 with automatic redirect arrivals, 11 NORESULT markers and 1 LOWRESULT marker. Previous: 54 SEARCH events, 11 with card interactions, 17 redirect arrivals. These markers are not disjoint visits and the ratio is not impression-based CTR. Same-account/session five-minute attribution can attach a click to multiple searches. Bot UA and admin test-account filters retained. Gallery cards included with example/template cards.

46 zero-card-click candidate queries: **40 public queries inspected completely**, 6 privacy exceptions (one local image path, two source URLs, two pasted ASL gloss passages, one other private input). 243 visible cards were reviewed across 26 image-result queries; the remaining 14 public queries had tools or empty/help pages. No minimum-frequency cutoff. Default English-site live replay; original visitor locale and past dynamic rewrites cannot be reconstructed from this aggregate. Thumbnail review checks broad subject, legibility and link alignment, not full factual certification of historic images.

See [every query and its first ten cards](../search-audits/2026-11-07/review.md), [per-result grades](../search-audits/2026-11-07/query-audit.json) and [remaining content briefs](../search-audits/2026-11-07/content-briefs.json). All live test tracking requests were intercepted, so replay did not change production statistics.

## Changes

- Existing gallery retrieval: exact title **Glamour Under the Spotlight** (750) and a visually checked leggings outfit (4152) enter the curated search/detail index. The leggings image shows black leggings and a turquoise shirt; display metadata corrected to match. Original source/prompt attribution preserved.
- Subject preservation: basketball rules retains basketball AND rules; Chinese costume requires actual costume identity; pizza box no longer accepts recipes merely because generic tags mention boxes. Also constrain kite, leggings, Kazakhstan/Tajikistan, badge and weather/season results. These are bounded audited cases, not a general semantic search solution.
- Normalize kazahkstan, weaather and seasons, llaveros. Route wc-portugal through the existing World Cup country route.
- Task/help entry points: my videos/my workplace → workspace; generic translate → tool choices; Spanish video requests → workflow/help guidance; upload-duration question → explanation. Local file paths get upload instructions without echoing them or invoking rewriting. Slide-link import is not promised. Ambiguous combine gets clarification.
- New content: template-science-education-infographic-how-a-kite-flies-20261107 under the existing science-education template. Bilingual force labels and short English reading, visually checked for direction/text. Original image and preview watermarked and uploaded; both CDN URLs returned 200 image/jpeg. Fills 风筝 and reading about kite.
- Installed weekly skill now requires complete 5–10-result review, visual/catalog evidence, explicit exception counts, per-result grades and before/after tests. [Versioned snapshot](../search-audits/2026-11-07/weekly-skill-snapshot.md).

## Remaining work

P2 briefs: flanderization, pizza-box concept, Kazakhstan country/map, Tajikistan country/map, actual pin/badge design. Only the kite batch was generated. Kazakhstan has a costume near-match but lacks country/map coverage. A pizza-box mention in a party image is not a packaging example; a tiny emblem/selling-point badge is not a badge-design deliverable.

Box/hot women/transformation need disambiguation rather than invented intent. Broad sport has two off-topic event cards and needs a separate recall-preserving regression design. Global exposure/click funnel work from November 5 remains outstanding; this change does not establish improved CTR.

## Release and validation

276 search/tool integration tests and TypeScript pass. Legacy content eval: 99 PASS, 42 WARN, 0 FAIL across 141 queries. Tests use the actual server page with irrelevant rewrite paths and isolated gallery API. These are deterministic regressions, not predictions of live LLM rewrites. Catalog, curated index, saved audit cases and weekly tracker updated. Assets uploaded; code/content records remain on the review branch until merged and deployed.
