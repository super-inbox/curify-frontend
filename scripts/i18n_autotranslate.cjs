/**
 * @file i18n_autotranslate.cjs
 * @description
 * Auto-translate missing i18n keys across per-locale JSON files in messages/<locale>/*.json.
 *
 * Folder layout:
 *   messages/
 *     en/
 *       blog.json
 *       common.json
 *       home.json
 *       pricing.json
 *     zh/
 *       ...
 *
 * Behavior:
 * - Uses base locale folder as source-of-truth (default: messages/en/*.json)
 * - Discovers locales from subfolders under messages/ (no hardcoded language list)
 * - Discovers files from base locale folder (or via --files)
 * - For each target locale + each file:
 *    - translates ONLY missing leaf keys (string leaves) from base file
 *    - merges back into target file (creates file/folders if missing)
 * - Preserves placeholders like {label} exactly
 * - Reads OPENAI_API_KEY from .env.local (and env)
 *
 * Usage:
 *   node scripts/i18n_autotranslate.cjs --base en --write
 *   node scripts/i18n_autotranslate.cjs --base en --dry-run
 *   node scripts/i18n_autotranslate.cjs --base en --only zh es de --write
 *   node scripts/i18n_autotranslate.cjs --base en --files common home --write
 *
 * Notes:
 * - `--files` accepts file basenames without .json (e.g. "common home pricing"),
 *   or full names with .json (e.g. "common.json").
 */

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");

// Load .env.local first (project root default)
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

/** -----------------------
 * CLI args (minimal parser)
 * ---------------------- */
function parseArgs(argv) {
  const args = {
    dir: "messages",
    base: "en",
    only: null, // array or null
    files: null, // array of basenames (without .json) or null -> discover from base folder
    model: "gpt-4o-mini",
    chunkSize: 60,
    write: false,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir") args.dir = argv[++i];
    else if (a === "--base") args.base = argv[++i];
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--chunkSize") args.chunkSize = parseInt(argv[++i], 10);
    else if (a === "--write") args.write = true;
    else if (a === "--dry-run" || a === "--dryRun") args.dryRun = true;
    else if (a === "--only") {
      const list = [];
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) list.push(argv[++i]);
      args.only = list.length ? list : null;
    } else if (a === "--files") {
      const list = [];
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) list.push(argv[++i]);
      args.files = list.length ? list : null;
    } else {
      console.warn(`[warn] Unknown arg: ${a}`);
    }
  }
  return args;
}

const args = parseArgs(process.argv);

/** -----------------------
 * Paths & locale discovery
 * ---------------------- */
const messagesDir = path.join(process.cwd(), args.dir);
if (!fs.existsSync(messagesDir)) {
  console.error(`messages dir not found: ${messagesDir}`);
  process.exit(1);
}

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// locales are subfolders under messages/
const locales = fs
  .readdirSync(messagesDir)
  .filter((name) => isDirectory(path.join(messagesDir, name)))
  .sort();

if (!locales.includes(args.base)) {
  console.error(
    `Base locale folder '${args.base}' not found in ${messagesDir}. Found: ${locales.join(", ")}`
  );
  process.exit(1);
}

const targetLocales = (args.only ? locales.filter((l) => args.only.includes(l)) : locales).filter(
  (l) => l !== args.base
);

function localeDir(locale) {
  return path.join(messagesDir, locale);
}

function normalizeFileToken(s) {
  // allow "common" or "common.json"
  return s.endsWith(".json") ? s.slice(0, -5) : s;
}

function listBaseFiles(baseLocale) {
  const dir = localeDir(baseLocale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -5)) // basenames without .json
    .sort();
}

const baseFiles = args.files ? args.files.map(normalizeFileToken) : listBaseFiles(args.base);
if (!baseFiles.length) {
  console.error(
    `No base files found under ${path.join(messagesDir, args.base)}.json. ` +
      `Expected messages/${args.base}/*.json`
  );
  process.exit(1);
}

function localeFile(locale, fileBase) {
  return path.join(localeDir(locale), `${fileBase}.json`);
}

/** -----------------------
 * JSON helpers
 * ---------------------- */
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(p, obj) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

// Flatten nested object to dot keys (leaf nodes)
function getKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    const val = obj[key];
    const k = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getKeys(val, k));
    } else {
      keys.push(k);
    }
  }
  return keys;
}

function getValueByPath(obj, dottedKey) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function setValueByPath(obj, dottedKey, value) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object" || Array.isArray(cur[p])) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

// Merge ONLY missing keys into target object
function mergeMissing(targetObj, patchMap) {
  for (const [k, v] of Object.entries(patchMap)) {
    const existing = getValueByPath(targetObj, k);
    if (typeof existing === "undefined") setValueByPath(targetObj, k, v);
  }
}

/** -----------------------
 * Placeholder guard
 * ---------------------- */
function extractPlaceholders(s) {
  if (typeof s !== "string") return [];
  const m = s.match(/\{[^{}]+\}/g);
  return m ? m : [];
}

function samePlaceholders(src, dst) {
  const a = extractPlaceholders(src);
  const b = extractPlaceholders(dst);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** -----------------------
 * OpenAI translate
 * ---------------------- */
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Put it in .env.local or env.");
  process.exit(1);
}

const client = new OpenAI({ apiKey });

function chunkEntries(obj, chunkSize) {
  const entries = Object.entries(obj);
  const chunks = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(Object.fromEntries(entries.slice(i, i + chunkSize)));
  }
  return chunks;
}

