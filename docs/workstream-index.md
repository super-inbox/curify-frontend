# Curify product workstreams — index

_Last updated: 2026-08-12 (workstream D — first measurement + P0 reset; memory table repaired). Update when a workstream doc ships a major section, a POD-tagged item lands, or the overall reframe direction shifts._

The canonical pointer for the four **product** workstreams (search, tools, growth, vertical use-cases). Companion outbound/GTM workstreams index lives separately at `~/curify-studio/gtm_tools/INDEX.md`.

## Scope

Four product workstreams that converge under the **2026-06-26 POD / Merch Design strategic reframe** — recorded in the POD reframe section of `workstream-vertical-use-cases.md`, which now carries a 2026-08-12 gating status:

- **A. Search & Content** — demand surface, intent routing, daily content drop, niche discovery
- **B. Tools (image + video)** — generic tools the platform ships (merch-grade design + mockup studio under the POD lens)
- **C. SEO + SMM + Growth Analytics** — programmatic discoverability, social distribution, conversion analytics
- **D. Vertical Use Cases** — persona-shaped packaging that turns horizontal capability into specific buyer solutions

Funnel under POD: *A finds demand → B produces design → C distributes & ranks → D packages for a named buyer with first-$100-sale path.*

> **2026-08-12 reality check on that funnel.** The D leg was measured for the first time
> and it does not currently function as described: `/use-cases/*` draws ~2 human visits/day
> in total, 0 GSC clicks, and no first-$100-sale path was ever shipped (POD-D9). All ten
> persona pages combined rank 12th of site routes. The D-workstream doc's 2026-08-12
> section carries the evidence and a five-item P0 reset; POD-D1..D4 are gated on a demand
> signal rather than queued. Read that before scoping anything in D.

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

### GTM motions that feed (or bypass) these workstreams

Outbound/GTM execution lives in `~/curify-studio/gtm_tools/INDEX.md`, but **which surface each
motion lands on is a D-workstream concern** — recorded here because the 2026-08-12 review found
none of them measurable:

| Motion | Owner doc | Lands on |
|---|---|---|
| **Outbound email** (817 sent, 475 leads) | `gtm_tools/INDEX.md` | `/tools/*` for the POD voices (259 of 475 leads); 4 legacy persona pages for the rest |
| **Thought leadership** — LinkedIn · RedNote · FB · Medium | `docs/smm-account-positioning-playbook-2026-07-05.md` | **no countable landing path** — these channels strip or forbid referrers, so referrer-based attribution structurally cannot work (UC-P0-1) |
| **RedNote need-based DM outreach** | *(no doc / no tracker — UC-P0-3)* | WeChat reply channel; nothing logged |
| **Crawling** (Pinterest / Apollo / shop harvests) | `gtm_tools/INDEX.md` | list-building only — **produced leads, never traffic**; do not count as a growth channel |
| **Enterprise AI B2B** (2nd B2B line, from 2026-07-25) | `~/curify-studio/docs/workstream-enterprise-ai-b2b.md` | **`/enterprise` — shipped 2026-08-12** (UC-P0-2). English-only, EN-only in the sitemap, footer-linked, per-CTA click tracking |

---

## POD / Merch Design reframe (2026-06-26, cross-cutting)

**Source:** 2026-06-26 strategy discussion (user-provided, Chinese). The reframe section of `workstream-vertical-use-cases.md` is the surviving record (the former memory of this name no longer exists).

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
- Weekly search-eval cadence — `node scripts/eval_search.cjs --quiet` per ~7d (memory `project_search_weekly_review`)

### B. Tools & Engineering
- **2026-06-26** POD reframe section added (POD-B1..B7) — commit `244ba7a`
- **2026-06-23** Tool inventory + productization architecture standard live at `~/curify-studio/docs/tool-inventory.md`
- **Existing POD-track precedents** ready to leverage: `dev/jayw/merch-bookmark-mockup/` (image-conditioned Gemini-3-Pro-Image pipeline → POD-B4), `dev/jayw/ecommerce-video-mini/` (URL→video → POD-B6), `561080d` image2image backend (→ POD-B3)
- **Partnership backlog**: Fourthwall Storefront API spike (held pending Eli reply)
- **Docked**: ASL captioning (no viable tech path — memory `project_asl_captioning_demand`)

