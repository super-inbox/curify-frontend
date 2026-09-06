#!/usr/bin/env node
// scripts/generate_hsk_reading_cards.cjs
//
// Authored-verbatim generator for HSK bilingual reading-lesson cards.
//
// This is the productionized version of the one-off generators under
// raw/hsk2-reading-deliverable/generators/. It exists because the image
// model CANNOT be trusted to compose Chinese + pinyin: left to write the
// passage itself it gets the tones wrong on ~80% of cards (一/不 sandhi,
// 多音字 like 圈=juàn, 只=zhī). See docs/pinyin-generation-guide.md.
//
// So the config carries the FULLY AUTHORED card — hanzi + hand-verified
// pinyin — and the model is used only as a typesetter.
//
// Config shape (scripts/configs/hsk_*.json), one object per card:
//   {
//     "template_id": "template-hsk-bilingual-reading-text-lesson-poster",
//     "id_suffix":   "hsk2-my-pet",
//     "hsk_level":   2,
//     "title_zh":    "我的宠物",
//     "title_en":    "My Pet",
//     "scene":       "a child playing with a small orange cat at home",
//     "lines":       [["Wǒ jiā yǒu yì zhī xiǎo māo.", "我家有一只小猫。"], ...8],
//     "vocab":       [["宠物", "chǒng wù", "pet"], ...8],
//     "params":         { "hsk_article_title": "HSK2 我的宠物 My Pet" },
//     "topics":         ["study-sheets", "education", ...],
//     "search_aliases": ["HSK2 我的宠物", "My Pet", ...]
//   }
//
// Usage:
//   node scripts/generate_hsk_reading_cards.cjs --config=scripts/configs/<name>.json
//   … --dry-run          print the built prompt for the first card, write nothing
//   … --only=a,b         generate only these id_suffixes
//   … --sync             rsync the new images to GCS after writing
//   … --no-watermark     skip the tiled Curify logo (internal review copies)
//   … --review-dir=DIR   also drop an unwatermarked copy here for tone QA
//   … --concurrency=4    parallel generations (default 4)
//
// Requires GEMINI_API_KEY in .env.local.

"use strict";

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { execSync } = require("child_process");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("❌ Missing dependency: sharp\nInstall: npm i sharp");
  process.exit(1);
}

try { require("dotenv").config({ path: ".env.local" }); } catch {}

const { GoogleGenAI, Modality } = require("@google/genai");
const { applyTiledWatermark } = require("./lib/watermark.cjs");

const ROOT = path.resolve(__dirname, "..");
const INSP_JSON = path.join(ROOT, "public/data/nano_inspiration.json");
const IMAGE_DIR = path.join(ROOT, "public/images/nano_insp");
const PREVIEW_DIR = path.join(ROOT, "public/images/nano_insp_preview");
const GCS_BUCKET = "gs://curify-static";

const IMAGE_URL_PREFIX = "/images/nano_insp/";
const PREVIEW_URL_PREFIX = "/images/nano_insp_preview/";

const MODEL = "gemini-3-pro-image-preview";
const MAX_PREVIEW_SIZE = 512;
const MAX_PREVIEW_KB = 250;

// ── Args ─────────────────────────────────────────────────────────────────────

function parseArgs() {
  const out = {
    config: null, dryRun: false, sync: false, watermark: true,
    only: null, reviewDir: null, concurrency: 4,
  };
  for (const a of process.argv.slice(2)) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--sync") out.sync = true;
    else if (a === "--no-watermark") out.watermark = false;
    else if (a.startsWith("--config=")) out.config = path.resolve(a.split("=").slice(1).join("="));
    else if (a.startsWith("--only=")) out.only = new Set(a.split("=").slice(1).join("=").split(",").map((s) => s.trim()).filter(Boolean));
    else if (a.startsWith("--review-dir=")) out.reviewDir = path.resolve(a.split("=").slice(1).join("="));
    else if (a.startsWith("--concurrency=")) out.concurrency = Math.max(1, parseInt(a.split("=")[1], 10) || 4);
    else console.warn(`⚠️  Unknown arg ignored: ${a}`);
  }
  if (!out.config) {
    console.error("❌ --config=<path> is required");
    process.exit(1);
  }
  return out;
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n", "utf8");

