#!/usr/bin/env node
/**
 * Search-quality regression eval. Runs each query in
 * scripts/configs/search_eval_set.json through the same tokenizer +
 * catalog-scoring logic as app/[locale]/(public)/search/page.tsx and
 * prints a hit report.
 *
 * Re-run after any change to search/page.tsx, lib/searchRewrite.ts,
 * scripts/topup_search_aliases.py, or the inspiration/template data.
 * Compare the column counts against the `expected` field in the eval
 * set — flag regressions when a query that was `rich` drops to `thin`,
 * or when an `empty` query starts returning misleading hits.
 *
 * Flags:
 *   --rewrite   Also call gpt-4o-mini and re-score with each rewrite,
 *               union the results. Tracks whether the rewriter rescues
 *               thin queries. Requires OPENAI_API_KEY in .env.local.
 *   --quiet     Skip per-query verbose lines; print summary table only.
 *
 * Usage:
 *   node scripts/eval_search.cjs
 *   node scripts/eval_search.cjs --rewrite
 *   node scripts/eval_search.cjs --rewrite --quiet
 */
"use strict";

const fs = require("fs");
const path = require("path");

try { require("dotenv").config({ path: ".env.local" }); } catch {}

const ROOT = path.resolve(__dirname, "..");
const INSP = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"));
const TPL = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"));
const EVAL_SET = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/configs/search_eval_set.json"), "utf-8"));

const argv = process.argv.slice(2);
const USE_REWRITE = argv.includes("--rewrite");
const QUIET = argv.includes("--quiet");

// ---- Template blob (mirror of search/page.tsx) ----
const localesToScan = ["en", "zh"];
const templateBlob = new Map();
for (const loc of localesToScan) {
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(path.join(ROOT, `messages/${loc}/nano.json`), "utf-8"));
  } catch { continue; }
  for (const [tid, e] of Object.entries(entries)) {
    if (!e) continue;
    const parts = [
      e.category, e.title, e.description,
      e?.content?.sections?.what, e?.content?.sections?.who,
    ].filter((v) => typeof v === "string" && v.length > 0);
    if (parts.length === 0) continue;
    const blob = parts.join(" ").toLowerCase();
    templateBlob.set(tid, (templateBlob.get(tid) ?? "") + " " + blob);
  }
}

// ---- Tokenizer (mirror of search/page.tsx) ----
const STOPWORDS = new Set([
  "the","a","an","of","in","on","is","are","and","or","to","for","with","by","at","as","be","this","that",
  "的","了","和","及",
  "topic","topics","theme","themes","category","categories","insights","highlights","guide","guides",
]);
function normalizeForSearch(s) { return s.toLowerCase().replace(/×/g, "x"); }
function buildSearchTokens(query) {
  const primary = normalizeForSearch(query)
    .split(/[\s,，、。.:：=·\/|()\[\]+*]+/)
    .map((w) => w.trim())
    .filter((w) => w && !STOPWORDS.has(w));
  const bigrams = [];
  if (primary.length === 1 && /[一-龥]/.test(primary[0]) && primary[0].length >= 2) {
    const w = primary[0];
    for (let i = 0; i < w.length - 1; i++) {
      const bg = w.slice(i, i + 2);
      if (/^[一-龥]{2}$/.test(bg)) bigrams.push(bg);
    }
  }
  return { primary, bigrams };
}
function relaxedPrimaryThreshold(n) { return n <= 1 ? 1 : Math.ceil(n / 2); }
function bigramHitThreshold(n) {
  if (n <= 1) return 1;
  if (n <= 3) return 2;
  return 3;
}
function tokenInBlob(blob, t) {
  if (!t) return false;
  if (/[一-龥]/.test(t)) return blob.includes(t);
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(blob);
}
function scoreBlob(blob, tokens) {
  let primaryHits = 0;
  for (const t of tokens.primary) if (tokenInBlob(blob, t)) primaryHits++;
  let bigramHits = 0;
  for (const t of tokens.bigrams) if (blob.includes(t)) bigramHits++;
  return { primaryHits, bigramHits, allPrimary: primaryHits === tokens.primary.length };
}

