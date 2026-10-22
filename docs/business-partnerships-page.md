# Business partnerships page

Added 2026-10-22. `/business` and `/zh/business` describe content-production
partnerships for nine business audiences. `/enterprise` retains its document
intelligence / RAG offering, with reciprocal links between the two pages.

Copy is in `app/[locale]/(static)/business/copy.ts`. Other locales render English,
including the embedded contact forms, and canonicalize to `/business`. The
sitemap includes only English and Chinese. Content and Service/OfferCatalog
structured data are server rendered. Homepage and footer provide crawlable entry
links. Videos are user initiated with `preload="none"` and poster images.

## Media provenance

The checked-in assets in `public/business/` are compressed derivatives of:

- `curify-gallery/ecommerce_ad_videos/fabric_ad/fabric_ad-watermarked.mp4`
- `curify-gallery/cultural_videos/kyoto/kyoto-kimono-30s-watermarked.mp4`

The Gallery README lists Fabric as an unbranded public sample. The cultural video
README identifies Kyoto as an original AI character; the souvenir-video post
notes explicitly permit the watermarked Kyoto sample for posting. Both are
labeled creative demonstrations on the page, not client commissions. Watermarks
are retained. Posters are frames at 12 seconds (Fabric) and 3 seconds (Kyoto). Videos use
H.264/AAC, CRF 29, faststart, with longest dimension 960px (fabric width, Kyoto
height); total video size is approximately 4.3 MB. These assets live outside the
ignored `public/video` and `public/images` folders so a deploy includes them
without an additional CDN sync.

## Lead attribution

Shared `InlineContactCapture` submits through the existing contact service.
Hero and brief forms use `business:<en|zh>:<hero|brief>` as their source. Sector
links prefill the contact page with the sector title and
`business:<en|zh>:<sector-id>`. The homepage banner tracks
`home-solution:business`. Existing contact success and failure handling is reused.

## Validation

- TypeScript `tsc --noEmit` and `git diff --check`.
- Headless browser: English, Chinese and Japanese fallback return 200, render
  nine sectors and two videos, and emit the expected canonical URL.
- Mocked contact requests: brief and hero source attribution, failure message,
  retained email on failure, successful retry and sector-specific contact links.
  No real inquiry was sent.
- 390px mobile viewport has no horizontal overflow; desktop and mobile
  screenshots inspected. Video metadata loads; sitemap contains en/zh business
  URLs and excludes fallback duplicates. No browser page errors observed.
- Local preview must bind to `localhost` (not `127.0.0.1`) to avoid the existing
  development middleware rewrite loop, which also affects `/pricing`.

Not deployed. Full-site production prerender was not run.

## Analytics events (2026-10-22)

`BusinessTracking` wraps server-rendered children and records a page view once
per mount (including internal navigation), explicit link clicks, and the first
actual `playing` event per video per mount. Pause/resume does not inflate plays.
The shared form retains ownership of its attempt and successful-contact events;
the wrapper does not duplicate them. All types use existing backend enum values.

| Event ID | Action / content type |
| --- | --- |
| `business:<lang>` | `view` / `page` |
| `business:<lang>:examples` | `click` / `menu_link` |
| `business:<lang>:sector:<id>` | `click` / `menu_link` |
| `business:<lang>:enterprise` | `click` / `menu_link` |
| `business:<lang>:video:<fabric|kyoto>` | `video_play` / `page` |
| `business:<lang>:<hero|brief>` | Submit attempt: `click` / `menu_link` |
| `contact:submit:business:<lang>:<hero|brief>` | Successful lead: `click` / `menu_link` |
| `business:<lang>:<hero|brief>:call` | Schedule-call link: `click` / `menu_link` |
| `home-solution:business` | `click` / `menu_link` |
| `footer:business` | `click` / `menu_link` |
| `enterprise::business` | `click` / `page` |

`lang` is the rendered copy language (en/zh); the shared payload also retains the
actual locale in `current_page_url`, normalizes `current_page_route` to
`/business`, and carries `session_id` plus allowlisted campaign parameters.
Lead bodies retain first-touch landing page, UTM and session context through the
existing contact service. Failed submissions generate attempts but no success
event; a retry is another attempt. The site's generic session-entry view remains
separate: use the `business:<lang>` event IDs for business page-view counts.

Reproducible browser regression test:

```sh
BUSINESS_TEST_URL=http://localhost:3001 node scripts/test-business-tracking.cjs
```

The test intercepts `/interactions/track` and `/user/contact-team`, verifies
payloads and conversion semantics in en/zh/ja fallback, and checks inbound links.
It does not assert production database persistence. Production deployment and
live event ingestion remain outside this local validation.

Tracking regression results: en/zh/ja page funnels and both inbound links pass.
Inbound tests wait for full page load: the existing homepage ToolsGrid lock icon
produces a hydration mismatch and React regenerates that tree. This warning was
observed outside the new business page; the homepage entry event passes after
recovery. No ToolsGrid changes were made as part of this work.
