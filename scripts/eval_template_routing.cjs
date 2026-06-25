#!/usr/bin/env node
// Visual Intent Routing — template-routing accuracy eval (v1).
//
// Scores the current template-recall layer against the hand/LLM-labeled
// gold set (scripts/configs/vir_routing_gold.json). Per the spec
// docs/eval-framework-visual-intent-routing-2026-06-15.md (P1 / Layer 1),
// the headline metric is top-1 / top-3 ROUTING ACCURACY: does a path put an
// acceptable template at rank 1 / within rank 3.
//
// Two recall paths are scored SEPARATELY, plus their union:
//   Path A — keyword/alias retrieval. The /search scorer, ported verbatim
//            from scripts/eval_search.cjs `scoreOnce` (itself a mirror of
//            app/[locale]/(public)/search/page.tsx). Offline, no key.
//   Path B — the "Generate xxx yourself" LLM matcher (gpt-4o-mini), the same
//            prompt/scoring as lib/searchTemplateMatch.ts. Needs OPENAI_API_KEY,
//            or replay a saved run with --replay.
//   Union  — A ∪ B, deduped + re-ranked (B confidence first, then A strict).
//
// Metrics (per path, broken down by ambiguity bucket low/medium/high):
//   top-1, top-3   — over queries WITH a gold template (gaps excluded)
//   hit@any        — acceptable ∩ returned-set ≠ ∅ (recall signal)
// Content-gap queries (acceptable=[]) are scored separately as "gap behavior":
//   a path is correct on a gap iff it returns nothing acceptable-wrong, i.e.
//   every returned template is a known near-miss (or it returns nothing).
//
// Per-query miss diagnostic classifies each miss as:
//   recall-miss (never surfaced) / rank-miss (surfaced, ranked > 3) /
//   gap-confusion (returned a near-miss on a content-gap query).
//
// Constraints: reads only local JSON; never prints or persists any API key.
//
// Usage:
//   node scripts/eval_template_routing.cjs --path=a            # offline, no key
//   node scripts/eval_template_routing.cjs --path=all          # needs key for B
//   node scripts/eval_template_routing.cjs --path=b --replay=/tmp/b.json
//   node scripts/eval_template_routing.cjs --out=/tmp/report.md

"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const pathArg = (argv.find((a) => a.startsWith("--path=")) || "--path=all").slice(7);
const goldArg = argv.find((a) => a.startsWith("--gold="));
const outArg = argv.find((a) => a.startsWith("--out="));
const replayArg = argv.find((a) => a.startsWith("--replay="));
const GOLD_PATH = goldArg ? goldArg.slice(7) : path.join(ROOT, "scripts/configs/vir_routing_gold.json");
const OUT_PATH = outArg ? outArg.slice(6) : null;
const REPLAY_PATH = replayArg ? replayArg.slice(9) : null;
const WANT_A = pathArg === "a" || pathArg === "all" || pathArg === "union";
const WANT_B = pathArg === "b" || pathArg === "all" || pathArg === "union";
const WANT_UNION = pathArg === "union" || pathArg === "all";

const TEMPLATES = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf-8"));
const INSP = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_inspiration.json"), "utf-8"));
const EN_NANO = JSON.parse(fs.readFileSync(path.join(ROOT, "messages/en/nano.json"), "utf-8"));
const gold = JSON.parse(fs.readFileSync(GOLD_PATH, "utf-8"));
const QUERIES = Array.isArray(gold) ? gold : gold.queries;
const GEN_IDS = new Set(TEMPLATES.filter((t) => t.allow_generation === true).map((t) => t.id));

