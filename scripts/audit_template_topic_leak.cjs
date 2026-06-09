/**
 * Audit template `topics[]` for subject-leak.
 *
 * Per memory feedback_template_topics_should_be_boilerplate.md:
 *   template.topics[] = boilerplate (Info-Type + Layout).
 *   Subject lives on individual examples (nano_inspiration.json),
 *   NOT at template level.
 *
 * This script flags topics on a template that vary across that template's
 * examples — those are subject-leaks and should be moved per-example.
 *
 * Method:
 *   For each template with len(topics[]) >= 6, group its examples,
 *   compute the per-example topics (inspiration_topics + topics fields),
 *   classify each template-level topic as:
 *
 *     CONSTANT   present on >=80% of examples  → keep template-level
 *     VARIABLE   present on <20% of examples   → MOVE to per-example
 *     PARTIAL    20%-80%                        → review case-by-case
 *
 * Templates with <3 examples are skipped (insufficient signal).
 *
 * Output: console table + JSON dump to /tmp/template_topic_leak_audit.json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES_PATH = path.join(ROOT, "public/data/nano_templates.json");
const INSPIRATIONS_PATH = path.join(ROOT, "public/data/nano_inspiration.json");

const MIN_SUBJECTS = 6;            // only audit templates with >=6 topics
const MIN_EXAMPLES = 3;            // need ≥3 examples for signal
const CONSTANT_THRESHOLD = 0.80;
const VARIABLE_THRESHOLD = 0.20;

const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf8"));
const inspirations = JSON.parse(fs.readFileSync(INSPIRATIONS_PATH, "utf8"));

// Group examples by template_id
const byTemplate = new Map();
for (const e of inspirations) {
  const tid = e.template_id;
  if (!tid) continue;
  if (!byTemplate.has(tid)) byTemplate.set(tid, []);
  byTemplate.get(tid).push(e);
}

function collectExampleTopics(example) {
  // inspiration_topics is the per-example tag set from gallery/auto-tag;
  // topics is the inherited template default. Use both, deduped.
  const set = new Set();
  for (const t of example.inspiration_topics ?? []) set.add(t);
  for (const t of example.topics ?? []) set.add(t);
  return set;
}

const findings = [];

for (const tpl of templates) {
  const tid = tpl.id;
  const tplTopics = tpl.topics ?? [];
  if (tplTopics.length < MIN_SUBJECTS) continue;

  const examples = byTemplate.get(tid) ?? [];
  if (examples.length < MIN_EXAMPLES) continue;

  const exampleTopicsList = examples.map(collectExampleTopics);

  const classification = {};
  for (const t of tplTopics) {
    const hits = exampleTopicsList.filter((s) => s.has(t)).length;
    const rate = hits / examples.length;
    let verdict;
    if (rate >= CONSTANT_THRESHOLD) verdict = "CONSTANT";
    else if (rate < VARIABLE_THRESHOLD) verdict = "VARIABLE";
    else verdict = "PARTIAL";
    classification[t] = { rate: +rate.toFixed(2), hits, examples: examples.length, verdict };
  }

  const variableTopics = Object.entries(classification)
    .filter(([, c]) => c.verdict === "VARIABLE")
    .map(([t]) => t);
  const partialTopics = Object.entries(classification)
    .filter(([, c]) => c.verdict === "PARTIAL")
    .map(([t]) => t);

  if (variableTopics.length === 0 && partialTopics.length === 0) continue;

  findings.push({
    template_id: tid,
    n_examples: examples.length,
    n_topics: tplTopics.length,
    topics: tplTopics,
    classification,
    suspected_leaks: variableTopics,
    partial: partialTopics,
  });
}

// Sort: most suspected leaks first
findings.sort((a, b) =>
  b.suspected_leaks.length - a.suspected_leaks.length ||
  b.partial.length - a.partial.length
);

console.log(`\n=== Audit: template topic-leak (topics[]>=${MIN_SUBJECTS}, examples>=${MIN_EXAMPLES}) ===`);
console.log(`templates examined: ${findings.length}\n`);

for (const f of findings) {
  console.log(`${f.template_id}  (${f.n_examples} examples, ${f.n_topics} topics)`);
  if (f.suspected_leaks.length) {
    console.log(`  ⚠️  VARIABLE (likely leak): ${f.suspected_leaks.join(", ")}`);
    for (const t of f.suspected_leaks) {
      const c = f.classification[t];
      console.log(`       ${t}: ${c.hits}/${c.examples} (${(c.rate * 100).toFixed(0)}%)`);
    }
  }
  if (f.partial.length) {
    console.log(`  ?  PARTIAL (review): ${f.partial.join(", ")}`);
    for (const t of f.partial) {
      const c = f.classification[t];
      console.log(`       ${t}: ${c.hits}/${c.examples} (${(c.rate * 100).toFixed(0)}%)`);
    }
  }
  console.log();
}

const out = "/tmp/template_topic_leak_audit.json";
fs.writeFileSync(out, JSON.stringify(findings, null, 2));
console.log(`Full JSON: ${out}`);

const summary = {
  templates_audited: findings.length,
  total_suspected_leaks: findings.reduce((n, f) => n + f.suspected_leaks.length, 0),
  total_partials: findings.reduce((n, f) => n + f.partial.length, 0),
};
console.log(`\nSummary: ${JSON.stringify(summary)}`);
