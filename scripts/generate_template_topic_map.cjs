const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(__dirname, "../public/data/nano_templates.json");
const OUTPUT_JSON_PATH = path.join(__dirname, "../public/data/nano_templates.json");
const OUTPUT_MAP_PATH = path.join(__dirname, "../public/data/template_topic_map.json");
const BACKUP_PATH = path.join(__dirname, "../public/data/nano_templates.backup.json");

/**
 * Template ID -> topic ids (MULTI)
 */
const TEMPLATE_TOPIC_ID_MAP = {
  "template-herbal": ["learning", "science"],
  "template-evolution": ["learning", "science"],
  "template-travel": ["lifestyle", "travel"],
  "template-architecture": ["learning", "architecture"],
  "template-species": ["learning", "science"],

  "template-character": ["character", "film"],
  "template-recipe": ["lifestyle", "food"],
  "template-character-analysis": ["character"],
  "template-weather": ["lifestyle", "science"],

  "template-education": ["learning"],
  "template-hot-event-analysis": ["learning"],
  "template-intangible-heritage": ["learning", "culture"],
  "template-education-card": ["learning"],

  "template-costume": ["learning", "culture", "design"],
  "template-book-series": ["learning"],
  "template-word-scene": ["learning", "language"],

  "template-cultural-relic-retro-infographic": ["learning", "culture"],
  "template-dog-breed-retro-infographic": ["lifestyle"],
  "template-food": ["lifestyle", "food"],
  "template-solar-term": ["learning", "culture"],

  "template-fruit": ["lifestyle", "food", "science"],
  "template-what-if-history": ["learning", "history"],
  "template-character-comparison": ["character"],

  "template-mbti-animal": ["character", "mbti"],
  "template-battle": ["character", "gaming"],
  "template-fashion-ecommerce": ["product", "design"],
  "template-portrait-retouching-blueprint": ["product", "design"],

  "template-mbti-contrast": ["character", "mbti"],
  "template-guofeng-scroll": ["character", "culture"],
  "template-species-science": ["learning", "science"],

  "template-city-miniature": ["lifestyle", "travel"],
  "template-hotspot-card": ["learning", "trending"],
  "template-constellation-steampunk": ["learning", "science", "design"],

  "template-mbti-generic": ["character", "mbti"],
  "template-mbti-marvel": ["character", "mbti", "film"],
  "template-mbti-nba": ["character", "mbti", "sports"],
  "template-mbti-siliconvalley": ["character", "mbti", "career"],

  "template-mbti-breakingbad": ["character", "mbti", "film"],
  "template-sports-battle": ["character", "sports"],
  "template-mbti-naruto": ["character", "mbti", "gaming"],
  "template-mbti-yellowstone": ["character", "mbti", "film"],
  "template-mbti-ghibli": ["character", "mbti", "film"],

  "template-vocabulary": ["learning", "language"],
  "template-series-infographic": ["learning"],
  "template-english-top5-phrases": ["learning", "language"],
  "template-english-error-correction": ["learning", "language"],
  "template-english-dialogue-scene": ["learning", "language"],

  "template-movie-poster": ["lifestyle", "film"],
  "template-series-travel": ["lifestyle", "travel"],

  "template-fat-loss-plan": ["lifestyle", "fitness"],
  "template-child-hobby-skill": ["learning", "lifestyle"]
};

/**
 * topic id -> final nano_templates.json topic field
 */
const TOPIC_ID_TO_TOPIC_FIELD = {
  character: "character",
  learning: "learning",
  lifestyle: "lifestyle",
  product: "product",

  // extended topics
  language: "language",
  science: "science",
  culture: "culture",
  history: "history",
  design: "design",
  nature: "nature",
  travel: "travel",
  food: "food",
  fitness: "fitness",
  film: "film",
  gaming: "gaming",
  trending: "trending",
  mbti: "mbti",
  sports: "sports",
  architecture: "architecture",
  career: "career"
};

const VALID_TOPIC_IDS = new Set(Object.keys(TOPIC_ID_TO_TOPIC_FIELD));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function main() {
  const templates = readJson(INPUT_PATH);

  if (!Array.isArray(templates)) {
    throw new Error("Expected nano_templates.json to be an array.");
  }

  writeJson(BACKUP_PATH, templates);

  const seenIds = new Set();
  const missingMappings = [];
  const duplicateIds = [];

  for (const item of templates) {
    const id = item?.id;
    if (!id) continue;

    if (seenIds.has(id)) {
      duplicateIds.push(id);
    }
    seenIds.add(id);

    const topicIds = TEMPLATE_TOPIC_ID_MAP[id];

    if (!topicIds) {
      missingMappings.push(id);
      continue;
    }

    for (const t of topicIds) {
      if (!VALID_TOPIC_IDS.has(t)) {
        throw new Error(`Invalid topic id "${t}" for template "${id}"`);
      }
    }
  }

  const updatedTemplates = templates.map((item) => {
    const id = item?.id;
    const topicIds = TEMPLATE_TOPIC_ID_MAP[id];

    if (!topicIds) return item;

    const topicFields = topicIds.map((t) => TOPIC_ID_TO_TOPIC_FIELD[t]);

    return {
      ...item,
      topics: topicFields // ✅ multi-topic field
    };
  });

  const templateTopicMap = Object.entries(TEMPLATE_TOPIC_ID_MAP)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, topic_ids]) => ({
      id,
      topic_ids,
      topics: topic_ids.map((t) => TOPIC_ID_TO_TOPIC_FIELD[t])
    }));

  writeJson(OUTPUT_JSON_PATH, updatedTemplates);
  writeJson(OUTPUT_MAP_PATH, templateTopicMap);

  console.log(`Updated: ${OUTPUT_JSON_PATH}`);
  console.log(`Wrote map: ${OUTPUT_MAP_PATH}`);
  console.log(`Backup: ${BACKUP_PATH}`);
  console.log(`Mapped templates: ${templateTopicMap.length}`);
  console.log(`Unmapped templates: ${missingMappings.length}`);
}

main();