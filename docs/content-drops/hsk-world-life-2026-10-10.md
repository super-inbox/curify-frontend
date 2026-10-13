# HSK reading content drop — 2026-10-10, watercolor revision

Twenty readings for foreign learners: 12 targeting HSK2 practice and eight HSK3.
The subjects are Beijing, Shanghai, two festivals, four seasonal stories, six
countries across six continents, and six everyday interactions. These labels
indicate practice difficulty; place names and thematic vocabulary are supported
extensions, not an official exam-vocabulary-only claim.

## Approved presentation

The October 11 revision replaces the rejected minimalist cards and page-based
videos with the established HSK watercolor template. The Beijing card and its
slow scrolling video were approved by the user before the rest of the batch.
All 160 Chinese sentences and their existing narration are unchanged.

Each poster has a cream background, an HSK cloud badge, a reading-lesson ribbon,
a Chinese title with English subtitle, eight Chinese sentences with pinyin above
each line, watercolor story scenes, and a two-by-four vocabulary grid. Each of
the eight vocabulary cards includes Chinese, pinyin, an English meaning and an
illustration. The four original vocabulary entries are retained; four relevant
words from each story complete the established grid.

Images are generated with the built-in image tool using the approved Beijing
poster as the visual reference. Authored text and saved generation prompts are
retained with the gallery assets. Clean originals are retained; CDN posters and
previews use the existing watermark helper.

Videos slowly scroll upward across the same full poster, followed by the Curify
closing card. Output is 960×1280 H.264/AAC at 30 fps. Narration reuses the original
Azure `zh-CN-XiaoxiaoNeural` audio: gentle style, −25% speech rate and pauses
between sentences. No music competes with the voice. Branding appears on the
closing card so it does not obscure the reading text or the HSK badge.

## Asset organization

Durable gallery location:
`~/curify-gallery/edtech_videos/hsk-reading/2026-10-10-world-and-daily-life/`

- `index.html`: current playable catalogue.
- `cards/`, `posters/`, `video/`: approved watercolor assets.
- `narration/`: unchanged WAV files and authored narration text.
- `source/`, `batch.json`: renderer, generation prompts and source text.
- `asset-qa.json`, `text-qa.json`, `cdn-verification.json`: validation evidence.
- `template-style-sample/`: the originally approved Beijing sample.

Obsolete two-sentence frames and glossary-page subtitles are removed from the
current deliverable. The revised assets use `-watercolor-v2` CDN filenames,
preventing cached rejected images from appearing on the updated example pages.

## Content integration

The same twenty record IDs remain in the existing
`template-hsk-bilingual-reading-text-lesson-poster` family. Their image, preview
and video URLs point to the watercolor replacements. Metadata in all ten locales
(en, zh, de, es, fr, hi, ja, ko, ru, tr) describes the revised presentation.
Existing unrelated records, templates and translations remain unchanged.

Authored source: `scripts/configs/hsk_world_life_2026-10-10.json`.
Render the approved cards with their existing narration:

```sh
python scripts/render_hsk_readalong.py \
  --config scripts/configs/hsk_world_life_2026-10-10.json \
  --cards /path/to/batch/cards \
  --narration /path/to/batch/narration \
  --output /path/to/batch/video
```

The renderer needs Pillow, ffmpeg, the existing Curify logo and the installed
macOS fonts. `--only ID ...` selects stories; `--overwrite` refreshes renders;
`--jobs` controls concurrent rendering. Image generation is separate and uses
the saved prompts and approved reference; this command does not redraw cards.

## Validation and release boundary

All 60 CDN assets match their local SHA-256 hashes. All 20 videos decode fully,
have audible narration and differing reading frames, and run for 34.8–42.0 seconds.
Search evaluation remains PASS=95, WARN=42, FAIL=0. The i18n checker exits
successfully; existing missing-key warnings are outside this batch.

The release manifests record exact local and CDN hashes. Video QA checks every
MP4's dimensions, codecs, duration and full decoding. Source text checks cover
all 160 passage sentences and 160 vocabulary entries; rendered cards are also
visually reviewed for layout, text completeness and English meanings.

CDN availability alone does not establish production deployment. The frontend
content commit must pass the existing pull-request checks and review policy.
