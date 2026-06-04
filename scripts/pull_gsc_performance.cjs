#!/usr/bin/env node
// scripts/pull_gsc_performance.cjs
//
// Pulls performance data from Google Search Console programmatically,
// replacing the manual export-and-drop-CSVs-in-raw/ workflow.
//
// Mirror of what the manual GSC UI export produces:
//   - Chart.csv      (per-day clicks/impr/CTR/position)
//   - Queries.csv    (top queries with metrics)
//   - Pages.csv      (top pages with metrics)
//   - Countries.csv  (top countries with metrics)
//   - Devices.csv    (per-device metrics)
//   - Filters.csv    (the date range used)
//
// Prereqs (same as submit_indexing_api.cjs):
//   1. google-service-account.json (curify-studio/curify_background/...)
//   2. Service account added as Owner of the GSC property for curify-ai.com
//   3. Search Console API enabled in GCP project 496653662415:
//      https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=496653662415
//
// Usage:
//   node scripts/pull_gsc_performance.cjs --key=<path/to/sa.json>
//   node scripts/pull_gsc_performance.cjs --key=... --from=2026-06-01 --to=2026-06-04
//   node scripts/pull_gsc_performance.cjs --key=... --site=sc-domain:curify-ai.com
//   node scripts/pull_gsc_performance.cjs --key=... --out=raw/curify-ai.com-Performance-on-Search-2026-06-04
//
// Default: last 3 days (matches the typical weekly refresh cadence),
// site = first verified property the SA can see, out = raw/curify-ai.com-Performance-on-Search-<today>.

"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const DEFAULT_KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function parseArgs() {
  const out = { key: DEFAULT_KEY, from: null, to: null, site: null, outDir: null };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--key=")) out.key = a.split("=").slice(1).join("=");
    else if (a.startsWith("--from=")) out.from = a.split("=")[1];
    else if (a.startsWith("--to=")) out.to = a.split("=")[1];
    else if (a.startsWith("--site=")) out.site = a.split("=")[1];
    else if (a.startsWith("--out=")) out.outDir = a.split("=")[1];
  }
  const today = new Date();
  const threeDaysAgo = new Date(today.getTime() - 3 * 86400000);
  if (!out.to) out.to = ymd(today);
  if (!out.from) out.from = ymd(threeDaysAgo);
  if (!out.outDir) out.outDir = `raw/curify-ai.com-Performance-on-Search-${ymd(today)}`;
  return out;
}

function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(p, headers, rows) {
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(r.map(csvCell).join(","));
  fs.writeFileSync(p, lines.join("\n") + "\n", "utf-8");
}

async function queryGsc(sc, site, body) {
  const res = await sc.searchanalytics.query({ siteUrl: site, requestBody: body });
  return res.data.rows || [];
}

async function main() {
  const args = parseArgs();
  if (!fs.existsSync(args.key)) {
    console.error(`❌ Key file not found: ${args.key}`);
    process.exit(1);
  }
  console.log(`GSC pull: ${args.from} → ${args.to}`);

  const auth = new google.auth.GoogleAuth({
    keyFile: args.key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const client = await auth.getClient();
  const sc = google.searchconsole({ version: "v1", auth: client });

  // Auto-detect site if not supplied
  let site = args.site;
  if (!site) {
    const sites = await sc.sites.list({});
    const entries = (sites.data.siteEntry || []).filter(
      (s) => /curify-ai\.com/i.test(s.siteUrl) && /(siteOwner|siteFullUser|siteRestrictedUser)/i.test(s.permissionLevel || "")
    );
    if (!entries.length) {
      console.error("❌ No accessible curify-ai.com property. Available:");
      for (const s of sites.data.siteEntry || []) console.error(`  ${s.siteUrl} (${s.permissionLevel})`);
      process.exit(1);
    }
    site = entries[0].siteUrl;
    console.log(`(auto) site: ${site}`);
  }

  fs.mkdirSync(args.outDir, { recursive: true });
  const base = { startDate: args.from, endDate: args.to, rowLimit: 5000 };

  // Chart.csv (per-day totals — no dimension filter needed)
  console.log("→ Chart.csv (per-day totals)");
  const byDate = await queryGsc(sc, site, { ...base, dimensions: ["date"] });
  writeCsv(
    path.join(args.outDir, "Chart.csv"),
    ["Date", "Clicks", "Impressions", "CTR", "Position"],
    byDate.map((r) => [r.keys[0], r.clicks, r.impressions, `${(r.ctr * 100).toFixed(2)}%`, r.position.toFixed(1)])
  );

  // Queries.csv
  console.log("→ Queries.csv (top queries)");
  const byQuery = await queryGsc(sc, site, { ...base, dimensions: ["query"] });
  writeCsv(
    path.join(args.outDir, "Queries.csv"),
    ["Top queries", "Clicks", "Impressions", "CTR", "Position"],
    byQuery.map((r) => [r.keys[0], r.clicks, r.impressions, `${(r.ctr * 100).toFixed(2)}%`, r.position.toFixed(1)])
  );

  // Pages.csv
  console.log("→ Pages.csv (top pages)");
  const byPage = await queryGsc(sc, site, { ...base, dimensions: ["page"] });
  writeCsv(
    path.join(args.outDir, "Pages.csv"),
    ["Top pages", "Clicks", "Impressions", "CTR", "Position"],
    byPage.map((r) => [r.keys[0], r.clicks, r.impressions, `${(r.ctr * 100).toFixed(2)}%`, r.position.toFixed(1)])
  );

  // Countries.csv
  console.log("→ Countries.csv (top countries)");
  const byCountry = await queryGsc(sc, site, { ...base, dimensions: ["country"] });
  writeCsv(
    path.join(args.outDir, "Countries.csv"),
    ["Country", "Clicks", "Impressions", "CTR", "Position"],
    byCountry.map((r) => [r.keys[0], r.clicks, r.impressions, `${(r.ctr * 100).toFixed(2)}%`, r.position.toFixed(1)])
  );

  // Devices.csv
  console.log("→ Devices.csv (per-device)");
  const byDevice = await queryGsc(sc, site, { ...base, dimensions: ["device"] });
  writeCsv(
    path.join(args.outDir, "Devices.csv"),
    ["Device", "Clicks", "Impressions", "CTR", "Position"],
    byDevice.map((r) => [r.keys[0], r.clicks, r.impressions, `${(r.ctr * 100).toFixed(2)}%`, r.position.toFixed(1)])
  );

  // Filters.csv
  writeCsv(
    path.join(args.outDir, "Filters.csv"),
    ["Filter", "Value"],
    [["Search type", "Web"], ["Date", `${args.from}-${args.to}`]]
  );

  console.log(`\n✨ Done — ${args.outDir}/`);
}

main().catch((e) => {
  const msg = e?.errors?.[0]?.message || e?.message || String(e);
  console.error(`❌ ${msg}`);
  process.exit(1);
});
