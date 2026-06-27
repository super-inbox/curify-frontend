#!/usr/bin/env node
// scripts/audit_gsc_full.cjs
//
// Paginated GSC pull — fetches ALL pages (and ALL queries) with any
// impression in the date window, not the 5,000-row cap from
// pull_gsc_performance.cjs. Used for funnel diagnostics (how many of
// our sitemap URLs actually surface in GSC at all).
//
// Usage:
//   node scripts/audit_gsc_full.cjs --from=2026-05-26 --to=2026-06-23 --out=raw/gsc-audit-2026-06-26

"use strict";
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const DEFAULT_KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";

function parseArgs() {
  const out = { key: DEFAULT_KEY, from: null, to: null, site: null, outDir: null };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--key=")) out.key = a.split("=").slice(1).join("=");
    else if (a.startsWith("--from=")) out.from = a.split("=")[1];
    else if (a.startsWith("--to=")) out.to = a.split("=")[1];
    else if (a.startsWith("--site=")) out.site = a.split("=")[1];
    else if (a.startsWith("--out=")) out.outDir = a.split("=")[1];
  }
  if (!out.from || !out.to) {
    console.error("--from and --to required");
    process.exit(1);
  }
  if (!out.outDir) out.outDir = `raw/gsc-audit-${out.to}`;
  return out;
}

async function paginatedPull(sc, site, dimensions, from, to) {
  const all = [];
  const PAGE = 25000;
  let startRow = 0;
  while (true) {
    const resp = await sc.searchanalytics.query({
      siteUrl: site,
      requestBody: {
        startDate: from,
        endDate: to,
        dimensions,
        rowLimit: PAGE,
        startRow,
      },
    });
    const rows = resp.data.rows || [];
    if (!rows.length) break;
    all.push(...rows);
    console.log(`  [+${rows.length}] total ${all.length}`);
    if (rows.length < PAGE) break;
    startRow += PAGE;
  }
  return all;
}

function writeCsv(filePath, header, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const out = [header.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  fs.writeFileSync(filePath, out + "\n");
}

async function main() {
  const args = parseArgs();
  const auth = new google.auth.GoogleAuth({
    keyFile: args.key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const sc = google.searchconsole({ version: "v1", auth });
  let site = args.site;
  if (!site) {
    const sites = await sc.sites.list({});
    const entries = (sites.data.siteEntry || []).filter(
      (s) => /curify-ai\.com/i.test(s.siteUrl) && /(siteOwner|siteFullUser|siteRestrictedUser)/i.test(s.permissionLevel || "")
    );
    site = entries[0].siteUrl;
  }
  console.log(`Site: ${site}    ${args.from} → ${args.to}`);
  fs.mkdirSync(args.outDir, { recursive: true });

  console.log("→ Pages (paginated):");
  const pages = await paginatedPull(sc, site, ["page"], args.from, args.to);
  writeCsv(
    path.join(args.outDir, "Pages-all.csv"),
    ["Page", "Clicks", "Impressions", "CTR", "Position"],
    pages.map((r) => [r.keys[0], r.clicks, r.impressions, (r.ctr * 100).toFixed(2) + "%", r.position.toFixed(1)])
  );

  console.log("→ Queries (paginated):");
  const queries = await paginatedPull(sc, site, ["query"], args.from, args.to);
  writeCsv(
    path.join(args.outDir, "Queries-all.csv"),
    ["Query", "Clicks", "Impressions", "CTR", "Position"],
    queries.map((r) => [r.keys[0], r.clicks, r.impressions, (r.ctr * 100).toFixed(2) + "%", r.position.toFixed(1)])
  );

  console.log(`\n✨ Done — ${args.outDir}/  (${pages.length} pages, ${queries.length} queries)`);
}

main().catch((e) => {
  const msg = e?.errors?.[0]?.message || e?.message || String(e);
  console.error(`❌ ${msg}`);
  process.exit(1);
});
