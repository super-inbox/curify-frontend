#!/usr/bin/env node
// scripts/generate_bilingual_examples.cjs
//
// Generates bilingual language pair examples using Gemini API:
//   1. Uses Gemini text to generate example parameters per template + language pair
//   2. Fills the base prompt with those parameters
//   3. Uses Gemini image generation to create the image
//   4. Generates a preview with sharp
//   5. Adds entries to nano_inspiration.json with correct topics
//   6. Syncs to CDN (with --sync flag)
//
// Usage:
//   node scripts/generate_bilingual_examples.cjs
//   node scripts/generate_bilingual_examples.cjs --sync
//   node scripts/generate_bilingual_examples.cjs --dry-run
//   node scripts/generate_bilingual_examples.cjs --pairs=english-spanish,english-korean
//   node scripts/generate_bilingual_examples.cjs --count=5
//
// Requirements: GEMINI_API_KEY in .env.local

"use strict";

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { execSync } = require("child_process");
const { applyTiledWatermark } = require("./lib/watermark.cjs");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("❌ Missing dependency: sharp\nInstall: npm i sharp");
  process.exit(1);
}

let dotenv;
try { dotenv = require("dotenv"); dotenv.config({ path: ".env.local" }); } catch {}

const { GoogleGenAI, Modality } = require("@google/genai");

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT          = path.resolve(__dirname, "..");
const INSP_JSON     = path.join(ROOT, "public/data/nano_inspiration.json");
const TEMPLATE_JSON = path.join(ROOT, "public/data/nano_templates.json");
const IMAGE_DIR     = path.join(ROOT, "public/images/nano_insp");
const PREVIEW_DIR   = path.join(ROOT, "public/images/nano_insp_preview");
const GCS_BUCKET    = "gs://curify-static";

const IMAGE_URL_PREFIX   = "/images/nano_insp/";
const PREVIEW_URL_PREFIX = "/images/nano_insp_preview/";

const GEMINI_TEXT_MODEL  = "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

const MAX_PREVIEW_SIZE = 512;
const MAX_PREVIEW_KB   = 250;

// Language pairs and their display labels + topic tag
const LANGUAGE_PAIR_CONFIG = {
  "english-spanish": {
    label: "English-Spanish",
    nativeLabel: "Español",
    topic: "english-spanish",
  },
  "english-korean": {
    label: "English-Korean",
    nativeLabel: "한국어",
    topic: "english-korean",
  },
  "english-japanese": {
    label: "English-Japanese",
    nativeLabel: "日本語",
    topic: "english-japanese",
  },
  "english-french": {
    label: "English-French",
    nativeLabel: "Français",
    topic: "english-french",
  },
};

// Templates suitable for bilingual pair generation (have language_pair param)
const BILINGUAL_TEMPLATES = [
  "template-vocabulary",
  "template-word-scene",
  "template-english-dialogue-scene",
  "template-english-top5-phrases",
  "template-english-error-correction",
];

// ── CLI args ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    sync: false,
    dryRun: false,
    count: 10,
    pairs: Object.keys(LANGUAGE_PAIR_CONFIG),
  };
  for (const a of args) {
    if (a === "--sync") out.sync = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--count=")) out.count = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--pairs=")) out.pairs = a.split("=")[1].split(",").map(s => s.trim());
  }
  return out;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fillPrompt(template, params) {
  let prompt = template;
  for (const [k, v] of Object.entries(params)) {
    prompt = prompt.replaceAll(`{${k}}`, v);
  }
  return prompt;
}

function getTemplatePrompt(templateObj, langPairLabel) {
  // Prefer English locale, fall back to zh
  const locale = templateObj.locales?.en || templateObj.locales?.zh;
  let base = locale?.base_prompt || "";

  // If template references language_pair but none set, inject it
  if (base.includes("{language_pair}") && !base.includes(langPairLabel)) {
    base = base.replace("{language_pair}", langPairLabel);
  }
  return base;
}