function stripCodeFence(s) {
  if (!s) return "";
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

async function translateBatch({ baseLocale, targetLocale, fileBase, items }) {
  const system = [
    "You are a professional localization translator for a software product UI and SEO text.",
    "Rules:",
    "- Preserve placeholders exactly (e.g., {label}, {count}, {name}). Do NOT translate or alter them.",
    "- Do not translate product names like Curify or Curify Studio.",
    "- Keep tone concise, natural, product/marketing friendly.",
    "- Return a valid JSON object ONLY (no markdown, no code fences).",
  ].join("\n");

  const user = [
    `Translate the following i18n strings from ${baseLocale} to ${targetLocale}.`,
    `File: ${fileBase}.json`,
    "Return JSON: same keys -> translated strings.",
    "Do not add/remove keys.",
    "",
    "Strings:",
    JSON.stringify(items, null, 2),
  ].join("\n");

  const resp = await client.chat.completions.create({
    model: args.model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = stripCodeFence(resp.choices?.[0]?.message?.content || "");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Model did not return valid JSON.\nError: ${e.message}\nRaw:\n${raw}`);
  }

  // Validate key set exactly matches
  const inKeys = new Set(Object.keys(items));
  const outKeys = new Set(Object.keys(parsed));
  const missing = [...inKeys].filter((k) => !outKeys.has(k));
  const extra = [...outKeys].filter((k) => !inKeys.has(k));
  if (missing.length || extra.length) {
    throw new Error(`Key mismatch. missing=${missing.join(",")} extra=${extra.join(",")}`);
  }

  // Placeholder validation
  for (const k of Object.keys(items)) {
    const src = items[k];
    const dst = parsed[k];
    if (typeof dst !== "string") parsed[k] = String(dst);
    if (!samePlaceholders(src, parsed[k])) {
      throw new Error(`Placeholder mismatch for key '${k}'\nsrc: ${src}\ndst: ${parsed[k]}`);
    }
  }

  return parsed;
}

/** -----------------------
 * Run
 * ---------------------- */
(async function run() {
  console.log(`[dir] ${messagesDir}`);
  console.log(`[base] ${args.base}`);
  console.log(`[files] ${baseFiles.join(", ")}`);
  console.log(`[found locales] ${locales.join(", ")}`);
  console.log(`[targets] ${targetLocales.join(", ") || "(none)"}`);

  // Read all base files once
  const baseFileObjs = {};
  const baseFileKeySets = {};
  for (const fileBase of baseFiles) {
    const basePath = localeFile(args.base, fileBase);
    if (!fs.existsSync(basePath)) {
      console.warn(`[warn] base file missing: ${basePath} (skipping)`);
      continue;
    }
    const obj = readJson(basePath);
    baseFileObjs[fileBase] = obj;
    baseFileKeySets[fileBase] = new Set(getKeys(obj));
  }

  const effectiveFiles = Object.keys(baseFileObjs).sort();
  if (!effectiveFiles.length) {
    console.error("No readable base files found. Nothing to do.");
    process.exit(1);
  }

  for (const loc of targetLocales) {
    console.log(`\n==============================`);
    console.log(`Locale: ${loc}`);
    console.log(`==============================`);

    for (const fileBase of effectiveFiles) {
      const baseObj = baseFileObjs[fileBase];
      const baseKeys = baseFileKeySets[fileBase];

      const targetPath = localeFile(loc, fileBase);
      let targetObj = {};

      if (fs.existsSync(targetPath)) {
        try {
          targetObj = readJson(targetPath);
        } catch (e) {
          console.error(`\n--- ${loc}/${fileBase}.json ---`);
          console.error(`Error parsing ${targetPath}: ${e.message}`);
          continue;
        }
      } else {
        // create empty file later (writeJson handles mkdir)
        targetObj = {};
      }

      const targetKeys = new Set(getKeys(targetObj));
      const missingKeys = [...baseKeys].filter((k) => !targetKeys.has(k));

      // Only translate string leaves from base
      const missingItems = {};
      for (const k of missingKeys) {
        const v = getValueByPath(baseObj, k);
        if (typeof v === "string") missingItems[k] = v;
      }

      console.log(`\n--- ${loc}/${fileBase}.json ---`);
      console.log(
        `missing keys: ${missingKeys.length} (string missing: ${Object.keys(missingItems).length})`
      );

      if (!Object.keys(missingItems).length) {
        console.log("✅ Nothing to translate.");
        // still optionally create file if it didn't exist and base had no keys? (skip)
        continue;
      }

      const chunks = chunkEntries(missingItems, args.chunkSize);
      const translatedAll = {};

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `  translating chunk ${i + 1}/${chunks.length} (${Object.keys(chunk).length} keys)...`
        );

        const translated = await translateBatch({
          baseLocale: args.base,
          targetLocale: loc,
          fileBase,
          items: chunk,
        });

        Object.assign(translatedAll, translated);
      }

      if (args.dryRun || !args.write) {
        const sample = Object.entries(translatedAll).slice(0, 8);
        console.log("sample:");
        for (const [k, v] of sample) console.log(`  - ${k}: ${v}`);
      }

      if (args.write && !args.dryRun) {
        mergeMissing(targetObj, translatedAll);
        writeJson(targetPath, targetObj);
        console.log(`✅ wrote ${Object.keys(translatedAll).length} keys to ${loc}/${fileBase}.json`);
      } else {
        console.log("ℹ️ not written (use --write to save).");
      }
    }
  }

  console.log("\nDone.");
})().catch((e) => {
  console.error("\n[ERROR]", e.message || e);
  process.exit(1);
});