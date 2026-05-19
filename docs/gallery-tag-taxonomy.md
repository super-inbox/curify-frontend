# Gallery Tag Taxonomy — Proposal

_Created 2026-05-19. Owner: jay. P0 #2 from `docs/search-and-content.md`. The
audit numbers and GSC traffic come from `lib/generated/nanobanana_prompts_metadata.json`
(2026-05-14 snapshot, 4,117 prompts, 151 distinct tags) and
`raw/curify-ai.com-Performance-on-Search-2026-05-13/Pages.csv` (13-day search-console
window) plus the 2026-05-19 7-day window. Update after each mapping batch ships
into `lib/topicRegistry.ts`._

## Framing

Gallery prompts (`nano-banana-pro-prompts`) carry free `tags: string[]` that grew
organically from the source datasets. Templates carry structured `topics` driven
by the tier-1 / tier-2 / tier-3 hierarchy in `lib/topic_tag_mappings.json` plus
the kids tier-4 subjects in `lib/subject_topic_seeds.json`. The two systems
don't talk to each other directly: only the curated maps in `lib/topicRegistry.ts`
(`TOPIC_GALLERY_TAG` one-way, `EXTRA_TAG_TO_TOPICS` reverse) bridge them.

**Today only 58.9% of tag-occurrences are mapped to a topic.** The remaining
41.1% — ~6,180 tag occurrences across 90 distinct tags — are dead-ends for the
tag-page → topic crosslink. A user on `/nano-banana-pro-prompts/tag/playful`
(407 prompts) sees zero related templates because `playful` doesn't carry a
reverse map entry. This proposal closes the gap with a mix of (a) extending
the reverse map into existing tier-3 buckets, (b) introducing 2-3 new tier-3
slots for genuinely-new horizontal axes the catalog has acquired, and (c)
explicit decisions on the long-tail noise.

## Goal

- Push reverse-map coverage from 58.9% → 90%+ of tag-occurrences.
- Don't add tier-3 buckets just to absorb noise — a bucket needs ≥100 prompts
  and clear thematic coherence to earn one.
- Keep the long tail (1-2 prompt tags) untouched as cosmetic — neither blocking
  recommendation nor causing drift.

## Current coverage (2026-05-14 snapshot)

| | Distinct tags | Total prompt-tag occurrences | % of total |
| --- | --- | --- | --- |
| Mapped via `TOPIC_GALLERY_TAG` (29 topic→tag pairs) | 29 | 6,047 | 40.2% |
| Mapped via `EXTRA_TAG_TO_TOPICS` (32 extras) | 32 | 2,815 | 18.7% |
| **Mapped total** | **61** | **8,862** | **58.9%** |
| **Unmapped** | **90** | **6,183** | **41.1%** |

Note: `photorealistic` (1,889) and `woman` (1,718) alone account for 24% of all
occurrences — they're already mapped. The remaining unmapped 41% is mostly the
mood/season/lighting axes that the catalog has but the topic registry doesn't.

## Unmapped clusters (≥40 occurrences each)

Sorted by total prompt count within each cluster. GSC impressions are from the
2026-05-13 (13-day) window. Tags with both high prompt count AND positive GSC
impressions are the priority — clear demand-and-supply match.

### Cluster A — Mood / emotion (~3,035 occurrences, no current bucket)

| Tag | Prompts | GSC imp (13d) | GSC imp (7d) |
| --- | --- | --- | --- |
| playful | 407 | — | — |
| confident | 387 | — | — |
| serene | 374 | — | — |
| cozy | 323 | 28 | 8 |
| joyful | 317 | — | — |
| intimate | 289 | — | — |
| vibrant | 258 | — | — |
| luxurious | 171 | — | — |
| stylish | 167 | — | — |
| contemplative | 128 | — | — |
| bold | 126 | — | — |
| energetic | 124 | — | — |
| dynamic | 113 | — | — |
| calm | 103 | — | — |
| tranquil | 87 | — | — |
| introspective | 78 | — | — |
| sophisticated | 50 | — | — |
| glamorous | 51 | — | — |
| relaxed | 26 | 37 | — |
| romantic | 38 | 4 | 57 |

