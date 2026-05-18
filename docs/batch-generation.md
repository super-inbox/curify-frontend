# Batch Image Generation — Runbook

_Last updated: 2026-05-18 (low-languages config landed). Owner: jay. Update after every push that touches `scripts/generate_template_examples.cjs`, `scripts/lib/auto_tag.cjs`, `scripts/lib/watermark.cjs`, or adds a new config under `scripts/configs/`._

## Why this doc exists

`scripts/generate_template_examples.cjs` is the config-driven batch image generator for `nano_inspiration` entries. It runs end-to-end: image generation via Gemini → watermark → preview → auto-tag → `search_aliases` enrichment → `nano_inspiration.json` write → optional CDN sync. The pipeline is mature but undocumented — every time a new family of examples gets generated, the same questions come up (what config shape, which flags, where do images land, when to use `--sync`). This doc captures the answers and the most recent runs.

This doc covers the **public gallery generation** flow. The separate paid-pack flow (`--pack=<sku>`, build_template_packs.cjs, Etsy redemption) is documented in `docs/etsy-packs.md` — out of scope here.

---

## Quick reference

| Step | Command | What it does |
| --- | --- | --- |
| Dry-run (no files, no writes) | `node scripts/generate_template_examples.cjs --config=scripts/configs/<name>.json --dry-run` | Validate the config shape and confirm record IDs / params look right. |
| Generate locally | `node scripts/generate_template_examples.cjs --config=scripts/configs/<name>.json` | Generate images, watermark, preview, auto-tag, write to `nano_inspiration.json` and `public/images/nano_insp[_preview]/`. No CDN upload. |
| Generate + upload | `… --config=… --sync` | All of the above plus push the new images to the configured GCS / Azure bucket. |
| Re-run offline (no LLM) | `… --config=… --no-auto-tag` | Skip the OpenAI auto-tag pass. Useful during an OpenAI outage. |
| Internal review (no logo) | `… --config=… --no-watermark` | Skip the tiled Curify logo overlay. |
| Pin a model | `… --config=… --model=gemini-2.5-flash-image` | Default is Nano Banana Pro (`gemini-3-pro-image-preview`). |

Required env (loaded from `.env.local`):
- `GEMINI_API_KEY` — for image generation.
- `OPENAI_API_KEY` — for the auto-tag pass (only when auto-tag is on).

---

## Config format

`scripts/configs/<name>.json` is a flat JSON array. Each entry is one inspiration record to generate:

```json
{
  "template_id":  "template-vocabulary",
  "params":       { "language_pair": "en-ko", "topic_name": "Fruits" },
  "topics":       ["english-korean", "food-and-drink", "vocabulary", "language"],
  "id_suffix":    "english-korean-fruits"
}
```

Field roles:
- `template_id` — the template the example belongs to. Must exist in `public/data/nano_templates.json`.
- `params` — values for the template's parameter set. Required ones come from `locales.en.parameters` (or zh) on the template.
- `topics` _(optional)_ — appended to the resulting record's `topics`. The pipeline auto-tags an additional Tier-3 topic and enriches `search_aliases` regardless; this is for the obvious / structural topics you already know (language-pair tag, theme).
- `id_suffix` _(optional)_ — overrides the slug part of the record ID. The final record ID is `<template_id>-<id_suffix>`. When omitted, the generator derives a slug from the params.

Existing example configs:
- `scripts/configs/vocabulary_kids_topics.json` — 108 en-zh vocabulary entries across 12 themes (foundational for the Etsy `vocabulary` pack).
- `scripts/configs/9_traits_stereotypes.json` — character template examples.
- `scripts/configs/subject_tier3_examples.json` — Tier-3 topic anchor examples.
- `scripts/configs/portugal_examples.json` — geo-themed travel examples.
- `scripts/configs/low_languages_2026-05-18.json` — 75 entries across template-vocabulary + template-word-scene × en-ko / en-ja / en-es / en-fr.

---

## What the pipeline does, end to end

1. **Loads the config** and resolves each entry against `nano_templates.json`. Skips entries whose target record ID already exists in `nano_inspiration.json` (so re-runs are safe).
2. **Generates the image** via the Gemini API at the configured model. Saves the raw to a temp path.
3. **Watermarks** the image with the tiled Curify logo (`scripts/lib/watermark.cjs::applyTiledWatermark`). The preview is generated AFTER watermarking so it inherits the stamp. Pass `--no-watermark` to skip.
4. **Saves images** to:
   - `public/images/nano_insp/<record-id>.jpg` (full size)
   - `public/images/nano_insp_preview/<record-id>-prev.jpg` (preview)
