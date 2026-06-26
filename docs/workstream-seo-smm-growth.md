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
- `docs/programmatic-seo-topic-hubs.md` — the topic-hub framework
- `docs/search-quality.md` — internal search quality (companion to A workstream)
- `docs/interconnection.md` — blog ↔ use-case ↔ tool cross-link layer
- `docs/blog-quality.md` — quality improvement track (P0/P1 fluff telltales)

## 2. SMM — Social Media Marketing / autopost

**In scope:**
- Autopost pipeline in `curify-studio/curify_background/` (Twitter + FB; the
  hash-bucketed slots framework in `app/utils/autopost_utils.py`)
- Themed-day rotation (shipped 2026-06-23, commit 93fdf60)
- Engagement-prompt captions (shipped 2026-06-23, commit bb90daf)
- Pinterest lead-discovery (memory `reference_pinterest_lead_discovery.md`)
- RedNote → WeChat funnel for CN factory leads (memory `feedback_cn_vertical_reply_channel.md`)
- Carousel batching + group routing (queued, not merged to main)

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