**Proposed:** new tier-3 bucket **`mood`** under no specific tier-1 (it's
horizontal — a mood applies to character, fashion, lifestyle, design alike).
Map the top-12 explicitly via `EXTRA_TAG_TO_TOPICS`. The rest (the 1-2-occurrence
adjectives like `exhausted`, `wary`, `chaotic`) stay unmapped and harmless.

### Cluster B — Lighting / time-of-day (~770 occurrences)

| Tag | Prompts | GSC imp |
| --- | --- | --- |
| night | 257 | — |
| soft-light | 138 | — |
| golden hour | 92 | 255 (13d) |
| sunset | 75 | — |
| morning | 73 | — |
| natural-light | 51 | — |
| bokeh | 40 | — |
| twilight | 32 | — |
| natural light | 12 | 22 (13d) |

GSC validates direct demand: `golden hour` was the 4th-highest tag page by
impressions in the 13-day window. The descriptive-prompt query
`advertising key visual photoreal portrait warm natural light street bokeh prompt`
(55 impressions) shows users typing both `natural light` and `bokeh` as
search-time descriptors.

**Proposed:** new tier-3 bucket **`lighting`** under `design`. Map the top-7
via `EXTRA_TAG_TO_TOPICS` (collapsing `natural-light` / `natural light` to one
canonical slug — drop the hyphen, prefer the space form to match the prompt
tag).

### Cluster C — Seasons / weather (~619 occurrences)

| Tag | Prompts | GSC imp |
| --- | --- | --- |
| winter | 192 | — |
| snowy | 92 | — |
| festive | 85 | — |
| summer | 72 | — |
| christmas | 71 | — |
| autumn | 41 | — |
| rainy | 37 | — |
| snowy landscape | 25 | 502 (13d) ← highest |
| seasonal | 4 | — |

`snowy landscape` is one of the highest-impression tag pages overall.

**Proposed:** new tier-3 bucket **`seasonal`** under no tier-1 (horizontal,
like `mood`). Map the top-7. Collapse `snowy landscape` → `snowy` reverse
entry (both point at seasonal).

### Cluster D — Scenery / place (~165 occurrences)

| Tag | Prompts | GSC imp |
| --- | --- | --- |
| beach | 50 | 7 |
| forest | 37 | — |
| ocean | 30 | — |
| garden | 26 | — |
| nature | 18 | 14 (7d) |

Below the new-bucket threshold (~100 prompts). But these all map cleanly to
the existing `travel` tier-1 since the templates that match are
travel/scrapbook/itinerary content.

**Proposed:** add direct reverse entries to `EXTRA_TAG_TO_TOPICS` pointing
each at `travel`. No new bucket needed.

### Cluster E — Color / material (~340 occurrences)

| Tag | Prompts | GSC imp |
| --- | --- | --- |
| pastel | 90 | — |
| glossy | 63 | — |
| silver | 53 | — |
| gold | 44 | — |
| warm | 43 | — |
| metallic | 25 | — |
| vibrant colors | 22 | — |

No tier-3 cluster threshold met (max 90). All of these are design-style
descriptors. Map to `design.digital-canvas` (artistic) — it's the closest
existing tier-3.

**Proposed:** extend `EXTRA_TAG_TO_TOPICS` with these 7 → `digital-canvas`.

### Cluster F — Photo-style / realism (~208 occurrences)

| Tag | Prompts | GSC imp |
| --- | --- | --- |
| hyperrealistic | 147 | 18 (13d) |
| ultra realistic | 30 | — |
| macro | 22 | — |
| 3d / 3D | 6 | — |
| studio | 1 | — |

These are stylistic siblings of `photorealistic` (already a tier-3 under design).
Map all to `photorealistic`.

