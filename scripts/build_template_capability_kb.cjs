#!/usr/bin/env node
// Build the template-capability knowledge base for the Visual Intent
// Routing routing-eval (v1).
//
// The matcher (Path B) and the routing ground truth both need to know
// what a template can ACTUALLY generate — which is broader than its
// name/description. Example: template-celebrity-movie-group-poster is
// described as a "celebrity/movie poster collage" but its real examples
// span NBA/tennis legends, BLACKPINK/BTS, anime squads, World Cup posters
// (single free-text param `star_movie_group`). Template descriptions
// alone would mislabel ground truth; the real generative range is only
// visible in the inspirations (examples) generated from each template.
//
// This script aggregates, per allow_generation=true template:
//   - static metadata: title / category / description / params / topics
//   - capability evidence from inspirations: example_count, the distinct
//     concrete param values actually used, and the union of tags /
//     search_aliases / topics across its examples.
//
// Pure over local JSON. No network, no DB, no env, no secrets.
//
// Usage:
//   node scripts/build_template_capability_kb.cjs
//   node scripts/build_template_capability_kb.cjs --out=/tmp/kb.json
//
// Output (default): scripts/configs/template_capability_kb.json

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"),
);
const INSP = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"),
);
const EN_NANO = JSON.parse(
  fs.readFileSync(path.join(ROOT, "messages/en/nano.json"), "utf-8"),
);

// How many distinct sample values / tags / aliases to keep per template.
const SAMPLE_CAP = 24;
const TAG_CAP = 30;
const ALIAS_CAP = 40;

function clean(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

// Group inspirations by their parent template_id once.
const inspByTemplate = new Map();
for (const r of INSP) {
  const tid = r.template_id;
  if (!tid) continue;
  if (!inspByTemplate.has(tid)) inspByTemplate.set(tid, []);
  inspByTemplate.get(tid).push(r);
}

// Frequency-ranked unique strings, capped.
function topUnique(counter, cap) {
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap)
    .map(([v]) => v);
}

function buildEntry(t) {
  const id = t.id;
  const en = EN_NANO[id] || {};
  const enLocale = (t.locales || {}).en || {};
  const paramNames = (enLocale.parameters || [])
    .map((p) => p && p.name)
    .filter((n) => typeof n === "string" && n.length > 0);

  const examples = inspByTemplate.get(id) || [];

  // Concrete param values actually used across examples (the evidence of
  // real generative range). Counted for frequency ranking.
  const valueCounts = new Map();
  const tagCounts = new Map();
  const aliasCounts = new Map();
  const inspTopicCounts = new Map();

  for (const r of examples) {
    for (const v of Object.values(r.params || {})) {
      const cv = clean(v);
      if (cv) valueCounts.set(cv, (valueCounts.get(cv) || 0) + 1);
    }
    for (const tag of r.tags || []) {
      const ct = clean(tag);
      if (ct) tagCounts.set(ct, (tagCounts.get(ct) || 0) + 1);
    }
    for (const a of r.search_aliases || []) {
      const ca = clean(a);
      if (ca) aliasCounts.set(ca, (aliasCounts.get(ca) || 0) + 1);
    }
    for (const tp of r.topics || []) {
      const ctp = clean(tp);
      if (ctp) inspTopicCounts.set(ctp, (inspTopicCounts.get(ctp) || 0) + 1);
    }
  }

  return {
    template_id: id,
    title: clean(en.title),
    category: clean(en.category),
    description: clean(en.description).slice(0, 400),
    param_names: paramNames,
    template_topics: t.topics || [],
    example_count: examples.length,
    // Capability evidence (frequency-ranked, deduped, capped):
    sample_param_values: topUnique(valueCounts, SAMPLE_CAP),
    inspiration_tags: topUnique(tagCounts, TAG_CAP),
    inspiration_topics: topUnique(inspTopicCounts, TAG_CAP),
    search_aliases: topUnique(aliasCounts, ALIAS_CAP),
  };
}

function main() {
  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const outPath = outArg
    ? outArg.slice(6)
    : path.join(ROOT, "scripts/configs/template_capability_kb.json");

  const generatable = TEMPLATES.filter((t) => t.allow_generation === true);
  const entries = generatable.map(buildEntry);

  const withExamples = entries.filter((e) => e.example_count > 0).length;
  const totalExamples = entries.reduce((s, e) => s + e.example_count, 0);

  const out = {
    generated_from: {
      templates: "public/data/nano_templates.json",
      inspirations: "public/data/nano_inspiration.json",
      en_messages: "messages/en/nano.json",
    },
    note:
      "Capability evidence (sample_param_values/inspiration_tags/topics) reflects what each template has actually generated, which is broader than its description. Use this — not the description alone — to label routing ground truth.",
    stats: {
      total_templates: TEMPLATES.length,
      allow_generation: generatable.length,
      templates_with_examples: withExamples,
      total_examples_attributed: totalExamples,
    },
    templates: entries,
  };

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`templates (allow_generation): ${generatable.length}`);
  console.log(`  with >=1 example:           ${withExamples}`);
  console.log(`  total examples attributed:  ${totalExamples}`);
  console.log(`KB written: ${outPath}`);
}

main();
