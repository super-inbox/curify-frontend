# Pinterest publishing — channel status, ledger, and runbook

_Opened 2026-08-21, last updated 2026-09-16. Scope: publishing Curify template examples to
Pinterest via the v5 API.
Code: `scripts/pinterest_oauth.cjs` (auth) · `scripts/pinterest_lib.cjs` (data, images, copy,
IP screen, registry) · `scripts/pinterest_publish.cjs` (propose / plan / boards) ·
`scripts/pinterest_demand.cjs` (GSC image-search demand → selection + copy) ·
`scripts/pinterest_lookalike.cjs` (similarity to what measurably earned → selection).
Registry: `data/pinterest/pins.jsonl`. Plans: `data/pinterest/plan-<date>.json`.
Prior context: `raw/pinterest-api-08-03/discussion.txt`._

_Living status page for the channel. The dated strategic reasoning — why a batch was selected
the way it was, and what its readout means — lives in `docs/workstream-seo-smm-growth.md`
(§ 2026-09-04, § 2026-09-06, § 2026-09-08, § 2026-09-16). This page answers "what is live right
now, and how do I publish the next one."_

## Status: LIVE. 75 campaign Pins across 10 boards (last updated 2026-09-16)

Standard access was granted 2026-09-04, and the section below on Trial-tier limits is kept as
historical measurement, not current constraint. Everything since is in the publishing ledger.

### Publishing ledger

Source of truth is **`data/pinterest/pins.jsonl`** — append-only, one row per attempt. Rebuild
this table from it; do not maintain it by hand:

```
node -e 'const fs=require("fs"),L=require("./scripts/pinterest_lib.cjs");
const r=fs.readFileSync(L.REGISTRY,"utf8").split("\n").filter(Boolean).map(JSON.parse).filter(x=>x.status==="ok"&&x.pin_id);
const d={};r.forEach(x=>{const k=x.ts.slice(0,10);(d[k]=d[k]||{});d[k][x.board_key]=(d[k][x.board_key]||0)+1});
console.log(JSON.stringify(d,null,1), "total", r.length)'
```

| date | batch | Pins | boards | selection basis |
|---|---|---:|---|---|
| 2026-08-29 | access demo | 2 | demo | hand-picked for the Standard-access video |
| 2026-09-04 | batch 1 | 20 | edtech 6 · ecommerce 5 · merch 4 · packaging 3 · brand 2 | board topic map, ranked by proximity to 2:3 |
| 2026-09-05 | batch 2 | 10 | edtech 3 · ecommerce 3 · merch 2 · packaging 1 · brand 1 | same, `--per-template 2` to keep boards from going silent |
| 2026-09-08 | batch 3 | 30 | edtech 8 · food 6 · travel 6 · beauty 5 · fashion 5 | **measured GSC image-search demand** (`pinterest_demand.cjs`) |
| 2026-09-16 | batch 4 | 15 | interior 5 · merch 4 · edtech 2 · food 2 · travel 1 · fashion 1 | **visual similarity to the three Pins that measurably earned** (`pinterest_lookalike.cjs`) |

**77 `ok` rows in the registry** = 75 campaign Pins + 2 demo Pins, across **44 distinct
templates**. Account total is 104 including the 27 legacy `mbti-curify` Pins from 2026-03.

Every batch was verified after publishing with a direct `GET /v5/pins/{id}` per row — media
present, and `link` / `title` / `alt_text` byte-identical to the registry. Batch 3: 30/30.
Batch 4: 15/15.

> **`GET /v5/pins` is NOT a complete inventory.** The 2026-09-08 analytics pull listed 29 of the
> 30 batch-1+2 campaign Pins; the missing one (`570831321549618861`, edtech) answers a direct
> `GET /v5/pins/{id}` with 200, alive, media present. Reconcile against the registry, never
> against the account listing.

### Results — the 2026-09-16 readout. Saves are no longer 0, and the distribution is one Pin

Per-Pin `GET /v5/pins/{id}/analytics`, window 2026-08-25 → 2026-09-16, campaign Pins only
(the two demo Pins earned 1 impression each and are excluded):

