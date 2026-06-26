# Workstream: Vertical Use Cases — Scope

> Defined 2026-06-26. This is the scope/definition of the "Vertical Use Cases"
> workstream — the product-side surface that packages Curify's horizontal
> capabilities (Tools / Search / Growth) into vertical-specific solutions for
> defined personas. Living doc.

This workstream owns the **persona → solution → conversion** packaging layer.
Horizontal capabilities live in the Tools / Search / SEO+SMM+Growth workstreams;
this workstream binds them into coherent vertical offerings that a target buyer
can adopt as a unit.

---

## Scope

**In scope:**
- Persona definitions in `lib/use-cases.ts` (live personas: dtc-brands, esl-tutors,
  publishers, agencies, edtech, museum-shops, forwarder-back-office, merch-operators, ...)
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
- `lib/use-cases.ts` — persona registry
- `app/[locale]/(public)/use-cases/` — landing pages
- `docs/interconnection.md` — blog ↔ use-case ↔ tool wiring
- Memory `feedback_tool_ship_persona_remapping.md` — live-only policy for persona
  ↔ tool mapping
- Memory `reference_vip_clients_roster.md` — VIP roster aligning to verticals

## Currently shipped verticals (live)

| Vertical | Page | Status | Notes |
|---|---|---|---|
| DTC Brands | `/use-cases/for-dtc-brands` | live | originally bundled with merch |
| ESL Tutors | `/use-cases/for-esl-tutors` | live | |
| Publishers | `/use-cases/for-publishers` | live | |
| Agencies | `/use-cases/for-agencies` | live | |
| EdTech | `/use-cases/for-edtech` | live | added 2026-Q2 |
| Museum Shops | `/use-cases/for-museum-shops` | live | 张总 lead origin |
| Forwarder back-office | `/use-cases/for-forwarder-back-office` | live | v3 logistics thesis |
| Merch Operators | `/use-cases/for-merch-operators` | live | 2026-06-07 RedNote ship |

---

## POD / Merch Design strategic reframe — 2026-06-26

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
strategy discussion + corroborated by `reference_merch_operators_vertical.md`
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

| # | Title | Effort |
|---|---|---|
| POD-D5 | **`lib/use-cases.ts` schema extension** — add `commerce_shape` field (POD-creator / POD-pet / POD-corporate / POD-seasonal / non-POD) to drive landing-page routing + analytics segmentation. Also add `pod_track: true` flag for the 4 new entries | 1d |
| POD-D6 | **Persona × tool mapping for the POD personas** — extend the persona → tool slugs map (currently in `lib/use-cases.ts`) so each new POD persona gets the canonical tool subset. Per memory `feedback_tool_ship_persona_remapping.md` (live-only policy), only attach tools once they ship from the Tools workstream | 0.5d per persona, gated on Tools ships |
| POD-D7 | **Sample design library** — each of the 4 POD personas needs ~20-30 sample designs (using the Tools-track ouput) visible on the landing page as a *"see what others have made"* gallery. Must respect the *no RedNote reposts* constraint (memory `project_merch_imagery_backlog_2026_06_18.md` — those reference images are for inspiration/curation only) | 2-3d per persona (gated on Tools ships) |
| POD-D8 | **Demo page parity with the niche packages** — each POD persona's landing page links to a working demo page (`/creator-merch-demo`, `/pet-demo`, etc.) following the pattern of `/ip-merch-demo` + `/illustrator-demo`. Demos must use `toCdnUrl()` per memory `feedback_demo_image_use_cdn_helper.md` | 3-4d per demo, gated on POD-B4 ship |
| POD-D9 | **"First $100 in sales" path** — each POD persona's landing page closes with a concrete monetization sequence: "Step 1: design with Curify · Step 2: list on Etsy (we'll write the title) · Step 3: share on Pinterest (one-click)". Reuses POD-C5 + POD-C1 + POD-C7 outputs. This is the conversion hook that distinguishes POD from generic "look at this nice tool" pages | 2-3d after POD-C5 |
| POD-D10 | **VIP roster realignment** — `docs/vip-clients.md` (per `reference_vip_clients_roster.md`) currently has 15 VIPs across 7 verticals. Re-segment so the POD-relevant VIPs (Funko / Lulu / Crunchyroll / Printful / StickerApp / Yetee / Fourthwall) are explicitly tagged with which of POD-D1/D2/D3/D4 they fit, and prioritize outbound accordingly | 0.5d |

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

- Do the 4 POD personas *replace* the current 8 horizontal personas in
  `lib/use-cases.ts`, or do they *augment* them (POD becomes a parallel
  taxonomy)? Probably augment — the existing personas have GSC traffic + active
  GTM threads (e.g., museum-shops via 张总, forwarder via v3 logistics thesis).
  Schema in POD-D5 supports both via the `commerce_shape` field.
- For POD-D2 (pet) — do we partner with a single POD fulfillment partner
  (Printful / Gooten / Lulu) for the "order one for myself" CTA, or stay
  partner-agnostic? Partner-agnostic ships faster but loses revenue share.
- For POD-D3 (corporate) — does Curify handle bulk fulfillment, or is it
  strictly a design-tool play that hands off to the buyer's existing apparel
  vendor? Design-tool-only is the lower-risk MVP; revisit after first 5 sales
  conversations.

---

## Related docs / threads
- `docs/search-and-content.md` — Search & Content workstream (companion A)
- `~/curify-studio/docs/workstream-tooling-and-engineering.md` — Tools workstream (companion B)
- `docs/workstream-seo-smm-growth.md` — SEO + SMM + Growth workstream (companion C)
- `docs/interconnection.md` — blog ↔ use-case ↔ tool cross-link layer
- `docs/vip-clients.md` — VIP roster (POD-D10 input)
- `lib/use-cases.ts` — persona registry (POD-D5 / D6 target)
- Memory `reference_merch_operators_vertical.md` — merch-operators demand mining
- Memory `feedback_tool_ship_persona_remapping.md` — live-only persona ↔ tool policy
- Memory `feedback_demo_image_use_cdn_helper.md` — demo page CDN policy (POD-D8)
- Memory `project_merch_imagery_backlog_2026_06_18.md` — RedNote refs (no reposts)
