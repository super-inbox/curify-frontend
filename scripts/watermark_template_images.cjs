#!/usr/bin/env node
// scripts/watermark_template_images.cjs
//
// Overlays public/logo.svg onto all images for a given template,
// then uploads the watermarked files to GCS.
//
// Usage:
//   node scripts/watermark_template_images.cjs <template-id>
//
// Example:
//   node scripts/watermark_template_images.cjs template-species-science
//
// Requirements: magick (ImageMagick 7), gsutil

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// ── Config ────────────────────────────────────────────────────────────────────

const CDN_BASE      = 'https://cdn.curify-ai.com';
const GCS_BUCKET    = 'gs://curify-static';
const LOGO_PATH     = path.join(__dirname, '../public/logo.svg');
const INSP_JSON     = path.join(__dirname, '../public/data/nano_inspiration.json');

// Logo width as % of image width for full and preview sizes
const LOGO_PCT_FULL    = 0.20;
const LOGO_PCT_PREVIEW = 0.20;
const PADDING_FULL     = 20;
const PADDING_PREVIEW  = 10;

// ── Args ──────────────────────────────────────────────────────────────────────

const templateId = process.argv[2];
if (!templateId) {
  console.error('Usage: node scripts/watermark_template_images.cjs <template-id>');
  process.exit(1);
}

// ── Load inspiration JSON ─────────────────────────────────────────────────────

const records = JSON.parse(fs.readFileSync(INSP_JSON, 'utf-8'));
const images = records.filter(r => r.template_id === templateId);

if (images.length === 0) {
  console.error(`No images found for template_id "${templateId}"`);
  process.exit(1);
}

console.log(`Found ${images.length} images for "${templateId}"`);

// ── Helpers ───────────────────────────────────────────────────────────────────

function downloadImage(url, dest) {
  execSync(`curl -sf "${url}" -o "${dest}"`, { stdio: 'pipe' });
}

function getWidth(filePath) {
  const out = execSync(`magick identify -format "%w" "${filePath}"`).toString().trim();
  return parseInt(out, 10);
}

function overlayLogo(srcPath, destPath, logoPx, padding) {
  execSync(
    `magick "${srcPath}" ` +
    `\\( -background none "${LOGO_PATH}" -resize ${logoPx}x \\) ` +
    `-gravity SouthEast -geometry +${padding}+${padding} ` +
    `-composite "${destPath}"`,
    { stdio: 'pipe' }
  );
}

function uploadToGcs(localPath, gcsPath) {
  execSync(`gsutil cp "${localPath}" "${gcsPath}"`, { stdio: 'inherit' });
}

// ── Main ──────────────────────────────────────────────────────────────────────

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `watermark-${templateId}-`));
console.log(`Working directory: ${tmpDir}\n`);

let success = 0;
let failed = 0;

for (const record of images) {
  const { image_url, preview_image_url } = record.asset;

  for (const [urlPath, isPreview] of [[image_url, false], [preview_image_url, true]]) {
    const filename  = path.basename(urlPath);
    const srcFile   = path.join(tmpDir, filename);
    const destFile  = path.join(tmpDir, `wm_${filename}`);
    const fullUrl   = `${CDN_BASE}${urlPath}`;
    const gcsTarget = `${GCS_BUCKET}${urlPath}`;
    const label     = isPreview ? 'preview' : 'full';

    try {
      process.stdout.write(`  [${label}] ${filename} ... `);

      downloadImage(fullUrl, srcFile);

      const w      = getWidth(srcFile);
      const logoPx = Math.round(w * (isPreview ? LOGO_PCT_PREVIEW : LOGO_PCT_FULL));
      const pad    = isPreview ? PADDING_PREVIEW : PADDING_FULL;

      overlayLogo(srcFile, destFile, logoPx, pad);
      uploadToGcs(destFile, gcsTarget);

      console.log('✓');
      success++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }
}

console.log(`\nDone. ${success} uploaded, ${failed} failed.`);
console.log(`Temp files in: ${tmpDir}`);
