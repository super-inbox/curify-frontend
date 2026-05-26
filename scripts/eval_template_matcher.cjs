#!/usr/bin/env node
// Lightweight eval for the search ⇄ generation bridge matcher.
//
// Runs gpt-4o-mini against a fixed set of queries (default: the 10
// ProgSEO demo queries) with a "match this query to the best template
// + params" prompt, then measures top-1 and top-3 precision against
// hand-curated baselines. Validates whether the LLM-matcher path
// from the spec actually works before committing engineering time
// to the full search-page integration.
//
// Usage:
//   node scripts/eval_template_matcher.cjs              # 10 ProgSEO queries
//   node scripts/eval_template_matcher.cjs --eval       # 36 search eval set
//   node scripts/eval_template_matcher.cjs --out=/tmp/r.md
//
// Cost: ~$0.001 per query × 10 = ~$0.01 for the ProgSEO baseline.

"use strict";

const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env.local"),
});

const OpenAI = require("openai");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"),
);
const EN_NANO = JSON.parse(
  fs.readFileSync(path.join(ROOT, "messages/en/nano.json"), "utf-8"),
);

const MODEL = "gpt-4o-mini";

// Hand-curated baseline mirrors lib/progseo_demo.ts. Updating that file
// SHOULD trigger updating this baseline — they are intentionally kept
// inline so the eval is self-contained and re-runnable. The user keeps
// the demo + baseline in sync editorially.
const PROGSEO_BASELINE = [
  {
    query: "minimalist autumn outfit for japan travel",
    expected: [
      { template_id: "template-fashion-ecommerce", params: { core_selling_point: "Minimalist autumn outfit for Japan travel" } },
    ],
  },
  {
    query: "infj vs entp dating compatibility chart",
    expected: [
      { template_id: "template-mbti-relationship-infographic", params: { mbti_type_a: "INFJ", mbti_type_b: "ENTP" } },
    ],
  },
  {
    query: "cuban sandwich recipe poster",
    expected: [
      { template_id: "template-recipe", params: { dish_name: "Cuban Sandwich" } },
      { template_id: "template-food", params: { food_name: "Cuban Sandwich" } },
    ],
  },
  {
    query: "bilingual flashcards for kids learning korean fruits",
    expected: [
      { template_id: "template-vocabulary", params: { language_pair: "en-ko", topic_name: "Fruits" } },
    ],
  },
  {
    query: "watercolor map of europe travel destinations",
    expected: [
      { template_id: "template-watercolor-world-map-illustration", params: { continent_name: "Europe" } },
    ],
  },
  {
    query: "monstera plant care guide infographic",
    expected: [
      { template_id: "template-houseplant-care-guide-infographic", params: { plant_name: "Monstera" } },
    ],
  },
  {
    query: "marvel mbti character chart 16 types",
    expected: [
      { template_id: "template-mbti-generic", params: { character_set: "Marvel" } },
    ],
  },
  {
    query: "lunar new year red envelope graphic design",
    expected: [
      { template_id: "template-product-theme-promotional-poster", params: { title_text: "Lunar New Year Red Envelope" } },
    ],
  },
  {
    query: "1950s vintage diner illustration retro poster",
    expected: [
      { template_id: "template-watercolor-theme-collage-illustration", params: { theme: "1950s vintage American diner" } },
    ],
  },
  {
    query: "before after kitchen organization makeover",
    expected: [
      { template_id: "template-home-organization-before-after", params: { space_type: "Kitchen" } },
    ],
  },
];

// Eval-set queries (no hand-curated template baseline — print verdicts
// for eyeball review). Sourced from scripts/configs/search_eval_set.json
// if --eval is passed.
function loadEvalSet() {
  const p = path.join(ROOT, "scripts/configs/search_eval_set.json");
  if (!fs.existsSync(p)) return [];
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  return data.map((row) => ({ query: row.query, expected: [] }));
}

function buildCatalogBlob() {
  const lines = [];
  for (const t of TEMPLATES) {
    if (t.allow_generation !== true) continue;
    const en = EN_NANO[t.id] || {};
    const desc = (en.description || "")
      .replace(/\s+/g, " ")
      .slice(0, 180);
    const params = (t.locales?.en?.parameters || [])
      .map((p) => p.name)
      .join(",");
    lines.push(`- ${t.id} | params=[${params}] | ${desc}`);
  }
  return lines.join("\n");
}

