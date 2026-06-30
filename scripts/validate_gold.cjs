#!/usr/bin/env node
// Offline validator for the VIR routing gold set (scripts/configs/vir_routing_gold.json).
//
// Catches gold-authoring errors BEFORE scoring — the gold is hand/LLM
// authored, so template ids can be typo'd or hallucinated. Checks, per query:
//   - every acceptable_template_id exists AND is allow_generation=true
//     (Path B's catalog only contains allow_generation templates, so a
//      non-generatable gold id could never be hit — it must be flagged)
//   - primary_template_id (if set) is one of acceptable_template_ids
//   - near_miss_template_ids exist as real templates (any allow_generation)
//   - canonical_slots keys are real param names of the primary template
//   - ambiguity ∈ {low, medium, high}
//   - locale ∈ {en, zh}
//   - non-gap rows have ≥1 acceptable id; gap rows (acceptable=[]) have a
//     rationale mentioning "gap"
//
// Pure over local JSON. No network, no DB, no secrets. Exit 1 on any error.
//
// Usage: node scripts/validate_gold.cjs [--gold=path]

"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const goldArg = process.argv.find((a) => a.startsWith("--gold="));
const GOLD_PATH = goldArg
  ? goldArg.slice(7)
  : path.join(ROOT, "scripts/configs/vir_routing_gold.json");

const TEMPLATES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"),
);
const gold = JSON.parse(fs.readFileSync(GOLD_PATH, "utf-8"));
const queries = Array.isArray(gold) ? gold : gold.queries;

const ALL_IDS = new Set(TEMPLATES.map((t) => t.id));
const GEN_IDS = new Set(
  TEMPLATES.filter((t) => t.allow_generation === true).map((t) => t.id),
);
// template id -> set of english param names
const PARAMS = new Map();
for (const t of TEMPLATES) {
  const ps = ((t.locales && t.locales.en && t.locales.en.parameters) || [])
    .map((p) => p && p.name)
    .filter(Boolean);
  PARAMS.set(t.id, new Set(ps));
}

const errors = [];
const warnings = [];

function err(q, msg) {
  errors.push(`✗ [${q}] ${msg}`);
}
function warn(q, msg) {
  warnings.push(`⚠ [${q}] ${msg}`);
}

for (const row of queries) {
  const q = row.query;
  const acc = row.acceptable_template_ids || [];
  const near = row.near_miss_template_ids || [];

  if (!["en", "zh"].includes(row.locale)) err(q, `bad locale: ${row.locale}`);
  if (!["low", "medium", "high"].includes(row.ambiguity))
    err(q, `bad ambiguity: ${row.ambiguity}`);

  // acceptable ids must exist AND be generatable
  for (const id of acc) {
    if (!ALL_IDS.has(id)) err(q, `acceptable id does NOT exist: ${id}`);
    else if (!GEN_IDS.has(id))
      err(q, `acceptable id exists but allow_generation!=true (unhittable): ${id}`);
  }
  // dupes within acceptable
  if (new Set(acc).size !== acc.length) err(q, `duplicate acceptable ids`);

  // primary must be within acceptable (or null)
  if (row.primary_template_id != null) {
    if (!acc.includes(row.primary_template_id))
      err(q, `primary_template_id not in acceptable: ${row.primary_template_id}`);
  } else if (acc.length > 0) {
    warn(q, `primary is null but acceptable is non-empty (tie?)`);
  }

  // near-miss ids should at least exist (any template), else likely a typo
  for (const id of near) {
    if (!ALL_IDS.has(id)) warn(q, `near_miss id does not exist (typo?): ${id}`);
  }

  // canonical_slots keys vs primary template params
  const slots = row.canonical_slots || {};
  const primary = row.primary_template_id;
  if (primary && PARAMS.has(primary)) {
    const valid = PARAMS.get(primary);
    for (const k of Object.keys(slots)) {
      if (!valid.has(k))
        warn(q, `canonical_slot '${k}' is not a param of primary ${primary} (params: ${[...valid].join(",") || "none"})`);
    }
  }

  // gap rows
  if (acc.length === 0) {
    if (!/gap/i.test(row.rationale || ""))
      warn(q, `empty acceptable set but rationale doesn't mention a content gap`);
  }
}

// summary
const total = queries.length;
const gaps = queries.filter((r) => (r.acceptable_template_ids || []).length === 0).length;
const byAmb = queries.reduce((m, r) => ((m[r.ambiguity] = (m[r.ambiguity] || 0) + 1), m), {});

console.log(`gold: ${GOLD_PATH}`);
console.log(`queries:            ${total}`);
console.log(`  by ambiguity:     ${JSON.stringify(byAmb)}`);
console.log(`  content-gap (acceptable=[]): ${gaps}`);
console.log(`catalog: ${ALL_IDS.size} templates, ${GEN_IDS.size} allow_generation`);
console.log("");

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log("  " + w);
  console.log("");
}
if (errors.length) {
  console.log(`ERRORS (${errors.length}):`);
  for (const e of errors) console.log("  " + e);
  console.log("\nFAIL");
  process.exit(1);
}
console.log("OK — no errors");
