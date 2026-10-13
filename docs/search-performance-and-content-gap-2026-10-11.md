# Search performance and content gap review

Search delays come from synchronous query expansion plus repeated CPU work. Show deterministic results first, move LLM expansion and the gallery rail behind independent loading boundaries, and precompute immutable search text. The content drop adds four examples under three existing templates. It does not change search behavior.

Investigation began October 10 and completed October 11, 2026, Shanghai time. Production baseline: `ea0a032e`. Isolated branch: `codex/search-gap-20261010`.

## Performance evidence

Live HTTP GET measurements from the operator machine, with a non-bot diagnostic user agent. These are individual samples of full response completion, not browser paint timings or p95. Next streams a shell before the search results, so TTFB alone understates the wait.

| Query | TTFB | Full response | Response bytes |
| --- | ---: | ---: | ---: |
| bilingual vocabulary poster | 1.84 s | 2.52 s | 737,609 |
| chinese celestial realm | 1.29 s | 5.93 s | 794,250 |
| isfp and enfp compatibility | 1.78 s | 5.14 s | 595,120 |
| chinese celestial realm, crawler path | 1.44 s | 2.01 s | 565,102 |

The crawler path skips the LLM rewrite. Its 3.92-second difference includes both the network call and additional scoring/rendering; it is not a direct measurement of OpenAI latency. Results differ between these paths, and network/cold-start variability remains.

The actual server `SearchPage` was also invoked locally with translation/header/gallery dependencies stubbed and rewriting disabled. Fifteen calls across five queries took 276–503 ms each. A temporary memoization experiment around `normalizeForSearch` reduced warm calls to 75–162 ms; the first call still took 551 ms. This experiment was reverted and is not production code. It demonstrates avoidable normalization cost, not a production SLA improvement.

### Bottlenecks and proposed fixes

1. **Blocking expansion.** `app/[locale]/(public)/search/page.tsx` awaits `getMultiQueryPaths` when the initial strict-result count is below five, before returning `SearchResultsClient`. `lib/searchRewrite.ts` sets an 8-second per-attempt timeout but does not override the installed SDK's default two retries. Timeout failures can therefore approach 24 seconds plus retry backoff. Set `maxRetries: 0` for interactive rewriting and a small end-to-end budget; serve base results immediately and progressively add expanded results. A general loading shell alone does not unblock actual results. [Next.js streaming guidance](https://nextjs.org/learn/dashboard-app/streaming) and [OpenAI SDK retry configuration](https://github.com/openai/openai-node/blob/main/README.md).
2. **Repeated full-catalog normalization.** Each `scoreQueryTokens` invocation reconstructs full/title/topic text for every inspiration, including character-by-character Traditional-to-Simplified conversion. Each rewrite/decomposition repeats it. Build these immutable fields once per catalog revision (prefer a build-time index, or a bounded server module index), cache localized template blobs, and reuse precompiled token matchers. Keep per-query scores separate. The temporary unbounded string memoizer was only a diagnostic and should not ship.
3. **Unbounded gallery wait.** The page awaits tag lookups serially after scoring. `services/api.ts` stores a nominal 10-second timeout but never attaches an abort signal, so it does not enforce that timeout. Give the optional gallery its own deadline and loading boundary; compose caller cancellation and retain existing Next cache tags/revalidation. This is a verified code risk, not a measured cause for the three free-text samples above.
4. **Extra work and payload.** Search builds feed cards for the entire template registry and filters afterward, even though `buildNanoFeedCards` accepts `templateIds`. Pass the matched IDs in rank order. Audit the client payload and paginate the results: measured HTML/RSC responses are approximately 565–794 KB. Measure browser hydration and image loading before choosing a client-side optimization.
5. **Cache scope and observability.** Rewrite caching is process-local, not shared across deployments/instances. Add in-flight deduplication and a versioned shared cache if traffic warrants it. Instrument base scoring, rewrite, expansion scoring, gallery, serialization, and result-ready time; compare warm/cold p50/p95 and failure rates after implementation.

Implement 1–3 first. Preserve retrieval/ranking semantics and verify both first-result time and final relevance. No search code changes were included in this content drop because this request asked for diagnosis and a proposed fix.

## Demand evidence and attribution

