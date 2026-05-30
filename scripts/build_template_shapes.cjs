#!/usr/bin/env node
// Canonical derivation of the content_shapes layer.
//
// Concept (docs/search-and-content.md, 2026-05-30 refresh):
//   The taxonomy has (subject) and (template). The missing middle is
//   *shape* — the format-pattern that's portable across subjects:
//     1v1 battle, team poster, then-vs-now, grid collection, timeline,
//     map, recipe card, how-to guide, mbti portrait, etc.
//
//   shape × subject is the right primitive for spotting content gaps
//   (e.g. world-cup has 1v1 + team but is missing nostalgia / evolution).
//
// What this writes into lib/taxonomy.json:
//   - content_shapes:  shape_id -> { label, description, templates: [...] }
//   - template_shapes: template_id -> [shape_id, ...]   (reverse map)
//
// Re-run after every nano_templates.json change or when a new shape is
// introduced. Prints a shape × tier-2 subject coverage matrix.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TEMPLATES_PATH = path.join(REPO, "public/data/nano_templates.json");
const TAXONOMY_PATH = path.join(REPO, "lib/taxonomy.json");

const SHAPES = [
  { id: "vs-1v1-battle", label: "1v1 / VS comparison",
    description: "Head-to-head matchup between two distinct subjects (sports rivalries, character battles, MBTI vs MBTI, word-vs-word)." },
  { id: "then-vs-now", label: "Then vs now / before-after",
    description: "Temporal comparison of the same subject across two states (generation gap, decade-vs-decade, stereotype-vs-reality, before-after transformation)." },
  { id: "grid-collection", label: "Grid / collection",
    description: "N-cell visual grid surfacing many items at once (top-10, MBTI 16-cell, fandom grids, variety posters, photo grids, collection illustrations)." },
  { id: "team-group-poster", label: "Team / group poster",
    description: "Ensemble portrait of multiple subjects on a single composition (World Cup team, sitcom cast, MBTI group, vocab-category group)." },
  { id: "timeline-evolution", label: "Timeline / evolution",
    description: "Chronological progression along a path or timeline (history-timeline, evolution arc, life-journey, clothing evolution)." },
  { id: "nostalgia-retro", label: "Nostalgia / retro aesthetic",
    description: "Vintage, retro, or nostalgic styling regardless of subject (first-item poster, retro infographic, vintage stamp, old-money style)." },
  { id: "map-spatial", label: "Map / spatial layout",
    description: "Geographic or spatial layout — landmarks, regional themes, travel maps, historical event maps, word-origins maps." },
  { id: "recipe-card", label: "Recipe card",
    description: "Food recipe with ingredients + steps in a card format." },
  { id: "how-to-guide", label: "How-to / step-by-step guide",
    description: "Instructional guide with explicit steps or annotated diagram (beauty step-by-step, gardening how-to, sports technique, watercolor tutorial)." },
  { id: "educational-explainer", label: "Educational / explainer infographic",
    description: "Single-topic explainer that teaches what-is or how-works (science facts, weather education, weird knowledge, financial habit, lifestyle infographic, self-help summary)." },
  { id: "mbti-portrait", label: "MBTI personality portrait",
    description: "MBTI 16-personality framework applied to a fandom or domain (single MBTI, group MBTI, MBTI in love, character-as-MBTI)." },
  { id: "vocabulary-flashcard", label: "Vocabulary / language flashcard",
    description: "Word + image learning card across any language (English/Chinese/multilingual vocab, idiom card, phrasal verbs, kids vocab, phonics)." },
  { id: "character-profile", label: "Character / figure profile",
    description: "Single-subject character or historical-figure card with traits, biography, or analysis." },
  { id: "collage-scrapbook", label: "Collage / scrapbook",
    description: "Mixed-media composition (travel journal collage, ethnic-costume deconstruction board, watercolor theme collage)." },
  { id: "lookbook-outfit", label: "Lookbook / outfit / styling",
    description: "Fashion outfit, hairstyle, or makeover styling display (try-on, gown design sheet, nail art, ethnic costume, portrait retouching)." },
  { id: "packaging-design", label: "Packaging / product design",
    description: "Product packaging, promotional poster, industrial-design sketch, mood board, ecommerce-style product visual." },
  { id: "celebration-festival", label: "Celebration / festival poster",
    description: "Event- or holiday-themed visual (cultural festival, lunar new year red envelope, self-care illustration)." },
  { id: "watercolor-illustration", label: "Watercolor / ink-wash aesthetic",
    description: "Watercolor, ink-wash, or guofeng stylistic shape — applied across subjects (watercolor map, ink-wash poetry, watercolor vocab)." },
  { id: "quote-typography-poster", label: "Quote / typography poster",
    description: "Typography-driven single-message poster (quote poster, old-money name styling)." },
  { id: "hero-thematic-poster", label: "Hero / thematic poster",
    description: "Single artistic poster anchored on a theme, IP, or wallpaper (movie poster, media-theme wallpaper, theme-overview, book series)." },
];