| cohort | Pins | impressions | saves | pin clicks | outbound |
|---|---:|---:|---:|---:|---:|
| batch 1 (09-04) | 20 | 11 | 0 | 1 | 0 |
| batch 2 (09-05) | 10 | **607** | **6** | 9 | 0 |
| batch 3 (09-08) | 30 | 2 | 0 | 0 | 0 |
| batch 4 (09-16) | 15 | — | — | — | — |
| legacy `mbti-curify` (03-11) | 27 | 199 | 0 | 12 | 1 |

**Three Pins hold everything.** 620 of the 622 impressions and 6 of the 6 saves:

| example | board | imp | saves | clicks |
|---|---|---:|---:|---:|
| `…fridge-magnet-collection-nanjing-landmarks` | merch | 586 | 3 | 5 |
| `…category-guide-infographic-interior-design-styles` | edtech | 21 | 3 | 4 |
| `…emoji-sticker-sheet-poster-empress-cow-cat` | merch | 11 | 0 | 1 |

**Batch 3 — the demand-ranked treatment arm — is the worst cohort on the account: 2 impressions
across 30 Pins.** The 09-08 hypothesis was that product-taxonomy boards were the problem and
Pinterest-native boards named for search phrases would fix it. Measured, that is false, or at
least far too weak to see. GSC image-search demand is not a proxy for Pinterest demand.

> ⚠️ **The 586 is a coin flip, not a creative verdict.**
> `…fridge-magnet-collection-yangzhou-landmarks` is the SAME template, the same layout and the
> same board, published one day EARLIER, and it has **0 impressions**. Two near-identical Pins,
> 586 and 0. Pinterest picked one and fed it. Impressions on n=1 measure the surface's choice.
>
> **Save RATE is the creative signal, and it reorders the winners.** Interior design styles took
> 3 saves on 21 impressions — **14%**. Nanjing took 3 on 586 — **0.5%**. The thing worth copying
> is the one almost nobody saw and that nearly one in seven of those who did saved.

**What the three winners have in common is SHAPE, not subject: they are all collection grids** —
many small repeated items in one frame (2x2 magnets, a 4x3 labelled photo grid, a 4x4 sticker
sheet). No ranking tried so far could see this, because ratio measures the canvas and GSC
measures the subject. Batch 4 selects on it directly.

**Next read ~2026-09-30**, on saves. Batch 4's own question: does save rate hold up when the
selection is grid-shaped by construction, and does a home-decor board — Pinterest's largest
native category, and where the 14% save rate came from — beat the nine boards that preceded it.

### How to publish the next batch

```bash
# look-alike selection (batch 4 onward) — rank by similarity to what measurably earned
node scripts/pinterest_lookalike.cjs --n 40 --per-template 2 > plan.json

# or demand selection (batch 3) — kept, but it produced the worst cohort on the account
node scripts/pinterest_demand.cjs --pull
node scripts/pinterest_publish.cjs --propose --board <key> --n 40 > plan.json

#   -> open every local_path and LOOK at the image; replace each ip_review: PENDING
node scripts/pinterest_publish.cjs --plan plan.json --limit 1 --max 30   # smoke test, expect 201
node scripts/pinterest_publish.cjs --plan plan.json --max 30 --delay 20
```

`--plan` refuses to run while any row still says `ip_review: PENDING`, and skips example ids
already in the registry. Write rate limit is `100;w=60`, so a 20s delay is conservative.
No re-auth is needed — the refresh token is long-lived.

**There is no publishing cadence and there should not be one.** Pinterest is an evergreen search
surface: the account published nothing between 2026-04 and 2026-09 and still earned every one of
its 30-day impressions from Pins created six months earlier. Cadence is a traffic dial and the
measured failure is conversion. Volume is the right lever only after a batch shows saves > 0.

**Inventory is not the constraint.** 1,046 examples pass every mechanical filter (ratio
0.55–0.80, unwatermarked source present, IP screen, copy assertable). The "four boards are down
to ~13 candidates" figure in the 09-06 notes counted only what fell inside the five original
board topic maps. What binds is the ~25% visual-review rejection rate — human minutes per Pin,
not supply.

## What Trial actually permits — measured, not inferred

_Historical. Standard access landed 2026-09-04 and none of this is a live constraint. Kept
because it is the only measured account of the tier gate, and because of the discriminator
note below._

