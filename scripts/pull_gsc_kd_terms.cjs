#!/usr/bin/env node
// scripts/pull_gsc_kd_terms.cjs
//
// Non-ASL commercial SEO readout: joins the transcribed Semrush KD list
// (data/seo/kd_terms.csv) against Google Search Console query x page rows,
// for web AND image search, over two windows (current vs previous).
//
// Read-only (webmasters.readonly). Auth + site detection mirror
// scripts/pull_gsc_performance.cjs; 25k-row pagination mirrors
// scripts/audit_gsc_full.cjs.
//
// Usage:
//   node scripts/pull_gsc_kd_terms.cjs
//   node scripts/pull_gsc_kd_terms.cjs --from=2026-08-29 --to=2026-09-25 \
//        --prev-from=2026-08-01 --prev-to=2026-08-28 --out=raw/gsc-kd-2026-09-29
//
// Outputs (in --out):
//   kd_terms_gsc.csv             one row per KD term x search type (web|image), contains-all-tokens
//                                match + exact-match columns, current vs previous window
//   site_totals.csv              property totals + non-ASL / ASL split (page dimension), both windows
//   uncovered_commercial_queries_{web,image}.csv
//                                top 30 non-ASL queries with a commercial modifier that no KD
//                                term covers (demand not yet sized)
//   striking_distance_{web,image}.csv
//                                non-ASL query x page rows at position 8-20 with >= 20 impressions
//   summary.json                 run metadata + headline numbers
//
// ASL is excluded everywhere (pages by path regex, queries by term regex) and
// reported separately only as a contrast total.

"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const DEFAULT_KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";
const KD_CSV = path.join(__dirname, "..", "data", "seo", "kd_terms.csv");
const TYPES = ["web", "image"];

// Path-level ASL exclusion. Broader than a literal "/asl" prefix so that
// "/blog/asl-..." and "/blog/learn-sign-language-..." are both caught.
const ASL_PAGE_RE = /(^|\/|-)asl(-|\/|$)|sign-language|asl-video-translator|\/topics\/asl/i;
// Query-level ASL exclusion. Bare "signos" is deliberately NOT used: it also
// matches "signos del zodiaco" (zodiac), which is personality traffic, not ASL.
const ASL_QUERY_RE = new RegExp(
  [
    "\\basl\\b", "sign language", "signlanguage", "fingerspell",
    "lengua de señas", "lenguaje de señas", "lengua de senas", "lenguaje de senas", "señas",
    "lengua de signos", "lenguaje de signos", "língua de sinais", "lingua de sinais", "libras\\b",
    "lingua dei segni", "langue des signes", "langage des signes", "gebärdensprache", "gebardensprache",
    "gebaerdensprache", "手语", "手語", "手話", "수어", "수화", "язык жестов", "жестовый язык",
  ].join("|"),
  "i"
);

const COMMERCIAL_MODIFIERS = [
  "generator", "maker", "tool", "tools", "software", "service", "services", "ai",
  "template", "templates", "mockup", "mockups", "editing", "online", "free", "best", "app",
];
const MODIFIER_RE = new RegExp(`(^|[^\\p{L}\\p{N}])(${COMMERCIAL_MODIFIERS.join("|")})([^\\p{L}\\p{N}]|$)`, "iu");

// Navigational / misspelt-brand queries are not unsized demand.
const BRAND_RE = /\b(curify|kirify|ctrify|curi)\b/i;

function parseArgs() {
  const out = {
    key: DEFAULT_KEY,
    site: null,
    from: "2026-08-29",
    to: "2026-09-25",
    prevFrom: "2026-08-01",
    prevTo: "2026-08-28",
    outDir: "raw/gsc-kd-2026-09-29",
    dumpRows: true,
  };
  for (const a of process.argv.slice(2)) {
    const v = a.split("=").slice(1).join("=");
    if (a.startsWith("--key=")) out.key = v;
    else if (a.startsWith("--site=")) out.site = v;
    else if (a.startsWith("--from=")) out.from = v;
    else if (a.startsWith("--to=")) out.to = v;
    else if (a.startsWith("--prev-from=")) out.prevFrom = v;
    else if (a.startsWith("--prev-to=")) out.prevTo = v;
    else if (a.startsWith("--out=")) out.outDir = v;
    else if (a === "--no-dump") out.dumpRows = false;
  }
  return out;
}

