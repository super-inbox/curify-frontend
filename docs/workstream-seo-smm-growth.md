# Workstream: SEO + SMM + Growth Analytics — Scope

> Defined 2026-06-26. This is the scope/definition of the "SEO + SMM + Growth
> Analytics" workstream. Living doc. Per memory `feedback_workstream_scope_growth_seo_blogs.md`,
> this workstream's scope = growth / SEO / blogs only (the daily-content-drop
> hongjie-patch workflow is a SEPARATE workstream).

This workstream has three legs that converge on one outcome: **measurable
revenue + retention growth** for the platform and (under the 2026-06-26 POD
reframe) for the merchants who use it.

---

## 1. SEO — programmatic discoverability

**In scope:**
- Topic-hub pages at `/topics/<slug>` (~99 unlocalized + ~50 localized today)
- Tool detail pages at `/tools/<slug>`
- Use-case landing pages at `/use-cases/<slug>` (cross-references workstream D)
- Blog content at `/blog/<slug>` (~50+ live posts; backlog tracked in
  `project_blog_*.md` memory)
- Sitemap + canonical URL discipline (memory `reference_curify_canonical_url.md`)
- GSC + Indexing API loop (memory `reference_gsc_api_access.md`)

**Anchors:**
- `docs/seo-funnel-audit-2026-06-26.md` — **headline diagnosis: 87% of sitemap pages are invisible to Google; 76% of clicks from 3 WC posts; 5 wedges to grow from 213→10k clicks/day**
- `docs/wedge1-indexation-rescue-scope-2026-06-26.md` — **W1 scope (7 work items, 4-5 weeks, +770-1,930 clicks/day projected over 8 weeks)**
- `docs/wedge1-hygiene-findings-2026-06-26.md` — **W1.7 findings: 4,859 of 25,764 sitemap URLs are intentionally noindex (710 thin topics + 4,149 non-EN tag pages); 2 new sitemap-cleanup gates added before link injection**
- `scripts/audit_gsc_full.cjs` + `scripts/seo_funnel_audit.py` + `scripts/sample_invisible_pages.cjs` — re-runnable audit pipeline

**W1.7a + W1.7b shipped 2026-06-26 on `jwang/vercel`:**
- Commit `a0a12ab4` — `app/sitemap.xml/route.ts`: filter noindex topics via `isLocalizedTopic()` + collapse tag pages to EN only. Sitemap URL count 25,764 → 20,905 (-4,859). NO direct click lift expected; success criteria = sitemap coverage 13.4% → ~17% over 4-8 weeks via `seo_funnel_audit.py` re-run. Re-audit checkpoint: 2026-07-24.
- Commit `14db8c81` — audit pipeline + 4 findings/scope docs.

**W1.1 + W1.4 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `c5eea10e` — new `HomeDiscoveryStrip.tsx` server component renders below `HomeToolsStrip` with two chip rows: top-36 enabled topics (sorted by template count) linking to `/topics/*`, and all live use-cases (filtered by `hiddenFromChips`) linking to `/use-cases/*`. Wired through `HomeClient` via a new `discoveryStrip: ReactNode` prop. i18n: 4 keys under `home.discovery`, autotranslated to all 9 non-EN locales. Verified on dev: /en renders 41 unique `/topics/*` + 9 unique `/use-cases/*` outbound links; zh works with localized chip titles. Expected lift: +220-530 clicks/day over 4-8 weeks. Re-audit checkpoint: ~2026-08-21.
- Commit `a7f8911d` (follow-up fix) — silenced MISSING_MESSAGE warnings for the 27 stub topic entries (have `.displayName` only, missing `.title`/`.description`/`.keywords`). Three layered fixes: new `FULLY_LOCALIZED_TOPIC_IDS` set + `isFullyLocalizedTopic()` helper in topicRegistry_pure; filter applied in HomeDiscoveryStrip (41 → 39 unique chips); `t.has()` pre-check added to `makeSafeTranslator` and the topics-page metadata safeT so missing-key lookups never trigger next-intl's dev warning.