const TEMPLATE_IDS = new Set(TEMPLATES.map((t) => t.id));

const SYSTEM_PROMPT = `You match user search queries to Curify image-generation templates that could create content for those queries.

For EACH query, decide:
- top 2-3 best-fit templates (ordered by confidence desc; fewer is fine if no clear fit)
- for each pick: concrete parameter values extracted from the query
- confidence in 0.0..1.0 (be honest — 0.3 + reason is fine if uncertain)
- short reason (<= 80 chars)

CRITICAL — read EVERY modifier in the query, not just the subject noun. Templates are differentiated by visual style AND layout, not only topic:

- **Style modifiers** (watercolor / retro / vintage / minimalist / photorealistic / anime / kawaii / ink / monochrome) — pick a template whose OUTPUT natively has that style. "Watercolor map" needs a watercolor map template, not a generic destination list.
- **Format / layout modifiers** (chart / grid / list of N / top 10 / 16 types / dual / before-after / comparison / timeline) — pick the template whose LAYOUT matches. "Chart of 16 MBTI types" needs a grid/chart template, NOT a single-character profile. Read the template's parameter shape: a single-value param (one name, one item) produces ONE artifact; multi-character or topic-as-set params produce a grid.
- **Audience modifiers** (for kids / for beginners / educational / for parents) — pick the template whose style fits the audience (kids → cartoon/watercolor; beginner → simpler layouts).
- **Artifact-type modifiers** (recipe poster / promotional poster / care guide / how-to / infographic) — these name the artifact directly. Prefer the template that explicitly produces that artifact.

Pick templates that can GENERATE content for the query AS TYPED, not just templates whose tags overlap with one word.

Examples of the modifier check:
- "marvel mbti chart 16 types" → mbti-generic (grid of all 16) NOT mbti-marvel (single character_name param)
- "watercolor map of europe" → watercolor-world-map-illustration NOT any other map template
- "before after kitchen organization" → home-organization-before-after NOT a generic home decor template

Catalog:
{catalog}

Return ONLY a JSON object: {"matches": [{"template_id": "template-...", "params": {"key": "value"}, "confidence": 0.85, "reason": "..."}]}.
No prose, no markdown fences.

Query: {query}`;

async function matchQuery(client, catalogBlob, query) {
  const prompt = SYSTEM_PROMPT.replace("{catalog}", catalogBlob).replace("{query}", query);
  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 800,
  });
  let raw = (resp.choices[0].message.content || "").trim();
  raw = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { matches: [], error: `parse failed: ${err.message}; raw: ${raw.slice(0, 120)}` };
  }
  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];
  // Validate template_ids; reject hallucinations
  const cleaned = matches
    .filter((m) => m && m.template_id && TEMPLATE_IDS.has(m.template_id))
    .slice(0, 3);
  return { matches: cleaned };
}

function fmtMatch(m) {
  const ps = Object.entries(m.params || {})
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(", ");
  return `${m.template_id} (${m.confidence}) — ${ps}`;
}

function scoreVerdict(expected, returned) {
  if (!expected.length) return { kind: "no_baseline", top1: null, top3: null };
  const expectedIds = new Set(expected.map((e) => e.template_id));
  const returnedIds = returned.map((m) => m.template_id);
  const top1 = returnedIds[0] && expectedIds.has(returnedIds[0]);
  const top3 = returnedIds.some((id) => expectedIds.has(id));
  return { kind: "scored", top1, top3 };
}