// ---------- CSV helpers ----------
function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function writeCsv(p, headers, rows) {
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(r.map(csvCell).join(","));
  fs.writeFileSync(p, lines.join("\n") + "\n", "utf-8");
}
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [h, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""])));
}

// ---------- URL / query helpers ----------
function urlPath(u) {
  try { return new URL(u).pathname; } catch { return u; }
}
// Strip a leading locale segment (/zh, /es, /pt-BR, /zh-Hant ...) for target comparison.
function normPath(u) {
  let p = urlPath(u).replace(/^\/[a-z]{2}(-[A-Za-z]{2,4})?(?=\/|$)/, "");
  if (p.length > 1) p = p.replace(/\/$/, "");
  return p || "/";
}
const isAslPage = (u) => ASL_PAGE_RE.test(urlPath(u));
const isAslQuery = (q) => ASL_QUERY_RE.test(q);
const tokens = (k) => k.toLowerCase().split(/\s+/).filter(Boolean);
const matchesAll = (q, toks) => toks.every((t) => q.includes(t));

// ---------- GSC ----------
async function paginatedPull(sc, site, body) {
  const all = [];
  const PAGE = 25000;
  let startRow = 0;
  while (true) {
    const resp = await sc.searchanalytics.query({
      siteUrl: site,
      requestBody: { ...body, rowLimit: PAGE, startRow },
    });
    const rows = resp.data.rows || [];
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < PAGE) break;
    startRow += PAGE;
  }
  return all;
}

function agg(rows) {
  let impr = 0, clicks = 0, posW = 0;
  for (const r of rows) { impr += r.impressions; clicks += r.clicks; posW += r.position * r.impressions; }
  return { impr, clicks, ctr: impr ? clicks / impr : 0, pos: impr ? posW / impr : null };
}
function topPage(rows) {
  const by = new Map();
  for (const r of rows) {
    const p = r.keys[1];
    const e = by.get(p) || { impr: 0, clicks: 0 };
    e.impr += r.impressions; e.clicks += r.clicks;
    by.set(p, e);
  }
  let best = null;
  for (const [p, e] of by) if (!best || e.impr > best.impr || (e.impr === best.impr && e.clicks > best.clicks)) best = { page: p, ...e };
  return { top: best, pages: by };
}
const f1 = (x) => (x == null ? "" : x.toFixed(1));
const pct = (x) => (x * 100).toFixed(2) + "%";

