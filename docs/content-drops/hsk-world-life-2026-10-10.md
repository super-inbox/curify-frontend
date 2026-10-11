# HSK reading content drop — 2026-10-10

Twenty original readings for foreign learners: 12 targeting HSK2 practice and 8
HSK3, with supported place names and topic vocabulary. These labels indicate
practice difficulty, not an official exam-vocabulary-only claim.

- Chinese cities: a first weekend in Beijing; an evening in Shanghai.
- Festivals: a first Dragon Boat Festival; Lantern Festival with classmates.
- Seasons: a spring picnic; summer rain; an autumn letter home; first snow.
- Countries: Japan, France, Kenya, Canada, Brazil, Australia. Each is told through
  a personal connection and names its continent; Australia uses Oceania.
- Daily life: asking someone to speak slowly; calling home; roommate quiet hours;
  requesting less chili; collecting a parcel; helping friends pronounce a name.

## Assets and presentation

Each story has eight authored Chinese sentences with pinyin and English support,
four glossary entries, a complete reading poster, a preview, and a 1080×1920
MP4. Videos show two sentences at a time across four pages, followed by six
seconds of vocabulary review. Azure `zh-CN-XiaoxiaoNeural`, gentle style, −25%
rate, 600 ms between sentences, and a subtle 1% camera movement provide the
read-along pace. Narration is synthesized in page-aligned chunks so page changes
follow the actual audio duration. No music competes with the speech.

Chinese and pinyin are rendered as literal font glyphs, with aligned baselines;
the illustrations are original code-drawn vector-style scenes. This avoids the
image-model diacritic substitutions seen in September. Clean learning assets
are retained; CDN posters and previews use the existing tiled watermark helper.

Durable gallery location:
`~/curify-gallery/edtech_videos/hsk-reading/2026-10-10-world-and-daily-life/`

- `index.html`: playable batch catalogue.
- `video/`, `cards/`, `posters/`, `frames/`: finished videos and reading visuals.
- `narration/`: authored text and assembled WAV narration.
- `subtitles/`: Chinese page-aligned SRT captions, including the glossary hold.
- `source/`, `batch.json`: production scripts and source text.
- `asset-qa.json`, `text-qa.json`, `cdn-verification.json`: validation evidence.

## Content integration

The twenty records extend the existing
`template-hsk-bilingual-reading-text-lesson-poster` family. Each has an image,
preview, video URL, relevant topics, bilingual search aliases, `allow_i18n`, and
`updated_at` for the sitemap discovery window. Existing template rank is 90.
No existing records or templates are replaced. Page metadata includes all ten
existing locales: en, zh, de, es, fr, hi, ja, ko, ru, tr.

Authored source: `scripts/configs/hsk_world_life_2026-10-10.json`.
The reusable renderer supports:

```sh
python scripts/render_hsk_readalong.py all \
  --config scripts/configs/hsk_world_life_2026-10-10.json \
  --output /path/to/batch
```

It needs Pillow, python-dotenv, ffmpeg, the existing Azure configuration in
`~/curify-studio/curify_background/.env`, and the installed macOS CJK/Latin fonts.
Use `pages`, `audio`, or `video` instead of `all` to resume one phase; `--only`
filters IDs, and `--overwrite` refreshes video renders. Keep the generated
narration with the batch so retries do not resynthesize unchanged speech.

## Validation and release boundary

All 240 passage/glossary rows pass syllable alignment and character-reading
checks. Context readings, 一/不 changes and neutral syllables were reviewed in
source. All 100 presentation pages pass layout-bound checks; the overview,
full-size reading screens, glossary and published poster were visually checked.
Every MP4 is fully decoded, checked for audible speech and matching duration,
and checked for H.264/AAC compatibility. Final duration range is 38.4–45.5 s.
Search evaluation remains PASS=95, WARN=42, FAIL=0 before and after the addition.

CDN uploads are scoped to these sixty assets, and each public response is
compared with the local SHA-256 checksum. CDN availability alone is not a claim
that production example pages have deployed: the content and translations must
also be merged/deployed through the frontend's active content-drop branch.
