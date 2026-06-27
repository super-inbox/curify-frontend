# Video user channel attribution — 2026-06-26

Where do users who create video projects come from? Pulled to answer
"we have 208 video users, which channel or landing page did they come
from."

**TL;DR:** Only 32 of 208 video users (15%) are attributable — the rest
signed up before the 2-month `user_interactions` retention window or
entered via auth-flows that didn't fire a tracked PAGE view. Among the
attributable cohort, **`/tools/[slug]` is the dominant landing surface
(41%)**, **Google organic + ChatGPT together drive 50% of attributable
acquisition**, and **zero attributed video signups came from Twitter /
FB / TikTok / Reddit / Pinterest**.

## Method

- Cohort = `SELECT DISTINCT user_id FROM project WHERE user_id IS NOT NULL
  AND user_id NOT IN (155, 1117)` → 208 users
- For each user, first `VIEW` + `PAGE` event in `user_interactions`
  (ranked by `created_at`)
- Bucketed referrer host into channels with strict endswith matching
- Script: `~/curify-studio/dev/jayw/admin_analysis/video_user_attribution.py`
  (re-runnable; requires `curify_background/.env` for DATABASE_URL)

## Attribution coverage

| Bucket | Users | Share |
|---|---|---|
| Total video-project users (ex-155/1117) | 208 | 100% |
| Zero events in `user_interactions` | 134 | 64% |
| Has events but no PAGE VIEW | 42 | 20% |
| **Has at least one tracked PAGE VIEW** | **32** | **15%** |

- `user_interactions` retention spans **2026-04-27 → 2026-06-25** (~2 months).
- Project table spans **2025-07-23 → 2026-06-25** (~11 months).
- The 134 zero-event users almost all signed up before the event-tracking
  window. The 42 "events but no PV" users entered via OAuth callback /
  API / deep link that didn't fire a tracked PAGE event.

## Channel breakdown (of 32 attributable)

| Channel | Users | Share |
|---|---|---|
| **Google organic** | 14 | 44% |
| Direct / app / email | 14 | 44% |
| **ChatGPT** | 2 | 6% |
| LinkedIn | 1 | 3% |
| Internal (curify-ai deep link) | 1 | 3% |
| Twitter / FB / TikTok / Reddit / Pinterest | **0** | 0% |

## Landing route breakdown

| Route | Users | Share |
|---|---|---|
| **`/tools/[slug]`** | 13 | **41%** |
| `/` (homepage) | 5 | 16% |
| `/nano-template/[slug]/example/[id]` | 4 | 13% |
| `/nano-template/[slug]` | 4 | 13% |
| `/blog/[slug]` | 4 | 13% |
| (unknown) | 2 | 6% |

## Channel × landing route

| Channel | Route | Users |
|---|---|---|
| Direct / app / email | `/tools/[slug]` | 6 |
| Google | `/tools/[slug]` | 5 |
| Direct / app / email | `/` | 4 |
| Google | `/nano-template/[slug]` | 3 |
| Google | `/blog/[slug]` | 3 |
| Direct / app / email | `/nano-template/[slug]/example/[id]` | 2 |
| Google | `/nano-template/[slug]/example/[id]` | 2 |
| **ChatGPT** | **`/tools/[slug]`** | 2 |
| LinkedIn | `/blog/[slug]` | 1 |
| Google | `/` | 1 |

## Findings

1. **`/tools/[slug]` is the dominant video-user landing surface (41%
   of attributable).** Mix is 6 direct + 5 Google + 2 ChatGPT. Consistent
   with the video pipeline being on `/tools/manga-translation`,
   `/tools/video-translation`, etc. — those mini-tool SEO pages are
   converting to video projects.
2. **Google organic delivers across blog + template + tools** (5+3+3+2+1).
   The SEO workstream is driving video signups, not just blog reads.
3. **ChatGPT referrals are real and arrive on `/tools/[slug]`.** Two
   users in the window. Relevant to task #103 (unblocking AI assistant
   crawlers from `/nano-template/*` + `/nano-banana-pro-prompts/*`) —
   ChatGPT is already sending us users via the unblocked `/tools/*`
   pages, suggesting the unblock would compound that volume.
4. **Zero attributed video signups from Twitter / FB / TikTok / Reddit /
   Pinterest** in the tracked window. The SMM + autopost workstreams
   aren't producing visible video conversions. Caveats:
   - Social clicks may land on template/blog pages and convert to
     non-video projects (gallery remix, character generation, etc.)
   - Mobile in-app browsers strip referrers — those would show up as
     "direct" (44%), so some social acquisition is likely masked.
5. **Direct/app/email = 44%** likely masks returning users + iOS/Android
   in-app browsers + email login redirects. Not a true acquisition
   channel and shouldn't be interpreted as one.

## Limitations

- **Attribution only covers the last ~2 months** because of the
  `user_interactions` retention window. Older video users (134 of 208)
  cannot be retroactively attributed. The 32-user sample is biased
  toward recent acquisition and toward users whose first action was a
  client-side PAGE event (not an auth redirect or deep link).
- **Mobile in-app browser referrer stripping** lumps some social
  traffic into "direct".
- **Single-touch attribution.** First PAGE view only. A user who saw a
  blog post via Google, came back direct two days later, and then
  created their first video shows up as "direct" not "Google."

## Recommendation (not yet executed)

Log referrer on the `User` record at signup time, not just on page-view
events. That captures auth-flow and deep-link users at the moment of
conversion, lifting attribution from 15% → near 100% for users going
forward (does not retroactively fix the 134 pre-window users).

## Re-run

```bash
cd ~/curify-studio/curify_background
source .venv/bin/activate
python3 ~/curify-studio/dev/jayw/admin_analysis/video_user_attribution.py
```
