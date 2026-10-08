# Editorial photography gallery drop — 2026-10-08

Six original AI-generated fashion and still-life concepts are registered as prompt-gallery entries **4393–4398** in `public/data/nanobanana.json`. They are not template examples or commissioned client photography. Exact generation prompts, English titles, bilingual search aliases, and curated tags are recorded in `scripts/configs/editorial_gallery_2026_10_08.json`.

| ID | Image | CDN filename |
| --- | --- | --- |
| 4393 | Ivory dress in architectural interior | f11-ivory-reclining.jpg |
| 4394 | Black dress in wooden doorway | f12-black-doorway.jpg |
| 4395 | Ivory open-back fabric detail | f13-ivory-back-detail.jpg |
| 4396 | Amber perfume and glass | s16-amber-glass.jpg |
| 4397 | Black handbag on dusty blue paper | s17-black-bag-blue.jpg |
| 4398 | Sapphire ring in white shell | s18-shell-ring.jpg |

CDN prefix: `https://cdn.curify-ai.com/images/nanobanana/editorial-2026-10-08/`

The built-in image generator produced the clean originals. The shared `applyTiledWatermark` helper adds Curify's established watermark afterward; the published JPEGs retain the full 1024×1536 composition. Gallery consumers use `imageUrl`, so this drop publishes six complete JPEG assets, not template-preview records. Binary assets remain on the CDN under the repository's existing `.gitignore` convention.

## Reuse with existing generated images

1. Review the exact generation prompts and original images. Make a manifest using this drop as the schema, assigning unused JavaScript-safe numeric IDs. Record SHA-256 checksums of the originals and descriptive, versioned CDN filenames. Treat new AI concepts honestly as concepts.
2. Run `node scripts/prepare_gallery_drop.cjs MANIFEST ORIGINALS_DIR OUTPUT_DIR`. This verifies all original checksums, applies the existing tiled watermark, and prepares JPEGs without uploading or modifying originals. Requires the usual Node dependencies and ImageMagick.
3. Upload only the prepared files to the manifest's `gcsPrefix`, using `gsutil cp -n`. Verify every public CDN URL returns an image with matching bytes before shipping the JSON.
4. Run `python3 scripts/register_gallery_drop.py MANIFEST --check`, then without `--check`. The importer rejects ID/URL conflicts and is idempotent. It preserves existing JSON bytes, including legacy IDs beyond JavaScript's safe integer range.
5. Run `node scripts/regen_nanobanana_metadata.cjs` so domain/tag totals used by search, hub pages and sitemaps include the new records. Check that the corpus delta is exactly the reviewed entries.
6. Run `python3 -m unittest discover -s scripts/tests -p test_register_gallery_drop.py` and `git diff --check`. Review the diff and ship through a PR against the current active integration branch. Verify the remote branch exists rather than assuming the historical `jwang/vercel` branch.
7. After merge to `main`, the existing `Sync Nano Prompts to Redis` workflow is triggered by the corpus change. Gallery pages depend on this Redis sync; a CDN upload alone does not publish the gallery entries. Confirm that workflow and the frontend deployment before declaring the entries live.

No new template definitions, template translations, or generation-backend changes are required for this gallery-only drop.
