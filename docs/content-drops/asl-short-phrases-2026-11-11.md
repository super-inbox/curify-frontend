# ASL short phrase sequences — 2026-11-11

User-requested content drop, not a new analytics gap analysis. One new reusable template and three illustrated examples; no claims of fresh query-volume evidence.

Template: `template-asl-short-phrase-sequence` (`/nano-template/asl-short-phrase-sequence`). Phrase selector supports I love you, Thank you and Please. Arbitrary sentence translation is deliberately not offered. I love you uses the I → LOVE → YOU sequence, distinct from the single ILY handshape. Thank you and Please show movement phases of one sign, not one sign per English word.

Example IDs:
- `template-asl-short-phrase-sequence-i-love-you`
- `template-asl-short-phrase-sequence-thank-you`
- `template-asl-short-phrase-sequence-please`

Configuration, generation specifications and ASL University source links: `scripts/configs/asl_short_phrases_2026-11-11.json`. Original fictional adult signer; no reference teacher photographs copied. Reference-based visual QA checked hand anatomy, self/outward pointing, crossed hands, flat-hand placement, outward/circular movement, consistent signer, labels and readable watermarked exports. These are AI illustrated study aids, not fluent-signer-reviewed or professionally certified instruction; posters explicitly direct learners to compare with a fluent signer's video.

Delivery: 1536 × 1024 watermarked JPEGs and 480px previews uploaded to existing `curify-static` nano_insp / nano_insp_preview paths. All six CDN URLs returned HTTP 200 image/jpeg. Ten UI locales, inspiration aliases, ASL topic membership, template taxonomy and intent metadata added. JSON registries feed the runtime search index; no Redis write required for these static template examples.

Validation: `npm run eval:tools` passed 281 tests, including five new persistent real search-page checks (three English phrase queries, 我爱你手语, asl short sentences), asserting relevant examples in the top ten. `npx tsc --noEmit` passed. Full images visually inspected after watermark export. No production generation smoke test or live page deployment performed.

Integration target: existing remote branch `codex/middle-east-gift-boxes-20261111`, preserving its gift-box content. CDN assets are available; application metadata awaits branch merge/deployment. No social publishing.
