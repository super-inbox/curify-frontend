# Workstream: Vertical Use Cases — Scope

> Defined 2026-06-26. **Last updated 2026-08-12.** This is the scope/definition of
> the "Vertical Use Cases" workstream — the product-side surface that packages
> Curify's horizontal capabilities (Tools / Search / Growth) into vertical-specific
> solutions for defined personas. Living doc. **Read the 2026-08-12 evidence review
> first** — it supersedes the 06-26 roadmap's assumptions.

This workstream owns the **persona → solution → conversion** packaging layer.
Horizontal capabilities live in the Tools / Search / SEO+SMM+Growth workstreams;
this workstream binds them into coherent vertical offerings that a target buyer
can adopt as a unit.

---

## 2026-08-12 — evidence review: the persona pages are not a demand surface

_First measurement of this workstream since it was defined. Sources: `user_interactions`
60d pull (2026-06-13 → 08-12, bot-UA + Alibaba-scrape-IP filtered, method per memory
`feedback_reuse_admin_panel` + `project_alibaba_corpus_scrape`); GSC 28d window
`raw/gsc-2026-08-03/` (2026-07-06 → 08-02); `lib/use-cases.ts` @ `a3bb09e6`;
`gtm_tools/` send tooling + trackers._

### Headline

**Every GTM motion we run either bypasses the persona pages or produces no measurable
traffic to them.** The pages rank #1–3 on their own terms, and nothing searches for
those terms. Over 60 days the whole `/use-cases/*` surface drew **273 user-keys / 346
events** — 12th of all routes, behind `/blog` (259) and `/inspiration-hub` (254), a
quarter of `/tools/[slug]` (1,030), a third of the homepage (783), and ~0.1% of
`/carousel/template-example` (87,483). After removing Googlebot (`66.249.*`: 43
user-keys, 0 actions, 10 locales) and the 1-event/0-action datacenter ranges, true
human traffic is on the order of **~2 visits/day across all ten pages**.

The conclusion is not "the pages are badly built" — it is that **this layer was
scoped as a demand-capture surface and it has no demand to capture**. Its only
defensible job is as a *named-account landing surface*, and today almost no channel
lands on it.

### Traffic + engagement, per page (60d)

| Page | users | actions | acting users | act rate | did any value action anywhere |
|---|---:|---:|---:|---:|---:|
| `for-parents` | 47 | 11 | 7 | 14.9% | 5 |
| `for-designers` | 45 | 21 | 11 | 24.4% | 5 |
| `for-merch-operators` | 45 | 21 | 10 | 22.2% | 4 |
| `for-creators` | 36 | 0 | 0 | **0%** | 0 |
| `for-marketers` | 34 | 4 | 1 | 2.9% | 1 |
| `for-esl-learners` | 33 | 15 | 2 | 6.1% | 2 |
| `for-programmatic-seo` | 20 | 6 | 5 | 25.0% | 2 |
| `for-publishers` | 12 | 3 | 2 | 16.7% | 2 |
| `for-dtc-brands` | 8 | 5 | 1 | 12.5% | 1 |
| `for-forwarder-back-office` | 5 | 0 | 0 | **0%** | 0 |

"Value action anywhere" = the same user-key fired GENERATE / REMIX / DOWNLOAD / COPY /
SEARCH / FAVORITE / SHARE anywhere on the site inside the window: **22 of 285 (7.7%)**.

### What the 74 action events actually were

Mostly **site chrome, not the page** — `header_home`, `header_tools`, the topbar strip,
`searchbar-focus`, and use-case→use-case chips. People land, don't find the page useful,
and navigate back out. The page's own elements:

| Element | events / users | Where |
|---|---:|---|
| Tool cards | 19 / 5 | 13 of 19 from one user on `bilingual-subtitles` (for-esl-learners) |
| Example grid | 7 / 6 | chibi football stickers, vintage collage, abstract portrait — for-merch-operators |
| **Template downloads (learning materials)** | **5 / 2** | for-parents only: `english-top5-phrases`, `english-error-correction`, `english-word-difference-infographic`, `word-scene` |
| Demo banners | 3 / 3 | `illustrator-demo` ×2, `ip-merch-demo` ×1 — for-merch-operators only |
| Related-blog links | 2 / 2 | for-merch-operators |
| Auth-modal hits | 2 / 2 | `download_learning_material`, `tool-launch:speech-translator` |

