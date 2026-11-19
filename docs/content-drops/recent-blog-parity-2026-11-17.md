# Recent dedicated blogs: engagement parity — 2026-11-17

Scope: six dedicated articles added October13–November17 (9 authored locale routes): batch QA, hotel editing, product feature video (EN/ZH); ASL visual study, wedding input guide, ASL engineering (EN).

These routes bypass the generic blog renderer, so its hero, footer and related-article features were absent. Added reusable RecentBlogHero/RecentBlogFooter components:

- Clickable complete hero image links to the relevant tool or template in the same tab, with an explicit top CTA.
- Bottom uses the canonical BlogCTACard with an optional per-page primary destination. Overrides suppress unrelated category/bulk defaults; older callers retain defaults.
- RelatedBlogs uses explicitly selected relatedLinks, excluding self. Cards fall back to English when no authored locale exists and do not force three columns for only two results.
- Editorial body wrapped by BlogInlineClickTracker. Footer cards retain their own existing tracking rather than being double-wrapped.
- Retained case inquiry forms and attribution, all current URLs/titles/canonicals, video playback, provenance captions and pricing boundaries. Reused first images rather than repeating them later in hotel/wedding/ASL study bodies. No model functionality or paid-flow change.

Destinations: batch→product-photo-retouching-service; hotel→real-estate-photo-editing; product-video→product-video; ASL study→asl-sign-language-tutorial-infographic template; wedding input→ai-wedding-photo-generator; ASL engineering→asl-video-translator. Service pages are identified as services, not self-serve editing. The ZEELUM caption explicitly distinguishes the custom workflow from one-click tool output.

Validation: TypeScript and diff checks; actual HTTP/SSR checks for all9authored routes (hero, top/bottom CTA, related articles, self canonical). See companion validation JSON. Browser was unavailable during this revision, so no new visual-interaction acceptance is claimed. Earlier case layout review does not constitute review of these added components. No forms submitted or GSC actions performed.

Branch: codex/batch-retouching-case-20261117. Push is not production deployment.
