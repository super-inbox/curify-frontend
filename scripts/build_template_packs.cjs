// scripts/build_template_packs.cjs
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
    skipBuild: false,
    only: null,
  };

  for (const arg of argv) {
    if (arg === "--skip-build") {
      args.skipBuild = true;
    } else if (arg.startsWith("--only=")) {
      const raw = arg.slice("--only=".length).trim();
      args.only = raw
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
  }

  return args;
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

async function main() {
  const args = parseArgs(process.argv.slice(2));

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
  console.log(`Mode: ${args.skipBuild ? "upload-only (--skip-build)" : "build+upload"}`);

  mkdirp(PACKS_DIR);
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
        templateId,
        zipPath: path.relative(ROOT, uploaded.zipPath),
        blobPath: uploaded.blobPath,
        blobUrl: uploaded.blobUrl,
      });
    } catch (err) {
      console.error(`Failed for ${templateId}:`, err.message || err);
    }
  }

  console.log("\nSummary:");
  for (const row of summary) {
    console.log(`- ${row.templateId}`);
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