# ZEELUM case and packaging conversion — 2026-11-07

Branch: `codex/seo-conversion-zeelum-20261107`, based on `origin/main` 71255692.

## Product video case

Existing EN/ZH URL `/blog/product-photos-to-feature-video` preserved, including canonical and enquiry source. Replaced speculative process account with documented V5/V6/V10 production steps: supplied product views, charcoal relighting, generated camera movement, closing clip reversed to opening, and final V10 timing. Catalogue lastmod updated; original publication date preserved.

User authorized final ZEELUM video on the site. Source: `zeelum-v10-product-only/zeelum-v10-product-only-unzip-10s-1080.mp4`, with sibling `production-notes.txt` and `edit.py`; V5/V6 notes substantiate sources and reverse edit. The gallery demo's provenance confirms this V10. Original reference soundtrack clearance was undocumented; web derivative removes audio without changing video frames. No client correspondence, commercial quote or private source photographs added to the repo. Article distinguishes final generated demo from client approval or sales results.

Assets: `https://cdn.curify-ai.com/case-studies/zeelum-20261107/{zeelum-v10-silent.mp4,zeelum-poster.jpg}`. Both return HTTP 200 with correct content type. ffprobe: 10 seconds, 1080x1080, video only, 6,440,201 bytes. Reviewed final contact sheet. Video has controls, playsInline, metadata-only preload, poster and localized accessible name; no autoplay.

## Packaging

Correct required-input label and contradictory free-start sign-in hint. Add explicit credit purchase entry, preserve form state and avoid auto-generating on topup. Clear unrelated topup project context. Preview the generated mockup with fidelity review instructions. Open original full-size file in a new tab for saving; track click intent, not a completed download. Shared factory polling now distinguishes rejected submit, failed job and polling timeout events.

## Validation and remaining work

- TypeScript passed after adding tests.
- 29 targeted tests passed: packaging conversion (4), credit checkout/recovery (15), failure actions (10).
- Blog slug and client namespace generated-file checks passed.
- Real signed-in upload → paid generation → save and enquiry insertion are NOT accepted yet. Browser inventory returned zero connected browsers; Chrome plugin tools were not exposed. No customer job resumed and no paid production generation or test lead submitted.
- No backend change: read-only ASL diagnosis is in GTM `docs/seo/asl-packaging-followup-2026-11-07.md`; generic timeout requires worker-stage logs, not a speculative retry/price change.
- Remote branch push is not deployment. User owns GSC submission of the two case pages.

Local ZH case HTTP 200; rendered body includes final MP4 and production steps, with expected self-canonical. Local English packaging path loops via locale redirect in this dev setup; production `/tools/packaging-mockup` returns HTTP 200. Do not classify this as a production outage or browser acceptance.
