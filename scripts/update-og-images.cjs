/**
 * update-og-images.cjs
 *
 * Purpose:
 * Automatically populate `og_image` for EN locales in nano_template_seo.json
 * using one inspiration image from nano_inspiration.json.
 *
 * Selection rule:
 *   preview_image_url > image_url
 *   first image found per template
 *
 * Files expected:
 *   public/data/nano_template_seo.json
 *   public/data/nano_inspiration.json
 *
 * -----------------------------
 * HOW TO RUN
 * -----------------------------
 *
 * From project root:
 *
 *   node scripts/update-og-images.cjs
 *
 * After running:
 *
 *   - nano_template_seo.json will be updated
 *   - only `locales.en.seo.og_image` fields are modified
 *
 * Recommended:
 *   Commit changes after verifying diff.
 *
 */

const fs = require("fs");
const path = require("path");

const seoPath = path.join(
  process.cwd(),
  "public",
  "data",
  "nano_template_seo.json"
);

const inspPath = path.join(
  process.cwd(),
  "public",
  "data",
  "nano_inspiration.json"
);

if (!fs.existsSync(seoPath)) {
  console.error("❌ nano_template_seo.json not found");
  process.exit(1);
}

if (!fs.existsSync(inspPath)) {
  console.error("❌ nano_inspiration.json not found");
  process.exit(1);
}

const seoJson = JSON.parse(fs.readFileSync(seoPath, "utf8"));
const inspJson = JSON.parse(fs.readFileSync(inspPath, "utf8"));

const templatePreviewMap = new Map();

/**
 * Build template -> preview image mapping
 */
for (const item of inspJson) {
  const templateId = item.template_id;

  if (!templateId) continue;
  if (templatePreviewMap.has(templateId)) continue;

  const preview =
    item?.asset?.preview_image_url ||
    item?.asset?.image_url;

  if (!preview) continue;

  templatePreviewMap.set(templateId, preview);
}

let updated = 0;

/**
 * Update EN locale og_image
 */
for (const tpl of seoJson.templates || []) {
  const templateId = tpl.id;

  if (!tpl.locales) continue;
  if (!tpl.locales.en) continue;

  const preview = templatePreviewMap.get(templateId);

  if (!preview) continue;

  if (!tpl.locales.en.seo) {
    tpl.locales.en.seo = {};
  }

  tpl.locales.en.seo.og_image = preview;

  updated++;
}

/**
 * Save updated file
 */
fs.writeFileSync(
  seoPath,
  JSON.stringify(seoJson, null, 2)
);

console.log(`✅ Updated og_image for ${updated} templates`);
console.log("Done.");