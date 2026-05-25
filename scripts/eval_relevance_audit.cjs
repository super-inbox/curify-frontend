#!/usr/bin/env node
// Per-query relevance audit. Runs the same scoring path as
// scripts/eval_search.cjs but reports:
//   1. Distinct templates matching the query (strict tier)
//   2. Top 3 templates by per-template inspiration hits
//   3. A flag on templates that look off-intent (eyeball check candidate)
//
// Used to sanity-check that the 28-query eval set isn't pulling
// irrelevant templates — base_hits=100 is meaningless if 90 of those
// are off-topic templates whose blobs happened to contain a stray
// keyword.

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Standalone — re-implements the eval scorer tokenizer + matcher to
// avoid triggering eval_search.cjs main() side-effect on require.

const TPL = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"));
const INSP = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"));
const EVAL = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/configs/search_eval_set.json"), "utf-8"));

// Tokenizer (mirror of search/page.tsx)
const STRUCTURAL_STOPWORDS = new Set([
  "topic", "topics", "theme", "themes", "insight", "insights", "highlight", "highlights",
  "tag", "tags", "category", "categories", "word", "words", "list", "lists",
  "the", "a", "an", "and", "or", "of", "to", "for", "with", "in", "on", "at", "by", "from",
]);

function normalizeForSearch(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[‐‑‒–—―−﹘﹣－]/g, "-")
    .replace(/[　 ]/g, " ")
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchTokens(query) {
  const norm = normalizeForSearch(query);
  if (!norm) return { primary: [], bigrams: [] };
  const raw = norm.split(/\s+/).filter(Boolean);
  const primary = [];
  for (const t of raw) {
    if (t.length < 2) continue;
    if (STRUCTURAL_STOPWORDS.has(t)) continue;
    if (!/[\p{Script=Han}]/u.test(t)) {
      primary.push(t);
      continue;
    }
    if (t.length === 1) continue;
    primary.push(t);
  }
  const bigrams = [];
  for (const t of raw) {
    if (!/[\p{Script=Han}]/u.test(t)) continue;
    if (t.length < 2) continue;
    for (let i = 0; i < t.length - 1; i++) {
      bigrams.push(t.slice(i, i + 2));
    }
  }
  return { primary, bigrams };
}

// Thresholds match scripts/eval_search.cjs lines 83-88 exactly. Drift
// is a silent precision bug — see the bigramHitThreshold(0)=0 trap that
// trivially passes every template for non-CJK queries.
function relaxedPrimaryThreshold(n) { return n <= 1 ? 1 : Math.ceil(n / 2); }
function bigramHitThreshold(n) {
  if (n <= 1) return 1;
  if (n <= 3) return 2;
  return 3;
}

function scoreBlob(blob, tokens) {
  let primaryHits = 0;
  for (const t of tokens.primary) {
    const isCjk = /[\p{Script=Han}]/u.test(t);
    if (isCjk) {
      if (blob.includes(t)) primaryHits++;
    } else {
      const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(blob)) primaryHits++;
    }
  }
  let bigramHits = 0;
  for (const bg of tokens.bigrams) {
    if (blob.includes(bg)) bigramHits++;
  }
  return { primaryHits, bigramHits, allPrimary: primaryHits === tokens.primary.length };
}

// Build per-template blob (matches the scorer's template-blob view)
function templateBlobFor(t) {
  const parts = [t.id, ...(Array.isArray(t.topics) ? t.topics : String(t.topics || "").split(","))];
  for (const loc of Object.values(t.locales ?? {})) {
    parts.push(loc?.base_prompt);
    for (const p of loc?.parameters ?? []) {
      if (p?.label) parts.push(p.label);
      if (Array.isArray(p?.placeholder)) parts.push(...p.placeholder);
    }
  }
  return normalizeForSearch(parts.filter(Boolean).join(" "));
}

const templateBlob = new Map(TPL.map((t) => [t.id, templateBlobFor(t)]));