async function main() {
  const args = parseArgs();
  if (!fs.existsSync(args.key)) {
    console.error(`Key file not found: ${args.key}`);
    process.exit(1);
  }
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
    if (!entries.length) {
      console.error("No curify-ai.com property visible to this service account.");
      process.exit(1);
    }
    site = entries[0].siteUrl;
  }
  const windows = { cur: [args.from, args.to], prev: [args.prevFrom, args.prevTo] };
  console.log(`Site: ${site}   cur ${args.from}→${args.to}   prev ${args.prevFrom}→${args.prevTo}`);
  fs.mkdirSync(args.outDir, { recursive: true });

  const kd = parseCsv(fs.readFileSync(KD_CSV, "utf-8")).map((t) => ({
    ...t,
    toks: tokens(t.keyword),
    targets: t.target_page ? t.target_page.split("|").map((s) => normPath(s.trim())) : [],
  }));

  // data[type][win] = { qp: [...query x page rows], pages: [...page rows], total: {...} }
  const data = {};
  for (const type of TYPES) {
    data[type] = {};
    for (const [win, [from, to]] of Object.entries(windows)) {
      const base = { startDate: from, endDate: to, type };
      console.log(`→ ${type} ${win}: query x page`);
      const qp = await paginatedPull(sc, site, { ...base, dimensions: ["query", "page"] });
      console.log(`   ${qp.length} rows; page dimension`);
      const pages = await paginatedPull(sc, site, { ...base, dimensions: ["page"] });
      const totRows = await paginatedPull(sc, site, { ...base, dimensions: [] });
      const total = totRows[0] ? { impr: totRows[0].impressions, clicks: totRows[0].clicks, pos: totRows[0].position } : { impr: 0, clicks: 0, pos: null };
      data[type][win] = { qp, pages, total };
      if (args.dumpRows) {
        writeCsv(
          path.join(args.outDir, `query_page_${type}_${win}.csv`),
          ["query", "page", "clicks", "impressions", "position", "asl"],
          qp.map((r) => [r.keys[0], r.keys[1], r.clicks, r.impressions, r.position.toFixed(2), isAslPage(r.keys[1]) || isAslQuery(r.keys[0]) ? 1 : 0])
        );
      }
    }
  }

  const nonAsl = (rows) => rows.filter((r) => !isAslPage(r.keys[1]) && !isAslQuery(r.keys[0]));

  // ---------- site totals ----------
  const totalsRows = [];
  const summary = { site, windows, generated: new Date().toISOString(), totals: {}, terms: {} };
  for (const type of TYPES) {
    for (const win of ["cur", "prev"]) {
      const d = data[type][win];
      const aslP = agg(d.pages.filter((r) => isAslPage(r.keys[0])));
      const nonP = agg(d.pages.filter((r) => !isAslPage(r.keys[0])));
      const qpAll = agg(d.qp);
      const qpNon = agg(nonAsl(d.qp));
      const t = {
        property_impr: d.total.impr, property_clicks: d.total.clicks, property_pos: d.total.pos,
        nonasl_pages_impr: nonP.impr, nonasl_pages_clicks: nonP.clicks, nonasl_pages_pos: nonP.pos,
        asl_pages_impr: aslP.impr, asl_pages_clicks: aslP.clicks, asl_pages_pos: aslP.pos,
        qp_rows: d.qp.length, qp_impr: qpAll.impr, qp_clicks: qpAll.clicks,
        qp_nonasl_impr: qpNon.impr, qp_nonasl_clicks: qpNon.clicks,
      };
      summary.totals[`${type}_${win}`] = t;
      totalsRows.push([type, win, ...windows[win], ...Object.values(t).map((v) => (typeof v === "number" && !Number.isInteger(v) ? v.toFixed(2) : v))]);
    }
  }
  writeCsv(
    path.join(args.outDir, "site_totals.csv"),
    ["type", "window", "from", "to", "property_impr", "property_clicks", "property_pos",
      "nonasl_pages_impr", "nonasl_pages_clicks", "nonasl_pages_pos", "asl_pages_impr", "asl_pages_clicks", "asl_pages_pos",
      "qp_rows", "qp_impr", "qp_clicks", "qp_nonasl_impr", "qp_nonasl_clicks"],
    totalsRows
  );

  // ---------- per KD term ----------
  const termRows = [];
  for (const t of kd) {
    for (const type of TYPES) {
      const cur = nonAsl(data[type].cur.qp);
      const prev = nonAsl(data[type].prev.qp);
      const kw = t.keyword.toLowerCase();
      const mc = cur.filter((r) => matchesAll(r.keys[0].toLowerCase(), t.toks));
      const mp = prev.filter((r) => matchesAll(r.keys[0].toLowerCase(), t.toks));
      const ec = cur.filter((r) => r.keys[0].toLowerCase() === kw);
      const ep = prev.filter((r) => r.keys[0].toLowerCase() === kw);
      const a = agg(mc), b = agg(mp), ea = agg(ec), eb = agg(ep);
      const { top, pages } = topPage(mc);
      const eTop = topPage(ec).top;
      let targetImpr = 0, targetPosW = 0;
      for (const r of mc) if (t.targets.includes(normPath(r.keys[1]))) { targetImpr += r.impressions; targetPosW += r.position * r.impressions; }
      const topNorm = top ? normPath(top.page) : "";
      const targetMatch = !t.target_page ? "" : !top ? "" : t.targets.includes(topNorm) ? "yes" : "no";
      const distinctQueries = new Set(mc.map((r) => r.keys[0])).size;
      termRows.push([
        t.keyword, type, t.commercial, t.kd, t.volume, t.cpc, t.target_page,
        a.impr, a.clicks, a.impr ? pct(a.ctr) : "", f1(a.pos), distinctQueries, pages.size,
        top ? top.page : "", top ? top.impr : "", targetMatch, targetImpr, targetImpr ? f1(targetPosW / targetImpr) : "",
        b.impr, b.clicks, f1(b.pos), a.impr - b.impr, a.pos != null && b.pos != null ? (a.pos - b.pos).toFixed(1) : "",
        ea.impr, ea.clicks, f1(ea.pos), eTop ? eTop.page : "", eb.impr, f1(eb.pos),
      ]);
      if (a.impr || b.impr) summary.terms[`${t.keyword}|${type}`] = { impr: a.impr, clicks: a.clicks, pos: a.pos, prev_impr: b.impr, top: top && top.page, targetMatch };
    }
  }
  writeCsv(
    path.join(args.outDir, "kd_terms_gsc.csv"),
    ["keyword", "type", "commercial", "kd", "volume", "cpc", "target_page",
      "impr", "clicks", "ctr", "avg_pos_w", "distinct_queries", "distinct_pages",
      "top_page", "top_page_impr", "top_is_target", "target_impr", "target_pos_w",
      "prev_impr", "prev_clicks", "prev_pos_w", "delta_impr", "delta_pos",
      "exact_impr", "exact_clicks", "exact_pos", "exact_top_page", "exact_prev_impr", "exact_prev_pos"],
    termRows
  );

  // ---------- uncovered commercial demand + striking distance ----------
  for (const type of TYPES) {
    const cur = nonAsl(data[type].cur.qp);
    const byQ = new Map();
    for (const r of cur) {
      const q = r.keys[0];
      const e = byQ.get(q) || { rows: [] };
      e.rows.push(r);
      byQ.set(q, e);
    }
    const unc = [];
    for (const [q, e] of byQ) {
      const ql = q.toLowerCase();
      if (!MODIFIER_RE.test(ql)) continue;
      if (/^site:|\binurl:/.test(ql) || BRAND_RE.test(ql)) continue; // operators + navigational brand queries
      if (kd.some((t) => matchesAll(ql, t.toks))) continue;
      const a = agg(e.rows);
      const { top } = topPage(e.rows);
      unc.push([q, a.impr, a.clicks, pct(a.ctr), f1(a.pos), top.page, e.rows.length]);
    }
    unc.sort((x, y) => y[1] - x[1] || y[2] - x[2]);
    writeCsv(path.join(args.outDir, `uncovered_commercial_queries_${type}.csv`),
      ["query", "impr", "clicks", "ctr", "avg_pos_w", "top_page", "pages"], unc.slice(0, 30));
    summary[`uncovered_${type}_count`] = unc.length;

    const sd = cur
      .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 20)
      .sort((x, y) => y.impressions - x.impressions)
      .map((r) => [r.keys[0], r.keys[1], r.impressions, r.clicks, pct(r.ctr), r.position.toFixed(1)]);
    writeCsv(path.join(args.outDir, `striking_distance_${type}.csv`), ["query", "page", "impr", "clicks", "ctr", "pos"], sd);
    summary[`striking_${type}_count`] = sd.length;
  }

  fs.writeFileSync(path.join(args.outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(`Done → ${args.outDir}`);
  for (const [k, v] of Object.entries(summary.totals)) {
    console.log(`  ${k}: property ${v.property_clicks}c/${v.property_impr}i | non-ASL pages ${v.nonasl_pages_clicks}c/${v.nonasl_pages_impr}i | ASL pages ${v.asl_pages_clicks}c/${v.asl_pages_impr}i`);
  }
}

main().catch((e) => {
  console.error("FAILED:", e && e.message ? e.message : e);
  if (e && e.response && e.response.data) console.error(JSON.stringify(e.response.data));
  process.exit(1);
});