// ============================================================
// Path A — keyword/alias retrieval (verbatim port of eval_search.cjs scoreOnce)
// ============================================================
const localesToScan = ["en", "zh"];
const templateBlob = new Map();
for (const loc of localesToScan) {
  let entries;
  try { entries = JSON.parse(fs.readFileSync(path.join(ROOT, `messages/${loc}/nano.json`), "utf-8")); }
  catch { continue; }
  for (const [tid, e] of Object.entries(entries)) {
    if (!e) continue;
    const parts = [e.category, e.title, e.description, e?.content?.sections?.what, e?.content?.sections?.who]
      .filter((v) => typeof v === "string" && v.length > 0);
    if (parts.length === 0) continue;
    templateBlob.set(tid, (templateBlob.get(tid) ?? "") + " " + parts.join(" ").toLowerCase());
  }
}
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
  if (tokens.primary.length === 0 && tokens.bigrams.length === 0) {
    return { strictTpl: new Set(), tplI18n: new Set(), matchedIds: new Set() };
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
    if (strictTpl.has(r.template_id)) { strictIds.add(r.id); continue; }
    const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [l?.title, l?.category]);
    const blob = normalizeForSearch([
      r.id, r.template_id, ...(r.tags ?? []), ...(r.search_aliases ?? []),
      ...Object.values(r.params ?? {}), ...localeFields,
    ].filter((v) => typeof v === "string" && v.length > 0).join(" "));
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThr) strictIds.add(r.id);
    else if (s.primaryHits >= relaxedThr && relaxedThr > 0) relaxedIds.add(r.id);
  }
  const matchedIds = strictIds.size > 0 ? strictIds : relaxedIds;
  return { strictTpl, tplI18n, matchedIds };
}
const INSP_TEMPLATE = new Map(INSP.map((r) => [r.id, r.template_id]));
// Path A -> RANKED list of matched template ids.
// Rank: strict-i18n templates first, then by # of matched inspirations under
// the template (desc); only allow_generation templates are routable answers.
function pathARanked(query) {
  const { strictTpl, tplI18n, matchedIds } = scoreOnce(query);
  const inspCount = new Map();
  for (const id of matchedIds) {
    const tid = INSP_TEMPLATE.get(id);
    if (tid) inspCount.set(tid, (inspCount.get(tid) || 0) + 1);
  }
  const cand = new Set([...tplI18n, ...inspCount.keys()]);
  const ranked = [...cand]
    .filter((tid) => GEN_IDS.has(tid)) // routable = allow_generation (Path B catalog parity)
    .map((tid) => ({
      tid,
      strict: strictTpl.has(tid) ? 1 : 0,
      n: inspCount.get(tid) || 0,
    }))
    .sort((a, b) => b.strict - a.strict || b.n - a.n || a.tid.localeCompare(b.tid))
    .map((x) => x.tid);
  return ranked;
}