**W1.2 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `39831424` — new `ExampleRelatedTopics.tsx` server component at the bottom of `/nano-template/[slug]/example/[id]`. Expands the template+example topic seed via tier-1 ancestors + tier-2 parents + curated related entries (from `getTier1Ancestor`/`getParentTopic`/`getRelatedTopics` in topicRegistry_pure), all filtered through `isFullyLocalizedTopic`, capped at 8 chips. i18n: 2 keys under `nanoTemplate.relatedTopics`, autotranslated to all 9 non-EN locales. Verified on dev (Brazil WC example): 12 unique `/topics/*` outbound links (was ~7 before); "Related topics" / "相关主题" section renders cleanly. Tonnage: ~88k new internal links across 17,650 example URLs — biggest single source of authority injection in W1. Expected lift: +300-600 clicks/day in 6-10 weeks. Re-audit checkpoint: ~2026-09-04.

**W1.3 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `7bbf5eff` — new `BlogRelatedHubs.tsx` server component renders below `BlogCTACard` on `/blog/[slug]`. Two-tier mapping at `utils/blog-related-hubs.ts`: per-slug curated entries for high-traffic blogs (WC + mega-hubs + sticker + MBTI) + category-derived defaults for the long tail. Filters through `isFullyLocalizedTopic`, capped at 6 chips. i18n: 2 keys under `nanoTemplate.blogRelatedHubs`, autotranslated to all 9 non-EN locales. Verified on dev: brazil-argentina blog gets world-cup+posters+sports chips; category-defaulted blogs get the category's default topic; zh locale renders 浏览相关主题. Tools NOT surfaced (BlogCTACard already handles). Caveat: covers only `/blog/[slug]` pipeline — the 33 dedicated route folders bypass this ship (memory `feedback_blog_slug_pipeline.md`). Most top-traffic blogs ARE on the [slug] pipeline so impact lands on the right surfaces. Expected lift: +200-500 clicks/day in 4-8 weeks. Re-audit checkpoint: ~2026-08-21.

