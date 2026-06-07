# Etsy Pack Distribution — Status & Operations

_Last updated: 2026-06-07 (adds `wc-2026-squads` SKU — 48 celebrity-movie-group-poster squad posters across all 12 FIFA WC 2026 groups; 11 prior squads copied from /images/nano_insp/, 37 fresh-generated via wc_2026_squads_2026-06-07.json config with --pack flag, search_aliases enriched for all 37, pack zipped + uploaded to Azure). Owner: jay. Update after every push that touches `lib/etsy_packs.json`, `lib/etsy_packs.ts`, `app/[locale]/(public)/pack/[sku]/`, `services/etsyPacks.ts`, or `scripts/build_template_packs.cjs`._

## Why this doc exists

The Etsy paid-pack flow is the only monetization rail in the repo today, so the surfaces (`/pack/[sku]`), registry (`lib/etsy_packs.json`), redemption service (`services/etsyPacks.ts`), and Azure blob layout are tied together by convention rather than a single config. This doc is the single place that captures _which packs ship_, _where the assets live_, _how the redemption flow works_, and _the operational protocols_ (adding a pack, rotating after a leak, attribution codes, kill switch).

The doc is **not** GTM strategy — that lives in `docs/interconnection.md`. This doc is the runbook for the pack pipeline itself.

---

## Live packs (as of 2026-05-28)

| SKU | Title | Landing URL (give this to Canva / Etsy) | Cards | ZIP size | Blob path | Version |
| --- | --- | --- | --- | --- | --- | --- |
| `mbti-character` | MBTI Character Pack: Marvel, Ghibli & Friends | `https://www.curify-ai.com/pack/mbti-character` | 100 | 147 MB | `packs/sku/mbti-character/pack-v1.zip` | 1 |
| `vocabulary` | Kids English-Chinese Bilingual Vocabulary Cards | `https://www.curify-ai.com/pack/vocabulary` | 108 | 84 MB | `packs/sku/vocabulary/pack-v1.zip` | 1 |
| `phonics` | Phonics Pack: 50 Blend, Digraph & Vowel Pattern Posters | `https://www.curify-ai.com/pack/phonics` | 50 | 28 MB | `packs/sku/phonics/pack-v1.zip` | 1 |
| `wc-2026-squads` | World Cup 2026 National Team Squad Posters (48 Countries) | `https://www.curify-ai.com/pack/wc-2026-squads` | 48 | 36 MB | `packs/sku/wc-2026-squads/pack-v1.zip` | 1 |

All three packs are `active: true`, `secret: null` (anonymous redemption), no `etsy_listing_url` set yet.

Pack contents (local source bundles, gitignored except for the manifest):
- `packs/mbti-character/` — 66 Marvel + 23 Studio Ghibli + 11 Friends portraits, plus `pack.zip`.
- `packs/vocabulary/` — 108 EN-ZH bilingual flashcards across 12 themes (animals, food, nature, family, transport, weather, body, emotions, celebrations, school, space, life cycles), plus `pack.zip`.
- `packs/phonics/` — 50 phonics posters across 5 categories (21 consonant blends, 7 consonant digraphs, 15 vowel digraphs, 5 r-controlled vowels, 2 trigraphs), plus `pack.zip`. Generated via `scripts/generate_template_examples.cjs --config=scripts/configs/phonics_pack_2026-05-28.json --pack=phonics`; the 5 originals (bl/ch/gr/sh/th) were retained from earlier April generation and re-staged from `~/curify-gallery/daily_inspirations/Apr_29/`.

---

## Redemption flow

```
Etsy buyer clicks PDF link
        │  https://www.curify-ai.com/pack/<sku>?c=<source>[&t=<secret>]
        ▼
/pack/[sku]/page.tsx  →  getActivePack(sku)
        │  (returns undefined if sku is unknown OR active=false → 404)
        ▼
Landing page renders cover + title + description + DownloadButton
        │  noindex robots meta — never competes with organic content
        ▼
User clicks "Download Pack"
        │  DownloadButton fires tracking event (content_type=etsy_pack)
        │     content_id = sku  OR  "<sku>:<source-code>" when ?c= is present
        ▼
services/etsyPacks.ts → GET /etsy_packs/<sku>/download?c=<code>&t=<token>
        │  Backend: anonymous endpoint, IP-rate-limited, server-side logged.
        │           Validates ?t= against `secret` only when secret != null.
        ▼
Response: { signed_url, expires_at, sku, version }   (5 min TTL on signed_url)
        ▼
Browser redirects to signed Azure URL → ZIP downloads
```

---

## Operational protocols

