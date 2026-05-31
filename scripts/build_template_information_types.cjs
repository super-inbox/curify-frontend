#!/usr/bin/env node
// Re-derive the information_types + template_information_types maps in
// lib/taxonomy.json from public/data/nano_templates.json.
//
// Round 2A architecture (refactored 2026-05-31 after migration ran):
//
//   - taxonomy.json holds vocabulary only:
//       information_types = { fact, profile, collection, comparison,
//                             timeline, process, information-card,
//                             vocabulary, dialogue, quote, map, quiz,
//                             story, insight }  with { label, description }
//     (also tier1-4 entries: tier2.learning.insight, tier2.travel.map,
//     tier2.personality.quiz, etc.)
//
//   - per-template tagging lives in nano_templates.json topics[].
//
//   - This script SCANS topics[] against the info-type vocabulary and
//     emits the two reverse-lookup maps. Same pattern as
//     scripts/build_template_subjects.cjs. Memory:
//     feedback_taxonomy_vs_template_tagging_separation.md
//
// 13 info-type vocab values written into templates' topics[] by the
// 2026-05-31 migration (scripts/migrate_info_types_to_nano_templates.cjs).
// Mapping there: profile→portrait, collection→groups, process→guides,
// timeline→history (reusing existing topic names that already meant the
// same thing). Others (insight, comparison, vocabulary, dialogue,
// information-card, quote, map, quiz, story) keep their canonical names.
//
// Re-run after every nano_templates.json change. Idempotent.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TEMPLATES_PATH = path.join(REPO, "public/data/nano_templates.json");
const TAXONOMY_PATH = path.join(REPO, "lib/taxonomy.json");

// Canonical info types (vocabulary only — no per-template assignments).
// Maps from info-type id → { topic-word actually used in topics[], label,
// description }. The topic-word is what auto-derive looks for in
// nano_templates.json. Several info-types share their topic-word with an
// existing tier-2/3 entry — that's intentional (e.g., comparison is
// both an info-type AND a tier2.character.comparison subject).
const INFORMATION_TYPES = [
  { id: "insight",          topicWord: "insight",
    label: "Insight (fact + analysis)",
    description: "Cold-knowledge claims and structured deep-dives — one-line trivia, book summaries, hot-event breakdowns, framework explainers." },
  { id: "profile",          topicWord: "portrait",
    label: "Profile / single-subject",
    description: "One subject's attributes — name + image + key traits. Reuses the existing tier2.character.portrait topic name." },
  { id: "collection",       topicWord: "groups",
    label: "Collection / N-items",
    description: "Multiple instances together (9 fruits, 16 birds, top-10 destinations). Reuses tier2.character.groups." },
  { id: "comparison",       topicWord: "comparison",
    label: "Comparison / A vs B",
    description: "Side-by-side contrast. Direct collision with tier2.character.comparison — same word, both senses." },
  { id: "timeline",         topicWord: "history",
    label: "Timeline / chronology",
    description: "Events along time (history-timelines, evolution arcs, life-journeys). Reuses tier2.learning.history." },
  { id: "process",          topicWord: "guides",
    label: "Process / step-by-step",
    description: "Ordered how-to (recipes, beauty step-by-step, gardening). Reuses tier2.lifestyle.guides." },
  { id: "information-card", topicWord: "information-card",
    label: "Information card / encyclopedia entry",
    description: "Attribute-rich catalog entry (herb, plant, species, landmark, intangible heritage)." },
  { id: "vocabulary",       topicWord: "vocabulary",
    label: "Vocabulary / word + image",
    description: "Word + image learning unit. Direct collision with tier2.language.vocabulary — same word, both senses." },
  { id: "dialogue",         topicWord: "dialogue",
    label: "Dialogue / conversation",
    description: "Conversation bubbles, native expressions, sentence-pair drills." },
  { id: "quote",            topicWord: "quote",
    label: "Quote / one-message poster",
    description: "Name + quote + (optional) portrait. Single-message typography-led poster." },
  { id: "map",              topicWord: "map",
    label: "Map / spatial layout",
    description: "Geographic or spatial layout — landmark map, travel map, historical-event map, word-origins map." },
  { id: "quiz",             topicWord: "quiz",
    label: "Quiz / personality test / matching chart",
    description: "Choice-driven self-test or fandom-mapping (MBTI, personality choice, matching chart, 9-traits)." },
  { id: "story",            topicWord: "story",
    label: "Story / multi-panel narrative",
    description: "Multi-panel narrative — travel-journal, scroll storytelling, life-journey-as-story. Distinct from Timeline." },
];

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }

