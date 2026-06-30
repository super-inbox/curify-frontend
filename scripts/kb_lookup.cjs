#!/usr/bin/env node
// Look up one template's real capability evidence from the VIR capability KB.
// A review aid for the routing gold (scripts/configs/vir_routing_gold.json):
// shows what a template ACTUALLY generates (its inspirations' param values /
// tags / aliases), not just its name/description.
//
// Pure over local JSON. No network, no key.
//
// Usage:
//   node scripts/kb_lookup.cjs template-recipe
//   node scripts/kb_lookup.cjs recipe            # substring match if no exact id
//   node scripts/kb_lookup.cjs --json template-recipe   # raw JSON dump

"use strict";
const fs = require("fs");
const path = require("path");

const KB_PATH = path.join(__dirname, "configs/template_capability_kb.json");
const KB = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const query = args.filter((a) => !a.startsWith("--"))[0];

if (!query) {
  console.error("usage: node scripts/kb_lookup.cjs [--json] <template-id | keyword>");
  process.exit(1);
}

// exact id, else substring on id/title
let t = KB.templates.find((x) => x.template_id === query);
let matches = [];
if (!t) {
  const q = query.toLowerCase();
  matches = KB.templates.filter(
    (x) => x.template_id.toLowerCase().includes(q) || (x.title || "").toLowerCase().includes(q),
  );
  if (matches.length === 1) t = matches[0];
}

if (!t) {
  if (matches.length === 0) {
    console.error(`no template matched: ${query}`);
    console.error(`(note: only allow_generation=true templates are in the KB)`);
    process.exit(1);
  }
  console.log(`${matches.length} templates matched "${query}" — be more specific:`);
  for (const m of matches) console.log(`  ${m.template_id}  (${m.title})`);
  process.exit(0);
}

if (asJson) {
  console.log(JSON.stringify(t, null, 2));
  process.exit(0);
}

function list(label, arr, cap = 30) {
  const a = arr || [];
  console.log(`${label} (${a.length}):`);
  if (a.length === 0) { console.log("  —"); return; }
  console.log("  " + a.slice(0, cap).map(String).join(" · "));
  if (a.length > cap) console.log(`  …(+${a.length - cap} more)`);
}

console.log(`══ ${t.template_id} ══`);
console.log(`title:       ${t.title}`);
console.log(`category:    ${t.category}`);
console.log(`description: ${t.description}`);
console.log(`params:      [${(t.param_names || []).join(", ")}]`);
console.log(`examples:    ${t.example_count}`);
console.log(`topics:      ${(t.template_topics || []).join(", ") || "—"}`);
console.log("");
list("sample_param_values (real generative range)", t.sample_param_values);
console.log("");
list("inspiration_tags", t.inspiration_tags);
console.log("");
list("inspiration_topics", t.inspiration_topics);
console.log("");
list("search_aliases", t.search_aliases, 40);