// ---- One scoring pass per query (mirror of scoreQueryTokens) ----
// Returns BOTH the strict count and the "effective" count — effective
// follows the same hasStrict-then-strict-else-relaxed rule the page uses
// (search/page.tsx line ~365: `filter((x) => (hasStrict ? x.strict : true))`),
// so the eval reflects what a user actually sees on the page rather than
// the strict-only floor.
function scoreOnce(query) {
  const tokens = buildSearchTokens(query);
  if (tokens.primary.length === 0 && tokens.bigrams.length === 0) {
    return { strictTpl: new Set(), tplI18n: new Set(), strictInsp: 0, effectiveInsp: 0, matchedIds: new Set() };
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
  const tplI18n = strictTpl.size > 0 ? strictTpl : relaxedTpl;

  const strictIds = new Set();
  const relaxedIds = new Set();
  for (const r of INSP) {
    if (strictTpl.has(r.template_id)) {
      strictIds.add(r.id);
      continue;
    }
    const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [l?.title, l?.category]);
    const blob = normalizeForSearch([
      r.id, r.template_id,
      ...(r.tags ?? []),
      ...(r.search_aliases ?? []),
      ...Object.values(r.params ?? {}),
      ...localeFields,
    ].filter((v) => typeof v === "string" && v.length > 0).join(" "));
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) {
      strictIds.add(r.id);
    } else if (s.primaryHits >= relaxedThr && relaxedThr > 0) {
      relaxedIds.add(r.id);
    }
  }
  const matchedIds = strictIds.size > 0 ? strictIds : relaxedIds;
  return { strictTpl, tplI18n, strictInsp: strictIds.size, effectiveInsp: matchedIds.size, matchedIds };
}

// ---- Rewriter (mirror of lib/searchRewrite.ts) ----
let _openaiClient = undefined;
function getOpenAIClient() {
  if (_openaiClient !== undefined) return _openaiClient;
  if (!process.env.OPENAI_API_KEY) { _openaiClient = null; return null; }
  try {
    const OpenAI = require("openai").default || require("openai");
    _openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15_000 });
  } catch { _openaiClient = null; }
  return _openaiClient;
}

// Pull the prompt + index settings from the live searchAugment module
// so this script stays in sync with production behavior.
const AUGMENT_SRC = fs.readFileSync(path.join(ROOT, "lib/searchAugment.ts"), "utf-8");
const DESCRIPTION_CHAR_CAP = Number(AUGMENT_SRC.match(/DESCRIPTION_CHAR_CAP = (\d+)/)[1]);
const EXAMPLES_CHAR_CAP = Number(AUGMENT_SRC.match(/EXAMPLES_CHAR_CAP = (\d+)/)[1]);
const EXAMPLES_PER_TEMPLATE = Number(AUGMENT_SRC.match(/EXAMPLES_PER_TEMPLATE = (\d+)/)[1]);
const MAX_PICKS = Number(AUGMENT_SRC.match(/MAX_PICKS = (\d+)/)[1]);

const EN_NANO = JSON.parse(
  fs.readFileSync(path.join(ROOT, "messages/en/nano.json"), "utf-8"),
);

// Build the same compact template index the production module builds.
const VALID_TEMPLATE_IDS = new Set(TPL.map((t) => t.id));
const TEMPLATE_INDEX = (() => {
  const paramsByTpl = new Map();
  const aliasByTpl = new Map();
  for (const i of INSP) {
    const tid = i.template_id;
    if (!tid) continue;
    let ps = paramsByTpl.get(tid);
    if (!ps) { ps = new Set(); paramsByTpl.set(tid, ps); }
    for (const v of Object.values(i.params || {})) {
      if (typeof v === "string" && v.length > 0 && v.length <= 40) ps.add(v);
    }
    let bag = aliasByTpl.get(tid);
    if (!bag) { bag = new Map(); aliasByTpl.set(tid, bag); }
    for (const a of i.search_aliases || []) {
      if (typeof a === "string" && a.length > 0 && a.length <= 40) {
        bag.set(a, (bag.get(a) ?? 0) + 1);
      }
    }
  }
  const exMap = new Map();
  for (const tid of new Set([...paramsByTpl.keys(), ...aliasByTpl.keys()])) {
    const params = Array.from(paramsByTpl.get(tid) ?? []);
    const topA = Array.from((aliasByTpl.get(tid) ?? new Map()).entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, EXAMPLES_PER_TEMPLATE)
      .map(([t]) => t);
    const seen = new Set();
    const terms = [];
    for (const t of [...params, ...topA]) {
      if (!seen.has(t)) { seen.add(t); terms.push(t); }
    }
    let j = terms.join(", ");
    if (j.length > EXAMPLES_CHAR_CAP) {
      j = j.slice(0, EXAMPLES_CHAR_CAP - 1).trimEnd() + "…";
    }
    exMap.set(tid, j);
  }
  const lines = TPL.map((t) => {
    const topics = Array.isArray(t.topics)
      ? t.topics
      : String(t.topics ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const i18n = EN_NANO[t.id] ?? {};
    const raw = i18n.description ?? (t.locales?.en?.base_prompt ?? "");
    const desc = raw.length > DESCRIPTION_CHAR_CAP
      ? raw.slice(0, DESCRIPTION_CHAR_CAP - 1).trimEnd() + "…"
      : raw;
    const ex = exMap.get(t.id) ?? "";
    return `${t.id} | ${topics.join(",")} | ${desc.replace(/\s+/g, " ")}${ex ? ` | Examples: ${ex}` : ""}`;
  });
  return lines.join("\n");
})();

function getSystemPrompt() {
  return AUGMENT_SRC
    .match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/)[1]
    .replace("${TEMPLATE_INDEX}", TEMPLATE_INDEX)
    .replace("${MAX_PICKS}", String(MAX_PICKS));
}

