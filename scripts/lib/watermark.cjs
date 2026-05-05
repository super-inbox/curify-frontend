/**
 * Shared watermark helpers for image scripts.
 *
 * Backed by ImageMagick 7 (`magick` CLI). Two modes:
 *   - applyTiledWatermark: low-opacity slanted curify logo tiled across the image.
 *   - applyCornerWatermark: small opaque logo in the bottom-right corner.
 *
 * Used by:
 *   - scripts/watermark_template_images.cjs (one-off batch by template_id)
 *   - scripts/sync_nano_inspiration.cjs (in-line during ingest before CDN upload)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEFAULT_LOGO_PATH = path.join(__dirname, '..', '..', 'public', 'logo.svg');

// Tiled-mode defaults
const TILE_DEFAULTS = {
  logoPct: 0.22,        // logo width as fraction of image width
  spacingFactor: 1.8,   // canvas extent multiple of logo, controls gap between tiles
  opacity: 0.15,        // 0–1
  rotate: -30,          // degrees
};

// Corner-mode defaults
const CORNER_DEFAULTS = {
  logoPctFull: 0.20,
  logoPctPreview: 0.20,
  paddingFull: 20,
  paddingPreview: 10,
};

function imageWidth(filePath) {
  return parseInt(
    execSync(`magick identify -format "%w" "${filePath}"`).toString().trim(),
    10
  );
}

function imageDims(filePath) {
  return execSync(`magick identify -format "%wx%h" "${filePath}"`).toString().trim();
}

/**
 * Tile a slanted, low-opacity logo across the source image.
 *
 * @param {string} srcPath
 * @param {string} destPath - may equal srcPath to overwrite in place
 * @param {object} [opts]
 * @param {string} [opts.logoPath]      override DEFAULT_LOGO_PATH
 * @param {number} [opts.logoPct]       fraction of image width (default 0.22)
 * @param {number} [opts.spacingFactor] tile spacing multiple (default 1.8)
 * @param {number} [opts.opacity]       0–1 (default 0.15)
 * @param {number} [opts.rotate]        degrees (default -30)
 */
function applyTiledWatermark(srcPath, destPath, opts = {}) {
  const logoPath = opts.logoPath || DEFAULT_LOGO_PATH;
  const cfg = { ...TILE_DEFAULTS, ...opts };

  const w = imageWidth(srcPath);
  const logoPx = Math.round(w * cfg.logoPct);

  const tmpLogo = destPath + '_tile_logo.png';
  const tmpOverlay = destPath + '_overlay.png';

  try {
    // Step 1: resize, rotate, and apply opacity to the logo
    execSync(
      `magick -background none "${logoPath}" -resize ${logoPx}x ` +
        `-rotate ${cfg.rotate} -alpha set -channel A -evaluate multiply ${cfg.opacity} +channel ` +
        `"${tmpLogo}"`,
      { stdio: 'pipe' }
    );

    // Step 1.5: extend canvas around the logo to control tile spacing
    const [lw, lh] = imageDims(tmpLogo).split('x').map(Number);
    const paddedW = Math.round(lw * cfg.spacingFactor);
    const paddedH = Math.round(lh * cfg.spacingFactor);
    execSync(
      `magick "${tmpLogo}" -gravity center -background none -extent ${paddedW}x${paddedH} "${tmpLogo}"`,
      { stdio: 'pipe' }
    );

    // Step 2: tile the prepared logo to source dimensions
    execSync(
      `magick -size ${imageDims(srcPath)} tile:"${tmpLogo}" "${tmpOverlay}"`,
      { stdio: 'pipe' }
    );

    // Step 3: composite onto source — write to destPath (may equal srcPath)
    execSync(
      `magick "${srcPath}" "${tmpOverlay}" -composite "${destPath}"`,
      { stdio: 'pipe' }
    );
  } finally {
    for (const f of [tmpLogo, tmpOverlay]) {
      try { fs.unlinkSync(f); } catch (_) {}
    }
  }
}

/**
 * Drop the curify logo opaquely into the bottom-right corner.
 *
 * @param {string} srcPath
 * @param {string} destPath
 * @param {object} [opts]
 * @param {string} [opts.logoPath]
 * @param {number} [opts.logoPct]   fraction of image width
 * @param {number} [opts.padding]   pixels from the edge
 */
function applyCornerWatermark(srcPath, destPath, opts = {}) {
  const logoPath = opts.logoPath || DEFAULT_LOGO_PATH;
  const w = imageWidth(srcPath);
  const logoPct = opts.logoPct ?? CORNER_DEFAULTS.logoPctFull;
  const padding = opts.padding ?? CORNER_DEFAULTS.paddingFull;
  const logoPx = Math.round(w * logoPct);

  execSync(
    `magick "${srcPath}" ` +
      `\\( -background none "${logoPath}" -resize ${logoPx}x \\) ` +
      `-gravity SouthEast -geometry +${padding}+${padding} ` +
      `-composite "${destPath}"`,
    { stdio: 'pipe' }
  );
}

module.exports = {
  applyTiledWatermark,
  applyCornerWatermark,
  DEFAULT_LOGO_PATH,
  TILE_DEFAULTS,
  CORNER_DEFAULTS,
};
