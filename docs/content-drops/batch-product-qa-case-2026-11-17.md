# Batch product image QA case — 2026-11-17

## Selection and evidence

Selected the retained four-product listing-image production capture (`lead-012`, October12), rather than the garment correction capture: the former records the brief, product mismatches, repair rounds, dimension-background revision and final output checks in one trajectory. The garment capture does not establish final acceptance or public source-photo permission.

Private source: real-projects project `2026-10-12-lead-012-temu-product-image-batch` and its sibling capture JSON. Reviewed `capture-evidence/dimension-background-v2/qa-report-v1.json`, `validation.json`, repair records and `outputs/final-v2`. No raw capture, source photograph, correspondence, customer identity, cost or private source path is copied into the frontend.

Rechecked against retained files on November17:
- 96 final PNGs, all800×800,12sets of8.
- All84 scene-image hashes match the earlier QA manifest.
-12 saved protected-mask comparisons report maximum difference0 against resized source. This is recorded validation, not a rerun of mask generation or whole-image correctness certification.
- Capture records internal construction/usage defects and the dimension-background revision. Final customer acceptance, payment and marketplace outcome remain unconfirmed.

Public presentation is an anonymized process case with original HTML/SVG diagrams. It is not a claimed client success story or an image gallery of customer assets. Diagram labels explicitly distinguish them from product photographs. No external factual market or model-performance claims.

## Routes and ownership

- EN/ZH `/blog/batch-product-image-quality-control`: full process, QA/revision evidence, limitations, practical checklist and batch inquiry.
- `/tools/product-photo-retouching-service`: contextual case entry in authored EN/ZH. Existing service retains commercial-keyword ownership and lead-only behavior.
- `/business`: one new work in photo/product categories and an expanded process note;13works and4process notes total. No duplicated work per category. Existing ASL entry untouched.
- `/resources/ai-photo-retouching-quality-checklist`: contextual batch-review example, reusing existing downloads.
- Case links back to service, resource and business. Inquiry source carries `work_id=batch-product-qa` and `category=photo` within the existing source field.

No new homepage card or wedding/photographer entry: this example is multi-SKU ecommerce production, not wedding outsourcing. Registry, middleware slug allowlist and client-namespace scan refreshed; only EN/ZH indexable, other locales fall back to English with noindex and English canonical. Sitemap lastmod updates limited to edited pages.

## Verification and release

TypeScript `tsc --noEmit`, `git diff --check`, generated-slug freshness and business test-script syntax checks passed. Existing business test expectation updated13works; no standalone headless browser test run.

See `batch-product-qa-validation-2026-11-17.json` for HTTP/canonical/link/sitemap checks. Browser: Chinese article and390px matrix inspected; document scrollWidth equals clientWidth. Existing shared mobile search-header overlap/dev warnings are outside this case change. No inquiry submitted or email sent; source-link presence is verified, not production lead ingestion.

New branch `codex/batch-retouching-case-20261117`; push is not deployment. After merge/deployment, verify production content/canonical/indexability and inbound links; schedule+7indexing/+28search and qualified inquiry review from actual deployment. No GSC submission performed.