### C. SEO + SMM + Growth
- **2026-08-07** State-of-play catch-up + GSC pull — non-WC impressions **1,716 → 359/day** over 2
  months (the "non-WC floor" framing is dead); canonical fold **not yet cleared** (only 1 of 13
  inspected pages recrawled since the 08-05 fix); MBTI CTR flat at 0.39%. See the dated section at
  the top of `workstream-seo-smm-growth.md`
- **2026-08-05** Blog canonical-fold fix LIVE (`f93bad79` + `c2759e55`) — client payload
  1935KB → 498KB; FB autopost reset merged (carousels killed, link→first comment)
- **2026-08-04** 八仙 native-FB-video batch scheduled 1/day 08-05→08-12 (`3ba763d`)
- **2026-07-28** VerticalPageSchema v1 — vertical domain-knowledge layer (`672c48fe`), the shift
  from "get discovered" to "why should Google rank this"
- **2026-07-24** MBTI CTR-bleed fixes (`8be3591a` title dedup, `97d552f2` lastmod) + SEMrush KD
  review: pos 40+ or absent on every head term
- **2026-07-14** Wedge1 hygiene gate PASSED (0/280); link injection found ALREADY SHIPPED
- **2026-07-11** Duplicate-canonical P0 fixed on 17,650 example pages (`3fb7b42f`)
- **2026-06-26** POD reframe section + new doc shipped (POD-C1..C11) — commit `a03ac94c`
- ~~**2026-06-26** Carousel-batch generator v2 — commit `e721e82` on `jwang/card-narration-refactor`, pending main merge → expect 6 FB carousels/day~~ **REVERSED 2026-08-04: FB carousels are the proven-dead format; `3f71edb` disabled them. Do not merge the carousel batcher as a growth ship.**
- **2026-06-26** Video-user attribution findings — `docs/video-user-attribution-2026-06-26.md` (only ~15% attributable due to 2-month user_interactions retention)
- **2026-06-23** Indexing API pushes — 10 homepage + 10 inspiration-hub URLs (structured-data error cleanup)
- **2026-06-23** Themed-day rotation + engagement-prompt captions on main — commits `93fdf60` (PR #382) + `bb90daf` (PR #384)
- **2026-06-12** Conversion-funnel auth-wall audit — `docs/conversion-funnel-auth-wall-2026-06-12.md`
- **2026-06-12** Corporate news editorial gap + business-news visualization batch — `docs/content-gap-corporate-news-editorial-2026-06-12.md` + `docs/seo-business-news-visualization-batch-2026-06-12.md`
- **2026-06-10** Programmatic batch ships — flashcard learning + travel — `docs/seo-flashcard-learning-batch-2026-06-10.md` + `docs/seo-travel-batch-2026-06-10.md`
- **Recent mega-hubs** (anti-listicle Path A): WC + sticker + packaging + makeover (tasks #102 + #104)
- **robots.txt expansion** blocking 11 more crawlers from `/nano-template/*` + `/nano-banana-pro-prompts/*` (commit `94c0e6ac`, Vercel cost reduction)

### D. Vertical Use Cases
- **2026-08-12** **First measurement of the workstream + P0 reset** — 60d `user_interactions`
  pull + GSC 28d. `/use-cases/[slug]` = **273 users / 346 events over 60 days** (12th of all
  routes, behind `/blog` and `/inspiration-hub`); **31 GSC impressions, 0 clicks** at positions
  1.0–9.0; the only genuine product action across all ten pages is **learning-material
  downloads on `for-parents`**, which hits the auth wall. **POD-D1..D10: 0 of 10 shipped**;
  D1–D4 + D7/D8/D9 now **gated on a demand signal**. Five P0s recorded (UC-P0-1..5:
  countable landing paths · ship `/enterprise` · track RedNote need-DMs · A/B the POD
  outbound CTA · unblock the learning-material download). See the dated section at the top of
  `workstream-vertical-use-cases.md`
- **2026-08-12** Persona-list correction — the doc had listed `for-esl-tutors`, `for-agencies`,
  `for-edtech`, `for-museum-shops` as live; **none of those routes ever existed**, and five
  live pages were missing from the list
- **2026-08-05→08-11** Use-case page ships (previously unrecorded): worked-case block +
  `/topics/merch` workflow-ladder reuse + full-width case layout (`ea50b1a0`, `d50f4ea1`,
  `a3bb09e6`); `for-merch-operators` copy dedupe (`1871c5ea`)
- **2026-07-11** `character-sticker-sheet` (M9 char-batch P0) wired into `for-merch-operators`
  — the first genuine POD/merch-design tool on a persona page
- **2026-07-07→07-09** GTM tighten pass — `/ip-merch-demo` + `/illustrator-demo` banners on the
  merch + designer pages (`02890505`, `9c7d5954`), merch explainer video (`6d0b78ec`), persona
  copy tightening (`cec65cd6`), product-photo tools reverted off merch (persona mismatch)
- **2026-06-26** Workstream doc created + POD reframe (POD-D1..D10) — commit `a03ac94c`
- **2026-06-07** `/use-cases/for-merch-operators` shipped (RedNote demand mining)
- **Currently live**: **10** personas on one dynamic route (`/use-cases/[slug]`) — for-parents,
  for-esl-learners, for-creators, for-designers, for-marketers, for-publishers, for-dtc-brands,
  for-programmatic-seo, for-forwarder-back-office (chip hidden), for-merch-operators. Source of
  truth is `lib/use-cases.ts`
- **Gated (not queued)** under POD reframe: `/use-cases/for-creator-merch`, `/for-pet-merch`,
  `/for-team-swag`, `/for-seasonal-pod` — four more pages on a surface drawing ~2 human
  visits/day is the wrong move until a channel feeds it
- **Demo pages live**: `/ip-merch-demo`, `/illustrator-demo`, `/progseo-demo`
- **2026-08-12** **`/enterprise` shipped** (UC-P0-2) — landing surface for the Enterprise-AI line,
  built from `enterprise-ai-capability-one-pager.md`. English-only: canonical points at the EN URL
  from every locale, sitemap emits `en` only (`ENGLISH_ONLY_STATIC_ROUTES`), consumer topic strip
  suppressed on the route, footer-linked, `enterprise::cta-*` click tracking
- **Not built**: `/pet-demo`, `/creator-merch-demo`

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

> **Repaired 2026-08-12.** The previous version of this section listed **43 memory files,
> every one of which no longer exists** — the memory store was regenerated under a new
> naming scheme at some point and this index was never updated, which meant onboarding
> step 3 ("read memory X first") had been unexecutable for weeks. The table below was
> rebuilt by listing the memory directory. **Verify before citing:** memory names are not
> stable across regenerations, so treat `MEMORY.md` (the loaded index) as authoritative and
> re-audit this table whenever a name here fails to resolve.

### Cross-workstream / strategic
| Memory | Purpose |
|---|---|
| `project_growth_drivers` | traffic × conversion — the top-level growth model |
| `project_key_actions_strategy` | remix/gen/copy/download underperform; value-ladder framing |
| `project_conversion_funnel_auth_wall` | auth wall is the dominant conversion bottleneck |
| `project_first_paying_customer_pod` | the POD wedge — WC LatAm die-cut sticker maker |
| `feedback_reuse_admin_panel` | `user_interactions` analysis → `/admin/interaction-analytics` or `app/crud/admin.py`; don't fork |
| `project_alibaba_corpus_scrape` | 43.119/47.82 /16s = 91% of raw traffic — filter before reading any volume number |
| `project_dau_activation_analysis` | refined DAU; no-action + empty-referrer = bot |

### A. Search & Content
| Memory | Purpose |
|---|---|
| `project_search_weekly_review` | weekly NORESULT/LOWRESULT → alias-family or content expansion |
| `project_visual_search_eval_framework` · `project_visual_intent_routing_eval` | eval frameworks |
| `feedback_add_searchable_topic_playbook` | tag topics[]/tags[]/aliases when adding a topic |
| `feedback_creation_vs_consumption_templates` | the two template archetypes |
| `project_section_b_evolution_options` | template matcher PARKED; Section A is focus |
| `feedback_daily_drop_i18n` · `feedback_daily_drop_rank_score` | daily-drop must ship i18n + rank_score |
| `feedback_template_subjects_pattern` · `feedback_taxonomy_vs_template_tagging_separation` | taxonomy vs template tagging |

### B. Tools & Engineering
| Memory | Purpose |
|---|---|
| `project_tooling_eng_workstream` | pointer to the Tools workstream doc |
| `project_video_image_workstream` | image→video track; read `dev/jayw/README.md` first |
| `project_design_agent_v0` · `project_packaging_mockup` | design-agent + packaging mockup specs |
| `feedback_pipeline_wrapper_architecture` | `app/pipelines/*` thin; logic in `app/utils/*` |
| `project_cdn_assets` | `public/{video,images,audio}` gitignored; CdnImage/CdnVideo + sync script |
| `feedback_image2image_prompt_hygiene` · `feedback_image2image_three_modes` | image2image conventions |

### C. SEO + SMM + Growth
| Memory | Purpose |
|---|---|
| `project_blog_canonical_fold` | 43% of blogs folded to the homepage canonical — dominant suppressor |
| `project_mbti_names_ctr_bleed` | examples folded to homepage canonical (fixed `3fb7b42f`) |
| `project_wedge1_indexation` | indexation hygiene gate |
| `reference_gsc_api_pull` | `pull_gsc_performance.cjs` + SA json; two windows → diff. No manual export |
| `project_weekly_semrush_kd` | weekly KD pull → `blog-quality.md` |
| `feedback_dedicated_blog_route_metadata` | own route folder bypasses `[slug]` generateMetadata |
| `project_fb_follower_growth` | FB autopost state (carousels dead) |
| `feedback_smm_account_positioning` | **per-account positioning — the thought-leadership motion's operating rule** |
| `project_referral_sources_2026_08` | where referrals actually come from |
| `project_geo_crawler_policy` | training crawlers blocked, retrieval/citation allowed |
| `project_negative_seo_disavow` | PBN disavow list |

### D. Vertical Use Cases
| Memory | Purpose |
|---|---|
| `project_use_case_gtm_pages` | index = `lib/use-cases.ts`; GOTCHA — untagged templates leak via the `TIER1_USE_CASES` fallback |
| `project_teacher_learning_packs_demand` | wedge = VISUAL PACKAGING, not text; no topic→pack tool |
| `project_first_paying_customer_pod` | the POD buyer we actually have |
| `project_pod_layered_tools_competitor_test` | competitor line-art test → POD-B fast-track |
| `feedback_outreach_tracker_separation` | b2b vs investor trackers — never mix (applies to the new RedNote tracker, UC-P0-3) |
| `feedback_exec_outreach_framing` | Founder/CEO/CTO — consultative audit framing, not a pitch |
| `feedback_polish_on_traffic_signal` | don't pre-polish a surface before it has visits |
| `feedback_us_federal_eligibility_greencard` | founder is a green-card holder — gates US federal bids |
| `project_investor_outreach` | investor tracker + signal-triggered cadence |

---

## How to onboard a future session into these workstreams

1. **Read this `workstream-index.md`** (you're here).
2. If the task touches a specific workstream, **open that workstream's doc** and read the section closest in time to the task (most recent dated section at top).
3. If the task is POD-tagged or touches merch/POD framing, **read the POD reframe section of `workstream-vertical-use-cases.md` first** (including its 2026-08-12 gating status), then check the POD reframe section in the relevant workstream doc.
4. **Cross-workstream dependencies** — check the "Critical cross-workstream dependencies" table above before scoping. If your task is gated on a POD-B4 / POD-C5 / POD-A2 / POD-A6 / POD-D5 ship, surface that gating in the response.
5. **Outbound/GTM *execution*** is NOT in scope of these 4 product workstreams — it lives in `~/curify-studio/gtm_tools/INDEX.md` (plus `~/curify-studio/docs/workstream-enterprise-ai-b2b.md` for the 2nd B2B line). **But which surface a motion lands on IS in scope** — see the "GTM motions" table above; as of 2026-08-12 none of the four motions is measurable, which is UC-P0-1.
6. **Out-of-scope reminders:** the daily-content-drop hongjie-patch workflow is a SEPARATE workstream (scope rule stated in the `workstream-seo-smm-growth.md` header); the customer delivery pipeline + education content supply workstreams are HELD pending triggers.
7. **Before quoting any number from this index**, check its date. Traffic figures decay fast (the non-WC base fell 79% in two months) and this index has previously carried a persona list that was wrong for weeks. Re-derive from `lib/use-cases.ts`, a fresh GSC pull, or a `user_interactions` query rather than trusting a table.
