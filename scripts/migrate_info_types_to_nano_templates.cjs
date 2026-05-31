#!/usr/bin/env node
// One-time migration: write info-type names into each template's topics[]
// in public/data/nano_templates.json — completes Round 2A by making the
// info-type layer load-bearing for search / topics / recommendations.
//
// Per feedback_taxonomy_vs_template_tagging_separation.md:
//   - per-template tags live in nano_templates.json (source of truth)
//   - taxonomy.json holds vocabulary + auto-derived reverse maps
//
// 13 info-types (fact + analysis collapsed into 'insight'):
//   insight, profile, collection, comparison, timeline, process,
//   information-card, vocabulary, dialogue, quote, map, quiz, story
//
// 7 use *existing* topic vocabulary (Option A from the 5/31 audit):
//   profile     → 'portrait'   (tier2.character.portrait exists)
//   collection  → 'groups'     (tier2.character.groups exists)
//   process     → 'guides'     (tier2.lifestyle.guides exists)
//   timeline    → 'history'    (tier2.learning.history exists — partial)
//   comparison  → 'comparison' (tier2.character.comparison — direct collision, intentional)
//   vocabulary  → 'vocabulary' (tier2.language.vocabulary — direct collision)
//   dialogue    → 'dialogue'   (tier2.language.dialogue — direct collision)
//
// 6 are new tier-2 topics added by add_info_type_topics.cjs:
//   insight, information-card, quote, map, quiz, story
//
// Dry-run: pass --dry-run to compute + print without writing.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TEMPLATES_PATH = path.join(REPO, "public/data/nano_templates.json");
const DRY_RUN = process.argv.includes("--dry-run");

// info-type → topic word actually written into topics[]
const TYPE_TO_TOPIC = {
  insight: "insight",
  profile: "portrait",
  collection: "groups",
  comparison: "comparison",
  timeline: "history",
  process: "guides",
  "information-card": "information-card",
  vocabulary: "vocabulary",
  dialogue: "dialogue",
  quote: "quote",
  map: "map",
  quiz: "quiz",
  story: "story",
};

