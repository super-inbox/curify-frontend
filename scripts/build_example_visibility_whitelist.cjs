#!/usr/bin/env node
// scripts/build_example_visibility_whitelist.cjs
//
// Emits public/data/example_visibility_whitelist.json — the set of
// /nano-template/[slug]/example/[id] IDs with recent Google Search
// Console impressions. Feeds the sitemap-examples.xml route so it can
// cull stale example URLs and stop wasting crawl budget on the
// invisible-to-Google tail.
//
// Input: the freshest raw/gsc-audit-*/Pages-all.csv snapshot (from
//        scripts/audit_gsc_full.cjs). Falls back to any /raw/gsc-audit-*
//        directory sorted by name (which is date-ordered).
//
// Usage:
//   node scripts/build_example_visibility_whitelist.cjs
//   node scripts/build_example_visibility_whitelist.cjs --min-impressions=1
//   node scripts/build_example_visibility_whitelist.cjs --src=raw/gsc-audit-2026-06-26/Pages-all.csv

"use strict";
const fs = require("fs");
const path = require("path");

function parseArgs() {
  const out = { minImpressions: 1, src: null, out: null };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--min-impressions=")) out.minImpressions = Number(a.split("=")[1]) || 1;
    else if (a.startsWith("--src=")) out.src = a.split("=")[1];
    else if (a.startsWith("--out=")) out.out = a.split("=")[1];
  }
  return out;
}

function findLatestPagesCsv() {
  const raw = path.join(__dirname, "..", "raw");
  const dirs = fs.readdirSync(raw).filter((d) => d.startsWith("gsc-audit-"));
  if (!dirs.length) throw new Error("No raw/gsc-audit-* directory found. Run audit_gsc_full.cjs first.");
  dirs.sort();
  const latest = dirs[dirs.length - 1];
  const csv = path.join(raw, latest, "Pages-all.csv");
  if (!fs.existsSync(csv)) throw new Error(`Missing ${csv}. Re-run audit_gsc_full.cjs.`);
  return csv;
}

// URL → example ID. Matches both bare and locale-prefixed paths.
const EX_URL = /^https:\/\/www\.curify-ai\.com\/(?:[a-z]{2}\/)?nano-template\/[^/]+\/example\/(.+)$/;

function main() {
  const args = parseArgs();
  const src = args.src ? path.resolve(args.src) : findLatestPagesCsv();
  const outPath = args.out
    ? path.resolve(args.out)
    : path.join(__dirname, "..", "public", "data", "example_visibility_whitelist.json");

  const csv = fs.readFileSync(src, "utf8");
  const lines = csv.split("\n");
  const header = lines.shift();
  if (!/^Page,Clicks,Impressions/.test(header)) {
    throw new Error(`Unexpected header: ${header}`);
  }

  const visible = new Set();
  const withClicks = new Set();
  for (const line of lines) {
    if (!line) continue;
    // CSV is well-formed (no embedded commas in the URL / integer cols),
    // so splitting by comma is safe here.
    const parts = line.split(",");
    const url = parts[0];
    const clicks = Number(parts[1] || 0);
    const impressions = Number(parts[2] || 0);
    if (impressions < args.minImpressions) continue;
    const m = EX_URL.exec(url);
    if (!m) continue;
    // Decode any URL-encoded chars in the id (e.g. %20 → " ") so it matches
    // the raw ids in nano_inspiration.json.
    let id;
    try { id = decodeURIComponent(m[1]); } catch { id = m[1]; }
    visible.add(id);
    if (clicks > 0) withClicks.add(id);
  }

  // Cross-reference with nano_inspiration.json to drop URL-encoding
  // artifacts that don't match any actual example.
  const nanoInsp = require(path.join(__dirname, "..", "public", "data", "nano_inspiration.json"));
  const inspArr = Array.isArray(nanoInsp) ? nanoInsp : (nanoInsp.nano_inspiration || []);
  const realIds = new Set(inspArr.map((it) => it && it.id).filter(Boolean));
  const whitelist = [...visible].filter((id) => realIds.has(id)).sort();

  const payload = {
    source: path.basename(path.dirname(src)),
    generated_at: new Date().toISOString().slice(0, 10),
    min_impressions: args.minImpressions,
    total_examples: realIds.size,
    visible_in_gsc: whitelist.length,
    with_clicks: [...withClicks].filter((id) => realIds.has(id)).length,
    coverage_pct: Math.round((100 * whitelist.length) / realIds.size),
    ids: whitelist,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`wrote ${whitelist.length} visible ids → ${outPath}`);
  console.log(`  coverage: ${payload.coverage_pct}% of ${realIds.size} total examples`);
  console.log(`  with_clicks: ${payload.with_clicks}`);
  console.log(`  source: raw/${payload.source}/`);
}

main();
