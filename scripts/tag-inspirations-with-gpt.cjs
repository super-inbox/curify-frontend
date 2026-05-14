/**
 * tag-inspirations-with-gpt.cjs
 *
 * For each nano_inspiration example, picks 1–2 images, sends them to GPT-4o
 * vision, and asks it to assign up to 5 short descriptive tags.
 *
 * Output: scripts/inspiration_tags_output.json
 *   [ { template_id, example_id, tags: string[], error? }, ... ]
 *
 * Unlike sync_nano_inspiration --auto-tag (closed Tier-3 vocabulary picked
 * from template signals), this script reads the actual image pixels and
 * produces open-vocabulary descriptors. It does NOT mutate nano_inspiration.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/tag-inspirations-with-gpt.cjs
 *
 * Optional env vars:
 *   CONCURRENCY=5          (default: 5 parallel requests)
 *   RESUME=true            (skip already-processed example IDs in output file)
 *   CDN_BASE=https://...   (default: https://cdn.curify-ai.com)
 *   MODEL=gpt-4o           (default: gpt-4o)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const {
  tagInspirationsVision,
  tryBuildOpenAIClient,
} = require("./lib/auto_tag.cjs");

// ── Config ────────────────────────────────────────────────────────────────────

const CDN_BASE = process.env.CDN_BASE || "https://cdn.curify-ai.com";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5", 10);
const RESUME = process.env.RESUME === "true";
const MODEL = process.env.MODEL || "gpt-4o";
const OUTPUT_FILE = path.join(__dirname, "inspiration_tags_output.json");
const INSP_PATH = path.join(__dirname, "..", "public", "data", "nano_inspiration.json");

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { client: openai, reason } = tryBuildOpenAIClient();
  if (!openai) {
    console.error(`Error: ${reason}`);
    process.exit(1);
  }

  const inspirations = JSON.parse(fs.readFileSync(INSP_PATH, "utf8"));
  const entries = inspirations.filter((e) => e.asset?.image_url);
  console.log(`Total entries with images: ${entries.length}`);

  let results = [];
  const doneIds = new Set();
  if (RESUME && fs.existsSync(OUTPUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    for (const r of results) doneIds.add(r.example_id);
    console.log(`Resuming — already done: ${doneIds.size}`);
  }

  const todoCount = entries.filter((e) => !doneIds.has(e.id)).length;
  console.log(`To process: ${todoCount} | Concurrency: ${CONCURRENCY} | Model: ${MODEL}`);

  const newResults = await tagInspirationsVision({
    records: entries,
    openai,
    cdnBase: CDN_BASE,
    concurrency: CONCURRENCY,
    doneIds,
    model: MODEL,
    onBatch: ({ results: batchResults, processed, total }) => {
      // Persist after every batch so a crash never loses progress.
      const merged = [...results, ...batchResults];
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
      const pct = ((processed / total) * 100).toFixed(1);
      const errs = batchResults.filter((r) => r.error).length;
      console.log(`Progress: ${processed}/${total} (${pct}%) — batch errors=${errs}`);
    },
  });

  const finalResults = [...results, ...newResults];
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalResults, null, 2));

  const errors = finalResults.filter((r) => r.error).length;
  const success = finalResults.length - errors;
  console.log(`\nFinished. Results written to ${OUTPUT_FILE}`);
  console.log(`Total: ${finalResults.length} | Success: ${success} | Errors: ${errors}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
