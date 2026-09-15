/**
 * 夏可 一套5张 — pick the selected takes into final/ and stamp the slanted
 * Curify watermark.
 *
 * Reuses scripts/lib/watermark.cjs applyTiledWatermark (the -30 degree tiled
 * mode) rather than rolling a new one — same stamp the gallery images carry.
 * Clean unstamped masters stay in output/, only final/ is watermarked, so a
 * clean set can be released later without regenerating anything.
 *
 *   node scripts/oneoff_xiake_finalize_2026-09-10.cjs
 */
const fs = require("fs");
const path = require("path");
const { applyTiledWatermark } = require("./lib/watermark.cjs");

const OUT = "/Users/qqwjq/curify-gallery/client_VC_portfolio/夏可测试（一套5张）/output";
const FINAL = path.join(OUT, "final");

// chosen take -> delivered filename
const PICKS = [
  ["anchor-03.png", "01-棚拍-正面.png"],
  // v2: take 03 is the one that renders the 侧面抽褶. The v1 take is in
  // v2-shot2/ — it had a smooth side seam and a fan of drag creases.
  ["shot-2-studio-03.png", "02-棚拍-背面.png"],
  ["shot-3-outdoor-02.png", "03-外景-街角店铺.png"],
  ["shot-4-outdoor-01.png", "04-外景-墙边光影.png"],
  ["shot-5-outdoor-01.png", "05-外景-林荫人行道.png"],
];

fs.mkdirSync(FINAL, { recursive: true });
for (const [src, dst] of PICKS) {
  const s = path.join(OUT, src);
  if (!fs.existsSync(s)) throw new Error(`missing pick: ${s}`);
  const d = path.join(FINAL, dst);
  process.stdout.write(`${src} -> final/${dst} ... `);
  applyTiledWatermark(s, d, { logoPct: 0.2, spacingFactor: 2.1, opacity: 0.13, rotate: -30 });
  console.log("ok");
}
console.log(`\n${PICKS.length} watermarked -> ${FINAL}`);
