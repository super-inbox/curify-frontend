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
const {
  applyTiledWatermark,
  applyCornerWatermark,
  CORNER_DEFAULTS,
} = require('./lib/watermark.cjs');

// ── Config ────────────────────────────────────────────────────────────────────

const CDN_BASE      = 'https://cdn.curify-ai.com';
const GCS_BUCKET    = 'gs://curify-static';
const INSP_JSON     = path.join(__dirname, '../public/data/nano_inspiration.json');
const LOCAL_INSP_DIR    = path.join(__dirname, '../public/images/nano_insp');
const LOCAL_PREVIEW_DIR = path.join(__dirname, '../public/images/nano_insp_preview');

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const modeArg = args.find(a => a.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'corner';

if (!['corner', 'tiled'].includes(mode)) {
  console.error('--mode must be "corner" or "tiled"');
  process.exit(1);
}

const templateId = args.find(a => !a.startsWith('--'));
if (!templateId) {
  console.error('Usage: node scripts/watermark_template_images.cjs <template-id> [--mode=corner|tiled]');
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

function uploadToGcs(localPath, gcsPath) {
  execSync(`gsutil -o "GSUtil:parallel_process_count=1" cp "${localPath}" "${gcsPath}"`, { stdio: 'inherit' });
}

// ── Main ──────────────────────────────────────────────────────────────────────

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `watermark-${templateId}-`));
console.log(`Mode: ${mode}`);
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

      if (mode === 'tiled') {
        applyTiledWatermark(srcFile, destFile);
      } else {
        applyCornerWatermark(srcFile, destFile, {
          logoPct: isPreview ? CORNER_DEFAULTS.logoPctPreview : CORNER_DEFAULTS.logoPctFull,
          padding: isPreview ? CORNER_DEFAULTS.paddingPreview : CORNER_DEFAULTS.paddingFull,
        });
      }
      uploadToGcs(destFile, gcsTarget);

      // Keep local copy in sync so future --sync runs don't overwrite CDN
      const localDir = isPreview ? LOCAL_PREVIEW_DIR : LOCAL_INSP_DIR;
      const localDest = path.join(localDir, filename);
      fs.mkdirSync(localDir, { recursive: true });
      fs.copyFileSync(destFile, localDest);

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
