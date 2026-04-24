#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const JSON_PATH = path.resolve("public/data/nano_templates.json");

function readJson() {
  return JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
}

function main() {
  const data = readJson();

  const templates = Array.isArray(data)
    ? data
    : Object.values(data);

  const singleLocaleTemplates = [];

  for (const t of templates) {
    const locales = t.locales || {};
    const localeKeys = Object.keys(locales);

    if (localeKeys.length <= 1) {
      singleLocaleTemplates.push({
        id: t.id,
        locales: localeKeys
      });
    }
  }

  console.log(`\n🔍 Found ${singleLocaleTemplates.length} templates with ≤1 locale:\n`);

  singleLocaleTemplates.forEach(t => {
    console.log(`- ${t.id} (${t.locales.join(", ") || "no locales"})`);
  });

  // optional: write to file
  const outPath = JSON_PATH.replace(".json", ".single-locale.json");
  fs.writeFileSync(outPath, JSON.stringify(singleLocaleTemplates, null, 2));

  console.log(`\n✅ Output written to: ${outPath}\n`);
}

main();