// Returns template_ids picked by the LLM (mirrors lib/searchAugment.ts).
async function getRewrites(client, query) {
  const sys = getSystemPrompt();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 300,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: `Query: ${query}` },
    ],
  });
  const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => typeof x === "string")
      .filter((x) => VALID_TEMPLATE_IDS.has(x))
      .slice(0, MAX_PICKS);
  } catch {
    return [];
  }
}

// ---- Verdict logic (compare actual hits against expected) ----
function bucket(strictInsp) {
  if (strictInsp >= 10) return "rich";
  if (strictInsp >= 3) return "moderate";
  if (strictInsp >= 1) return "thin";
  return "empty";
}
function verdict(expected, actualBucket, rewrites, unionHits, baseHits) {
  if (expected === "rewrite_empty") {
    return rewrites.length === 0 ? "PASS" : "FAIL";
  }
  if (expected === "rewrite_recovery") {
    if (baseHits >= 3) return "PASS-noop";
    return rewrites.length > 0 && unionHits >= 3 ? "PASS" : "FAIL";
  }
  // Note: tier-1 topic slugs and tag slugs like `english-chinese`
  // redirect on the live page, but the eval intentionally bypasses the
  // redirect path and scores them against the catalog directly — we
  // want to know /search would still render results if redirect were
  // disabled. Their `expected` is set accordingly (rich / rewrite_recovery).
  return actualBucket === expected ? "PASS" : "WARN";
}

// ---- Main eval ----
async function main() {
  const client = USE_REWRITE ? getOpenAIClient() : null;
  if (USE_REWRITE && !client) {
    console.error("--rewrite requested but OPENAI_API_KEY not loaded");
    process.exit(1);
  }

  const results = [];
  for (const q of EVAL_SET.queries) {
    const base = scoreOnce(q.query);
    let rewrites = [];
    let unionIds = new Set(base.matchedIds);
    if (USE_REWRITE) {
      // New behavior post-2026-05-22: getRewrites returns template_ids
      // from the catalog-mapping augmenter, not query rewrite strings.
      // Promote every inspiration under those template_ids as a strict
      // match — same logic as app/[locale]/(public)/search/page.tsx.
      rewrites = await getRewrites(client, q.query);
      const pickSet = new Set(rewrites);
      for (const r of INSP) {
        if (pickSet.has(r.template_id)) unionIds.add(r.id);
      }
    }
    const actualBucket = bucket(base.effectiveInsp);
    const v = verdict(q.expected, actualBucket, rewrites, unionIds.size, base.effectiveInsp);
    const row = {
      query: q.query,
      source: q.source,
      expected: q.expected,
      base_hits: base.effectiveInsp,
      strict_hits: base.strictInsp,
      base_tpl: base.strictTpl.size,
      base_i18n_tpl: base.tplI18n.size,
      bucket: actualBucket,
      rewrites,
      union_hits: unionIds.size,
      verdict: v,
    };
    results.push(row);
    if (!QUIET) {
      console.log(`\n[${v}] "${q.query}" (source=${q.source}, expected=${q.expected})`);
      console.log(`  strict templates: ${base.strictTpl.size}, i18n-tpl: ${base.tplI18n.size}, strict inspirations: ${base.strictInsp} → bucket=${actualBucket}`);
      if (USE_REWRITE) {
        console.log(`  rewrites: ${JSON.stringify(rewrites)}`);
        if (rewrites.length > 0) console.log(`  union strict inspirations (base ∪ rewrites): ${unionIds.size}`);
      }
      console.log(`  notes: ${q.notes}`);
    }
  }

  // Summary table.
  console.log(`\n${"═".repeat(100)}`);
  console.log(`SUMMARY (${results.length} queries${USE_REWRITE ? " + rewrites" : ""})`);
  console.log(`${"═".repeat(100)}`);
  const cols = USE_REWRITE
    ? ["query", "expected", "base_hits", "union_hits", "verdict"]
    : ["query", "source", "expected", "bucket", "base_hits", "verdict"];
  console.log(cols.map((c) => c.padEnd(c === "query" ? 32 : 14)).join("│ "));
  console.log("─".repeat(100));
  for (const r of results) {
    const row = cols.map((c) => String(r[c] ?? "").padEnd(c === "query" ? 32 : 14)).join("│ ");
    console.log(row);
  }
  const failed = results.filter((r) => r.verdict === "FAIL").length;
  const warned = results.filter((r) => r.verdict === "WARN").length;
  const passed = results.filter((r) => r.verdict.startsWith("PASS")).length;
  console.log(`\n  PASS=${passed}  WARN=${warned}  FAIL=${failed}  (of ${results.length})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
