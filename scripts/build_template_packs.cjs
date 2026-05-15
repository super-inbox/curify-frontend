// scripts/build_template_packs.cjs
//
// Two modes:
//
//   --mode=template (default — backwards compatible)
//     For each template with batch=true (or filtered via --only=id,id):
//     picks 5 random inspirations, downloads from CDN, zips to
//     packs/<template_id>/pack.zip, uploads to Azure at the same path.
//
//   --mode=sku
//     For each SKU folder named via --sku=name,name (or all subfolders
//     under packs/ that are not legacy template-* prefixed): zips ALL
//     local images in packs/<sku>/ flat, uploads to Azure at
//     packs/sku/<sku>/pack-v<N>.zip. Source images are expected to
//     already be curated and present locally. No CDN download, no
//     random sampling.
//
// Examples:
//   node scripts/build_template_packs.cjs
//   node scripts/build_template_packs.cjs --only=template-foo --skip-build
//   node scripts/build_template_packs.cjs --mode=sku --sku=mbti-character
//   node scripts/build_template_packs.cjs --mode=sku --sku=mbti-character,vocabulary --version=2
//   node scripts/build_template_packs.cjs --mode=sku --sku=mbti-character --skip-build

require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { BlobServiceClient } = require("@azure/storage-blob");

const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.curify-ai.com";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME =
  process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING in .env.local");
}
if (!AZURE_STORAGE_CONTAINER_NAME) {
  throw new Error("Missing AZURE_STORAGE_CONTAINER_NAME in .env.local");
}

const ROOT = process.cwd();
const TEMPLATES_JSON = path.join(ROOT, "public", "data", "nano_templates.json");
const INSPIRATION_JSON = path.join(ROOT, "public", "data", "nano_inspiration.json");
const PACKS_DIR = path.join(ROOT, "packs");
const TMP_DIR = path.join(ROOT, ".tmp_packs");

function parseArgs(argv) {
  const args = {
    mode: "template",
    skipBuild: false,
    only: null,
    skus: null,
    version: 1,
  };

  for (const arg of argv) {
    if (arg === "--skip-build") {
      args.skipBuild = true;
    } else if (arg.startsWith("--mode=")) {
      args.mode = arg.slice("--mode=".length).trim();
    } else if (arg.startsWith("--only=")) {
      const raw = arg.slice("--only=".length).trim();
      args.only = raw
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    } else if (arg.startsWith("--sku=")) {
      const raw = arg.slice("--sku=".length).trim();
      args.skus = raw
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    } else if (arg.startsWith("--version=")) {
      args.version = parseInt(arg.slice("--version=".length), 10);
    }
  }

  if (!["template", "sku"].includes(args.mode)) {
    throw new Error(`--mode must be 'template' or 'sku', got '${args.mode}'`);
  }
  if (args.mode === "sku" && (!Number.isFinite(args.version) || args.version < 1)) {
    throw new Error("--version must be a positive integer");
  }

  return args;
}

const SKU_IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function listLocalImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && SKU_IMG_EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => path.join(dir, e.name))
    .sort();
}

function localSkuZipPath(sku) {
  return path.join(PACKS_DIR, sku, "pack.zip");
}

function blobSkuPath(sku, version) {
  return `packs/sku/${sku}/pack-v${version}.zip`;
}

function buildSkuPack(sku) {
  const srcDir = path.join(PACKS_DIR, sku);
  const files = listLocalImages(srcDir);
  if (files.length === 0) {
    console.warn(`Skip ${sku}: no images in ${path.relative(ROOT, srcDir)}/`);
    return null;
  }

  const zipPath = localSkuZipPath(sku);
  console.log(`\nBuilding sku pack: ${sku}`);
  console.log(`Zipping ${files.length} images from ${path.relative(ROOT, srcDir)}/`);
  buildZip(zipPath, files);
  console.log(`Saved: ${path.relative(ROOT, zipPath)}`);
  return zipPath;
}

