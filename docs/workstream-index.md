# Curify product workstreams — index

_Last updated: 2026-06-26. Update when a workstream doc ships a major section, a POD-tagged item lands, or the overall reframe direction shifts._

The canonical pointer for the four **product** workstreams (search, tools, growth, vertical use-cases). Companion outbound/GTM workstreams index lives separately at `~/curify-studio/gtm_tools/INDEX.md`.

## Scope

Four product workstreams that converge under the **2026-06-26 POD / Merch Design strategic reframe** (memory `project_pod_merch_strategic_reframe_2026_06_26.md`):

- **A. Search & Content** — demand surface, intent routing, daily content drop, niche discovery
- **B. Tools (image + video)** — generic tools the platform ships (merch-grade design + mockup studio under the POD lens)
- **C. SEO + SMM + Growth Analytics** — programmatic discoverability, social distribution, conversion analytics
- **D. Vertical Use Cases** — persona-shaped packaging that turns horizontal capability into specific buyer solutions

Funnel under POD: *A finds demand → B produces design → C distributes & ranks → D packages for a named buyer with first-$100-sale path.*

---

## The four workstream docs

| # | Workstream | Doc | Repo |
|---|---|---|---|
| A | Search & Content | [`search-and-content.md`](search-and-content.md) | curify-frontend |
| B | Tools & Engineering | [`workstream-tooling-and-engineering.md`](../../curify-studio/docs/workstream-tooling-and-engineering.md) | curify-studio |
| C | SEO + SMM + Growth | [`workstream-seo-smm-growth.md`](workstream-seo-smm-growth.md) | curify-frontend |
| D | Vertical Use Cases | [`workstream-vertical-use-cases.md`](workstream-vertical-use-cases.md) | curify-frontend |

Other product workstream docs (single-track, not part of the four):
- [`workstream-agentic-image-rong.md`](workstream-agentic-image-rong.md) — agentic image (rong)
- `~/curify-studio/docs/workstream-customer-delivery-pipeline.md` — customer delivery 4-gap punch list (held)
- `~/curify-studio/docs/workstream-education-content-supply.md` — education content supply 2-phase plan (held)

---

## POD / Merch Design reframe (2026-06-26, cross-cutting)

**Source:** 2026-06-26 strategy discussion (user-provided, Chinese). Memory `project_pod_merch_strategic_reframe_2026_06_26.md`.

**Thesis:** recenter Curify around Merch Design + POD as the primary revenue surface. 28 work items POD-A1..POD-D10 land in the 4 docs above. Each item is namespaced — `POD-A*` in Search, `POD-B*` in Tools, `POD-C*` in SEO+SMM+Growth, `POD-D*` in Vertical Use Cases.

| Workstream | Items | Anchor section |
|---|---|---|
| A. Search & Content | POD-A1..A6 (6) | `## 2026-06-26 — POD / Merch Design strategic reframe` in `search-and-content.md` |
| B. Tools | POD-B1..B7 (7) | `### POD / Merch Design strategic reframe — 2026-06-26` in `workstream-tooling-and-engineering.md` |
| C. SEO+SMM+Growth | POD-C1..C11 (11) | `## POD / Merch Design strategic reframe — 2026-06-26` in `workstream-seo-smm-growth.md` |
| D. Vertical Use Cases | POD-D1..D10 (10) | `## POD / Merch Design strategic reframe — 2026-06-26` in `workstream-vertical-use-cases.md` |

**Critical cross-workstream dependencies:**
- **POD-B4** (realistic mockup generator, reuses `dev/jayw/merch-bookmark-mockup/` precedent) gates POD-D7/D8/D9 (sample lib, demos, first-$100 path)
- **POD-C5** (marketplace listing optimizer) gates POD-D9 + POD-C6 (programmatic POD-niche hubs)
- **POD-A2** (daily trending SKU drop) gates POD-D4 (seasonal vertical)
- **POD-A6** (subject↔merch mapping) gates POD-A1 (intent classifier UX)
- **POD-D5** (`lib/use-cases.ts` `commerce_shape` field) is shared infra — blocks nothing but should land before POD-D1..D4 commit to routing