### Adding a new pack
1. **Build the asset.** Two paths depending on whether images already exist:

   **(a) Generating fresh images via the nano-template generator** (preferred for new SKUs sourced from an existing template — e.g. `phonics`):
   ```
   node scripts/generate_template_examples.cjs \
     --config=scripts/configs/<your-config>.json \
     --pack=<sku>
   ```
   The `--pack=<sku>` flag dual-outputs each generation: clean pre-watermark image → `packs/<sku>/<recordId>.jpg` (for the Etsy ZIP), watermarked + preview → `/images/nano_insp/` and `/images/nano_insp_preview/` (for the public gallery + daily-content-drop), and a tagged entry into `public/data/nano_inspiration.json` (auto-tagged via gpt-4o-mini against the parent template's tier-1 ancestor). Requires `GEMINI_API_KEY` and `OPENAI_API_KEY` in `.env.local`.

   **(b) Curating pre-built assets manually** (used for `mbti-character` + `vocabulary`): drop clean images into `packs/<sku>/` directly, then run `scripts/build_template_packs.cjs --mode=sku --sku=<name>` to zip + upload. No nano_inspiration entries get created via this path — handle that separately if the pack assets should also appear in the public gallery.

   Either way, the final pack build step is:
   ```
   node scripts/build_template_packs.cjs --mode=sku --sku=<name>
   ```
   This zips `packs/<sku>/*.jpg` and uploads to `packs/sku/<sku>/pack-v1.zip` on Azure.

2. **Add the registry entry.** Append to the `packs` array in `lib/etsy_packs.json`:
   ```json
   {
     "sku": "your-sku",
     "title": "...",
     "description": "...",
     "cover_image": "/images/nano_insp/<a-sample>.jpg",
     "card_count": 0,
     "file_size_mb": 0,
     "blob_path": "packs/sku/your-sku/pack-v1.zip",
     "version": 1,
     "etsy_listing_url": null,
     "active": true,
     "secret": null
   }
   ```
3. **Verify locally.** `/pack/your-sku` should render with the cover, title, description, and a working Download button. Backend `/etsy_packs/your-sku/download` should return a signed URL.
4. **Update this doc.** Add a row to the [Live packs](#live-packs-as-of-2026-05-18) table.

### Rotating after a leak
1. Build a fresh asset bundle (different filename — typically bump `pack-v2.zip`).
2. Update `lib/etsy_packs.json` for the affected SKU:
   - Bump `version` (e.g. `1` → `2`).
   - Change `blob_path` to the new versioned file (`packs/sku/<sku>/pack-v2.zip`).
3. Optional but recommended: set `secret` to a long random string and update the Etsy listing PDF to include `?t=<secret>` on the landing URL. The backend will reject any request without a matching token.
4. Redeploy. The old blob path stops serving even if someone retained the previous signed URL (signed URLs are 5-min TTL anyway, but bumping the path is belt-and-braces).

### Kill switch (immediate take-down)
Flip `active: false` for the SKU in `lib/etsy_packs.json` and redeploy. `getActivePack(sku)` returns undefined → `/pack/<sku>` 404s immediately, regardless of cache state (no `force-static`, per commit `cfb8142`).

### Attribution codes (`?c=<source>`)
Append a code to the landing URL to mark the source. The code flows into the tracking event's `content_id` (`<sku>:<code>`) and into the backend log — used for funnel attribution, not authorization.

Convention: kebab-case, `<channel>-<sku>-<placement>` shape. Examples:
- `canva-mbti-readme` — Canva readme doc, MBTI section.
- `canva-vocab-cover` — Canva cover page, vocabulary section.
- `etsy-mbti-listing` — primary Etsy listing PDF for MBTI pack.
- `etsy-vocab-listing` — primary Etsy listing PDF for vocab pack.
- `newsletter-2026-05` — May 2026 newsletter blast.

Whenever a new placement ships, pick a fresh code so admin can isolate the funnel.

### Per-SKU secret protection (off by default)
When the catalog is private (live but not yet promoted, or recently rotated), set `secret` to a long random string in the registry and pass `?t=<secret>` on the landing URL. The backend verifies the token before issuing a signed URL.

`secret: null` (the v1 default for both live packs) means anonymous redemption — any visitor to `/pack/<sku>` can download. Fine for already-public Etsy buyers; **not** fine for pre-launch testing.

---

## What's already shipped

| Date | Commit | What |
| --- | --- | --- |
| Earlier | `857fcd2` / `00bd516` | Initial download packs concept + per-template `batch: true` flag for pack builds. |
| Earlier | `ef3b36d` / `1a032c9` | "Download Packs" button surfaced in `ExampleImagesGrid` + `NanoInspirationCard`. |
| 2026-05-15 | `16805cd` | `scripts/build_template_packs.cjs` generalized to support SKU mode (dual-output: `packs/<sku>/` + Azure-uploaded `pack-v1.zip`). |
| 2026-05-15 | `ec36122` | Generate-templates dual-output wired to `packs/<sku>/` + kids vocab config. |
| 2026-05-15 | `d6f400e` | `.gitignore` raw pack images so curated source bundles stay on Azure (not in repo). |
| 2026-05-15 | `f0e0041` | Etsy SKU redemption: frontend `/pack/[sku]` page + `lib/etsy_packs.json` registry + `services/etsyPacks.ts` stub. |
| 2026-05-15 | `931b239` | Pack download button now fires the existing `useTracking` pipeline. |
| 2026-05-15 | `215f61d` | Switched pack-download tracking to a dedicated `etsy_pack` content_type so the admin dashboard can filter the Etsy funnel cleanly. |
| 2026-05-15 | `cfb8142` | Dropped `force-static` from `/pack/[sku]` so `notFound()` returns 404 (enables the kill switch). |
| 2026-05-15 | `5f8e6c0` | Enabled `batch: true` for 20 language templates, dropped travel. |
| 2026-05-16 | `2922339` | Per-item download packs on topic page + use-case chips on 3 surfaces. |
| 2026-05-17 | `789ca7c` | Dropped "Explore by Use Case" lead-in + made the Download Packs pills purple to match Remix. |
| 2026-05-28 | (this commit) | `phonics` SKU shipped — full pipeline: taxonomy entries (50 units across 5 categories under `language` + `learning`), template prompt generalized for vowel patterns (consonant blend → phonics pattern; starting with → featuring), 45 images generated via Gemini 3 Pro + auto-tagged via gpt-4o-mini (all picked `phonics` tier-3 correctly), SKU pack built + uploaded to Azure (28 MB, 50 cards), registry flipped to `active: true`. Vowel-pattern image quality verified on `ay` sample (8 correct words: day, play, stay, tray, clay, hay, way, spray — each containing the pattern, not just starting with it). |

---

## Next-up / open

### P1 — Wire `etsy_listing_url` once Etsy listings go live
Both packs have `etsy_listing_url: null` today. Once Etsy listings are published, fill those in. The landing page currently doesn't render the link, but the registry is the obvious source-of-truth — adding a small "Buy on Etsy" link to `/pack/[sku]/page.tsx` is a 10-minute follow-up.

### P1 — Funnel measurement
The tracking events fire (`content_type=etsy_pack`, `action_type=download`), but there's no dashboard panel yet. Add a "Pack funnel (last 14 days)" panel to `curify-studio/curify_background/app/crud/admin.py`:
- Group by `content_id` to surface per-source attribution (e.g. `mbti-character:canva-mbti-readme` vs `mbti-character:etsy-mbti-listing`).
- Compare landing-page visits (router transitions to `/pack/<sku>`) vs download-button clicks vs successful redemptions (backend log).

Without this we can't tell which Canva placement / Etsy listing converts.

### P2 — Per-SKU secret on `mbti-character` once Etsy goes live
Today both packs are `secret: null` — anonymous redemption. Once paid Etsy listings go live for `mbti-character`, consider rotating to a `secret` to ensure the asset is only handed to verified buyers (who get the `?t=` in their listing PDF). Same playbook for `vocabulary` after its Etsy listing.

### P2 — Internationalized landing pages
The landing page is currently EN-only (no per-locale title / description translations). For overseas Etsy buyers this is fine — Etsy listings carry the localized marketing copy. If we later want SEO on `/pack/<sku>` we'd internationalize, but that's deferred since these pages are intentionally `noindex`.

### P3 — Pack catalog as a hub page
A `/packs` index listing all active packs could surface them organically once `/pack/<sku>` pages get visibility. Today there is no such page; if we later want one, the data is already in `lib/etsy_packs.json` via `listActivePacks()`.

---

## Where things live

| Surface | Path |
| --- | --- |
| Registry (single source of truth) | `lib/etsy_packs.json` |
| Typed loader + helpers | `lib/etsy_packs.ts` (`getActivePack`, `listActivePacks`, `listAllPacks`) |
| Landing page | `app/[locale]/(public)/pack/[sku]/page.tsx` |
| Download button | `app/[locale]/(public)/pack/[sku]/DownloadButton.tsx` |
| Frontend redemption service | `services/etsyPacks.ts` (POSTs to `/etsy_packs/<sku>/download`) |
| Backend redemption endpoint | `curify-studio` — `/etsy_packs/<sku>/download` (signed URL issuer + rate limiter + logger) |
| Pack build script (dual-output + Azure upload) | `scripts/build_template_packs.cjs` |
| Local source bundles (gitignored, except `pack.zip`) | `packs/<sku>/` |
| Azure blob layout (production assets) | `packs/sku/<sku>/pack-v<n>.zip` |
| Tracking content type | `etsy_pack` in `ContentType` (`services/useTracking.ts`) |
| Tracking action type | `download` in `ActionType` (`services/useTracking.ts`) |
| Sibling status docs | `docs/blog-quality.md`, `docs/search-quality.md`, `docs/interconnection.md` |

---

_This doc is the runbook for the paid-pack distribution layer. Update after every push that touches the registry, the redemption flow, or the build script._
