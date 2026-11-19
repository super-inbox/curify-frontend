# Business partnerships page

Added 2026-10-22. `/business` and `/zh/business` describe content-production
partnerships for nine business audiences. `/enterprise` retains its document
intelligence / RAG offering, with reciprocal links between the two pages.

Copy is in `app/[locale]/(static)/business/copy.ts`. Other locales render English,
including the embedded contact forms, and canonicalize to `/business`. The
sitemap includes only English and Chinese. Content and Service/OfferCatalog
structured data are server rendered. Homepage and footer provide crawlable entry
links. Videos are user initiated with `preload="none"` and poster images.

## 2026-11-18 — Work-first portfolio and contextual inquiries

Current production was checked read-only on 2026-11-18: it still serves the old
industry-first business page. The following redesign is implemented locally;
no production deployment is claimed by this entry. Earlier validation/status
sections below retain their original dates.

- Four server-rendered work cards now precede the nine industry cards: hotel V4
  editing trial, ZEELUM V10 product-video demonstration, Fabric and Kyoto.
  Each identifies input, output and trial/demo status. Hero uses the published
  hotel comparison. No client approval or conversion uplift is implied.
- Hotel image and ZEELUM media reuse the CDN URLs already published in
  `/blog/hotel-photo-editing-case-study` and `/blog/product-photos-to-feature-video`.
  Hotel publication permission and non-final status were verified from that article;
  ZEELUM is the already-public silent demo. Fabric/Kyoto retain their watermarks.
- Every work card expands an inline inquiry without login or leaving the page.
  Email is required; brief and role are optional. Scope/pricing are agreed before
  production. The generic brief form and sector/enterprise links remain available.
- `lib/business-cases.ts` defines stable case IDs and services. `services/contact.ts`
  serializes Case ID and Service into the existing content field, alongside
  first-touch attribution/session. The backend contact route persists that content
  in `email_contacts.body` and adds source. No schema or backend deployment required.
- The optional full-contact link carries `case_id`; the contact page resolves it
  against the known registry, ignoring unknown/inherited IDs. Arbitrary URL service
  names cannot override the canonical service. Both forms guard in-flight duplicates.

### Events added

| ID | Meaning |
|---|---|
| `business:<lang>:case:<id>:inquiry` | Open a case brief (closing does not emit intent) |
| `business:<lang>:case:<id>:read` | Read the published case article |
| `business:<lang>:case:<id>:submit:start` | First focus within this case form |
| `business:<lang>:case:<id>:submit` | Submit attempt |
| `business:<lang>:case:<id>:submit:error` | Failed API submission |
| `contact:submit:business:<lang>:case:<id>` | Successful API response |
| `contact:<start|attempt|error>:business:<lang>:case:<id>:call` | Secondary full-contact path |
| `contact:submit:business:<lang>:case:<id>:call` | Secondary full-contact success |
| `business:<lang>:self-serve` | Browse tools |

These use `click/menu_link`; classify by exact ID, not raw action counts.
Existing `business:<lang>` view, video_play and brief/sector events remain.
Hero email capture was replaced with a brief anchor; do not compare its old
attempt count to the new hero link click. No email or free-text brief is sent in
analytics. Form success means API acceptance, not a qualified lead or payment.

### Verification

- Full repository TypeScript check and contact contract unit tests.
- Browser regression covers en/zh/ja fallback, all four case forms, invalid email,
  retained fields after failure, retry success, source/case/service/UTM/session,
  secondary contact route, playback deduplication, metadata and 390px overflow.
- Desktop/mobile screenshots inspected. Existing homepage ToolsGrid hydration
  mismatch remains outside this change; inbound link tracking passes after recovery.
- All lead and analytics requests intercepted in browser tests. This proves frontend
  request/response behavior, not live DB persistence or mail delivery. No live test
  lead was sent. Production release and event-ingestion checks remain outstanding.

Reproduce with local Next on localhost:3001:

```sh
npx tsc --noEmit --incremental false
npx vitest run --config vitest.unit.config.ts lib/__tests__/business-contact.test.ts
BUSINESS_TEST_CHROME=1 node scripts/test-business-tracking.cjs
```

`BUSINESS_TEST_CHROME=1` uses a fresh headless installed Chrome instance; omit it
when Playwright Chromium is installed. No personal browser profile is used.

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

## 2026-11-16 — Portfolio-first revision

Current design/provenance: [selected works and SEO ownership](content-drops/business-showcase-2026-11-16.md). Hero now links to the brief (`brief-link` click event, distinct from form attempt); the inline hero form was removed. Twelve works and three process walkthroughs precede the retained nine sectors. Work inquiries encode `business:<lang>:work_id=<id>:category=<primary-category>` in existing source, plus localized subject. Filters use `business:<lang>:filter:<id>`; work clicks use `business:<lang>:work:<id>:enquiry`; case clicks use `business:<lang>:case:<id>:enquiry`. All are menu_link/click. Five videos retain first-playing tracking. Historical validation above refers to the former layout. Updated regression script preserves mocked sends; this session validates browser prefill and SSR, not backend delivery.