// Hand-curated assignment from Round 2A. After this run the script can be
// deleted; build_template_information_types.cjs becomes pure auto-derive.
// 'fact' + 'analysis' rows collapsed into 'insight'.
const TEMPLATE_TYPES = {
  "template-battle": ["comparison"],
  "template-sports-battle": ["comparison"],
  "template-mbti-comparison-infographic": ["comparison", "quiz"],
  "template-mbti-contrast": ["comparison", "quiz"],
  "template-historical-figure-vs-infographic": ["comparison"],
  "template-character-comparison": ["comparison"],
  "template-dual-character-comparison-infographic": ["comparison"],
  "template-emotion-vs-emotion-illustration": ["comparison"],
  "template-english-word-difference-infographic": ["comparison", "vocabulary"],
  "template-language-word-comparison-educational-poster": ["comparison", "vocabulary"],
  "template-finance-comparison-infographic": ["comparison"],
  "template-animation-studio-comparison-infographic": ["comparison"],
  "template-east-asian-culture-comparison-infographic": ["comparison"],
  "template-posture-correctness-comparison": ["comparison"],
  "template-then-vs-now-comparison-infographic": ["comparison"],
  "template-generation-comparison-infographic": ["comparison"],
  "template-mbti-stereotype-vs-reality-infographic": ["comparison", "quiz"],
  "template-fashion-before-after-outfit-annotation-card": ["comparison"],
  "template-home-organization-before-after": ["comparison"],
  "template-mbti-group-comparison-infographic": ["comparison", "quiz"],

  "template-9-traits-info-grid": ["collection", "quiz"],
  "template-fandom-character-grid-poster": ["collection", "profile"],
  "template-book-recommendation-grid-poster": ["collection"],
  "template-top10-visual-guide-infographic": ["collection"],
  "template-country-top10-travel-destinations": ["collection"],
  "template-english-top5-phrases": ["collection", "vocabulary"],
  "template-lifestyle-photo-grid": ["collection"],
  "template-vintage-stamp-collection-illustration": ["collection"],
  "template-best-cities-travel-infographic": ["collection"],
  "template-regional-alcoholic-drinks-infographic": ["collection", "information-card"],
  "template-wine-variety-intro-infographic": ["collection", "information-card"],
  "template-varieties-food-poster": ["collection", "information-card"],
  "template-music-style-visual-infographic": ["collection"],
  "template-tool-ai-category": ["collection"],
  "template-celebrity-movie-group-poster": ["collection", "profile"],
  "template-mbti-group-anime-character-poster": ["collection", "profile"],
  "template-group-vocab-category": ["collection", "vocabulary"],
  "template-watercolor-theme-collage-illustration": ["collection"],
  "template-country-souvenirs-watercolor": ["collection"],
  "template-vintage-travel-scrapbook-poster": ["collection"],
  "template-nostalgic-first-item-poster": ["collection"],
  "template-personal-fashion-outfit-style-variations": ["collection", "profile"],
  "template-hairstyle-color-recommendation": ["collection", "comparison"],
  "template-fashion-nail-art-design": ["collection"],
  "template-interior-design-mood-board-generator": ["collection"],
  "template-series-infographic": ["collection"],
  "template-series-travel": ["collection"],
  "template-book-series": ["collection", "profile"],
  "template-regional-names-old-money-style": ["collection", "vocabulary"],
  "template-lunar-new-year-red-envelope-set": ["collection"],
  "template-country-dos-and-donts-infographic": ["collection", "insight"],

  "template-evolution": ["timeline"],
  "template-evolution-timeline-infographic": ["timeline"],
  "template-historical-evolution-timeline-infographic": ["timeline"],
  "template-clothing-evolution-poster": ["timeline"],
  "template-history-timeline-infographic": ["timeline"],
  "template-life-journey-curve-infographic": ["timeline"],
  "template-flowing-journey-infographic": ["timeline"],
  "template-pet-life-journey-infographic": ["timeline"],
  "template-cultural-travel-journey-infographic": ["timeline"],

  "template-3d-region-landmark-map": ["map"],
  "template-whimsical-travel-map": ["map"],
  "template-historical-event-map-illustration": ["map"],
  "template-national-theme-map-infographic": ["map"],
  "template-world-travel-map-illustration": ["map"],
  "template-watercolor-world-map-illustration": ["map"],
  "template-tourist-spot-watercolor-map-infographic": ["map"],
  "template-word-origins-map-infographic": ["map", "vocabulary"],

  "template-recipe": ["process"],
  "template-premium-recipe-card-infographic": ["process"],
  "template-food-recipe-tip-infographic": ["process"],
  "template-anatomy-cut-guide": ["process"],
  "template-beauty-step-by-step-guide": ["process"],
  "template-cartoon-action-visual-guide-infographic": ["process"],
  "template-equipment-muscle-guide": ["process", "information-card"],
  "template-fashion-shape-guide-infographic": ["process", "profile"],
  "template-gardening-how-to-infographic": ["process"],
  "template-hairstyle-guide-infographic": ["process"],
  "template-home-lifestyle-guide-infographic": ["process"],
  "template-houseplant-care-guide-infographic": ["process"],
  "template-nutrition-food-guide-poster": ["process"],
  "template-organ-health-food-guide-infographic": ["process"],
  "template-pet-care-guide": ["process"],
  "template-professional-category-guide-infographic": ["process", "information-card"],
  "template-soft-decoration-design-guide": ["process"],
  "template-sports-technique-guide": ["process"],
  "template-travel-packing-guide-infographic": ["process"],
  "template-watercolor-painting-tutorial-guide": ["process"],
  "template-warmup-routine": ["process"],
  "template-fat-loss-plan": ["process"],
  "template-training-muscle-equipment": ["process"],
  "template-pain-relief-infographic": ["process"],
  "template-vintage-ultimate-guide-infographic": ["process"],
  "template-portrait-retouching-blueprint": ["process", "profile"],

  // 'insight' was fact + analysis
  "template-science-education-infographic": ["insight"],
  "template-space-planet-fact-infographic": ["insight"],
  "template-species-science": ["insight", "information-card"],
  "template-weather-education-infographic": ["insight"],
  "template-weird-cold-knowledge-popular-science-card": ["insight"],
  "template-weird-science-facts-infographic": ["insight"],
  "template-pet-safe-human-food-infographic": ["insight", "information-card"],
  "template-slang-week-recap-infographic": ["insight", "vocabulary"],
  "template-educational-topic-infographic": ["insight"],
  "template-weather": ["insight"],
  "template-solar-term": ["insight", "information-card"],
  "template-what-if-history": ["insight"],
  "template-national-culture-history-infographic": ["insight", "information-card"],
  "template-relationship-advice-infographic": ["insight"],
  "template-self-help-book-visual-summary-infographic": ["insight"],
  "template-self-help-infographic-poster": ["insight"],
  "template-financial-habit-infographic-poster": ["insight"],
  "template-lifestyle-habit-infographic": ["insight"],
  "template-lifestyle-watercolor-infographic": ["insight"],
  "template-hot-event-analysis": ["insight"],
  "template-character-analysis": ["insight", "profile"],
  "template-figure-principles-infographic": ["insight", "profile"],
  "template-historical-figure-educational": ["insight", "profile"],
  "template-manga-artist-infographic-poster": ["insight", "profile"],
  "template-mbti-in-love-infographic": ["insight", "quiz"],
  "template-mbti-relationship-infographic": ["insight", "quiz"],
  "template-zhenhuan-mbti-character-analysis": ["insight", "quiz"],
  "template-ethnic-costume-deconstruction-board": ["insight", "profile"],
  "template-fashion-inspired-gown-design-sheet": ["insight", "profile"],
  "template-educational-career-field-infographic": ["insight", "information-card"],
  "template-self-care-illustration-poster": ["insight"],

  "template-lifestyle-info-card": ["information-card"],
  "template-dessert-color-lab-infographic": ["information-card", "collection"],
  "template-hotspot-card": ["information-card"],
  "template-cultural-relic-retro-infographic": ["information-card"],
  "template-dog-breed-retro-infographic": ["information-card"],
  "template-world-landmark-vintage-info-poster": ["information-card"],
  "template-intangible-heritage": ["information-card"],
  "template-herbal": ["information-card"],
  "template-species": ["information-card", "profile"],
  "template-education": ["information-card"],
  "template-education-card": ["information-card"],
  "template-child-hobby-skill": ["information-card"],

  "template-vocabulary": ["vocabulary"],
  "template-cartoon-english-vocabulary-flashcards": ["vocabulary"],
  "template-children-english-vocab-spelling": ["vocabulary"],
  "template-chinese-character-learning-poster": ["vocabulary"],
  "template-chinese-idiom-learning-card": ["vocabulary"],
  "template-chinese-radical-learning": ["vocabulary"],
  "template-chinese-verb-opposite-infographic": ["vocabulary", "comparison"],
  "template-cuisine-food-vocab-poster": ["vocabulary"],
  "template-daily-essentials-learning-card": ["vocabulary"],
  "template-detailed-vocab-flashcard": ["vocabulary"],
  "template-english-error-correction": ["vocabulary", "insight"],
  "template-english-homograph-educational-poster": ["vocabulary", "comparison"],
  "template-english-phrasal-verb": ["vocabulary"],
  "template-english-vocabulary-upgrade": ["vocabulary"],
  "template-english-grammar-lesson": ["vocabulary", "insight"],
  "template-english-grammar-wordlist-infographic": ["vocabulary"],
  "template-ielts-3-to-9-vocabulary-poster": ["vocabulary"],
  "template-kids-opposite-concept-education": ["vocabulary", "comparison"],
  "template-kids-theme-fill-in-worksheet": ["vocabulary", "quiz"],
  "template-kids-vocabulary-poster": ["vocabulary"],
  "template-multilingual-vocabulary-poster-watercolor": ["vocabulary"],
  "template-room-vocabulary-infographic": ["vocabulary"],
  "template-stick-figure-vocab": ["vocabulary"],
  "template-verb-action-learning-cards": ["vocabulary"],
  "template-word-scene": ["vocabulary"],
  "template-bilingual-object-structure-labeling": ["vocabulary"],
  "template-CVC-english-word-coloring-flower-card": ["vocabulary"],
  "template-phonics-consonant-blend": ["vocabulary"],

  "template-english-dialogue-scene": ["dialogue", "vocabulary"],
  "template-native-english-expressions": ["dialogue", "vocabulary"],

  "template-quote-poster-generator": ["quote"],
  "template-poetry-ink-wash-illustration": ["quote"],

  "template-mbti-animal": ["quiz"],
  "template-mbti-breakingbad": ["quiz", "profile"],
  "template-mbti-generic": ["quiz"],
  "template-mbti-ghibli": ["quiz"],
  "template-mbti-marvel": ["quiz"],
  "template-mbti-naruto": ["quiz"],
  "template-mbti-nba": ["quiz"],
  "template-mbti-siliconvalley": ["quiz"],
  "template-mbti-yellowstone": ["quiz"],
  "template-mbti-personality-compatibility-infographic": ["quiz", "comparison"],
  "template-friends-character-mbti": ["quiz", "profile"],
  "template-chinese-classic-character-mbti": ["quiz", "profile"],
  "template-harry-potter-mbti-infographic": ["quiz", "profile"],
  "template-city-mbti": ["quiz", "profile"],
  "template-princess-pearl-mbti-character-card": ["quiz", "profile"],
  "template-personality-choice-quiz-card": ["quiz"],
  "template-pop-culture-matching-chart": ["quiz", "collection"],

  "template-character": ["profile"],
  "template-cartoon-character-profile-card-kawaii-style": ["profile"],
  "template-custom-character-card": ["profile"],
  "template-historical-figure-profile-infographic": ["profile"],
  "template-artist-biography-infographic": ["profile", "timeline"],
  "template-celebrity-filmography-infographic": ["profile", "collection"],
  "template-detective-conan": ["profile"],
  "template-architecture": ["profile"],
  "template-city-miniature": ["profile"],
  "template-food": ["profile"],
  "template-fruit": ["profile"],
  "template-travel": ["profile"],
  "template-movie-poster": ["profile"],
  "template-media-theme-wallpaper-poster": ["profile"],
  "template-theme-overview-poster": ["profile"],
  "template-book-minimalist": ["profile"],
  "template-constellation-steampunk": ["profile"],
  "template-guofeng-scroll": ["profile", "story"],
  "template-food-product-packaging-design": ["profile"],
  "template-product-poster": ["profile"],
  "template-product-theme-promotional-poster": ["profile"],
  "template-industrial-design-concept-sketch": ["profile"],
  "template-fashion-ecommerce": ["profile"],
  "template-ai-outfit-try-on-poster": ["profile"],
  "template-costume": ["profile", "collection"],
  "template-cultural-festival-poster": ["profile"],

  "template-watercolor-travel-journal-collage": ["story", "collection"],
  "template-personal-journey-wolf-path-illustration": ["story", "timeline"],
};