Onward navigation *from* a use-case page across the whole window: **5 events**, four of
them for-esl-learners → blog posts.

**The one real signal:** the only genuine product action anyone takes on any persona page
is **downloading a learning material on `for-parents`** — and one of those two users hit
the auth wall doing it. That is the same wedge the 2026-08-05 teacher learning-packs
demand work landed on (memory `project_teacher_learning_packs_demand`), and it has no
persona page. The four POD personas the 06-26 roadmap is built around have no page, and
no demand-mining evidence behind them beyond the 06-26 strategy conversation.

### Search: they rank, nothing searches

GSC 28d (2026-07-06 → 08-02), site total 190 clicks / 12,615 impressions across 1,660
pages. Use-case pages: **31 impressions, 0 clicks, average positions 1.0–9.0.**
Ranking is not the constraint; query volume is zero. These slugs are not searched terms —
they are internal vocabulary.

### Channel reality — four motions, none of which feed this surface

| Motion | State | Does it reach the persona pages? |
|---|---|---|
| **Outbound email** (`gtm_tools/`) | 817 rows in `sent_log.txt`, 475 leads in `b2b_clients.json` | Partly, and backwards. Only 4 of 10 pages are wired as CTAs (`for-marketers`, `for-publishers`, `for-programmatic-seo`, `for-dtc-brands` — the *legacy* personas). The POD voices covering **259 of 475 leads** point at `/tools/character-sticker-sheet` + `/tools/mockup`. **`for-merch-operators`, the flagship POD page, receives no outbound traffic by design.** |
| **Thought leadership** (LinkedIn · RedNote · FB · Medium) | Running; positioning per `docs/smm-account-positioning-playbook-2026-07-05.md` + memory `feedback_smm_account_positioning` | **Unmeasurable, and measured at ~zero.** Real referrers into `/use-cases/*` over 60d: Facebook 14 users, curify-internal 5, google.com 3, t.co 2, 1point3acres 1 — **no LinkedIn, no Medium, no RedNote**. RedNote does not pass links and LinkedIn/Medium strip referrers, so referrer-based attribution can never work here; the gap is that no channel has a distinct landing path to count instead. |
| **RedNote direct outreach + WeChat / offline warm intros** (people who state a need) | Running; **tracker shipped 2026-08-12** | Was untracked; now `gtm_tools/relationship_leads.json` captures channel, `need_verbatim`, buyer-vs-connector, and which product line the need lands on. First batch (`client-profile-08-12`, 6 named CN leads) is digested. Reply channel is WeChat, not email — these must stay out of the email send engine. |
| **Crawling** (Pinterest source-HTML, Apollo domain crawls, football-shop harvests) | Ran repeatedly through 06→07 | **Produced leads, not traffic.** Confirmed dead end as an audience channel — it is a *list-building* tool, not a distribution one. Stop counting it as growth. |

### POD-D1..D10 status — 0 of 10 shipped

Seven weeks after the 06-26 reframe, none of the ten POD items in this doc has landed,
including **POD-D5** (`commerce_shape` field), the 1-day "blocks nothing, do it first"
item — it is not in `lib/use-cases.ts`. Nothing in the sequencing recommendation was
executed.

Given the traffic above, **that is the correct outcome and should be recorded as a
decision, not a backlog.** Shipping four more persona pages (creator-merch, pet-merch,
team-swag, seasonal-pod) adds four more pages to a surface that draws 2 human visits a
day. **POD-D1..D4 and POD-D7/D8/D9 are hereby gated on a demand signal**, defined as:
a named buyer arriving through a channel we can count, or ≥20 users/week reaching an
existing persona page from a real referrer. POD-D5/D6/D10 stay open as cheap infra/
tagging work but are not prioritized.

### P0s (2026-08-12)