**W1.5 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `2b8df121` — new `PromptTryInTool.tsx` server component on `/nano-banana-pro-prompts/[id]`. Adds one outbound /tools/* link per prompt detail (~4,117 pages, previously zero outbound to tools). Two-tier match in `promptToolMatch.ts`: tag-based override (product / manga / subtitle / style etc.) + round-robin default across live tools (status=create|demo) via prompt-id hash. Bug caught + fixed during dev: nanobanana.json carries NUMERIC ids, `simpleHash` returned 0 silently on a number — fixed by stringifying. i18n: 3 keys under `nanoTemplate.promptTryInTool`, autotranslated to all 9 non-EN locales. Verified on dev: 5 sampled prompts distribute across 4 distinct /tools/* slugs (round-robin works); zh locale renders 在 Curify 工具中尝试此功能. Expected lift: +30-100 clicks/day in 4-8 weeks (smaller than topic-chip wedges since each prompt picks ONE tool, but compounds with task #103 once AI-assistant crawlers are unblocked).
- `docs/programmatic-seo-topic-hubs.md` — the topic-hub framework
- `docs/search-quality.md` — internal search quality (companion to A workstream)
- `docs/interconnection.md` — blog ↔ use-case ↔ tool cross-link layer
- `docs/blog-quality.md` — quality improvement track (P0/P1 fluff telltales)
- `docs/search-retrieval-improvement-plan-2026-06-25.md` — retrieval plan
- `docs/eval-framework-visual-search-benchmark-2026-06-14.md` + `docs/eval-framework-visual-intent-routing-2026-06-15.md` — search eval framework
- `docs/home-discoverability-ideas-2026-06-14.md` — homepage discoverability
- `docs/content-gap-corporate-news-editorial-2026-06-12.md` + `docs/seo-business-news-visualization-batch-2026-06-12.md` — corporate news editorial
- `docs/seo-flashcard-learning-batch-2026-06-10.md` + `docs/seo-travel-batch-2026-06-10.md` — programmatic batch ships
- `docs/taxonomy-gap-canva-pinterest-2026-06-14.md` — taxonomy gap audit
- `docs/template-matching-section-a-vs-b-2026-06-17.md` — template matching A/B
- `docs/video-user-attribution-2026-06-26.md` — channel attribution for video users

**Recent ships worth tracking:**
- 4 mega-hubs (anti-listicle Path A): WC + sticker + packaging + makeover (tasks #102 + #104)
- robots.txt expansion blocking 11 more crawlers from `/nano-template/*` + `/nano-banana-pro-prompts/*` (task #105, commit 94c0e6ac) — Vercel cost reduction
- Indexing API pushes: 10 homepage URLs (brand SERP cleanup), 10 inspiration-hub URLs (structured-data error cleanup 2026-06-23)

## 2. SMM — Social Media Marketing / autopost

**In scope:**
- Autopost pipeline in `curify-studio/curify_background/` (Twitter + FB; the
  hash-bucketed slots framework in `app/utils/autopost_utils.py`)
- Pinterest lead-discovery (memory `reference_pinterest_lead_discovery.md`)
- RedNote → WeChat funnel for CN factory leads (memory `feedback_cn_vertical_reply_channel.md`)

**Anchors:**
- `~/curify-studio/curify_background/app/utils/autopost_utils.py` — selection + posting core
- `~/curify-studio/curify_background/app/utils/facebook_client.py` — FB single-photo + carousel publish
- `~/curify-studio/gtm_tools/pinterest_lead_discovery_keywords.md` — Pinterest ICP keywords

**Shipped to main:**
- Themed-day rotation (Mon=MBTI → Sun=specialty cadence) — commit `93fdf60`, merged via PR #382
- Engagement-prompt captions (FB + Twitter) — commit `bb90daf`, merged via PR #384

**On `jwang/card-narration-refactor`, pending merge to main:**
- Carousel-batch generator v1 (bucket-then-group) — commit `0fc94ce`
- Carousel-batch generator v2 (global template-first selection) — commit `e721e82` (2026-06-26)
- v2 supersedes v1: the bucket-then-group strategy hit 0 carousels in practice because
  MD5 across 400 buckets spread popular families too wide (e.g. `template-vocabulary`'s
  168 items max-out at 2-in-bucket). v2 picks the template family GLOBALLY by slot+theme,
  slides a CAROUSEL_MAX-sized window per slot. Tested against the real corpus: 24/24
  simulated slots produce a carousel. Cap = 3-8 photos (memory `feedback_fb_carousel_size_cap.md`).
- Once merged, expect 6 FB carousels/day replacing the current single-photo broadcast.

**Queued (not started):**
- Group-aware FB routing (use item `topics` to pick 5-10 relevant groups vs blanket cross-post)
- Spam-risk audit on cross-post volume

## 3. Growth Analytics

**In scope:**
- iDAU bot-filter / DAU
- Actions per Route rollups
- Session Engagement Funnel by landing route
- Search Queries (NORESULT / LOWRESULT rollups, query-level weight=1 per memory
  `feedback_search_event_weighting.md`)
- GSC pulls (weekly cadence per memory `feedback_gsc_weekly_review.md`)
- Video-user attribution
- Conversion-funnel + auth-wall analysis

**Anchors:**
- `~/curify-studio/curify_background/app/crud/admin.py` — the 7-query analytics
  module (memory `reference_growth_analytics.md`)
- `scripts/pull_gsc_performance.cjs` + `scripts/submit_indexing_api.cjs`
- `~/curify-studio/dev/jayw/admin_analysis/` — ad-hoc analysis scripts
  (funnel pulls, search-eval cycles, video-user attribution)

**Date-stamped findings docs (most recent first):**
- `docs/video-user-attribution-2026-06-26.md` — channel + landing mix for
  208 video-project users; only ~15% attributable (2-month user_interactions
  retention vs 11-month project history); script at
  `~/curify-studio/dev/jayw/admin_analysis/video_user_attribution.py`
  (memory `reference_video_user_attribution.md`)
- `docs/conversion-funnel-auth-wall-2026-06-12.md` — auth-wall conversion audit
- `~/curify-studio/docs/dau-activation-analysis-2026-06-12.md` — DAU activation
- `~/curify-studio/docs/scaling-audit-2026-06-10.md` — infra scaling audit
- `~/curify-studio/docs/reengagement-2026-06-01.md` — reengagement analysis

**Indexing API operational notes:**
- 3-day API → UI lag vs 1-day GSC UI lag (memory `reference_gsc_api_access.md`)
- 1-3d SERP-position flux after a push (memory `feedback_indexing_api_reindex_flux.md`)
- Default-skip on new blogs — fire only on explicit request (memory `feedback_indexing_api_default_skip.md`)
- Submit all 10 locales (memory `feedback_indexing_api_all_locales.md`)

---

## POD / Merch Design strategic reframe — 2026-06-26

Workstream reframe per 2026-06-26 strategy discussion. **Curify recenters around
Merch Design + POD as the primary revenue surface.** This workstream's job under
the POD lens: turn the Tools-track output (mockups, designs, ad creatives) into
**measurable revenue** — for Curify (membership credits) and for the merchants
who use the platform.

The reframe collapses the three legs into one mental model:
*Curify is the **Merchant Growth Engine** — it produces the design, distributes
it, and proves the conversion.*

Companion deltas live in:
- `curify-frontend/docs/search-and-content.md` → demand-sensing + intent routing
- `curify-studio/docs/workstream-tooling-and-engineering.md` → POD design + mockup tooling
- `curify-frontend/docs/workstream-vertical-use-cases.md` → 4 high-margin POD niche packages

### Reframe in one paragraph

Today the SMM track is a *broadcast* loop (post Curify gallery + template
examples on Twitter+FB on a hash-bucketed cron). Under POD, SMM becomes a
*conversion* loop — the social post is the top of a funnel that goes
mockup → click → product detail → checkout. SEO shifts from "rank Curify pages"
to *also* "help Curify merchants rank on Etsy/Shopify/Amazon". Growth analytics
shifts from "DAU/session" to *also* "design conversion rate" — which Curify
design types actually sell?

### Work items (POD lens)

#### SMM track

| # | Title | Effort |
|---|---|---|
| POD-C1 | **One-click cross-platform distribution** — from a Curify mockup (POD-B4 output) → Pinterest / Instagram / TikTok Shop / FB Marketplace. Extend `autopost_utils.py` with a `merch_mockup` post type that carries product + price + checkout-URL metadata, plus per-platform copy variants. Lives under existing GALLERY_BUCKETS / NANO_INSPIRATION_BUCKETS pattern but new bucket | 1wk |
| POD-C2 | **Platform-trend feedback loop** — instrument click + save + repin rates by design *style* and *platform*. Surfaces "Pinterest converts 2.4× better on vintage-illustration than photoreal for sticker SKUs". Feeds back to the Tools workstream as new style-preset requests (POD-B3) and to the Search workstream as ranker weighting (POD-A1) | 3-5d |
| POD-C3 | **Themed-day rotation extended for POD** — current themed-day rotation (Mon-Sun cadence in `93fdf60`) is template-centric. Add a parallel POD rotation: e.g. *Sticker Sunday / Apparel Monday / Mug Tuesday* — each day pushes a curated batch from POD-B4 mockups with category-tuned hashtags | 2-3d |
| POD-C4 | **WeChat / RedNote outbound pack for CN factory leads** — productize the current ad-hoc "WeChat share pack" work item (W4 in `project_merch_imagery_backlog_2026_06_18.md`) into a script that takes a CN factory persona + product category → outputs a 5-8-image deck ready for WeChat paste. Reply channel is WeChat not email (memory `feedback_cn_vertical_reply_channel.md`) | 2-3d |

#### SEO track

| # | Title | Effort |
|---|---|---|
| POD-C5 | **Marketplace listing optimizer (Etsy / Shopify / Redbubble / Amazon Merch)** — net-new merchant-facing tool. Input: design + product category. Output: long-tail-keyword-optimized title, description, tag set ranking in each marketplace's internal search. Each marketplace has different ranking signals (Etsy weights tags heavily; Amazon weights title + bullets). Built as a `curify-frontend` route `/tools/listing-optimizer` + a `curify_background` pipeline | 1.5-2wk |
| POD-C6 | **Programmatic SEO: POD-niche topic hubs** — extend `programmatic-seo-topic-hubs.md` framework with a *POD-niche* page anatomy: `/pod-niches/[slug]` for queries like *"funny dachshund t-shirt designs"*, *"engineer sarcasm mug designs"*. Each page surfaces: trending designs (from POD-A2 daily drop) + the mockup tool (POD-B4) + a *"sell this on Etsy"* CTA into POD-C5 | 1wk Phase 0, 2-3wk to scale |
| POD-C7 | **Blog hub for POD operators** — new blog category `pod-operators` with persona-shaped posts (e.g. *"How to test 20 designs / week on Etsy without burning ad budget"*, *"Sticker SKU velocity wall: 20-design problem"* — see `reference_merch_operators_vertical.md` for Reddit demand mining). 3-5 P0 posts. Cross-links into POD-C5 + POD-C6 | 1wk for first 3, then weekly cadence |
| POD-C8 | **Curify ↔ merchant cross-link layer** — extend `interconnection.md` mapping tables with `pod-niche → tool/blog/use-case` mappings so the new POD-C6 pages aren't dead-ends. Mirrors the existing tier-1 topic ↔ use-case wiring | 2-3d after C6 |

#### Growth Analytics track

| # | Title | Effort |
|---|---|---|
| POD-C9 | **Design conversion-rate analytics** — extend `app/crud/admin.py` with a query bank: which design style → most mockup-clicks → most listing-optimizer runs → most outbound-share fires. Net new metric: "design conversion funnel" alongside the existing engagement funnel. Requires event-logging discipline in POD-B4/B6/C5 from day 1 | 1wk (3d for events, 2d for queries, 2d for admin panel rendering) |
| POD-C10 | **Niche-discovery weekly report** — automate the POD-A4 output as a weekly admin-only report: top 20 underserved POD niches surfaced from SEARCH_NORESULT + GSC zero-CTR + Pinterest search-volume + Reddit demand-mining. Drives blog cadence (POD-C7) and Tools roadmap (POD-B3 style presets) | 3-4d, then weekly cron |
| POD-C11 | **Merchant-side cohort analytics** — once a small POD-merchant userbase exists (post POD-C5 ship + first 50 merchant signups), instrument cohort retention + per-merchant SKU yield. Gates monetization decisions (membership pricing, credit cost) for the POD track | gated on POD-C5 + 50 merchant signups |

### Why this belongs as its own workstream (vs scattered across SEO + SMM + Analytics)

Under the pre-POD framing, SEO + SMM + Analytics were three loosely-coordinated
channels driving generic traffic to a generic platform. Under POD, the three
become **one funnel for one customer (the POD merchant)** — design produced by
Tools, distributed by SMM, ranked by SEO, measured by Analytics. Splitting them
across docs hides the funnel; unifying them here surfaces it.

### Sequencing recommendation

1. **POD-C9** events first (3d) — instrument before the new tools ship,
   otherwise we ship blind same as the recurring lesson from the existing
   mini-tools
2. **POD-C1 + POD-C3** next in parallel (SMM extensions, low-risk, reuse
   existing autopost machinery)
3. **POD-C5** (1.5-2wk) — the listing optimizer is the merchant-facing hero
   feature; gates POD-C6 / POD-C7 / POD-C11
4. **POD-C7** in parallel with C5 (blog content has independent value)
5. **POD-C6 + POD-C8** after C5 (programmatic SEO + cross-link layer)
6. **POD-C2 + POD-C4** as the social distribution machine matures
7. **POD-C10 + POD-C11** are the measurement loops — start C10 once C7 needs
   weekly content fuel; start C11 when there's a merchant cohort to measure

### Open questions

- Listing-optimizer (POD-C5) is the biggest single item. Should it ship as a
  one-shot generator (lowest-friction MVP) or as an Etsy/Shopify *integration*
  (higher-stickiness but slower to build)? MVP first, integrate based on
  conversion signal.
- POD-C6 programmatic pages risk duplicate content vs existing `/topics/` and
  the WC-style strategic-reframe expansion plans. Need an explicit canonical /
  taxonomy answer before scaling past Phase 0.
- Does POD-C11 require its own analytics database table (`pod_merchant_events`)
  or can it ride on the existing `user_interactions` schema with a discriminator?
  (Probably the latter — 2-month retention limit on `user_interactions` is the
  main risk per memory `reference_video_user_attribution.md`.)

---

## Related docs / threads
- `docs/search-and-content.md` — Search & Content workstream (companion A)
- `~/curify-studio/docs/workstream-tooling-and-engineering.md` — Tools workstream (companion B)
- `docs/workstream-vertical-use-cases.md` — Vertical Use Cases workstream (companion D)
- `docs/programmatic-seo-topic-hubs.md` — SEO programmatic framework
- `docs/interconnection.md` — cross-link layer
- `docs/blog-quality.md` — blog editorial track
- `~/curify-studio/curify_background/app/crud/admin.py` — growth analytics queries
- `~/curify-studio/curify_background/app/utils/autopost_utils.py` — SMM autopost
- `~/curify-studio/gtm_tools/pinterest_lead_discovery_keywords.md` — Pinterest playbook