Started with the existing admin `interaction-analytics?sections=search_queries` endpoint. Followed with the existing `search_cycle5_pull.py` attribution SQL in a read-only transaction, correcting instrumentation suffix normalization, repeated spaces, locale-prefixed search routes, and the test-user exclusion list. Retained its same-user/session five-minute attribution window, bot filter, click-target detail, and redirect bucket. This is observational attribution; nearby searches can share clicks. Seven- and thirty-day windows were read again on October 11, so counts differ from the October 10 admin snapshot.

The October 11 filtered seven-day window had five `asl video translator` searches and four `asl · american sign language` searches with no attributed search click. The thirty-day equivalents were 21 and 13. These are primarily navigation/tool signals, not image-content demand. Direct server-page checks route the former to `/en/tools/asl-video-translator` and the latter to `/en/topics/asl`.

**Attribution defect:** ordinary topic redirects and tool redirects omit `from_search`; only the special World Cup redirect branches attach it. Therefore even the redirect-aware analysis cannot classify all successful navigation. Add a consistent landing event/marker for both tool and topic routes and report tool arrivals, topic arrivals, result clicks, generation attempts, and true abandonment separately. There is also a typed/direct-link routing discrepancy for `asl · american sign language`: `matchToolIntent` identifies the tool, while the server's earlier topic match wins. Make those paths consistent before calling it a catalog failure.

| Signal | Evidence | Decision |
| --- | --- | --- |
| Chinese celestial realm and Chinese heavenly-palace scene | Normalized English request: 2 searches in 30 days, one no-result event; Chinese scene: 1 search. Click targets were generation/auth controls, not existing results. No celestial scene existed in the catalog. | Generate two original mythological scene posters. These fill still-image coverage only; video plus a named soundtrack remains a separate product request. |
| ISFP and ENFP compatibility | 1 search in 7/30 days; search focus and menu escape, no result tile click. Five deterministic results existed but the leading example was a four-type animal chart. | Generate an exact-pair communication infographic with no numerical compatibility claim. |
| banchan | 2 searches in 30 days, no attributed clicks; no banchan record or deterministic result. | Generate a six-dish Korean side-dish identification guide. |
| Godfather | 1 no-result-click search, but a movie-poster example already exists. | Review preview and noisy tags before generating duplicates. |
| ASL, transcript, dubbing, pasted video URLs | Tool/task intent; generic image output does not fulfill it. | Fix routing, attribution, and tool handoff. Do not inflate the image gallery with irrelevant content. |

These counts justify a small exploratory drop, not broad demand claims. The banchan framing follows the Korean Food Promotion Institute's description of dishes accompanying rice. [KFPI source](https://www.hansik.or.kr/magazines/list/magazineDetail/146/3877).

## Content drop and checks

Four original 1024×1536 images were generated with built-in imagegen, visually reviewed, processed with the existing tiled Curify watermark helper, and resized to 480×720 previews. Each uses an existing translated parent template; all ten parent-template locale entries were verified. Catalog aliases include exact observed subjects and relevant English/Chinese/Korean synonyms. No soundtrack, video, or scientific compatibility claim was attached.

Regeneration briefs are in `scripts/configs/search_gap_2026-10-11.json`. Eight unique JPEGs were uploaded non-destructively to `gs://curify-static/images/nano_insp/` and `nano_insp_preview/`; every CDN URL returned HTTP 200 and `image/jpeg` before publication. Existing catalog records are byte-preserved: four appended entries, zero deletions.

Actual server retrieval with LLM and gallery disabled:

| Query | Before | After | New example rank |
| --- | ---: | ---: | --- |
| chinese celestial realm | 0 | 2 | 1 and 2 |
| 南天门 | 0 | 1 | 1 |
| 凌霄宝殿 | 0 | 1 | 1 |
| isfp and enfp compatibility | 5 | 6 | 1 |
| banchan | 0 | 1 | 1 |
| korean side dishes | 1 | 2 | 1 |

The 137-query regression suite reports 95 PASS, 42 WARN, 0 FAIL both before and after. Warnings predate the drop. `npm run i18n:check` passed. Unique IDs, valid template parameters, all parent locales, and preservation of existing records passed. Raw analytics, URLs pasted by visitors, and local profiling artifacts remain outside the committed report.

After deployment, compare result clicks for these subjects over complete seven-day windows, keep generation/auth clicks distinct, and avoid a CTR-lift claim until enough new searches exist.