**Proposed:** extend `EXTRA_TAG_TO_TOPICS` with these → `photorealistic`.

### Cluster G — Aesthetic / style (~224 occurrences)

| Tag | Prompts | Likely bucket |
| --- | --- | --- |
| y2k | 73 | vintage-retro |
| modern | 58 | minimalist? (or no map) |
| natural beauty | 38 | (no bucket — drop) |
| luxury | 25 | high-fashion |
| natural | 25 | (no map — too generic) |

**Proposed:** map y2k → `vintage-retro`, luxury → `high-fashion`. Drop the
generic ones (`modern`, `natural`, `natural beauty`) — they're too vague to
map without false positives.

### Cluster H — Subject / object (~165 occurrences)

| Tag | Prompts | Likely bucket |
| --- | --- | --- |
| car | 78 | (no current map — own tag) |
| cat | 26 | `animal` |
| sunglasses | 20 | `fashion` |
| transformation | 27 | (no current map — could be `before-after`?) |
| friends | 11 | `relationship` |
| before-after | 1 | (existing) |

**Proposed:** cat → `animal`, sunglasses → `fashion`, friends → `relationship`,
transformation → `before-after` (or keep unmapped — only 27 prompts). `car`
stays unmapped — it's too narrow for any current tier-3 and not worth a new
bucket alone.

### Cluster I — Long tail (90 of the 151 tags have <20 prompts)

The lowest-volume slice — `iconic` (3), `none` (3), `historical` (2), `ink` (2),
`exhausted` (1), `wary` (1), `regal` (1), `chaotic` (1), `humorous` (1), `text` (1)…

**Proposed:** leave unmapped. None of them carry enough volume to surface
related templates meaningfully, and several (`none`, `subject`, `text`) are
noise from the source ingestion that we should consider auditing out at the
ingestion step rather than mapping into the registry.

## Proposed map extensions (concrete)

### New tier-3 bucket: `mood`
- Add to `EXPLICIT_CHILD_TOPICS` under no tier-1 — or treat as a horizontal
  tag-children axis. **Open decision:** which tier-1 owns it? Recommending
  `lifestyle` since lifestyle.fashion already carries vibe-style tier-3s
  (chic / edgy / elegant / casual / minimalist). Mood is the same axis but
  for emotion rather than style.

### New tier-3 bucket: `lighting`
- Add to `EXPLICIT_CHILD_TOPICS.design` alongside `posters`, `digital-canvas`,
  `mockups`.

### New tier-3 bucket: `seasonal`
- Horizontal — same shape as `mood`. Recommending `lifestyle.nostalgia`
  parent (winter / christmas / cozy all overlap with nostalgic content already).

### `EXTRA_TAG_TO_TOPICS` additions (35 mappings)

```ts
// Mood (top 12 — leaves the rest unmapped as cosmetic)
playful:        ["mood"],
confident:      ["mood"],
serene:         ["mood"],
cozy:           ["mood"],
joyful:         ["mood"],
intimate:       ["mood"],
luxurious:      ["mood"],
stylish:        ["mood"],
contemplative:  ["mood"],
energetic:      ["mood"],
calm:           ["mood"],
romantic:       ["mood"],

// Lighting (top 8)
"golden hour":  ["lighting"],
"soft-light":   ["lighting"],
"natural light": ["lighting"],
"natural-light": ["lighting"],
sunset:         ["lighting"],
bokeh:          ["lighting"],
twilight:       ["lighting"],
night:          ["lighting"],

// Seasonal (top 7)
winter:         ["seasonal"],
summer:         ["seasonal"],
autumn:         ["seasonal"],
snowy:          ["seasonal"],
"snowy landscape": ["seasonal"],
christmas:      ["seasonal"],
festive:        ["seasonal"],

// Scenery → travel
beach:          ["travel"],
forest:         ["travel"],
ocean:          ["travel"],
garden:         ["travel"],
nature:         ["travel"],

// Color/material → design.digital-canvas
pastel:         ["digital-canvas"],
glossy:         ["digital-canvas"],
silver:         ["digital-canvas"],
gold:           ["digital-canvas"],
metallic:       ["digital-canvas"],

// Realism → photorealistic
hyperrealistic: ["photorealistic"],
"ultra realistic": ["photorealistic"],

// Style adjacent
y2k:            ["vintage-retro"],
luxury:         ["high-fashion"],

// Subject adjacent
cat:            ["animal"],
sunglasses:     ["fashion"],
friends:        ["relationship"],
```