| call | result |
|---|---|
| `GET /v5/boards` | 200 ✅ |
| `POST /v5/boards` (SECRET) | **201 ✅ board writes DO work** |
| `POST /v5/pins` (public board) | 403 `code 29` ❌ |
| `POST /v5/pins` (SECRET board) | 403 `code 29` ❌ |
| `GET /v5/user_account/analytics` | 200 ✅ (no data — see below) |
| `GET /v5/pins/{id}/analytics` | 403 `code 29` ❌ |
| `GET /v5/boards/{id}/analytics` | ❌ no such v5 endpoint |

**A hypothesis that was tested and failed.** The Trial-vs-Standard table says Trial can write
"standard Pins … visible only to the user who creates them", which read like *secret* pins. It
is not: re-authorised with all nine scopes (adding `pins:write_secret` / `boards:write_secret`),
created a genuine SECRET board, pinned into it — same 403. Board writes succeeding in the same
session with the same token is the proof that this is a tier gate, not a scope or privacy one.

## OAuth — solved, and durable

`scripts/pinterest_oauth.cjs --serve` runs the authorization-code flow end to end: it listens on
the registered callback `http://localhost:3000/api/oauth/pinterest/callback`, catches the `?code=`
itself and exchanges it, so the operator only clicks approve. Port 3000 must be free.

Granted (in `curify_background/.env`, backup `.env.bak`):

```
boards:read boards:read_secret boards:write boards:write_secret
pins:read   pins:read_secret   pins:write   pins:write_secret
user_accounts:read
```

`PINTEREST_REFRESH_TOKEN` is long-lived — `--refresh` mints access tokens with no browser and no
operator. **No further consent round-trip is needed when Standard is granted.**

Trap worth remembering: a console-generated token is READ-ONLY unless the write scopes are
ticked, and it looks perfectly healthy (`GET /v5/boards` 200) right up until the POST 401s.

## Boards → landing pages

| key | board name | id | Pins | links to |
|---|---|---|---:|---|
| edtech | Educational Posters & Study Infographics | 570831390209279196 | 19 | `/topics/learning` |
| ecommerce | Product Photography & Ecommerce Listing Templates | 570831390209279199 | 8 | **`/topics/product`** |
| merch | Merch & Print-on-Demand Design Templates | 570831390209279192 | 10 | `/topics/merch` |
| food | Food Infographics & Nutrition Charts | 570831390209281055 | 8 | `/topics/food` |
| travel | Travel Journals, Maps & Trip Planning | 570831390209281056 | 7 | `/topics/travel` |
| fashion | Fashion Illustration & Outfit Ideas | 570831390209281054 | 6 | `/topics/fashion` |
| beauty | Nail Art, Hairstyles & Skincare Routines | 570831390209281053 | 5 | `/topics/beauty` |
| **interior** | **Interior Design Mood Boards & Material Palettes** | **570831390209281897** | **5** | **`/topics/interior`** |
| packaging | Packaging Design Mockups & Label Templates | 570831390209279197 | 4 | `/topics/packaging` |
| brand | Brand Identity & Logo Design Boards | 570831390209279198 | 3 | `/topics/branding` |
| mbti | mbti-curify *(legacy, 2026-03)* | 570831390209262804 | 27 | `/topics/mbti` |
| demo | Curify AI Design Templates 2026-08-29 *(not a target)* | 570831390209280001 | 2 | `/nano-template/custom-character-card` |

`interior` was created 2026-09-16. It exists because the highest SAVE RATE on the account —
3 saves on 21 impressions — belongs to an interior-design style guide, and there was no board
for it: the interior mood-board templates match no `BOARD_TOPICS` entry at all, so the proposer
had never been able to offer one. `/topics/interior` was verified 200 with no redirect before
the board was created (`/topics/interior-design` and `/topics/decor` are 404).

All PUBLIC. The bottom four keys — beauty, fashion, food, travel — were created 2026-09-08
because the first five are our *product taxonomy* ("Packaging Design Mockups & Label Templates")
and after 30 Pins had earned nothing. Board names are search phrases now, because boards
themselves rank in Pinterest search.

ecommerce points at `/topics/product` deliberately: `/topics/ecommerce` was consolidated into it
on 08-20 and now 308s, and a Pin must never link through a redirect. All four new landing pages
were verified 200 with no redirect before the boards were created.

**Landing-URL rule.** Never link a Pin to an example page
(`/nano-template/<slug>/example/<id>`) — examples whose copy is not authored render
`noindex, follow` and canonical to the template page. Link to the template page or a topic hub.

## Findings from the blocked period — with what became of each

