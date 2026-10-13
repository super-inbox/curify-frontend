# Cinematic child portrait scenes and publishing queue

Four reference-image edits extend `template-studio-digital-backdrop-scene`: Jurassic rainforest, Hogwarts-inspired hall, Frozen-inspired ice palace and Asgard-inspired golden city. The same fully synthetic child source is used in every edit. Each catalog example displays an English before/after card, making the background-editing task visible.

The source is `curify-gallery/smm_daily/2026-09-01-retouching/demos/retouch-children-demo-09-10/00-source.png`; its existing provenance states that it was generated from an original prompt, with no real child or client photograph. Every output was reviewed visually for face, hair, clothing, hand, pose and framing continuity. This is not a pixel-identity or biometric guarantee. The disclosure on all publishing cards reads “AI-generated retouching concepts” or its Chinese equivalent.

## Template behavior

The existing English and Chinese prompts previously forced a seamless studio sweep and banned architecture even when the requested scene called for a castle or forest. The updated prompts retain that setup as the default studio mode, and choose environment mode when the scene direction explicitly calls for a location or fictional world. Required image upload and all three parameters are unchanged. Background light now follows the source portrait; contradictory instructions to repaint face/rim lighting or overlap the subject with props were removed. Descriptions and explanations are updated in all ten locales.

The four imagegen edits follow the updated mode and subject-preservation instructions. Future model outputs need their own visual review; prompt checks do not establish consistent performance across all uploaded portraits.

## Deliverables and queue

`curify-gallery/smm_daily/2026-09-01-retouching/demos/scene-worlds-2026-10-11/` contains the source, four PNG edits, eight bilingual before/after cards, two overview sheets, a reproducible layout script and provenance. The renderer only resizes and arranges existing images, preserving the full source framing. All cards are 1080×1440.

| Queue | Post | Asset / subject | Channels |
| --- | --- | --- | --- |
| Visual design, after V14 | V15 | South Heavenly Gate poster | RedNote, Instagram, Facebook |
| Visual design, after V15 | V16 | Jade Emperor’s Palace poster | RedNote, Instagram, Facebook |
| Retouching, after C7 | C8 | Jurassic rainforest before/after | RedNote, Facebook |
| Retouching, after C8 | C9 | Hogwarts-inspired hall before/after | RedNote, Facebook |
| Retouching, after C9 | C10 | Frozen-inspired ice palace before/after | RedNote, Facebook |
| Retouching, after C10 | C11 | Asgard-inspired city before/after | RedNote, Facebook |

The two existing celestial posters are copied into `smm_daily/2026-10-08-visual-design/`, with uncropped 3:4 RedNote and 4:5 Instagram versions plus original PNG/JPEGs. Five publishing documents contain the new queue rows, complete captions, image paths and template destinations. These entries are **ready drafts**, not live posts or platform-scheduled jobs; existing scheduled entries are preserved. Historical blanket exclusions of synthetic child imagery are explicitly superseded for this set by the user’s October 11 instruction.

## Catalog and assets

Briefs and source requirements: `scripts/configs/scene_worlds_2026-10-11.json`. This is an image-edit manifest, not a text-only batch-generation job. Use the reference source with every edit.

New record suffixes under `template-studio-digital-backdrop-scene`:

- `jurassic-rainforest-child-scene`
- `hogwarts-candlelit-hall-child-scene`
- `frozen-ice-palace-child-scene`
- `asgard-golden-city-child-scene`

For each record, the watermarked before/after card is at `/images/nano_insp/<record-id>.jpg`, its preview at `/images/nano_insp_preview/<record-id>-prev.jpg`, and the standalone edit at `/images/nano_insp/<record-id>-after.jpg`. The shared synthetic input is `/images/nano_insp/template-studio-digital-backdrop-scene-synthetic-child-source-20261011.jpg`. All thirteen assets are uploaded non-destructively to the existing Curify CDN. All earlier catalog records remain intact.

## Validation

- The actual server SearchPage ranks each new example first for `jurassic portrait`, `hogwarts portrait`, `frozen background` and `asgard background`, with rewrite and gallery calls disabled.
- The 137-query regression remains 95 PASS, 42 pre-existing WARN, 0 FAIL.
- i18n schema check passes; required source-upload mode and three prompt parameters are unchanged.
- Only this template definition changed; four examples were appended, with unique IDs and no edits to existing examples.
- New queue references resolve, card layouts were inspected, and the gallery installer verified the original queue-file hashes before applying edits.