async function main() {
  const args = process.argv.slice(2);
  const useEvalSet = args.includes("--eval");
  const outArg = args.find((a) => a.startsWith("--out="));
  const outPath = outArg ? outArg.slice(6) : `/tmp/template_matcher_eval_${Date.now()}.md`;

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY required (set in .env.local)");
    process.exit(1);
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000 });

  const tests = useEvalSet ? loadEvalSet() : PROGSEO_BASELINE;
  const catalogBlob = buildCatalogBlob();
  const catalogTokensApprox = Math.round(catalogBlob.length / 4);
  console.log(`tests:               ${tests.length}`);
  console.log(`catalog templates:   ${TEMPLATES.filter((t) => t.allow_generation === true).length} (allow_generation=true)`);
  console.log(`catalog blob bytes:  ${catalogBlob.length} (~${catalogTokensApprox} tokens)`);
  console.log(`model:               ${MODEL}`);
  console.log("");

  const rows = [];
  for (const { query, expected } of tests) {
    process.stdout.write(`→ ${query}…`);
    const t0 = Date.now();
    const result = await matchQuery(client, catalogBlob, query);
    const ms = Date.now() - t0;
    if (result.error) {
      console.log(` ERROR (${ms}ms): ${result.error}`);
      rows.push({ query, expected, matches: [], error: result.error, ms });
      continue;
    }
    const verdict = scoreVerdict(expected, result.matches);
    console.log(` ${ms}ms · ${result.matches.length} matches · ${verdict.kind === "scored" ? (verdict.top1 ? "✓ top-1" : verdict.top3 ? "~ top-3 only" : "✗ miss") : "(no baseline)"}`);
    rows.push({ query, expected, matches: result.matches, verdict, ms });
  }

  // Summary
  const scored = rows.filter((r) => r.verdict?.kind === "scored");
  const top1Hits = scored.filter((r) => r.verdict.top1).length;
  const top3Hits = scored.filter((r) => r.verdict.top3).length;

  console.log("");
  console.log("=== summary ===");
  if (scored.length > 0) {
    console.log(`top-1 precision: ${top1Hits}/${scored.length} = ${((100 * top1Hits) / scored.length).toFixed(0)}%`);
    console.log(`top-3 precision: ${top3Hits}/${scored.length} = ${((100 * top3Hits) / scored.length).toFixed(0)}%`);
  }
  const errCount = rows.filter((r) => r.error).length;
  if (errCount > 0) console.log(`errors:          ${errCount}`);
  const avgMs = Math.round(rows.reduce((s, r) => s + r.ms, 0) / rows.length);
  console.log(`avg latency:     ${avgMs}ms`);

  // Markdown report
  const lines = [];
  lines.push(`# Template-matcher eval — ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`- model: \`${MODEL}\``);
  lines.push(`- tests: ${tests.length} (${useEvalSet ? "search_eval_set" : "ProgSEO baseline"})`);
  lines.push(`- catalog: ${TEMPLATES.filter((t) => t.allow_generation === true).length} templates · ~${catalogTokensApprox} tokens`);
  if (scored.length > 0) {
    lines.push(`- **top-1 precision**: ${top1Hits}/${scored.length} = ${((100 * top1Hits) / scored.length).toFixed(0)}%`);
    lines.push(`- **top-3 precision**: ${top3Hits}/${scored.length} = ${((100 * top3Hits) / scored.length).toFixed(0)}%`);
  }
  lines.push(`- avg latency: ${avgMs}ms`);
  lines.push("");

  for (const r of rows) {
    lines.push(`## \`${r.query}\``);
    lines.push("");
    if (r.error) {
      lines.push(`> ERROR: ${r.error}`);
      lines.push("");
      continue;
    }
    if (r.expected.length > 0) {
      lines.push(`**expected**:`);
      for (const e of r.expected) {
        const ps = Object.entries(e.params || {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
        lines.push(`- \`${e.template_id}\` — ${ps}`);
      }
      lines.push(`**verdict**: ${r.verdict.top1 ? "✓ top-1 match" : r.verdict.top3 ? "~ top-3 only (not top-1)" : "✗ miss"}`);
      lines.push("");
    }
    lines.push(`**LLM matches** (${r.matches.length}, ${r.ms}ms):`);
    if (r.matches.length === 0) lines.push("- *(none)*");
    for (const m of r.matches) {
      lines.push(`- \`${m.template_id}\` · confidence ${m.confidence}`);
      lines.push(`  - params: \`${JSON.stringify(m.params || {})}\``);
      if (m.reason) lines.push(`  - reason: ${m.reason}`);
    }
    lines.push("");
  }

  fs.writeFileSync(outPath, lines.join("\n"));
  console.log("");
  console.log(`report:          ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