**1. The 27 existing `mbti-curify` pins are wasted inventory.** 25 of 27 link to the bare
homepage, 2 have no link, and 0 of 27 have alt text. Titles and descriptions exist but are
brand-voice ("Our AI visual templates let you…") rather than search phrases. Fixable with
`PATCH /v5/pins/{id}` — deep link to `/topics/mbti`, add alt text.

> **Still open, and deliberately so.** Backfilling them would contaminate the control arm: they
> are the only cohort on the account with no alt text, brand-voice copy and homepage links, and
> the 30 campaign Pins are being read against exactly that. Do it after the ~09-15 readout.

**2. No historical analytics exist.** `user_account/analytics` returns
`data_status: BEFORE_BUSINESS_CREATED` for every day, so the April pins have no recoverable
metrics. Everything from here is measured from zero.

> **Two corrections.** (a) Per-*Pin* analytics does work under Standard for anything inside a
> 90-day window, and ids are listable after the fact from the board — `BEFORE_BUSINESS_CREATED`
> is an *account*-level answer and never implied pin-level data was gone. (b) **`utm_source` is
> useless internally**: 0 of 341,209 `user_interactions` rows in 30 days carry a query string,
> because the tracker strips it. Use `GET /v5/pins/{id}/analytics` per Pin and
> `user_interactions.referrer ILIKE '%pinterest%'` for total inbound.

**3. Pin shape is a SELECTION problem, not a rendering one** (corrects an earlier claim in this
workstream). Measured all 3,269 local `nano_insp` images:

| shape | count | share |
|---|---:|---:|
| portrait (taller than 4:5) | 1,969 | 61% |
| landscape | 771 | 24% |
| square-ish | 501 | 15% |

Portrait median ratio is **0.67 — exactly 2:3**, Pinterest's ideal. No portrait-canvas pipeline
is needed. Pinterest's feed is fixed-width masonry, so height is the only variable: a 2:3 Pin
occupies ~2x the vertical space of a 3:2 one.

> **Superseded as a RANKING rule, 2026-09-08.** Shape is a *filter* (0.55–0.80, hard) and was
> also the sort key inside that band — which carries no information about whether anyone wants
> the image, and produced 30 Pins with 0 impressions. `propose()` now ranks on measured GSC
> image-search demand and uses ratio only to break ties. "Prefer portrait" remains true; it is
> just not a reason to prefer one portrait over another.

**4. Subject choice is a compliance surface — and metadata cannot see it.** Of the 36 expression-sheet examples, most are
third-party IP (Hello Kitty, Miffy, Mario, Minion) or a real person (Messi). Those are
trademark / right-of-publicity exposure on a commercial account linking to our product. Pick
original subjects. Note `/topics/merch` itself currently renders Messi, Andrew Tate, Coca-Cola
and Van Gogh/MFA Boston — worth weighing before using it as a demo or landing shot.

