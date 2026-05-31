#!/usr/bin/env node
// Canonical derivation of the information_type layer — Round 2A of the
// taxonomy refactor per docs/search-and-content.md (2026-05-31).
//
// Three-layer taxonomy (raw/taxonomy_brainstorm.txt):
//   1. Topic           — what content is *about* (Japan, dogs, MBTI, ...)
//   2. Information Type — how info is *organized*    ← THIS LAYER
//   3. Visual Layout   — how it is rendered (deferred to Round 2C)
//
// The keystone insight: Topic and Layout grow unbounded, but Information
// Type is bounded (~14 categories) and is the connective tissue between
// search intent and generation. "Give me a [info_type] of [topic]" is a
// query the matcher should always be able to answer.
//
// This refactors yesterday's content_shapes layer (which mixed info type
// + visual layout + style). Style descriptors that lived under shapes
// (nostalgia-retro, watercolor-illustration) move OUT — they belong to
// the Style axis shipped in Round 2B. content_shapes stays in
// taxonomy.json as a back-compat alias for ~2 weeks then gets removed.
//
// Writes to lib/taxonomy.json:
//   - information_types:        type_id -> { label, description, templates: [...] }
//   - template_information_types: template_id -> [type_id, ...]  (reverse)

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TEMPLATES_PATH = path.join(REPO, "public/data/nano_templates.json");
const TAXONOMY_PATH = path.join(REPO, "lib/taxonomy.json");

// The 14 canonical Information Types. Vocabulary from raw/taxonomy_brainstorm.txt
// (collaborator's 13) + quote (separated from analysis).
const INFORMATION_TYPES = [
  { id: "fact",             label: "Fact / cold knowledge",
    description: "One-line cold-knowledge claim + image. Low cognitive load, high visual impact, cross-domain (animal facts, history facts, science facts, weird trivia)." },
  { id: "profile",          label: "Profile / single-subject",
    description: "One subject's attributes laid out — name, image, key traits. Works for people, characters, cities, products, animals, IPs." },
  { id: "collection",       label: "Collection / N-items",
    description: "Multiple instances shown together as a unit (9 fruits, 16 birds, top-10 destinations, fandom-grid, photo-grid, varieties poster)." },
  { id: "comparison",       label: "Comparison / A vs B",
    description: "Side-by-side contrast between two entities (1v1 battle, then-vs-now, before-after, word vs word, culture vs culture)." },
  { id: "timeline",         label: "Timeline / chronology",
    description: "Events arranged along time (history, evolution, life journey, IP-arc, decades-of-X)." },
  { id: "analysis",         label: "Analysis / structured deep dive",
    description: "Multi-axis structured viewpoint (book summary, self-help framework, hot-event analysis, character analysis, MBTI relationship). Heavier than fact." },
  { id: "process",          label: "Process / step-by-step",
    description: "Ordered how-to (recipe, beauty step-by-step, gardening guide, packing guide, watercolor tutorial, warmup routine, fat-loss plan)." },
  { id: "information-card", label: "Information card / encyclopedia entry",
    description: "Attribute-rich catalog entry — name + image + structured attributes (herb, plant, animal species, periodic-table-style entry, country/city dossier, intangible heritage piece)." },
  { id: "vocabulary",       label: "Vocabulary / word + image",
    description: "Word + image learning unit across any language (English/Chinese/multilingual vocab, idiom card, phrasal verbs, kids vocab, phonics, opposite-concept)." },
  { id: "dialogue",         label: "Dialogue / conversation",
    description: "Conversation bubbles, native expressions, sentence-pair drills. Distinct from vocab because the unit is a turn, not a word." },
  { id: "quote",            label: "Quote / one-message poster",
    description: "Name + quote + (optional) portrait. Single-message typography-led poster (literal quotes, poetry, slogan)." },
  { id: "map",              label: "Map / spatial layout",
    description: "Geographic or spatial layout — landmark map, travel map, historical-event map, word-origins map." },
  { id: "quiz",             label: "Quiz / personality test / matching chart",
    description: "Choice-driven / framework-driven self-test or fandom-mapping (MBTI applied to any IP, personality choice quiz, 16-cell matching chart, 9-traits)." },
  { id: "story",            label: "Story / multi-panel narrative",
    description: "Multi-panel narrative across cells (travel-journal, scroll storytelling, life-journey-as-story). Distinct from Timeline — Story is causal/narrative, Timeline is chronological." },
];

