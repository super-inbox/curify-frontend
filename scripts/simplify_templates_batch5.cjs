#!/usr/bin/env node
/**
 * Simplify template-city-mbti (→ 1 param) and template-word-scene (→ 2 params).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TEMPLATES_PATH = path.resolve(__dirname, "../public/data/nano_templates.json");
const INSPIRATION_PATH = path.resolve(__dirname, "../public/data/nano_inspiration.json");

// ── New prompts ───────────────────────────────────────────────────────────────

const NEW_CITY_MBTI_PROMPT = `（City MBTI Personality Poster Designer）You are a professional city MBTI infographic designer, specializing in creating cute, colorful, kawaii-style city personality posters. The user has specified [{city_name}].

First, reason about {city_name} and determine: the most fitting MBTI type for this city's personality (e.g., ENFP, ISTJ) and a matching MBTI title (e.g., The Campaigner, The Logistician) that captures the city's culture, energy, and character.

Then generate a vertical 3:4 premium city MBTI poster, matching the cartoon, vibrant aesthetic of the reference images. Layout: 1. Header: Large bold red title "{city_name}", Curify watermark at top left, rainbow gradient banner with the determined MBTI type and title. 2. Main Illustration: Kawaii cartoon cityscape of {city_name} with iconic landmarks, cute mascot, local signature food. 3. Description: 2-line text summarizing city's personality, culture and charm. Style: Clean minimalist design, soft off-white background, kawaii cartoon, bright friendly colors, clear typography, vertical 3:4 format, 4K ultra HD, direct image generation. Subject: {city_name} MBTI city personality poster.`;

const NEW_WORD_SCENE_PROMPT = `(English Vocabulary Scene Illustrator) Draw a richly detailed illustration of the scene 【{scene_type}】 for {language_pair} vocabulary learning.

First, reason about {scene_type} and determine: the most fitting character or characters to feature in this scene (e.g., a child, a chef, a family, a well-known fictional character, or a generic person suited to the setting).

Then draw the scene featuring the determined character(s), showing all common objects clearly. Label every object with a consistent 3-line format:
Line 1: English word
Line 2: IPA phonetic transcription
Line 3: Translation in the target language of {language_pair}
Ensure labels are readable, neatly aligned, and placed without covering the main subject. The overall composition should be clear, attractive, and educational. Output directly. Scene: 【{scene_type}】.`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTitleCase(slug) {
  return slug.replace(/\s+\d+$/, "").split(/[-\s]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const LANG_PAIRS = [
  { tag: "english-spanish", pair: "en-es" },
  { tag: "english-korean", pair: "en-ko" },
  { tag: "english-japanese", pair: "en-ja" },
  { tag: "english-french", pair: "en-fr" },
];

// Word scene IDs → scene_type (for character+scene combos that need a lookup)
const WORD_SCENE_LOOKUP = {
  "template-word-scene-child-park": "Park",
  "template-word-scene-zhudi-and-nick-in-zootopia": "Zootopia",
  "template-word-scene-doctor-hospital": "Hospital",
  "template-word-scene-farmer-farm": "Farm",
  "template-word-scene-santa-claus-christmas": "Christmas",
  "template-word-scene-explorer-forest": "Forest",
  "template-word-scene-astronaut-space": "Space Station",
  "template-word-scene-chef-kitchen": "Kitchen",
  "template-word-scene-family-restaurant": "Restaurant",
  "template-word-scene-family-road": "Road Trip",
  "template-word-scene-student-classroom": "Classroom",
  "template-word-scene-student-laboratory": "Laboratory",
  "template-word-scene-student-library": "Library",
  "template-word-scene-family-airport": "Airport",
  "template-word-scene-family-amusement": "Amusement Park",
  "template-word-scene-family-firestation": "Fire Station",
  "template-word-scene-family-hotel": "Hotel",
  "template-word-scene-family-postoffice": "Post Office",
  "template-word-scene-family-waterpark": "Water Park",
  "template-word-scene-shinchan-classroom": "Classroom",
  "template-word-scene-shinchan-hot-pot": "Hot Pot Restaurant",
  "template-word-scene-shinchan-metro": "Metro Station",
  "template-word-scene-shinchan-stadium": "Stadium",
  "template-word-scene-shinchan-swimming-pool": "Swimming Pool",
  "template-word-scene-military-base 1": "Military Base",
  "template-word-scene-military-base 2": "Military Base",
  "template-word-scene-new-year 1": "New Year Celebration",
  "template-word-scene-new-year 2": "New Year Celebration",
  "template-word-scene-temple-fair 1": "Temple Fair",
  "template-word-scene-temple-fair 2": "Temple Fair",
  "template-word-scene-temple-fair 3": "Temple Fair",
  "template-word-scene-student-dinosaur-jungle": "Dinosaur Jungle",
  "template-word-scene-student-robot-factory": "Robot Factory",
  "template-word-scene-student-space-station": "Space Station",
  "template-word-scene-student-underwater-classroom": "Underwater Classroom",
  "template-word-scene-student-wizard-school": "Wizard School",
  "template-word-scene-house-structure-2": "House Structure",
  "template-word-scene-house-structure": "House Structure",
  "template-word-scene-house-cleaning": "House Cleaning",
  // multi-language with character names
  "template-word-scene-english-spanish-la-maestra-the-teacher": "Classroom",
  "template-word-scene-english-spanish-el-cocinero-the-chef": "Kitchen",
  "template-word-scene-english-spanish-la-deportista-the-athlete": "Sports Field",
  "template-word-scene-english-spanish-el-bombero-the-firefighter": "Fire Station",
  "template-word-scene-english-korean-busy-student": "Classroom",
  "template-word-scene-english-korean-k-pop-fan-tourist": "K-Pop Concert",
  "template-word-scene-english-korean-little-dragon": "Fantasy World",
  "template-word-scene-english-korean-robot-chef": "Kitchen",
  "template-word-scene-english-japanese-mother": "Home",
  "template-word-scene-english-japanese-foreign-tourist": "Tokyo Street",
  "template-word-scene-english-japanese-sushi-chef": "Sushi Restaurant",
  "template-word-scene-english-japanese-festival-participant": "Japanese Festival",
};

// Simple scene-only IDs (just strip the prefix and title-case)
const SIMPLE_WORD_SCENES = new Set([
  "template-word-scene-party",
  "template-word-scene-ski-resort",
  "template-word-scene-supermarket",
  "template-word-scene-lantern-festival",
  "template-word-scene-beach",
  "template-word-scene-hospital",
  "template-word-scene-library",
  "template-word-scene-park",
  "template-word-scene-bathroom",
  "template-word-scene-bedroom",
  "template-word-scene-farm",
  "template-word-scene-kitchen",
  "template-word-scene-restaurant",
  "template-word-scene-zoo",
  "template-word-scene-barbershop",
  "template-word-scene-birthday-party",
  "template-word-scene-bookstore",
  "template-word-scene-living-room",
  "template-word-scene-post-office",
  "template-word-scene-airport",
  "template-word-scene-bus-interior",
  "template-word-scene-dental-clinic",
  "template-word-scene-train-station",
  "template-word-scene-amusement-park",
  "template-word-scene-park-spring",
  "template-word-scene-rainy-day",
  "template-word-scene-courier-logistics",
  "template-word-scene-gym",
  "template-word-scene-swimming-pool",
]);

function wordSceneParams(id) {
  // Check lookup first
  if (WORD_SCENE_LOOKUP[id]) {
    // Detect language pair
    let language_pair = "en-zh";
    for (const { tag, pair } of LANG_PAIRS) {
      if (id.includes(tag)) { language_pair = pair; break; }
    }
    return { language_pair, scene_type: WORD_SCENE_LOOKUP[id] };
  }
  if (SIMPLE_WORD_SCENES.has(id)) {
    const slug = id.slice("template-word-scene-".length);
    return { language_pair: "en-zh", scene_type: toTitleCase(slug) };
  }
  // Fallback: detect lang pair and title-case remainder
  let language_pair = "en-zh";
  let slug = id.slice("template-word-scene-".length);
  for (const { tag, pair } of LANG_PAIRS) {
    if (slug.startsWith(tag + "-")) {
      language_pair = pair;
      slug = slug.slice(tag.length + 1);
      break;
    }
  }
  return { language_pair, scene_type: toTitleCase(slug) };
}

// ── Load data ─────────────────────────────────────────────────────────────────
const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
const inspiration = JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"));

let templatesUpdated = 0;
let inspirationUpdated = 0;

// ── Update nano_templates.json ────────────────────────────────────────────────
for (const tpl of templates) {
  if (tpl.id === "template-city-mbti") {
    const params = [
      { name: "city_name", type: "text", label: "City Name", placeholder: ["Bangkok", "Beijing", "Chengdu", "Seoul", "Shanghai", "Tokyo", "Paris"] },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_CITY_MBTI_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-city-mbti");
  }

  if (tpl.id === "template-word-scene") {
    const params = [
      {
        name: "language_pair",
        label: "Language Pair",
        type: "text",
        placeholder: ["en-zh", "en-es", "en-ko", "en-ja"],
      },
      {
        name: "scene_type",
        label: "Scene",
        type: "text",
        placeholder: ["Kitchen", "Hospital", "Classroom", "Airport", "Zoo", "Supermarket"],
      },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_WORD_SCENE_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-word-scene");
  }
}

// ── Update nano_inspiration.json params ───────────────────────────────────────
for (const ex of inspiration) {
  if (ex.template_id === "template-city-mbti") {
    const slug = ex.id.slice("template-city-mbti-".length);
    ex.params = { city_name: toTitleCase(slug) };
    inspirationUpdated++;
  }

  if (ex.template_id === "template-word-scene") {
    ex.params = wordSceneParams(ex.id);
    inspirationUpdated++;
  }
}

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
fs.writeFileSync(INSPIRATION_PATH, JSON.stringify(inspiration, null, 2) + "\n", "utf-8");

console.log(`\nDone. Templates updated: ${templatesUpdated}, inspiration params updated: ${inspirationUpdated}`);