function main() {
  const templates = loadJSON(TEMPLATES_PATH);
  const taxonomy = loadJSON(TAXONOMY_PATH);

  // Build info-type vocab: topicWord → list of (id, label, description)
  // Multiple info-types may share a topic-word; we still emit per-id maps.
  const byTopicWord = new Map();
  for (const t of INFORMATION_TYPES) {
    if (!byTopicWord.has(t.topicWord)) byTopicWord.set(t.topicWord, []);
    byTopicWord.get(t.topicWord).push(t);
  }

  // Auto-derive: for each template, scan its topics[] for any info-type
  // topic-word and emit (type_id, template_id) pairs.
  const information_types = {};
  for (const t of INFORMATION_TYPES) {
    information_types[t.id] = {
      label: t.label,
      description: t.description,
      topic_word: t.topicWord,
      templates: [],
    };
  }
  const template_information_types = {};

  const sorted = templates.slice().sort((a, b) => (a.id || "").localeCompare(b.id || ""));
  for (const tpl of sorted) {
    if (!tpl.id || !Array.isArray(tpl.topics)) continue;
    const typeIds = new Set();
    for (const word of tpl.topics) {
      const matches = byTopicWord.get(word);
      if (!matches) continue;
      for (const m of matches) typeIds.add(m.id);
    }
    if (typeIds.size === 0) continue;
    const sortedTypes = [...typeIds].sort();
    template_information_types[tpl.id] = sortedTypes;
    for (const tid of sortedTypes) information_types[tid].templates.push(tpl.id);
  }
  for (const t of Object.values(information_types)) t.templates.sort();

  // Write into taxonomy.json.
  taxonomy._information_types_note =
    "Information Type vocabulary — how content is *organized* (Fact/Profile/Collection/Comparison/Timeline/Process/InfoCard/Vocabulary/Dialogue/Quote/Map/Quiz/Story/Insight). 13 canonical types. Sister axis to subject (tier1-4) and style (content_styles). Auto-derived by scripts/build_template_information_types.cjs scanning nano_templates.json topics[] against each type's topic_word. Several types reuse existing topic words by design (profile=portrait, collection=groups, process=guides, timeline=history; comparison/vocabulary/dialogue direct-collide with same-named tier-2 subjects — same word, both senses). Per-template source of truth is nano_templates.json topics[]; this map is a derived index.";
  taxonomy.information_types = information_types;
  taxonomy._template_information_types_note =
    "template_id -> sorted [type_id, ...]. Reverse of information_types. Auto-derived from nano_templates.json topics[].";
  taxonomy.template_information_types = template_information_types;

  fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2) + "\n");

  // Report
  const taggedTemplates = Object.keys(template_information_types).length;
  const totalTemplates = templates.length;
  console.log(`\nAuto-derived ${INFORMATION_TYPES.length} info types covering ${taggedTemplates}/${totalTemplates} templates`);
  console.log(`\nPer-type template counts:`);
  for (const t of INFORMATION_TYPES) {
    console.log(`  ${t.id.padEnd(20)} ${String(information_types[t.id].templates.length).padStart(3)} templates  (topic_word: ${t.topicWord})`);
  }
  console.log(`\nDone. Wrote to ${TAXONOMY_PATH}.`);
}

main();
