#!/usr/bin/env node
// scripts/generate_template_examples.cjs
//
// Config-driven batch image generator for nano_inspiration entries.
//
// Each config file is a JSON array of entries:
//   [
//     {
//       "template_id": "template-9-traits-info-grid",
//       "params": { "topic_title": "Social Butterfly" },
//       "topics": ["character", "groups"],            // optional, append to record.topics
//       "id_suffix": "social-butterfly"               // optional, override slug part of record id
//     },
//     ...
//   ]
//
// Backward-compat: an entry's old `tag: "spain"` is read as
// `topics: ["spain"]`. The geo config (scripts/geo_examples_config.json)
// continues to work unchanged.
//
// Usage:
//   node scripts/generate_template_examples.cjs --config=scripts/configs/9_traits_stereotypes.json
//   node scripts/generate_template_examples.cjs --config=... --topics=animals,nature
//   node scripts/generate_template_examples.cjs --config=... --dry-run
//   node scripts/generate_template_examples.cjs --config=... --sync
//   node scripts/generate_template_examples.cjs --config=... --auto-tag
//   node scripts/generate_template_examples.cjs --config=... --no-watermark
//   node scripts/generate_template_examples.cjs --config=... --model=gemini-2.5-flash-image
//
// Requires GEMINI_API_KEY in .env.local. Default model is "Nano Banana
// Pro" (gemini-3-pro-image-preview) for higher quality on the
// long-running per-template generation use case.
//
// Watermark: every generated full image is stamped with the tilted
// curify logo (applyTiledWatermark) before preview generation, so the
// preview inherits the watermark. Pass --no-watermark to skip (for
// internal testing).
//
// Auto-tag: --auto-tag picks one Tier-3 topic tag per record via
// gpt-4o-mini, using the parent template's Tier-1 ancestor. Same
// implementation as sync_nano_inspiration.cjs (scripts/lib/auto_tag.cjs).
// Requires OPENAI_API_KEY.

"use strict";

const fs   = require("fs");
const fsp  = require("fs/promises");
const os   = require("os");
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
const {
  autoTagInspirations,
  enrichSearchAliases,
  tryBuildOpenAIClient,
} = require("./lib/auto_tag.cjs");

// ── Paths ────────────────────────────────────────────────────────────────────

const ROOT          = path.resolve(__dirname, "..");
const INSP_JSON     = path.join(ROOT, "public/data/nano_inspiration.json");
const TEMPLATE_JSON = path.join(ROOT, "public/data/nano_templates.json");
const IMAGE_DIR     = path.join(ROOT, "public/images/nano_insp");
const PREVIEW_DIR   = path.join(ROOT, "public/images/nano_insp_preview");
const GCS_BUCKET    = "gs://curify-static";

const IMAGE_URL_PREFIX   = "/images/nano_insp/";
const PREVIEW_URL_PREFIX = "/images/nano_insp_preview/";

// "Nano Banana Pro" — better consistency on the per-template generation
// path. Override with --model= if you want to fall back to flash for
// quick smoke tests.
const DEFAULT_MODEL = "gemini-3-pro-image-preview";

const MAX_PREVIEW_SIZE = 512;
const MAX_PREVIEW_KB   = 250;

// ── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    config: null,
    topicsFilter: null,
    sync: false,
    dryRun: false,
    model: DEFAULT_MODEL,
    // Watermark every generated full image with the tilted curify logo
    // (the preview is derived from the watermarked file). Default ON
    // so config-driven batches match the gallery ingest behavior in
    // sync_nano_inspiration.cjs. Opt out with --no-watermark.
    watermark: true,
    // Auto-tag opt-in (parallels sync_nano_inspiration.cjs --auto-tag).
    autoTag: false,
    autoTagModel: "gpt-4o-mini",
  };
  for (const a of args) {
    if (a === "--sync")          out.sync   = true;
    else if (a === "--dry-run")  out.dryRun = true;
    else if (a === "--no-watermark") out.watermark = false;
    else if (a === "--auto-tag") out.autoTag = true;
    else if (a.startsWith("--auto-tag-model=")) out.autoTagModel = a.split("=").slice(1).join("=");
    else if (a.startsWith("--config=")) out.config = path.resolve(a.split("=").slice(1).join("="));
    else if (a.startsWith("--topics=") || a.startsWith("--tags="))
      out.topicsFilter = a.split("=")[1].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith("--model=")) out.model = a.split("=")[1];
  }
  if (!out.config) {
    console.error("❌ --config=path/to/config.json is required");
    process.exit(1);
  }
  return out;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function fillPrompt(template, params) {
  let result = template;
  for (const [k, v] of Object.entries(params)) {
    result = result.replaceAll(`{${k}}`, v);
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

// Pick a human-readable title from params — tries common name-like keys
// first, otherwise falls back to the first non-empty string value.
function titleFromParams(params) {
  const preferred = [
    "topic_title", "trait", "stereotype",
    "food_name", "country_name", "region_name", "City Name",
    "destination", "cuisine_theme", "theme", "food_theme",
    "character_name", "subject", "topic",
  ];
  for (const k of preferred) {
    const v = params[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const first = Object.values(params).find((v) => typeof v === "string" && v.trim());
  return first ? String(first).trim() : "";
}

// Normalize an entry: accept legacy { tag: "x" } as { topics: ["x"] }.
function normalizeEntry(entry) {
  const topics = Array.isArray(entry.topics)
    ? entry.topics
    : (typeof entry.tag === "string" && entry.tag ? [entry.tag] : []);
  return {
    template_id: entry.template_id,
    params: entry.params || {},
    topics,
    id_suffix: entry.id_suffix,
  };
}

// ── Gemini ───────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment / .env.local");
  process.exit(1);
}
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiImage(prompt, model) {
  const response = await gemini.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  const parts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) return Buffer.from(part.inlineData.data, "base64");
  }
  const text = parts.map((p) => p.text || "").join("\n");
  throw new Error(`Gemini returned no image. Text: ${text.slice(0, 200) || "[none]"}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!fs.existsSync(args.config)) {
    console.error(`❌ Config file not found: ${args.config}`);
    process.exit(1);
  }

  let configEntries = readJson(args.config);
  if (!Array.isArray(configEntries)) {
    console.error("❌ Config must be a JSON array");
    process.exit(1);
  }
  configEntries = configEntries.map(normalizeEntry);

  if (args.topicsFilter) {
    const f = new Set(args.topicsFilter);
    configEntries = configEntries.filter((e) => e.topics.some((t) => f.has(t)));
  }

  console.log("=== generate_template_examples ===");
  console.log("config:    ", args.config);
  console.log("entries:   ", configEntries.length);
  if (args.topicsFilter) console.log("filter:    ", args.topicsFilter.join(", "));
  console.log("model:     ", args.model);
  console.log("watermark: ", args.watermark);
  console.log("auto-tag:  ", args.autoTag, args.autoTag ? `(model=${args.autoTagModel})` : "");
  console.log("dry-run:   ", args.dryRun, "| sync:", args.sync);
  console.log("");

  // Stage all generated files in a fresh temp dir first. Only after the
  // entire batch succeeds (or completes) do we copy into public/images/
  // and update nano_inspiration.json — keeps a half-failed run from
  // leaving partial files in the repo.
  const stagingRoot = path.join(
    os.tmpdir(),
    `curify_template_examples_${Date.now()}`
  );
  const stagingImageDir = path.join(stagingRoot, "nano_insp");
  const stagingPreviewDir = path.join(stagingRoot, "nano_insp_preview");
  fs.mkdirSync(stagingImageDir, { recursive: true });
  fs.mkdirSync(stagingPreviewDir, { recursive: true });
  console.log(`staging:   ${stagingRoot}\n`);

  fs.mkdirSync(IMAGE_DIR,   { recursive: true });
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  const templates     = readJson(TEMPLATE_JSON);
  const templatesById = new Map(templates.map((t) => [t.id, t]));

  const inspirations = readJson(INSP_JSON);
  const existingIds  = new Set(inspirations.map((r) => r.id));

  const addedRecords = [];
  let skipped = 0;
  let failed  = 0;

  // Group by primary topic (first in the array) for cleaner console output.
  const byPrimaryTopic = new Map();
  for (const entry of configEntries) {
    const key = entry.topics[0] || "(no-topic)";
    if (!byPrimaryTopic.has(key)) byPrimaryTopic.set(key, []);
    byPrimaryTopic.get(key).push(entry);
  }

  for (const [primaryTopic, entries] of byPrimaryTopic) {
    console.log(`\n══ ${primaryTopic} (${entries.length} entries) ══`);

    for (const entry of entries) {
      const { template_id, params, topics, id_suffix } = entry;

      const templateObj = templatesById.get(template_id);
      if (!templateObj) {
        console.warn(`  ⚠️  Template "${template_id}" not found — skipping`);
        skipped++;
        continue;
      }

      // Build a stable record ID.
      // Default: <template_id>-<primaryTopic>-<firstParamSlug>
      // Override: id_suffix when set, => <template_id>-<id_suffix>
      const titleSlug = slugify(id_suffix || titleFromParams(params));
      const tagSlug = primaryTopic && primaryTopic !== "(no-topic)" ? `${slugify(primaryTopic)}-` : "";
      const recordId = id_suffix
        ? `${template_id}-${slugify(id_suffix)}`
        : `${template_id}-${tagSlug}${titleSlug}`;

      if (existingIds.has(recordId)) {
        console.log(`  ↩  Skip (exists): ${recordId}`);
        skipped++;
        continue;
      }

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
      const imagePath   = path.join(stagingImageDir,   imageFileName);
      const previewPath = path.join(stagingPreviewDir, previewFileName);

      process.stdout.write(`  → [${template_id}] ${JSON.stringify(params)} ... `);

      if (!args.dryRun) {
        try {
          const imageBuffer = await geminiImage(filledPrompt, args.model);
          await fsp.writeFile(imagePath, imageBuffer);
          // Tilted watermark goes on the full image first; the preview
          // is derived from this file so it inherits the watermark too.
          if (args.watermark) applyTiledWatermark(imagePath, imagePath);
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

      // Merge template's own topics with the entry's topics, deduped.
      const templateTopics = Array.isArray(templateObj.topics)
        ? templateObj.topics
        : (templateObj.topics || "").split(",").map((s) => s.trim()).filter(Boolean);
      const recordTopics = [...new Set([...templateTopics, ...topics])];

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

  if (addedRecords.length > 0 && !args.dryRun) {
    // Promote staged files into public/images/ now that the batch is
    // done. Files in the staging dir were only created for entries that
    // generated successfully (failures continue past the loop without
    // writing).
    console.log(`\n📂 Copying staged files → ${IMAGE_DIR} / ${PREVIEW_DIR}`);
    let copied = 0;
    for (const fname of fs.readdirSync(stagingImageDir)) {
      fs.copyFileSync(
        path.join(stagingImageDir, fname),
        path.join(IMAGE_DIR, fname)
      );
      copied++;
    }
    for (const fname of fs.readdirSync(stagingPreviewDir)) {
      fs.copyFileSync(
        path.join(stagingPreviewDir, fname),
        path.join(PREVIEW_DIR, fname)
      );
    }
    console.log(`Copied ${copied} full + ${copied} preview images.`);

    // Auto-tag mutates record.topics in place before we write JSON, so
    // the persisted records carry the gpt-picked Tier-3 tag.
    if (args.autoTag) {
      const { client: openai, reason } = tryBuildOpenAIClient();
      if (!openai) {
        console.warn(`⚠️  --auto-tag requested but ${reason}; skipping.`);
      } else {
        console.log(`\n🏷️  Auto-tagging ${addedRecords.length} new records (model=${args.autoTagModel}) ...`);
        const stats = await autoTagInspirations(
          addedRecords,
          templatesById,
          openai,
          args.autoTagModel
        );
        console.log(`Tagged: ${stats.tagged} | Skipped: ${stats.skipped} | Failed: ${stats.failed}`);

        // Same --auto-tag flag also enriches search_aliases so new
        // records ship with Chinese/English synonyms in the search blob.
        console.log(`\n🔎 Enriching search aliases for ${addedRecords.length} new records ...`);
        const aliasStats = await enrichSearchAliases(
          addedRecords,
          templatesById,
          openai,
          args.autoTagModel
        );
        console.log(`Aliases: enriched=${aliasStats.enriched} skipped=${aliasStats.skipped} failed=${aliasStats.failed}`);
      }
    }

    const updated = [...inspirations, ...addedRecords];
    writeJson(INSP_JSON, updated);
  }

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Added:   ${addedRecords.length}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
  if (args.dryRun) console.log("(dry-run — no files written)");

  if (args.sync && !args.dryRun) {
    if (addedRecords.length === 0) {
      console.log("\n(skip sync — nothing new to upload)");
      return;
    }
    console.log(`\n⏫ Syncing images to ${GCS_BUCKET} ...`);
    execSync(`gsutil -m rsync -r "${IMAGE_DIR}" "${GCS_BUCKET}/images/nano_insp"`,
      { stdio: "inherit" });
    execSync(`gsutil -m rsync -r "${PREVIEW_DIR}" "${GCS_BUCKET}/images/nano_insp_preview"`,
      { stdio: "inherit" });
    console.log("✨ Done syncing.");
  } else if (!args.sync) {
    console.log("\n(skip) CDN sync not requested. Use --sync to upload.");
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