async function uploadSkuPack(sku, version) {
  const zipPath = localSkuZipPath(sku);
  ensureFileExists(zipPath, `Pack zip not found for sku '${sku}': ${path.relative(ROOT, zipPath)}`);
  const blobPath = blobSkuPath(sku, version);
  console.log(`Uploading: ${path.relative(ROOT, zipPath)} -> ${blobPath}`);
  const blobUrl = await uploadFileToAzure(zipPath, blobPath);
  console.log(`Uploaded: ${blobUrl}`);
  return { zipPath, blobPath, blobUrl };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function mkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  if (arr.length <= n) return [...arr];
  return shuffle(arr).slice(0, n);
}

function safeUnlink(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function ensureFileExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    throw new Error(message || `Missing file: ${filePath}`);
  }
}

async function downloadFile(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

function buildZip(zipPath, files) {
  safeUnlink(zipPath);

  const result = spawnSync("zip", ["-j", zipPath, ...files], {
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`zip failed: ${zipPath}`);
  }
}

function extFromImageUrl(imageUrl) {
  const clean = imageUrl.split("?")[0];
  const ext = path.extname(clean).toLowerCase();
  return ext || ".jpg";
}

function normalizeCdnUrl(imagePath) {
  return `${CDN_BASE.replace(/\/$/, "")}${imagePath}`;
}

function localPackZipPath(templateId) {
  return path.join(PACKS_DIR, templateId, "pack.zip");
}

function blobPackPath(templateId) {
  return `packs/${templateId}/pack.zip`;
}

async function uploadFileToAzure(localFilePath, blobPath) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(
    AZURE_STORAGE_CONTAINER_NAME
  );
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  await blockBlobClient.uploadFile(localFilePath, {
    blobHTTPHeaders: {
      blobContentType: "application/zip",
    },
  });

  return blockBlobClient.url;
}

async function buildPackForTemplate(templateId, inspirations) {
  const items = inspirations.filter(
    (item) =>
      item &&
      item.template_id === templateId &&
      item.asset &&
      typeof item.asset.image_url === "string" &&
      item.asset.image_url.trim() !== ""
  );

  if (!items.length) {
    console.warn(`Skip ${templateId}: no images`);
    return null;
  }

  const picked = pickRandom(items, 5);
  const tempDir = path.join(TMP_DIR, templateId);
  mkdirp(tempDir);

  const downloadedFiles = [];

  console.log(`\nBuilding pack: ${templateId}`);
  console.log(`Found ${items.length} candidate images, picking ${picked.length}`);

  for (let i = 0; i < picked.length; i++) {
    const item = picked[i];
    const imagePath = item.asset.image_url;
    const url = normalizeCdnUrl(imagePath);
    const ext = extFromImageUrl(imagePath);
    const fileName = `${item.id || `image-${i + 1}`}${ext}`;
    const outputPath = path.join(tempDir, fileName);

    console.log(`Downloading: ${url}`);
    await downloadFile(url, outputPath);
    downloadedFiles.push(outputPath);
  }

  const packDir = path.join(PACKS_DIR, templateId);
  mkdirp(packDir);

  const zipPath = localPackZipPath(templateId);
  buildZip(zipPath, downloadedFiles);

  console.log(`Saved: ${path.relative(ROOT, zipPath)}`);
  return zipPath;
}

async function uploadPackForTemplate(templateId) {
  const zipPath = localPackZipPath(templateId);
  ensureFileExists(
    zipPath,
    `Pack zip not found for ${templateId}: ${path.relative(ROOT, zipPath)}`
  );

  const blobPath = blobPackPath(templateId);
  console.log(`Uploading: ${path.relative(ROOT, zipPath)} -> ${blobPath}`);

  const blobUrl = await uploadFileToAzure(zipPath, blobPath);
  console.log(`Uploaded: ${blobUrl}`);

  return { zipPath, blobPath, blobUrl };
}