| # | P0 | Why this and not something else | Effort |
|---|---|---|---|
| **UC-P0-1** | **Give every channel a distinct, countable landing path.** RedNote/LinkedIn/Medium can't pass referrers, so stop trying to attribute by referrer — assign each channel its own landing URL (e.g. a `/enterprise` for LinkedIn, a dedicated pack path for RedNote) and count landings on the path. Until this exists, no thought-leadership judgement is possible in either direction. | Four motions are running and **not one of them is measurable today**. This is the precondition for every other decision in this doc. | 1d |
| **UC-P0-2** | ~~**Ship `/enterprise`.**~~ **SHIPPED 2026-08-12.** Built from `enterprise-ai-capability-one-pager.md`: 3 capability pillars, contracted-KPI block, founder credibility, dual engagement paths (enterprise POC + SI white-label), `Service` JSON-LD. **Bilingual en + zh** (`enterprise/copy.ts`; the zh copy is written in CN enterprise vocabulary, not translated) — 5 of the 6 named CN leads captured the same day read Chinese. **Deliberately NOT an SEO surface**: absent from the sitemap, since every reader arrives from a conversation, a post or an email. Not `noindex`, so a bid lead searching the company name still finds it. Footer link (localized en/zh); consumer topic strip suppressed on the route (`SiteTopBar` `hideEntryBar`). View tracking is language-split (`enterprise:en` / `enterprise:zh`) + per-CTA click ids (`enterprise::cta-*`). | The one place where an existing channel and an existing buyer already overlap — now corroborated by named CN demand. | shipped |
| **UC-P0-3** | **Track relationship-channel leads (RedNote DMs, WeChat, offline) like leads.** **Tracker SHIPPED 2026-08-12** — `~/curify-studio/gtm_tools/relationship_leads.json` + `relationship_leads.md` (4 personas + opener discipline), seeded with the `client-profile-08-12` tier-1 six. Kept separate from `b2b_clients.json` per memory `feedback_outreach_tracker_separation` (email-shaped, feeds the send engine; can't hold `need_verbatim`). **Remaining: log RedNote DMs into it as they happen, and digest tier 2+ of the source.** | It is the only channel with a human stating a need. It is also the honest replacement for POD-D1..D4's missing demand evidence — and it immediately produced some (see below). | tracker shipped; logging ongoing |
| **UC-P0-4** | **A/B the POD outbound CTA on the next send batch** — half to `/use-cases/for-merch-operators`, half to `/tools/character-sticker-sheet`, measured with the tracking already on both. Retire the loser. | Decides whether the flagship persona page has a job at all, using a batch we're sending anyway. The demo banner (3 of 45 users) is the only high-intent element measured on it. | 0.5d |
| **UC-P0-5** | **Unblock the one proven pull: learning-material downloads.** Remove or defer the auth wall on `download_learning_material` from `for-parents` (see memory `project_conversion_funnel_auth_wall`, `project_pdf_packs_points`). | It is the single genuine product action observed across all ten pages, and it currently bounces off a modal. | 1d |

### 2026-08-12 addendum — the first named demand, and it is not POD

Same day, a tier-1 follow-up shortlist of six named CN prospects was captured
(`raw/client-profile-08-12/`, digested into `~/curify-studio/gtm_tools/relationship_leads.json`
+ `relationship_leads.md`). It changes the read above in three ways:

1. **Five of six land on the Enterprise-AI line, not on POD/visual.** 招投标/RFQ + 知识库
   (刘青燕), 私有化 Agent + 文档流程智能化 (孙秀莲), 企业 AI 工作流 (泽林), 企业 AI 转型
   (付文华). Only Shirley (批量款式图/模特图) is a visual-product buyer. This is the first
   **independent, named demand** for the Enterprise-AI capability set — until now that line
   rested on one unclosed proposal and two UK tenders we can't bid solo.
2. **Two of the six are connectors, not buyers.** 刘青燕 (25 yrs industrial electrical, holds
   the relationships *and* understands 招投标) and 付文华 (文旅 + 农业产业链, 50+ stores,
   government / listed-company reach) are the CN analogue of the UK SI-partner play. Pitching
   them as accounts would waste the highest-leverage asset in the set.
3. **One clear need we cannot serve.** 栾天骄 (AIA, 18-person team) stated
   微信/线下客户信息 → AI → 辅助展业 — a Sales-Agent / CRM-memory product with no plan behind
   it. Logged as evidence, not promised.

**Consequence for the POD-D1..D4 gate.** The gate was defined above as "a named buyer arriving
through a channel we can count." That has now happened — but the buyers arrived for
*enterprise document intelligence*, through *relationships*, in *Chinese*. So the gate opens
toward `/enterprise` (already shipped bilingual, UC-P0-2) and toward the relationship tracker
(UC-P0-3), **not** toward creator-merch / pet / team-swag / seasonal persona pages. POD-D1..D4
stay gated.

**Caveat:** the captured artifact is scrolled to 第一梯队 only — a scroll affordance is visible
at the fold, so at least one further tier exists and is not digested. Treat "5 of 6" as the
tier-1 ratio, not the population ratio.

**P1 (not P0):** prune `for-creators` (36 users, 0 actions) and `for-forwarder-back-office`
(5 users, chip already hidden) — they cost maintenance and inflate the "10 verticals"
picture; and fold the teacher/learning-pack demand into whichever surface survives
UC-P0-4, rather than minting a new persona page for it.

---

## Scope

**In scope:**
- Persona definitions in `lib/use-cases.ts` (the registry is the source of truth —
  see the live table below, not this line)
- Use-case landing pages at `/use-cases/<slug>` and the persona-shaped onboarding flow
- Vertical demo pages (e.g. `/illustrator-demo`, `/ip-merch-demo`, `/progseo-demo`)
- Vertical-specific tool registry tagging (which tools belong to which persona)
- Vertical-specific blog briefs (cross-workstream — see SEO + SMM workstream for
  authoring cadence)
- Pricing / packaging variants per vertical (when applicable)

**Out of scope:**
- Generic tool authoring (Tools workstream)
- Generic search/discovery (Search workstream)
- Channel distribution + analytics (SEO+SMM+Growth workstream)
- B2B GTM outreach motion (`gtm_tools/` — separate workstream)

**Anchors:**
- `lib/use-cases.ts` — persona registry (**source of truth**; the live-only policy for
  persona ↔ tool mapping is documented in the file header)
- `app/[locale]/(public)/use-cases/[slug]/UseCaseClient.tsx` — the single dynamic route
  that renders every persona page (there are no per-persona route folders)
- `docs/interconnection.md` — blog ↔ use-case ↔ tool wiring
- `docs/vip-clients.md` — VIP roster aligning to verticals
- Memory `project_use_case_gtm_pages` — index + the untagged-template leak gotcha

## Currently shipped verticals (live)

Verified against `lib/use-cases.ts` @ `a3bb09e6` (2026-08-12). **Ten personas, one
dynamic route.** Users column = 60d bot-filtered user-keys, per the 2026-08-12 evidence
review above.

| Vertical | Slug | Tier | Tools wired | 60d users | Notes |
|---|---|---|---|---:|---|
| Parents | `for-parents` | consumer | bilingual-subtitles, video-dubbing | 47 | **only page with a genuine product action** (learning-material downloads) |
| Designers | `for-designers` | consumer | style-transfer, character-sticker-sheet | 45 | freelance illustrators; value carried by the template feed, not the tool grid |
| Merch Operators | `for-merch-operators` | b2b | character-sticker-sheet | 45 | 2026-06-07 ship; `/ip-merch-demo` + `/illustrator-demo` banners; worked-case block (`ea50b1a0`) |
| Creators | `for-creators` | consumer | 7 video/image tools | 36 | **0 actions in 60d** — prune candidate |
| Marketers / agencies | `for-marketers` | b2b | 7 tools incl. product-photo | 34 | slug kept for SEO; copy targets marketing/growth **agencies** |
| ESL learners | `for-esl-learners` | consumer | bilingual-subtitles, speech-translator, video-transcript-generator | 33 | only page with meaningful onward clicks (→ blogs) |
| Programmatic SEO | `for-programmatic-seo` | b2b | ai-product-photo-generator, ecommerce-photo | 20 | intentionally absent from `TIER1_USE_CASES` |
| Publishers / EdTech | `for-publishers` | b2b | bilingual-subtitles, video-dubbing, video-transcript-generator | 12 | slug kept for SEO; copy targets **EdTech & children's publishers**; learning-packs explainer video (`266b4d3c`) |
| DTC Brands | `for-dtc-brands` | b2b | style-transfer, video-dubbing, manga-translation | 8 | |
| Forwarder back-office | `for-forwarder-back-office` | b2b | — (pipeline pitch) | 5 | `hiddenFromChips`; **0 actions in 60d** — prune candidate |

> **Correction (2026-08-12):** the table this replaces listed `for-esl-tutors`,
> `for-agencies`, `for-edtech` and `for-museum-shops` as live. **None of those routes
> ever existed** — `agencies` and `edtech` were the *intended repositioning* of
> `for-marketers` / `for-publishers` (slugs kept for SEO continuity), `esl-tutors` was
> never distinct from `for-esl-learners`, and `museum-shops` was never built. The same
> table omitted five pages that are live. Treat `lib/use-cases.ts` as the only source of
> truth for this list.

**Demo pages live:** `/ip-merch-demo`, `/illustrator-demo`, `/progseo-demo`.
**Other live surfaces:** `/enterprise` (2026-08-12, UC-P0-2 — Enterprise AI line; English-only,
not a persona page, so it is deliberately absent from `lib/use-cases.ts` and the chips row).
**Not built:** `/pet-demo`, `/creator-merch-demo`.

---

## POD / Merch Design strategic reframe — 2026-06-26

> **STATUS 2026-08-12 — 0 of 10 items shipped; D1–D4 + D7/D8/D9 GATED.** Read the
> 2026-08-12 evidence review at the top of this doc before acting on anything below.
> The four niche packages were scoped from a strategy discussion, not from measured
> demand, and the existing ten persona pages draw ~2 human visits/day between them —
> so four more pages is the wrong next move. The section is kept intact as the
> reasoning record and as the spec to execute *if* the gate opens (a named buyer via
> a countable channel, or ≥20 users/week on an existing persona page from a real
> referrer). POD-D5/D6/D10 remain open as cheap infra/tagging work.

Workstream reframe per 2026-06-26 strategy discussion. **Curify recenters around
Merch Design + POD as the primary revenue surface.** This workstream becomes the
*revenue tip of the spear* — instead of generic "designer / creator" personas,
ship **4 high-margin, high-conversion POD niche packages** that each take a
specific buyer from inspiration to listed product in one platform session.

Companion deltas live in:
- `curify-frontend/docs/search-and-content.md` → demand-sensing + intent routing
- `curify-studio/docs/workstream-tooling-and-engineering.md` → POD design + mockup tooling
- `curify-frontend/docs/workstream-seo-smm-growth.md` → distribution + listing optimization + sales analytics

### Reframe in one paragraph

Today's vertical use-cases are framed by *who the user is* (DTC brand, ESL tutor,
publisher, etc.). Under POD that framing is too horizontal — it doesn't capture
the *commerce shape* the user is operating in. The POD lens reframes verticals
by *what the user is monetizing* (creator-merch, pet-personalization, team-swag,
seasonal-events). Each becomes a packaged solution: persona-specific landing
page + tool subset + sample design library + listing-template + a clear "first
$100 in sales" path.

