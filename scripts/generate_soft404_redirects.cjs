const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");

const ROOT = process.cwd();

const INPUT_FILES = [
  path.join(ROOT, "public", "data", "curify_Page_Indexed.tsv"),
  path.join(ROOT, "public", "data", "curify_Page_Performance.tsv"),
];

const EXISTING_REDIRECTS_FILE = path.join(ROOT, "redirects.generated.json");

const OUTPUT_REDIRECTS = EXISTING_REDIRECTS_FILE;
const OUTPUT_DEBUG = path.join(
  ROOT,
  "public",
  "data",
  "redirects.soft404.debug.json"
);

const CONCURRENCY = 8;
const TIMEOUT_MS = 12000;
const MAX_REDIRECTS = 5;

const LOCALES = new Set(["en", "zh", "es", "fr", "de", "ja", "ko", "hi", "tr", "ru"]);
const VERIFY_DESTINATION = true;

// ---------- TSV ----------
function readTsv(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseTsvFirstColumn(tsvText) {
  const lines = tsvText.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  return lines
    .slice(1)
    .map((line) => (line.split("\t")[0] || "").trim())
    .filter(Boolean)
    .filter((value) => value.startsWith("http"));
}

function unique(arr) {
  return [...new Set(arr)];
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

// ---------- HTTP ----------
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
          "User-Agent": "Mozilla/5.0 (compatible; CurifyRedirectGenerator/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        const headers = res.headers || {};
        let body = "";
        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          resolve({
            url,
            status,
            headers,
            body,
            error: null,
          });
        };

        res.on("data", (chunk) => {
          body += chunk.toString();
          if (body.length > 200000) {
            res.destroy();
          }
        });

        res.on("end", finish);
        res.on("close", finish);
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

// ---------- HTML SIGNALS ----------
function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(
    html
  );
}

function detectSoft404(result) {
  const html = result.body || "";
  const lower = html.toLowerCase();

  const title = extractTitle(html);
  const noindex = hasNoindex(html);

  const genericTitle = title === "Curify Studio";
  const containsNotFound =
    lower.includes("not found") ||
    lower.includes("page not found") ||
    lower.includes(">404<") ||
    lower.includes("404");

  const soft404 =
    result.status === 200 &&
    ((noindex && genericTitle) || (noindex && containsNotFound));

  return {
    title,
    noindex,
    containsNotFound,
    soft404,
  };
}

// ---------- URL RULES ----------
function splitPathParts(pathname) {
  return pathname.split("/").filter(Boolean);
}

function joinPathParts(parts) {
  return "/" + parts.filter(Boolean).join("/");
}

function maybeStripLocale(parts) {
  if (parts.length && LOCALES.has(parts[0])) {
    return {
      locale: parts[0],
      rest: parts.slice(1),
    };
  }
  return {
    locale: null,
    rest: parts,
  };
}

function normalizeTemplateSlug(templateSlug) {
  if (!templateSlug.startsWith("template-")) return null;
  return templateSlug
    .replace(/^template-/, "")
    .replace(/-(en|zh|es|fr|de|ja|ko|hi|tr|ru)$/, "");
}

function normalizeExampleSlug(exampleSlug) {
  return exampleSlug.replace(
    /-(en|zh|es|fr|de|ja|ko|hi|tr|ru)-/g,
    "-"
  );
}

function buildRedirectCandidateFromUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    return null;
  }

  const parts = splitPathParts(u.pathname);
  const { locale, rest } = maybeStripLocale(parts);

  if (rest.length !== 4) return null;
  if (rest[0] !== "nano-template") return null;
  if (rest[2] !== "example") return null;

  const oldTemplateSlug = rest[1];
  const oldExampleSlug = rest[3];

  if (!oldTemplateSlug.startsWith("template-")) return null;

  const newTemplateSlug = normalizeTemplateSlug(oldTemplateSlug);
  const newExampleSlug = normalizeExampleSlug(oldExampleSlug);

  if (!newTemplateSlug || !newExampleSlug) return null;

  if (
    newTemplateSlug === oldTemplateSlug &&
    newExampleSlug === oldExampleSlug
  ) {
    return null;
  }

  const sourceParts = locale
    ? [locale, "nano-template", oldTemplateSlug, "example", oldExampleSlug]
    : ["nano-template", oldTemplateSlug, "example", oldExampleSlug];

  const destinationParts = locale
    ? [locale, "nano-template", newTemplateSlug, "example", newExampleSlug]
    : ["nano-template", newTemplateSlug, "example", newExampleSlug];

  return {
    source: joinPathParts(sourceParts),
    destination: joinPathParts(destinationParts),
    permanent: true,
    sourceUrl: normalizeUrl(rawUrl),
    destinationUrl: `${u.protocol}//${u.host}${joinPathParts(destinationParts)}`,
    locale: locale || "root",
  };
}

