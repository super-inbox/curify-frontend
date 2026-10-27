# ASL concept content drop — 2026-10-27

The existing ASL infographic template now has eight examples, up from four. Four new original concept posters cover video study, nonmanual cues, recording checks and meaning-level translation review. These are AI-generated editorial diagrams, not demonstrations of individual signs or expert-reviewed ASL instruction. Existing sign artwork remains unchanged; the template now links to the explanatory guide and identifies the examples as unverified study artwork.

New article: `/blog/asl-visual-study-guide`. English authored content only; non-English routes canonicalize to English and are noindex. Existing translation tool URL/title preserved. Template, engineering article and tool related-reading link to the guide; the guide links back to the template, practical translation article and tool. Example titles support ten locales; baked-in poster text is English.

Prompt set and source paths: `scripts/configs/asl_concepts_2026-10-27.json`. Generated through built-in imagegen and visually inspected. Full JPEGs live in `public/images/nano_insp/`, previews in `public/images/nano_insp_preview/` (gitignored, published to existing `gs://curify-static` paths). The four IDs append `asl-study-workflow`, `asl-nonmanual-cues`, `asl-recording-checklist`, `asl-translation-review` to `template-asl-sign-language-tutorial-infographic-`. No private signer data or reference-image copying.

## Validation

- TypeScript `tsc --noEmit --incremental false` passed.
- Blog-slug and client-namespace generated-map checks passed; `git diff --check` passed.
- i18n checker exited successfully; existing namespace-key differences remain outside this content change.
- Local article EN/ZH and template return200 with full server-rendered content. EN self-canonical/index, ZH English canonical/noindex. Blog sitemap has exactly one new authored English URL.
- All eight CDN assets return200 and image/jpeg.
- Article inspected in browser. Local preview uses hostname `localhost`; starting with127.0.0.1 caused a dev rewrite loop, resolved without production code changes.

Push of this branch does not establish production deployment or Google indexing. After merge/deploy, verify production page and request indexing once if it is not already indexed. New example detail pages retain existing sitemap eligibility rules; do not inflate the example whitelist merely to increase crawl volume.