### Four POD niche packages — P0 portfolio

Selected for **high conversion + clear willingness-to-pay**. Per the source
strategy discussion + corroborated by `~/curify-studio/docs/reddit-demand-mining-merch-operators-2026-06-07.md`
+ Pinterest demand signal.

#### POD-D1: Creator / Influencer Merch

**Buyer persona:** streamers, YouTubers, TikTok creators, indie podcasters with
1k-100k follower base. They have catchphrases, memes, in-jokes — they want them
on stickers, hoodies, mugs without hiring a designer.

**Workflow Curify enables:**
1. User types catchphrase / uploads a screenshot of their meme
2. Tools track (POD-B2 + POD-B3) generates 6-12 design variants in different
   print styles
3. Mockup generator (POD-B4) renders each on the chosen product (sticker /
   hoodie / mug / phone case)
4. Listing optimizer (POD-C5) generates Etsy / Redbubble titles + descriptions
5. One-click SMM distribution (POD-C1) cross-posts to the creator's IG / TikTok

**Landing page:** new `/use-cases/for-creator-merch`. Hero CTA: "Turn your
catchphrase into a sticker in 60 seconds". Demo video showing the 5-step flow
above on a recognizable creator-shape input.

**Effort:** 2-3d for the page + copy + demo (assumes POD-B2/B3/B4 + POD-C5 land
from companion workstreams).

