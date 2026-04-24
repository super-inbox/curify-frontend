/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const templatesPath = path.join(__dirname, "../public/data/nano_templates.json");
const mappingPath = path.join(__dirname, "../public/data/template_mapping.json");

const templates = JSON.parse(fs.readFileSync(templatesPath, "utf8"));
const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));

const updated = templates.map((tpl) => {
  const vertical = mapping[tpl.id];
  return {
    ...tpl,
    vertical: vertical || null,
  };
});

fs.writeFileSync(templatesPath, JSON.stringify(updated, null, 2) + "\n", "utf8");

console.log(`Updated ${updated.length} templates with vertical field.`);
const missing = updated.filter((tpl) => !tpl.vertical).map((tpl) => tpl.id);

if (missing.length > 0) {
  console.log("\nTemplates missing mapping:");
  for (const id of missing) {
    console.log(`- ${id}`);
  }
}