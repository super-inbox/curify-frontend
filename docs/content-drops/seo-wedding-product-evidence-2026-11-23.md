# Wedding evidence and product workflow alignment — 2026-11-23

Branch: codex/seo-wedding-product-evidence-20261123. Implements P0-2 and the page-content portion of P0-3 from the GTM six-direction KD plan. This is a branch preview, not a production deployment.

## Changes and intent

- Photographer outsourcing and wedding retouching pages: authorized original/edited photograph, expandable matched detail crops, editing scope and rejected-repair explanation. One custom edit is not represented as a completed gallery batch or an automated tool result. EN/ZH evidence copy.
- Wedding generator and existing English preparation guide: Tang-inspired, Song-inspired and modern wedding examples from an existing custom production series. Guide adds reference selection, scene briefs, extra-hand correction and likeness review. Existing real self-service input/output test remains separate; FAQ now distinguishes the two sources. Existing clickable blog hero, CTA/footer and related articles retained.
- Product-photo / e-commerce / product-video pages: EN/ZH copy, FAQ, metadata descriptions and tool-card descriptions aligned to existing actions. No backend/preset/credit changes. Product video metadata title changes from “Product Link” to “Product Photos” because the actual form has no URL input; H1 and URL preserved.
- New contextual links connect images↔video, managed retouching, the QA resource and the existing ZEELUM/batch cases. Inquiry links carry source page and example/workflow plus a prefilled subject into the existing contact form. No message sent.
- These four tool pages use their specific wedding/product inquiry instead of the generic manufacturing/die-cut bulk CTA. Their other content and tool entry remain available.
- The three product pages now pin actual ZEELUM/batch-QA/fashion QA reading instead of the outdated URL-to-video claim. No article URL deletion or redirect.
- Five tool and photographer sitemap lastmod values, and the existing guide lastmod, updated for this content change. No ASL edits, no URL merges, no canonical changes.

## Evidence for corrections

The registry starts both image pages with `template-product-poster`; the photo hub's nine-grid image comes from a different template. The e-commerce demo shows a multi-step marketing kit. `ProductVideoGenerate` accepts 1–6 photo uploads, product name/features/optional price/CTA; its request type has no product URL. Previous copy said private testing/early access, exact product preservation, CSV batch import, and product URL scraping. Those claims were removed from EN/ZH page copy. Runtime use of a paid generation was not part of this SEO acceptance.

## Asset provenance and treatment

Seven WebP previews, about 1.2 MB total, under `public/service-examples/wedding/`. No new AI generation.

- original/retouched: retained October 15 original vs October 16 `final-adaptive.png`. The owner confirmed client authorization in the November 23 request. The old comparison sheet compared a previous edit with a local revision, so it was not reused as an original/after sheet.
- detail previews: identical source coordinates x=400, y=1120, w=1400, h=1050 in each full-resolution photo. Only resize, crop, WebP encoding; no semantic changes. EXIF is not copied.
- tang/song/studio: November 19 custom wedding series P01/P05/P09. The owner's request directs reuse of this existing generation work. Do not publish the identity-reference photograph or private prompts. The recorded method is built-in image generation with manual review, not the online wedding generator. The ten-output record says awaiting client likeness approval; the reference identity's approval is not promoted into approval of all outputs.
- Era styling is described as inspired, not historical verification. Full output identities are not claimed pixel-preserved.

## Validation

- `tsc --noEmit`: passed.
- Existing dedicated-blog metadata and authored-locale sitemap tests: 5 passed.
- Local rendered acceptance: 13 EN/ZH routes returned HTTP 200 after initial Next development compilation. Canonicals matched existing policy; no new noindex on authored EN/product/photographer pages. The wedding generator's ZH fallback deliberately remains noindex with EN canonical because the tool is authored EN-only; this change does not pretend the whole tool has been translated. The guide remains EN-only.
- Browser: wedding detail disclosure expands; full images and the custom collection display; 390px mobile gallery stacks without horizontal page overflow; desktop gallery displays three columns.
- Product inquiry click reached the existing contact page with the custom-video subject prefilled and `source=tool:product-video:custom-production`. Wedding source includes `use-case/for-photographers:original-to-retouched`. Forms were not submitted.
- Current changes retain source images and new UI evidence in the branch. Local preview: port 3023. Do not interpret preview/push as production acceptance.

## Follow-up

Use today's existing GSC inspection as baseline rather than resubmitting. Batch QA +7 remains November 25; ZEELUM/indexing follow-up stays in the GTM release ledger. After merge and actual deployment, verify live body, assets, canonical, robots, sitemap and inquiry links; schedule +7/+28 from deployment. Do not request repeated real-estate indexing. Other locales' old product copy is outside this EN/ZH change and needs separate localization review.
