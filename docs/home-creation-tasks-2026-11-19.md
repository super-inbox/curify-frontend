# Homepage creation tasks — implementation and release checks

Six effect-led cards replace the upper industry grid: retouch, photo camera motion,
wedding portraits, product images/video, travel keepsakes, ASL translation. The
industry grid now follows Tools and precedes Explore by niche. Product video has
its own action inside the product card. ASL uses an actual captioned video frame.
English and Chinese copy is provided; other languages use English task copy.

## Material provenance

- Retouch: fictional-person source image, explicitly labeled as input. Not a
  before/after proof of the retouch pipeline.
- Wedding: existing acceptance-test output, studio preset is seeded into the form.
- Product: existing diffuser poster example; uploaded product details need review.
- Motion: a silent frame from the London production study, labeled separately
  from the new tool's output. No unlicensed audio is shipped with this thumbnail.
- Travel: existing watermarked Kyoto AI-character example. The new tool produces
  a four-shot destination portrait film; it does not promise identical walking
  choreography. Five destinations: Tengwang Pavilion, Kyoto, Bali, Dubai, Granada.
- ASL: existing captioned demo frame, not a claim of measured translation accuracy.

## New video capability

Frontend routes `/tools/photo-motion` and `/tools/travel-souvenir-video` use the
new authenticated `/creative-video` API in curify-studio. User-owned uploads only.
Motion uses 1–4 photos at six seconds each; travel generates a destination
keyframe and four six-second moves. Camera planning currently uses fixed shot
sequences, not scene-dependent visual reasoning. Music and framing are selectable.

Backend checkpoints provider IDs and finished shots. A timeout resumes the same
project; an ambiguous provider submission requires review rather than automatic
resubmission. Finished output is exposed only after an atomic credit deduction;
a prior deduction prevents double charging. Insufficient balance retains the
private result for an explicit claim. Frontend retains the project ID in
account-scoped session storage and can reconnect after refresh.

**Release status (updated after real acceptance):** local real-provider acceptance passed; not deployed. Photography motion and Kyoto travel films were generated through authenticated API jobs and the local PostgreSQL ledger. Ownership, duplicate submission, four concurrent claims with one debit, private uploads, checkpoint recovery, real browser playback and attachment downloads were verified. Selected samples and compact evidence are in `output/creative-video-acceptance-2026-11-19/`.

Real tests exposed and fixed the source-video NOT NULL model mismatch and Gemini preview API-version mismatch. Initial motion instructions allowed walking; the selected second sample uses camera-only constraints. Public static GCS storage was unsuitable for user media, so the new workflow now uses an independent private Azure container and `/creative-video/upload`. Eighteen session-owned public test objects were moved and removed; existing gallery objects were untouched. Fresh private uploads and full checkpoint recovery were then tested without buying the model renders again.

Production prerequisites: the optional source-video migration, API/worker deployment, server secrets, and production smoke testing. Keep the feature flag off until those are complete. Server-only secrets are `MINIMAX_API_KEY_CN`, optional `MINIMAX_API_KEY_EN`, and `GEMINI_API_KEY`; the existing Azure storage connection is reused. Both services must use the same `CREATIVE_VIDEO_CONTAINER` (default `creative-video-private`). Full release instructions live in backend `docs/creative-video-self-serve.md`.

The selected files are approximately 5.875 and 23.5 seconds, H.264/AAC, 720×1280. Travel took roughly 11 minutes in this run because its four clips are generated sequentially. This validates functional delivery; it does not establish identity/geometry consistency across arbitrary user inputs or low production latency.

## Tracking

`home-task:<task>:<example>` measures card clicks. Task stages use
`task:<task>:<example>:<stage>`: arrive, upload, attempt, accepted, success, error,
pending, resume, download. Resume is not a new accepted job. Arrival is a page view, not active usage or conversion.
Only fixed task/route/example combinations are accepted. No uploaded filenames,
URLs, prompts or contact details enter these IDs. Existing tool analytics remain.

ASL attribution follows the created project through the processing and download
pages using account-scoped session storage. New video success/download stages
are deduplicated per project in the browser session. This is client analytics,
not the accounting source of truth; billing remains server-side.

## Verification commands

- `npx tsc --noEmit --incremental false`
- `npx vitest run --config vitest.unit.config.ts lib/__tests__/creation-tasks.test.ts lib/__tests__/business-contact.test.ts`
- Local server on port 3001: `node scripts/test-creation-tasks.cjs`
- Backend: `python3 tests/test_creative_video.py` (Pillow, requests, ffmpeg required).

Browser tests mock generation/upload/analytics; they must not submit real jobs or
leads. Backend tests exercise ownership validation, quote/plan contracts, provider
timeout/no-submit-retry, actual ffmpeg assembly, and billing delivery logic. The
billing tests isolate the function with fake database responses; database locking
and concurrency still need integration validation before production enablement.

Latest local result: TypeScript passed; 7 frontend unit tests and 15 backend tests passed. Browser checks passed for English, Chinese, English fallback, all six images, exact section order, mobile width, upload/reload/resume, insufficient credits, disabled capability, and success deduplication. Provider calls were mocked in browser QA.

