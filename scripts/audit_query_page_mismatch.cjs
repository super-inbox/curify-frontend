#!/usr/bin/env node
// scripts/audit_query_page_mismatch.cjs
//
// Detects the "wrong page ranks" class of SEO bug: for each GSC query, compare
// the page that ACTUALLY ranked against the page whose title best matches the
// query. A mismatch means our own pages are competing and Google picked the
// weaker one.
//
// This is what surfaced the 2026-09-05 finding: "hsk reading" returned the
// Chinese vocabulary flashcard template instead of the HSK reading template,
// and "mbti naruto" ranked /nano-template/mbti-generic at position 2 while
// /nano-template/mbti-naruto sat invisible. Both pages were indexed,
// self-canonical and correctly titled — nothing in the usual hygiene checks
// would have caught it.
//
// The site title index is built OFFLINE from the repo's own data files, so the
// script runs in seconds, needs no crawling, and reflects whatever branch you
// are on. --probe additionally fetches the ranking page and checks whether the
// BETTER page's text is embedded in it, which turns a correlation into a named
// injection source.
//
// Usage:
//   node scripts/audit_query_page_mismatch.cjs --from=2026-08-04 --to=2026-08-31
//   node scripts/audit_query_page_mismatch.cjs --from=… --to=… --probe=25
//
"use strict";
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const DEFAULT_KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";
const ORIGIN = "https://www.curify-ai.com";
const LOCALES = ["en", "zh", "es", "fr", "de", "ja", "ko", "ru", "hi", "tr"];

// Mirrors the search page's stopword handling. Kept inline because
// lib/searchTokenSplit.ts is TS/ESM and cannot be require()d from a .cjs file —
// same precedent as lib/__tests__/thin_recall_queries.test.ts. Keep in sync.
const STOP = new Set(
  ("a an the for of and to with in on at by from is are how what best free online " +
   "ai generator generate generation create creator make maker prompt prompts " +
   "template templates poster design tool curify").split(" ")
);

function parseArgs() {
  const out = { key: DEFAULT_KEY, from: null, to: null, site: null, outDir: null,
                minImpr: 1, gap: 0.34, floor: 0.67, probe: 0, json: false,
                examples: true };
  for (const a of process.argv.slice(2)) {
    const [k, ...rest] = a.split("=");
    const v = rest.join("=");
    if (k === "--key") out.key = v;
    else if (k === "--from") out.from = v;
    else if (k === "--to") out.to = v;
    else if (k === "--site") out.site = v;
    else if (k === "--out") out.outDir = v;
    else if (k === "--min-impr") out.minImpr = Number(v);
    else if (k === "--gap") out.gap = Number(v);
    else if (k === "--floor") out.floor = Number(v);
    else if (k === "--probe") out.probe = Number(v);
    else if (k === "--json") out.json = true;
    else if (k === "--no-examples") out.examples = false;
  }
  if (!out.from || !out.to) {
    console.error("--from and --to required (YYYY-MM-DD)");
    process.exit(1);
  }
  if (!out.outDir) out.outDir = `raw/query-page-mismatch-${out.to}`;
  return out;
}

async function paginatedPull(sc, site, dimensions, from, to) {
  const all = [];
  const PAGE = 25000;
  let startRow = 0;
  for (;;) {
    const resp = await sc.searchanalytics.query({
      siteUrl: site,
      requestBody: { startDate: from, endDate: to, dimensions, rowLimit: PAGE, startRow },
    });
    const rows = resp.data.rows || [];
    if (!rows.length) break;
    all.push(...rows);
    process.stdout.write(`  [+${rows.length}] total ${all.length}\r`);
    if (rows.length < PAGE) break;
    startRow += PAGE;
  }
  process.stdout.write("\n");
  return all;
}

// ---------------------------------------------------------------- title index

const stripBoilerplate = (t) =>
  String(t || "")
    .replace(/^Nano Banana Prompt:\s*/i, "")
    .replace(/\s*\|\s*Curify (AI|Studio)\s*$/i, "")
    .trim();

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), "utf8"));
}

