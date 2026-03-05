// /scripts/sync_nano_inspiration.cjs
/* eslint-disable no-console */
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { execSync } = require("child_process");

// --- OPTIONAL dependency (required for preview generation) ---
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error(
    "❌ Missing dependency: sharp\n" +
      "Install it first: npm i sharp\n" +
      "Then rerun the script."
  );
  process.exit(1);
}

// ===================== CONFIG =====================
const REPO_ROOT = path.resolve(__dirname, "..");

// Source directory to scan (override via CLI: --source=/abs/path)
const DEFAULT_SOURCE_DIR = path.resolve(
  process.env.SOURCE_DIR || "/Users/qqwjq/curify-gallery/daily_inspirations/"
);

// Public assets output (override via CLI)
const DEFAULT_IMAGE_DIR = path.resolve(
  process.env.IMAGE_DIR || path.join(REPO_ROOT, "public/images/nano_insp")
);
const DEFAULT_PREVIEW_DIR = path.resolve(
  process.env.PREVIEW_DIR || path.join(REPO_ROOT, "public/images/nano_insp_preview")
);

// Data json paths (override via CLI)
const DEFAULT_TEMPLATE_JSON = path.resolve(
  process.env.TEMPLATE_JSON || path.join(REPO_ROOT, "public/data/nano_templates.json")
);
const DEFAULT_INSP_JSON = path.resolve(
  process.env.NANO_INSP_JSON || path.join(REPO_ROOT, "public/data/nano_inspiration.json")
);

// Public URL prefixes (MUST match your frontend expectations)
const PUBLIC_IMAGE_URL_PREFIX = "/images/nano_insp/";
const PUBLIC_PREVIEW_URL_PREFIX = "/images/nano_insp_preview/";

// Preview constraints
const MAX_SIZE = 512;
const MAX_PREVIEW_KB = 250;
const START_QUALITY = 80;
const MIN_QUALITY = 45;
const QUALITY_STEP = 8;

// CDN sync (optional)
const DEFAULT_BUCKET = process.env.CDN_BUCKET || "gs://curify-static";
// ==================================================

const LOCALE_RE = /^[a-z]{2}$/;

function parseArgs(argv) {
  const out = {
    source: DEFAULT_SOURCE_DIR,
    imageDir: DEFAULT_IMAGE_DIR,
    previewDir: DEFAULT_PREVIEW_DIR,
    templateJson: DEFAULT_TEMPLATE_JSON,
    inspirationJson: DEFAULT_INSP_JSON,
    sync: false,
    bucket: DEFAULT_BUCKET,
    dryRun: false,
  };

  for (const a of argv.slice(2)) {
    if (a.startsWith("--source=")) out.source = a.split("=").slice(1).join("=");
    else if (a.startsWith("--imageDir=")) out.imageDir = a.split("=").slice(1).join("=");
    else if (a.startsWith("--previewDir=")) out.previewDir = a.split("=").slice(1).join("=");
    else if (a.startsWith("--templateJson=")) out.templateJson = a.split("=").slice(1).join("=");
    else if (a.startsWith("--inspirationJson=")) out.inspirationJson = a.split("=").slice(1).join("=");
    else if (a === "--sync") out.sync = true;
    else if (a.startsWith("--bucket=")) out.bucket = a.split("=").slice(1).join("=");
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

async function readJson(filePath) {
  const raw = await fsp.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function writeJson(filePath, obj) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function walkFilesRecursive(dir) {
  const results = [];
  const stack = [dir];

  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = await fsp.readdir(cur, { withFileTypes: true });
    } catch (e) {
      console.warn(`⚠️ Cannot read dir: ${cur} (${e.message})`);
      continue;
    }

    for (const ent of entries) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile()) results.push(full);
    }
  }
  return results;
}

