#!/usr/bin/env node
/**
 * Derive one representative thumbnail per user-visible topic.
 *
 * Output: lib/generated/topic_thumbnails.json
 *   { "<slug>": "/images/nano_insp/<file>.jpg", ... }
 *
 * Strategy:
 *   1. The set of topics is TIER1 ∪ TIER2 from lib/searchIndex.ts —
 *      these are the slugs the SearchBar / topic-suggestion surface
 *      shows to end users.
 *   2. For each slug, pick the highest-rank_score inspiration whose
 *      PARENT TEMPLATE has the slug in its topics[] (strict — NOT a
 *      tag-level catch-all, which would let high-rank generic
 *      templates like template-wc-knockout-matchup-poster dominate
 *      every topic they happen to share a tag with).
 *   3. If no template carries the slug, fall back to the highest-rank
 *      inspiration that lists the slug in its own topics[] or tags[].
 *   4. Skip slugs that find nothing — the component should fall back
 *      to a generic color-only tile for those.
 *
 * Re-run any time inspirations / templates change materially. Output
 * is committed to source.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TPL_PATH = path.join(ROOT, "public/data/nano_templates.json");
const INSP_PATH = path.join(ROOT, "public/data/nano_inspiration.json");
const OUT_PATH = path.join(ROOT, "lib/generated/topic_thumbnails.json");

// User-visible topic slugs. KEEP IN SYNC with TIER1_SUGGESTIONS +
// TIER2_SUGGESTIONS + the tier-3 sets in lib/searchIndex.ts. (We don't
// import that module here because it's a TS file with React-aware deps
// that would require building first.)
//
// Tier-3 IS user-facing — surfaced at the bottom of /topics/<slug>/page.tsx
// as "Explore more" chips and on /search results' related-topics fallback.
const TIER1_SLUGS = [
  "character", "language", "travel", "lifestyle", "learning",
  "culture", "design", "product", "personality", "world-cup",
];

const TIER2_SLUGS = [
  "anime", "portrait", "fashion", "food", "fitness", "animal",
  "science", "interior", "vocabulary", "city", "film", "relationship",
  "ai", "sports", "architecture", "nostalgia", "history", "mbti",
  "dialogue", "beauty", "posters", "reading", "comparison",
  "finance", "itinerary", "groups", "expressions", "trending",
  "digital-canvas", "mockups", "guides", "map", "language-english",
  "asl", "english-chinese", "english-spanish", "english-korean",
  "english-japanese", "english-french", "merch",
];

const TIER3_GEO_SLUGS = [
  "japan","korea","china","india","france","spain","italy","germany",
  "mexico","brazil","thailand","vietnam","singapore","egypt","australia",
  "greece","russia","portugal","uk","middle-east","united-states","iran",
];

const TIER3_STYLE_SLUGS = [
  "cartoon","photorealistic","watercolor","monochrome","ink","kawaii","isometric",
];

const TIER3_MBTI_SLUGS = [
  "intj","intp","entj","entp","infj","infp","enfj","enfp",
  "istj","isfj","estj","esfj","istp","isfp","estp","esfp",
].map((t) => `mbti-${t}`);

const TIER3_SUBJECT_SLUGS = [
  "animals","nature","space","weather","evolution","food-and-drink",
  "family","school","transportation","celebration","body","emotions","phonics",
];

const SLUGS = Array.from(new Set([
  ...TIER1_SLUGS,
  ...TIER2_SLUGS,
  ...TIER3_GEO_SLUGS,
  ...TIER3_STYLE_SLUGS,
  ...TIER3_MBTI_SLUGS,
  ...TIER3_SUBJECT_SLUGS,
]));

function load(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const templates = load(TPL_PATH);
const inspirations = load(INSP_PATH);

const TPL_TOPICS = new Map(
  templates.map((t) => [t.id, new Set(t.topics || [])])
);

function bestImageFor(slug) {
  // Pass 1 — strict: inspirations under templates that list the slug
  // in their topics[].
  const strict = inspirations.filter((r) => {
    const tplTopics = TPL_TOPICS.get(r.template_id) || new Set();
    return tplTopics.has(slug);
  });
  const candidates = strict.length > 0
    ? strict
    : // Pass 2 — fallback to inspiration-level topics/tags
      inspirations.filter((r) => {
        const own = new Set([...(r.topics || []), ...(r.tags || [])]);
        return own.has(slug);
      });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (b.rank_score || 0) - (a.rank_score || 0));
  const top = candidates[0];
  const u = top?.asset?.image_url || top?.asset?.preview_image_url || null;
  return u || null;
}

const out = {};
let resolved = 0;
let missing = [];
for (const slug of SLUGS) {
  const img = bestImageFor(slug);
  if (img) { out[slug] = img; resolved++; }
  else missing.push(slug);
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log(`Wrote ${resolved}/${SLUGS.length} thumbnails → ${OUT_PATH}`);
if (missing.length) {
  console.log(`Missing thumbnails for ${missing.length} slugs (will render color-only tile):`);
  for (const s of missing) console.log(`  - ${s}`);
}
