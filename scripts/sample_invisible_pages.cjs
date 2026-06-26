#!/usr/bin/env node
// scripts/sample_invisible_pages.cjs
//
// W1.7 — Technical hygiene pre-audit (gate on Wedge 1 indexation rescue).
//
// Samples N URLs from each "invisible" page family (in sitemap but NOT
// in GSC after 28 days) and checks each for:
//   1. HTTP status (200 / 3xx / 4xx / 5xx)
//   2. <meta name="robots"> noindex
//   3. <link rel="canonical"> — does it point to self, elsewhere, or
//      elsewhere on the same domain (a sign of canonical collapse)
//   4. X-Robots-Tag response header
//
// Output: per-family rates of each blocker. If any family is >10%
// blocked, fix THAT before pumping internal links at it.
//
// Inputs:
//   /tmp/curify_sitemap_audit/all_urls.txt  (from sitemap fetch)
//   raw/gsc-audit-2026-06-26/Pages-all.csv  (from audit_gsc_full.cjs)
//
// Usage:
//   node scripts/sample_invisible_pages.cjs --sample=40 --out=raw/gsc-audit-2026-06-26/hygiene-2026-06-26.json

"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");
const { URL } = require("url");

function parseArgs() {
  const out = { sample: 40, out: null };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--sample=")) out.sample = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--out=")) out.out = a.split("=")[1];
  }
  if (!out.out) {
    out.out = `raw/gsc-audit-2026-06-26/hygiene-${new Date().toISOString().slice(0,10)}.json`;
  }
  return out;
}

function classify(url) {
  const u = new URL(url);
  const path = u.pathname;
  const m = path.match(/^\/([a-z]{2})\//);
  const locale = m ? m[1] : "en";
  const rest = m ? path.slice(3) : path;
  if (rest.startsWith("/nano-template/")) {
    if (rest.includes("/example/")) return { family: "nano_template_example", locale };
    if (rest.includes("/carousel/")) return { family: "nano_template_carousel", locale };
    return { family: "nano_template_index", locale };
  }
  if (rest.startsWith("/nano-banana-pro-prompts/")) return { family: "nano_banana_prompt", locale };
  if (rest.startsWith("/topics/")) return { family: "topic_hub", locale };
  if (rest.startsWith("/blog/")) return { family: "blog", locale };
  if (rest.startsWith("/tools/")) return { family: "tool", locale };
  if (rest.startsWith("/use-cases/")) return { family: "use_case", locale };
  if (rest === "" || rest === "/") return { family: "home", locale };
  return { family: "other", locale };
}

function fetchUrl(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (val) => { if (!settled) { settled = true; resolve(val); } };

    // HARD timeout wrapper: race against a setTimeout. The previous
    // implementation used req.timeout, which only fires on idle socket
    // — a slow keep-alive response can hang past that. This guarantees
    // we move on after timeoutMs no matter what the socket does.
    const hardTimer = setTimeout(() => {
      try { req && req.destroy(); } catch (_) {}
      settle({ status: 0, body: "", xRobots: "", error: "hard_timeout" });
    }, timeoutMs);

    let u;
    try { u = new URL(url); }
    catch (_) {
      clearTimeout(hardTimer);
      return settle({ status: 0, body: "", xRobots: "", error: "bad_url" });
    }

    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CurifyHygieneAudit/1.0)",
        "Accept": "text/html",
      },
      timeout: timeoutMs,
    }, (res) => {
      let body = "";
      const xRobots = res.headers["x-robots-tag"] || "";
      const status = res.statusCode || 0;
      let bytes = 0;
      res.on("data", (chunk) => {
        if (bytes < 30000) {
          body += chunk.toString("utf8");
          bytes += chunk.length;
        }
        // Cut the response after we have enough to find canonical+robots
        // (both are in <head>) — saves time on huge HTML pages.
        if (bytes >= 30000) {
          res.destroy();
        }
      });
      res.on("end", () => {
        clearTimeout(hardTimer);
        settle({ status, body, xRobots });
      });
      res.on("close", () => {
        clearTimeout(hardTimer);
        settle({ status, body, xRobots });
      });
      res.on("error", () => {
        clearTimeout(hardTimer);
        settle({ status, body, xRobots, error: "response_error" });
      });
    });
    req.on("error", () => {
      clearTimeout(hardTimer);
      settle({ status: 0, body: "", xRobots: "", error: "network" });
    });
    req.on("timeout", () => {
      try { req.destroy(); } catch (_) {}
      clearTimeout(hardTimer);
      settle({ status: 0, body: "", xRobots: "", error: "timeout" });
    });
    req.end();
  });
}

