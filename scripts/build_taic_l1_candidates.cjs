#!/usr/bin/env node
/**
 * Pre-computes TAIC L1 (Template Selection Accuracy) candidates for the
 * curify-studio admin-portal "Agentic Eval" tab.
 *
 * Inputs:
 *   scripts/configs/search_eval_set.json (full eval set)
 *   lib/searchTemplateMatch.ts          (SYSTEM_PROMPT + CATALOG)
 *   public/data/nano_templates.json     (allow_generation gate + thumbnails)
 *   messages/en/nano.json               (description for catalog blob)
 *
 * Output:
 *   public/data/taic_l1_candidates.json — array of:
 *     {
 *       query, source, expected, expected_templates,
 *       candidates: [
 *         { template_id, confidence, reason, params, title, thumbnail }
 *       ]
 *     }
 *
 * Run once + commit. Re-run weekly OR whenever lib/searchTemplateMatch.ts
 * SYSTEM_PROMPT changes OR when new templates land. ~$0.125 / 125 queries
 * cold cost (cheap — single one-shot gpt-4o-mini call per query).
 *
 * Usage:
 *   node scripts/build_taic_l1_candidates.cjs              # all queries
 *   node scripts/build_taic_l1_candidates.cjs --limit 20   # quick test
 *   node scripts/build_taic_l1_candidates.cjs --concurrency 8
 */
"use strict";

const fs = require("fs");
const path = require("path");
try { require("dotenv").config({ path: ".env.local" }); } catch {}

const ROOT = path.resolve(__dirname, "..");
const EVAL_SET = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/configs/search_eval_set.json"), "utf-8"),
);
const TPL = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"),
);
const EN_NANO = JSON.parse(
  fs.readFileSync(path.join(ROOT, "messages/en/nano.json"), "utf-8"),
);

const argv = process.argv.slice(2);
const LIMIT = (() => {
  const i = argv.indexOf("--limit");
  return i >= 0 ? parseInt(argv[i + 1], 10) || Infinity : Infinity;
})();
const CONCURRENCY = (() => {
  const i = argv.indexOf("--concurrency");
  return i >= 0 ? Math.max(1, parseInt(argv[i + 1], 10) || 4) : 4;
})();

// Extract SYSTEM_PROMPT from lib/searchTemplateMatch.ts so we stay in sync
// if the prompt evolves — mirrors the pattern in scripts/eval_search.cjs.
const MOD = fs.readFileSync(path.join(ROOT, "lib/searchTemplateMatch.ts"), "utf-8");
const SYSTEM_PROMPT_RAW = MOD.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/)?.[1];
if (!SYSTEM_PROMPT_RAW) {
  console.error("Could not extract SYSTEM_PROMPT from lib/searchTemplateMatch.ts");
  process.exit(1);
}

// Build the catalog blob (mirror of lib/searchTemplateMatch.ts buildCatalogBlob)
function buildCatalogBlob() {
  const lines = [];
  for (const t of TPL) {
    if (t.allow_generation !== true) continue;
    const desc = (EN_NANO[t.id]?.description ?? "")
      .replace(/\s+/g, " ")
      .slice(0, 180);
    const params = (t.locales?.en?.parameters ?? [])
      .map((p) => p?.name)
      .filter((n) => Boolean(n))
      .join(",");
    lines.push(`- ${t.id} | params=[${params}] | ${desc}`);
  }
  return lines.join("\n");
}
const CATALOG_BLOB = buildCatalogBlob();
const SYSTEM_PROMPT = SYSTEM_PROMPT_RAW.replace("{catalog}", CATALOG_BLOB);
const ALLOWED_IDS = new Set(TPL.filter((t) => t.allow_generation === true).map((t) => t.id));

// Template thumbnail + title index — for the labeling UI
const TPL_INDEX = new Map();
for (const t of TPL) {
  const en = t.locales?.en ?? {};
  TPL_INDEX.set(t.id, {
    title: en.category || en.title || t.id,
    thumbnail: t.og_image,
  });
}

// OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in env (.env.local).");
  process.exit(1);
}
const OpenAI = require("openai").default || require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000 });

async function matchOne(query) {
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Query: ${query.trim()}` },
      ],
    });
    const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];
    const out = [];
    const seen = new Set();
    for (const m of matches) {
      const tid = m?.template_id;
      if (typeof tid !== "string" || !ALLOWED_IDS.has(tid) || seen.has(tid)) continue;
      seen.add(tid);
      const conf = typeof m?.confidence === "number" ? Math.max(0, Math.min(1, m.confidence)) : 0.5;
      const meta = TPL_INDEX.get(tid) ?? {};
      out.push({
        template_id: tid,
        confidence: Number(conf.toFixed(2)),
        reason: String(m?.reason ?? "").slice(0, 120),
        params: typeof m?.params === "object" && m.params ? m.params : {},
        title: meta.title ?? tid,
        thumbnail: meta.thumbnail ?? null,
      });
      if (out.length >= 3) break;
    }
    return out;
  } catch (err) {
    console.error(`  ✗ ${query} — ${err.message}`);
    return [];
  }
}

// Worker pool — naive Promise.all batches
async function runPool(items, fn, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

(async function main() {
  const queries = EVAL_SET.queries.slice(0, LIMIT);
  console.log(`=== build_taic_l1_candidates ===`);
  console.log(`  eval set: ${EVAL_SET.queries.length} total, processing ${queries.length}`);
  console.log(`  catalog:  ${ALLOWED_IDS.size} allow_generation=true templates`);
  console.log(`  concurrency: ${CONCURRENCY}`);
  console.log("");

  const t0 = Date.now();
  const results = await runPool(
    queries,
    async (q, i) => {
      const candidates = await matchOne(q.query);
      const tag = candidates.length === 0 ? "✗ empty" : `${candidates.length} cands`;
      console.log(`  [${i + 1}/${queries.length}] ${q.query.slice(0, 60).padEnd(60)} ${tag}`);
      return {
        query: q.query,
        source: q.source,
        expected: q.expected,
        expected_templates: q.expected_templates,
        candidates,
      };
    },
    CONCURRENCY,
  );

  const empties = results.filter((r) => r.candidates.length === 0).length;
  const out = {
    meta: {
      generated_at: new Date().toISOString(),
      eval_set_size: EVAL_SET.queries.length,
      processed: results.length,
      empty_matcher_returns: empties,
      catalog_size: ALLOWED_IDS.size,
    },
    queries: results,
  };
  const outPath = path.join(ROOT, "public/data/taic_l1_candidates.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const sec = Math.round((Date.now() - t0) / 1000);
  console.log("");
  console.log(`✓ Wrote ${outPath}`);
  console.log(`  ${results.length} queries, ${empties} empty, ${sec}s wall time`);
})();
