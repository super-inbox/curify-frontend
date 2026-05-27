#!/usr/bin/env node
/**
 * Search-quality regression eval. Runs each query in
 * scripts/configs/search_eval_set.json through the same tokenizer +
 * catalog-scoring logic as app/[locale]/(public)/search/page.tsx and
 * prints a hit report.
 *
 * Scores TWO surfaces:
 *  (a) inspiration richness — existing strict/relaxed matcher count,
 *      verdict vs eval set `expected` field
 *  (b) template richness — # templates surfaced by the LLM matcher
 *      from lib/searchTemplateMatch.ts (only when --matcher is set),
 *      verdict vs eval set `expected_templates` field
 *
 * Re-run after any change to search/page.tsx, lib/searchRewrite.ts,
 * scripts/topup_search_aliases.py, or the inspiration/template data.
 *
 * Flags:
 *   --rewrite   Also call gpt-4o-mini and re-score with each rewrite,
 *               union the results. Tracks whether the rewriter rescues
 *               thin queries. Requires OPENAI_API_KEY in .env.local.
 *   --matcher   Also call lib/searchTemplateMatch.ts for each query and
 *               score template richness vs `expected_templates`. Adds
 *               ~$0.09 LLM cost across the 46-query set; ~2-3s per
 *               query (≈ 2 min for the full run).
 *   --quiet     Skip per-query verbose lines; print summary table only.
 *
 * Usage:
 *   node scripts/eval_search.cjs                # inspiration only
 *   node scripts/eval_search.cjs --matcher      # + template richness
 *   node scripts/eval_search.cjs --matcher --quiet
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
const USE_MATCHER = argv.includes("--matcher");
const QUIET = argv.includes("--quiet");

// Production threshold from app/[locale]/(public)/search/GenerableTemplatesSection.tsx
const MATCHER_MIN_CONFIDENCE = 0.4;

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

// Pull the prompt from the live module so this script stays in sync.
function getSystemPrompt() {
  const mod = fs.readFileSync(path.join(ROOT, "lib/searchRewrite.ts"), "utf-8");
  const ctx = mod.match(/const CATALOG_CONTEXT = `([\s\S]*?)`;/)[1];
  const sys = mod.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/)[1];
  return sys.replace("${CATALOG_CONTEXT}", ctx);
}

async function getRewrites(client, query) {
  const sys = getSystemPrompt();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 200,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: `Original query: ${query}` },
    ],
  });
  const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(cleaned) ?? []; } catch { return []; }
}

// ---- Template matcher (mirror of lib/searchTemplateMatch.ts) ----
// Pull the prompt from the live module + build the same catalog blob
// the production matcher sends so this eval stays in sync. Loaded
// lazily to keep --rewrite-only runs cheap.
let _matcherCatalog = null;
let _matcherPrompt = null;
let _matcherTemplateIds = null;
function getMatcherCatalogAndPrompt() {
  if (_matcherCatalog !== null) {
    return { catalog: _matcherCatalog, prompt: _matcherPrompt, ids: _matcherTemplateIds };
  }
  let en;
  try {
    en = JSON.parse(fs.readFileSync(path.join(ROOT, "messages/en/nano.json"), "utf-8"));
  } catch { en = {}; }
  const lines = [];
  const ids = new Set();
  for (const t of TPL) {
    if (t.allow_generation !== true) continue;
    ids.add(t.id);
    const desc = ((en[t.id] && en[t.id].description) || "")
      .replace(/\s+/g, " ").slice(0, 180);
    const params = ((t.locales && t.locales.en && t.locales.en.parameters) || [])
      .map((p) => p && p.name)
      .filter(Boolean)
      .join(",");
    lines.push(`- ${t.id} | params=[${params}] | ${desc}`);
  }
  _matcherCatalog = lines.join("\n");
  _matcherTemplateIds = ids;
  // Extract SYSTEM_PROMPT from lib/searchTemplateMatch.ts so we always
  // run the same prompt as production. Regex matches the template
  // literal contents including the {catalog} placeholder.
  const mod = fs.readFileSync(path.join(ROOT, "lib/searchTemplateMatch.ts"), "utf-8");
  const m = mod.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
  _matcherPrompt = m ? m[1] : "";
  return { catalog: _matcherCatalog, prompt: _matcherPrompt, ids: _matcherTemplateIds };
}

async function getTemplateMatches(client, query) {
  const { catalog, prompt, ids } = getMatcherCatalogAndPrompt();
  if (!prompt) return [];
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: prompt.replace("{catalog}", catalog) },
        { role: "user", content: `Query: ${query}` },
      ],
    });
    let raw = (res.choices?.[0]?.message?.content || "").trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(raw);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];
    const out = [];
    const seen = new Set();
    for (const m of matches) {
      const tid = m && m.template_id;
      if (typeof tid !== "string" || !ids.has(tid) || seen.has(tid)) continue;
      const conf = typeof m.confidence === "number" ? Math.max(0, Math.min(1, m.confidence)) : 0.5;
      if (conf < MATCHER_MIN_CONFIDENCE) continue;
      seen.add(tid);
      out.push({ template_id: tid, confidence: conf });
      if (out.length >= 3) break;
    }
    return out;
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
function templateBucket(count) {
  if (count >= 3) return "rich";
  if (count >= 2) return "moderate";
  if (count >= 1) return "thin";
  return "empty";
}
// LLM-matcher output has run-to-run variance at temperature 0.2 (the
// production setting). A 1-bucket drift is within noise — only flag
// 2-bucket drift as WARN, 3-bucket as FAIL. Mirrors the precision-vs-
// recall trade-off the production page makes (rendering the section
// is high-recall; the eval is high-precision and should not false-
// alarm on noise).
const TPL_BUCKET_ORDER = ["empty", "thin", "moderate", "rich"];
function templateVerdict(expected, actualBucket) {
  if (!expected) return null; // no baseline → skip scoring
  const a = TPL_BUCKET_ORDER.indexOf(actualBucket);
  const e = TPL_BUCKET_ORDER.indexOf(expected);
  if (a < 0 || e < 0) return null;
  const diff = Math.abs(a - e);
  if (diff <= 1) return "PASS";
  if (diff === 2) return "WARN";
  return "FAIL";
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
  const needClient = USE_REWRITE || USE_MATCHER;
  const client = needClient ? getOpenAIClient() : null;
  if (needClient && !client) {
    console.error(`--${USE_REWRITE ? "rewrite" : "matcher"} requested but OPENAI_API_KEY not loaded`);
    process.exit(1);
  }

  const results = [];
  for (const q of EVAL_SET.queries) {
    const base = scoreOnce(q.query);
    let rewrites = [];
    let unionIds = new Set(base.matchedIds);
    if (USE_REWRITE) {
      rewrites = await getRewrites(client, q.query);
      for (const rw of rewrites) {
        const rs = scoreOnce(rw);
        for (const id of rs.matchedIds) unionIds.add(id);
      }
    }
    let matcherMatches = [];
    let matcherBucket = null;
    let matcherV = null;
    if (USE_MATCHER) {
      matcherMatches = await getTemplateMatches(client, q.query);
      matcherBucket = templateBucket(matcherMatches.length);
      matcherV = templateVerdict(q.expected_templates, matcherBucket);
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
      // Template-richness columns (only populated when --matcher)
      expected_templates: q.expected_templates ?? "",
      matcher_count: USE_MATCHER ? matcherMatches.length : "",
      tpl_bucket: matcherBucket ?? "",
      tpl_verdict: matcherV ?? "",
      matcher_ids: matcherMatches.map((m) => m.template_id),
    };
    results.push(row);
    if (!QUIET) {
      console.log(`\n[${v}] "${q.query}" (source=${q.source}, expected=${q.expected})`);
      console.log(`  strict templates: ${base.strictTpl.size}, i18n-tpl: ${base.tplI18n.size}, strict inspirations: ${base.strictInsp} → bucket=${actualBucket}`);
      if (USE_REWRITE) {
        console.log(`  rewrites: ${JSON.stringify(rewrites)}`);
        if (rewrites.length > 0) console.log(`  union strict inspirations (base ∪ rewrites): ${unionIds.size}`);
      }
      if (USE_MATCHER) {
        const exp = q.expected_templates ?? "(none)";
        console.log(`  matcher templates (≥${MATCHER_MIN_CONFIDENCE}): ${matcherMatches.length} → bucket=${matcherBucket} (expected=${exp}) → ${matcherV ?? "no baseline"}`);
        if (matcherMatches.length > 0) console.log(`    ${matcherMatches.map((m) => `${m.template_id}@${m.confidence}`).join(", ")}`);
      }
      console.log(`  notes: ${q.notes}`);
    }
  }

  // Summary table.
  const width = USE_MATCHER ? 120 : 100;
  console.log(`\n${"═".repeat(width)}`);
  const flags = [USE_REWRITE ? "rewrites" : null, USE_MATCHER ? "matcher" : null].filter(Boolean);
  console.log(`SUMMARY (${results.length} queries${flags.length ? " + " + flags.join(" + ") : ""})`);
  console.log(`${"═".repeat(width)}`);
  let cols;
  if (USE_MATCHER) {
    cols = ["query", "expected", "bucket", "base_hits", "verdict", "expected_templates", "tpl_bucket", "matcher_count", "tpl_verdict"];
  } else if (USE_REWRITE) {
    cols = ["query", "expected", "base_hits", "union_hits", "verdict"];
  } else {
    cols = ["query", "source", "expected", "bucket", "base_hits", "verdict"];
  }
  console.log(cols.map((c) => c.padEnd(c === "query" ? 32 : 14)).join("│ "));
  console.log("─".repeat(width));
  for (const r of results) {
    const row = cols.map((c) => String(r[c] ?? "").padEnd(c === "query" ? 32 : 14)).join("│ ");
    console.log(row);
  }
  const failed = results.filter((r) => r.verdict === "FAIL").length;
  const warned = results.filter((r) => r.verdict === "WARN").length;
  const passed = results.filter((r) => r.verdict.startsWith("PASS")).length;
  console.log(`\n  inspiration richness: PASS=${passed}  WARN=${warned}  FAIL=${failed}  (of ${results.length})`);
  if (USE_MATCHER) {
    const tplResults = results.filter((r) => r.tpl_verdict);
    const tplPass = tplResults.filter((r) => r.tpl_verdict === "PASS").length;
    const tplWarn = tplResults.filter((r) => r.tpl_verdict === "WARN").length;
    console.log(`  template richness:    PASS=${tplPass}  WARN=${tplWarn}  (of ${tplResults.length} with baseline)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
