#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const SEO_SOURCE = path.join(
  ROOT,
  "public",
  "data",
  "nano_template_seo.json"
);

const SEO_CLEAN_TARGET = path.join(
  ROOT,
  "public",
  "data",
  "nano_template_seo.json"
);

const MESSAGE_PATH = path.join(
  ROOT,
  "messages",
  "zh",
  "nano.json"
);

function readJson(p) {
  if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function getTemplates(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.templates)) return data.templates;
  throw new Error("Cannot find templates array in SEO file");
}

function removeSeoFields(templates) {
  let removedCount = 0;

  for (const tpl of templates) {
    for (const locale of Object.values(tpl.locales || {})) {
      if (!locale) continue;

      if (locale.seo) {
        delete locale.seo.meta_title;
        delete locale.seo.meta_description;
        removedCount++;
      }

      if (locale.content) {
        delete locale.content;
        removedCount++;
      }
    }
  }

  return removedCount;
}

function main() {
  const seoSource = readJson(SEO_SOURCE);
  const seoTemplates = getTemplates(seoSource);

  const messageData = readJson(MESSAGE_PATH);

  let processed = 0;
  let created = 0;
  const skipped = [];

  for (const tpl of seoTemplates) {
    const id = tpl?.id;
    const zh = tpl?.locales?.zh;

    const metaTitle = zh?.seo?.meta_title;
    const sections = zh?.content?.sections;

    if (!id) {
      skipped.push("(missing id)");
      continue;
    }

    if (!metaTitle && !sections) {
      skipped.push(id);
      continue;
    }

    if (!messageData[id]) {
      messageData[id] = {};
      created++;
    }

    if (metaTitle) messageData[id].title = metaTitle;

    if (sections) {
      if (!messageData[id].content) {
        messageData[id].content = {};
      }
      messageData[id].content.sections = sections;
    }

    processed++;
  }

  writeJson(MESSAGE_PATH, messageData);

  // ---------- CLEAN SECOND FILE ----------

  const cleanFile = readJson(SEO_CLEAN_TARGET);
  const cleanTemplates = getTemplates(cleanFile);

  const removedCount = removeSeoFields(cleanTemplates);

  writeJson(SEO_CLEAN_TARGET, cleanFile);

  // ---------- REPORT ----------

  console.log("\n===== Nano Template Sync Report =====");

  console.log(`Total templates: ${seoTemplates.length}`);
  console.log(`Processed templates: ${processed}`);
  console.log(`New entries created: ${created}`);
  console.log(`Skipped templates: ${skipped.length}`);

  if (skipped.length) {
    console.log("\nSkipped template IDs:");
    skipped.forEach((t) => console.log(` - ${t}`));
  }

  console.log(`\nSEO fields removed from nano_template_seo.json: ${removedCount}`);

  console.log("=====================================\n");
}

try {
  main();
} catch (err) {
  console.error("Sync failed:", err.message);
  process.exit(1);
}