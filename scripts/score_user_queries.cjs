#!/usr/bin/env node
// One-shot scorer for ad-hoc user queries. Reuses the same tokenizer +
// matcher as scripts/eval_search.cjs / app/search/page.tsx, but accepts
// queries as CLI args (or stdin) and prints base_hits per query plus
// top-4 templates so we can set `expected` buckets in
// scripts/configs/search_eval_set.json with confidence.

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TPL = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"));
const INSP = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"));

const STRUCTURAL_STOPWORDS = new Set([
  "topic", "topics", "theme", "themes", "insight", "insights", "highlight", "highlights",
  "tag", "tags", "category", "categories", "word", "words", "list", "lists",
  "the", "a", "an", "and", "or", "of", "to", "for", "with", "in", "on", "at", "by", "from",
]);

function normalizeForSearch(s) {
  return String(s || "").toLowerCase().normalize("NFKC")
    .replace(/[‐‑‒–—―−﹘﹣－]/g, "-")
    .replace(/[　 ]/g, " ")
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .replace(/\s+/g, " ").trim();
}

function buildSearchTokens(query) {
  const norm = normalizeForSearch(query);
  if (!norm) return { primary: [], bigrams: [] };
  const raw = norm.split(/\s+/).filter(Boolean);
  const primary = [];
  for (const t of raw) {
    if (t.length < 2) continue;
    if (STRUCTURAL_STOPWORDS.has(t)) continue;
    if (!/[\p{Script=Han}]/u.test(t)) { primary.push(t); continue; }
    if (t.length === 1) continue;
    primary.push(t);
  }
  const bigrams = [];
  for (const t of raw) {
    if (!/[\p{Script=Han}]/u.test(t)) continue;
    if (t.length < 2) continue;
    for (let i = 0; i < t.length - 1; i++) bigrams.push(t.slice(i, i + 2));
  }
  return { primary, bigrams };
}

function relaxedPrimaryThreshold(n) { return n <= 1 ? 1 : Math.ceil(n / 2); }
function bigramHitThreshold(n) {
  if (n <= 1) return 1;
  if (n <= 3) return 2;
  return 3;
}

function scoreBlob(blob, tokens) {
  let primaryHits = 0;
  for (const t of tokens.primary) {
    if (/[\p{Script=Han}]/u.test(t)) {
      if (blob.includes(t)) primaryHits++;
    } else {
      const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(blob)) primaryHits++;
    }
  }
  let bigramHits = 0;
  for (const bg of tokens.bigrams) if (blob.includes(bg)) bigramHits++;
  return { primaryHits, bigramHits, allPrimary: primaryHits === tokens.primary.length };
}

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

function bucket(n) {
  if (n >= 10) return "rich";
  if (n >= 3) return "moderate";
  if (n >= 1) return "thin";
  return "empty";
}

function score(query) {
  const tokens = buildSearchTokens(query);
  if (tokens.primary.length === 0 && tokens.bigrams.length === 0) return { strictTpl: 0, hits: 0, byTpl: new Map() };
  const bigramThr = bigramHitThreshold(tokens.bigrams.length);
  const relaxedThr = relaxedPrimaryThreshold(tokens.primary.length);

  const strictTpl = new Set();
  const relaxedTpl = new Set();
  for (const [tid, blob] of templateBlob) {
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) strictTpl.add(tid);
    else if (s.primaryHits >= relaxedThr && relaxedThr > 0) relaxedTpl.add(tid);
  }

  const strictByTpl = new Map();
  const relaxedByTpl = new Map();
  for (const r of INSP) {
    if (strictTpl.has(r.template_id)) {
      strictByTpl.set(r.template_id, (strictByTpl.get(r.template_id) ?? 0) + 1);
      continue;
    }
    const s = scoreBlob(inspBlob(r), tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) {
      strictByTpl.set(r.template_id, (strictByTpl.get(r.template_id) ?? 0) + 1);
    } else if (s.primaryHits >= relaxedThr && relaxedThr > 0) {
      relaxedByTpl.set(r.template_id, (relaxedByTpl.get(r.template_id) ?? 0) + 1);
    }
  }
  const strictTotal = [...strictByTpl.values()].reduce((a, b) => a + b, 0);
  const useStrict = strictTotal > 0;
  const byTpl = useStrict ? strictByTpl : relaxedByTpl;
  const hits = [...byTpl.values()].reduce((a, b) => a + b, 0);
  return { strictTpl: strictTpl.size, hits, byTpl, tier: useStrict ? "strict" : "relaxed" };
}

const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error("Usage: node score_user_queries.cjs <query1> <query2> ...");
  process.exit(1);
}

console.log(`query            | tier    | strict-tpl | hits | bucket    | top 4 templates`);
console.log("-".repeat(120));
for (const q of queries) {
  const r = score(q);
  const top4 = [...r.byTpl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([tid, ct]) => `${tid.replace("template-", "")}×${ct}`).join(", ");
  console.log(`${q.padEnd(16)} | ${(r.tier || "-").padEnd(7)} | ${String(r.strictTpl).padStart(10)} | ${String(r.hits).padStart(4)} | ${bucket(r.hits).padEnd(9)} | ${top4}`);
}