**Top-3 sequencing across all four:**
1. **POD-B1 + POD-A6 + POD-D5** in parallel — shared infra
2. **POD-B4** — single biggest unblocker
3. **POD-D1 + POD-D2** (creator-merch + pet) — fastest to ship, highest conversion per page visitor

---

## Current progress (recent ships — most recent first)

### A. Search & Content
- **2026-06-26** POD reframe section added (POD-A1..A6) — commit `a03ac94c`
- **2026-06-25** Search retrieval improvement plan landed — `docs/search-retrieval-improvement-plan-2026-06-25.md`
- **2026-06-17** Template matching A vs B audit — `docs/template-matching-section-a-vs-b-2026-06-17.md`
- **2026-06-15** Visual intent routing eval framework — `docs/eval-framework-visual-intent-routing-2026-06-15.md`
- **2026-06-14** Visual search benchmark + taxonomy gap audit (Canva/Pinterest) — `docs/eval-framework-visual-search-benchmark-2026-06-14.md`, `docs/taxonomy-gap-canva-pinterest-2026-06-14.md`
- **2026-06-03** World Cup expansion plan section in `search-and-content.md`
- Weekly search-eval cadence — `node scripts/eval_search.cjs --quiet` per ~7d (memory `project_weekly_search_eval.md`, last_run_date 2026-05-22)

### B. Tools & Engineering
- **2026-06-26** POD reframe section added (POD-B1..B7) — commit `244ba7a`
- **2026-06-23** Tool inventory + productization architecture standard live at `~/curify-studio/docs/tool-inventory.md`
- **Existing POD-track precedents** ready to leverage: `dev/jayw/merch-bookmark-mockup/` (image-conditioned Gemini-3-Pro-Image pipeline → POD-B4), `dev/jayw/ecommerce-video-mini/` (URL→video → POD-B6), `561080d` image2image backend (→ POD-B3)
- **Partnership backlog**: Fourthwall Storefront API spike (held pending Eli reply)
- **Docked**: ASL captioning (no viable tech path — memory `project_asl_captioning_demand`)

