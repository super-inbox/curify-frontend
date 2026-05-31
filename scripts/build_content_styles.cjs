#!/usr/bin/env node
// Round 2B — Style axis + gallery tag absorption.
//
// The brainstorm's three-layer model (Topic / Info Type / Layout) doesn't
// explicitly name a Style axis, but the gallery prompt data demands one:
// 145 distinct tags clustered into clear sub-axes (mood, aesthetic,
// lighting, temporal) that today live as orphans in
// gallery_tag_to_topics or get squashed under generic 'lifestyle'.
//
// What this writes / updates in lib/taxonomy.json:
//
//   1. content_styles  — NEW top-level map, 4 sub-axes with canonical entries
//                        + per-entry gallery_count (signal of demand).
//
//   2. tier3 extensions — adds the canonical style entries as tier-3 leaves
//                         under their tier-1 parents (lifestyle ← mood,
//                         design ← aesthetic + lighting, travel ← temporal).
//                         So the gallery_tag_to_topics targets are valid.
//
//   3. gallery_tag_to_topics — covers all 145 tags (was 100/145).
//                              Adds the 45 unmapped + refines some existing.
//
// Per-template style tagging is deliberately out of scope here. The gallery
// tags are query-side vocabulary; template style tagging is a separate
// pass (templates already carry style via their own `topics[]` arrays
// when relevant — `watercolor`, `kawaii`, `cartoon`).

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TAXONOMY_PATH = path.join(REPO, "lib/taxonomy.json");
const META_PATH = path.join(REPO, "lib/generated/nanobanana_prompts_metadata.json");

// ── Style axes ─────────────────────────────────────────────────────────────

const STYLE_AXES = [
  {
    id: "mood",
    label: "Mood / emotional tone",
    description: "How the image *feels* — the emotional / temperamental tone the prompt asks for, independent of subject or medium. Drives query intent like 'cozy autumn aesthetic' or 'edgy editorial portrait'.",
    tier1: "lifestyle",
    tier2: "mood",
    entries: [
      "playful", "confident", "serene", "cozy", "joyful", "elegant",
      "intimate", "whimsical", "vibrant", "dramatic", "moody", "nostalgic",
      "contemplative", "energetic", "calm", "festive", "intense", "tranquil",
      "ethereal", "introspective", "mysterious", "romantic", "dreamy", "eerie",
      "captivating", "alluring", "carefree", "sophisticated", "glamorous",
      "warm", "surreal", "bold", "dynamic", "modern", "urban", "professional",
      "intellectual", "luxurious", "stylish", "humorous", "iconic",
      "exhausted", "wary", "somber", "regal", "soft", "relaxed", "futuristic",
      "natural-beauty",
    ],
  },
  {
    id: "aesthetic",
    label: "Aesthetic / visual style",
    description: "The visual medium and rendering style — what the image looks like as an artifact (photorealistic vs illustration vs ink-wash, monochrome vs vibrant, vintage vs y2k).",
    tier1: "design",
    tier2: "digital-canvas",
    entries: [
      "photorealistic", "illustration", "vintage", "hyperrealistic",
      "watercolor", "ink", "abstract", "pastel", "y2k", "glossy", "silver",
      "gold", "metallic", "monochrome", "3d", "industrial", "ultra-realistic",
      "vibrant-colors", "artistic",
    ],
  },
  {
    id: "lighting",
    label: "Lighting / illumination",
    description: "How the scene is lit — distinct from temporal because lighting can be fully synthetic (neon, studio). Some entries overlap with temporal (golden hour reads as both lighting and time-of-day).",
    tier1: "design",
    tier2: "lighting",
    entries: [
      "soft-light", "neon", "neon-lights", "golden-hour", "dramatic-lighting",
      "moody-lighting", "natural-light", "twilight", "studio", "bokeh",
      "cinematic",
    ],
  },
  {
    id: "temporal",
    label: "Temporal / seasonal / occasion",
    description: "When the scene takes place — season, time of day, weather, holiday. Distinct from lighting because temporal anchors a real-world moment (christmas, winter, sunset).",
    tier1: "travel",
    tier2: "seasonal",
    entries: [
      "winter", "summer", "autumn", "spring", "morning", "sunset", "night",
      "christmas", "snowy", "rainy", "festive",
    ],
  },
];

// ── Gallery tag → topic targets ────────────────────────────────────────────
//
// Each tag → array of topic names (matches tier-1/2/3 entries or known
// gallery target vocab). Style tags map to axis-name. Subject tags map to
// existing topic vocab. The 100 prior mappings are preserved verbatim in
// the base map below; this script merges new + refinement.