#### POD-D2: Pet Personalization

**Buyer persona:** pet owners (consumer side, but also pet-themed Etsy/Shopify
shop operators who scale this for their customers). Massive market — pet
spending is one of the most resilient categories in retail.

**Workflow Curify enables:**
1. User uploads pet photo
2. Tools track image2image backend (POD-B3 style transfer) renders the pet in
   8-12 artistic styles (watercolor, vintage portrait, pop-art, anime, etc.)
3. Mockup generator (POD-B4) applies the chosen style to mug / canvas /
   t-shirt / hoodie / phone case / sticker
4. User can self-print (DTC use) or operator can list on Etsy (B2B use)

**Landing page:** new `/use-cases/for-pet-merch`. Hero CTA: "Your pet, hand-painted —
on a mug by tomorrow". Showcase wall of style variants on the same pet to convey
the range. Two CTAs: "Order one for myself" (DTC link to a POD partner) and
"I run a pet shop" (B2B link into POD-C5 listing optimizer).

**Effort:** 3-4d for the page + image2image backend integration + style preset curation.

**Strategic note:** this is the highest-volume niche of the four. Could justify
its own demo page (`/pet-demo`) and a dedicated blog hub (POD-C7).

#### POD-D3: Corporate / Team Swag

**Buyer persona:** HR / People Ops / marketing leads at 50-2,000-person companies
buying team apparel — onboarding kits, all-hands swag, team-building event shirts.
Pain point: every employee gets the same boring logo tee.