Final real-browser checks passed for fresh private upload, result playback, attachment download without leaving the tool, download event emission, and downloaded-file SHA-256 equality. Both outputs were replayed from real stored model clips through the private backend without a second provider purchase or ledger debit.

## Follow-up: image-aware planning and five destination scripts (not tested)

The previous acceptance evidence above applies ONLY to the earlier fixed-plan renderer.
Per the user's instruction, this revision has not rerun tests, browser acceptance or paid model generations and is not deployed.

- Motion accepts 1–4 photos. A multimodal planner sees all images together, chooses one bounded camera move per photo, and chooses from the existing instrumental library. Upload order stays fixed; output is approximately 6 seconds per photo. Planning decisions/music are persisted and shown in project status. Manual music selection overrides automatic selection.
- Travel accepts one adult portrait and switches among five versioned scripts: Kyoto (`kyoto-kimono`), Bali (`bali-resort`), Granada (`granada-alhambra`), Dubai (`dubai-creek`), Tengwang Pavilion (`tengwangge`). All source recipes were found in `curify-studio/dev/jayw/video_pipelines/costume_story_video/projects` and have 11 scenes. Kyoto retains all beats but is edited to 23 seconds; the other four retain 30 seconds. Each scene gets its own generated first frame and video. The user's uploaded identity replaces the source fictional character; same-costume frames reuse an outfit reference.
- Source client-supplied soundtracks were not copied into the deployed library. Travel auto-music currently uses neutral existing calm/piano tracks, not the original local music files.
- Current calibrated selling prices: motion 18 credits/photo (US$1.80, about CNY 12), travel 180 credits/package (US$18, about CNY 120) for all five destinations. Standard top-up is US$0.10/credit; CNY is approximate at 6.67/USD, not a fixed RMB checkout price. This replaces the earlier 60/photo and 715/package assumptions. Travel is a finished-film package, not a per-generated-shot markup. Price anchor: user's actual CNY 100 production quote and hotel's CNY 150–200 resale quote. The CNY 50–100 channel spread is before hotel costs, not Curify gross profit; provider costs/retries/payment fees still need margin validation. New jobs snapshot the pricing version and quote; existing jobs keep their agreed prices. UI reads server prices and shows direct-top-up dollar equivalents. No tests or paid generations rerun per user instruction; not deployed.
- Existing projects keep their saved plans and quotes. New projects carry version 2 and a snapshot of the chosen travel script; checkpoint resume cannot silently switch scripts.
- Additional server setting: `CREATIVE_VIDEO_PLANNING_MODEL` defaults to the existing project's text-model choice `gemini-2.5-flash`; both modes now need the server's `GEMINI_API_KEY`, alongside MiniMax and private-storage credentials.


## Tool-page presentation follow-up

Final requested prices: travel 180 credits per film; motion 18 credits per photo (18/36/54/72). Both dedicated tool pages now follow the standard tool-page sequence: title and introduction, playable production examples with individual bilingual descriptions, three-step workflow, generation form, use cases, FAQ, related tools and existing category-based blog cards. Demo play events use fixed `tool-demo:{mode}:{id}:play` IDs. Five travel clips are Kyoto, Bali resort, Granada Alhambra, Dubai Creek and Tengwang Pavilion. Four additional travel assets retain their source watermarks and are compressed to 720px height; London uses the urban-electronic master, not the alternate commercial-song preview. Videos use posters and preload=none. The user-mentioned CELUM is provisionally matched to the existing ZEELUM backpack demo on Business; its caption explicitly distinguishes custom opening animation from photo-camera motion. No new model samples or test suites were run. Commit/push remains paused during local page review.


## Google indexing release — 2026-11-20

Production audit: both dedicated tool pages return HTTP 200 and contain server-rendered demo captions, workflow copy and FAQs. Production generation/download/billing acceptance passed for one motion and one Kyoto job on November 20. Before this release both pages emitted `noindex, follow`, used the global description, canonicalized Chinese to English and were absent from `/sitemap.xml`. Production robots.txt allows these tool paths.

This change opens only authored EN/ZH pages for indexing, supplies distinct localized titles/descriptions and social previews, gives Chinese its own canonical, and adds reciprocal EN/ZH/x-default alternates. Other locales retain English fallback, noindex/follow and English canonical. Four URLs are emitted in `/sitemap.xml`; its sitemap-index lastmod and their lastmod reflect November 20. The dedicated routes remain outside the generic TOOL_REGISTRY. No generation or billing behavior changes.

Validation: six focused metadata checks pass; rendered Chinese and Japanese fallback HTML have the expected robots/canonical/description, and sitemap XML contains exactly the four authored URLs without fallback-language entries. Local English rendering encounters an existing `/en/tools/*` development redirect loop; production English pages were independently verified HTTP 200. This change does not modify that existing redirect. Opening indexing and publishing a sitemap does not guarantee Google inclusion; Google must recrawl after production deployment.
