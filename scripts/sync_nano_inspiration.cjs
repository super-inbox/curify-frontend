// /scripts/sync_nano_inspiration.cjs
/* eslint-disable no-console */
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const { applyTiledWatermark } = require("./lib/watermark.cjs");

// --- Load .env.local (and .env as fallback) from repo root ---
(function loadEnv() {
  const REPO_ROOT = path.resolve(__dirname, "..");
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(REPO_ROOT, file);
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
    console.log(`Loaded env from ${file}`);
  }
})();

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

// --- OPTIONAL dependency (required for Supabase source) ---
let pg;
try {
  pg = require("pg");
} catch (e) {
  pg = null; // only needed when --supabase flag is used
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

function normalizeDashes(str) {
  return String(str)
    .normalize("NFKC")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-");
}

// Only strip the locale segment you explicitly want to remove.
function stripLocaleSegmentFromStem(stem) {
  return normalizeDashes(stem).replace(/-(en|zh)-/g, "-");
}

function parseArgs(argv) {
  const rawPgUrl = process.env.DATABASE_URL || "";
  const defaultPgUrl = rawPgUrl.replace("postgresql+asyncpg://", "postgresql://");

  const out = {
    source: DEFAULT_SOURCE_DIR,
    imageDir: DEFAULT_IMAGE_DIR,
    previewDir: DEFAULT_PREVIEW_DIR,
    templateJson: DEFAULT_TEMPLATE_JSON,
    inspirationJson: DEFAULT_INSP_JSON,
    sync: false,
    bucket: DEFAULT_BUCKET,
    dryRun: false,
    supabase: false,
    pgUrl: defaultPgUrl,
    supabaseStatus: "COMPLETED",
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
    else if (a === "--supabase") out.supabase = true;
    else if (a.startsWith("--pg-url=")) out.pgUrl = a.split("=").slice(1).join("=");
    else if (a.startsWith("--supabase-status=")) out.supabaseStatus = a.split("=").slice(1).join("=");
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
  const normalizedStem = normalizeDashes(stem);
  for (const tid of templateIdsSorted) {
    const normalizedTid = normalizeDashes(tid);
    if (normalizedStem === normalizedTid || normalizedStem.startsWith(normalizedTid + "-")) {
      return tid;
    }
  }
  return null;
}

function parseStem(stem, templateId) {
  // stem: template-education-zh-dna-double-helix
  // -> locale=zh, slug=dna-double-helix
  const normalizedStem = normalizeDashes(stem);
  const normalizedTemplateId = normalizeDashes(templateId);

  let rest = normalizedStem.slice(normalizedTemplateId.length);
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
  const slugText = (slug || "").replace(/-/g, " ").trim();

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
  // Apply slanted curify watermark to the full image in place. The preview
  // is generated from this file later, so it inherits the watermark too —
  // no separate preview-watermark call needed.
  applyTiledWatermark(dst, dst);
}

async function generatePreviewWithSizeCap(srcPath, outPath, dryRun) {
  await ensureDir(path.dirname(outPath));
  if (dryRun) return;

  let quality = START_QUALITY;

  const base = sharp(srcPath).rotate().resize({
    width: MAX_SIZE,
    height: MAX_SIZE,
    fit: "inside",
    withoutEnlargement: true,
  });

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

      const baseName = path.posix.basename(url);
      const baseExt = path.posix.extname(baseName).toLowerCase();
      const baseStem = path.posix.basename(baseName, baseExt);
      const normalizedBaseName = `${stripLocaleSegmentFromStem(baseStem)}${baseExt}`;
      existingFileNames.add(normalizedBaseName);
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

// ===================== SUPABASE SOURCE =====================

async function fetchSupabaseJobs(pgUrl, status) {
  if (!pg) {
    console.error("❌ Missing dependency: pg\n  Install it first: npm i pg\n  Then rerun the script.");
    process.exit(1);
  }
  const client = new pg.Client({
    connectionString: pgUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  const res = await client.query(
    `SELECT project_id, runtime_config FROM project WHERE job_settings_raw->>'job_type' = 'nano_template_generation' AND status = $1`,
    [status]
  );
  await client.end();
  return res.rows;
}

function buildSupabaseRecord(job, templatesById) {
  const cfg = job.runtime_config;
  if (!cfg || !cfg.example_id || !cfg.gcs_object_path || !cfg.preview_gcs_object_path || !cfg.template_id) {
    console.warn(`  ⚠️ Skipping project ${job.project_id}: missing required runtime_config fields`);
    return null;
  }

  const { example_id, gcs_object_path, preview_gcs_object_path, template_id, locale, params } = cfg;
  const tpl = templatesById.get(template_id);
  if (!tpl) {
    console.warn(`  ⚠️ Skipping ${example_id}: unknown template_id "${template_id}"`);
    return null;
  }

  const imageStem = path.posix.basename(gcs_object_path, path.posix.extname(gcs_object_path));
  const title = pickTitle(params || {}, null, imageStem);
  const localesOut = {};
  if (locale) {
    const category = getCategory(tpl, locale);
    localesOut[locale] = {};
    if (category) localesOut[locale].category = category;
    localesOut[locale].title = title;
  }

  return {
    id: example_id,
    template_id,
    asset: {
      image_url: `/${gcs_object_path}`,
      preview_image_url: `/${preview_gcs_object_path}`,
    },
    params: params || {},
    ...(locale ? { locales: localesOut } : {}),
  };
}

// ===========================================================

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
  if (args.supabase) console.log("supabase: enabled | status filter:", args.supabaseStatus);
  console.log("");

  await ensureDir(IMAGE_DIR);
  await ensureDir(PREVIEW_DIR);

  const templateJson = await readJson(TEMPLATE_JSON_PATH);
  const { templatesById, templateIdsSorted } = normalizeTemplates(templateJson);

  const nanoInspJson = await readJson(INSP_JSON_PATH);
  const { items: existingItems, existingFileNames } = buildExistingImageSet(nanoInspJson);

  const allFiles = await walkFilesRecursive(SOURCE_DIR);
  const imageFiles = allFiles.filter(isImageFile);

  console.log(`📌 Found ${imageFiles.length} image files (.png/.jpg/.jpeg) under SOURCE_DIR`);

  const matched = [];
  const unmatched = [];
  const addedRecords = [];

  for (const filePath of imageFiles) {
    const originalFileName = path.basename(filePath);
    const ext = path.extname(originalFileName).toLowerCase();
    const rawStem = path.basename(originalFileName, ext);
    const stem = normalizeDashes(rawStem);

    const cleanedStem = stripLocaleSegmentFromStem(stem);
    const cleanedFileName = `${cleanedStem}${ext}`;

    if (existingFileNames.has(cleanedFileName)) {
      continue;
    }

    const templateId = matchTemplateIdFromStem(stem, templateIdsSorted);
    if (!templateId) {
      unmatched.push(originalFileName);
      continue;
    }

    matched.push(originalFileName);

    const tpl = templatesById.get(templateId);
    const { localeFromName, slug } = parseStem(stem, templateId);
    const locale = chooseLocaleForTemplate(tpl, localeFromName);

    const dstImageFsPath = path.join(IMAGE_DIR, cleanedFileName);
    await copyFileIfNeeded(filePath, dstImageFsPath, args.dryRun);

    const previewFileName = `${cleanedStem}-prev.jpg`;
    const dstPreviewFsPath = path.join(PREVIEW_DIR, previewFileName);
    await generatePreviewWithSizeCap(dstImageFsPath, dstPreviewFsPath, args.dryRun);

    const params = inferParams(tpl, slug);
    const title = pickTitle(params, slug, cleanedStem);
    const category = locale ? getCategory(tpl, locale) : undefined;

    const recId = cleanedStem;

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
        image_url: `${PUBLIC_IMAGE_URL_PREFIX}${cleanedFileName}`,
        preview_image_url: `${PUBLIC_PREVIEW_URL_PREFIX}${previewFileName}`,
      },
      params,
      locales: localesOut,
    };

    addedRecords.push(record);
  }

  // ---- Supabase source ----
  const supabaseRecords = [];
  if (args.supabase) {
    console.log("\n=== Supabase source ===");
    const existingIds = new Set(existingItems.map((it) => it.id).filter(Boolean));

    let jobs;
    try {
      jobs = await fetchSupabaseJobs(args.pgUrl, args.supabaseStatus);
      console.log(`📌 Found ${jobs.length} jobs with status="${args.supabaseStatus}"`);
    } catch (e) {
      console.error("❌ Failed to query Supabase:", e.message);
      jobs = [];
    }

    for (const job of jobs) {
      const cfg = job.runtime_config;
      if (cfg?.example_id && existingIds.has(cfg.example_id)) continue;

      const record = buildSupabaseRecord(job, templatesById);
      if (record) {
        supabaseRecords.push(record);
        existingIds.add(record.id);
      }
    }

    console.log(`✅ ${supabaseRecords.length} new records from Supabase`);
  }

  const allNewRecords = [...addedRecords, ...supabaseRecords];

  let finalNanoInsp;
  if (allNewRecords.length > 0) {
    const newItems = existingItems.concat(allNewRecords);
    const outJson = Array.isArray(nanoInspJson) ? newItems : { ...nanoInspJson, items: newItems };

    if (!args.dryRun) {
      await writeJson(INSP_JSON_PATH, outJson);
    }

    finalNanoInsp = outJson;
    console.log(`\n✅ Added ${allNewRecords.length} new records total (${addedRecords.length} from files, ${supabaseRecords.length} from Supabase)`);
  } else {
    finalNanoInsp = nanoInspJson;
    console.log("✅ No new records to add.");
  }

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

  if (args.sync) {
    if (args.dryRun) {
      console.log("\n(dry-run) Skipping gsutil sync.");
      return;
    }

    console.log(`\n⏫ Syncing nano_insp + nano_insp_preview to ${args.bucket} ...`);

    const gsutilFlags = `-m -o "GSUtil:parallel_process_count=1"`;
    execSync(
      `gsutil ${gsutilFlags} rsync -r "${path.join(REPO_ROOT, "public/images/nano_insp")}" "${args.bucket}/images/nano_insp"`,
      { stdio: "inherit" }
    );
    execSync(
      `gsutil ${gsutilFlags} rsync -r "${path.join(REPO_ROOT, "public/images/nano_insp_preview")}" "${args.bucket}/images/nano_insp_preview"`,
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