// Hand-curated template → info type(s) assignment. Audited 2026-05-31 against
// the 215 templates. Each template lists its PRIMARY type first, optional
// SECONDARY second. Single-type is the common case; secondary only when the
// template genuinely binds two types as equal partners.
//
// Style-shape templates from yesterday's content_shapes (nostalgia-retro,
// watercolor-illustration) are NOT special-cased here — they get classified
// by what info they carry, not by their visual style. The style axis lives
// in Round 2B's content_styles map.
const TEMPLATE_TYPES = {
  // Comparison
  "template-battle":                                              ["comparison"],
  "template-sports-battle":                                       ["comparison"],
  "template-mbti-comparison-infographic":                         ["comparison", "quiz"],
  "template-mbti-contrast":                                       ["comparison", "quiz"],
  "template-historical-figure-vs-infographic":                    ["comparison"],
  "template-character-comparison":                                ["comparison"],
  "template-dual-character-comparison-infographic":               ["comparison"],
  "template-emotion-vs-emotion-illustration":                     ["comparison"],
  "template-english-word-difference-infographic":                 ["comparison", "vocabulary"],
  "template-language-word-comparison-educational-poster":         ["comparison", "vocabulary"],
  "template-finance-comparison-infographic":                      ["comparison"],
  "template-animation-studio-comparison-infographic":             ["comparison"],
  "template-east-asian-culture-comparison-infographic":           ["comparison"],
  "template-posture-correctness-comparison":                      ["comparison"],
  "template-then-vs-now-comparison-infographic":                  ["comparison"],
  "template-generation-comparison-infographic":                   ["comparison"],
  "template-mbti-stereotype-vs-reality-infographic":              ["comparison", "quiz"],
  "template-fashion-before-after-outfit-annotation-card":         ["comparison"],
  "template-home-organization-before-after":                      ["comparison"],
  "template-mbti-group-comparison-infographic":                   ["comparison", "quiz"],

  // Collection
  "template-9-traits-info-grid":                                  ["collection", "quiz"],
  "template-fandom-character-grid-poster":                        ["collection", "profile"],
  "template-book-recommendation-grid-poster":                     ["collection"],
  "template-top10-visual-guide-infographic":                      ["collection"],
  "template-country-top10-travel-destinations":                   ["collection"],
  "template-english-top5-phrases":                                ["collection", "vocabulary"],
  "template-lifestyle-photo-grid":                                ["collection"],
  "template-vintage-stamp-collection-illustration":               ["collection"],
  "template-best-cities-travel-infographic":                      ["collection"],
  "template-regional-alcoholic-drinks-infographic":               ["collection", "information-card"],
  "template-wine-variety-intro-infographic":                      ["collection", "information-card"],
  "template-varieties-food-poster":                               ["collection", "information-card"],
  "template-music-style-visual-infographic":                      ["collection"],
  "template-tool-ai-category":                                    ["collection"],
  "template-celebrity-movie-group-poster":                        ["collection", "profile"],
  "template-mbti-group-anime-character-poster":                   ["collection", "profile"],
  "template-group-vocab-category":                                ["collection", "vocabulary"],
  "template-watercolor-theme-collage-illustration":               ["collection"],
  "template-country-souvenirs-watercolor":                        ["collection"],
  "template-vintage-travel-scrapbook-poster":                     ["collection"],
  "template-nostalgic-first-item-poster":                         ["collection"],
  "template-personal-fashion-outfit-style-variations":            ["collection", "profile"],
  "template-hairstyle-color-recommendation":                      ["collection", "comparison"],
  "template-fashion-nail-art-design":                             ["collection"],
  "template-interior-design-mood-board-generator":                ["collection"],
  "template-series-infographic":                                  ["collection"],
  "template-series-travel":                                       ["collection"],
  "template-book-series":                                         ["collection", "profile"],
  "template-regional-names-old-money-style":                      ["collection", "vocabulary"],
  "template-lunar-new-year-red-envelope-set":                     ["collection"],
  "template-country-dos-and-donts-infographic":                   ["collection", "fact"],

  // Timeline
  "template-evolution":                                           ["timeline"],
  "template-evolution-timeline-infographic":                      ["timeline"],
  "template-historical-evolution-timeline-infographic":           ["timeline"],
  "template-clothing-evolution-poster":                           ["timeline"],
  "template-history-timeline-infographic":                        ["timeline"],
  "template-life-journey-curve-infographic":                      ["timeline"],
  "template-flowing-journey-infographic":                         ["timeline"],
  "template-pet-life-journey-infographic":                        ["timeline"],
  "template-cultural-travel-journey-infographic":                 ["timeline"],

  // Map
  "template-3d-region-landmark-map":                              ["map"],
  "template-whimsical-travel-map":                                ["map"],
  "template-historical-event-map-illustration":                   ["map"],
  "template-national-theme-map-infographic":                      ["map"],
  "template-world-travel-map-illustration":                       ["map"],
  "template-watercolor-world-map-illustration":                   ["map"],
  "template-tourist-spot-watercolor-map-infographic":             ["map"],
  "template-word-origins-map-infographic":                        ["map", "vocabulary"],

  // Process
  "template-recipe":                                              ["process"],
  "template-premium-recipe-card-infographic":                     ["process"],
  "template-food-recipe-tip-infographic":                         ["process"],
  "template-anatomy-cut-guide":                                   ["process"],
  "template-beauty-step-by-step-guide":                           ["process"],
  "template-cartoon-action-visual-guide-infographic":             ["process"],
  "template-equipment-muscle-guide":                              ["process", "information-card"],
  "template-fashion-shape-guide-infographic":                     ["process", "profile"],
  "template-gardening-how-to-infographic":                        ["process"],
  "template-hairstyle-guide-infographic":                         ["process"],
  "template-home-lifestyle-guide-infographic":                    ["process"],
  "template-houseplant-care-guide-infographic":                   ["process"],
  "template-nutrition-food-guide-poster":                         ["process"],
  "template-organ-health-food-guide-infographic":                 ["process"],
  "template-pet-care-guide":                                      ["process"],
  "template-professional-category-guide-infographic":             ["process", "information-card"],
  "template-soft-decoration-design-guide":                        ["process"],
  "template-sports-technique-guide":                              ["process"],
  "template-travel-packing-guide-infographic":                    ["process"],
  "template-watercolor-painting-tutorial-guide":                  ["process"],
  "template-warmup-routine":                                      ["process"],
  "template-fat-loss-plan":                                       ["process"],
  "template-training-muscle-equipment":                           ["process"],
  "template-pain-relief-infographic":                             ["process"],
  "template-vintage-ultimate-guide-infographic":                  ["process"],
  "template-portrait-retouching-blueprint":                       ["process", "profile"],

  // Fact
  "template-science-education-infographic":                       ["fact"],
  "template-space-planet-fact-infographic":                       ["fact"],
  "template-species-science":                                     ["fact", "information-card"],
  "template-weather-education-infographic":                       ["fact"],
  "template-weird-cold-knowledge-popular-science-card":           ["fact"],
  "template-weird-science-facts-infographic":                     ["fact"],
  "template-pet-safe-human-food-infographic":                     ["fact", "information-card"],
  "template-slang-week-recap-infographic":                        ["fact", "vocabulary"],
  "template-educational-topic-infographic":                       ["fact"],
  "template-weather":                                             ["fact"],
  "template-solar-term":                                          ["fact", "information-card"],

  // Analysis
  "template-what-if-history":                                     ["analysis"],
  "template-national-culture-history-infographic":                ["analysis", "information-card"],
  "template-relationship-advice-infographic":                     ["analysis"],
  "template-self-help-book-visual-summary-infographic":           ["analysis"],
  "template-self-help-infographic-poster":                        ["analysis"],
  "template-financial-habit-infographic-poster":                  ["analysis"],
  "template-lifestyle-habit-infographic":                         ["analysis"],
  "template-lifestyle-watercolor-infographic":                    ["analysis"],
  "template-hot-event-analysis":                                  ["analysis"],
  "template-character-analysis":                                  ["analysis", "profile"],
  "template-figure-principles-infographic":                       ["analysis", "profile"],
  "template-historical-figure-educational":                       ["analysis", "profile"],
  "template-manga-artist-infographic-poster":                     ["analysis", "profile"],
  "template-mbti-in-love-infographic":                            ["analysis", "quiz"],
  "template-mbti-relationship-infographic":                       ["analysis", "quiz"],
  "template-zhenhuan-mbti-character-analysis":                    ["analysis", "quiz"],
  "template-ethnic-costume-deconstruction-board":                 ["analysis", "profile"],
  "template-fashion-inspired-gown-design-sheet":                  ["analysis", "profile"],
  "template-educational-career-field-infographic":                ["analysis", "information-card"],
  "template-self-care-illustration-poster":                       ["analysis"],

  // Information Card
  "template-lifestyle-info-card":                                 ["information-card"],
  "template-dessert-color-lab-infographic":                       ["information-card", "collection"],
  "template-hotspot-card":                                        ["information-card"],
  "template-cultural-relic-retro-infographic":                    ["information-card"],
  "template-dog-breed-retro-infographic":                         ["information-card"],
  "template-world-landmark-vintage-info-poster":                  ["information-card"],
  "template-intangible-heritage":                                 ["information-card"],
  "template-herbal":                                              ["information-card"],
  "template-species":                                             ["information-card", "profile"],
  "template-education":                                           ["information-card"],
  "template-education-card":                                      ["information-card"],
  "template-child-hobby-skill":                                   ["information-card"],

  // Vocabulary
  "template-vocabulary":                                          ["vocabulary"],
  "template-cartoon-english-vocabulary-flashcards":               ["vocabulary"],
  "template-children-english-vocab-spelling":                     ["vocabulary"],
  "template-chinese-character-learning-poster":                   ["vocabulary"],
  "template-chinese-idiom-learning-card":                         ["vocabulary"],
  "template-chinese-radical-learning":                            ["vocabulary"],
  "template-chinese-verb-opposite-infographic":                   ["vocabulary", "comparison"],
  "template-cuisine-food-vocab-poster":                           ["vocabulary"],
  "template-daily-essentials-learning-card":                      ["vocabulary"],
  "template-detailed-vocab-flashcard":                            ["vocabulary"],
  "template-english-error-correction":                            ["vocabulary", "analysis"],
  "template-english-homograph-educational-poster":                ["vocabulary", "comparison"],
  "template-english-phrasal-verb":                                ["vocabulary"],
  "template-english-vocabulary-upgrade":                          ["vocabulary"],
  "template-english-grammar-lesson":                              ["vocabulary", "analysis"],
  "template-english-grammar-wordlist-infographic":                ["vocabulary"],
  "template-ielts-3-to-9-vocabulary-poster":                      ["vocabulary"],
  "template-kids-opposite-concept-education":                     ["vocabulary", "comparison"],
  "template-kids-theme-fill-in-worksheet":                        ["vocabulary", "quiz"],
  "template-kids-vocabulary-poster":                              ["vocabulary"],
  "template-multilingual-vocabulary-poster-watercolor":           ["vocabulary"],
  "template-room-vocabulary-infographic":                         ["vocabulary"],
  "template-stick-figure-vocab":                                  ["vocabulary"],
  "template-verb-action-learning-cards":                          ["vocabulary"],
  "template-word-scene":                                          ["vocabulary"],
  "template-bilingual-object-structure-labeling":                 ["vocabulary"],
  "template-CVC-english-word-coloring-flower-card":               ["vocabulary"],
  "template-phonics-consonant-blend":                             ["vocabulary"],

  // Dialogue
  "template-english-dialogue-scene":                              ["dialogue", "vocabulary"],
  "template-native-english-expressions":                          ["dialogue", "vocabulary"],

  // Quote
  "template-quote-poster-generator":                              ["quote"],
  "template-poetry-ink-wash-illustration":                        ["quote"],

  // Map (none beyond above)

  // Quiz
  "template-mbti-animal":                                         ["quiz"],
  "template-mbti-breakingbad":                                    ["quiz", "profile"],
  "template-mbti-generic":                                        ["quiz"],
  "template-mbti-ghibli":                                         ["quiz"],
  "template-mbti-marvel":                                         ["quiz"],
  "template-mbti-naruto":                                         ["quiz"],
  "template-mbti-nba":                                            ["quiz"],
  "template-mbti-siliconvalley":                                  ["quiz"],
  "template-mbti-yellowstone":                                    ["quiz"],
  "template-mbti-personality-compatibility-infographic":          ["quiz", "comparison"],
  "template-friends-character-mbti":                              ["quiz", "profile"],
  "template-chinese-classic-character-mbti":                      ["quiz", "profile"],
  "template-harry-potter-mbti-infographic":                       ["quiz", "profile"],
  "template-city-mbti":                                           ["quiz", "profile"],
  "template-princess-pearl-mbti-character-card":                  ["quiz", "profile"],
  "template-personality-choice-quiz-card":                        ["quiz"],
  "template-pop-culture-matching-chart":                          ["quiz", "collection"],

  // Profile (and product-as-profile)
  "template-character":                                           ["profile"],
  "template-cartoon-character-profile-card-kawaii-style":         ["profile"],
  "template-custom-character-card":                               ["profile"],
  "template-historical-figure-profile-infographic":               ["profile"],
  "template-artist-biography-infographic":                        ["profile", "timeline"],
  "template-celebrity-filmography-infographic":                   ["profile", "collection"],
  "template-detective-conan":                                     ["profile"],
  "template-architecture":                                        ["profile"],
  "template-city-miniature":                                      ["profile"],
  "template-food":                                                ["profile"],
  "template-fruit":                                               ["profile"],
  "template-travel":                                              ["profile"],
  "template-movie-poster":                                        ["profile"],
  "template-media-theme-wallpaper-poster":                        ["profile"],
  "template-theme-overview-poster":                               ["profile"],
  "template-book-minimalist":                                     ["profile"],
  "template-constellation-steampunk":                             ["profile"],
  "template-guofeng-scroll":                                      ["profile", "story"],
  "template-food-product-packaging-design":                       ["profile"],
  "template-product-poster":                                      ["profile"],
  "template-product-theme-promotional-poster":                    ["profile"],
  "template-industrial-design-concept-sketch":                    ["profile"],
  "template-fashion-ecommerce":                                   ["profile"],
  "template-ai-outfit-try-on-poster":                             ["profile"],
  "template-costume":                                             ["profile", "collection"],
  "template-cultural-festival-poster":                            ["profile"],

  // Story
  "template-watercolor-travel-journal-collage":                   ["story", "collection"],
  "template-personal-journey-wolf-path-illustration":             ["story", "timeline"],

  // Aesthetic-only (no info type) — only template-food-photo-doodle-sticker-overlay
  // is a pure style overlay with no info payload. Left unmapped intentionally.
};

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }

