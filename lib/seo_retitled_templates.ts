// Templates whose page title / h1 / description was rewritten as part of
// the SEO content-intent retitling pass on 2026-05-05 (Trojan-horse:
// capture information-intent searches with content-first headings, then
// surface the AI prompt as the underlying tool).
//
// Bumping <lastmod> in the sitemap for these routes signals Google to
// recrawl the page when the next sitemap is submitted, picking up the
// new title and h1.

export const SEO_RETITLED_LASTMOD = "2026-05-05T00:00:00.000Z";

// Bump lastmod for example pages whose per-locale SEO copy
// (title / description / metaDescription) lives in
// messages/<locale>/example.json. Originally shipped for the 260
// allow_i18n examples on 2026-05-07; expanded on 2026-05-14 to also
// cover the 1,275 non-MBTI examples backfilled in commit 2f43a2e
// (gated by EXAMPLE_I18N_IDS, computed at module load from
// messages/en/example.json keys — see sitemap-examples.xml/route.ts).
export const I18N_DESCRIPTIONS_LASTMOD = "2026-05-14T00:00:00.000Z";

// MBTI example pages: bumped 2026-07-24 to force recrawl after two fixes —
// (a) the absolute-canonical fix (3fb7b42f, 2026-07-11) that un-folds these
// pages from the homepage canonical Google had mistakenly assigned, and
// (b) the double-"MBTI" title dedup (2026-07-24). GSC review found ~2,000
// impressions/mo across MBTI example pages ranking pos 1-9 with ~0 clicks;
// their indexed title/snippet were the stale pre-fix versions. Highest
// lastmod priority (see sitemap-examples.xml/route.ts) so it wins over the
// May i18n-descriptions date these same examples otherwise carry.
export const MBTI_RECRAWL_LASTMOD = "2026-07-24T00:00:00.000Z";

export const SEO_RETITLED_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  "template-gardening-how-to-infographic",
  "template-pet-care-guide",
  "template-pet-safe-human-food-infographic",
  "template-9-traits-info-grid",
  "template-history-timeline-infographic",
  "template-then-vs-now-comparison-infographic",
  "template-word-origins-map-infographic",
  "template-animation-studio-comparison-infographic",
  "template-travel-packing-guide-infographic",
  "template-lifestyle-watercolor-infographic",
  "template-ethnic-costume-deconstruction-board",
  "template-country-souvenirs-watercolor",
  "template-phonics-consonant-blend",
  "template-english-phrasal-verb",
  "template-chinese-character-learning-poster",
  "template-chinese-verb-opposite-infographic",
  "template-figure-principles-infographic",
  "template-verb-action-learning-cards",
  "template-vocabulary",
  "template-evolution",
  "template-architecture",
  "template-recipe",
  "template-herbal",
  "template-vintage-ultimate-guide-infographic",
  "template-weird-science-facts-infographic",
  "template-artist-biography-infographic",
  "template-celebrity-filmography-infographic",
]);
