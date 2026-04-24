const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../public/data");
const INSPIRATION_PATH = path.join(DATA_DIR, "nano_inspiration.json");
const TEMPLATES_PATH = path.join(DATA_DIR, "nano_templates.json");

// Load both JSON files
const inspirations = JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"));
const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));

// Group inspiration images by template_id
const imagesByTemplateId = {};
for (const insp of inspirations) {
  const tid = insp.template_id;
  if (!tid) continue;
  if (!imagesByTemplateId[tid]) imagesByTemplateId[tid] = [];
  imagesByTemplateId[tid].push(insp.asset?.preview_image_url);
}

// Helper: pick a random element
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Add og_image to each template
let updated = 0;
for (const template of templates) {
  const candidates = imagesByTemplateId[template.id];
  if (candidates && candidates.length > 0) {
    template.og_image = pickRandom(candidates);
    updated++;
  } else {
    console.warn(`No inspiration images found for template: ${template.id}`);
  }
}

// Write back
fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2), "utf-8");

console.log(`Done. Updated ${updated} / ${templates.length} templates with og_image.`);