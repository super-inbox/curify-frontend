#!/usr/bin/env node
// scripts/generate_example_i18n_seeds.cjs
//
// Generates the EN seed entries in messages/en/example.json for inspirations
// flagged with `allow_i18n: true` in public/data/nano_inspiration.json. Each
// entry produces three SEO fields via Gemini:
//
//   {
//     title:           string  // <= 80 chars, SEO-rich H1
//     description:     string  // ~150-word body paragraph (Trojan-horse copy)
//     metaDescription: string  // <= 155 chars meta description
//   }
//
// After running this, fan out the other 9 locales with:
//
//   node scripts/i18n_autotranslate.cjs --base en --files example --write
//
// Usage:
//   node scripts/generate_example_i18n_seeds.cjs                # generate all missing
//   node scripts/generate_example_i18n_seeds.cjs --dry-run      # show prompt + sample
//   node scripts/generate_example_i18n_seeds.cjs --limit=20     # only first 20 missing
//   node scripts/generate_example_i18n_seeds.cjs --ids=a,b,c    # specific example ids
//
// Requires GEMINI_API_KEY in .env.local.

"use strict";

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

let dotenv;
try { dotenv = require("dotenv"); dotenv.config({ path: ".env.local" }); } catch {}

const { GoogleGenAI } = require("@google/genai");

const ROOT = path.resolve(__dirname, "..");
const INSP_JSON = path.join(ROOT, "public/data/nano_inspiration.json");
const TEMPLATE_JSON = path.join(ROOT, "public/data/nano_templates.json");
const EXAMPLE_I18N_EN = path.join(ROOT, "messages/en/example.json");
const NANO_I18N_EN = path.join(ROOT, "messages/en/nano.json");

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";

// ── Args ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dryRun: false, limit: Infinity, idsFilter: null };
  for (const a of args) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--limit=")) out.limit = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--ids=")) out.idsFilter = new Set(a.split("=")[1].split(","));
  }
  return out;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ── Gemini ────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment / .env.local");
  process.exit(1);
}
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiJson(prompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const parts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  const text = parts.map((p) => p.text || "").join("").trim();
  // Extract first JSON object
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`Gemini returned no JSON: ${text.slice(0, 200)}`);
  return JSON.parse(m[0]);
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt({ exampleId, templateId, templateCategory, templateTitle, params, tags, fallbackTitle }) {
  return `You are an SEO copywriter for a creative AI templates marketplace. Generate
search-optimized English copy for one example image under a parameterized
template. The example will be displayed at /nano-template/<slug>/example/<id>
and needs to attract users searching for the underlying topic — not just
"AI prompt" buyers.

CONTEXT:
- Example id: ${exampleId}
- Template id: ${templateId}
- Template category: ${templateCategory || "(none)"}
- Template title: ${templateTitle || "(none)"}
- Example params: ${JSON.stringify(params)}
- Example tags: ${JSON.stringify(tags || [])}
- Fallback title (if any): ${fallbackTitle || "(none)"}

REQUIREMENTS — return ONLY a single JSON object with these three keys:

  "title":           ≤ 80 chars. SEO-rich H1. Lead with the topic-intent
                     keyword (e.g. "Banana Ripeness Visual Vocabulary
                     Card", not "Nano Banana Prompt: Banana Ripeness").
                     No brand/site suffix.

  "metaDescription": ≤ 155 chars. Suitable for the <meta name="description">
                     tag and SERP snippet. Hook the searcher with the
                     content benefit, end with a soft CTA mentioning AI
                     prompt / generator.

  "description":     130–170 words. On-page body paragraph (2–3 short
                     sentences or one rich paragraph). Open by describing
                     what this example visually shows. Naturally include
                     the topic-intent keyword 1–2 times. Mention 1–2
                     audiences who'd benefit (creators, language learners,
                     designers, educators — pick whichever fit). End
                     with a soft CTA pointing to the prompt / generator.

Output: a single valid JSON object, no markdown fences, no commentary.`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  const inspirations = readJson(INSP_JSON) || [];
  const templates = readJson(TEMPLATE_JSON) || [];
  const templatesById = new Map(templates.map((t) => [t.id, t]));

  // Template-level EN i18n (category/title) — provides extra context for the prompt
  const nanoEn = readJson(NANO_I18N_EN) || {};

  const existing = readJson(EXAMPLE_I18N_EN) || {};

  const candidates = inspirations.filter((d) => {
    if (!d.allow_i18n) return false;
    if (existing[d.id] && existing[d.id].title) return false;
    if (args.idsFilter && !args.idsFilter.has(d.id)) return false;
    return true;
  });

  console.log(`Total inspirations: ${inspirations.length}`);
  console.log(`allow_i18n: true: ${inspirations.filter((d) => d.allow_i18n).length}`);
  console.log(`Existing EN entries: ${Object.keys(existing).length}`);
  console.log(`Missing entries to generate: ${candidates.length}`);
  if (args.limit !== Infinity) console.log(`Limit: ${args.limit}`);
  if (args.dryRun) console.log("(dry-run — no API calls, sample first)");
  console.log("");

  const target = candidates.slice(0, args.limit);
  if (!target.length) {
    console.log("Nothing to generate.");
    return;
  }

  let written = 0;
  for (const ex of target) {
    const tpl = templatesById.get(ex.template_id);
    const tplI18n = nanoEn[ex.template_id] || {};
    const fallbackTitle =
      (ex.locales && (ex.locales.en?.title || ex.locales.zh?.title)) || "";

    const prompt = buildPrompt({
      exampleId: ex.id,
      templateId: ex.template_id,
      templateCategory: tplI18n.category,
      templateTitle: tplI18n.title,
      params: ex.params || {},
      tags: ex.tags || [],
      fallbackTitle,
    });

    if (args.dryRun) {
      console.log(`-- ${ex.id} --`);
      console.log(`prompt:\n${prompt.slice(0, 500)}…\n`);
      // For dry-run, only show first prompt, then bail
      break;
    }

    process.stdout.write(`  → ${ex.id} ... `);
    try {
      const result = await geminiJson(prompt);
      const { title, description, metaDescription } = result || {};
      if (!title || !description || !metaDescription) {
        throw new Error(`Missing field(s). Got keys: ${Object.keys(result || {}).join(", ")}`);
      }
      existing[ex.id] = { title, description, metaDescription };
      writeJson(EXAMPLE_I18N_EN, existing); // checkpoint after each — resumable
      written++;
      console.log("✓");
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  console.log(`\n${written} entries written to messages/en/example.json`);
  console.log(`Run \`node scripts/i18n_autotranslate.cjs --base en --files example --write\` to fan out 9 other locales.`);
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
