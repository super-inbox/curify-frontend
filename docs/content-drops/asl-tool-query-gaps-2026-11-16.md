# ASL tool query gaps — 2026-11-16

Target owner: `/tools/asl-video-translator`. Preserve URL, metadata title/description, H1, existing demo, upload action and pricing.

Prior Nov16 review baseline (complete GSC Nov7–13, not refreshed here):
- asl to english translator: position 7.31; 13 clicks / 159 impressions.
- asl translator to english: 10.07; 0 / 27.
- ai asl translator: 12.23; 2 / 13.
- asl ai translator: 14.50; 0 / 8.
- Protect asl video translator: 2.33; 55 / 177.

## Existing coverage and actual additions

The page already explains ASL-to-English direction, output formats, cost, model limitations and a three-step workflow. Do not repeat those blocks or create pages for word-order variants.

- Clarify the existing workflow H2 as ASL to English translation.
- Add two EN/ZH FAQs: pre-upload framing/cut checks; concrete review checks for English drafts (roles, names, numbers, questions, negation, timing).
- Add a contextual link to the existing practical guide beside the engineering notes. Related-reading already linked the guide; this is an earlier contextual entry, not a newly discovered missing destination.
- Update the ASL tool sitemap lastmod only. Existing FAQ renderer also supplies the new answers to FAQ JSON-LD; no rich-result promise.

## Validation

- TypeScript `tsc --noEmit`: passed.
- `git diff --check`: passed.
- EN/ZH localhost HTTP 200; added content present in server HTML.
- EN/ZH canonical remain respective production tool URLs.
- Metadata and H1 compared to HEAD: unchanged; registry/actions untouched.
- Browser English page: new H2, links, both FAQs, demo and existing Create entry rendered; layout inspected. Preview left open.
- Existing local dev issue badge remains; this was content QA, not a generation/billing test.

## Follow-up

Pushing this branch is not deployment. After actual deployment, verify production HTML and record the deployment date. At +7 days inspect crawl/canonical; at +28 days compare query-by-page clicks, impressions, position and tool conversions against the baseline, protecting the existing video query. Do not infer success from the extra copy alone or request repeat indexing by default.
