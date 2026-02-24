/**
 * @file i18n_autotranslate.cjs
 * @description
 * Auto-translate missing i18n keys across locale JSON files in messages/.
 *
 * - Uses base locale file as source-of-truth (default: messages/en.json)
 * - Discovers locales from messages/*.json (no hardcoded language list)
 * - For each target locale: translates ONLY missing leaf keys, merges back
 * - Preserves placeholders like {label} exactly
 * - Reads OPENAI_API_KEY from .env.local (and env)
 *
 * Usage:
 *   node scripts/i18n_autotranslate.cjs --base en --write
 *   node scripts/i18n_autotranslate.cjs --base en --dry-run
 *   node scripts/i18n_autotranslate.cjs --base en --only zh es de --write
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

const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith(".json"));
const locales = files.map((f) => f.replace(/\.json$/, "")).sort();

if (!locales.includes(args.base)) {
  console.error(
    `Base locale '${args.base}' not found in ${messagesDir}. Found: ${locales.join(", ")}`
  );
  process.exit(1);
}

const targetLocales = (args.only ? locales.filter((l) => args.only.includes(l)) : locales)
  .filter((l) => l !== args.base);

function localeFile(locale) {
  return path.join(messagesDir, `${locale}.json`);
}

/** -----------------------
 * JSON helpers
 * ---------------------- */
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
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

async function translateBatch({ baseLocale, targetLocale, items }) {
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
      throw new Error(
        `Placeholder mismatch for key '${k}'\nsrc: ${src}\ndst: ${parsed[k]}`
      );
    }
  }

  return parsed;
}

/** -----------------------
 * Run
 * ---------------------- */
(async function run() {
  const basePath = localeFile(args.base);
  const baseObj = readJson(basePath);
  const baseKeys = new Set(getKeys(baseObj));

  console.log(`[base] ${args.base}.json  keys=${baseKeys.size}`);
  console.log(`[found locales] ${locales.join(", ")}`);
  console.log(`[targets] ${targetLocales.join(", ") || "(none)"}`);

  for (const loc of targetLocales) {
    const targetPath = localeFile(loc);
    let targetObj;

    try {
      targetObj = readJson(targetPath);
    } catch (e) {
      console.error(`\n--- ${loc}.json ---`);
      console.error(`Error parsing ${targetPath}: ${e.message}`);
      continue;
    }

    const targetKeys = new Set(getKeys(targetObj));
    const missingKeys = [...baseKeys].filter((k) => !targetKeys.has(k));

    // Only translate strings from base
    const missingItems = {};
    for (const k of missingKeys) {
      const v = getValueByPath(baseObj, k);
      if (typeof v === "string") missingItems[k] = v;
    }

    console.log(`\n--- ${loc}.json ---`);
    console.log(`missing keys: ${missingKeys.length} (string missing: ${Object.keys(missingItems).length})`);

    if (!Object.keys(missingItems).length) {
      console.log("✅ Nothing to translate.");
      continue;
    }

    const chunks = chunkEntries(missingItems, args.chunkSize);
    const translatedAll = {};

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`  translating chunk ${i + 1}/${chunks.length} (${Object.keys(chunk).length} keys)...`);

      const translated = await translateBatch({
        baseLocale: args.base,
        targetLocale: loc,
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
      console.log(`✅ wrote ${Object.keys(translatedAll).length} keys to ${loc}.json`);
    } else {
      console.log("ℹ️ not written (use --write to save).");
    }
  }

  console.log("\nDone.");
})().catch((e) => {
  console.error("\n[ERROR]", e.message || e);
  process.exit(1);
});