**Workflow Curify enables:**
1. User uploads company logo + brand color palette
2. Tools track generates a unified design system (logo + tagline + brand palette)
3. Per-employee variant generator — same design, but personalized with name /
   role / team / hire date. Hot ticket: each shirt is unique while staying
   on-brand
4. Mockup generator renders the full team's shirts on a model wall (POD-B5 phase 2)
5. Listing → bulk order via a POD-partner integration (Printful / Gooten / Lulu)

**Landing page:** new `/use-cases/for-team-swag`. Hero CTA: "Team apparel that
isn't a boring logo tee". Showcase a "50-employee team wall" mockup. CTA into a
quote form (not a self-serve checkout — these are B2B deals).

**Effort:** 4-5d for the page + per-employee variant tool (a new sub-tool in the
Tools workstream — could fold into POD-B4 as a *batch* mode).

**Strategic note:** highest ACV of the four (corporate orders are 50-2,000 units
× $25-40 unit). Slower sales cycle, deserves a more conservative pricing /
contact-sales motion.

#### POD-D4: Seasonal / Event-Driven

**Buyer persona:** POD operators chasing seasonal / event traffic (Halloween,
Christmas, Valentine's, Super Bowl, World Cup, election years, viral moments).
Pain point: seasonal velocity windows are 4-6 weeks max; need to ship 50+
designs fast.

**Workflow Curify enables:**
1. Calendar / event-driven template + asset packs released ahead of each season
   (powered by POD-A2 daily trending SKU drops)
2. Mockup generator + listing optimizer fast-path for each pack
3. SMM cadence (POD-C3 themed-day rotation) primed for the season

**Landing page:** new `/use-cases/for-seasonal-pod`. Hero CTA: "Halloween in
30 designs, ready to list" (rotating per current season). Showcase the current
season's pack with one-click adopt.

**Effort:** 2-3d for the page + a calendar / cadence ops layer that surfaces
the current season pack automatically.

**Strategic note:** this vertical compounds with the trend-capture pipeline
(POD-A5) — the more sources we ingest, the fresher each seasonal pack is.

---

### Cross-cutting work items

_Status column added 2026-08-12. **None of POD-D1..D10 has shipped.** POD-D5 in
particular — the 1-day "blocks nothing, land it first" item — is not in
`lib/use-cases.ts`; there is no `commerce_shape` field and no `pod_track` flag._

| # | Title | Effort | Status 08-12 |
|---|---|---|---|
| POD-D1 | Creator / Influencer Merch page | 2-3d | ⛔ gated on demand signal |
| POD-D2 | Pet Personalization page | 3-4d | ⛔ gated on demand signal |
| POD-D3 | Corporate / Team Swag page | 4-5d | ⛔ gated on demand signal |
| POD-D4 | Seasonal / Event-Driven page | 2-3d | ⛔ gated on demand signal |

| # | Title | Effort |
|---|---|---|
| POD-D5 | **`lib/use-cases.ts` schema extension** — add `commerce_shape` field (POD-creator / POD-pet / POD-corporate / POD-seasonal / non-POD) to drive landing-page routing + analytics segmentation. Also add `pod_track: true` flag for the 4 new entries | 1d |
| POD-D6 | **Persona × tool mapping for the POD personas** — extend the persona → tool slugs map (currently in `lib/use-cases.ts`) so each new POD persona gets the canonical tool subset. Per the live-only policy documented in the `lib/use-cases.ts` header, only attach tools once they ship from the Tools workstream | 0.5d per persona, gated on Tools ships |
| POD-D7 | **Sample design library** — each of the 4 POD personas needs ~20-30 sample designs (using the Tools-track ouput) visible on the landing page as a *"see what others have made"* gallery. Must respect the *no RedNote reposts* constraint (standing constraint: RedNote reference images are for inspiration/curation only, never reposted) | 2-3d per persona (gated on Tools ships) |
| POD-D8 | **Demo page parity with the niche packages** — each POD persona's landing page links to a working demo page (`/creator-merch-demo`, `/pet-demo`, etc.) following the pattern of `/ip-merch-demo` + `/illustrator-demo`. Demos must use `toCdnUrl()` (memory `project_cdn_assets`) | 3-4d per demo, gated on POD-B4 ship |
| POD-D9 | **"First $100 in sales" path** — each POD persona's landing page closes with a concrete monetization sequence: "Step 1: design with Curify · Step 2: list on Etsy (we'll write the title) · Step 3: share on Pinterest (one-click)". Reuses POD-C5 + POD-C1 + POD-C7 outputs. This is the conversion hook that distinguishes POD from generic "look at this nice tool" pages | 2-3d after POD-C5 |
| POD-D10 | **VIP roster realignment** — `docs/vip-clients.md` currently has 15 VIPs across 7 verticals. Re-segment so the POD-relevant VIPs (Funko / Lulu / Crunchyroll / Printful / StickerApp / Yetee / Fourthwall) are explicitly tagged with which of POD-D1/D2/D3/D4 they fit, and prioritize outbound accordingly | 0.5d |