function getTemplateParams(templateObj) {
  const locale = templateObj.locales?.en || templateObj.locales?.zh;
  return locale?.parameters || templateObj.parameters || [];
}

async function generatePreview(srcPath, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  let quality = 80;
  const base = sharp(srcPath).rotate().resize({
    width: MAX_PREVIEW_SIZE,
    height: MAX_PREVIEW_SIZE,
    fit: "inside",
    withoutEnlargement: true,
  });

  while (true) {
    await base.clone().jpeg({ quality, mozjpeg: true }).toFile(outPath);
    const kb = fs.statSync(outPath).size / 1024;
    if (kb <= MAX_PREVIEW_KB || quality <= 45) break;
    quality -= 8;
  }
}

// ── Gemini ────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment / .env.local");
  process.exit(1);
}

const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiGenerateText(prompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const parts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  return parts.map(p => p.text || "").join("").trim();
}

async function geminiGenerateImage(prompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });

  const parts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }
  const text = parts.map(p => p.text || "").join("\n");
  throw new Error(`Gemini image generation returned no image. Text: ${text || "[none]"}`);
}

// ── Parameter generation ──────────────────────────────────────────────────────

async function generateExampleParams(templateId, templateObj, langPairConfig, count) {
  const params = getTemplateParams(templateObj);
  const paramNames = params.map(p => `${p.name} (${p.label})`).join(", ");
  const placeholders = params.map(p =>
    `${p.name}: ${(p.placeholder || []).slice(0, 3).join(" / ")}`
  ).join("\n");

  const prompt = `You are generating ${count} diverse example parameter sets for a bilingual language learning card template.

Template: ${templateId}
Language pair: ${langPairConfig.label}
Parameters needed: ${paramNames}

Example placeholder values:
${placeholders}

Generate exactly ${count} different, creative, and educationally useful parameter sets for ${langPairConfig.label} language learning.
Each set should cover a distinct topic or theme.

Respond ONLY with a valid JSON array of objects, one per example. Each object should have all parameter names as keys.
For "language_pair" always use "${langPairConfig.label}".
For target language words/phrases, provide the ${langPairConfig.nativeLabel} translation.
Example format:
[
  { "language_pair": "${langPairConfig.label}", "topic_name": "Colors", ... },
  ...
]`;

  const raw = await geminiGenerateText(prompt);

  // Extract JSON array from response
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array in response: ${raw.slice(0, 200)}`);

  try {
    return JSON.parse(match[0]);
  } catch (e) {
    throw new Error(`Failed to parse params JSON: ${e.message}\n${match[0].slice(0, 300)}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  console.log("=== generate_bilingual_examples ===");
  console.log("pairs:", args.pairs.join(", "));
  console.log("count per pair:", args.count);
  console.log("dry-run:", args.dryRun, "| sync:", args.sync);
  console.log("");

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  const templates = readJson(TEMPLATE_JSON);
  const templatesById = new Map(templates.map(t => [t.id, t]));

  const inspirations = readJson(INSP_JSON);
  const existingIds = new Set(inspirations.map(r => r.id));

  const addedRecords = [];

  for (const pair of args.pairs) {
    const pairConfig = LANGUAGE_PAIR_CONFIG[pair];
    if (!pairConfig) {
      console.warn(`⚠️  Unknown pair: ${pair}, skipping`);
      continue;
    }

    console.log(`\n── Language pair: ${pairConfig.label} ──`);

    // Distribute count across templates
    const perTemplate = Math.ceil(args.count / BILINGUAL_TEMPLATES.length);
    let pairTotal = 0;

    for (const templateId of BILINGUAL_TEMPLATES) {
      if (pairTotal >= args.count) break;

      const templateObj = templatesById.get(templateId);
      if (!templateObj) {
        console.warn(`  ⚠️  Template ${templateId} not found, skipping`);
        continue;
      }

      const needed = Math.min(perTemplate, args.count - pairTotal);
      console.log(`\n  [${templateId}] generating ${needed} examples...`);

      let paramSets;
      try {
        paramSets = await generateExampleParams(templateId, templateObj, pairConfig, needed);
      } catch (e) {
        console.error(`  ❌ Failed to generate params: ${e.message}`);
        continue;
      }

      console.log(`  ✓ Got ${paramSets.length} param sets from Gemini`);

      const basePrompt = getTemplatePrompt(templateObj, pairConfig.label);
      const templateTopics = templateObj.topics || [];

      for (const params of paramSets.slice(0, needed)) {
        // Build a unique slug from first param value
        const firstVal = Object.values(params).find(v => v && typeof v === "string" && v !== pairConfig.label) || "example";
        const slug = slugify(firstVal).slice(0, 40);
        const recordId = `${templateId}-${slugify(pair)}-${slug}`;

        if (existingIds.has(recordId)) {
          console.log(`  ↩  Skip (exists): ${recordId}`);
          continue;
        }

        const filledPrompt = fillPrompt(basePrompt, params);
        const imageFileName = `${recordId}.jpg`;
        const previewFileName = `${recordId}-prev.jpg`;
        const imagePath = path.join(IMAGE_DIR, imageFileName);
        const previewPath = path.join(PREVIEW_DIR, previewFileName);

        process.stdout.write(`  → ${recordId} ... `);

        if (!args.dryRun) {
          try {
            // Generate image
            const imageBuffer = await geminiGenerateImage(filledPrompt);
            await fsp.writeFile(imagePath, imageBuffer);

            // Watermark the image in place (tiled). Doing this before the
            // preview is generated means the preview inherits the watermark
            // at proportional size — no second magick op needed for preview.
            applyTiledWatermark(imagePath, imagePath);

            // Generate preview from the watermarked image
            await generatePreview(imagePath, previewPath);

            console.log("✓");
          } catch (e) {
            console.log(`✗ ${e.message}`);
            continue;
          }
        } else {
          console.log("(dry-run)");
        }

        // Build record — merge template topics + pair topic
        const recordTopics = [...new Set([...templateTopics.filter(t => t !== "language"), pair])];

        const record = {
          id: recordId,
          template_id: templateId,
          asset: {
            image_url: `${IMAGE_URL_PREFIX}${imageFileName}`,
            preview_image_url: `${PREVIEW_URL_PREFIX}${previewFileName}`,
          },
          params,
          locales: {
            en: { title: firstVal },
          },
          topics: recordTopics,
        };

        addedRecords.push(record);
        existingIds.add(recordId);
        pairTotal++;
      }
    }

    console.log(`\n  ✅ ${pairTotal} examples added for ${pairConfig.label}`);
  }

  // Write updated nano_inspiration.json
  if (addedRecords.length > 0 && !args.dryRun) {
    const updated = [...inspirations, ...addedRecords];
    writeJson(INSP_JSON, updated);
    console.log(`\n✅ Added ${addedRecords.length} records to nano_inspiration.json`);
  } else if (args.dryRun) {
    console.log(`\n(dry-run) Would add ${addedRecords.length} records`);
  } else {
    console.log("\nNo new records to add.");
  }

  // CDN sync
  if (args.sync && !args.dryRun) {
    console.log(`\n⏫ Syncing images to ${GCS_BUCKET} ...`);
    execSync(
      `gsutil -m rsync -r "${IMAGE_DIR}" "${GCS_BUCKET}/images/nano_insp"`,
      { stdio: "inherit" }
    );
    execSync(
      `gsutil -m rsync -r "${PREVIEW_DIR}" "${GCS_BUCKET}/images/nano_insp_preview"`,
      { stdio: "inherit" }
    );
    console.log("✨ Done syncing.");
  } else if (!args.sync) {
    console.log("\n(skip) CDN sync not requested. Use --sync to upload.");
  }
}

main().catch(e => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
