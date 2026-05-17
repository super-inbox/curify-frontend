#!/usr/bin/env node
// scripts/generate_example_i18n_seeds.cjs
//
// Generates EN seed entries in messages/en/example.json for inspirations
// flagged with `allow_i18n: true` in public/data/nano_inspiration.json.
// Each entry has three SEO fields:
//
//   {
//     title:           string  // <= 80 chars, SEO-rich H1
//     description:     string  // ~150-word body paragraph (Trojan-horse copy)
//     metaDescription: string  // <= 155 chars meta description
//   }
//
// Partial entries are supported: if a hand-authored description (or any
// other field) is already present in messages/en/example.json, the script
// generates ONLY the missing fields and preserves the rest.
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
//   node scripts/generate_example_i18n_seeds.cjs --model=gpt-4o # higher-quality output
//
// Requires OPENAI_API_KEY in .env.local.

"use strict";

const fs = require("fs");
const path = require("path");

let dotenv;
try { dotenv = require("dotenv"); dotenv.config({ path: ".env.local" }); } catch {}

const OpenAI = require("openai");

const ROOT = path.resolve(__dirname, "..");
const INSP_JSON = path.join(ROOT, "public/data/nano_inspiration.json");
const TEMPLATE_JSON = path.join(ROOT, "public/data/nano_templates.json");
const EXAMPLE_I18N_EN = path.join(ROOT, "messages/en/example.json");
const NANO_I18N_EN = path.join(ROOT, "messages/en/nano.json");

const DEFAULT_MODEL = "gpt-4o-mini";

// ── Args ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dryRun: false, limit: Infinity, idsFilter: null, model: DEFAULT_MODEL, includeAll: false, skipMbti: false };
  for (const a of args) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--include-all") out.includeAll = true;
    else if (a === "--skip-mbti") out.skipMbti = true;
    else if (a.startsWith("--limit=")) out.limit = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--ids=")) out.idsFilter = new Set(a.split("=")[1].split(","));
    else if (a.startsWith("--model=")) out.model = a.split("=")[1];
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

