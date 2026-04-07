// scripts/add_use_cases.cjs
// Assigns use_case slugs to nano templates.

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/nano_templates.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const USE_CASE_MAP = {
  // for-marketers: MBTI, educational cards, infographics, trend visuals
  "for-marketers": [
    "template-mbti-generic",
    "template-mbti-siliconvalley",
    "template-mbti-naruto",
    "template-mbti-ghibli",
    "template-education",
    "template-education-card",
    "template-hot-event-analysis",
    "template-hotspot-card",
    "template-series-infographic",
    "template-book-series",
  ],

  // for-parents: kids language learning — vocab, dialogue, spelling
  "for-parents": [
    "template-vocabulary",
    "template-word-scene",
    "template-english-dialogue-scene",
    "template-english-top5-phrases",
    "template-english-error-correction",
    "template-children-english-vocab-spelling",
    "template-child-hobby-skill",
    "template-detailed-vocab-flashcard",
  ],

  // for-esl-learners: dialogue, vocab, error correction
  "for-esl-learners": [
    "template-english-dialogue-scene",
    "template-word-scene",
    "template-vocabulary",
    "template-english-top5-phrases",
    "template-english-error-correction",
    "template-detailed-vocab-flashcard",
  ],

  // for-creators: character cards, viral formats, inspiration
  "for-creators": [
    "template-mbti-generic",
    "template-mbti-naruto",
    "template-mbti-ghibli",
    "template-mbti-siliconvalley",
    "template-character-comparison",
    "template-battle",
    "template-custom-character-card",
    "template-hotspot-card",
    "template-series-infographic",
    "template-education-card",
    "template-book-series",
  ],
};

// Build reverse map: template_id -> use_cases[]
const templateUseCases = {};
for (const [useCase, templateIds] of Object.entries(USE_CASE_MAP)) {
  for (const id of templateIds) {
    if (!templateUseCases[id]) templateUseCases[id] = [];
    templateUseCases[id].push(useCase);
  }
}

let updated = 0;
for (const t of data) {
  const useCases = templateUseCases[t.id];
  if (useCases) {
    t.use_cases = useCases;
    updated++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Updated ${updated} templates with use_cases.`);

// Verify
for (const [useCase, ids] of Object.entries(USE_CASE_MAP)) {
  const found = ids.filter(id => data.find(t => t.id === id));
  const missing = ids.filter(id => !data.find(t => t.id === id));
  console.log(`${useCase}: ${found.length} found${missing.length ? ', MISSING: ' + missing.join(', ') : ''}`);
}
