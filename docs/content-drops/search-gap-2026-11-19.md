# Weekly search review — November 19, 2026

## Status and baseline

Previous completed core zero-click audit: November 7. November 11 ASL examples and November 16 ASL tool copy are follow-ups, not fresh full analytics cycles. This run completed fresh analytics and all public zero-card-click primary-grid inspections on November 19; **expanded external visual benchmarking is partial**, so do not advance the full end-to-end review completion date to November 19. Remediation/content drop is prepared for review, not deployed.

Isolated branch `codex/search-gap-20261119`, based on main `c338efa9`. GitHub's Vercel status for that baseline was success; live production shows the ASL examples and updated ASL tool copy. This establishes observed features, not a universal deployment fingerprint. No main merge or social publishing performed.

## Evidence and coverage

Read-only production DB; Asia/Shanghai complete days:
- Current: November 12–18; UTC `[2026-11-11 16:00, 2026-11-18 16:00)`.
- Previous: November 5–11; UTC `[2026-11-04 16:00, 2026-11-11 16:00)`.
- Sparse context: October 20–November 18, 30 days.

| Metric | Previous 7d | Current 7d |
|---|---:|---:|
| SEARCH events | 74 | 57 |
| SEARCH with attributed result-card interaction on search route | 2 | 3 |
| SEARCH with card interaction on broader destination routes | 23 | 8 |
| SEARCH with automatic redirect arrival | 35 | 22 |
| NORESULT / LOWRESULT markers | 6 / 4 | 6 / 2 |

Not impression-based CTR: markers overlap searches, and five-minute actor/session attribution can attach one click to multiple searches. Redirects are not deliberate card clicks. The small sample does not establish a quality trend or causality. Current card interactions are nonzero; no new collector outage was demonstrated.

Filtering loads current backend bot regex and test-account list without logging credentials, excludes the known test IDs, Build/MMB29P traffic, single-event actors and carousel-only no-action entries using the existing analysis helper. Eligibility is computed over the 30-day extraction window, so these counts should not be numerically compared with older reports using narrower eligibility windows. Locale is inferred from event page paths, not a guaranteed user language preference. Card interaction includes CLICK/COPY/VIDEO_CLICK for grid/template/gallery types; do not describe all of these as literal clicks.

47 query/locale/context combinations; 44 with zero result-card interaction. **33 public zero-card contexts + 3 clicked controls reviewed**, 237 primary result cards, 11 privacy/sensitivity exceptions. No frequency cutoff. The initial automatic public-query heuristic needed manual tightening; raw strings, identities and pasted inputs were not committed or replayed. Replay used a hardcoded generic-topic allowlist with tracking requests intercepted. An initial broader replay was rejected by automatic approval review before execution; the manually reviewed, file-independent allowlist was accepted.

See [full ledger](../search-audits/2026-11-19/query-audit.json) and [readable per-query review](../search-audits/2026-11-19/review.md). Redirect destinations were inspected. First ten primary cards (all when fewer) were graded exact/useful-adjacent/off-intent; ambiguous пакет remains unresolved. Screenshots inspected thumbnails, broad composition and legibility, not full factual certification of historical images. Topic galleries and template rails were noted qualitatively; their complete per-card audit is not claimed. Rewrites were live and changed between runs. Initial unloaded paper-bag thumbnails loaded on retry: no permanent broken-image claim.

## Priority changes delivered

| Demand | Live failure | Change / acceptance |
|---|---|---|
| xi'an travel poster (2 searches, 1 actor), xi`an, 回民街 | 0/10, 0/5, 0/5 subject-relevant primary results respectively; existing Xi'an trip/pagoda content not surfaced | City spelling normalization, exact-place/format constraints, one explicit Xi'an scrapbook poster with City Wall/pagoda/Muslim Quarter. Relevant example in top five, no unrelated World Cup/Japan/Brazil results in regression. |
| 纸袋 (1 search) | 0/5 relevant on reread; no paper-bag entries in either inspirations or gallery catalog | Two distinct bakery/tea carrier-bag concepts, aliases, concrete-subject constraint. Top-five discovery regression. пакет is ambiguous and is not counted as a second confirmed bag request. |
| amharic language (1 search) | 0/10 target-language results; other languages substituted | Retain Amharic identity and suppress wrong-language examples/templates. No fabricated Amharic educational content; text/language QA remains required. |
| travel maps soel (1 search with attributed interaction) | 0/7 Seoul results despite existing Seoul travel map | Normalize typo and retain city + travel/map; existing Seoul example in top five. Clicks do not excuse wrong-intent results. |
| check my credits (1 search + NORESULT) | Offered an image-generation plan for an account question | Help entry before retrieval, directing signed-in users to workspace credit indicator; no private balance exposure or purchase action. |