async function runTemplateMode(args) {
  const templates = readJson(TEMPLATES_JSON);
  const inspirations = readJson(INSPIRATION_JSON);

  if (!Array.isArray(templates)) {
    throw new Error("Expected nano_templates.json to be an array");
  }
  if (!Array.isArray(inspirations)) {
    throw new Error("Expected nano_inspiration.json to be an array");
  }

  let batchTemplateIds = templates
    .filter((t) => t && t.batch === true && typeof t.id === "string")
    .map((t) => t.id);

  if (args.only) {
    const onlySet = new Set(args.only);
    batchTemplateIds = batchTemplateIds.filter((id) => onlySet.has(id));
  }

  console.log(`Found ${batchTemplateIds.length} batch templates`);
  console.log(`Action: ${args.skipBuild ? "upload-only (--skip-build)" : "build+upload"}`);

  mkdirp(TMP_DIR);

  const summary = [];

  for (const templateId of batchTemplateIds) {
    try {
      if (!args.skipBuild) {
        const builtZip = await buildPackForTemplate(templateId, inspirations);
        if (!builtZip) continue;
      } else {
        const zipPath = localPackZipPath(templateId);
        if (!fs.existsSync(zipPath)) {
          console.warn(
            `Skip ${templateId}: pack zip does not exist at ${path.relative(ROOT, zipPath)}`
          );
          continue;
        }
        console.log(`\nSkip build for ${templateId}, using existing zip`);
      }

      const uploaded = await uploadPackForTemplate(templateId);
      summary.push({
        id: templateId,
        zipPath: path.relative(ROOT, uploaded.zipPath),
        blobPath: uploaded.blobPath,
        blobUrl: uploaded.blobUrl,
      });
    } catch (err) {
      console.error(`Failed for ${templateId}:`, err.message || err);
    }
  }

  return summary;
}

async function runSkuMode(args) {
  let skus = args.skus;
  if (!skus) {
    // Default: every subfolder under packs/ that is NOT a legacy
    // template-* folder. Skips any folder whose name starts with
    // "template-" since those are handled by template mode.
    skus = fs
      .readdirSync(PACKS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("template-"))
      .map((e) => e.name)
      .sort();
  }

  console.log(`SKU packs: ${skus.length ? skus.join(", ") : "(none)"}`);
  console.log(`Version: v${args.version}`);
  console.log(`Action: ${args.skipBuild ? "upload-only (--skip-build)" : "build+upload"}`);

  const summary = [];

  for (const sku of skus) {
    try {
      if (!args.skipBuild) {
        const builtZip = buildSkuPack(sku);
        if (!builtZip) continue;
      } else {
        const zipPath = localSkuZipPath(sku);
        if (!fs.existsSync(zipPath)) {
          console.warn(`Skip ${sku}: pack zip does not exist at ${path.relative(ROOT, zipPath)}`);
          continue;
        }
        console.log(`\nSkip build for ${sku}, using existing zip`);
      }

      const uploaded = await uploadSkuPack(sku, args.version);
      summary.push({
        id: sku,
        zipPath: path.relative(ROOT, uploaded.zipPath),
        blobPath: uploaded.blobPath,
        blobUrl: uploaded.blobUrl,
      });
    } catch (err) {
      console.error(`Failed for ${sku}:`, err.message || err);
    }
  }

  return summary;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log(`Mode: ${args.mode}`);
  mkdirp(PACKS_DIR);

  const summary =
    args.mode === "template" ? await runTemplateMode(args) : await runSkuMode(args);

  console.log("\nSummary:");
  for (const row of summary) {
    console.log(`- ${row.id}`);
    console.log(`  zip:  ${row.zipPath}`);
    console.log(`  blob: ${row.blobPath}`);
    console.log(`  url:  ${row.blobUrl}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});