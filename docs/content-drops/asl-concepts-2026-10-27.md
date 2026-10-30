# ASL demonstration content drop — 2026-10-27

The existing ASL infographic template now has eleven examples: four original examples plus seven new human-demonstration posters. These replace the four abstract workflow/checklist posters from the first draft, following the user's visual direction.

The seven subjects are BIG/VERY BIG (size and expression), MOTHER/FATHER (location), questions (eyebrows), A/S (thumb position), palm orientation, SIT/CHAIR (repeated movement), and a five-parameter overview. Each uses fictional adult models, visible hands/faces, comparison panels and closeups. These are AI-generated illustrations, not recorded teachers or independently expert-reviewed demonstrations. The article links to Lifeprint lessons and NIDCD, describes variants and limitations, and does not imply endorsement.

Article: `/blog/asl-visual-study-guide`, now titled “ASL Visual Guide: Hands, Movement and Facial Expressions”. English authored content only; other locales canonicalize to English and are noindex. Existing translation tool URL/title preserved. Template, engineering article and tool related-reading link to the guide. Example titles support ten locales; poster text is English.

Current prompts, sources and generated file identifiers: `scripts/configs/asl_demonstrations_2026-10-27.json`. The previous `asl_concepts_2026-10-27.json` remains as historical provenance; its four examples are no longer in the gallery. Full JPEGs and 480px previews are gitignored and published to `gs://curify-static/images/nano_insp/` and `nano_insp_preview/`. Original examples were not overwritten. All seven images were visually inspected; MOTHER/FATHER received a text-only correction to remove stray generation instructions. No private signer data or copied teacher photographs.

## Validation

- TypeScript `tsc --noEmit --incremental false` passed.
- Blog-slug and client-namespace generated-map checks passed; `git diff --check` passed.
- i18n checker exited successfully; existing namespace-key differences remain outside this content change.
- Local article EN/ZH and template return200 with full server-rendered content. EN self-canonical/index, ZH English canonical/noindex. Blog sitemap has exactly one new authored English URL.
- All fourteen new CDN assets return200 and image/jpeg.
- Article inspected in browser. Local preview uses hostname `localhost`; starting with127.0.0.1 caused a dev rewrite loop, resolved without production code changes.

Push of this branch does not establish production deployment or Google indexing. After merge/deploy, verify production page and request indexing once if it is not already indexed. New example detail pages retain existing sitemap eligibility rules; do not inflate the example whitelist merely to increase crawl volume.