// ── The verbatim-typeset prompt ──────────────────────────────────────────────
//
// Every instruction that removes the model's freedom to COMPOSE is load
// bearing. The "tone marks are deliberate" sentence in particular stops it
// from "correcting" 一 sandhi back to the citation tone yī.

function buildPrompt(c) {
  const passage = c.lines
    .map(([p, h], i) => `  Line ${i + 1}: pinyin "${p}"  /  characters "${h}"`)
    .join("\n");
  const vocab = c.vocab
    .map(([h, p, e], i) => `  ${i + 1}. ${h} — ${p} — ${e}`)
    .join("\n");
  const lvl = c.hsk_level;

  return `Create a single vertical (portrait) children's Chinese reading-lesson poster, clean soft off-white paper background, warm gentle watercolor children's illustration style.

FIXED LAYOUT:
- Top-left: a cloud-shaped badge reading exactly "适合水平 HSK ${lvl}".
- Top-center: a ribbon "阅读课文 | Reading Lesson", below it the big bold Chinese title "${c.title_zh}" with the small English subtitle "${c.title_en}".
- Top-right: a small watercolor scene of ${c.scene}.
- The body splits into two columns. On the left sits the reading passage: ${c.lines.length} rows, each row showing the small pinyin line ON TOP and the larger Simplified-Chinese sentence directly BELOW it. On the right sit 3-4 stacked watercolor illustration panels and nothing else — no text inside them.
- Bottom: a banner "生词 | New Words", then a 2-row x 4-column grid of 8 vocab cards, each numbered 1-8 in reading order, each with the Chinese word, its pinyin, its English, and a tiny icon.
- The ONLY words printed anywhere on the poster are: "适合水平 HSK ${lvl}", "阅读课文 | Reading Lesson", "生词 | New Words", the title, the English subtitle, and the passage + vocabulary text given below. Never print a layout instruction as a heading (no "LEFT COLUMN", "RIGHT COLUMN", "PASSAGE", "NEW WORDS"), and put no readable text inside any illustration.
- Decorative star & heart divider lines, pastel muted natural palette, cute rounded sans-serif font, printable A4 classroom worksheet feel.

TYPESET THIS EXACT TEXT — render every Chinese character and every pinyin syllable with tone marks EXACTLY as written here. The tone marks are correct and deliberate (including 一 as yì/yí sandhi, 不 as bù/bú, and readings like 觉=jiào, 只=zhī, 行=háng, 发=fà, 好=hào, 系=jì); do NOT change, add, remove, reorder, or "correct" any character, pinyin syllable, or tone mark. Each pinyin line sits directly above its own matching characters. Do not repeat any line.

PASSAGE (${c.lines.length} lines):
${passage}

NEW WORDS (8):
${vocab}

Render all Chinese characters crisply and correctly (standard Simplified forms). No emoji, no stray symbols, no extra Latin letters, no placeholder like "HSK X". High resolution, print quality.`;
}

// ── Generation ───────────────────────────────────────────────────────────────

async function geminiImage(ai, prompt) {
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  const parts = resp?.candidates?.[0]?.content?.parts || resp?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) return Buffer.from(part.inlineData.data, "base64");
  }
  const text = parts.map((p) => p.text || "").join("\n");
  throw new Error(`no image (text: ${text.slice(0, 160) || "[none]"})`);
}

async function generatePreview(srcPath, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  let quality = 80;
  const base = sharp(srcPath).rotate().resize({
    width: MAX_PREVIEW_SIZE, height: MAX_PREVIEW_SIZE,
    fit: "inside", withoutEnlargement: true,
  });
  for (;;) {
    await base.clone().jpeg({ quality, mozjpeg: true }).toFile(outPath);
    const kb = fs.statSync(outPath).size / 1024;
    if (kb <= MAX_PREVIEW_KB || quality <= 45) break;
    quality -= 8;
  }
}

// Bounded-concurrency map — Gemini is the rate cap, not local CPU.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