// ============================================================
// Path B — LLM matcher (mirror of lib/searchTemplateMatch.ts). Optional.
// ============================================================
const B_MODEL = "gpt-4o-mini";
function buildCatalogBlob() {
  const lines = [];
  for (const t of TEMPLATES) {
    if (t.allow_generation !== true) continue;
    const en = EN_NANO[t.id] || {};
    const desc = (en.description || "").replace(/\s+/g, " ").slice(0, 180);
    const params = ((t.locales?.en?.parameters) || []).map((p) => p.name).filter(Boolean).join(",");
    lines.push(`- ${t.id} | params=[${params}] | ${desc}`);
  }
  return lines.join("\n");
}
// EXACT production system prompt — copied verbatim from lib/searchTemplateMatch.ts
// (the live /api/search-template-match matcher) so Path B here reproduces the
// live "Generate xxx yourself" results. Keep in sync if the production prompt changes.
const B_SYSTEM = `You match user search queries to Curify image-generation templates that could create content for those queries.

For EACH query, decide:
- top 2-3 best-fit templates (ordered by confidence desc; fewer is fine if no clear fit)
- for each pick: concrete parameter values extracted from the query
- confidence in 0.0..1.0 (be honest — 0.3 + reason is fine if uncertain)
- short reason (<= 80 chars)

CRITICAL — read EVERY modifier in the query, not just the subject noun. Templates are differentiated by visual style AND layout, not only topic:

- **Style modifiers** (watercolor / retro / vintage / minimalist / photorealistic / anime / kawaii / ink / monochrome) — pick a template whose OUTPUT natively has that style. "Watercolor map" needs a watercolor map template, not a generic destination list.
- **Format / layout modifiers** (chart / grid / list of N / top 10 / 16 types / dual / before-after / comparison / timeline) — pick the template whose LAYOUT matches. "Chart of 16 MBTI types" needs a grid/chart template, NOT a single-character profile.
- **Audience modifiers** (for kids / for beginners / educational) — pick the template whose style fits.
- **Artifact-type modifiers** (recipe poster / promotional poster / care guide / how-to / infographic) — these name the artifact directly. Prefer the template that explicitly produces that artifact.

Pick templates that can GENERATE content for the query AS TYPED, not just templates whose tags overlap with one word.

SUBJECT MATCH IS A HARD GATE (from human eval 2026-06-17). Verify the template's CORE SUBJECT actually serves the query's specific noun BEFORE you return it:

- **REJECT a template whose subject-axis is disjoint from the query, even if it shares the layout/format axis.**
  · "Brazil national team" wants a SQUAD POSTER → do NOT return mbti-of-team templates (different subject-axis: personality typing vs roster lineup).
  · "english spanish word comparison" → do NOT return english-CHINESE comparison templates (language-pair mismatch is a subject mismatch).
  · "diy craft tutorial poster" → do NOT return vegetable-planting-tutorial or action-vocab-card templates (their subjects are vegetables / language, not crafts).
  · "evolution snacks infographic" → do NOT return history-timeline or fashion-evolution templates (subjects are history / clothing, not food).
  · "amusement park map infographic" → do NOT return generic travel-poster templates (subject is parks / rides, not destinations).
  · "1950s vintage diner illustration" → do NOT return evolution / travel-journal / festival templates (none match the era + venue).

- **Franchise / IP-specific queries need IP-aware templates.** Generic "character info card" is NOT a fit for "chiikawa" or named characters — return the kawaii / franchise-specific template if one exists; if not, return [] rather than a generic fallback.

- **Iconic-moment / event-analysis intent ≠ team-or-player templates.** "Maradona Hand of God" / "most memorable World Cup moments" want sports iconic-event-analysis-poster (single-moment deep-dive), NOT squad poster or schedule.

- **When NO catalog template has the right subject, return fewer picks — or [] — rather than padding with layout-matching but subject-wrong templates.** An honest [] is a real signal that beats a confident wrong pick.

Quick worked examples (from human eval ground truth):
  Q: "fifa 2026" → ✓ world cup poster + world cup schedule (subject + format align)
  Q: "Maradona Hand of God" → ✓ sports iconic-event-analysis-poster; ✗ generic football poster
  Q: "english spanish word comparison" → ✓ english-spanish vocabulary template if any; ✗ english-chinese comparison
  Q: "chiikawa" → ✓ kawaii-IP profile/grid template; ✗ generic character analysis
  Q: "diy craft tutorial poster" → ✓ crafting-step-by-step-tutorial template; ✗ vegetable planting or action vocab
  Q: "证件照 / id photo" → ✓ portrait-id-photo template; ✗ product poster

Catalog:
{catalog}

Return ONLY a JSON object: {"matches": [{"template_id": "template-...", "params": {"key": "value"}, "confidence": 0.85, "reason": "..."}]}.
No prose, no markdown fences.`;
async function pathBRanked(query, client, catalogBlob) {
  const prompt = B_SYSTEM.replace("{catalog}", catalogBlob);
  const resp = await client.chat.completions.create({
    model: B_MODEL,
    messages: [{ role: "system", content: prompt }, { role: "user", content: `Query: ${query}` }],
    temperature: 0.2, max_tokens: 800,
  });
  let raw = (resp.choices?.[0]?.message?.content || "").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return []; }
  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];
  const seen = new Set();
  const out = [];
  for (const m of matches) {
    const tid = m && m.template_id;
    if (typeof tid !== "string" || !GEN_IDS.has(tid) || seen.has(tid)) continue;
    seen.add(tid);
    const conf = typeof m.confidence === "number" ? Math.max(0, Math.min(1, m.confidence)) : 0.5;
    out.push({ tid, confidence: conf });
    if (out.length >= 3) break;
  }
  return out; // [{tid, confidence}] ordered by model confidence
}