const TAG_TARGETS = {
  // ── MOOD axis (49 entries; gallery_tag → ["mood"] keeps the high-level
  //    grouping target, plus optionally a more specific tier-3 entry).
  "playful":        ["mood"],
  "confident":      ["mood"],
  "serene":         ["mood"],
  "cozy":           ["mood"],
  "joyful":         ["mood"],
  "elegant":        ["mood"],
  "intimate":       ["mood"],
  "whimsical":      ["mood"],
  "vibrant":        ["mood"],
  "dramatic":       ["mood"],
  "moody":          ["mood"],
  "nostalgic":      ["mood", "nostalgia"],
  "contemplative":  ["mood"],
  "energetic":      ["mood"],
  "calm":           ["mood"],
  "festive":        ["mood", "seasonal"],
  "intense":        ["mood"],
  "tranquil":       ["mood"],
  "ethereal":       ["mood"],
  "introspective":  ["mood"],
  "mysterious":     ["mood"],
  "romantic":       ["mood"],
  "dreamy":         ["mood"],
  "eerie":          ["mood"],
  "captivating":    ["mood"],
  "alluring":       ["mood"],
  "carefree":       ["mood"],
  "sophisticated":  ["mood"],
  "glamorous":      ["mood", "high-fashion"],
  "warm":           ["mood"],
  "surreal":        ["mood", "digital-canvas"],
  "bold":           ["mood"],
  "dynamic":        ["mood"],
  "modern":         ["mood"],
  "urban":          ["mood"],
  "professional":   ["mood"],
  "intellectual":   ["mood"],
  "luxurious":      ["mood", "high-fashion"],
  "stylish":        ["mood"],
  "humorous":       ["mood"],
  "iconic":         ["mood"],
  "exhausted":      ["mood"],
  "wary":           ["mood"],
  "somber":         ["mood"],
  "regal":          ["mood"],
  "soft":           ["mood"],
  "relaxed":        ["mood"],
  "futuristic":     ["mood"],
  "natural beauty": ["mood"],

  // ── AESTHETIC axis
  "photorealistic": ["digital-canvas", "photorealistic"],
  "illustration":   ["digital-canvas"],
  "vintage":        ["digital-canvas", "nostalgia", "vintage-retro"],
  "hyperrealistic": ["digital-canvas", "photorealistic"],
  "watercolor":     ["digital-canvas"],
  "ink":            ["digital-canvas"],
  "abstract":       ["digital-canvas"],
  "pastel":         ["digital-canvas"],
  "y2k":            ["digital-canvas", "vintage-retro"],
  "glossy":         ["digital-canvas"],
  "silver":         ["digital-canvas"],
  "gold":           ["digital-canvas"],
  "metallic":       ["digital-canvas"],
  "monochrome":     ["digital-canvas"],
  "3d":             ["digital-canvas"],
  "3D":             ["digital-canvas"],
  "industrial":     ["digital-canvas"],
  "ultra realistic":["digital-canvas", "photorealistic"],
  "vibrant colors": ["digital-canvas"],
  "artistic":       ["digital-canvas"],

  // ── LIGHTING axis
  "soft-light":     ["lighting"],
  "neon":           ["lighting"],
  "neon lights":    ["lighting"],
  "golden hour":    ["lighting"],
  "natural-light":  ["lighting"],
  "natural light":  ["lighting"],
  "twilight":       ["lighting"],
  "studio":         ["lighting"],
  "bokeh":          ["lighting"],
  "cinematic":      ["lighting", "film"],
  "night":          ["lighting", "seasonal"],

  // ── TEMPORAL / SEASONAL axis
  "winter":         ["seasonal"],
  "summer":         ["seasonal"],
  "autumn":         ["seasonal"],
  "morning":        ["seasonal"],
  "sunset":         ["seasonal"],
  "christmas":      ["seasonal", "cultural-festivals"],
  "snowy":          ["seasonal"],
  "snowy landscape":["seasonal"],
  "rainy":          ["seasonal"],
  "seasonal":       ["seasonal"],

  // ── LAYOUT / COMPOSITION (existing gallery vocab)
  "collage":        ["composition"],
  "grid":           ["composition"],
  "infographic":    ["composition", "posters"],
  "poster":         ["posters"],
  "editorial":      ["posters"],
  "documentary":    ["film"],
  "selfie":         ["composition", "portrait"],
  "human portrait": ["portrait"],
  "closeup":        ["composition", "portrait"],
  "mirror selfie":  ["composition", "portrait"],
  "silhouette":     ["composition"],
  "macro":          ["composition"],
  "model":          ["portrait"],
  "informative":    ["posters"],

  // ── SUBJECT / ENTITY (people, scenes, objects)
  "woman":          ["portrait"],
  "man":            ["portrait"],
  "portrait":       ["portrait"],
  "girl":           ["portrait"],
  "couple":         ["relationship", "portrait"],
  "friends":        ["relationship"],
  "fitness":        ["fitness"],
  "athletic":       ["fitness"],
  "fashion":        ["fashion"],
  "high fashion":   ["high-fashion", "fashion"],
  "casual":         ["fashion"],
  "chic":           ["fashion"],
  "edgy":           ["fashion"],
  "minimalist":     ["fashion", "digital-canvas"],
  "sunglasses":     ["fashion"],
  "car":            ["transportation"],
  "food":           ["food"],
  "café":           ["food"],
  "animal":         ["animal"],
  "cat":            ["animal"],
  "fairy":          ["character"],
  "anime":          ["anime"],
  "character":      ["character"],
  "kpop":           ["korea"],
  "japanese":       ["japan"],
  "east asian":     ["culture"],
  "architecture":   ["architecture"],
  "interior":       ["interior"],
  "landscape":      ["travel"],
  "beach":          ["travel"],
  "forest":         ["travel"],
  "ocean":          ["travel"],
  "garden":         ["travel"],
  "nature":         ["travel"],
  "natural":        ["travel"],
  "luxury":         ["high-fashion"],
  "product":        ["product"],

  // ── CONCEPTS / OTHER
  "transformation": ["comparison"],
  "before-after":   ["comparison"],
  "historical":     ["history"],
  "educational":    ["learning"],
};