// Manual shape → templates assignment. Audited 2026-05-30 against the 215
// templates in public/data/nano_templates.json. Each template can appear in
// multiple shapes when it genuinely spans both.
const SHAPE_TEMPLATES = {
  "vs-1v1-battle": [
    "template-battle",
    "template-sports-battle",
    "template-mbti-comparison-infographic",
    "template-mbti-contrast",
    "template-historical-figure-vs-infographic",
    "template-character-comparison",
    "template-dual-character-comparison-infographic",
    "template-emotion-vs-emotion-illustration",
    "template-english-word-difference-infographic",
    "template-language-word-comparison-educational-poster",
    "template-finance-comparison-infographic",
    "template-animation-studio-comparison-infographic",
    "template-east-asian-culture-comparison-infographic",
    "template-posture-correctness-comparison",
  ],
  "then-vs-now": [
    "template-then-vs-now-comparison-infographic",
    "template-generation-comparison-infographic",
    "template-mbti-stereotype-vs-reality-infographic",
    "template-fashion-before-after-outfit-annotation-card",
    "template-home-organization-before-after",
  ],
  "grid-collection": [
    "template-9-traits-info-grid",
    "template-fandom-character-grid-poster",
    "template-book-recommendation-grid-poster",
    "template-pop-culture-matching-chart",
    "template-top10-visual-guide-infographic",
    "template-country-top10-travel-destinations",
    "template-english-top5-phrases",
    "template-lifestyle-photo-grid",
    "template-vintage-stamp-collection-illustration",
    "template-best-cities-travel-infographic",
    "template-regional-alcoholic-drinks-infographic",
    "template-wine-variety-intro-infographic",
    "template-varieties-food-poster",
    "template-music-style-visual-infographic",
    "template-tool-ai-category",
  ],
  "team-group-poster": [
    "template-celebrity-movie-group-poster",
    "template-mbti-group-anime-character-poster",
    "template-mbti-group-comparison-infographic",
    "template-group-vocab-category",
  ],
  "timeline-evolution": [
    "template-evolution",
    "template-evolution-timeline-infographic",
    "template-historical-evolution-timeline-infographic",
    "template-clothing-evolution-poster",
    "template-history-timeline-infographic",
    "template-life-journey-curve-infographic",
    "template-flowing-journey-infographic",
    "template-pet-life-journey-infographic",
    "template-cultural-travel-journey-infographic",
    "template-personal-journey-wolf-path-illustration",
  ],
  "nostalgia-retro": [
    "template-nostalgic-first-item-poster",
    "template-vintage-ultimate-guide-infographic",
    "template-vintage-travel-scrapbook-poster",
    "template-vintage-stamp-collection-illustration",
    "template-cultural-relic-retro-infographic",
    "template-dog-breed-retro-infographic",
    "template-world-landmark-vintage-info-poster",
    "template-regional-names-old-money-style",
  ],
  "map-spatial": [
    "template-3d-region-landmark-map",
    "template-whimsical-travel-map",
    "template-historical-event-map-illustration",
    "template-national-theme-map-infographic",
    "template-world-travel-map-illustration",
    "template-watercolor-world-map-illustration",
    "template-tourist-spot-watercolor-map-infographic",
    "template-word-origins-map-infographic",
  ],
  "recipe-card": [
    "template-recipe",
    "template-premium-recipe-card-infographic",
    "template-food-recipe-tip-infographic",
  ],
  "how-to-guide": [
    "template-anatomy-cut-guide",
    "template-beauty-step-by-step-guide",
    "template-cartoon-action-visual-guide-infographic",
    "template-equipment-muscle-guide",
    "template-fashion-shape-guide-infographic",
    "template-gardening-how-to-infographic",
    "template-hairstyle-guide-infographic",
    "template-home-lifestyle-guide-infographic",
    "template-houseplant-care-guide-infographic",
    "template-nutrition-food-guide-poster",
    "template-organ-health-food-guide-infographic",
    "template-pet-care-guide",
    "template-professional-category-guide-infographic",
    "template-soft-decoration-design-guide",
    "template-sports-technique-guide",
    "template-travel-packing-guide-infographic",
    "template-watercolor-painting-tutorial-guide",
    "template-warmup-routine",
    "template-fat-loss-plan",
    "template-training-muscle-equipment",
  ],
  "educational-explainer": [
    "template-educational-career-field-infographic",
    "template-educational-topic-infographic",
    "template-figure-principles-infographic",
    "template-science-education-infographic",
    "template-space-planet-fact-infographic",
    "template-species-science",
    "template-weather-education-infographic",
    "template-weird-cold-knowledge-popular-science-card",
    "template-weird-science-facts-infographic",
    "template-what-if-history",
    "template-national-culture-history-infographic",
    "template-relationship-advice-infographic",
    "template-english-grammar-lesson",
    "template-english-grammar-wordlist-infographic",
    "template-pain-relief-infographic",
    "template-pet-safe-human-food-infographic",
    "template-historical-figure-educational",
    "template-slang-week-recap-infographic",
    "template-self-help-book-visual-summary-infographic",
    "template-self-help-infographic-poster",
    "template-financial-habit-infographic-poster",
    "template-lifestyle-habit-infographic",
    "template-lifestyle-watercolor-infographic",
    "template-lifestyle-info-card",
    "template-country-dos-and-donts-infographic",
    "template-dessert-color-lab-infographic",
    "template-hot-event-analysis",
    "template-hotspot-card",
  ],
  "mbti-portrait": [
    "template-mbti-animal",
    "template-mbti-breakingbad",
    "template-mbti-generic",
    "template-mbti-ghibli",
    "template-mbti-marvel",
    "template-mbti-naruto",
    "template-mbti-nba",
    "template-mbti-siliconvalley",
    "template-mbti-yellowstone",
    "template-mbti-in-love-infographic",
    "template-mbti-personality-compatibility-infographic",
    "template-mbti-relationship-infographic",
    "template-mbti-comparison-infographic",
    "template-mbti-contrast",
    "template-mbti-stereotype-vs-reality-infographic",
    "template-mbti-group-anime-character-poster",
    "template-mbti-group-comparison-infographic",
    "template-friends-character-mbti",
    "template-chinese-classic-character-mbti",
    "template-harry-potter-mbti-infographic",
    "template-zhenhuan-mbti-character-analysis",
    "template-city-mbti",
    "template-princess-pearl-mbti-character-card",
    "template-personality-choice-quiz-card",
    "template-pop-culture-matching-chart",
  ],
  "vocabulary-flashcard": [
    "template-vocabulary",
    "template-cartoon-english-vocabulary-flashcards",
    "template-children-english-vocab-spelling",
    "template-chinese-character-learning-poster",
    "template-chinese-idiom-learning-card",
    "template-chinese-radical-learning",
    "template-chinese-verb-opposite-infographic",
    "template-cuisine-food-vocab-poster",
    "template-daily-essentials-learning-card",
    "template-detailed-vocab-flashcard",
    "template-english-dialogue-scene",
    "template-english-error-correction",
    "template-english-homograph-educational-poster",
    "template-english-phrasal-verb",
    "template-english-vocabulary-upgrade",
    "template-ielts-3-to-9-vocabulary-poster",
    "template-kids-opposite-concept-education",
    "template-kids-theme-fill-in-worksheet",
    "template-kids-vocabulary-poster",
    "template-multilingual-vocabulary-poster-watercolor",
    "template-native-english-expressions",
    "template-room-vocabulary-infographic",
    "template-stick-figure-vocab",
    "template-verb-action-learning-cards",
    "template-word-scene",
    "template-bilingual-object-structure-labeling",
    "template-CVC-english-word-coloring-flower-card",
    "template-phonics-consonant-blend",
    "template-education-card",
    "template-child-hobby-skill",
  ],
  "character-profile": [
    "template-character",
    "template-character-analysis",
    "template-cartoon-character-profile-card-kawaii-style",
    "template-custom-character-card",
    "template-historical-figure-profile-infographic",
    "template-artist-biography-infographic",
    "template-manga-artist-infographic-poster",
    "template-celebrity-filmography-infographic",
    "template-detective-conan",
  ],
  "collage-scrapbook": [
    "template-watercolor-theme-collage-illustration",
    "template-watercolor-travel-journal-collage",
    "template-country-souvenirs-watercolor",
    "template-vintage-travel-scrapbook-poster",
    "template-ethnic-costume-deconstruction-board",
    "template-lifestyle-photo-grid",
  ],
  "lookbook-outfit": [
    "template-fashion-ecommerce",
    "template-fashion-inspired-gown-design-sheet",
    "template-personal-fashion-outfit-style-variations",
    "template-ai-outfit-try-on-poster",
    "template-hairstyle-color-recommendation",
    "template-fashion-nail-art-design",
    "template-costume",
    "template-fashion-before-after-outfit-annotation-card",
    "template-clothing-evolution-poster",
    "template-ethnic-costume-deconstruction-board",
    "template-portrait-retouching-blueprint",
  ],
  "packaging-design": [
    "template-food-product-packaging-design",
    "template-product-poster",
    "template-product-theme-promotional-poster",
    "template-industrial-design-concept-sketch",
    "template-interior-design-mood-board-generator",
    "template-fashion-ecommerce",
  ],
  "celebration-festival": [
    "template-cultural-festival-poster",
    "template-lunar-new-year-red-envelope-set",
    "template-self-care-illustration-poster",
  ],
  "watercolor-illustration": [
    "template-poetry-ink-wash-illustration",
    "template-guofeng-scroll",
    "template-watercolor-theme-collage-illustration",
    "template-watercolor-travel-journal-collage",
    "template-country-souvenirs-watercolor",
    "template-multilingual-vocabulary-poster-watercolor",
    "template-lifestyle-watercolor-infographic",
    "template-watercolor-world-map-illustration",
    "template-tourist-spot-watercolor-map-infographic",
    "template-watercolor-painting-tutorial-guide",
  ],
  "quote-typography-poster": [
    "template-quote-poster-generator",
  ],
  "hero-thematic-poster": [
    "template-movie-poster",
    "template-media-theme-wallpaper-poster",
    "template-theme-overview-poster",
    "template-book-minimalist",
    "template-book-series",
    "template-series-infographic",
    "template-series-travel",
    "template-intangible-heritage",
    "template-constellation-steampunk",
  ],
};

