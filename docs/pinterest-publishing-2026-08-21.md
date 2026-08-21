# Pinterest publishing — status, findings, and what unblocks it

_2026-08-21. Scope: publishing Curify template examples to Pinterest via the v5 API.
Code: `scripts/pinterest_oauth.cjs`, `scripts/pinterest_publish.cjs`.
Prior context: `raw/pinterest-api-08-03/discussion.txt`._

## Status: BLOCKED on Pinterest Standard access (demo submitted 2026-08-21)

The integration is complete and validated to the last call. Nothing has been published,
because a **Trial-tier app cannot create Pins in production at all**. A demo video was
submitted with the Standard-access upgrade request; waiting on Pinterest review.

## What Trial actually permits — measured, not inferred

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

| board | id | Pin links to |
|---|---|---|
| curify-merch | 570831390209279192 | `/topics/merch` |
| curify-brand-design | 570831390209279198 | `/topics/branding` |
| curify-ecommerce | 570831390209279199 | **`/topics/product`** |
| curify-packaging-design | 570831390209279197 | `/topics/packaging` |
| curify-edtech-assets | 570831390209279196 | `/topics/learning` |
| mbti-curify | 570831390209262804 | `/topics/mbti` |

ecommerce points at `/topics/product` deliberately: `/topics/ecommerce` was consolidated into it
on 08-20 and now 308s, and a Pin must never link through a redirect.

**Landing-URL rule.** Never link a Pin to an example page
(`/nano-template/<slug>/example/<id>`) — examples whose copy is not authored render
`noindex, follow` and canonical to the template page. Link to the template page or a topic hub.

## Findings worth acting on when access opens

**1. The 27 existing `mbti-curify` pins are wasted inventory.** 25 of 27 link to the bare
homepage, 2 have no link, and 0 of 27 have alt text. Titles and descriptions exist but are
brand-voice ("Our AI visual templates let you…") rather than search phrases. Fixable with
`PATCH /v5/pins/{id}` — deep link to `/topics/mbti`, add alt text.

**2. No historical analytics exist.** `user_account/analytics` returns
`data_status: BEFORE_BUSINESS_CREATED` for every day, so the April pins have no recoverable
metrics. Everything from here is measured from zero. Our own `utm_source=pinterest` on the
landing URL is the more reliable attribution path, and it already works.

**3. Pin shape is a SELECTION problem, not a rendering one** (corrects an earlier claim in this
workstream). Measured all 3,269 local `nano_insp` images:

| shape | count | share |
|---|---:|---:|
| portrait (taller than 4:5) | 1,969 | 61% |
| landscape | 771 | 24% |
| square-ish | 501 | 15% |

Portrait median ratio is **0.67 — exactly 2:3**, Pinterest's ideal. No portrait-canvas pipeline
is needed; prefer portrait examples when picking what to pin. Pinterest's feed is fixed-width
masonry, so height is the only variable: a 2:3 Pin occupies ~2x the vertical space of a 3:2 one.
`pinterest_publish.cjs` reads the JPEG header and warns (does not block) on wide images —
expression sheets and mockup grids are legitimately wide.

**4. Subject choice is a compliance surface.** Of the 36 expression-sheet examples, most are
third-party IP (Hello Kitty, Miffy, Mario, Minion) or a real person (Messi). Those are
trademark / right-of-publicity exposure on a commercial account linking to our product. Pick
original subjects. Note `/topics/merch` itself currently renders Messi, Andrew Tate, Coca-Cola
and Van Gogh/MFA Boston — worth weighing before using it as a demo or landing shot.

## When Standard access is granted

1. `node scripts/pinterest_publish.cjs --example <id> --board merch` — publishes; no re-auth.
2. Persist the returned pin id to a registry so pin-level analytics is queryable later. The 27
   mbti pins are the cautionary case: no ids recorded, no metrics recoverable.
3. Backfill those 27 pins with deep links + alt text.
4. Board hygiene before scale: all six board descriptions are EMPTY and the names are brand
   slugs (`curify-merch`) rather than search phrases. Boards rank in Pinterest search.
5. Claim the domain and enable Rich Pins — one-time, and it makes the title/meta work already
   done on topic pages pay off automatically.

## Demo video (submitted)

`raw/pinterest-api-08-03/pinterest-standard-access-demo.mp4` — 1920x1080, 65s, narrated.
Built with Remotion (`curify-studio/dev/jayw/cultural_shorts`, composition `PinterestDemo`),
real Playwright screenshots, real API output, OpenAI `tts-1-hd` narration.

Known gaps in the submitted cut, if it is rejected and needs a re-cut: it shows Pinterest's
LOGIN page rather than the consent screen (headless Chrome is not signed in — needs a ~20s
operator screen recording), and it shows the Pin request rather than a 201 response (Trial
forbids creation — a sandbox token would allow recording a real success).