// ── tier-3 extensions ──────────────────────────────────────────────────────
// Add the canonical style entries from STYLE_AXES into the appropriate
// tier-3 buckets, keyed by tier-1 parent. Preserves existing tier-3 entries.

function buildTier3Extensions(existing) {
  const out = JSON.parse(JSON.stringify(existing));
  for (const axis of STYLE_AXES) {
    const t1 = axis.tier1;
    if (!out[t1]) out[t1] = [];
    for (const entry of axis.entries) {
      if (!out[t1].includes(entry)) out[t1].push(entry);
    }
  }
  return out;
}

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }

function main() {
  const taxonomy = loadJSON(TAXONOMY_PATH);
  const meta = loadJSON(META_PATH).metadata;

  // 1. content_styles top-level
  const galleryCount = {};
  for (const t of meta.tags) galleryCount[t.tag] = t.count;

  const content_styles = {};
  for (const axis of STYLE_AXES) {
    content_styles[axis.id] = {
      label: axis.label,
      description: axis.description,
      tier1_parent: axis.tier1,
      tier2_parent: axis.tier2,
      entries: axis.entries.map((value) => ({
        value,
        gallery_count: galleryCount[value]
          ?? galleryCount[value.replace(/-/g, " ")]
          ?? galleryCount[value.replace(/-/g, "")]
          ?? 0,
      })),
    };
  }

  taxonomy._content_styles_note =
    "Style axis (Round 2B, 2026-05-31). 4 sub-axes: mood, aesthetic, lighting, temporal. Each entry carries gallery_count from lib/generated/nanobanana_prompts_metadata.json — the demand signal from prompt-side usage. Sister to information_types (info-type axis) and template_subjects (subject axis). Per-template style tagging deferred — style is query-side vocabulary; templates that carry style do so via their own topics[] arrays.";
  taxonomy.content_styles = content_styles;

  // 2. tier-3 extensions
  const oldTier3 = taxonomy.tier3 || {};
  const newTier3 = buildTier3Extensions(oldTier3);
  taxonomy.tier3 = newTier3;

  // 3. gallery_tag_to_topics merge (preserves existing where new doesn't override).
  const oldMap = taxonomy.gallery_tag_to_topics || {};
  const merged = { ...oldMap, ...TAG_TARGETS };
  taxonomy.gallery_tag_to_topics = merged;

  fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2) + "\n");

  // Report.
  const allTags = new Set(meta.tags.map((t) => t.tag));
  const mappedTags = new Set(Object.keys(merged));
  const stillUnmapped = [...allTags].filter((t) => !mappedTags.has(t) && !mappedTags.has(t.toLowerCase()));

  console.log(`\n=== content_styles ===`);
  for (const ax of STYLE_AXES) {
    const totalCount = content_styles[ax.id].entries.reduce((a, e) => a + e.gallery_count, 0);
    console.log(`  ${ax.id.padEnd(12)} ${ax.entries.length.toString().padStart(2)} entries, ${totalCount.toString().padStart(5)} total prompt count (tier1=${ax.tier1}, tier2=${ax.tier2})`);
  }

  console.log(`\n=== tier3 size delta ===`);
  for (const k of Object.keys(newTier3)) {
    const before = (oldTier3[k] || []).length;
    const after = newTier3[k].length;
    if (before !== after) console.log(`  tier3.${k.padEnd(12)} ${before} → ${after} (+${after - before})`);
  }

  console.log(`\n=== gallery_tag_to_topics coverage ===`);
  console.log(`  total tags in metadata: ${allTags.size}`);
  console.log(`  total mapped entries:   ${Object.keys(merged).length}`);
  console.log(`  still unmapped:         ${stillUnmapped.length}`);
  if (stillUnmapped.length) {
    console.log(`  unmapped: ${stillUnmapped.slice(0, 30).join(", ")}${stillUnmapped.length > 30 ? " ..." : ""}`);
  }

  console.log(`\nDone. Wrote to ${TAXONOMY_PATH}.`);
}

main();