function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return false;
  const lower = path.basename(filePath).toLowerCase();
  if (lower.endsWith("-prev.jpg") || lower.endsWith("-prev.jpeg") || lower.endsWith("-prev.png")) return false;
  return true;
}

function normalizeTemplates(templateJson) {
  const templates = Array.isArray(templateJson)
    ? templateJson
    : Array.isArray(templateJson?.templates)
      ? templateJson.templates
      : null;

  if (!templates) throw new Error("Invalid nano_templates.json: expected array or { templates: [...] }");

  const templatesById = new Map();
  for (const t of templates) {
    if (t && typeof t === "object" && typeof t.id === "string") {
      templatesById.set(t.id, t);
    }
  }

  const templateIdsSorted = [...templatesById.keys()].sort((a, b) => b.length - a.length);
  return { templates, templatesById, templateIdsSorted };
}

function matchTemplateIdFromStem(stem, templateIdsSorted) {
  for (const tid of templateIdsSorted) {
    if (stem === tid || stem.startsWith(tid + "-")) return tid;
  }
  return null;
}

function parseStem(stem, templateId) {
  // stem: template-education-zh-dna-double-helix
  // -> locale=zh, slug=dna-double-helix
  let rest = stem.slice(templateId.length);
  if (rest.startsWith("-")) rest = rest.slice(1);
  if (!rest) return { localeFromName: null, slug: "" };

  const parts = rest.split("-", 2);
  if (parts.length === 2 && LOCALE_RE.test(parts[0])) {
    return { localeFromName: parts[0], slug: rest.slice(parts[0].length + 1) };
  }
  return { localeFromName: null, slug: rest };
}

function chooseLocaleForTemplate(templateObj, localeFromName) {
  const tplLocales = (templateObj && typeof templateObj.locales === "object" && templateObj.locales) || {};
  const keys = Object.keys(tplLocales);

  if (localeFromName && tplLocales[localeFromName]) return localeFromName;
  if (keys.length === 1) return keys[0];
  if (tplLocales.zh) return "zh";
  if (tplLocales.en) return "en";
  return keys[0] || null;
}

function getCategory(templateObj, locale) {
  const tplLocales = templateObj?.locales || {};
  const cat = tplLocales?.[locale]?.category;
  return typeof cat === "string" ? cat.trim() : undefined;
}

function inferParams(templateObj, slug) {
  // Best-effort:
  // - if template has exactly 1 parameter under the chosen locale OR top-level, fill it using slug
  const slugText = (slug || "").replace(/-/g, " ").trim();

  // Prefer locale parameters if present, but we may not know locale here; fallback to scanning any locale.
  // Also allow top-level "parameters" if your templates are structured that way.
  const topParams = Array.isArray(templateObj?.parameters) ? templateObj.parameters : null;

  if (topParams && topParams.length === 1 && typeof topParams[0]?.name === "string") {
    return { [topParams[0].name]: slugText };
  }

  const locales = templateObj?.locales && typeof templateObj.locales === "object" ? templateObj.locales : {};
  for (const loc of Object.keys(locales)) {
    const lp = locales[loc]?.parameters;
    if (Array.isArray(lp) && lp.length === 1 && typeof lp[0]?.name === "string") {
      return { [lp[0].name]: slugText };
    }
  }

  return {};
}

