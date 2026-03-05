/**
 * Translate newly added common.json keys from English to target locales.
 *
 * Scope intentionally limited to the i18n batch keys introduced for hardcoded-copy migration.
 * It only translates when target value is missing or exactly equal to English source.
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(__dirname, "../messages");
const COMMON_FILE = "common.json";

// Locales that currently use English fallback for new keys.
const TARGET_LOCALES = ["de", "es", "fr", "hi", "ja", "ko", "ru", "tr"];

// New namespaces introduced in the first i18n migration batch.
const SCOPED_TOP_KEYS = [
  "ctaButtons",
  "emailDrawer",
  "signDrawer",
  "paymentProcessingModal",
  "topUpModal",
  "transactionHistory",
  "userDropdown",
  "header",
  "footer",
  "actionButtons",
  "dialogCloseButton",
  "galleryModal",
  "videoPlayer",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function deepGet(obj, parts) {
  return parts.reduce((acc, p) => (acc && typeof acc === "object" ? acc[p] : undefined), obj);
}

function deepSet(obj, parts, value) {
  let ref = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!ref[key] || typeof ref[key] !== "object") ref[key] = {};
    ref = ref[key];
  }
  ref[parts[parts.length - 1]] = value;
}

function flattenStrings(obj, prefix = "", out = []) {
  for (const [key, val] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") {
      out.push({ key: full, value: val });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      flattenStrings(val, full, out);
    }
  }
  return out;
}

function protectPlaceholders(text) {
  const tokens = [];
  let idx = 0;
  let replaced = text;

  const patterns = [/\$\{[a-zA-Z0-9_]+\}/g, /\{[a-zA-Z0-9_]+\}/g];
  for (const pattern of patterns) {
    replaced = replaced.replace(pattern, (m) => {
      const token = `__PH_${idx++}__`;
      tokens.push({ token, value: m });
      return token;
    });
  }
  return { replaced, tokens };
}

function restorePlaceholders(text, tokens) {
  let restored = text;
  for (const { token, value } of tokens) {
    restored = restored.split(token).join(value);
  }
  return restored;
}

async function translateText(text, targetLocale) {
  const { replaced, tokens } = protectPlaceholders(text);
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=en&tl=${encodeURIComponent(targetLocale)}&dt=t&q=${encodeURIComponent(replaced)}`;

  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((chunk) => (Array.isArray(chunk) ? chunk[0] : "")).join("")
    : "";

  if (!translated || typeof translated !== "string") {
    throw new Error("Unexpected translation response shape");
  }

  return restorePlaceholders(translated, tokens);
}

async function main() {
  const enPath = path.join(MESSAGES_DIR, "en", COMMON_FILE);
  const en = readJson(enPath);

  const scopedEn = {};
  for (const topKey of SCOPED_TOP_KEYS) {
    if (en[topKey]) scopedEn[topKey] = en[topKey];
  }
  const enEntries = flattenStrings(scopedEn);

  let totalTranslated = 0;

  for (const locale of TARGET_LOCALES) {
    const localePath = path.join(MESSAGES_DIR, locale, COMMON_FILE);
    if (!fs.existsSync(localePath)) {
      console.log(`[skip] ${locale}: missing ${COMMON_FILE}`);
      continue;
    }

    const localeJson = readJson(localePath);
    let translatedCount = 0;

    for (const entry of enEntries) {
      const parts = entry.key.split(".");
      const current = deepGet(localeJson, parts);
      const shouldTranslate =
        current == null || (typeof current === "string" && current.trim() === entry.value.trim());

      if (!shouldTranslate) continue;

      const translated = await translateText(entry.value, locale);
      deepSet(localeJson, parts, translated);
      translatedCount += 1;
      totalTranslated += 1;
    }

    writeJson(localePath, localeJson);
    console.log(`[ok] ${locale}: translated ${translatedCount} strings`);
  }

  console.log(`Done. Total translated strings: ${totalTranslated}`);
}

main().catch((err) => {
  console.error("Translation failed:", err);
  process.exit(1);
});
