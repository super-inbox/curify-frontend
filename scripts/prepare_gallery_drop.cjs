/** Prepare watermarked CDN JPEGs from original renders. Does not upload. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { applyTiledWatermark } = require('./lib/watermark.cjs');

async function main() {
  const [manifestPath, sourceDir, outputDir] = process.argv.slice(2);
  if (!manifestPath || !sourceDir || !outputDir) throw new Error('Usage: node scripts/prepare_gallery_drop.cjs MANIFEST SOURCE_DIR OUTPUT_DIR');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  fs.mkdirSync(outputDir, { recursive: true });
  // Validate every original before producing any output.
  for (const item of manifest.items) {
    if (path.basename(item.sourceFile) !== item.sourceFile || path.basename(item.outputFile) !== item.outputFile) throw new Error('Filenames must not contain paths');
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(sourceDir, item.sourceFile))).digest('hex');
    if (digest !== item.sourceSha256) throw new Error(`Source checksum mismatch: ${item.sourceFile}`);
  }
  for (const item of manifest.items) {
    const source = path.join(sourceDir, item.sourceFile);
    const output = path.join(outputDir, item.outputFile);
    const intermediate = output + '.watermarked.png';
    try {
      applyTiledWatermark(source, intermediate);
      await sharp(intermediate).jpeg({ quality: 92, mozjpeg: true }).toFile(output);
      console.log(`${item.entry.id}: ${item.outputFile}`);
    } finally {
      if (fs.existsSync(intermediate)) fs.unlinkSync(intermediate);
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