// Subjects (tier-2 level) we want in the gap-discovery matrix. Sourced from
// the existing tier2 lists in taxonomy.json — these are the buckets we
// actively make content under.
const MATRIX_SUBJECTS = [
  "anime", "celebrity", "character", "history",
  "sports", "mbti", "fashion", "food", "travel",
  "learning", "language", "science", "lifestyle",
  "product", "comparison",
];

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }

function main() {
  const templates = loadJSON(TEMPLATES_PATH);
  const taxonomy = loadJSON(TAXONOMY_PATH);
  const templateSubjects = taxonomy.template_subjects || {};
  const knownIds = new Set(templates.map((t) => t.id));

  // Validate every referenced template id exists.
  const errors = [];
  for (const [shape, ids] of Object.entries(SHAPE_TEMPLATES)) {
    for (const id of ids) {
      if (!knownIds.has(id)) {
        errors.push(`shape '${shape}' references unknown template '${id}'`);
      }
    }
  }
  if (errors.length) {
    console.error("FAIL: unknown template ids referenced:");
    for (const e of errors) console.error("  -", e);
    process.exit(1);
  }

  // Build content_shapes (forward) and template_shapes (reverse).
  const content_shapes = {};
  for (const shape of SHAPES) {
    content_shapes[shape.id] = {
      label: shape.label,
      description: shape.description,
      templates: (SHAPE_TEMPLATES[shape.id] || []).slice().sort(),
    };
  }

  const template_shapes = {};
  for (const [shapeId, ids] of Object.entries(SHAPE_TEMPLATES)) {
    for (const id of ids) {
      if (!template_shapes[id]) template_shapes[id] = [];
      if (!template_shapes[id].includes(shapeId)) template_shapes[id].push(shapeId);
    }
  }
  for (const id of Object.keys(template_shapes)) template_shapes[id].sort();

  // Write into taxonomy.json (preserve insertion order + add notes).
  taxonomy._content_shapes_note =
    "shape_id -> { label, description, templates: [...] }. The 'shape' is the format-pattern (1v1 battle, grid, map, etc.) portable across subjects. Hand-curated by scripts/build_template_shapes.cjs as of 2026-05-30. Re-derive after any nano_templates.json change or shape catalog update.";
  taxonomy.content_shapes = content_shapes;
  taxonomy._template_shapes_note =
    "template_id -> array of shape_ids this template implements. Reverse of content_shapes. Consumed by: content-gap discovery (shape × subject matrix), per-shape landing pages, Reddit demand router, search-generation bridge Phase 3 accept conditions.";
  taxonomy.template_shapes = template_shapes;

  fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2) + "\n");

  // Reporting: counts, unshaped templates, shape × subject matrix.
  const totalTemplates = templates.length;
  const shapedTemplates = Object.keys(template_shapes).length;
  const unshapedTemplates = templates
    .map((t) => t.id)
    .filter((id) => !template_shapes[id])
    .sort();

  console.log(`\nWrote ${SHAPES.length} shapes covering ${shapedTemplates}/${totalTemplates} templates`);
  console.log(`Unshaped templates (${unshapedTemplates.length}): pure aesthetic single-image / outside shape taxonomy`);
  for (const id of unshapedTemplates) console.log(`  - ${id}`);

  console.log(`\nPer-shape template counts:`);
  for (const shape of SHAPES) {
    const n = content_shapes[shape.id].templates.length;
    console.log(`  ${shape.id.padEnd(28)} ${String(n).padStart(3)} templates`);
  }

  // Coverage matrix: shape × subject. Cells with 0 are gap-candidates.
  console.log(`\nCoverage matrix (shape × tier-2 subject = template count):`);
  const headerCells = ["shape".padEnd(28), ...MATRIX_SUBJECTS.map((s) => s.slice(0, 6).padStart(7))];
  console.log("  " + headerCells.join(""));
  const dashes = ["-".repeat(28), ...MATRIX_SUBJECTS.map(() => "-".repeat(7))];
  console.log("  " + dashes.join(""));
  for (const shape of SHAPES) {
    const row = [shape.id.padEnd(28)];
    for (const subj of MATRIX_SUBJECTS) {
      let count = 0;
      for (const tid of content_shapes[shape.id].templates) {
        const subjects = templateSubjects[tid] || [];
        if (subjects.includes(subj)) count++;
      }
      row.push(String(count || ".").padStart(7));
    }
    console.log("  " + row.join(""));
  }

  console.log(`\nDone. Wrote to ${TAXONOMY_PATH}.`);
}

main();
