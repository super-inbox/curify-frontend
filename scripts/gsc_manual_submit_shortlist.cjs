#!/usr/bin/env node
/**
 * @file gsc_manual_submit_shortlist.cjs
 * @description Rank high-value pages for MANUAL "Request Indexing" in GSC.
 *
 * There is no API for Request Indexing -- the Indexing API is only officially
 * honoured for JobPosting/BroadcastEvent, and our own 08-25 read showed pinging
 * it did nothing (29 of 34 pinged blogs were still un-recrawled 15 days later).
 * The supported path is the GSC UI at roughly 10 URLs/day, so the scarce
 * resource is OPERATOR ATTENTION and the job of this script is to make sure no
 * slot is wasted.
 *
 * A submission is wasted if the page is already indexed, or if it is unhealthy
 * in a way that guarantees Google re-folds it on arrival: non-200, noindex, or
 * a canonical pointing somewhere else (our recurring failure mode -- 43% of
 * blogs were folded to the homepage canonical, and dedicated blog route folders
 * silently ship the blog-INDEX title). So every candidate is checked BOTH ways:
 * GSC's own coverage verdict, and what the live page actually serves right now.
 *
 *   node scripts/gsc_manual_submit_shortlist.cjs [--limit 10]
 */
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const R = path.join(__dirname, "..");
const BASE = "https://www.curify-ai.com";
const KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";
const OUT = path.join(R, "raw", "gsc-manual-submit-shortlist.txt");

// Strategic weight. Tool + workflow surfaces are the tool-intent gap (89% of
// tool-intent impressions are currently served by /blog/*), so they outrank
// generic topic hubs.
const CANDIDATES = [];
const add = (url, tier, why) => CANDIDATES.push({ url, tier, why });

const toolsSrc = fs.readFileSync(`${R}/lib/tools-registry.ts`, "utf8");
const toolSlugs = [...toolsSrc.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map(m => m[1]);
for (const s of toolSlugs) add(`${BASE}/tools/${s}`, 1, "tool page (tool-intent surface)");
add(`${BASE}/tools`, 1, "tools index (links to every tool)");

const WORKFLOW_TOPICS = ["merch", "product", "brand", "packaging", "edtech", "stickers"];
for (const t of WORKFLOW_TOPICS) add(`${BASE}/topics/${t}`, 2, "workflow topic hub");

const tax = JSON.parse(fs.readFileSync(`${R}/lib/taxonomy.json`, "utf8"));
const tier1 = Array.isArray(tax.tier1) ? tax.tier1 : Object.keys(tax.tier1);
for (const t of tier1) if (!WORKFLOW_TOPICS.includes(t)) add(`${BASE}/topics/${t}`, 3, "tier-1 topic hub");

for (const s of ["ai-product-photo-to-ecommerce-listing", "50-wimbledon-2026-ai-prompts"])
  add(`${BASE}/blog/${s}`, 2, "blog fixed 08-25 (was rendering raw i18n keys)");
for (const s of ["mbti-character-generator", "best-claude-code-design-skills", "character-turnaround-sheet-guide"])
  add(`${BASE}/blog/${s}`, 2, "recently written/improved blog");

const limit = Number((process.argv.find(a => a.startsWith("--limit=")) || "--limit=10").split("=")[1]);
const strip = u => (u || "").replace(BASE, "") || "/";

async function live(url) {
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (compatible; curify-seo-check)" } });
    if (res.status >= 300 && res.status < 400) return { status: res.status, redirect: res.headers.get("location") };
    const html = await res.text();
    const grab = re => (html.match(re) || [, ""])[1];
    return {
      status: res.status,
      canonical: grab(/<link rel="canonical" href="([^"]+)"/),
      robots: grab(/<meta name="robots" content="([^"]+)"/),
      title: grab(/<title>([^<]*)<\/title>/),
    };
  } catch (e) { return { status: 0, error: String(e.message || e) }; }
}