function buildIndex(withExamples) {
  const idx = new Map(); // route -> { title, aux, kind }
  const add = (route, title, aux, kind) => {
    if (!route || !title) return;
    if (!idx.has(route)) idx.set(route, { title, aux: aux || "", kind });
  };

  const nano = readJson("messages/en/nano.json");
  for (const [k, v] of Object.entries(nano)) {
    if (!v || typeof v !== "object" || !k.startsWith("template-")) continue;
    const slug = k.slice("template-".length);
    add(`/nano-template/${slug}`, stripBoilerplate(v.title || v.category),
        [v.description, v.category].filter(Boolean).join(" "), "template");
  }

  const topics = readJson("messages/en/topics.json").topics || {};
  for (const [slug, v] of Object.entries(topics)) {
    if (!v || typeof v !== "object") continue;
    add(`/topics/${slug}`, stripBoilerplate(v.title || v.displayName),
        [v.description, (v.keywords || []).join(" ")].filter(Boolean).join(" "), "topic");
  }

  for (const b of readJson("public/data/blogs.json")) {
    add(`/blog/${b.slug}`, stripBoilerplate(b.title), b.tag || "", "blog");
  }

  // tools-registry.ts is TS; scrape the slug/namespace pairs rather than
  // compiling it, then take the title from the tool's home.json metadata
  // (feedback_tool_page_metadata_location: `<namespace>.metadata` is the live
  // one; `seo:` and `tools.<key>.meta.*` are dead decoys).
  const reg = fs.readFileSync(path.join(process.cwd(), "lib/tools-registry.ts"), "utf8");
  const home = readJson("messages/en/home.json");
  const slugs = [...reg.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const namespaces = [...reg.matchAll(/namespace:\s*"([^"]+)"/g)].map((m) => m[1]);
  slugs.forEach((slug, i) => {
    const ns = namespaces[i];
    const meta = ns && home[ns] && home[ns].metadata;
    add(`/tools/${slug}`, stripBoilerplate(meta && meta.title) || slug.replace(/-/g, " "),
        (meta && meta.description) || "", "tool");
  });

  // Example pages MUST be indexed. They are the largest impression class on the
  // site, so leaving them out makes every example-page ranking look like a
  // mismatch — the first run of this script reported 189 such false positives.
  if (withExamples) {
    const exI18n = readJson("messages/en/example.json");
    for (const rec of readJson("public/data/nano_inspiration.json")) {
      const id = rec && rec.id;
      const tid = rec && rec.template_id;
      if (!id || !tid) continue;
      const authored = exI18n[id] || {};
      const localeTitle = Object.values(rec.locales || {})[0] || {};
      const title = stripBoilerplate(authored.title || localeTitle.title || "");
      if (!title) continue;
      const slug = tid.replace(/^template-/, "");
      add(`/nano-template/${slug}/example/${id}`, title,
          [authored.description, authored.metaDescription, localeTitle.category,
           Object.values(rec.params || {}).join(" ")].filter(Boolean).join(" "), "example");
    }
  }

  const uc = fs.readFileSync(path.join(process.cwd(), "lib/use-cases.ts"), "utf8");
  for (const m of uc.matchAll(/slug:\s*"([^"]+)"/g)) {
    add(`/use-cases/${m[1]}`, m[1].replace(/-/g, " "), "", "use-case");
  }

  return idx;
}

// ---------------------------------------------------------------- scoring

function tokens(s) {
  const out = new Set();
  for (const w of String(s).toLowerCase().match(/[a-z0-9]+/g) || []) {
    if (w.length > 1 && !STOP.has(w)) out.add(w);
  }
  // CJK:每 character is its own token — matches how the search page treats them.
  for (const ch of String(s).match(/[一-鿿]/g) || []) out.add(ch);
  return out;
}

const coverage = (q, blob) => {
  if (!q.size) return 0;
  let hit = 0;
  for (const t of q) if (blob.has(t)) hit++;
  return hit / q.size;
};

