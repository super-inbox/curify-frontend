#!/usr/bin/env node
// scripts/generate_geo_examples.cjs
//
// Generates inspiration examples for geo tags from a hardcoded config file.
// Each config entry specifies the exact template + params to use.
//
// Usage:
//   node scripts/generate_geo_examples.cjs
//   node scripts/generate_geo_examples.cjs --config=scripts/geo_examples_config.json
//   node scripts/generate_geo_examples.cjs --tags=spain,brazil,vietnam
//   node scripts/generate_geo_examples.cjs --dry-run
//   node scripts/generate_geo_examples.cjs --sync
//
// Requirements: GEMINI_API_KEY in .env.local

"use strict";

const fs   = require("fs");
const fsp  = require("fs/promises");
const path = require("path");
const { execSync } = require("child_process");

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

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

const MAX_PREVIEW_SIZE = 512;
const MAX_PREVIEW_KB   = 250;

// ── CLI args ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    config:  path.join(__dirname, "geo_examples_config.json"),
    tags:    null,   // null = all tags in config
    sync:    false,
    dryRun:  false,
  };
  for (const a of args) {
    if (a === "--sync")          out.sync   = true;
    else if (a === "--dry-run")  out.dryRun = true;
    else if (a.startsWith("--config=")) out.config = path.resolve(a.split("=").slice(1).join("="));
    else if (a.startsWith("--tags="))   out.tags   = a.split("=")[1].split(",").map(s => s.trim());
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
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

// Handles {param} and [{Param Name}] placeholder styles
function fillPrompt(template, params) {
  let result = template;
  for (const [k, v] of Object.entries(params)) {
    result = result.replaceAll(`{${k}}`, v);
    // bracket style: [{Key}] case-insensitive
    result = result.replace(
      new RegExp(`\\[\\{${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\}\\]`, "gi"),
      v
    );
  }
  return result;
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

// Derive a human-readable title from params (first meaningful string value)
function titleFromParams(params) {
  const preferred = ["food_name", "country_name", "region_name", "City Name", "destination", "cuisine_theme", "theme", "food_theme"];
  for (const k of preferred) {
    if (params[k] && typeof params[k] === "string") return params[k].trim();
  }
  const first = Object.values(params).find(v => v && typeof v === "string");
  return first ? String(first).trim() : "";
}

// ── Gemini ────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment / .env.local");
  process.exit(1);
}

const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiImage(prompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  const parts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) return Buffer.from(part.inlineData.data, "base64");
  }
  const text = parts.map(p => p.text || "").join("\n");
  throw new Error(`Gemini returned no image. Text: ${text.slice(0, 200) || "[none]"}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!fs.existsSync(args.config)) {
    console.error(`❌ Config file not found: ${args.config}`);
    process.exit(1);
  }

  // Config is an array of { tag, template_id, params }
  let configEntries = readJson(args.config);
  if (!Array.isArray(configEntries)) {
    console.error("❌ Config must be a JSON array");
    process.exit(1);
  }

  if (args.tags) {
    const tagSet = new Set(args.tags);
    configEntries = configEntries.filter(e => tagSet.has(e.tag));
  }

  console.log("=== generate_geo_examples ===");
  console.log("config:", args.config);
  console.log("entries:", configEntries.length);
  if (args.tags) console.log("tags filter:", args.tags.join(", "));
  console.log("dry-run:", args.dryRun, "| sync:", args.sync);
  console.log("");

  fs.mkdirSync(IMAGE_DIR,   { recursive: true });
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  const templates     = readJson(TEMPLATE_JSON);
  const templatesById = new Map(templates.map(t => [t.id, t]));

  const inspirations = readJson(INSP_JSON);
  const existingIds  = new Set(inspirations.map(r => r.id));

  const addedRecords = [];
  let skipped = 0;
  let failed  = 0;

  // Group entries by tag for cleaner console output
  const byTag = new Map();
  for (const entry of configEntries) {
    if (!byTag.has(entry.tag)) byTag.set(entry.tag, []);
    byTag.get(entry.tag).push(entry);
  }

  for (const [tag, entries] of byTag) {
    console.log(`\n══ ${tag} (${entries.length} entries) ══`);

    for (const entry of entries) {
      const { template_id, params } = entry;

      const templateObj = templatesById.get(template_id);
      if (!templateObj) {
        console.warn(`  ⚠️  Template "${template_id}" not found — skipping`);
        skipped++;
        continue;
      }

      // Build a stable record ID from tag + template + first param value
      const firstParamSlug = slugify(titleFromParams(params));
      const recordId = `${template_id}-${tag}-${firstParamSlug}`;

      if (existingIds.has(recordId)) {
        console.log(`  ↩  Skip (exists): ${recordId}`);
        skipped++;
        continue;
      }

      // Resolve base prompt (prefer en locale, fall back to zh, then top-level)
      const basePrompt =
        templateObj.base_prompt ||
        templateObj.locales?.en?.base_prompt ||
        templateObj.locales?.zh?.base_prompt || "";
      if (!basePrompt) {
        console.warn(`  ⚠️  No base_prompt for "${template_id}" — skipping`);
        skipped++;
        continue;
      }

      const filledPrompt = fillPrompt(basePrompt, params);

      const imageFileName   = `${recordId}.jpg`;
      const previewFileName = `${recordId}-prev.jpg`;
      const imagePath   = path.join(IMAGE_DIR,   imageFileName);
      const previewPath = path.join(PREVIEW_DIR, previewFileName);

      process.stdout.write(`  → [${template_id}] ${JSON.stringify(params)} ... `);

      if (!args.dryRun) {
        try {
          const imageBuffer = await geminiImage(filledPrompt);
          await fsp.writeFile(imagePath, imageBuffer);
          await generatePreview(imagePath, previewPath);
          console.log("✓");
        } catch (e) {
          console.log(`✗ ${e.message}`);
          failed++;
          continue;
        }
      } else {
        console.log("(dry-run)");
      }

      // Topics: merge template's own topics + the geo tag
      const templateTopics = Array.isArray(templateObj.topics)
        ? templateObj.topics
        : (templateObj.topics || "").split(",").map(s => s.trim()).filter(Boolean);
      const recordTopics = [...new Set([...templateTopics, tag])];

      const title = titleFromParams(params);

      const record = {
        id: recordId,
        template_id,
        asset: {
          image_url:         `${IMAGE_URL_PREFIX}${imageFileName}`,
          preview_image_url: `${PREVIEW_URL_PREFIX}${previewFileName}`,
        },
        params,
        locales: { en: { title } },
        topics: recordTopics,
      };

      addedRecords.push(record);
      existingIds.add(recordId);
    }
  }

  // Write updated nano_inspiration.json
  if (addedRecords.length > 0 && !args.dryRun) {
    const updated = [...inspirations, ...addedRecords];
    writeJson(INSP_JSON, updated);
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Added:   ${addedRecords.length}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
  if (args.dryRun) console.log("(dry-run — no files written)");

  // CDN sync
  if (args.sync && !args.dryRun) {
    if (addedRecords.length === 0) {
      console.log("\n(skip sync — nothing new to upload)");
      return;
    }
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