function pickTitle(params, slug, fallbackStem) {
  // Similar heuristic as your python
  const preferredKeys = ["topic", "book_name", "costume_style", "scene_type", "character_name", "herb_name"];
  for (const k of preferredKeys) {
    const v = params?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  if (params && typeof params === "object") {
    for (const v of Object.values(params)) {
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  if (slug) return slug.replace(/-/g, " ").trim();
  return fallbackStem;
}

async function copyFileIfNeeded(src, dst, dryRun) {
  await ensureDir(path.dirname(dst));
  if (dryRun) return;
  await fsp.copyFile(src, dst);
}

async function generatePreviewWithSizeCap(srcPath, outPath, dryRun) {
  await ensureDir(path.dirname(outPath));
  if (dryRun) return;

  // Always output jpeg preview
  let quality = START_QUALITY;

  // Read & resize once
  const base = sharp(srcPath).rotate().resize({
    width: MAX_SIZE,
    height: MAX_SIZE,
    fit: "inside",
    withoutEnlargement: true,
  });

  // Try decreasing quality until <= MAX_PREVIEW_KB or MIN_QUALITY
  while (true) {
    await base
      .clone()
      .jpeg({ quality, mozjpeg: true })
      .toFile(outPath);

    const stat = await fsp.stat(outPath);
    const kb = stat.size / 1024;

    if (kb <= MAX_PREVIEW_KB || quality <= MIN_QUALITY) break;
    quality -= QUALITY_STEP;
  }
}

function buildExistingImageSet(nanoInspJson) {
  // supports either array or { items: [...] } if you ever wrap it
  const items = Array.isArray(nanoInspJson)
    ? nanoInspJson
    : Array.isArray(nanoInspJson?.items)
      ? nanoInspJson.items
      : [];

  const existingImageUrls = new Set();
  const existingFileNames = new Set();

  for (const it of items) {
    const url = it?.asset?.image_url;
    if (typeof url === "string") {
      existingImageUrls.add(url);
      existingFileNames.add(path.posix.basename(url));
    }
  }
  return { items, existingImageUrls, existingFileNames };
}

function countByTemplate(items) {
  const m = new Map();
  for (const it of items) {
    const tid = it?.template_id;
    if (typeof tid !== "string") continue;
    m.set(tid, (m.get(tid) || 0) + 1);
  }
  return m;
}

async function main() {
  const args = parseArgs(process.argv);

  const SOURCE_DIR = path.resolve(args.source);
  const IMAGE_DIR = path.resolve(args.imageDir);
  const PREVIEW_DIR = path.resolve(args.previewDir);
  const TEMPLATE_JSON_PATH = path.resolve(args.templateJson);
  const INSP_JSON_PATH = path.resolve(args.inspirationJson);

  console.log("=== sync_nano_inspiration ===");
  console.log("SOURCE_DIR:", SOURCE_DIR);
  console.log("IMAGE_DIR:", IMAGE_DIR);
  console.log("PREVIEW_DIR:", PREVIEW_DIR);
  console.log("TEMPLATE_JSON:", TEMPLATE_JSON_PATH);
  console.log("NANO_INSP_JSON:", INSP_JSON_PATH);
  console.log("dryRun:", args.dryRun, "| sync:", args.sync, "| bucket:", args.bucket);
  console.log("");

  await ensureDir(IMAGE_DIR);
  await ensureDir(PREVIEW_DIR);

  // Load jsons
  const templateJson = await readJson(TEMPLATE_JSON_PATH);
  const { templatesById, templateIdsSorted } = normalizeTemplates(templateJson);

  const nanoInspJson = await readJson(INSP_JSON_PATH);
  const { items: existingItems, existingFileNames } = buildExistingImageSet(nanoInspJson);

  // Scan source
  const allFiles = await walkFilesRecursive(SOURCE_DIR);
  const imageFiles = allFiles.filter(isImageFile);

  console.log(`📌 Found ${imageFiles.length} image files (.png/.jpg/.jpeg) under SOURCE_DIR`);

  const matched = [];
  const unmatched = [];
  const addedRecords = [];

  // Process
  for (const filePath of imageFiles) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const stem = path.basename(fileName, ext);

    // already exists in nano_inspiration.json?
    if (existingFileNames.has(fileName)) {
      continue;
    }

    // template match by stem prefix
    const templateId = matchTemplateIdFromStem(stem, templateIdsSorted);
    if (!templateId) {
      unmatched.push(fileName);
      continue;
    }

    matched.push(fileName);

    const tpl = templatesById.get(templateId);
    const { localeFromName, slug } = parseStem(stem, templateId);
    const locale = chooseLocaleForTemplate(tpl, localeFromName);

    // Copy raw image
    const dstImageFsPath = path.join(IMAGE_DIR, fileName);
    await copyFileIfNeeded(filePath, dstImageFsPath, args.dryRun);

    // Generate preview (always jpg)
    const previewFileName = `${stem}-prev.jpg`;
    const dstPreviewFsPath = path.join(PREVIEW_DIR, previewFileName);
    await generatePreviewWithSizeCap(dstImageFsPath, dstPreviewFsPath, args.dryRun);

    // Build record (schema per your example)
    const params = inferParams(tpl, slug);

    const title = pickTitle(params, slug, stem);
    const category = locale ? getCategory(tpl, locale) : undefined;

    const recId = stem; // keep stable id = filename stem

    const localesOut = {};
    if (locale) {
      localesOut[locale] = {};
      if (category) localesOut[locale].category = category;
      localesOut[locale].title = title;
    }

    const record = {
      id: recId,
      template_id: templateId,
      asset: {
        image_url: `${PUBLIC_IMAGE_URL_PREFIX}${fileName}`,
        preview_image_url: `${PUBLIC_PREVIEW_URL_PREFIX}${previewFileName}`,
      },
      params,
      locales: localesOut,
    };

    addedRecords.push(record);
  }

  // Update nano_inspiration.json
  if (addedRecords.length > 0) {
    const newItems = existingItems.concat(addedRecords);

    // Preserve original shape (array vs {items:[]})
    const outJson = Array.isArray(nanoInspJson) ? newItems : { ...nanoInspJson, items: newItems };

    if (!args.dryRun) {
      await writeJson(INSP_JSON_PATH, outJson);
    }

    console.log(`✅ Added ${addedRecords.length} new inspiration records to nano_inspiration.json`);
  } else {
    console.log("✅ No new images to add (all already present or unmatched).");
  }

  // Console output: matched/unmatched
  console.log("");
  console.log("=== Template Match Summary ===");
  console.log(`Matched:   ${matched.length}`);
  console.log(`Unmatched: ${unmatched.length}`);

  if (unmatched.length) {
    console.log("\n--- Unmatched files (no template prefix match) ---");
    for (const f of unmatched) console.log("  -", f);
  }

  if (matched.length) {
    console.log("\n--- Matched files ---");
    for (const f of matched) console.log("  -", f);
  }

  // Count images per template (including existing + newly added)
  const finalNanoInsp = await readJson(INSP_JSON_PATH);
  const finalItems = Array.isArray(finalNanoInsp)
    ? finalNanoInsp
    : Array.isArray(finalNanoInsp?.items)
      ? finalNanoInsp.items
      : [];

  const counts = countByTemplate(finalItems);
  const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  console.log("\n=== Images per template ===");
  for (const [tid, n] of sortedCounts) {
    console.log(`${tid}: ${n}`);
  }

  // Sync to CDN
  if (args.sync) {
    if (args.dryRun) {
      console.log("\n(dry-run) Skipping gsutil sync.");
      return;
    }

    console.log(`\n⏫ Syncing nano_insp + nano_insp_preview to ${args.bucket} ...`);

    // Only sync these two folders (fast + safe)
    // You can switch to rsync -r if you prefer mirroring.
    execSync(
      `gsutil -m rsync -r "${path.join(REPO_ROOT, "public/images/nano_insp")}" "${args.bucket}/images/nano_insp"`,
      { stdio: "inherit" }
    );
    execSync(
      `gsutil -m rsync -r "${path.join(REPO_ROOT, "public/images/nano_insp_preview")}" "${args.bucket}/images/nano_insp_preview"`,
      { stdio: "inherit" }
    );

    console.log("✨ Done syncing.");
  } else {
    console.log("\n(skip) CDN sync not requested. Use --sync to upload via gsutil.");
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});