function normalizePage(url) {
  let p = String(url).replace(ORIGIN, "").replace(/^https?:\/\/[^/]+/, "");
  p = p.replace(new RegExp(`^/(${LOCALES.join("|")})(/|$)`), "/");
  return p.replace(/\/$/, "") || "/";
}

// ---------------------------------------------------------------- probe

async function probePage(route, best) {
  try {
    const res = await fetch(ORIGIN + route);
    const html = await res.text();
    const flight = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)]
      .map((m) => { try { return JSON.parse(m[1]); } catch { return ""; } }).join("");
    const markup = html.replace(/<script[\s\S]*?<\/script>/g, "");
    const needle = best.title.slice(0, 40);
    const auxNeedle = (best.aux || "").slice(0, 60);
    return [
      markup.includes(needle) ? "title-in-markup" : "",
      flight.includes(needle) ? "title-in-payload" : "",
      auxNeedle && markup.includes(auxNeedle) ? "desc-in-markup" : "",
      auxNeedle && flight.includes(auxNeedle) ? "desc-in-payload" : "",
    ].filter(Boolean).join("+") || "none";
  } catch (e) {
    return `error:${e.message}`;
  }
}

// ---------------------------------------------------------------- main

function writeCsv(filePath, header, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  fs.writeFileSync(filePath, [header.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n") + "\n");
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
      (s) => /curify-ai\.com/i.test(s.siteUrl) &&
             /(siteOwner|siteFullUser|siteRestrictedUser)/i.test(s.permissionLevel || "")
    );
    if (!entries.length) throw new Error("no curify-ai.com property on this service account");
    site = entries[0].siteUrl;
  }
  console.log(`Site: ${site}    ${args.from} → ${args.to}`);

  const idx = buildIndex(args.examples);
  const scored = [...idx.entries()].map(([route, v]) => ({
    route, ...v, t: tokens(v.title), a: tokens(`${v.title} ${v.aux}`),
  }));
  console.log(`Title index: ${scored.length} URLs ` +
    Object.entries(scored.reduce((m, x) => ((m[x.kind] = (m[x.kind] || 0) + 1), m), {}))
      .map(([k, n]) => `${k}=${n}`).join(" "));

  console.log("→ query×page (paginated):");
  const rows = await paginatedPull(sc, site, ["query", "page"], args.from, args.to);

  const ranked = new Set(rows.map((r) => normalizePage(r.keys[1])));
  const byRoute = new Map(scored.map((x) => [x.route, x]));
  const unindexed = new Set();
  const findings = [];

  for (const r of rows) {
    const [query, page] = r.keys;
    if (r.impressions < args.minImpr) continue;
    const route = normalizePage(page);
    const q = tokens(query);
    if (!q.size) continue;

    // A page missing from the index cannot be scored, so any candidate would
    // "beat" it. That is an index gap, not a mismatch — count it and move on.
    const actual = byRoute.get(route);
    if (!actual) { unindexed.add(route); continue; }
    const actualScore = coverage(q, actual.t);

    let best = null, bestScore = -1;
    for (const cand of scored) {
      const s = coverage(q, cand.t);
      if (s > bestScore || (s === bestScore && best && cand.title.length < best.title.length)) {
        best = cand; bestScore = s;
      }
    }
    if (!best || best.route === route) continue;
    if (bestScore - actualScore < args.gap) continue;
    // The rival must actually answer the query, not just share one token with
    // it. At 0.5 a two-token query matched on either half, which produced
    // "lipsync model" -> a jewellery "on-model" example and "multilingual
    // subtitling" -> a multilingual vocabulary poster. 0.67 forces both tokens
    // of a two-token query. Lower it with --floor to trade precision for
    // recall.
    if (bestScore < args.floor) continue;
    // Single-token queries are too weak to adjudicate on titles alone.
    if (q.size < 2) continue;

    const cls = ranked.has(best.route) ? "RIVAL_INDEXED" : "RIVAL_UNRANKED";

    findings.push({
      query, impressions: r.impressions, clicks: r.clicks,
      ctr: (r.ctr * 100).toFixed(2) + "%", position: r.position.toFixed(1),
      actual_url: route, actual_title: actual ? actual.title : "(not in index)",
      actual_score: actualScore.toFixed(2),
      best_url: best.route, best_title: best.title, best_score: bestScore.toFixed(2),
      gap: (bestScore - actualScore).toFixed(2), class: cls, probe_leak: "",
    });
  }

  findings.sort((a, b) => b.impressions - a.impressions);

  if (args.probe > 0) {
    console.log(`→ probing top ${Math.min(args.probe, findings.length)} findings for embedded rival text`);
    for (const f of findings.slice(0, args.probe)) {
      const best = scored.find((x) => x.route === f.best_url);
      f.probe_leak = await probePage(f.actual_url, best);
    }
  }

  fs.mkdirSync(args.outDir, { recursive: true });
  const header = ["query", "impressions", "clicks", "ctr", "position", "actual_url",
    "actual_title", "actual_score", "best_url", "best_title", "best_score", "gap",
    "class", "probe_leak"];
  writeCsv(path.join(args.outDir, "mismatches.csv"), header,
    findings.map((f) => header.map((h) => f[h])));

  // Cannibal leaderboard: which URLs keep outranking a better title-match.
  const cannibal = {};
  for (const f of findings) {
    if (f.class !== "RIVAL_INDEXED") continue;
    const c = (cannibal[f.actual_url] ||= { n: 0, impr: 0, victims: new Set() });
    c.n++; c.impr += f.impressions; c.victims.add(f.best_url);
  }
  const board = Object.entries(cannibal).sort((a, b) => b[1].n - a[1].n).slice(0, 30);
  const byClass = findings.reduce((m, f) => ((m[f.class] = (m[f.class] || 0) + 1), m), {});

  const md = [
    `# Query → page mismatch — ${args.from} → ${args.to}`, "",
    `Rows pulled: ${rows.length}. Findings: ${findings.length} ` +
      `(gap ≥ ${args.gap}, rival coverage ≥ ${args.floor}, ≥2 query tokens, ` +
      `min impressions ${args.minImpr}). ${unindexed.size} ranking URLs were not in ` +
      `the title index and were skipped rather than reported.`, "",
    "| class | count | meaning |", "|---|---:|---|",
    `| RIVAL_INDEXED | ${byClass.RIVAL_INDEXED || 0} | a better-titled page of ours also ranks — relevance bleed |`,
    `| RIVAL_UNRANKED | ${byClass.RIVAL_UNRANKED || 0} | the better page is invisible — linking/authority |`,
    "",
    "## Cannibal leaderboard", "",
    "URLs ranked by how often they outrank a better title-match.", "",
    "| # | url | findings | impressions | distinct pages outranked |", "|---:|---|---:|---:|---:|",
    ...board.map(([u, c], i) => `| ${i + 1} | \`${u}\` | ${c.n} | ${c.impr} | ${c.victims.size} |`),
    "", "## Top findings by impressions", "",
    "| query | impr | pos | ranked | should be | gap | class | probe |", "|---|---:|---:|---|---|---:|---|---|",
    ...findings.slice(0, 30).map((f) =>
      `| ${f.query} | ${f.impressions} | ${f.position} | \`${f.actual_url}\` | \`${f.best_url}\` | ${f.gap} | ${f.class} | ${f.probe_leak || "—"} |`),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(args.outDir, "summary.md"), md);

  if (args.json) console.log(JSON.stringify(findings, null, 1));
  console.log(`\n✨ ${findings.length} findings → ${args.outDir}/`);
  console.log(`   ${Object.entries(byClass).map(([k, n]) => `${k}=${n}`).join("  ")}`);
  if (unindexed.size) console.log(`   (${unindexed.size} ranking URLs not in the title index — skipped)`);
  if (board.length) {
    console.log("   top cannibals:");
    for (const [u, c] of board.slice(0, 5)) console.log(`     ${String(c.n).padStart(3)}×  ${u}`);
  }
}

main().catch((e) => {
  console.error(`❌ ${e?.errors?.[0]?.message || e?.message || String(e)}`);
  process.exit(1);
});