(async () => {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY, scopes: ["https://www.googleapis.com/auth/webmasters"] });
  const sc = google.searchconsole({ version: "v1", auth });
  const rows = [];
  for (const c of CANDIDATES) {
    let insp = {};
    try {
      const r = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: c.url, siteUrl: "sc-domain:curify-ai.com", languageCode: "en-US" },
      });
      insp = r.data.inspectionResult?.indexStatusResult || {};
    } catch (e) { insp = { coverageState: `ERROR: ${String(e.message || e).slice(0, 60)}` }; }
    const L = await live(c.url);
    const cov = insp.coverageState || "?";
    const indexed = /Submitted and indexed|URL is on Google/i.test(cov) || insp.verdict === "PASS";
    // An ABSENT canonical is not a self-canonical. Treating it as one is how
    // the first run of this script cleared two pages Google had already folded
    // to the homepage.
    const selfCanon = !!L.canonical && strip(L.canonical) === strip(c.url);
    const noindex = /noindex/i.test(L.robots || "");
    const blockers = [];
    if (L.status !== 200) blockers.push(L.status >= 300 && L.status < 400 ? `redirects -> ${strip(L.redirect)}` : `HTTP ${L.status}`);
    if (noindex) blockers.push("noindex");
    if (!selfCanon) blockers.push(L.canonical ? `canonical -> ${strip(L.canonical)}` : "no canonical emitted");
    // Google folded this URL onto a DIFFERENT canonical of its own choosing,
    // despite our self-canonical being correct and in-head. That is duplicate
    // DETECTION, not a markup error, and Request Indexing does not override it
    // -- 29 of 34 pinged blogs sat un-recrawled for 15 days. Spending a manual
    // slot here buys nothing until the near-duplicate root cause is fixed (the
    // 1.6MB i18n catalog in layout.tsx; see project_blog_canonical_fold).
    const foldedElsewhere = insp.googleCanonical && strip(insp.googleCanonical) !== strip(c.url);
    if (foldedElsewhere) blockers.push(`Google folded -> ${strip(insp.googleCanonical)} (duplicate detection, not markup)`);
    rows.push({ ...c, cov, indexed, blockers, googleCanonical: strip(insp.googleCanonical),
      lastCrawl: (insp.lastCrawlTime || "NEVER").slice(0, 10), title: (L.title || "").slice(0, 70) });
    process.stderr.write(`  ${rows.length}/${CANDIDATES.length}\r`);
  }
  process.stderr.write("\n");

  const submit = rows.filter(r => !r.indexed && r.blockers.length === 0)
    .sort((a, b) => a.tier - b.tier || (a.lastCrawl === "NEVER" ? -1 : 1) - (b.lastCrawl === "NEVER" ? -1 : 1));
  const broken = rows.filter(r => !r.indexed && r.blockers.length > 0);
  const done = rows.filter(r => r.indexed);

  const L = [];
  L.push(`GSC manual Request-Indexing shortlist — generated ${new Date().toISOString().slice(0, 10)}`);
  L.push(`inspected ${rows.length} candidates: ${done.length} already indexed, ${submit.length} ready, ${broken.length} blocked\n`);
  L.push(`=== SUBMIT THESE (top ${limit}, paste into GSC URL Inspection -> Request Indexing) ===`);
  submit.slice(0, limit).forEach((r, i) => L.push(`${String(i + 1).padStart(2)}. ${r.url}\n      ${r.cov} | last crawl ${r.lastCrawl} | ${r.why}`));
  if (submit.length > limit) {
    L.push(`\n=== QUEUE FOR FOLLOWING DAYS (${submit.length - limit} more, ~10/day) ===`);
    submit.slice(limit).forEach((r, i) => L.push(`${String(i + 1 + limit).padStart(3)}. ${r.url}  [${r.cov}]`));
  }
  if (broken.length) {
    L.push(`\n=== DO NOT SUBMIT — fix first, Google will just re-fold these (${broken.length}) ===`);
    broken.forEach(r => L.push(`  ${strip(r.url)}\n      blockers: ${r.blockers.join("; ")}\n      GSC: ${r.cov}`));
  }
  L.push(`\n=== ALREADY INDEXED — no action (${done.length}) ===`);
  done.forEach(r => L.push(`  ${strip(r.url)}  [${r.cov}, crawled ${r.lastCrawl}]`));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, L.join("\n") + "\n");
  console.log(L.join("\n"));
  console.log(`\n  written: raw/gsc-manual-submit-shortlist.txt`);
})();