// ---------- MERGE ----------
function readExistingRedirects(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    throw new Error(`Failed to parse existing redirects JSON: ${filePath}\n${err.message}`);
  }
}

function mergeRedirects(existing, generated) {
  const map = new Map();

  for (const item of existing) {
    if (item && typeof item.source === "string") {
      map.set(item.source, item);
    }
  }

  for (const item of generated) {
    if (item && typeof item.source === "string") {
      map.set(item.source, item); // replace existing if same source
    }
  }

  return [...map.values()].sort((a, b) => {
    const aSrc = a.source || "";
    const bSrc = b.source || "";
    return aSrc.localeCompare(bSrc);
  });
}

// ---------- CONCURRENCY ----------
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

// ---------- MAIN ----------
async function main() {
  const allRawUrls = [];

  for (const file of INPUT_FILES) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
    const raw = readTsv(file);
    const urls = parseTsvFirstColumn(raw);
    console.log(`${path.basename(file)}: ${urls.length} raw URLs`);
    allRawUrls.push(...urls);
  }

  const allUrls = unique(
    allRawUrls
      .map(normalizeUrl)
      .filter(Boolean)
      .filter((u) => {
        try {
          const x = new URL(u);
          return x.hostname === "curify-ai.com" || x.hostname === "www.curify-ai.com";
        } catch {
          return false;
        }
      })
  );

  console.log(`Combined unique URLs: ${allUrls.length}`);

  const checked = await runPool(
    allUrls,
    async (url, i) => {
      if ((i + 1) % 50 === 0 || i === 0) {
        console.log(`Checking ${i + 1}/${allUrls.length}`);
      }

      const res = await requestWithRedirects(url);
      const signals = detectSoft404(res);

      return {
        url,
        finalUrl: res.finalUrl,
        status: res.status,
        chain: res.chain,
        error: res.error,
        title: signals.title,
        noindex: signals.noindex,
        containsNotFound: signals.containsNotFound,
        soft404: signals.soft404,
      };
    },
    CONCURRENCY
  );

  const soft404Urls = checked.filter((r) => r.soft404).map((r) => r.url);
  console.log(`Soft404 URLs detected: ${soft404Urls.length}`);

  const rawCandidates = unique(
    soft404Urls
      .map(buildRedirectCandidateFromUrl)
      .filter(Boolean)
      .map((x) => JSON.stringify(x))
  ).map((s) => JSON.parse(s));

  console.log(`Redirect candidates from rule: ${rawCandidates.length}`);

  let verifiedCandidates = rawCandidates;

  if (VERIFY_DESTINATION) {
    const verification = await runPool(
      rawCandidates,
      async (item, i) => {
        if ((i + 1) % 50 === 0 || i === 0) {
          console.log(`Verifying destination ${i + 1}/${rawCandidates.length}`);
        }

        const res = await requestWithRedirects(item.destinationUrl);
        const signals = detectSoft404(res);

        const destinationOk =
          [200, 301, 302, 303, 307, 308].includes(res.status) &&
          !signals.soft404;

        return {
          ...item,
          destinationStatus: res.status,
          destinationFinalUrl: res.finalUrl,
          destinationSoft404: signals.soft404,
          destinationTitle: signals.title,
          destinationOk,
        };
      },
      CONCURRENCY
    );

    fs.writeFileSync(OUTPUT_DEBUG, JSON.stringify(verification, null, 2), "utf8");
    console.log(`Debug saved: ${OUTPUT_DEBUG}`);

    verifiedCandidates = verification.filter((x) => x.destinationOk);
  }

  const generatedRedirects = verifiedCandidates
    .map((x) => ({
      source: x.source,
      destination: x.destination,
      permanent: true,
    }))
    .sort((a, b) => a.source.localeCompare(b.source));

  const existingRedirects = readExistingRedirects(EXISTING_REDIRECTS_FILE);
  const mergedRedirects = mergeRedirects(existingRedirects, generatedRedirects);

  fs.writeFileSync(
    OUTPUT_REDIRECTS,
    JSON.stringify(mergedRedirects, null, 2),
    "utf8"
  );

  console.log(`Existing redirects: ${existingRedirects.length}`);
  console.log(`Generated redirects: ${generatedRedirects.length}`);
  console.log(`Merged redirects: ${mergedRedirects.length}`);
  console.log(`Saved merged redirects to: ${OUTPUT_REDIRECTS}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});