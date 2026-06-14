#!/usr/bin/env node
/**
 * Per-query qualitative inspector for the SearchBar rotating prefill pool.
 * Reuses the eval_search.cjs scoring logic (strict + relaxed match) and
 * dumps the TOP-N matched inspirations per query so a human can eyeball
 * whether the results are topically aligned with what the placeholder
 * promises.
 *
 * Output: one block per query —
 *   query → N hits, K templates
 *     [hit id 1]  (template-X)  topics: a, b, c
 *     [hit id 2]  (template-Y)  topics: ...
 *
 * Verdict (manual):
 *   - GOOD:    top 5 hits visibly match the query intent + cover ≥2 templates
 *   - WEAK:    top hits drift off-topic (matched via token overlap not intent)
 *   - NARROW:  on-topic but single template (low visual diversity)
 *
 * Run: node scripts/inspect_prefill_pool_quality.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const INSP = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"));

// Pool source — mirror of lib/popularPrefillQueries.ts (regex-extracted so
// inspector stays in sync without a JS↔TS import dance).
const POOL_SRC = fs.readFileSync(path.join(ROOT, "lib/popularPrefillQueries.ts"), "utf-8");
const POOL = [...POOL_SRC.matchAll(/^\s*"([^"]+)",?\s*$/gm)]
  .map((m) => m[1])
  .filter((q) => !q.startsWith("==="));

// ---- Template blob (mirror of eval_search.cjs) ----
const templateBlob = new Map();
for (const loc of ["en", "zh"]) {
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

// ---- Tokenizer + scorer (mirror of eval_search.cjs) ----
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
function bigramHitThreshold(n) { if (n <= 1) return 1; if (n <= 3) return 2; return 3; }
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

function scoreOnce(query) {
  const tokens = buildSearchTokens(query);
  if (tokens.primary.length === 0 && tokens.bigrams.length === 0) return [];
  const bigramThr = bigramHitThreshold(tokens.bigrams.length);
  const relaxedThr = relaxedPrimaryThreshold(tokens.primary.length);
  const strictTpl = new Set(), relaxedTpl = new Set();
  for (const [tid, blob] of templateBlob) {
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) strictTpl.add(tid);
    else if (s.primaryHits >= relaxedThr && relaxedThr > 0) relaxedTpl.add(tid);
  }
  const useTpl = strictTpl.size > 0 ? strictTpl : relaxedTpl;

  const strictHits = [];
  const relaxedHits = [];
  for (const r of INSP) {
    if (useTpl.has(r.template_id)) {
      strictHits.push({ ...r, _why: "via-template" });
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
    if (s.allPrimary || s.bigramHits >= bigramThr) strictHits.push({ ...r, _why: "via-record-strict" });
    else if (s.primaryHits >= relaxedThr && relaxedThr > 0) relaxedHits.push({ ...r, _why: "via-record-relaxed" });
  }
  return strictHits.length > 0 ? strictHits : relaxedHits;
}

// ---- Main ----
const TOP_N = 6;
for (const q of POOL) {
  const hits = scoreOnce(q);
  const templates = new Set(hits.map((h) => h.template_id));
  const verdict = hits.length === 0 ? "EMPTY"
    : hits.length < 3 ? "THIN"
    : templates.size === 1 ? "NARROW"
    : "OK";
  console.log("");
  console.log(`▸ ${q}  —  ${hits.length} hits / ${templates.size} templates  [${verdict}]`);
  for (const h of hits.slice(0, TOP_N)) {
    const topics = (h.topics || []).slice(0, 5).join(", ");
    console.log(`    • ${(h.id || "").padEnd(64)} (${h.template_id || "?"}) topics: ${topics}`);
  }
}