function inspBlob(r) {
  const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [l?.title, l?.category]);
  return normalizeForSearch([
    r.id, r.template_id,
    ...(r.tags ?? []),
    ...(r.search_aliases ?? []),
    ...Object.values(r.params ?? {}),
    ...localeFields,
  ].filter((v) => typeof v === "string" && v.length > 0).join(" "));
}

const inspByTemplate = new Map();
for (const r of INSP) {
  if (!inspByTemplate.has(r.template_id)) inspByTemplate.set(r.template_id, []);
  inspByTemplate.get(r.template_id).push(r);
}

function analyzeQuery(query) {
  const tokens = buildSearchTokens(query);
  if (tokens.primary.length === 0 && tokens.bigrams.length === 0) {
    return { strictTpl: [], totalInsp: 0, perTpl: [] };
  }
  const bigramThr = bigramHitThreshold(tokens.bigrams.length);
  const relaxedThr = relaxedPrimaryThreshold(tokens.primary.length);

  const strictTpl = new Set();
  const relaxedTpl = new Set();
  for (const [tid, blob] of templateBlob) {
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) strictTpl.add(tid);
    else if (s.primaryHits >= relaxedThr && relaxedThr > 0) relaxedTpl.add(tid);
  }

  // Inspiration scoring
  const strictByTpl = new Map();
  const relaxedByTpl = new Map();
  for (const r of INSP) {
    if (strictTpl.has(r.template_id)) {
      strictByTpl.set(r.template_id, (strictByTpl.get(r.template_id) ?? 0) + 1);
      continue;
    }
    const blob = inspBlob(r);
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) {
      strictByTpl.set(r.template_id, (strictByTpl.get(r.template_id) ?? 0) + 1);
    } else if (s.primaryHits >= relaxedThr && relaxedThr > 0) {
      relaxedByTpl.set(r.template_id, (relaxedByTpl.get(r.template_id) ?? 0) + 1);
    }
  }

  const useStrict = [...strictByTpl.values()].reduce((a, b) => a + b, 0) > 0;
  const tier = useStrict ? "strict" : "relaxed";
  const byTpl = useStrict ? strictByTpl : relaxedByTpl;

  const perTpl = [...byTpl.entries()]
    .map(([tid, count]) => ({ tid, count, topics: TPL.find((t) => t.id === tid)?.topics ?? [] }))
    .sort((a, b) => b.count - a.count);

  const totalInsp = [...byTpl.values()].reduce((a, b) => a + b, 0);
  return { tier, distinctTpl: byTpl.size, totalInsp, perTpl };
}

function main() {
  const tableRows = [];
  const detailRows = [];
  for (const q of EVAL.queries) {
    const r = analyzeQuery(q.query);
    tableRows.push({
      query: q.query,
      expected: q.expected,
      tier: r.tier,
      distinctTpl: r.distinctTpl,
      totalInsp: r.totalInsp,
    });
    detailRows.push({ query: q.query, perTpl: r.perTpl.slice(0, 4) });
  }

  // Print summary table
  console.log("\n=== distinct-template-count audit ===");
  console.log("query                            | expected | tier    | tpl  | insp");
  console.log("-".repeat(80));
  for (const row of tableRows) {
    console.log(
      `${row.query.padEnd(33)}| ${row.expected.padEnd(8)} | ${row.tier.padEnd(7)} | ${String(row.distinctTpl).padStart(4)} | ${row.totalInsp}`
    );
  }

  // Print top-template breakdown
  console.log("\n=== top templates per query (for relevance eyeball) ===");
  for (const row of detailRows) {
    console.log(`\n• ${row.query}`);
    for (const t of row.perTpl) {
      const topicStr = Array.isArray(t.topics) ? t.topics.join(",") : t.topics;
      console.log(`    ${String(t.count).padStart(3)} × ${t.tid.padEnd(60)} [${topicStr}]`);
    }
  }
}

main();
