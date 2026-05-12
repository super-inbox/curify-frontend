#!/usr/bin/env node
// scripts/generate_example_id_redirects.cjs
//
// Reads Google Search Console's noindex/exclusion export, finds the
// /nano-template/<slug>/example/<exampleId> URLs whose IDs use the legacy
// "-zh-" / "-en-" format, and generates 301 redirect rules from each old
// URL to the current canonical (computed by stripping the language
// segment and validating against public/data/nano_inspiration.json).
//
// Output goes to redirects.examples.generated.cjs, loaded by
// next.config.ts. Idempotent: rerun whenever a new GSC export lands.
//
// Usage:
//   node scripts/generate_example_id_redirects.cjs                  # writes the file
//   node scripts/generate_example_id_redirects.cjs --dry-run        # preview only

"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CSV = path.join(ROOT, "noindex_exclusion.csv");
const INSP = path.join(ROOT, "public/data/nano_inspiration.json");
const TPL = path.join(ROOT, "public/data/nano_templates.json");
const OUT = path.join(ROOT, "redirects.examples.generated.cjs");

const LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"];
const LOCALE_RE = LOCALES.join("|");
const dryRun = process.argv.includes("--dry-run");

// ── CSV reader handling quoted multi-line URL fields ──
function readRows(text) {
  const out = [];
  let cur = "", inQ = false;
  for (const ch of text) {
    if (ch === '"') inQ = !inQ;
    if (ch === "\n" && !inQ) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

const inspirations = JSON.parse(fs.readFileSync(INSP, "utf-8"));
const templates = JSON.parse(fs.readFileSync(TPL, "utf-8"));
const validExampleIds = new Set(inspirations.map((x) => x.id));
const validTemplateIds = new Set(templates.map((x) => x.id));

function normalizeExampleId(oldId) {
  if (validExampleIds.has(oldId)) return oldId;
  const candidates = new Set([
    oldId.replace(/-zh(?=-|$)/g, ""),
    oldId.replace(/-en(?=-|$)/g, ""),
    oldId.replace(/-zh-/g, "-").replace(/-zh$/, ""),
    oldId.replace(/-en-/g, "-").replace(/-en$/, ""),
    oldId.replace(/-zh-/g, "-").replace(/-en-/g, "-").replace(/-zh$/, "").replace(/-en$/, ""),
  ]);
  for (const c of candidates) if (c && c !== oldId && validExampleIds.has(c)) return c;
  return null;
}

function normalizeSlug(oldSlug) {
  // The slug is the toSlug(template_id) form (template- prefix stripped).
  const tryAs = (s) => {
    const tid = s.startsWith("template-") ? s : `template-${s}`;
    return validTemplateIds.has(tid) ? s.replace(/^template-/, "") : null;
  };
  if (tryAs(oldSlug)) return tryAs(oldSlug);
  const candidates = new Set([
    oldSlug.replace(/-zh(?=-|$)/g, ""),
    oldSlug.replace(/-en(?=-|$)/g, ""),
    oldSlug.replace(/-zh-/g, "-").replace(/-zh$/, ""),
    oldSlug.replace(/-en-/g, "-").replace(/-en$/, ""),
    oldSlug.replace(/^template-/, ""),
    oldSlug.replace(/^template-/, "").replace(/-zh(?=-|$)/g, "").replace(/-en(?=-|$)/g, ""),
  ]);
  for (const c of candidates) {
    const ok = tryAs(c);
    if (ok) return ok;
  }
  return null;
}

const seen = new Set();
const mappings = []; // { oldSlug, oldExId, newSlug, newExId }
const stats = { total: 0, alreadyValid: 0, mapped: 0, unmapped: 0, dupSkipped: 0 };

const raw = fs.readFileSync(CSV, "utf-8");
const rows = readRows(raw).slice(1).filter(Boolean);
for (let line of rows) {
  let url;
  if (line.startsWith('"')) {
    const close = line.indexOf('"', 1);
    if (close === -1) continue;
    url = line.slice(1, close).replace(/\s+/g, "").trim();
  } else {
    const c = line.indexOf(",");
    url = (c >= 0 ? line.slice(0, c) : line).trim();
  }
  if (!url) continue;

  let pathname;
  try { pathname = new URL(url).pathname; } catch { continue; }
  // Strip locale prefix; we use a single redirect that matches any locale
  pathname = pathname.replace(new RegExp(`^/(${LOCALE_RE})(?=/|$)`), "");

  const ex = pathname.match(/^\/nano-template\/([^/]+)\/example\/([^/]+)$/);
  if (!ex) continue;
  stats.total++;

  const oldSlug = decodeURIComponent(ex[1]);
  const oldExId = decodeURIComponent(ex[2]);
  if (validExampleIds.has(oldExId)) { stats.alreadyValid++; continue; }

  const newExId = normalizeExampleId(oldExId);
  if (!newExId) { stats.unmapped++; continue; }
  const newSlug = normalizeSlug(oldSlug) || oldSlug;

  const key = `${oldSlug}|${oldExId}`;
  if (seen.has(key)) { stats.dupSkipped++; continue; }
  seen.add(key);

  mappings.push({ oldSlug, oldExId, newSlug, newExId });
  stats.mapped++;
}

console.log("Stats:", stats);
console.log(`Unique mappings: ${mappings.length}`);

// Build redirect rules. Two entries per mapping:
//   1. No-prefix (matches the default-locale en URL)
//   2. /:locale(en|zh|de|...)/... (matches any prefixed locale)
// `permanent: true` → 301.
const rules = [];
for (const { oldSlug, oldExId, newSlug, newExId } of mappings) {
  const oldPath = `/nano-template/${encodeURI(oldSlug)}/example/${encodeURI(oldExId)}`;
  const newPath = `/nano-template/${encodeURI(newSlug)}/example/${encodeURI(newExId)}`;
  rules.push({
    source: oldPath,
    destination: newPath,
    permanent: true,
  });
  rules.push({
    source: `/:locale(${LOCALE_RE})${oldPath}`,
    destination: `/:locale${newPath}`,
    permanent: true,
  });
}

console.log(`Total redirect rules: ${rules.length}`);

if (dryRun) {
  console.log("\nFirst 4 rules:");
  for (const r of rules.slice(0, 4)) console.log(JSON.stringify(r, null, 2));
  console.log("(dry-run — no file written)");
  process.exit(0);
}

const header = `// Generated by scripts/generate_example_id_redirects.cjs — do not edit by hand.
// 301 redirects from the legacy "-zh-" / "-en-" example-ID URL format
// to the current canonical IDs. Loaded from next.config.ts.

`;
fs.writeFileSync(OUT, header + "module.exports = " + JSON.stringify(rules, null, 2) + ";\n", "utf-8");
console.log(`Wrote ${OUT}`);