**Coverage impact:** these 38 new entries lift mapped occurrences from 8,862
to roughly 13,800 — **~91.7% of total tag-occurrences mapped**, up from 58.9%.

## Open decisions

Before implementation:

1. **Tier-1 parent for `mood`** — `lifestyle` (recommended), `design`, or no
   parent (horizontal axis). The reverse-map lookup works regardless, but the
   tier-3 navigational presence (`/topics/mood` sibling chips on
   lifestyle / design pages) needs the parent.

2. **Should the `photorealistic` reverse-map expand really fold `hyperrealistic`
   in?** The risk: `photorealistic`'s topic page already excludes itself from
   the reverse map (see `REVERSE_MAP_EXCLUDED_TOPICS` in `topicRegistry.ts`)
   because its template set is too heterogeneous. Adding `hyperrealistic` /
   `ultra realistic` reverse entries would re-introduce the heterogeneity
   the exclusion was trying to avoid. **Recommendation:** add the mapping
   anyway, since the exclusion only affects the topic-page → tag direction,
   not the tag-page → topic direction we're extending.

3. **Long-tail noise audit.** Tags `none`, `subject`, `text`, `realistic`,
   `photograph` look like ingestion artifacts — they're meta-words about the
   prompt, not content tags. Worth a one-shot pass through the source
   datasets to filter these at ingestion rather than carrying them as
   permanent metadata.

4. **What about EN-vs-ZH gallery tags?** Today gallery tags are all English.
   If/when we add zh-prompt-source ingestion, the reverse map will need
   bilingual coverage. Out of scope for this proposal but flagged.

## Implementation plan (post-approval)

1. **Resolve open decision #1** (tier-1 parent for `mood`). 5-min call.
2. Add the 3 new tier-3 buckets (`mood`, `lighting`, `seasonal`) to
   `lib/topic_tag_mappings.json`. Add i18n display names in
   `messages/<locale>/topics.json` (10 locales — autotranslate via
   `scripts/i18n_autotranslate.cjs`).
3. Add the 38 entries to `EXTRA_TAG_TO_TOPICS` in `lib/topicRegistry.ts`.
4. Add a `TIER1_USE_CASES` entry for the new tier-3 parents if needed
   (likely inherits from parent tier-1).
5. Verify the new `/topics/mood`, `/topics/lighting`, `/topics/seasonal`
   pages render with their gallery prompts surfacing.
6. Re-run the gallery audit (`python3 scripts/audit_tag_coverage.py` —
   doesn't exist yet, ~30 LOC) to confirm 90%+ coverage.

Estimated: half-day end-to-end.

## Where things live

| Surface | Path |
| --- | --- |
| Gallery prompt metadata + tag counts | `lib/generated/nanobanana_prompts_metadata.json` |
| Topic registry (TOPIC_GALLERY_TAG + EXTRA_TAG_TO_TOPICS) | `lib/topicRegistry.ts` |
| Tier-1/2/3 hierarchy | `lib/topic_tag_mappings.json` |
| Kids tier-4 vocab subjects | `lib/subject_topic_seeds.json` |
| GSC tag-page traffic | `raw/curify-ai.com-Performance-on-Search-2026-05-{13,19}/Pages.csv` |
| Sibling status docs | `docs/search-and-content.md` (umbrella), `docs/search-quality.md` |