// ============================================================
// Scoring
// ============================================================
const BUCKETS = ["low", "medium", "high"];
function emptyAgg() { return { n: 0, top1: 0, top3: 0, any: 0 }; }
function scorePath(rankedByQuery /* Map query->string[] (ordered template ids) */) {
  const overall = emptyAgg();
  const byBucket = Object.fromEntries(BUCKETS.map((b) => [b, emptyAgg()]));
  const gap = { n: 0, clean: 0 }; // clean = returned nothing acceptable-wrong
  const perQuery = [];
  for (const row of QUERIES) {
    const acc = new Set(row.acceptable_template_ids || []);
    const near = new Set(row.near_miss_template_ids || []);
    const ranked = rankedByQuery.get(row.query) || [];
    if (acc.size === 0) {
      // content gap: correct iff every returned template is a known near-miss (or none returned)
      const wrong = ranked.filter((t) => !near.has(t));
      const clean = wrong.length === 0;
      gap.n++; if (clean) gap.clean++;
      perQuery.push({ query: row.query, ambiguity: row.ambiguity, gap: true, clean, ranked: ranked.slice(0, 3), verdict: clean ? "gap-clean" : "gap-confusion" });
      continue;
    }
    const top1 = ranked[0] && acc.has(ranked[0]);
    const top3 = ranked.slice(0, 3).some((t) => acc.has(t));
    const any = ranked.some((t) => acc.has(t));
    overall.n++; if (top1) overall.top1++; if (top3) overall.top3++; if (any) overall.any++;
    const b = byBucket[row.ambiguity]; b.n++; if (top1) b.top1++; if (top3) b.top3++; if (any) b.any++;
    let verdict;
    if (top1) verdict = "top1";
    else if (top3) verdict = "top3";
    else if (any) verdict = "rank-miss";   // surfaced but ranked > 3
    else verdict = "recall-miss";          // never surfaced
    perQuery.push({ query: row.query, ambiguity: row.ambiguity, gap: false, top1, top3, any, ranked: ranked.slice(0, 3), verdict });
  }
  return { overall, byBucket, gap, perQuery };
}
function pct(a, b) { return b === 0 ? "—" : `${((100 * a) / b).toFixed(0)}%`; }

// ============================================================
// Run
// ============================================================
async function getPathA() {
  const m = new Map();
  for (const row of QUERIES) m.set(row.query, pathARanked(row.query));
  return m;
}
async function getPathB() {
  // Replay mode: load a saved {query: [{tid,confidence}|tid...]} or {query: [tid...]}.
  if (REPLAY_PATH) {
    const data = JSON.parse(fs.readFileSync(REPLAY_PATH, "utf-8"));
    const m = new Map();
    for (const row of QUERIES) {
      const v = data[row.query] || [];
      m.set(row.query, v.map((x) => (typeof x === "string" ? x : x.tid)));
    }
    return { ranked: m, raw: null, source: `replay:${REPLAY_PATH}` };
  }
  // Live mode: needs OPENAI_API_KEY (read from env only; never logged).
  let dotenvOk = true;
  try { require("dotenv").config({ path: path.join(ROOT, ".env.local") }); } catch { dotenvOk = false; }
  if (!process.env.OPENAI_API_KEY) {
    return { ranked: null, raw: null, source: dotenvOk ? "skipped:no-key" : "skipped:no-dotenv" };
  }
  let OpenAI;
  try { OpenAI = require("openai"); } catch { return { ranked: null, raw: null, source: "skipped:no-openai-module" }; }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000 });
  const catalogBlob = buildCatalogBlob();
  const m = new Map();
  const raw = {};
  for (const row of QUERIES) {
    process.stderr.write(`  [B] ${row.query} …\n`);
    let picks = [];
    try { picks = await pathBRanked(row.query, client, catalogBlob); } catch (e) { picks = []; }
    m.set(row.query, picks.map((p) => p.tid));
    raw[row.query] = picks;
  }
  return { ranked: m, raw, source: "live:gpt-4o-mini" };
}
function unionRanked(aMap, bMap) {
  // B confident picks first (matcher is precision-oriented), then A's ranked
  // remainder, deduped. Mirrors how the page surfaces a "generate" rail (B)
  // alongside the retrieval grid (A).
  const m = new Map();
  for (const row of QUERIES) {
    const b = bMap.get(row.query) || [];
    const a = aMap.get(row.query) || [];
    const seen = new Set();
    const merged = [];
    for (const t of [...b, ...a]) { if (!seen.has(t)) { seen.add(t); merged.push(t); } }
    m.set(row.query, merged);
  }
  return m;
}

function fmtAgg(label, agg) {
  return `${label.padEnd(16)} n=${String(agg.n).padStart(3)}  top-1 ${pct(agg.top1, agg.n).padStart(4)}  top-3 ${pct(agg.top3, agg.n).padStart(4)}  hit@any ${pct(agg.any, agg.n).padStart(4)}`;
}
function printPath(name, res, source) {
  console.log(`\n=== Path ${name}${source ? `  (${source})` : ""} ===`);
  console.log(fmtAgg("OVERALL", res.overall));
  for (const b of BUCKETS) console.log(fmtAgg(`  ${b}`, res.byBucket[b]));
  console.log(`content-gap:     n=${res.gap.n}  clean(no wrong route) ${pct(res.gap.clean, res.gap.n)}`);
}