async function main() {
  const args = parseArgs();
  const cards = readJson(args.config);
  if (!Array.isArray(cards)) {
    console.error("❌ Config must be a JSON array");
    process.exit(1);
  }

  const selected = args.only ? cards.filter((c) => args.only.has(c.id_suffix)) : cards;
  if (selected.length === 0) {
    console.error("❌ No cards selected");
    process.exit(1);
  }

  if (args.dryRun) {
    console.log(`── dry-run: ${selected.length} card(s) ──\n`);
    console.log(buildPrompt(selected[0]));
    console.log(`\n(ids: ${selected.map((c) => c.id_suffix).join(", ")})`);
    return;
  }

  const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!KEY) { console.error("❌ GEMINI_API_KEY not set"); process.exit(1); }
  const ai = new GoogleGenAI({ apiKey: KEY });

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  if (args.reviewDir) fs.mkdirSync(args.reviewDir, { recursive: true });

  const inspirations = readJson(INSP_JSON);
  const existingIds = new Set(inspirations.map((r) => r.id));

  console.log(`Generating ${selected.length} HSK reading card(s) @ concurrency=${args.concurrency}\n`);

  const results = await mapLimit(selected, args.concurrency, async (c) => {
    const recordId = `${c.template_id}-${c.id_suffix}`;
    if (existingIds.has(recordId)) {
      console.log(`  ↩  skip (exists)  ${c.id_suffix}`);
      return { card: c, recordId, status: "skip" };
    }
    const imageFile = `${recordId}.jpg`;
    const previewFile = `${recordId}-prev.jpg`;
    const imagePath = path.join(IMAGE_DIR, imageFile);
    const previewPath = path.join(PREVIEW_DIR, previewFile);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const buf = await geminiImage(ai, buildPrompt(c));
        await fsp.writeFile(imagePath, buf);
        // Unwatermarked copy for the mandatory native-level 声调 QA pass —
        // the watermark sits over the text and makes tone marks harder to read.
        if (args.reviewDir) await fsp.writeFile(path.join(args.reviewDir, imageFile), buf);
        if (args.watermark) applyTiledWatermark(imagePath, imagePath);
        await generatePreview(imagePath, previewPath);
        console.log(`  ✓  ${c.id_suffix}`);
        return { card: c, recordId, imageFile, previewFile, status: "ok" };
      } catch (e) {
        if (attempt === 3) {
          console.log(`  ✗  ${c.id_suffix} — ${String(e.message || e).slice(0, 100)}`);
          return { card: c, recordId, status: "fail" };
        }
      }
    }
  });

  const added = [];
  for (const r of results) {
    if (r.status !== "ok") continue;
    const c = r.card;
    added.push({
      id: r.recordId,
      template_id: c.template_id,
      asset: {
        image_url: `${IMAGE_URL_PREFIX}${r.imageFile}`,
        preview_image_url: `${PREVIEW_URL_PREFIX}${r.previewFile}`,
      },
      params: c.params,
      locales: { en: { title: c.params.hsk_article_title } },
      topics: c.topics || [],
      search_aliases: c.search_aliases || [],
      allow_i18n: true,
    });
  }

  if (added.length > 0) {
    writeJson(INSP_JSON, [...inspirations, ...added]);
    console.log(`\n📝 nano_inspiration.json: +${added.length} records`);
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const skip = results.filter((r) => r.status === "skip").length;
  const fail = results.filter((r) => r.status === "fail").length;
  console.log(`\n${"─".repeat(40)}\nGenerated: ${ok} | Skipped: ${skip} | Failed: ${fail}`);
  if (fail) console.log(`Failed ids: ${results.filter((r) => r.status === "fail").map((r) => r.card.id_suffix).join(", ")}`);

  if (args.sync && ok > 0) {
    console.log(`\n⏫ Syncing images to ${GCS_BUCKET} ...`);
    execSync(`gsutil -m rsync -r "${IMAGE_DIR}" "${GCS_BUCKET}/images/nano_insp"`, { stdio: "inherit" });
    execSync(`gsutil -m rsync -r "${PREVIEW_DIR}" "${GCS_BUCKET}/images/nano_insp_preview"`, { stdio: "inherit" });
  }

  console.log(
    "\n⚠️  NEXT: run the mandatory native-level 声调 QA pass on the review copies\n" +
    "   before publishing — see docs/pinyin-generation-guide.md."
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
