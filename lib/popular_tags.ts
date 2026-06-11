// Hardcoded popular gallery tags surfaced on /nano-banana-pro-prompts
// as a stack of horizontal rows.
//
// Initial picks (2026-05-25) derived from GSC impressions on
// /nano-banana-pro-prompts/tag/<slug> in the latest export at
// raw/curify-ai.com-Performance-on-Search-2026-05-25/Pages.csv,
// filtered to canonical gallery tags. `athletic` + `professional`
// are kept despite thin galleries (6 / 8 prompts) as growth-signal
// markers — both pull >17 imps despite the catalog gap.
//
// Future: replace with on-platform click data once the analytics
// signal accumulates. Today GSC clicks are too sparse (most tag
// pages have 0-2 clicks) for a reliable ranking.
export const POPULAR_GALLERY_TAGS: string[] = [
  "romantic",
  "character",
  "mirror selfie",
  "east asian",
  "architecture",
  "nature",
  "selfie",
  "animal",
  "silver",
  "collage",
  "athletic",
  "professional",
];

// One row per popular tag on /nano-banana-pro-prompts. Aligned to the
// xl 6-column grid the rest of the site uses since the 2026-06-04 layout
// refactor; was 5 from the pre-refactor lg:grid-cols-5 era.
export const POPULAR_TAG_ROW_LIMIT = 6;
