#!/usr/bin/env node

const fs = require("fs");

const file = process.argv[2] || "public/data/nano_inspiration.json";
const dryRun = process.argv.includes("--dry-run");
const noBackup = process.argv.includes("--no-backup");

const data = JSON.parse(fs.readFileSync(file, "utf8"));

function normalizeExampleId(id) {
  if (typeof id !== "string") return id;
  return id
    .replace(/-zh-/g, "-")
    .replace(/-en-/g, "-");
}

let changedCount = 0;
let skippedWithLegacy = 0;
let idChangedCount = 0;

const migrated = data.map((item) => {
  // only process records without legacy_id
  if (item.legacy_id) {
    skippedWithLegacy += 1;
    return item;
  }

  const next = { ...item };
  const oldId = item.id;
  const newId = normalizeExampleId(oldId);

  next.legacy_id = oldId;

  if (!next.legacy_template_id && next.template_id) {
    next.legacy_template_id = next.template_id;
  }

  if (newId !== oldId) {
    next.id = newId;
    idChangedCount += 1;
  }

  changedCount += 1;
  return next;
});

console.log("===== RESULT =====");
console.log("Total items:", data.length);
console.log("Changed items (no legacy_id before):", changedCount);
console.log("Skipped items (already had legacy_id):", skippedWithLegacy);
console.log("IDs rewritten:", idChangedCount);

if (!dryRun) {
  const backup = `${file}.bak`;
  if (!noBackup && !fs.existsSync(backup)) {
    fs.copyFileSync(file, backup);
    console.log("Backup created:", backup);
  }

  fs.writeFileSync(file, JSON.stringify(migrated, null, 2) + "\n", "utf8");
  console.log("File updated:", file);
} else {
  console.log("Dry run only (no file written)");
}