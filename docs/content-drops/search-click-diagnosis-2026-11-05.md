# Search click decline: production diagnosis, November 5

## Release status

PR #606 remains open. Its checks and Vercel preview succeeded. An explicit merge attempt was rejected by GitHub's main-branch ruleset: one approving review and approval of the last push are required. Auto-merge is disabled. No admin bypass was used; no production release is claimed.

## Is the click collector broken?

Not reproduced in current production. Isolated, unauthenticated Playwright desktop (1360×950) and mobile viewport (390×844) sessions opened the live Salvador Dali search and clicked its painting example. Both sent a CLICK event with type NANO_INSPIRATION_EXAMPLE_GRID and route /search; both requests returned 200. A read-only DB check confirmed a matching synthetic event persisted. HeadlessChrome is excluded by the bot filter, so these synthetic events do not enter the reported human aggregates. This tests current Chromium behavior, not every browser or historical request.

Using the same two complete Shanghai-time weekly windows and exclusions as the weekly report:

| Raw CLICK events | Oct 22–28 | Oct 29–Nov 4 |
|---|---:|---:|
| Search-route example grid | 10 | 0 |
| Search-route gallery | 1 | 0 |
| Whole-site example grid | 354 | 348 |
| Whole-site template card | 40 | 42 |
| Whole-site gallery | 89 | 34 |
| Search-route topic chips | 11 | 9 |
| Search-route tools | 2 | 1 |

The absence of search-route card clicks survives a raw route-level count: it is not merely failure of the five-minute join. The collector is nevertheless receiving other events on search and hundreds of card clicks elsewhere.

## Measurement limitations

The previous 12/63 is searches with an attributed card interaction, not 12 unique clicks: the preceding week has 10 raw grid clicks, and a click can be attributed to several nearby searches. Neither that value nor 0/49 is impression-based CTR.

SEARCH is emitted at the search bar before navigation, including direct tool/topic destinations; direct URL searches with healthy results do not consistently emit SEARCH. SearchResultsClient emits thin/empty markers separately. The denominator is therefore neither all search-page visits nor exposed cards.

The current week also has card interactions within five minutes of searches on topic, template and gallery-tag pages. The narrow /search numerator excludes them. Route-level counts cannot be added as unique conversions because their search sets can overlap.

P1 measurement follow-up: log one search-results-render event per search/navigation ID with actual rendered counts, track visible card impressions and rank, carry that search ID through result clicks and tool/topic destinations. Separate automatic arrivals, explicit clicks and generation completions. Do not infer card exposure from SEARCH or combine marker events as disjoint searches.

## Search quality is also demonstrably imperfect

Live rendered production pages, including client content:
- Salvador Dali: painting first in these live runs, but Dali travel remains in the examples and Travel Planning Map in the template rail. This differs from the earlier controlled replay order because live rewrite outputs vary. PR #606 suppresses the wrong-entity results, not merely reorders a fixed list.
- basketball rules: the basketball rules example is first, followed by basketball celebrities/evolution and eventually soccer, badminton, futsal and a Havoc in Heaven character scene. Relevant content exists; expansion dilutes the original subject and requested format.
- map of france: French wine-region map first, followed by Paris images and France maps, then recipes and other countries. This needs subject-plus-format ranking/constraints rather than more generic France assets.

P1 relevance follow-up: preserve the original subject AND requested format across expansion/rewrite paths, rank exact answers before adjacent inspiration, and put optional broader suggestions in a distinct section rather than merging them into the primary results. Add basketball-rules and France-map negative controls to the actual server-page evaluation before changing ranking. These observed queries are low-volume: the samples demonstrate defects, not a causal explanation of the entire weekly decline.

## Conclusion

A current global click-instrumentation failure is not supported. Search-page card clicks really fell to zero in the filtered records; the headline denominator/attribution is incomplete, and production relevance defects are independently reproducible. Improve both measurement and relevance, then compare post-deployment cohorts. Historical causality cannot be determined without reliable per-search exposures.
