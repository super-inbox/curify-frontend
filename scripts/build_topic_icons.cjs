#!/usr/bin/env node
/**
 * Generate dedicated 128px webp topic-strip icons from the source
 * thumbnails in lib/generated/topic_thumbnails.json.
 *
 * Output:
 *   public/images/topic_icon/<slug>.webp  (one per user-visible topic)
 *   lib/generated/topic_icons.json        ({ "<slug>": "/images/topic_icon/<slug>.webp" })
 *
 * Then sync the icon dir to GCS:
 *   gsutil -m cp -r public/images/topic_icon/* gs://curify-static/images/topic_icon/
 *
 * Why bother:
 *   - CdnImage defaults unoptimized=true, so the browser downloads the
 *     full source for every topic tile. Previews are 50-200KB each;
 *     128px webp icons are ~5-15KB. 10× LCP win for the sticky topbar
 *     where ~10 tiles render above the fold.
 *
 * Source resolution:
 *   - Try the local copy first under public/images/<path>.
 *   - Fallback to fetching from the CDN (https://cdn.curify-ai.com/<path>).
 *
 * Requirements: ImageMagick 7 (`magick`), curl.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const SOURCE_MAP = path.join(ROOT, "lib/generated/topic_thumbnails.json");
const LOCAL_BASE = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "public/images/topic_icon");
const OUT_MAP = path.join(ROOT, "lib/generated/topic_icons.json");
const CDN_BASE = "https://cdn.curify-ai.com";

const ICON_WIDTH = 128;
const ICON_QUALITY = 80; // webp quality — 80 is the sweet spot

fs.mkdirSync(OUT_DIR, { recursive: true });

const thumbs = JSON.parse(fs.readFileSync(SOURCE_MAP, "utf-8"));

function ensureSourceLocal(srcRel) {
  const local = path.join(LOCAL_BASE, srcRel);
  if (fs.existsSync(local)) return local;
  // Fall back to fetching from CDN into a temp file
  const tmp = path.join(OUT_DIR, `.tmp-${path.basename(srcRel)}`);
  const cdnUrl = `${CDN_BASE}${srcRel}`;
  try {
    execSync(`curl -sf "${cdnUrl}" -o "${tmp}"`, { stdio: "pipe" });
    if (!fs.existsSync(tmp) || fs.statSync(tmp).size === 0) {
      throw new Error("empty download");
    }
    return tmp;
  } catch (e) {
    throw new Error(`source unavailable (local + CDN): ${srcRel}: ${e.message}`);
  }
}

const iconMap = {};
let built = 0;
let failed = [];

for (const [slug, srcRel] of Object.entries(thumbs)) {
  const outFile = path.join(OUT_DIR, `${slug}.webp`);
  try {
    const src = ensureSourceLocal(srcRel);
    // ImageMagick: resize to width 128 (height auto), keep aspect, write
    // webp at quality 80. `-strip` drops metadata; `-define webp:method=6`
    // takes a little longer but yields ~20% smaller files.
    execSync(
      `magick "${src}" -strip -resize ${ICON_WIDTH}x -quality ${ICON_QUALITY} -define webp:method=6 "${outFile}"`,
      { stdio: "pipe" }
    );
    // Clean up tmp if used
    if (src.startsWith(OUT_DIR + "/.tmp-")) fs.unlinkSync(src);
    iconMap[slug] = `/images/topic_icon/${slug}.webp`;
    built++;
  } catch (e) {
    console.error(`  ✗ ${slug}: ${e.message}`);
    failed.push(slug);
  }
}

fs.writeFileSync(OUT_MAP, JSON.stringify(iconMap, null, 2) + "\n", "utf-8");

// Compute size win
let totalIconBytes = 0;
for (const v of Object.values(iconMap)) {
  try {
    totalIconBytes += fs.statSync(path.join(LOCAL_BASE, v)).size;
  } catch {}
}
console.log(`\nBuilt ${built}/${Object.keys(thumbs).length} icons → ${OUT_DIR}`);
console.log(`Manifest: ${OUT_MAP}`);
console.log(`Total icon dir size: ${(totalIconBytes / 1024).toFixed(0)} KB (~${(totalIconBytes / built / 1024).toFixed(1)} KB avg)`);
if (failed.length) {
  console.log(`\nFailed (${failed.length}): ${failed.join(", ")}`);
  process.exit(1);
}
