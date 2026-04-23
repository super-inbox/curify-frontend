const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");

const ROOT = process.cwd();

const INDEXED_FILE = path.join(ROOT, "public", "data", "curify_Page_Indexed.tsv");
const PERFORMANCE_FILE = path.join(ROOT, "public", "data", "curify_Page_Performance.tsv");

const OUTPUT_DIR = path.join(ROOT, "public", "data");

const CONCURRENCY = 6;
const TIMEOUT_MS = 12000;
const MAX_REDIRECTS = 5;

function readTsv(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseTsvFirstColumn(tsvText) {
  const lines = tsvText.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  return lines
    .slice(1)
    .map((line) => (line.split("\t")[0] || "").trim())
    .filter(Boolean);
}

function unique(arr) {
  return [...new Set(arr)];
}

function normalizePath(rawUrl) {
  try {
    const u = new URL(rawUrl.trim());
    let pathname = u.pathname || "/";
    if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
    return pathname;
  } catch {
    return null;
  }
}

function normalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl.trim());
    u.hash = "";
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname.length > 1) {
      u.pathname = u.pathname.replace(/\/+$/, "");
    }
    return u.toString();
  } catch {
    return null;
  }
}

function requestOnce(url) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve({
        url,
        status: 0,
        headers: {},
        body: "",
        error: "Invalid URL",
      });
      return;
    }

    const lib = parsed.protocol === "https:" ? https : http;

    const req = lib.request(
      parsed,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CurifySoft404Checker/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        const headers = res.headers || {};
        let body = "";

        res.on("data", (chunk) => {
          body += chunk.toString();
          if (body.length > 200000) {
            res.destroy();
          }
        });

        res.on("end", () => {
          resolve({
            url,
            status,
            headers,
            body,
            error: null,
          });
        });

        res.on("close", () => {
          resolve({
            url,
            status,
            headers,
            body,
            error: null,
          });
        });
      }
    );

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error("Request timeout"));
    });

    req.on("error", (err) => {
      resolve({
        url,
        status: 0,
        headers: {},
        body: "",
        error: err.message,
      });
    });

    req.end();
  });
}

async function requestWithRedirects(url) {
  const chain = [];
  let currentUrl = url;
  let lastRes = null;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await requestOnce(currentUrl);
    lastRes = res;

    chain.push({
      url: currentUrl,
      status: res.status,
      location: res.headers.location || null,
    });

    if (
      ![301, 302, 303, 307, 308].includes(res.status) ||
      !res.headers.location
    ) {
      break;
    }

    try {
      currentUrl = new URL(res.headers.location, currentUrl).toString();
    } catch {
      return {
        originalUrl: url,
        finalUrl: currentUrl,
        status: res.status,
        headers: res.headers,
        body: res.body,
        chain,
        error: `Bad redirect location: ${res.headers.location}`,
      };
    }
  }

  return {
    originalUrl: url,
    finalUrl: currentUrl,
    status: lastRes?.status || 0,
    headers: lastRes?.headers || {},
    body: lastRes?.body || "",
    chain,
    error: lastRes?.error || null,
  };
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1].trim() : "";
}

function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
}

function detectSoft404(result) {
  const html = result.body || "";
  const title = extractTitle(html);
  const canonical = extractCanonical(html);
  const noindex = hasNoindex(html);
  const lower = html.toLowerCase();

  const genericTitle = title === "Curify Studio";
  const containsNotFound =
    lower.includes("not found") ||
    lower.includes("page not found") ||
    lower.includes("404");

  // Heuristic tailored for your site:
  // 200 + noindex + generic title is very suspicious
  const soft404 =
    result.status === 200 &&
    (
      (noindex && genericTitle) ||
      (noindex && containsNotFound)
    );

  return {
    title,
    canonical,
    noindex,
    containsNotFound,
    soft404,
  };
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runner())
  );

  return results;
}

async function main() {
  if (!fs.existsSync(INDEXED_FILE)) {
    throw new Error(`Missing file: ${INDEXED_FILE}`);
  }
  if (!fs.existsSync(PERFORMANCE_FILE)) {
    throw new Error(`Missing file: ${PERFORMANCE_FILE}`);
  }

  const indexedRaw = readTsv(INDEXED_FILE);
  const performanceRaw = readTsv(PERFORMANCE_FILE);

  // Keep original indexed URLs for actual requests
  const indexedOriginalUrls = unique(
    parseTsvFirstColumn(indexedRaw)
      .map((u) => u.trim())
      .filter(Boolean)
  );

  // Compare by path so www/non-www doesn't create false mismatch
  const performancePaths = new Set(
    parseTsvFirstColumn(performanceRaw)
      .map(normalizePath)
      .filter(Boolean)
  );

  const indexedNotInPerformance = indexedOriginalUrls.filter((url) => {
    const p = normalizePath(url);
    return p && !performancePaths.has(p);
  });

  console.log(`Indexed URLs: ${indexedOriginalUrls.length}`);
  console.log(`Performance paths: ${performancePaths.size}`);
  console.log(`Indexed not in Performance (by path): ${indexedNotInPerformance.length}`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "indexed_not_in_performance.json"),
    JSON.stringify(indexedNotInPerformance, null, 2),
    "utf8"
  );

  const checked = await runPool(
    indexedNotInPerformance,
    async (url, i) => {
      if ((i + 1) % 50 === 0 || i === 0) {
        console.log(`Checking ${i + 1}/${indexedNotInPerformance.length}`);
      }

      const res = await requestWithRedirects(url);
      const soft = detectSoft404(res);

      return {
        originalUrl: url,
        normalizedUrl: normalizeUrl(url),
        finalUrl: res.finalUrl,
        status: res.status,
        chain: res.chain,
        error: res.error,
        title: soft.title,
        canonical: soft.canonical,
        noindex: soft.noindex,
        containsNotFound: soft.containsNotFound,
        soft404: soft.soft404,
      };
    },
    CONCURRENCY
  );

  const literal404 = checked.filter((r) => r.status === 404);
  const soft404 = checked.filter((r) => r.soft404);
  const redirected = checked.filter((r) => r.chain && r.chain.length > 1);
  const non200 = checked.filter((r) => r.status !== 200);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "indexed_not_in_performance_checked.json"),
    JSON.stringify(checked, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "indexed_not_in_performance_literal_404.json"),
    JSON.stringify(literal404, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "indexed_not_in_performance_soft404.json"),
    JSON.stringify(soft404, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "indexed_not_in_performance_redirected.json"),
    JSON.stringify(redirected, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "indexed_not_in_performance_non200.json"),
    JSON.stringify(non200, null, 2),
    "utf8"
  );

  console.log(`Literal 404: ${literal404.length}`);
  console.log(`Soft 404: ${soft404.length}`);
  console.log(`Redirected: ${redirected.length}`);
  console.log(`Non-200: ${non200.length}`);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});