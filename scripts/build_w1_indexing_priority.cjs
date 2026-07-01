#!/usr/bin/env node
// scripts/build_w1_indexing_priority.cjs
//
// Emits raw/w1-indexing-priority.txt — a ranked list of URLs to push
// through the Google Indexing API to accelerate re-crawl of the
// W1.1-W1.5 wedges (link-injection layer shipped 2026-06-27).
//
// Priority order (top of file = highest):
//   1. 10 tier-1 topic hubs × 10 locales
//   2. 10 live use-case pages × 10 locales
//   3. 10 live tool pages × 10 locales
//   4. Fully-localized tier-2/3/4 topic hubs × 10 locales
//
// Feeds submit_indexing_api.cjs via --urls-file= (see extension below).
// Quota is 200 URL_UPDATED / day, so ~9 days to cover the full list.
//
// Regenerate whenever the topic taxonomy or use-cases/tools registries
// change.

"use strict";
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..");
const BASE = "https://www.curify-ai.com";
const LOCALES = ["en", "zh", "es", "fr", "de", "ja", "ko", "hi", "tr", "ru"];

function locales(pathSuffix) {
  return LOCALES.map((l) => (l === "en" ? `${BASE}${pathSuffix}` : `${BASE}/${l}${pathSuffix}`));
}

function loadJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(REPO, rel), "utf8"));
}

const tax = loadJSON("lib/taxonomy.json");
const topicsI18n = loadJSON("messages/en/topics.json").topics ?? {};
const usecasesRaw = fs.readFileSync(path.join(REPO, "lib/use-cases.ts"), "utf8");
const toolsRaw = fs.readFileSync(path.join(REPO, "lib/tools-registry.ts"), "utf8");

// tier-1 is a list of top-level topics
const tier1 = Array.isArray(tax.tier1) ? tax.tier1 : Object.keys(tax.tier1 ?? {});

// tier-2/3/4 are keyed by parent → children
function collect(t) {
  const out = new Set();
  if (Array.isArray(t)) {
    for (const x of t) if (typeof x === "string" && !x.startsWith("_")) out.add(x);
    return out;
  }
  if (t && typeof t === "object") {
    for (const [k, v] of Object.entries(t)) {
      if (!k.startsWith("_")) out.add(k);
      if (Array.isArray(v)) for (const x of v) if (typeof x === "string" && !x.startsWith("_")) out.add(x);
    }
  }
  return out;
}
const t2 = collect(tax.tier2 ?? {});
const t3 = collect(tax.tier3 ?? {});
const t4 = collect(tax.tier4 ?? {});

function isFullyLocalized(id) {
  const entry = topicsI18n[id];
  return entry && typeof entry === "object" && typeof entry.title === "string" && entry.title.length > 0;
}

// Extract use-cases (only currently-live ones; assume all listed slugs are live).
const usecaseSlugs = Array.from(usecasesRaw.matchAll(/slug:\s*"([^"]+)"/g)).map((m) => m[1]);
// Extract tools with status=create|demo (live)
const toolSlugs = Array.from(
  toolsRaw.matchAll(/slug:\s*"([^"]+)"[\s\S]{1,300}?status:\s*"(\w+)"/g)
)
  .filter(([, , status]) => status === "create" || status === "demo")
  .map((m) => m[1]);

const seen = new Set();
const ordered = [];
function pushGroup(label, urls) {
  const added = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    added.push(u);
  }
  ordered.push({ label, urls: added });
}

// 1. tier-1 topic hubs (all fully-localized)
const t1Fully = tier1.filter(isFullyLocalized);
pushGroup("tier-1 topic hubs", t1Fully.flatMap((id) => locales(`/topics/${id}`)));

// 2. use-case pages
pushGroup("use-cases", usecaseSlugs.flatMap((s) => locales(`/use-cases/${s}`)));

// 3. tool pages
pushGroup("tools (live)", toolSlugs.flatMap((s) => locales(`/tools/${s}`)));

// 4. tier-2 fully-localized topic hubs
const t2Fully = [...t2].filter((id) => isFullyLocalized(id) && !tier1.includes(id));
pushGroup("tier-2 topic hubs", t2Fully.flatMap((id) => locales(`/topics/${id}`)));

// 5. tier-3 fully-localized topic hubs
const t3Fully = [...t3].filter(
  (id) => isFullyLocalized(id) && !tier1.includes(id) && !t2.has(id)
);
pushGroup("tier-3 topic hubs", t3Fully.flatMap((id) => locales(`/topics/${id}`)));

// 6. tier-4 fully-localized topic hubs
const t4Fully = [...t4].filter(
  (id) => isFullyLocalized(id) && !tier1.includes(id) && !t2.has(id) && !t3.has(id)
);
pushGroup("tier-4 topic hubs", t4Fully.flatMap((id) => locales(`/topics/${id}`)));

// Write out
const outPath = path.join(REPO, "raw", "w1-indexing-priority.txt");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const lines = [
  `# Generated ${new Date().toISOString()}`,
  `# W1 indexation-rescue priority URL list.`,
  `# Feed to submit_indexing_api.cjs via --urls-file=. Quota 200/day.`,
];
let total = 0;
for (const { label, urls } of ordered) {
  lines.push("");
  lines.push(`# ── ${label} (${urls.length} URLs) ──────────────────────────────`);
  for (const u of urls) lines.push(u);
  total += urls.length;
}
fs.writeFileSync(outPath, lines.join("\n") + "\n");

console.log(`wrote ${total} URLs → ${path.relative(REPO, outPath)}`);
console.log(`  tier-1 topics:   ${ordered[0].urls.length}`);
console.log(`  use-cases:       ${ordered[1].urls.length}`);
console.log(`  live tools:      ${ordered[2].urls.length}`);
console.log(`  tier-2 topics:   ${ordered[3].urls.length}`);
console.log(`  tier-3 topics:   ${ordered[4].urls.length}`);
console.log(`  tier-4 topics:   ${ordered[5].urls.length}`);
console.log(`\nAt 200/day quota, full sequence takes ~${Math.ceil(total / 200)} days.`);