---

### Why this belongs as its own workstream (vs scattered across product / GTM)

Pre-POD, vertical use cases were a *post-build* packaging layer — "we built this
tool, who might buy it?". Under POD, verticals are the *demand-shape pre-build*
discipline — "this is the buyer + their first-$100-sale path; what tools and
distribution does that require?". That reverses the dependency direction:
verticals become the customer of Tools / Search / SEO+SMM+Growth workstreams,
not the byproduct.

Splitting into a dedicated workstream gates the build pipeline against persona-
specific conversion proof, instead of shipping generic tools and hoping a
persona forms around them.

### Sequencing recommendation

1. **POD-D5** first (1d) — schema extension is shared infra, blocks nothing
   but should land before persona pages commit to a routing pattern
2. **POD-D1 (Creator/Influencer)** and **POD-D2 (Pet)** in parallel — highest
   conversion per landing-page-visitor of the four; both are consumer-side, so
   page + demo lands faster (no contact-sales flow)
3. **POD-D4 (Seasonal)** third — depends on POD-A2 daily-drop pivot in Search
   workstream; aligns to the next major holiday calendar window
4. **POD-D3 (Corporate)** fourth — highest ACV but slowest cycle, needs more
   build (per-employee variant tool) + a contact-sales path; deserves the last
   sequencing slot to maximize learning from D1+D2+D4 before committing
5. **POD-D7 / D8 / D9** ship in tandem with each persona's launch (not all
   upfront)
6. **POD-D10** can run any time — it's a tagging exercise on the existing VIP
   roster

### Open questions

- ~~Do the 4 POD personas *replace* the current 8 horizontal personas in
  `lib/use-cases.ts`, or do they *augment* them?~~ **Moot as posed (2026-08-12).**
  The premise was wrong twice over: there are **10** personas, not 8, and they do
  **not** have meaningful GSC traffic (31 impressions / 0 clicks over 28d). The real
  question is now the reverse — *which of the existing ten earn their keep*, answered
  by UC-P0-4 (CTA A/B) and the P1 prune, not by adding a parallel taxonomy.
- For POD-D2 (pet) — do we partner with a single POD fulfillment partner
  (Printful / Gooten / Lulu) for the "order one for myself" CTA, or stay
  partner-agnostic? Partner-agnostic ships faster but loses revenue share.