// ── OpenAI ────────────────────────────────────────────────────────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in environment / .env.local");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function openaiJson(prompt, model) {
  const response = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are an SEO copywriter. Always return valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });
  const text = response.choices?.[0]?.message?.content || "";
  return JSON.parse(text);
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt({
  exampleId,
  templateId,
  templateCategory,
  templateTitle,
  params,
  tags,
  fallbackTitle,
  existingDescription,
  fieldsNeeded,
}) {
  const fieldDescriptions = {
    title: `"title": ≤ 80 chars. SEO-rich H1. Lead with the topic-intent
    keyword (e.g. "Magic Johnson — ESFJ Floor General MBTI Card",
    not "Nano Banana Prompt: Magic Johnson"). No brand/site suffix.`,
    metaDescription: `"metaDescription": ≤ 155 chars. Suitable for the
    <meta name="description"> tag and SERP snippet. Hook the searcher
    with the content benefit, end with a soft CTA mentioning AI prompt
    or generator.`,
    description: `"description": 130–170 words. On-page body paragraph
    (2–3 short sentences or one rich paragraph). Open by describing
    what this example visually shows. Naturally include the topic-intent
    keyword 1–2 times. Mention 1–2 audiences who'd benefit (creators,
    language learners, designers, educators, fans, etc — pick whichever
    fit). End with a soft CTA pointing to the prompt or generator.`,
  };

  const wantList = fieldsNeeded.map((f) => `  - ${fieldDescriptions[f]}`).join("\n");
  const returnKeys = fieldsNeeded.map((f) => `"${f}"`).join(", ");

  const existingBlock = existingDescription
    ? `EXISTING DESCRIPTION (already authored — keep tone consistent, do NOT regenerate):\n${existingDescription}\n`
    : "";

  return `You are an SEO copywriter for a creative AI templates marketplace.
Generate search-optimized English copy for one example image under a
parameterized template. The example is shown at /nano-template/<slug>/example/<id>
and needs to attract users searching for the underlying topic — not just
"AI prompt" buyers.

CONTEXT:
- Example id: ${exampleId}
- Template id: ${templateId}
- Template category: ${templateCategory || "(none)"}
- Template title: ${templateTitle || "(none)"}
- Example params: ${JSON.stringify(params)}
- Example tags: ${JSON.stringify(tags || [])}
- Fallback title: ${fallbackTitle || "(none)"}
${existingBlock}
GENERATE THESE FIELDS:
${wantList}

Return ONLY a JSON object with keys ${returnKeys}. No markdown, no commentary.`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  const inspirations = readJson(INSP_JSON) || [];
  const templates = readJson(TEMPLATE_JSON) || [];
  const templatesById = new Map(templates.map((t) => [t.id, t]));
  const nanoEn = readJson(NANO_I18N_EN) || {};
  const existing = readJson(EXAMPLE_I18N_EN) || {};

  // Default: only allow_i18n=true examples (10-locale primary content).
  // --include-all also includes allow_i18n=false examples so EN/ZH thin
  // example pages get unique descriptions for the indexing bucket
  // ("Crawled - currently not indexed"). Non-en/zh variants of
  // allow_i18n=false are still noindex'd by the example page, so the
  // generated copy only affects the EN/ZH indexable surface.
  let allowed = args.includeAll
    ? inspirations
    : inspirations.filter((d) => d.allow_i18n);

  // --skip-mbti excludes MBTI templates (template id contains "mbti" OR
  // template topics include "mbti" / "personality"). Useful when the
  // base prompt risks hallucinating MBTI types for examples whose ID
  // doesn't carry an explicit type token (e.g., Hulk -> ENFP nonsense).
  // Run MBTI templates with a tightened prompt in a follow-up pass.
  if (args.skipMbti) {
    const mbtiTpls = new Set();
    for (const t of templates) {
      const topics = t.topics || [];
      if ((t.id && t.id.includes("mbti")) || topics.includes("mbti") || topics.includes("personality")) {
        mbtiTpls.add(t.id);
      }
    }
    const before = allowed.length;
    allowed = allowed.filter((d) => !mbtiTpls.has(d.template_id));
    console.log(`--skip-mbti: dropped ${before - allowed.length} MBTI examples (${mbtiTpls.size} templates).`);
  }

  const REQUIRED = ["title", "metaDescription", "description"];

  const candidates = allowed
    .filter((d) => {
      if (args.idsFilter && !args.idsFilter.has(d.id)) return false;
      const e = existing[d.id] || {};
      return REQUIRED.some((f) => !e[f]);
    });

  console.log(`Total inspirations: ${inspirations.length}`);
  console.log(`In scope (${args.includeAll ? "all" : "allow_i18n=true only"}): ${allowed.length}`);
  console.log(`Existing entries (any field): ${Object.keys(existing).length}`);
  console.log(`Entries needing generation: ${candidates.length}`);
  console.log(`Model: ${args.model}`);
  if (args.limit !== Infinity) console.log(`Limit: ${args.limit}`);
  if (args.dryRun) console.log("(dry-run — no API calls; sample first prompt only)");
  console.log("");

  const target = candidates.slice(0, args.limit);
  if (!target.length) {
    console.log("Nothing to generate.");
    return;
  }

  let written = 0;
  let failed = 0;
  for (let i = 0; i < target.length; i++) {
    const ex = target[i];
    const tpl = templatesById.get(ex.template_id);
    const tplI18n = nanoEn[ex.template_id] || {};
    const fallbackTitle =
      (ex.locales && (ex.locales.en?.title || ex.locales.zh?.title)) || "";
    const e = existing[ex.id] || {};
    const fieldsNeeded = REQUIRED.filter((f) => !e[f]);

    const prompt = buildPrompt({
      exampleId: ex.id,
      templateId: ex.template_id,
      templateCategory: tplI18n.category,
      templateTitle: tplI18n.title,
      params: ex.params || {},
      tags: ex.tags || [],
      fallbackTitle,
      existingDescription: e.description || null,
      fieldsNeeded,
    });

    if (args.dryRun) {
      console.log(`-- ${ex.id} --`);
      console.log(`Fields needed: ${fieldsNeeded.join(", ")}`);
      console.log(`Prompt:\n${prompt}\n`);
      break;
    }

    process.stdout.write(`  [${i + 1}/${target.length}] ${ex.id} (need: ${fieldsNeeded.join(",")}) ... `);
    try {
      const result = await openaiJson(prompt, args.model);
      // Merge generated fields into existing entry
      existing[ex.id] = { ...e };
      for (const f of fieldsNeeded) {
        if (typeof result?.[f] === "string" && result[f].trim()) {
          existing[ex.id][f] = result[f].trim();
        } else {
          throw new Error(`Missing or empty field: ${f}`);
        }
      }
      writeJson(EXAMPLE_I18N_EN, existing); // checkpoint after each
      written++;
      console.log("✓");
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
    }
  }

  console.log(`\n${written} entries written, ${failed} failed.`);
  console.log(`Run \`node scripts/i18n_autotranslate.cjs --base en --files example --write\` to fan out 9 other locales.`);
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