function main() {
  const templates = loadJSON(TEMPLATES_PATH);
  const taxonomy = loadJSON(TAXONOMY_PATH);
  const templateSubjects = taxonomy.template_subjects || {};
  const knownIds = new Set(templates.map((t) => t.id));
  const knownTypes = new Set(INFORMATION_TYPES.map((t) => t.id));

  // Validate every assignment references a known template + known type.
  const errors = [];
  for (const [tid, types] of Object.entries(TEMPLATE_TYPES)) {
    if (!knownIds.has(tid)) errors.push(`unknown template '${tid}'`);
    for (const ty of types) {
      if (!knownTypes.has(ty)) errors.push(`template '${tid}' references unknown type '${ty}'`);
    }
  }
  if (errors.length) {
    console.error("FAIL — bad references:");
    for (const e of errors) console.error("  -", e);
    process.exit(1);
  }

  // Build forward (type -> templates) + reverse (template -> types).
  const information_types = {};
  for (const t of INFORMATION_TYPES) {
    information_types[t.id] = { label: t.label, description: t.description, templates: [] };
  }
  for (const [tid, types] of Object.entries(TEMPLATE_TYPES)) {
    for (const ty of types) information_types[ty].templates.push(tid);
  }
  for (const ty of Object.keys(information_types)) information_types[ty].templates.sort();

  const template_information_types = {};
  for (const [tid, types] of Object.entries(TEMPLATE_TYPES)) {
    template_information_types[tid] = types.slice();
  }

  // Write into taxonomy.json.
  taxonomy._information_types_note =
    "type_id -> { label, description, templates: [...] }. The Information Type layer — how content is *organized* (Fact, Profile, Collection, ...). Bounded ~14 categories — the connective tissue between search intent and generation. Sister to (subject) tier1-4 and (style) content_styles. Built by scripts/build_template_information_types.cjs as of 2026-05-31 per the three-layer model in raw/taxonomy_brainstorm.txt.";
  taxonomy.information_types = information_types;
  taxonomy._template_information_types_note =
    "template_id -> ordered array of info types. Primary type first, optional secondary types follow. Reverse of information_types. Consumed by: search-generation bridge Phase 3 (matches 'give me a [info_type] of [topic]' queries), per-info-type landing pages, content gap matrix v2 (info_type × subject).";
  taxonomy.template_information_types = template_information_types;

  fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2) + "\n");

  // Report.
  const totalTemplates = templates.length;
  const taggedTemplates = Object.keys(template_information_types).length;
  const untagged = templates.map((t) => t.id).filter((id) => !template_information_types[id]).sort();

  console.log(`\nWrote ${INFORMATION_TYPES.length} info types covering ${taggedTemplates}/${totalTemplates} templates`);
  if (untagged.length) {
    console.log(`Untagged (${untagged.length}) — pure aesthetic with no info payload:`);
    for (const id of untagged) console.log(`  - ${id}`);
  }

  console.log(`\nPer-type template counts (primary + secondary combined):`);
  for (const t of INFORMATION_TYPES) {
    console.log(`  ${t.id.padEnd(20)} ${String(information_types[t.id].templates.length).padStart(3)} templates`);
  }

  // Coverage matrix: info_type × tier-2 subject.
  const SUBJECTS = [
    "anime", "celebrity", "character", "history",
    "sports", "mbti", "fashion", "food", "travel",
    "learning", "language", "science", "lifestyle",
    "product", "comparison",
  ];
  console.log(`\nCoverage matrix (info_type × tier-2 subject):`);
  console.log("  " + "info type".padEnd(20) + SUBJECTS.map((s) => s.slice(0, 6).padStart(7)).join(""));
  console.log("  " + "-".repeat(20) + "-".repeat(SUBJECTS.length * 7));
  for (const t of INFORMATION_TYPES) {
    const row = [t.id.padEnd(20)];
    for (const sub of SUBJECTS) {
      let count = 0;
      for (const tid of information_types[t.id].templates) {
        const subs = templateSubjects[tid] || [];
        if (subs.includes(sub)) count++;
      }
      row.push(String(count || ".").padStart(7));
    }
    console.log("  " + row.join(""));
  }

  console.log(`\nDone. Wrote to ${TAXONOMY_PATH}.`);
}

main();