- For POD-D3 (corporate) — does Curify handle bulk fulfillment, or is it
  strictly a design-tool play that hands off to the buyer's existing apparel
  vendor? Design-tool-only is the lower-risk MVP; revisit after first 5 sales
  conversations.

---

## Outreach demo assets (pre-launch use cases)

Verticals we're prototyping via 3-panel workflow decks before shipping a
live `/use-cases/<slug>` landing page. Each has a reproducible pipeline
so we can regenerate it for a specific prospect with their brief +
palette + brand.

| Vertical | Prospect origin | Deck doc | Pipeline |
|---|---|---|---|
| Brand Design Studios (新消费 / 大健康) | Niice Design owner, 2026-07-03 | [`docs/use-case-brand-design-studios-2026-07-03.md`](./use-case-brand-design-studios-2026-07-03.md) | `scripts/oneoff_brand_design_workflow_demo_2026-07-03.cjs` + `scripts/oneoff_brand_design_portfolio_pdf_2026-07-03.sh` |

Promotion rule: convert an outreach deck into a live persona (row in
"Currently shipped verticals" table above) only when a real user signs
on for any partnership tier — live-only policy, and after 2026-08-12 the
bar is higher still: a new persona page needs a *countable channel* pointed
at it, not just a signed prospect (UC-P0-1).

---

## Demand-mining inputs (and where each one landed)

Audit 2026-08-12. Demand mining has consistently produced good corpora; the gap is
that most of it never became a surface, while the roadmap's headline personas have no
corpus behind them at all.

| Demand-mining output | Date | Became a persona / surface? |
|---|---|---|
| `~/curify-studio/docs/reddit-demand-mining-logistics-2026-06-05-v3.md` | 06-05 | ✅ `for-forwarder-back-office` — now 5 users / 0 actions in 60d, chip hidden |
| `~/curify-studio/docs/reddit-demand-mining-merch-operators-2026-06-07.md` | 06-07 | ✅ `for-merch-operators` — 45 users / 22% act rate, best of the B2B pages |
| `~/curify-studio/docs/reddit-demand-mining-industrial-design-2026-07-15.md` | 07-15 | ❌ no surface, no D-item |
| `~/curify-studio/docs/teacher-learning-packs-demand-and-validation-2026-08-05.md` | 08-05 | ❌ no surface — **yet learning-material downloads on `for-parents` are the only genuine product action measured on this whole workstream** (memory `project_teacher_learning_packs_demand`) |
| POD-D1..D4 (creator-merch / pet / team-swag / seasonal) | 06-26 | ❌ no corpus — scoped from a strategy conversation only |
| RedNote need-based DM threads | ongoing | ❌ **not captured anywhere** (UC-P0-3) — the highest-signal input we have and it isn't written down |

---

## Related docs / threads
- `docs/search-and-content.md` — Search & Content workstream (companion A)
- `~/curify-studio/docs/workstream-tooling-and-engineering.md` — Tools workstream (companion B)
- `docs/workstream-seo-smm-growth.md` — SEO + SMM + Growth workstream (companion C)
- `~/curify-studio/docs/workstream-enterprise-ai-b2b.md` — Enterprise AI B2B line (owns the `/enterprise` surface spec, UC-P0-2)
- `~/curify-studio/docs/enterprise-ai-capability-one-pager.md` — drafted copy source for `/enterprise`
- `~/curify-studio/gtm_tools/INDEX.md` — outbound engine (voices, CTAs, trackers)
- `docs/smm-account-positioning-playbook-2026-07-05.md` — per-account positioning for the thought-leadership motion
- `docs/interconnection.md` — blog ↔ use-case ↔ tool cross-link layer
- `docs/vip-clients.md` — VIP roster (POD-D10 input)
- `lib/use-cases.ts` — persona registry (POD-D5 / D6 target)
- Memory `project_use_case_gtm_pages` · `project_teacher_learning_packs_demand` ·
  `project_first_paying_customer_pod` · `feedback_smm_account_positioning` ·
  `feedback_outreach_tracker_separation` · `feedback_exec_outreach_framing` ·
  `project_conversion_funnel_auth_wall` · `feedback_reuse_admin_panel`
