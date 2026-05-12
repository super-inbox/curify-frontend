#!/usr/bin/env node
// scripts/generate_topics_i18n_seeds.cjs
//
// For each topic in messages/en/topics.json that's missing an `intro` or
// `keywords`, generate them via OpenAI and write back. Designed to be
// idempotent + resumable — already-populated entries are skipped.
//
// After running this, fan out to non-EN locales with:
//   node scripts/i18n_autotranslate.cjs --base en --files topics --write
//
// Usage:
//   node scripts/generate_topics_i18n_seeds.cjs
//   node scripts/generate_topics_i18n_seeds.cjs --dry-run
//   node scripts/generate_topics_i18n_seeds.cjs --limit=10
//   node scripts/generate_topics_i18n_seeds.cjs --slugs=character,travel

"use strict";

const fs = require("fs");
const path = require("path");
try { require("dotenv").config({ path: ".env.local" }); } catch {}

const OpenAI = require("openai");

const ROOT = path.resolve(__dirname, "..");
const TOPICS_EN = path.join(ROOT, "messages/en/topics.json");
const SEARCH_INDEX = path.join(ROOT, "lib/searchIndex.ts");
const DEFAULT_MODEL = "gpt-4o-mini";

// Pull `slug → aliases[]` out of lib/searchIndex.ts via regex so we can
// seed keywords directly from the existing search-suggestion synonyms.
// Falls back to OpenAI generation for topics not in the index.
function loadSearchAliases() {
  const src = fs.readFileSync(SEARCH_INDEX, "utf-8");
  const out = new Map();
  // Match { ... slug: "x" ... aliases: [...] ... } across one entry.
  const entryRe = /\{[^{}]*?slug:\s*"([^"]+)"[^{}]*?aliases:\s*\[([^\]]*)\][^{}]*?\}/g;
  let m;
  while ((m = entryRe.exec(src)) !== null) {
    const slug = m[1];
    const aliasesRaw = m[2];
    const aliases = [...aliasesRaw.matchAll(/"([^"]+)"/g)].map((a) => a[1]);
    if (aliases.length) out.set(slug, aliases);
  }
  return out;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dryRun: false, limit: Infinity, slugsFilter: null, model: DEFAULT_MODEL };
  for (const a of args) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--limit=")) out.limit = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--slugs=")) out.slugsFilter = new Set(a.split("=")[1].split(","));
    else if (a.startsWith("--model=")) out.model = a.split("=")[1];
  }
  return out;
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("❌ Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}
const openai = new OpenAI({ apiKey, timeout: 60000 });

async function openaiJson(prompt, model) {
  const resp = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.7,
    messages: [
      { role: "system", content: "You are an SEO copywriter. Always return valid JSON." },
      { role: "user", content: prompt },
    ],
  });
  const text = resp.choices?.[0]?.message?.content || "";
  return JSON.parse(text);
}

function buildPrompt({ slug, displayName, title, description, fieldsNeeded }) {
  const fields = {
    intro: `"intro": A 3-4 sentence introductory paragraph for the topic
    page. Open by describing what content this topic covers (templates,
    examples, prompts), name 2-3 audiences who'd benefit (creators,
    educators, designers, fans, etc — pick whichever fit), and end with
    a soft pointer to the templates / examples below. Write naturally;
    avoid generic AI-marketing phrases like "in today's fast-paced world".`,
    keywords: `"keywords": Array of 5 short SEO keyword phrases related
    to the topic (each 1-3 words, e.g. ["MBTI personality cards",
    "INTJ portrait", "personality infographic"]). No brand names.`,
  };

  const wanted = fieldsNeeded.map((f) => `  - ${fields[f]}`).join("\n");
  const returnKeys = fieldsNeeded.map((f) => `"${f}"`).join(", ");

  return `Generate SEO copy for one topic page on a creative AI templates
gallery. The page lists templates and examples tagged with this topic.

CONTEXT:
- Topic slug: ${slug}
- Display name: ${displayName}
- Page <title>: ${title}
- Existing 1-line description: ${description}

GENERATE THESE FIELDS:
${wanted}

Return ONLY a JSON object with keys ${returnKeys}. No markdown, no commentary.`;
}

async function main() {
  const args = parseArgs();
  const file = JSON.parse(fs.readFileSync(TOPICS_EN, "utf-8"));
  const topics = file.topics || {};
  const REQUIRED = ["intro", "keywords"];

  // First pass: seed keywords from search-index aliases for any topic
  // that doesn't already have keywords. This avoids burning OpenAI calls
  // on topics where we already have hand-curated synonyms in TS.
  const aliasesBySlug = loadSearchAliases();
  let seededFromAliases = 0;
  for (const [slug, entry] of Object.entries(topics)) {
    if (Array.isArray(entry.keywords) && entry.keywords.length > 0) continue;
    const aliases = aliasesBySlug.get(slug);
    if (aliases && aliases.length > 0) {
      entry.keywords = [...aliases];
      seededFromAliases++;
    }
  }
  if (seededFromAliases > 0) {
    fs.writeFileSync(TOPICS_EN, JSON.stringify(file, null, 2) + "\n", "utf-8");
    console.log(`Seeded keywords from search-index aliases on ${seededFromAliases} topics.`);
  }

  const allSlugs = Object.keys(topics);
  const candidates = allSlugs.filter((slug) => {
    if (args.slugsFilter && !args.slugsFilter.has(slug)) return false;
    const e = topics[slug];
    return REQUIRED.some((f) => {
      const v = e[f];
      return v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0);
    });
  });

  console.log(`Total topics: ${allSlugs.length}`);
  console.log(`Topics needing fields: ${candidates.length}`);
  console.log(`Model: ${args.model}`);
  if (args.dryRun) console.log("(dry-run)");
  console.log("");

  const target = candidates.slice(0, args.limit);
  if (!target.length) { console.log("Nothing to generate."); return; }

  let written = 0, failed = 0;
  for (let i = 0; i < target.length; i++) {
    const slug = target[i];
    const e = topics[slug];
    const fieldsNeeded = REQUIRED.filter((f) => {
      const v = e[f];
      return v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0);
    });

    const prompt = buildPrompt({
      slug,
      displayName: e.displayName || slug,
      title: e.title || "",
      description: e.description || "",
      fieldsNeeded,
    });

    if (args.dryRun) {
      console.log(`-- ${slug} --`);
      console.log(`Need: ${fieldsNeeded.join(", ")}`);
      console.log(prompt);
      break;
    }

    process.stdout.write(`  [${i + 1}/${target.length}] ${slug} (need: ${fieldsNeeded.join(",")}) ... `);
    try {
      const result = await openaiJson(prompt, args.model);
      for (const f of fieldsNeeded) {
        if (f === "intro") {
          if (typeof result.intro !== "string" || !result.intro.trim()) throw new Error("intro empty");
          e.intro = result.intro.trim();
        } else if (f === "keywords") {
          if (!Array.isArray(result.keywords) || result.keywords.length === 0) throw new Error("keywords empty");
          e.keywords = result.keywords.map((k) => String(k).trim()).filter(Boolean);
        }
      }
      // Checkpoint after each topic
      fs.writeFileSync(TOPICS_EN, JSON.stringify(file, null, 2) + "\n", "utf-8");
      written++;
      console.log("✓");
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${written} written, ${failed} failed.`);
  console.log(`Run \`node scripts/i18n_autotranslate.cjs --base en --files topics --write\` to fan out.`);
}

main().catch((err) => { console.error("❌", err); process.exit(1); });