function main() {
  const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
  const knownIds = new Set(templates.map((t) => t.id));

  // Sanity-check the dict against current templates
  for (const id of Object.keys(TEMPLATE_TYPES)) {
    if (!knownIds.has(id)) {
      console.error("ERROR — assignment references unknown template:", id);
      process.exit(1);
    }
  }

  // Compute the post-migration topics[] for each template
  const projected = [];
  let touched = 0;
  let newTags = 0;
  for (const t of templates) {
    const types = TEMPLATE_TYPES[t.id];
    if (!types) {
      projected.push({ id: t.id, before: t.topics || [], after: t.topics || [], added: [] });
      continue;
    }
    const before = Array.isArray(t.topics) ? [...t.topics] : [];
    const after = [...before];
    const added = [];
    for (const ty of types) {
      const topicWord = TYPE_TO_TOPIC[ty];
      if (!after.includes(topicWord)) {
        after.push(topicWord);
        added.push(topicWord);
        newTags++;
      }
    }
    if (added.length) touched++;
    projected.push({ id: t.id, before, after, added });
  }

  // Sanity report — templates with 5+ topics post-migration
  console.log("=== Templates with 5+ topics post-migration ===");
  console.log("");
  const heavy = projected.filter((p) => p.after.length >= 5).sort((a, b) => b.after.length - a.after.length);
  for (const p of heavy) {
    const newMark = p.added.length ? ` +[${p.added.join(", ")}]` : "";
    console.log(`  [${String(p.after.length).padStart(2)}] ${p.id}`);
    console.log(`        topics: ${p.after.join(", ")}${newMark}`);
  }
  console.log(`\nTotal templates with 5+ topics: ${heavy.length} / ${templates.length}`);
  console.log(`Total new tags to add: ${newTags} across ${touched} templates\n`);

  if (DRY_RUN) {
    console.log("DRY RUN — no file written. Re-run without --dry-run to apply.");
    return;
  }

  // Apply
  for (const t of templates) {
    const types = TEMPLATE_TYPES[t.id];
    if (!types) continue;
    if (!Array.isArray(t.topics)) t.topics = [];
    for (const ty of types) {
      const topicWord = TYPE_TO_TOPIC[ty];
      if (!t.topics.includes(topicWord)) t.topics.push(topicWord);
    }
  }
  fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2) + "\n");
  console.log(`Wrote ${TEMPLATES_PATH}`);
}

main();
