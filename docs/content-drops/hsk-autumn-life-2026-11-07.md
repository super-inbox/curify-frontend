# HSK autumn and weekend content drop — 2026-11-07

Ten original readings for foreign learners: seven HSK2 practice targets and three HSK3. The level labels describe practice difficulty; thematic vocabulary is glossed and is not limited to official exam lists.

## Topics

- HSK 2: 同学的万圣节聚会 / A Halloween Party with Classmates
- HSK 2: 一起去看红叶 / A Walk among Red Leaves
- HSK 2: 海滩上的小城堡 / A Sandcastle on the Beach
- HSK 2: 热热的烤红薯 / A Warm Roasted Sweet Potato
- HSK 3: 周末去逛旧书市集 / A Weekend Secondhand Book Market
- HSK 2: 我的手套找到了 / Finding My Missing Glove
- HSK 3: 在博物馆读中文 / Reading Chinese at a Museum
- HSK 3: 第一次参加中文角 / My First Chinese Language Corner
- HSK 2: 一起包饺子 / Making Dumplings Together
- HSK 2: 给朋友挑明信片 / Choosing Postcards for Friends

## Presentation and assets

Uses the October-approved watercolor HSK template: cream paper, cloud level badge, title ribbon, eight Chinese sentences with pinyin, story illustrations and a 2×4 grid of eight vocabulary cards with English meanings. Exact authored text is provided to the built-in image generator; each output is visually reviewed before rendering.

The video slowly scrolls across the same full poster, followed by the Curify closing card. Existing renderer: `scripts/render_hsk_readalong.py`, 960×1280, 30 fps, H.264/AAC. Azure `zh-CN-XiaoxiaoNeural` supplies gentle female Mandarin narration at −25% rate and −2% pitch, with 600 ms between title/sentences and a 700 ms closing pause. No music competes with speech.

CDN posters/previews use the established tiled watermark helper; clean cards and their videos are retained locally.

Gallery: `~/curify-gallery/edtech_videos/hsk-reading/2026-11-07-autumn-and-weekend/`

- `index.html`: playable catalogue.
- `cards/`, `posters/`, `video/`: reviewed learning assets.
- `narration/`: original narration text and WAV audio.
- `source/prompts/`: exact per-card image prompts.
- `batch.json`, `source/`, QA reports and CDN manifests: reproducibility and verification.

## Content integration

Ten new records extend `template-hsk-bilingual-reading-text-lesson-poster` with image, preview and video URLs, relevant topics, Chinese/English aliases and page metadata in all ten supported locales. Existing records are preserved. Authored source is `scripts/configs/hsk_autumn_life_2026-11-07.json`.

Work was prepared on an isolated branch/worktree to preserve concurrent user edits. This drop registers the assets in the website; it does not post to social platforms or create a new recurring schedule.

## Validation

Source checks cover 80 sentences and 80 vocabulary entries. Contextual neutral tones and 一/不 tone changes were reviewed. Rendered cards are visually reviewed for complete text, pinyin, vocabulary meanings and the approved layout. Video checks cover full decoding, 960×1280 dimensions, 30 fps, H.264/AAC, audible speech, duration and frame changes confirming motion. Public CDN downloads are verified against exact local SHA-256 hashes.

The i18n check and before/after search evaluation are recorded in the release QA report. Production deployment still follows the repository’s pull-request and review policy.

Release checks completed: all 30 CDN responses match local SHA-256 hashes; all ten videos fully decode, have audible narration and visible motion, and run for 38.8–44.1 seconds. Search evaluation remains PASS=99, WARN=42, FAIL=0. The i18n checker exits 0; existing missing-key warnings are outside these new records.
