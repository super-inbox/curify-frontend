#!/usr/bin/env node
// Re-derive the `template_subjects` map in lib/taxonomy.json from
// public/data/nano_templates.json.
//
// For each template, scan its `topics` array and keep only entries
// that appear at ANY tier (tier1 ∪ tier2 ∪ tier3) of the taxonomy.
// The resulting map is the canonical "which subjects this template
// serves" lookup, consumed by:
//   - the future search→generation bridge (docs/search-generation-bridge.md)
//   - the auto-tag pipeline (narrows the candidate set for gpt-4o-mini)
//   - any content-gap analyzer that needs to enumerate templates per subject
//
// Run after every nano_templates.json change (new templates, removed
// templates, or topics-array edits). Idempotent — re-running with no
// upstream change is a no-op.
//
// Usage:
//   node scripts/build_template_subjects.cjs

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TAX_PATH = path.join(ROOT, "lib/taxonomy.json");
const TPL_PATH = path.join(ROOT, "public/data/nano_templates.json");

const taxonomy = JSON.parse(fs.readFileSync(TAX_PATH, "utf-8"));
const templates = JSON.parse(fs.readFileSync(TPL_PATH, "utf-8"));

// Build inclusive subject set across tier1 ∪ all tier2 values ∪ all tier3 values
const allSubjects = new Set();
for (const t1 of taxonomy.tier1 ?? []) allSubjects.add(t1);
for (const list of Object.values(taxonomy.tier2 ?? {})) for (const v of list) allSubjects.add(v);
for (const list of Object.values(taxonomy.tier3 ?? {})) for (const v of list) allSubjects.add(v);

const template_subjects = {};
let mapped = 0;
let orphan = 0;
const orphanList = [];

const sorted = templates.slice().sort((a, b) => (a.id || "").localeCompare(b.id || ""));
for (const t of sorted) {
  if (!t.id || !Array.isArray(t.topics)) {
    orphan++;
    if (t.id) orphanList.push(t.id);
    continue;
  }
  const hits = [...new Set(t.topics.filter((s) => allSubjects.has(s)))].sort();
  if (hits.length === 0) {
    orphan++;
    orphanList.push(t.id);
    continue;
  }
  template_subjects[t.id] = hits;
  mapped++;
}

// Preserve insertion order by deleting then re-adding (places at end of object)
delete taxonomy._template_subjects_note;
delete taxonomy.template_subjects;
taxonomy._template_subjects_note =
  "template_id → array of taxonomy subjects this template's `topics` array references. " +
  "Inclusive match across tier1 ∪ tier2 ∪ tier3 entries. " +
  "Auto-derived by scripts/build_template_subjects.cjs from public/data/nano_templates.json. " +
  "Consumed by: future search→generation bridge (per docs/search-generation-bridge.md), " +
  "auto-tag pipeline candidate-set narrowing, content-gap analyzer. " +
  "Re-derive after every nano_templates.json change.";
taxonomy.template_subjects = template_subjects;

fs.writeFileSync(TAX_PATH, JSON.stringify(taxonomy, null, 2) + "\n");

console.log(`✓ template_subjects rebuilt: ${mapped} mapped, ${orphan} orphan`);
if (orphanList.length > 0) {
  console.log(`  orphan templates (no taxonomy hit in topics):`);
  for (const id of orphanList.slice(0, 10)) console.log(`    ${id}`);
  if (orphanList.length > 10) console.log(`    ... and ${orphanList.length - 10} more`);
}
