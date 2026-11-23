# Round 1: scope Mermaid loading to diagrams

Date: 2026-11-23 (Asia/Shanghai). Base: origin/main 7267f698. Measurement-driven performance fix; no SEO URL/title/canonical or payment behavior changes.

## Priority and evidence

1. P0: remove global Mermaid work from acquisition pages (this change).
2. P1: product-video mobile overflow and poster/LCP delivery.
3. P1: homepage LCP image priority and appropriately sized gallery thumbnails.

Production baseline: Lighthouse 12.8.2 mobile simulation, local isolated Chrome, homepage two runs score 42/51, LCP 6.16/5.49s, TBT 3249/1399ms. ASL score 74/75, LCP 2.15/2.17s, TBT 1076/976ms. Homepage CDN Mermaid transfer approximately 759KB, with about 939–945ms reported third-party blocking; first ASL run about 736ms. These are lab attribution measurements, not guaranteed savings or field INP. The PSI API returned a quota error; no CrUX evidence obtained.

## Implementation

- Removed Mermaid CDN script and its timer-based initializer from shared SiteShell.
- Retained the article renderer only for NanoTemplateContent, the sole caller of the formatter that creates raw `.mermaid` blocks. It checks its own article for pending diagrams before requesting the script.
- Uses Next Script onReady, including cached-script remounts, rather than racing download completion with a fixed timeout. Renders only unprocessed nodes within the article; automatic global scanning is disabled.
- Existing package-based MermaidChart components and static SVG diagrams are unchanged. No library/version migration.
- The separate observed Stripe cost is not changed in this round; checkout loading requires its own dependency audit.

## Validation

- TypeScript `tsc --noEmit`: passed.
- Three Vitest/jsdom regressions passed: no script without in-scope diagrams; delayed script readiness renders only pending local nodes; remount with cached runtime renders new nodes.
- Browser at localhost:3024: homepage and ASL displayed expected titles/content, no Mermaid script tags; ASL Create entry retained.
- Existing `/blog/ai-content-distribution-system`: one MermaidChart and one rendered SVG, no legacy CDN script. This article logs existing translation-formatting errors in unchanged content; not fixed as part of this script-loading change.
- Dev preview is not a comparable performance benchmark. No production score improvement claimed before deployment. Existing runtime chart path confirmed visually through DOM SVG presence; legacy raw-diagram timing covered with mocked script readiness tests.

## After deployment

Repeat cold-profile mobile Lighthouse on homepage and ASL (three samples per page), plus the diagram article. Confirm no Mermaid request on non-diagram pages, diagrams still render on navigation, and compare median TBT/LCP with a matched baseline. Do not attribute unrelated image/Stripe costs to this change. Keep the remaining two measured issues queued separately.

Reproduce tests with Vitest root at this repository, esbuild jsx=automatic, include tests/performance/mermaid-loading.test.tsx (jsdom environment declared in file).