function mdReport(results) {
  const L = [];
  L.push(`# Visual Intent Routing — routing-accuracy baseline (v1)`);
  L.push("");
  L.push(`- gold: \`${path.relative(ROOT, GOLD_PATH)}\` · ${QUERIES.length} queries`);
  const byAmb = QUERIES.reduce((m, r) => ((m[r.ambiguity] = (m[r.ambiguity] || 0) + 1), m), {});
  const gaps = QUERIES.filter((r) => (r.acceptable_template_ids || []).length === 0).length;
  L.push(`- ambiguity: ${JSON.stringify(byAmb)} · content-gap queries: ${gaps}`);
  L.push(`- scored (with a gold template): ${QUERIES.length - gaps}`);
  L.push(`- metric: top-1 / top-3 routing accuracy + hit@any (acceptable ∩ returned)`);
  L.push("");
  for (const { name, res, source } of results) {
    L.push(`## Path ${name}${source ? ` — \`${source}\`` : ""}`);
    L.push("");
    L.push(`| bucket | n | top-1 | top-3 | hit@any |`);
    L.push(`|---|---|---|---|---|`);
    L.push(`| **overall** | ${res.overall.n} | ${pct(res.overall.top1, res.overall.n)} | ${pct(res.overall.top3, res.overall.n)} | ${pct(res.overall.any, res.overall.n)} |`);
    for (const b of BUCKETS) L.push(`| ${b} | ${res.byBucket[b].n} | ${pct(res.byBucket[b].top1, res.byBucket[b].n)} | ${pct(res.byBucket[b].top3, res.byBucket[b].n)} | ${pct(res.byBucket[b].any, res.byBucket[b].n)} |`);
    L.push("");
    L.push(`Content-gap behavior: ${res.gap.clean}/${res.gap.n} queries returned no wrong route (${pct(res.gap.clean, res.gap.n)} clean).`);
    L.push("");
  }
  // Per-query table from the first path that ran (prefer union > A > B)
  const main = results[results.length - 1];
  L.push(`## Per-query diagnostic — Path ${main.name}`);
  L.push("");
  L.push(`| query | amb | verdict | top-3 returned |`);
  L.push(`|---|---|---|---|`);
  for (const r of main.res.perQuery) {
    L.push(`| \`${r.query}\` | ${r.ambiguity} | ${r.verdict} | ${r.ranked.map((t) => t.replace("template-", "")).join(", ") || "—"} |`);
  }
  L.push("");
  L.push(`Verdict legend: top1 / top3 (hit) · rank-miss (acceptable surfaced but ranked >3) · recall-miss (never surfaced) · gap-clean / gap-confusion (content-gap queries).`);
  return L.join("\n");
}

(async () => {
  console.log(`gold: ${GOLD_PATH}  (${QUERIES.length} queries)`);
  console.log(`paths requested: ${pathArg}`);
  const results = [];
  let aMap = null, bMap = null;

  if (WANT_A) {
    aMap = await getPathA();
    results.push({ name: "A", res: scorePath(aMap), source: "keyword/alias retrieval (offline)" });
  }
  let bSource = null;
  if (WANT_B) {
    const b = await getPathB();
    bSource = b.source;
    if (b.ranked) {
      bMap = b.ranked;
      results.push({ name: "B", res: scorePath(bMap), source: b.source });
      if (b.raw && OUT_PATH) {
        const dump = OUT_PATH.replace(/\.md$/, "") + ".pathB.json";
        fs.writeFileSync(dump, JSON.stringify(b.raw, null, 2));
        console.log(`(saved Path B raw picks for replay: ${dump})`);
      }
    } else {
      console.log(`\n[Path B ${b.source}] — skipped. Provide OPENAI_API_KEY in .env.local (run npm install first) or pass --replay=<file>.`);
    }
  }
  if (WANT_UNION && aMap && bMap) {
    const uMap = unionRanked(aMap, bMap);
    results.push({ name: "A∪B", res: scorePath(uMap), source: "union (B confident first, then A)" });
  }

  for (const r of results) printPath(r.name, r.res, r.source);

  if (OUT_PATH) {
    fs.writeFileSync(OUT_PATH, mdReport(results));
    console.log(`\nreport: ${OUT_PATH}`);
  }
})();