function extract(html) {
  // Crude but fast — meta robots and canonical can be detected without a parser
  const robotsMeta = (html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i) || [])[1] || "";
  const canonical = (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || [])[1] || "";
  return { robotsMeta, canonical };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadSitemap() {
  const txt = fs.readFileSync("/tmp/curify_sitemap_audit/all_urls.txt", "utf8");
  return txt.split("\n").map((s) => s.trim()).filter(Boolean);
}

function loadGscPages() {
  const csv = fs.readFileSync(
    path.join(__dirname, "..", "raw", "gsc-audit-2026-06-26", "Pages-all.csv"),
    "utf8"
  );
  const lines = csv.split("\n").slice(1); // skip header
  const set = new Set();
  for (const line of lines) {
    const cols = line.split(",");
    if (cols[0]) set.add(cols[0]);
  }
  return set;
}

async function pAll(items, concurrency, worker) {
  const results = new Array(items.length);
  let idx = 0;
  async function run() {
    while (true) {
      const cur = idx++;
      if (cur >= items.length) return;
      results[cur] = await worker(items[cur], cur);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function main() {
  const args = parseArgs();
  console.log(`W1.7 hygiene audit — sample=${args.sample}/family, out=${args.out}`);

  const sitemap = new Set(loadSitemap());
  const gsc = loadGscPages();
  console.log(`sitemap: ${sitemap.size}    GSC pages: ${gsc.size}`);

  // Build invisible set = sitemap − GSC
  const invisibleByFamily = {};
  for (const url of sitemap) {
    if (gsc.has(url)) continue;
    const { family, locale } = classify(url);
    if (!invisibleByFamily[family]) invisibleByFamily[family] = [];
    invisibleByFamily[family].push({ url, locale });
  }

  // Stratified sample per family. Spread across locales when possible.
  const samples = [];
  for (const [family, urls] of Object.entries(invisibleByFamily)) {
    if (family === "home" || family === "other") continue;
    const shuffled = shuffle(urls);
    const take = Math.min(args.sample, shuffled.length);
    for (let i = 0; i < take; i++) samples.push({ family, ...shuffled[i] });
  }
  console.log(`sampled ${samples.length} URLs across ${Object.keys(invisibleByFamily).length} families`);

  // Fetch with concurrency=8
  const results = await pAll(samples, 8, async (s, i) => {
    if (i % 25 === 0) console.log(`  ${i}/${samples.length}`);
    const res = await fetchUrl(s.url);
    const { robotsMeta, canonical } = extract(res.body);
    let canonicalBucket = "missing";
    if (canonical) {
      try {
        const c = new URL(canonical, s.url).href;
        if (c === s.url) canonicalBucket = "self";
        else if (c.startsWith("https://www.curify-ai.com")) canonicalBucket = "elsewhere_same_domain";
        else canonicalBucket = "elsewhere_other_domain";
      } catch (_) {
        canonicalBucket = "invalid";
      }
    }
    const robotsLower = (robotsMeta + " " + res.xRobots).toLowerCase();
    const noindex = /\bnoindex\b/.test(robotsLower);
    return {
      ...s,
      status: res.status,
      noindex,
      robotsMeta,
      xRobots: res.xRobots,
      canonical,
      canonicalBucket,
      error: res.error || null,
    };
  });

  // Aggregate per family
  const byFamily = {};
  for (const r of results) {
    if (!byFamily[r.family]) {
      byFamily[r.family] = {
        family: r.family,
        sampled: 0,
        status_200: 0,
        status_3xx: 0,
        status_4xx: 0,
        status_5xx: 0,
        status_other: 0,
        noindex: 0,
        canonical_missing: 0,
        canonical_self: 0,
        canonical_elsewhere_same_domain: 0,
        canonical_elsewhere_other_domain: 0,
        canonical_invalid: 0,
      };
    }
    const f = byFamily[r.family];
    f.sampled++;
    if (r.status === 200) f.status_200++;
    else if (r.status >= 300 && r.status < 400) f.status_3xx++;
    else if (r.status >= 400 && r.status < 500) f.status_4xx++;
    else if (r.status >= 500 && r.status < 600) f.status_5xx++;
    else f.status_other++;
    if (r.noindex) f.noindex++;
    f[`canonical_${r.canonicalBucket}`]++;
  }

  // Print summary
  console.log("\n=== HYGIENE SUMMARY ===");
  const cols = ["family", "sampled", "200", "3xx", "4xx", "5xx", "other", "noidx", "can-self", "can-other-page", "can-missing", "can-other-domain"];
  console.log(cols.map((c) => c.padStart(c === "family" ? 22 : 12)).join(" "));
  for (const f of Object.values(byFamily)) {
    const row = [
      f.family,
      f.sampled,
      f.status_200,
      f.status_3xx,
      f.status_4xx,
      f.status_5xx,
      f.status_other,
      f.noindex,
      f.canonical_self,
      f.canonical_elsewhere_same_domain,
      f.canonical_missing,
      f.canonical_elsewhere_other_domain,
    ];
    console.log(row.map((c, i) => String(c).padStart(i === 0 ? 22 : 12)).join(" "));
  }

  // Flag anomalies
  console.log("\n=== ANOMALIES (>10% rate in any family) ===");
  let anyFlagged = false;
  for (const f of Object.values(byFamily)) {
    const pct = (n) => 100 * n / Math.max(f.sampled, 1);
    const flags = [];
    if (pct(f.noindex) > 10) flags.push(`noindex ${pct(f.noindex).toFixed(0)}%`);
    if (pct(f.canonical_elsewhere_same_domain) > 10) flags.push(`canonical→other-page ${pct(f.canonical_elsewhere_same_domain).toFixed(0)}%`);
    if (pct(f.canonical_elsewhere_other_domain) > 10) flags.push(`canonical→other-DOMAIN ${pct(f.canonical_elsewhere_other_domain).toFixed(0)}%`);
    if (pct(f.canonical_missing) > 25) flags.push(`canonical-missing ${pct(f.canonical_missing).toFixed(0)}%`);
    if (pct(f.status_4xx) > 5) flags.push(`4xx ${pct(f.status_4xx).toFixed(0)}%`);
    if (pct(f.status_5xx) > 5) flags.push(`5xx ${pct(f.status_5xx).toFixed(0)}%`);
    if (pct(f.status_3xx) > 10) flags.push(`3xx ${pct(f.status_3xx).toFixed(0)}%`);
    if (flags.length) {
      anyFlagged = true;
      console.log(`  ⚠️  ${f.family}: ${flags.join(", ")}`);
    }
  }
  if (!anyFlagged) console.log("  ✓ No structural blockers above 10% threshold");

  // Per-family example anomalies (top 5)
  console.log("\n=== EXAMPLE PROBLEM URLs ===");
  const problems = results.filter((r) =>
    r.noindex ||
    r.canonicalBucket === "elsewhere_same_domain" ||
    r.canonicalBucket === "elsewhere_other_domain" ||
    (r.status >= 400) ||
    (r.status >= 300 && r.status < 400)
  );
  for (const p of problems.slice(0, 25)) {
    console.log(`  [${p.status}] ${p.canonicalBucket.padEnd(28)} noidx=${p.noindex ? "Y" : "n"}  ${p.url}`);
    if (p.canonical) console.log(`     → canonical: ${p.canonical}`);
    if (p.robotsMeta) console.log(`     → meta robots: ${p.robotsMeta}`);
  }
  console.log(`\n${problems.length} of ${results.length} sampled URLs flagged (${(100*problems.length/results.length).toFixed(1)}%)`);

  // Save full data
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify({
    sampled_at: new Date().toISOString(),
    sample_size: args.sample,
    sitemap_size: sitemap.size,
    gsc_size: gsc.size,
    by_family: byFamily,
    problems: problems,
    all_samples: results,
  }, null, 2));
  console.log(`\n✨ saved → ${args.out}`);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