5. **Auto-tags** the record (`scripts/lib/auto_tag.cjs`):
   - Picks one Tier-3 topic tag based on the parent template's Tier-1 ancestor.
   - Calls `gpt-4o-mini` to enrich the new record's `search_aliases` with cross-language synonyms (the same pipeline that ran the catalog-wide 1,932-record sweep on 2026-05-15). Pass `--no-auto-tag` to skip.
6. **Appends** the new record to `nano_inspiration.json` (sorted by template_id for stable diffs).
7. **Optional CDN sync** (`--sync`): uploads the new image + preview to the configured asset bucket. Without `--sync`, the files live locally only — Vercel will serve them from `public/images/...` on the next deploy.

---

## Adding a new config (recipe)

1. **Pick a name.** Naming convention: `<theme>_<scope>_<date>.json` (e.g. `low_languages_2026-05-18.json`, `vocabulary_kids_topics.json`).
2. **Hand-author or script-author the JSON array.** For large families it's easier to generate from a Python or Node script over a curated theme list — see the 2026-05-18 low-languages run for the pattern.
3. **Dry-run.** `node scripts/generate_template_examples.cjs --config=scripts/configs/<name>.json --dry-run` — confirms each entry's `id` doesn't collide, all `template_id`s exist, all required params are present.
4. **Generate.** Drop `--dry-run`. Watch the first 5 records, then let it rip. ~30-60 sec per record at the default model.
5. **Spot-check.** Open 3-5 of the new pages in dev (`/nano-template/<slug>/example/<exampleId>`) — confirm the image looks right and the auto-tagged topics make sense.
6. **Sync.** Re-run with `--sync` (or trigger the CDN sync via your usual pipeline) so the images aren't only in `public/`.
7. **Commit.** Stage the new config, the updated `nano_inspiration.json`, the new image files, and let the build pick them up. Use a `daily-content-drop`-style commit message (see `project_daily_template_workflow.md` memory).

---

## What's already shipped — recent batch runs

| Date | Config | What | Count |
| --- | --- | --- | --- |
| Earlier | `vocabulary_kids_topics.json` | English-Chinese kids vocabulary across 12 themes (animals, nature, food, family, transport, weather, body, emotions, celebrations, school, space, life cycles). Drove the Etsy `vocabulary` pack. | 108 |
| Earlier | `9_traits_stereotypes.json` | 9-trait info-grid character examples. | ~30 |
| Earlier | `subject_tier3_examples.json` | Tier-3 topic anchor seeds. | varies |
| Earlier | `portugal_examples.json` | Geo travel examples. | varies |
| 2026-05-18 | `low_languages_2026-05-18.json` | **75 entries** for `template-vocabulary` (35) + `template-word-scene` (40) across en-ko (19) / en-ja (18) / en-es (19) / en-fr (19). Curated 10 universal vocabulary themes + 10 universal scenes, drawn from the existing en-zh set so each one pairs with a known-good base prompt. **Not yet generated** — config landed, pipeline ready to run. | 75 |

---

## Next up

- **Run `low_languages_2026-05-18.json` through the pipeline.** Single command:
  ```
  node scripts/generate_template_examples.cjs --config=scripts/configs/low_languages_2026-05-18.json --sync
  ```
  Plan for ~45-75 min wallclock at the default model. Once it completes, the four low-language pairs (ko, ja, es, fr) each gain ~18-19 new examples across the two templates — closing the gap to en-zh's 109 vocabulary + 68 word-scene examples.

- **Audit auto-tag output.** Spot-check 5-10 of the new records after the run — confirm Tier-3 topics and `search_aliases` make sense in the target language (the LLM occasionally drifts on non-English topic names).

- **Build a second batch once the first lands.** 10 universal themes per language is the floor. Once those exist, a follow-up config can target language-specific topics (e.g. `Hangul Calligraphy` for en-ko, `Tatami Room` for en-ja, `Tapas Bar` for en-es, `Boulangerie` for en-fr) to give each pair some locale-specific character.

---

## Where things live

| Surface | Path |
| --- | --- |
| Main generator | `scripts/generate_template_examples.cjs` |
| Watermark helper | `scripts/lib/watermark.cjs` (`applyTiledWatermark`) |
| Auto-tag + alias enrichment | `scripts/lib/auto_tag.cjs` |
| Config files | `scripts/configs/<name>.json` |
| Generated images | `public/images/nano_insp/<id>.jpg` |
| Generated previews | `public/images/nano_insp_preview/<id>-prev.jpg` |
| Inspiration records (canonical) | `public/data/nano_inspiration.json` |
| Template registry | `public/data/nano_templates.json` |
| Sibling status docs | `docs/blog-quality.md`, `docs/search-quality.md`, `docs/interconnection.md`, `docs/etsy-packs.md` |

---

_This doc is the runbook for the public-gallery image generation pipeline. Update after each new batch run or pipeline change._
