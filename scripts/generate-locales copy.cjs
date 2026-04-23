#!/usr/bin/env node

/**
 * Check for duplicate template IDs in nano_templates.json
 *
 * Usage:
 *   node scripts/check_nano_template_ids.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const FILE_PATH = path.join(ROOT, "public", "data", "nano_templates.json");

function main() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`[check] File not found: ${FILE_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(FILE_PATH, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    console.error("[check] Expected JSON to be an array.");
    process.exit(1);
  }

  const idCount = new Map();

  for (const item of data) {
    const id = item?.id;

    if (!id) {
      console.warn("[check] Found item with missing id:", item);
      continue;
    }

    idCount.set(id, (idCount.get(id) || 0) + 1);
  }

  const duplicates = [];

  for (const [id, count] of idCount.entries()) {
    if (count > 1) {
      duplicates.push({ id, count });
    }
  }

  console.log(`[check] Total templates: ${data.length}`);
  console.log(`[check] Unique IDs: ${idCount.size}`);

  if (duplicates.length === 0) {
    console.log("[check] ✅ No duplicate template IDs found.");
    return;
  }

  console.log(`\n[check] ❌ Found ${duplicates.length} duplicate IDs:\n`);

  duplicates.forEach(({ id, count }) => {
    console.log(`- ${id} (count: ${count})`);
  });

  process.exit(2);
}

main();