The constraints are bounded to observed queries, not a claim to fix semantic retrieval generally. Automated regressions use the real server page with mocked rewrite/gallery services; post-deployment live ranking remains to be checked.

## Richness, appeal and external evidence

The installed weekly skill now requires intent decomposition, use-case/style/material/format coverage, visual execution and presentation review, Pinterest/Bing benchmarking, and actionable content-opportunity briefs. [Versioned snapshot](../search-audits/2026-11-19/weekly-skill-snapshot.md).

Two design clusters were selected for a small batch, not mass generation from isolated terms:
- **Paper bags:** literal bags missing. Supply meaningful variation: natural kraft + bold cobalt/yellow bakery branding versus matte plum + botanical linework + rope-handled tea gifting. Both show front/side structure and readable identity at thumbnail size. Fictional brands; conceptual mockups, not production dielines or print-ready deliverables.
- **Xi'an:** existing travel/pagoda items are near-matches but do not replace a destination poster. New scrapbook composition prioritizes three identifiable places and readable hierarchy; it is not a route map, accurate architectural survey or opening-hours guide. One poster is a first coverage step, not a rich city collection.

Actual Pinterest pages [paper bags](https://www.pinterest.com/search/pins/?q=paper%20bag%20packaging%20design) and [Xi'an](https://www.pinterest.com/search/pins/?q=xian%20travel%20poster) were opened November 19. Login overlay prevented full inspection. Visible peripheral examples showed kraft/white/dark bags with typographic or illustrative branding; Xi'an results visibly included landmark posters and itinerary/guide layouts. These are partial observations, not a measured top-ten benchmark.

Actual Bing Images [paper bags](https://www.bing.com/images/search?q=paper+bag+packaging+design) returned unrelated diagrams in this session; [Xi'an](https://www.bing.com/images/search?q=xian+travel+poster) returned no results. This is unusable benchmark evidence, not proof that external content is absent. Screenshots saved with the ledger. Supplementary image search surfaced original design portfolios [NIMBI](https://merillangie.com/portfolio/nimbi/) and [EQ3](https://www.wedge.work/eq3), plus Xi'an poster listings; search summaries alone were not treated as completed visual comparison. No external images copied into generated assets.

## Deferred P2 work

- MBTI ESTP/INFP/INTJ: relevant but character-heavy, including repeated character treatments; evaluate non-fandom communication/comparison/worksheet formats before another character batch. External comparison still needed.
- Flashcard topic: mostly vocabulary posters; separate true card format. `flesh card` needs a spelling suggestion with negative controls, not indiscriminate silent substitution.
- Mockups & UI: split interface design from physical-product mockups; architecture similarly mixes software systems, landmarks and geographic maps. Requires taxonomy/recall review rather than ad hoc aliases.
- `car`: pizza contamination; `sing language`: sign-language prefix then unrelated spoken-language tail; Chinese Portugal World Cup query: cross-country tail. Follow-up bounded regressions and topic-tail fixes.
- `times in a day`: daily routine is only adjacent; brief morning/afternoon/evening/night materials after language/audience confirmation. Spanish greetings list: brief four context-aware greeting cards, deferred behind design batch.
- ISL/deaf: clarify language and capability; do not equate all sign languages with ASL or sell a generic science infographic as sign-language support.
- Generic generation-plan preview mismatch and exposed-result instrumentation remain open. No generation/billing action was exercised. No performance benchmark or historical causal attribution was completed.

## Content and validation

New IDs:
- `template-food-product-packaging-design-bakery-paper-bag-20261119`
- `template-food-product-packaging-design-tea-paper-bag-20261119`
- `template-vintage-travel-scrapbook-poster-xian-city-wall-muslim-quarter-20261119`

Existing templates retained with their ten-locale parent descriptions; example titles EN/ZH, canonical params and targeted aliases added. Config: `scripts/configs/search_gap_drop_2026-11-19.json`; original generation prompts in the audit directory. Source images and watermarked 480px previews visually inspected for text, composition, object structure and meaningful variation. All six uploaded CDN files returned 200 image/jpeg. Runtime static search reads the updated JSON; no Redis write needed.

Validation: 288 search/tool tests passed; TypeScript passed; content richness 101 PASS / 43 WARN / 0 FAIL across 144 queries. The new Amharic legacy warning illustrates that its broad OR scorer reports 760 hits while actual-page subject constraints correctly return zero; it is not a quality success. Persistent seven server-page regressions plus three content-eval cases added. `git diff --check` passed.

Remaining completion gates: full external visual benchmarking, deferred taxonomy/help/relevance work, reviewed merge/deployment, then live after-checks and exposure-based outcomes. This report does not claim improved production CTR or a fully completed expanded weekly cycle.
