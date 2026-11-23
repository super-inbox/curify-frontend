# Round 2: responsive video and homepage image delivery

2026-11-23 (Asia/Shanghai). Same branch as round 1: codex/perf-mermaid-on-demand-20261123. Production remains unchanged until merge/deployment.

## Changes

- Single-video tool demos retain automatic aspect ratio and 70vh height cap, but width is capped at min(100%, 42rem), preventing the measured mobile overflow without stretching portrait demos.
- Product-video poster uses a 960px WebP derived from the existing poster (about 42KB JPEG to 15KB WebP). React preload emits an image Link header with high fetch priority. Existing inline playback and metadata preload remain.
- Homepage Make-it-your-own, fused example/gallery cards and decorative hero montage opt into Next responsive image optimization and specify sizes. Original asset paths and destination links are unchanged.
- The first creation-task image (the measured mobile LCP) is eager/preloaded with high fetch priority. Other cards stay lazy.
- CdnImage previously forced unoptimized=true even when a caller explicitly supplied false. It now honors the explicit opt-in; default CDN delivery stays unoptimized. Repository search found no pre-existing explicit false callers outside these changed homepage components.

## Validation

- TypeScript passed; five performance regression tests passed, including default CDN behavior and explicit optimization/priority propagation.
- Browser at 412px: product video width350px, document scrollWidth398px; 390px: video328px, scrollWidth376px. At1440px: video672px. No horizontal overflow at tested sizes. Product playback advances without media error.
- Product poster preload verified in local HTTP Link header, not inferred from DOM (React emits a resource hint in the response).
- Homepage first image no longer lazy; high fetch priority observed. Creation images loaded through /_next/image. Mobile and desktop visible-image checks found no broken images. Desktop hero montage loads optimized variants and retains its decorative layout.
- Real image optimizer responses with Accept:image/webp, width384, quality75: wedding-input.webp 7,990 bytes, football poster43,076 bytes, bothHTTP200. Prior source transfer approximately182,916 and848,556 bytes. Savings vary by chosen width/DPR and are not whole-page performance estimates.
- Screenshots retained locally: /private/tmp/product-video-mobile-round2.png and /private/tmp/home-images-round2.png.

## Limits and production follow-up

No production Lighthouse score claim based on dev mode. After deployment rerun the matched mobile/desktop audits, check image optimizer errors and cache-hit behavior, and verify first-render poster/image timing. Opt-in optimization uses Vercel/Next image processing and caching for these homepage images; first uncached transforms can take longer and consume image transformation allowance. No blanket site-wide optimization or billing/analytics behavior change. Original JPEG retained for compatibility.