### C. SEO + SMM + Growth
- **2026-06-26** POD reframe section + new doc shipped (POD-C1..C11) — commit `a03ac94c`
- **2026-06-26** Carousel-batch generator v2 (global template-first selection) — commit `e721e82` on `jwang/card-narration-refactor`, pending main merge → expect 6 FB carousels/day
- **2026-06-26** Video-user attribution findings — `docs/video-user-attribution-2026-06-26.md` (only ~15% attributable due to 2-month user_interactions retention)
- **2026-06-23** Indexing API pushes — 10 homepage + 10 inspiration-hub URLs (structured-data error cleanup)
- **2026-06-23** Themed-day rotation + engagement-prompt captions on main — commits `93fdf60` (PR #382) + `bb90daf` (PR #384)
- **2026-06-12** Conversion-funnel auth-wall audit — `docs/conversion-funnel-auth-wall-2026-06-12.md`
- **2026-06-12** Corporate news editorial gap + business-news visualization batch — `docs/content-gap-corporate-news-editorial-2026-06-12.md` + `docs/seo-business-news-visualization-batch-2026-06-12.md`
- **2026-06-10** Programmatic batch ships — flashcard learning + travel — `docs/seo-flashcard-learning-batch-2026-06-10.md` + `docs/seo-travel-batch-2026-06-10.md`
- **Recent mega-hubs** (anti-listicle Path A): WC + sticker + packaging + makeover (tasks #102 + #104)
- **robots.txt expansion** blocking 11 more crawlers from `/nano-template/*` + `/nano-banana-pro-prompts/*` (commit `94c0e6ac`, Vercel cost reduction)

### D. Vertical Use Cases
- **2026-06-26** Workstream doc created + POD reframe (POD-D1..D10) — commit `a03ac94c`
- **2026-06-07** `/use-cases/for-merch-operators` shipped (RedNote demand mining)
- **Currently live**: 8 verticals — dtc-brands, esl-tutors, publishers, agencies, edtech, museum-shops, forwarder-back-office, merch-operators
- **Queued landing pages** under POD reframe: `/use-cases/for-creator-merch`, `/use-cases/for-pet-merch`, `/use-cases/for-team-swag`, `/use-cases/for-seasonal-pod`
- **Demo pages live**: `/ip-merch-demo`, `/illustrator-demo`, `/progseo-demo`
- **Demo pages queued**: `/pet-demo` (POD-D2), `/creator-merch-demo` (POD-D1), `/pptx-edit` (memory `project_pptx_edit_polish_pattern.md`)

---

## Cross-cutting docs (referenced by multiple workstreams)

| Doc | Workstreams | Purpose |
|---|---|---|
| [`programmatic-seo-topic-hubs.md`](programmatic-seo-topic-hubs.md) | C, A | Topic-hub SEO framework |
| [`interconnection.md`](interconnection.md) | C, D | Blog ↔ use-case ↔ tool cross-link layer |
| [`search-quality.md`](search-quality.md) | A | Internal search quality status + audit |
| [`blog-quality.md`](blog-quality.md) | C | Blog quality improvement track (P0/P1 telltales) |
| [`blog-writing-guidelines.md`](blog-writing-guidelines.md) | C | Authoring conventions |
| [`blogs-hub-and-spoke-architecture.md`](blogs-hub-and-spoke-architecture.md) | C | Hub/spoke blog architecture |
| [`onboarding-runbook.md`](onboarding-runbook.md) | D, C | Onboarding flow runbook |
| [`key-actions-strategy.md`](key-actions-strategy.md) | C, D | Conversion key-actions framework |
| [`gallery-tag-taxonomy.md`](gallery-tag-taxonomy.md) | A | Gallery tag → topic registry mapping |
| [`gap-classifier-phase1.md`](gap-classifier-phase1.md) | A | Content-gap classification |
| [`home-discoverability-ideas-2026-06-14.md`](home-discoverability-ideas-2026-06-14.md) | C | Homepage discoverability options |
| `~/curify-studio/docs/tool-inventory.md` | B | Tool inventory + maturity table |
| `~/curify-studio/docs/dau-activation-analysis-2026-06-12.md` | C | DAU activation analysis |
| `~/curify-studio/docs/scaling-audit-2026-06-10.md` | B, C | Infra scaling audit |
| `~/curify-studio/docs/reengagement-2026-06-01.md` | C | Reengagement analysis |

---

## Memory entries (persist across sessions; pull when relevant)

### Cross-workstream / strategic
| Memory | Purpose |
|---|---|
| `project_pod_merch_strategic_reframe_2026_06_26.md` | The 2026-06-26 POD reframe — read first for any POD-tagged work |
| `feedback_workstream_scope_growth_seo_blogs.md` | Workstream scope discipline — daily-drop is SEPARATE workstream |

### A. Search & Content
| Memory | Purpose |
|---|---|
| `project_daily_template_workflow.md` | hongjie28-patch-N onboarding recipe (separate workstream) |
| `project_weekly_search_eval.md` | Weekly eval cadence reminder |
| `feedback_search_event_weighting.md` | NORESULT + LOWRESULT weight=1 per query rollup |
| `feedback_topic_registration_checklist.md` | New tier-2/3 topic checklist (registry + TOPIC_GALLERY_TAG + i18n) |
| `feedback_template_topic_source_of_truth.md` | nano_templates.json is the source (NOT taxonomy.json) |
| `feedback_daily_drop_gallery_fetch.md` | Fetch curify-gallery before sync_nano_inspiration |

### B. Tools & Engineering
| Memory | Purpose |
|---|---|
| `feedback_curify_frontend_cdn_helper.md` | Use `toCdnUrl`, not raw `cdn()` |
| `feedback_demo_image_use_cdn_helper.md` | Demo pages must wrap images with `toCdnUrl()` |
| `feedback_test_artifacts_to_tmp.md` | Review-only test outputs → `/tmp/`, not gallery/frontend trees |
| `feedback_video_default_visuals_only.md` | Template-to-video defaults `WITH_NARRATION=False` |
| `reference_batch_image_generation.md` | `scripts/generate_template_examples.cjs` mature pipeline |
| `reference_autopost_pipeline.md` | Autopost pipeline (Twitter + FB hash-bucketed) |

### C. SEO + SMM + Growth
| Memory | Purpose |
|---|---|
| `reference_curify_canonical_url.md` | Canonical URL = `curify-ai.com` (NOT `curify.ai`) |
| `reference_gsc_api_access.md` | GSC + Indexing API programmatic access |
| `reference_growth_analytics.md` | `app/crud/admin.py` 7-query analytics module |
| `reference_video_user_attribution.md` | Video user channel attribution script + findings |
| `feedback_gsc_weekly_review.md` | Weekly GSC export reminder (~7d cadence) |
| `feedback_gsc_bot_pattern_exclusion.md` | Bot-pattern queries inflate GSC on analysis-titled pages |
| `feedback_indexing_api_default_skip.md` | Don't auto-fire on every new blog |
| `feedback_indexing_api_reindex_flux.md` | Expect 1-3d SERP flux after a push |
| `feedback_indexing_api_all_locales.md` | Submit all 10 locales explicitly |
| `feedback_blog_lastmod_bump.md` | Bump `lastmod` in `blogs.json` when editing title/meta |
| `feedback_blog_slug_pipeline.md` | `/blog/[slug]` ≠ only — many dedicated route folders bypass it |
| `feedback_blog_quality_workflow.md` | Two tracks (bleeder CTR rewrite vs significant rewrite) |
| `feedback_blog_draft_default_tighter.md` | Aim ~1,700w on first pass |
| `feedback_bundled_blog_ship_pattern.md` | Bundle 3-5 posts in one window (autotranslate batch saves 30-50 min) |
| `feedback_gsc_serp_emulation.md` | GSC query → crawl top SERP → emulate methodology |
| `reference_interconnection_layer.md` | Blog ⇄ use-case ⇄ tool cross-link audit |
| `reference_i18n_autotranslate.md` | Run `scripts/i18n_autotranslate.cjs` for i18n work |
| `feedback_fb_carousel_size_cap.md` | FB carousel cap 3-8 (not API max 10) |
| `feedback_template_ship_nano_i18n.md` | New template ships need nano.json i18n entries |
| `feedback_topic_gallery_reverse_map.md` | Tag-to-topic reverse map uses `EXTRA_TAG_TO_TOPICS` |

### D. Vertical Use Cases
| Memory | Purpose |
|---|---|
| `reference_vip_clients_roster.md` | 15 VIPs across 7 verticals; `b2b_clients.json` `vip:true` schema |
| `reference_merch_operators_vertical.md` | Merch operators demand mining (R/printondemand + 张总) |
| `reference_gallery_demos.md` | Gallery demo assets for tools/SEO pages |
| `feedback_tool_ship_persona_remapping.md` | Live-only persona ↔ tool mapping policy |
| `project_merch_imagery_backlog_2026_06_18.md` | RedNote refs — NO reposts (copyright) |
| `project_demo_illustrator_pickscale.md` | Future `/illustrator-demo` spec (generate → pick → scale) |
| `feedback_factory_language_for_merch_icp.md` | Manufacturer/OEM/ODM vocabulary for ICP search |
| `feedback_cn_b2b_solution_framing.md` | CN factory copy = solution-shape, not anti-replacement |

---

## How to onboard a future session into these workstreams

1. **Read this `workstream-index.md`** (you're here).
2. If the task touches a specific workstream, **open that workstream's doc** and read the section closest in time to the task (most recent dated section at top).
3. If the task is POD-tagged or touches merch/POD framing, **read `project_pod_merch_strategic_reframe_2026_06_26.md` memory first**, then check the POD reframe section in the relevant workstream doc.
4. **Cross-workstream dependencies** — check the "Critical cross-workstream dependencies" table above before scoping. If your task is gated on a POD-B4 / POD-C5 / POD-A2 / POD-A6 / POD-D5 ship, surface that gating in the response.
5. **Outbound/GTM tasks** are NOT in scope of these 4 product workstreams — those live in `~/curify-studio/gtm_tools/INDEX.md`.
6. **Out-of-scope reminders:** the daily-content-drop hongjie-patch workflow is a SEPARATE workstream (memory `feedback_workstream_scope_growth_seo_blogs.md`); the customer delivery pipeline + education content supply workstreams are HELD pending triggers.