> **Confirmed the hard way across four batches. The human visual pass is mandatory and is the
> binding constraint on this channel.** Rejection rate 27% (6/22) on batch 1–2, 23% (9/39) on
> batch 3, 25% (5/20) on batch 4, and **not one of batch 4's five was visible in metadata**.
> What the automated layers missed:
> `NIIMBOT B21` on a diffuser · Busan's `BOOGI` mascot · a poster crediting "Civil Navigator" ·
> Stella McCartney set in artwork · Canva placeholder text · a third-party "the little shine"
> watermark inside a chart's stock photo · **"Nikon" on the camera in 3 of 4 travel-journal
> renders** · a Yankees "NY" + New Era cap · García Márquez credited on a book cover.
> Rejections are recorded permanently in `IP_REJECTED_EXAMPLES` / `IP_REJECTED_TEMPLATES` so the
> same image cannot be re-proposed.
>
> **Batch 4, 2026-09-16 — a new failure mode, and it is the worst one yet: OUR RENDER CARRIES
> SOMEONE ELSE'S WATERMARK.** Two of the five rejections were third-party watermarks reproduced
> by the generation model from its source material, sitting inside an image we would otherwise
> have published as our own work: **"LEN'S decor 0908901489"** — another studio's mark *and phone
> number* — across the hero render of `…soft-decoration-design-guide-bohemian-wabi-sabi-bedroom`,
> and a grey CJK watermark box in the corner of `…brand-vi-full-visual-pack-mockup-mika-cat-bakery`.
> Neither appears anywhere in metadata. This is the same class as batch 3's "the little shine",
> and it is now clearly recurring rather than a one-off: **check all four corners and the lower
> third of every hero photograph at full resolution.** The other three were `MICHELIN STAR` with
> the red Michelin flower drawn into a France culture poster (plus garbled labels — "KINGOFR",
> "EUROVAL CULURY"), `#9 Lotte Tower` captioned in a South Korea top-10, and — the one to
> remember — a Korea souvenir poster whose **item #10 is literally "BTS Merchandise"**, wordmark
> on the light sticks and members' faces on the photocards. `bts`, `blackpink`, `michelin`,
> `lotte` and `chamisul` are now in `IP_NAMES`, but the list always lags; that is the point.
>
> **Typos are a rejection too.** `…country-souvenirs-watercolor-japan` misspells "Stationery" as
> "Statonery" and applies it to two different rows — one of them sweets — and prints "Inspire
> Goals" twice. Same standard as the Canva placeholder text: on a Pin whose entire premise is a
> clean readable list, broken copy reads as an unfinished template.
>
> **Two related screen rules learned 2026-09-08.** (a) The IP screen must **not** read
> `search_aliases` for its *category* words — aliases are phrases people type, and
> "celebrity fashion" sits on every gown in `fashion-inspired-gown-design-sheet`, blocking all 7
> on the highest-demand non-IP image page we have. Named entities still disqualify anywhere,
> aliases included. (b) Photorealistic AI faces are a **policy** call, not an IP finding — the
> templates involved are `image_input: "none"`, so no reference photo. Allowed 2026-09-08;
> `PHOTOREAL_FACE_TEMPLATES` + `PINTEREST_ALLOW_FACES=0` reverses it.

## The pre-access checklist, and what happened to it

1. ~~Publish with `--example <id> --board <key>`~~ — **done**, and superseded by `--propose` /
   `--plan`, which is the only path that enforces the IP review gate.
2. ~~Persist returned pin ids~~ — **done**, `data/pinterest/pins.jsonl`, one row per attempt.
3. Backfill the 27 legacy Pins with deep links + alt text — **deliberately deferred**, see
   finding 1: they are the control cohort until the ~09-15 readout.
4. ~~Board hygiene: empty descriptions, brand-slug names~~ — **done** 2026-09-05 (5 boards
   patched to search phrases) and extended 2026-09-08 (4 new boards named for search phrases).
5. **Claim the domain and enable Rich Pins — still open, and now the cheapest thing left.**
   One-time, and it makes the title/meta work already done on topic pages pay off automatically.
   Nothing blocks it.

**The tier discriminator is a READ, not a write.** `GET /v5/pins/{id}/analytics` returns 200
under Standard and 403 `code 29` under Trial. Check that before spending a Pin — `POST /v5/pins`
was already permitted when this was discovered, so "the first Pin proves the tier" was wrong.

**⚠️ Never publish the site image — it carries a full-frame TILED watermark**
(`sync_nano_inspiration.cjs` applies it in place at 22% of image width). Pins are built from the
unwatermarked originals in `~/curify-gallery/daily_inspirations/` with a 10% corner mark and
uploaded to `gs://curify-static/images/pinterest/`. **Clean-source availability is therefore a
selection filter** — coverage is partial.

## Demo video — CLOSED, access granted 2026-09-04

> **Resolved.** Take 1 (2026-08-21) was denied as "an incomplete demo video"; take 2 passed and
> Standard access landed 2026-09-04. Full account of why a composited video could never have
> passed: `pinterest-standard-access-demo-v2-2026-08-29.md`. Kept below for the re-cut
> instructions, should the app ever need re-review.

`raw/pinterest-api-08-03/pinterest-standard-access-demo.mp4` — 1920x1080, 65s, narrated.
Built with Remotion (`curify-studio/dev/jayw/cultural_shorts`, composition `PinterestDemo`),
real Playwright screenshots, real API output, OpenAI `tts-1-hd` narration.

Known gaps in the submitted cut, if it is rejected and needs a re-cut: it shows Pinterest's
LOGIN page rather than the consent screen (headless Chrome is not signed in — needs a ~20s
operator screen recording), and it shows the Pin request rather than a 201 response (Trial
forbids creation — a sandbox token would allow recording a real success).
