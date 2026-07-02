#!/usr/bin/env node
// scripts/submit_indexing_api.cjs
//
// Submits URLs to Google Indexing API for fast re-crawl.
// One-shot use; not part of the build.
//
// Prereqs:
//   1. A Google service-account JSON with Indexing API access
//   2. Service-account email added to Google Search Console as an Owner
//      of the verified property (sc-domain:curify-ai.com or
//      https://www.curify-ai.com/)
//   3. Indexing API enabled in the GCP project
//
// Quota: 200 URL_UPDATED / day per project per default.
//
// Usage:
//   node scripts/submit_indexing_api.cjs \
//     --key=/path/to/google-service-account.json
//     [--url=https://www.curify-ai.com/foo]   # repeatable
//     [--dry-run]
//
// If no --url flags are passed, uses the built-in PRIORITY_URLS list
// (the 6/3 WC hub + 10 country-WC topic pages + evolution rewrite +
// today's illustrator post — the 13 freshly-shipped pages needing crawl).

"use strict";

const fs = require("fs");
const { google } = require("googleapis");

const PRIORITY_URLS = [
  // 2026-06-04 illustrator post
  "https://www.curify-ai.com/blog/industrial-ai-for-illustrator-ip",
  // 2026-06-03 WC hub
  "https://www.curify-ai.com/blog/world-cup-2026-ai-prompt-hub",
  // 2026-06-03 country-WC tier-2 pages (10)
  "https://www.curify-ai.com/topics/brazil-world-cup",
  "https://www.curify-ai.com/topics/argentina-world-cup",
  "https://www.curify-ai.com/topics/france-world-cup",
  "https://www.curify-ai.com/topics/germany-world-cup",
  "https://www.curify-ai.com/topics/england-world-cup",
  "https://www.curify-ai.com/topics/spain-world-cup",
  "https://www.curify-ai.com/topics/italy-world-cup",
  "https://www.curify-ai.com/topics/portugal-world-cup",
  "https://www.curify-ai.com/topics/netherlands-world-cup",
  "https://www.curify-ai.com/topics/uruguay-world-cup",
  // 2026-06-02 evolution rewrite
  "https://www.curify-ai.com/blog/evolution-timelines-visualization",
];

function parseArgs() {
  const out = {
    key: null,
    urls: [],
    dryRun: false,
    urlsFile: null,
    limit: null,
    stateFile: null,
  };
  for (const a of process.argv.slice(2)) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--key=")) out.key = a.split("=").slice(1).join("=");
    else if (a.startsWith("--url=")) out.urls.push(a.split("=").slice(1).join("="));
    else if (a.startsWith("--urls-file=")) out.urlsFile = a.split("=").slice(1).join("=");
    else if (a.startsWith("--limit=")) out.limit = Number(a.split("=")[1]) || null;
    else if (a.startsWith("--state=")) out.stateFile = a.split("=").slice(1).join("=");
  }
  return out;
}

function loadUrlsFile(p) {
  return fs
    .readFileSync(p, "utf8")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));
}

function loadState(p) {
  if (!p || !fs.existsSync(p)) return { submitted: {} };
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return { submitted: {} };
  }
}

function saveState(p, state) {
  if (!p) return;
  fs.mkdirSync(require("path").dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(state, null, 2) + "\n");
}

async function main() {
  const args = parseArgs();
  if (!args.key) {
    console.error("❌ --key=<path/to/service-account.json> is required");
    process.exit(1);
  }
  if (!fs.existsSync(args.key)) {
    console.error(`❌ Key file not found: ${args.key}`);
    process.exit(1);
  }
  // URL source priority: --url= flags > --urls-file= > built-in PRIORITY_URLS
  let urls = args.urls;
  if (!urls.length && args.urlsFile) urls = loadUrlsFile(args.urlsFile);
  if (!urls.length) urls = PRIORITY_URLS;

  // State-file dedup: skip URLs already submitted in prior runs (used
  // when working through a multi-day priority list like
  // raw/w1-indexing-priority.txt at the 200/day quota cap).
  const state = loadState(args.stateFile);
  const alreadySubmitted = new Set(Object.keys(state.submitted || {}));
  if (args.stateFile) {
    const before = urls.length;
    urls = urls.filter((u) => !alreadySubmitted.has(u));
    if (before !== urls.length) {
      console.log(`state: ${before - urls.length} URL(s) already submitted in prior runs, skipping`);
    }
  }

  if (args.limit && urls.length > args.limit) {
    urls = urls.slice(0, args.limit);
  }

  console.log(`Submitting ${urls.length} URL(s) to Google Indexing API${args.dryRun ? " (dry-run)" : ""}`);

  if (args.dryRun) {
    for (const u of urls) console.log(`  (dry) ${u}`);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: args.key,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const client = await auth.getClient();
  const indexing = google.indexing({ version: "v3", auth: client });

  state.submitted = state.submitted || {};
  let ok = 0, fail = 0, quotaHit = false;
  for (const u of urls) {
    try {
      const res = await indexing.urlNotifications.publish({
        requestBody: { url: u, type: "URL_UPDATED" },
      });
      const ts = res.data?.urlNotificationMetadata?.latestUpdate?.notifyTime || "(ok)";
      console.log(`✓ ${u}  -> ${ts}`);
      state.submitted[u] = new Date().toISOString();
      ok++;
    } catch (e) {
      const msg = e?.errors?.[0]?.message || e?.message || String(e);
      console.log(`✗ ${u}  -> ${msg}`);
      fail++;
      if (/quota|rate/i.test(msg)) {
        console.log("→ quota / rate limit hit; stopping early. Re-run tomorrow.");
        quotaHit = true;
        break;
      }
    }
  }
  // Save state after each run so a mid-run crash or quota hit doesn't lose progress.
  saveState(args.stateFile, state);
  console.log(`\nDone: ${ok} submitted, ${fail} failed.${quotaHit ? " (stopped early — quota)" : ""}`);
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
