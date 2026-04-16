#!/usr/bin/env node
/**
 * Simplify English/vocabulary templates to minimal params + reasoning prompts.
 * Updates nano_templates.json and nano_inspiration.json (params field).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TEMPLATES_PATH = path.resolve(__dirname, "../public/data/nano_templates.json");
const INSPIRATION_PATH = path.resolve(__dirname, "../public/data/nano_inspiration.json");

// ── New prompts ───────────────────────────────────────────────────────────────

const NEW_TOP5_PHRASES_PROMPT = `(Language Top 5 Phrases Card Designer) You are a professional language learning card designer specializing in creating clean and cute bilingual phrase list posters. The language pair is {language_pair} (format: source-target). Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 "Top 5 Ways to [topic]" phrase card, with cute cartoon, child-friendly style.

First, reason about the topic "{topic_name}" in the context of {language_pair} language learning and determine: the topic title in both the source language (English) and the target language, and 5 natural, commonly used phrases for this topic — each with the source language phrase and its target language translation.

Then create the card. Layout: 1. Top title: bold title "Top 5 Ways to [topic in English] / [topic in target language]" with soft rounded border, clear readable text. 2. Item list: 5 colorful rounded items (light blue, light pink, light yellow, light green, light purple), each containing: left: number (1./2./3./4./5.); middle: large source language phrase + target language translation below; right: cute cartoon illustration matching the phrase meaning. 3. Overall style: clean rounded UI, soft pastel colors, cute cartoon characters, clear typography, Curify watermark top-left. Vertical 3:4 format, 4K ultra HD, output directly. Topic: [{topic_name}].`;

const NEW_DIALOGUE_SCENE_PROMPT = `(Language Dialogue Scene Card Designer) You are a professional language dialogue scene card designer specializing in creating clean and cute bilingual life-scene learning posters. The language pair is {language_pair} (format: source-target). Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 dialogue scene card, with cute cartoon, child-friendly style.

First, reason about the scene "{topic_name}" in the context of {language_pair} language learning and determine: the scene title in both the source language and the target language, two speaker names or roles that fit the scene, and 4 natural dialogue exchanges — each with the source language line and its target language translation.

Then create the card. Layout: 1. Top title: bold title "[scene in English] / [scene in target language]" with soft rounded border and theme decorations. 2. Center illustration: a complete cartoon scene of the dialogue setting (restaurant, park, store, school, etc.) with characters, Q-version cute style, bright warm colors. 3. Dialogue area: 4 dialogue bubbles (alternating colors per speaker), each with: speaker label + source language dialogue + target language translation, different background colors per speaker, clear layout. 4. Overall style: clean rounded UI, soft pastel colors, cute cartoon illustrations, clear typography, Curify watermark top-left. Vertical 3:4 format, 4K ultra HD, output directly. Topic: [{topic_name}].`;

const NEW_ERROR_CORRECTION_PROMPT = `(Language Error Correction Card Designer) You are a professional language error correction card designer specializing in creating clean and cute bilingual right-vs-wrong comparison learning posters. The language pair is {language_pair} (format: source-target). Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 error correction card, with cute cartoon, child-friendly style.

First, reason about the grammar/usage topic "{topic_name}" in the context of {language_pair} language learning and determine: the topic title in both the source language and the target language, and 2 wrong-vs-correct sentence pairs that illustrate a common mistake learners make in this area — each pair with the incorrect sentence and the correct sentence.

Then create the card. Layout: 1. Top title: bold title "[topic in English] / [topic in target language]" with soft rounded border. 2. Content: 2 sets of wrong-vs-correct comparison units, each split into two columns: left (light pink): red ❌ + wrong sentence + target language gloss + confused cartoon; right (light green): green ✅ + correct sentence + target language gloss + happy cartoon. Dashed divider between sets. 3. Overall style: clean rounded UI, soft pastel colors, cute cartoon illustrations, clear typography, Curify watermark top-left. Vertical 3:4 format, 4K ultra HD, output directly. Topic: [{topic_name}].`;

const NEW_VOCAB_FLASHCARD_PROMPT = `（Chinese-English Detailed Vocabulary Flashcard Designer）You are a professional Chinese-English bilingual vocabulary flashcard designer, specializing in creating clean, modern, minimalist educational posters. Based on the user-specified [{chinese_word}], generate a horizontal 16:9 premium detailed vocabulary card, matching the flat illustration, warm minimalist aesthetic of the reference images.

First, reason about {chinese_word} and determine: its pinyin romanization, English translation, part of speech (noun/verb/adjective/etc.), and a natural example sentence in both Chinese and English with its pinyin.

Then create the card. Card Layout: 1. Top Left: Pinyin (light blue, large font), Chinese character "{chinese_word}" (bold red, large font), yellow rounded label with part of speech + English translation. 2. Right: Cute, clear flat illustration of the word's meaning. 3. Bottom: "eg:" label, example sentence in pinyin (light blue), example sentence in Chinese (red), example sentence in English (light blue). Overall Style: Clean minimalist design, warm beige background with soft pink/orange circular decorations, flat vector illustration, clear typography, Curify watermark at top left, horizontal 16:9 format, 4K ultra HD, direct image generation. Subject: {chinese_word} detailed vocabulary card.`;

const NEW_VOCABULARY_PROMPT = `(Language Vocabulary Card Designer) You are a professional bilingual vocabulary card designer specializing in creating clean and cute language learning posters for {language_pair}. Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 themed {language_pair} vocabulary card. The style should resemble fresh, cute, and child-friendly cartoon illustrations.

First, reason about the topic "{topic_name}" in the context of {language_pair} vocabulary learning and determine: the topic name translated into the target language, and 8 vocabulary items relevant to this topic — each with the source language word, target language translation, and pronunciation guide (pinyin if Chinese, romanization if other).

Then create the card. Layout: 1. Top: Title "[topic_name] | [topic in target language]" with playful typography and a soft background matching the theme. 2. Grid layout: 8 vocabulary cards arranged in a 4×2 or 2×4 grid. Each card includes: Left: a cute colored cartoon illustration; Right: source language word, target language translation, and pronunciation guide. 3. Overall style: rounded corners, pastel colors, friendly illustrations, clear readable text, high contrast, no extra elements, Curify watermark on top-left. Vertical 3:4 format, 4K ultra HD.`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function toTitleCase(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const LANG_PAIRS = [
  { tag: "english-spanish", pair: "en-es" },
  { tag: "english-korean", pair: "en-ko" },
  { tag: "english-japanese", pair: "en-ja" },
  { tag: "english-french", pair: "en-fr" },
  { tag: "english-german", pair: "en-de" },
];

function extractLangPairAndTopic(id, templatePrefix) {
  let slug = id.slice(templatePrefix.length + 1); // strip template id + dash
  let language_pair = "en-zh";
  for (const { tag, pair } of LANG_PAIRS) {
    if (slug.startsWith(tag + "-")) {
      language_pair = pair;
      slug = slug.slice(tag.length + 1);
      break;
    }
  }
  const topic_name = toTitleCase(slug);
  return { language_pair, topic_name };
}

// ── Vocab flashcard lookup ────────────────────────────────────────────────────
const VOCAB_WORD_MAP = {
  "template-detailed-vocab-flashcard-apple": "苹果",
  "template-detailed-vocab-flashcard-book": "书",
  "template-detailed-vocab-flashcard-dog": "狗",
  "template-detailed-vocab-flashcard-high-speed-rail": "高铁",
  "template-detailed-vocab-flashcard-school-timetable": "课程表",
};

// ── Load data ─────────────────────────────────────────────────────────────────
const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
const inspiration = JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"));

let templatesUpdated = 0;
let inspirationUpdated = 0;

// ── Update nano_templates.json ────────────────────────────────────────────────
const TEMPLATE_UPDATES = {
  "template-english-top5-phrases": {
    prompt: NEW_TOP5_PHRASES_PROMPT,
    params: [
      {
        name: "language_pair",
        label: "Language Pair",
        type: "text",
        placeholder: ["en-zh", "en-es", "en-ko", "en-ja"],
      },
      {
        name: "topic_name",
        label: "Topic",
        type: "text",
        placeholder: ["Compliments", "Greetings", "Apologize", "Say Goodbye", "Ask for Help"],
      },
    ],
  },
  "template-english-dialogue-scene": {
    prompt: NEW_DIALOGUE_SCENE_PROMPT,
    params: [
      {
        name: "language_pair",
        label: "Language Pair",
        type: "text",
        placeholder: ["en-zh", "en-es", "en-ko", "en-ja"],
      },
      {
        name: "topic_name",
        label: "Scene Topic",
        type: "text",
        placeholder: ["Restaurant", "Shopping", "Airport", "At the Library", "At the Hospital"],
      },
    ],
  },
  "template-english-error-correction": {
    prompt: NEW_ERROR_CORRECTION_PROMPT,
    params: [
      {
        name: "language_pair",
        label: "Language Pair",
        type: "text",
        placeholder: ["en-zh", "en-es", "en-ko", "en-ja"],
      },
      {
        name: "topic_name",
        label: "Grammar/Usage Topic",
        type: "text",
        placeholder: ["Common Mistakes", "Preposition Mistakes", "Question Mistakes", "Tense Mistakes"],
      },
    ],
  },
  "template-detailed-vocab-flashcard": {
    prompt: NEW_VOCAB_FLASHCARD_PROMPT,
    params: [
      {
        name: "chinese_word",
        label: "Chinese Word",
        type: "text",
        placeholder: ["苹果", "书", "狗", "高铁", "课程表"],
      },
    ],
  },
  "template-vocabulary": {
    prompt: NEW_VOCABULARY_PROMPT,
    params: [
      {
        name: "language_pair",
        label: "Language Pair",
        type: "text",
        placeholder: ["en-zh", "en-es", "en-ko", "en-ja"],
      },
      {
        name: "topic_name",
        label: "Vocabulary Topic",
        type: "text",
        placeholder: ["Animals", "Coffee Drinks", "Weather", "Space", "Desserts"],
      },
    ],
  },
};

for (const tpl of templates) {
  const update = TEMPLATE_UPDATES[tpl.id];
  if (!update) continue;
  for (const locale of Object.keys(tpl.locales)) {
    tpl.locales[locale].base_prompt = update.prompt;
    tpl.locales[locale].parameters = update.params;
  }
  templatesUpdated++;
  console.log("Updated " + tpl.id);
}

// ── Update nano_inspiration.json params ──────────────────────────────────────
const TOPIC_PREFIXES = {
  "template-english-top5-phrases": "template-english-top5-phrases",
  "template-english-dialogue-scene": "template-english-dialogue-scene",
  "template-english-error-correction": "template-english-error-correction",
  "template-vocabulary": "template-vocabulary",
};

for (const ex of inspiration) {
  if (TOPIC_PREFIXES[ex.template_id]) {
    const { language_pair, topic_name } = extractLangPairAndTopic(ex.id, TOPIC_PREFIXES[ex.template_id]);
    ex.params = { language_pair, topic_name };
    inspirationUpdated++;
  }

  if (ex.template_id === "template-detailed-vocab-flashcard") {
    const word = VOCAB_WORD_MAP[ex.id];
    if (word) {
      ex.params = { chinese_word: word };
      inspirationUpdated++;
    } else {
      console.warn("Unknown vocab flashcard ID:", ex.id);
    }
  }
}

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
fs.writeFileSync(INSPIRATION_PATH, JSON.stringify(inspiration, null, 2) + "\n", "utf-8");

console.log(`\nDone. Templates updated: ${templatesUpdated}, inspiration params updated: ${inspirationUpdated}`);
