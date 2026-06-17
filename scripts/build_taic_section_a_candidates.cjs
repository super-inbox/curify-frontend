#!/usr/bin/env node
/**
 * Pre-computes TAIC Section A (inspirations grid) candidates for the
 * curify-studio admin-portal "Agentic Eval" tab.
 *
 * Mirrors the production token matcher in app/[locale]/(public)/search/page.tsx
 * (strict → relaxed → CJK bigram) and outputs top-5 inspirations per query
 * to public/data/taic_section_a_candidates.json.
 *
 * Same shape as taic_l1_candidates.json (the Section B file) so the admin
 * portal can render either via a mode toggle. Section A's candidates are
 * individual generated images (id + preview thumbnail + template_id +
 * topics), not templates.
 *
 * Run: node scripts/build_taic_section_a_candidates.cjs
 *   --limit N        process first N queries (default all)
 *   --top N          top-N inspirations per query (default 5)
 *   --focus          ONLY queries that need labeling attention
 *                    (real user queries + low/no-result eval entries +
 *                     recent cycle no-click survivors). Skips the 50+
 *                     rich/passing queries that don't surface gaps.
 *
 * No LLM cost — pure local computation. ~5s for the full 125-query set.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INSP = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"));
const TPL = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"));
const EVAL_SET = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/configs/search_eval_set.json"), "utf-8"));

const argv = process.argv.slice(2);
const LIMIT = (() => {
  const i = argv.indexOf("--limit");
  return i >= 0 ? parseInt(argv[i + 1], 10) || Infinity : Infinity;
})();
const TOP_N = (() => {
  const i = argv.indexOf("--top");
  return i >= 0 ? parseInt(argv[i + 1], 10) || 5 : 5;
})();
const FOCUS = argv.includes("--focus");

// Recent real-user no-click queries from cycle-5 buckets (C/D survivors —
// excluding queries that are now handled by the bare-country redirect
// attribution event). Refresh weekly from search_cycle5_pull.py output.
const REAL_USER_NO_CLICK = [
  { query: "fifa women's world cup 2027",                  source: "cycle5-lowresult-noclick" },
  { query: "czechia world cup",                            source: "cycle5-lowresult-noclick" },
  { query: "canada world cup 2026 opener",                 source: "cycle5-lowresult-noclick" },
  { query: "brazil 2002 squad",                            source: "cycle5-lowresult-noclick" },
  { query: "vintage childhood memories illustration",      source: "cycle5-lowresult-noclick" },
  { query: "iran",                                         source: "cycle5-search-noclick" },
  { query: "soccer",                                       source: "cycle5-search-noclick" },
  { query: "england fussbal tiem",                         source: "cycle5-search-noclick-typo" },
  { query: "diy home decor ideas",                         source: "cycle5-search-noclick" },
];

// Template blob (mirror search/page.tsx) — for template-level matching
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

// Template lookup: og_image fallback per template (for inspirations missing thumbnail)
const TPL_INDEX = new Map();
for (const t of TPL) {
  const en = t.locales?.en ?? {};
  TPL_INDEX.set(t.id, {
    title: en.category || en.title || t.id,
    ogImage: t.og_image,
    rankScore: t.rank_score ?? 0,
  });
}

// Tokenizer (mirror search/page.tsx)
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

// Scoring pass (mirror eval_search.cjs)
function matchInspirations(query) {
  const tokens = buildSearchTokens(query);
  if (tokens.primary.length === 0 && tokens.bigrams.length === 0) return [];
  const bigramThr = bigramHitThreshold(tokens.bigrams.length);
  const relaxedThr = relaxedPrimaryThreshold(tokens.primary.length);

  const strictTpl = new Set();
  const relaxedTpl = new Set();
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
      strictHits.push(r);
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
    if (s.allPrimary || s.bigramHits >= bigramThr) strictHits.push(r);
    else if (s.primaryHits >= relaxedThr && relaxedThr > 0) relaxedHits.push(r);
  }
  return strictHits.length > 0 ? strictHits : relaxedHits;
}

function rankScoreOf(r) {
  // Inspiration-level rank if present, else template-level, else 0
  return r.rank_score ?? TPL_INDEX.get(r.template_id)?.rankScore ?? 0;
}

function pickPreview(r) {
  // Prefer the inspiration's own preview; fall back to template og_image
  return (
    r.asset?.preview_image_url ??
    r.asset?.image_url ??
    TPL_INDEX.get(r.template_id)?.ogImage ??
    null
  );
}

function shortTitle(r) {
  const en = r.locales?.en ?? {};
  return (en.title || en.category || r.id || "").slice(0, 80);
}

// Main — apply focus filter if requested
function inFocusSet(q) {
  // Real-user / non-synthetic queries we want labeled
  if (q.source && (q.source.startsWith("user") || q.source.startsWith("cycle"))) return true;
  // Recent no-click queries surfaced in last cycle (real user behavior)
  if (q.source && q.source.includes("noclick")) return true;
  // Eval set entries with thin/empty/moderate expected (real-user-derived or
  // dropped-quality records) — these are where the matcher reportedly fails
  if (q.expected === "empty" || q.expected === "thin" || q.expected === "moderate") return true;
  // Known-issue dropped pool entries
  if (q.source && q.source.includes("dropped-quality")) return true;
  return false;
}

let queries;
if (FOCUS) {
  // Merge eval-set focus subset + the real-user no-click append
  const evalFocus = EVAL_SET.queries.filter(inFocusSet);
  const evalQueries = new Set(EVAL_SET.queries.map((q) => q.query.toLowerCase()));
  const newUserQueries = REAL_USER_NO_CLICK
    .filter((u) => !evalQueries.has(u.query.toLowerCase()))
    .map((u) => ({ ...u, expected: "needs-label", expected_templates: "needs-label" }));
  queries = [...newUserQueries, ...evalFocus].slice(0, LIMIT);
} else {
  queries = EVAL_SET.queries.slice(0, LIMIT);
}

console.log(`=== build_taic_section_a_candidates ===`);
console.log(`  eval set: ${EVAL_SET.queries.length} total`);
console.log(`  ${FOCUS ? "FOCUS mode" : "FULL set"} — processing ${queries.length}`);
console.log(`  top-N per query: ${TOP_N}`);
console.log();

const results = queries.map((q, i) => {
  const matched = matchInspirations(q.query);
  matched.sort((a, b) => rankScoreOf(b) - rankScoreOf(a));
  const top = matched.slice(0, TOP_N).map((r) => ({
    id: r.id,
    template_id: r.template_id,
    thumbnail: pickPreview(r),
    title: shortTitle(r),
    topics: (r.topics || []).slice(0, 6),
    rank_score: rankScoreOf(r),
  }));
  const tag = matched.length === 0 ? "✗ empty" : `${matched.length} hits, top-${top.length}`;
  console.log(`  [${i + 1}/${queries.length}] ${q.query.slice(0, 50).padEnd(50)} ${tag}`);
  return {
    query: q.query,
    source: q.source,
    expected: q.expected,
    total_hits: matched.length,
    candidates: top,
  };
});

const empties = results.filter((r) => r.candidates.length === 0).length;
const out = {
  meta: {
    generated_at: new Date().toISOString(),
    eval_set_size: EVAL_SET.queries.length,
    processed: results.length,
    empty_matcher_returns: empties,
    top_n_per_query: TOP_N,
  },
  queries: results,
};
const outPath = path.join(ROOT, "public/data/taic_section_a_candidates.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log();
console.log(`✓ Wrote ${outPath}`);
console.log(`  ${results.length} queries, ${empties} empty`);
