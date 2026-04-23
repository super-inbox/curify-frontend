const fs = require("fs");
const https = require("https");
const http = require("http");
const { URL } = require("url");

// ---------- CONFIG ----------
const INPUT_FILE = "./public/data/curify_Page_Performance.tsv";
const TIMEOUT_MS = 10000;
const CONCURRENCY = 5;

// ---------- HELPERS ----------
function fetchUrl(url) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith("https") ? https : http;

      const req = lib.get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            url,
            status: res.statusCode,
            body: data,
          });
        });
      });

      req.on("error", () => {
        resolve({ url, status: 0, body: "" });
      });

      req.setTimeout(TIMEOUT_MS, () => {
        req.destroy();
        resolve({ url, status: 0, body: "" });
      });
    } catch {
      resolve({ url, status: 0, body: "" });
    }
  });
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const regex = /href="([^"]+)"/g;

  let match;
  while ((match = regex.exec(html))) {
    let link = match[1];

    if (!link || link.startsWith("#") || link.startsWith("javascript:")) continue;

    try {
      const absolute = new URL(link, baseUrl).href;
      links.add(absolute);
    } catch {}
  }

  return [...links];
}

// ---------- STEP 1: READ TSV ----------
function loadUrls() {
  const raw = fs.readFileSync(INPUT_FILE, "utf8");

  const lines = raw.split("\n").slice(1); // skip header

  const urls = new Set();

  for (const line of lines) {
    const cols = line.split("\t");
    const url = cols[0]?.trim();

    if (url && url.startsWith("http")) {
      urls.add(url);
    }
  }

  return [...urls];
}

// ---------- STEP 2: CHECK PAGE LINKS ----------
async function checkPage(url) {
  console.log(`\nChecking page: ${url}`);

  const page = await fetchUrl(url);

  if (page.status >= 400 || page.status === 0) {
    return {
      page: url,
      error: `Page failed: ${page.status}`,
      brokenLinks: [],
    };
  }

  const links = extractLinks(page.body, url);

  const broken = [];

  for (const link of links) {
    const res = await fetchUrl(link);

    if (res.status >= 400 || res.status === 0) {
      broken.push({
        link,
        status: res.status,
      });
      console.log(`  ❌ Broken: ${link} (${res.status})`);
    }
  }

  return {
    page: url,
    brokenLinks: broken,
  };
}

// ---------- STEP 3: CONCURRENCY CONTROL ----------
async function runWithConcurrency(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: limit }, worker);
  await Promise.all(workers);

  return results;
}

// ---------- MAIN ----------
async function main() {
  const urls = loadUrls();

  console.log(`Total unique pages: ${urls.length}`);

  const tasks = urls.map((url) => () => checkPage(url));

  const results = await runWithConcurrency(tasks, CONCURRENCY);

  const brokenPages = results.filter(
    (r) => r.error || (r.brokenLinks && r.brokenLinks.length > 0)
  );

  fs.writeFileSync(
    "broken_links_report.json",
    JSON.stringify(brokenPages, null, 2)
  );

  console.log("\n✅ Done. Output: broken_links_report.json");
}

main();