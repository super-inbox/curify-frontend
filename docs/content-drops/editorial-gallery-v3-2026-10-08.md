# Editorial V3 gallery drop — 2026-10-08

Adds 16 original AI concept studies (4399–4414), eight fashion and eight still-life images, corresponding to the V3 page-two collection boards. The six earlier studies (4393–4398) remain intact. Generation used built-in image_gen; these are not client commissions or verified SKU-preservation examples.

The manifest `scripts/configs/editorial_gallery_v3_2026_10_08.json` contains verbatim generation prompts, original SHA-256 checksums, English titles/descriptions, hand-curated subject/material/lighting tags, bilingual aliases, categories and final CDN URLs. Uses the existing `prepare_gallery_drop.cjs` and `register_gallery_drop.py` workflow documented in `editorial-gallery-2026-10-08.md`.

Public images are 16 full-resolution 1024×1536 JPEGs with the standard tiled Curify watermark, under `https://cdn.curify-ai.com/images/nanobanana/editorial-v3-2026-10-08/`. Originals remain clean. The adjacent CDN receipt records HTTP status, MIME, byte lengths and SHA-256 matching the local delivery files.

Alias handling: aliases are curated in the source records and manifest. This change also preserves them in Redis summaries and detail records (previous sync omitted the field), with an optional frontend type. It does not introduce a new free-text search endpoint. Existing gallery discovery uses curated tags; regenerated metadata includes every new tag and category count.

Validation: original corpus bytes preserved before the appended block; exactly 16 additions; all exact prompts match the generation log; every entry has English and Chinese aliases, unique IDs and URLs; repeat registration adds zero records; importer tests pass; sync script syntax checked; metadata counts validated against the complete corpus; all 16 CDN files verified.

After merge, the existing main-branch Sync Nano Prompts to Redis workflow must succeed and the frontend deployment must complete before gallery visibility is confirmed. Uploading the CDN assets alone does not make the new gallery entries live.
