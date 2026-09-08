/**
 * @file pinterest_demand.cjs
 * @description Turn Google Search Console keywords + clicks into a per-template
 * demand signal, so Pinterest selection is driven by measured search demand
 * rather than by which board topic happened to be tagged.
 *
 * Why this exists. Batches 1 and 2 selected candidates by board topic and then
 * ranked them by how close the image was to 2:3. That is a shape heuristic, not
 * a demand one, and the result was 29 Pins with 0 impressions and 0 saves at
 * T+3d. Meanwhile GSC says image search carries 186,921 impressions against
 * web's 103,162 over 90 days, and the non-IP part of that is concentrated in a
 * handful of templates that earn image impressions and essentially no clicks —
 * demand we are visible for on a surface we cannot win, which is exactly the
 * demand worth moving to a surface we can.
 *
 * Two dimensions are pulled per search type:
 *   query            — the phrases themselves (used for copy)
 *   page + query     — attributes a phrase to a template page (used for scoring)
 *
 * `type: "image"` is the point. pull_gsc_performance.cjs only pulls web, and
 * web numbers call the image-native clusters dead: template-fruit has 498 image
 * impressions against 1 web impression.
 *
 * Usage:
 *   node scripts/pinterest_demand.cjs --pull [--from=YYYY-MM-DD] [--to=YYYY-MM-DD]
 *   node scripts/pinterest_demand.cjs --report [--limit=40]
 *
 * Output: data/pinterest/demand-<from>_<to>.json, newest is what loadDemand()
 * returns. Committed, so a proposal can be reproduced without GSC access.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data/pinterest");
const DEFAULT_KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";

/**
 * Phrases that must never become Pin copy.
 *
 * Brand and model names are our SEO vocabulary, not a Pinterest searcher's:
 * nobody browsing Pinterest types "nano banana prompt". They stay in the score
 * (they are real demand and they prove the image pulls) but are excluded from
 * the phrase a title is built from.
 */
const COPY_STOP = /curify|\bnano\b|nano.?banana|nanobanana|nano.?insp|chatgpt|gemini|midjourney|sora\b|comfyui|stable.?diffusion|elevenlabs|musetalk|f5-?tts|\bprompt\b|template\b|generator|\bai\b.*\bapi\b/i;
/**
 * Copy must be English: the account publishes in English, and GSC's biggest
 * clusters are Korean, Japanese and Chinese. ASCII-only removes every
 * non-Latin script and most accented languages in one test; the function-word
 * list catches what survives it, like the Turkish "guinea pig cüce domuz" and
 * Spanish "biografia de famosos".
 */
const ASCII_ONLY = /^[\x20-\x7E]+$/;
const NON_EN = /\b(?:de|del|la|el|los|las|un|una|para|con|por|y|di|da|dos|das|do|des|du|le|les|et|und|für|der|die|das|ile|ve|bir|ka|na|no|wa)\b/i;

const tplOf = (u) => {
  const m = u.match(/\/nano-template\/([^/?#]+)/);
  return m ? `template-${decodeURIComponent(m[1])}` : null;
};
const exOf = (u) => {
  const m = u.match(/\/nano-template\/[^/?#]+\/(?:example|carousel)\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

// ---------------------------------------------------------------- pull

async function queryAll(sc, site, body) {
  const rows = [];
  let start = 0;
  for (;;) {
    const res = await sc.searchanalytics.query({ siteUrl: site, requestBody: { ...body, startRow: start } });
    const r = res.data.rows || [];
    rows.push(...r);
    if (r.length < body.rowLimit) break;
    start += r.length;
    if (start > 100000) break; // guard: the API will happily page forever
  }
  return rows;
}

async function pull({ key, from, to }) {
  const { google } = require("googleapis");
  const auth = new google.auth.GoogleAuth({ keyFile: key, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const sc = google.searchconsole({ version: "v1", auth: await auth.getClient() });
  const sites = await sc.sites.list({});
  const entry = (sites.data.siteEntry || []).find(
    (s) => /curify-ai\.com/i.test(s.siteUrl) && /(siteOwner|siteFullUser)/i.test(s.permissionLevel || ""),
  );
  if (!entry) throw new Error("no writable curify-ai.com GSC property visible to the service account");
  console.error(`GSC ${entry.siteUrl}  ${from} → ${to}`);

  const templates = new Map();
  const bump = (id) => {
    if (!templates.has(id)) templates.set(id, { image: { i: 0, c: 0 }, web: { i: 0, c: 0 }, queries: {}, examples: {} });
    return templates.get(id);
  };

  for (const type of ["image", "web"]) {
    // dataState "final" on purpose — the last 1-2 days are partial and a
    // half-reported day has already been misread as a traffic cliff once.
    const rows = await queryAll(sc, entry.siteUrl, {
      startDate: from, endDate: to, dimensions: ["page", "query"], type, rowLimit: 25000, dataState: "final",
    });
    console.error(`  ${type}: ${rows.length} page×query rows`);
    for (const r of rows) {
      const id = tplOf(r.keys[0]);
      if (!id) continue;
      const t = bump(id);
      t[type].i += r.impressions;
      t[type].c += r.clicks;
      const ex = exOf(r.keys[0]);
      // A query measured on the TEMPLATE page describes the template, so it can
      // title any of its examples. A query measured on an EXAMPLE page
      // describes that example only. Conflating the two titled a Republican-era
      // Zhongshan suit "… Chong Kben" — the top Latin query for
      // template-costume, and a Cambodian garment.
      const bucket = ex ? ((t.examples[ex] ||= { i: 0, c: 0, queries: {} }).queries) : t.queries;
      const q = (bucket[r.keys[1]] ||= { i: 0, c: 0, type });
      q.i += r.impressions;
      q.c += r.clicks;
      if (ex) {
        t.examples[ex].i += r.impressions;
        t.examples[ex].c += r.clicks;
      }
    }
  }

  // Keep the top queries per bucket; the tail is single-impression noise and it
  // triples the file size.
  const topN = (o, n) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1].i - a[1].i).slice(0, n));
  for (const t of templates.values()) {
    t.queries = topN(t.queries, 20);
    t.examples = topN(t.examples, 60);
    for (const e of Object.values(t.examples)) e.queries = topN(e.queries || {}, 8);
  }

  const out = {
    pulled_at: new Date().toISOString(),
    window: { from, to },
    site: entry.siteUrl,
    templates: Object.fromEntries([...templates.entries()].sort((a, b) => b[1].image.i - a[1].image.i)),
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `demand-${from}_${to}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
  console.error(`wrote ${path.relative(ROOT, file)} — ${templates.size} templates`);
  return out;
}

// ---------------------------------------------------------------- read

let _cache = null;
/** Newest demand-*.json, or null when none has been pulled. */
function loadDemand() {
  if (_cache !== null) return _cache;
  let files = [];
  try {
    files = fs.readdirSync(OUT_DIR).filter((f) => /^demand-.*\.json$/.test(f)).sort();
  } catch { /* no dir yet */ }
  _cache = files.length ? JSON.parse(fs.readFileSync(path.join(OUT_DIR, files[files.length - 1]), "utf8")) : false;
  return _cache;
}

function forTemplate(templateId) {
  const d = loadDemand();
  return (d && d.templates[String(templateId).trim()]) || null;
}

/**
 * One score per template, comparable across boards.
 *
 * Image impressions dominate deliberately — Pinterest is an image surface, and
 * a template that earns image impressions has already demonstrated that its
 * pixels pull a query. Clicks are weighted heavily but they are scarce (112
 * image clicks in 90 days site-wide), so they break ties rather than drive the
 * ranking. Web impressions count a tenth: they prove topical demand exists but
 * say nothing about whether the image is what earned it.
 */
function score(templateId) {
  const t = forTemplate(templateId);
  if (!t) return 0;
  return t.image.i + t.image.c * 40 + t.web.i * 0.1 + t.web.c * 20;
}

/** A query a Pinterest user could plausibly type. */
function usable(q, m, minImpr) {
  return m.i >= minImpr && ASCII_ONLY.test(q) && !NON_EN.test(q) && !COPY_STOP.test(q)
    && q.trim().split(/\s+/).length >= 2 && q.length <= 60;
}

/**
 * The search phrase a Pin should be titled for, or null.
 *
 * Example-page queries first — they were measured against this exact image.
 * Template-page queries second: those describe the template as a whole, so they
 * generalise to any example under it. Never another example's queries.
 * Returned lowercase; callers decide the casing.
 */
function copyPhrase(templateId, exampleId = null, { reject = null, templatePhrases = true } = {}) {
  const t = forTemplate(templateId);
  if (!t) return null;
  const own = exampleId && t.examples[exampleId];
  // `reject` applies to the example's own queries too. An example page is not
  // only its own image — Google attributes "coffee bean anatomy diagram" to the
  // BEEF CUTS example page of template-anatomy-cut-guide, 9 impressions, and
  // exempting own-queries let that title the beef diagram.
  const buckets = [[(own && own.queries) || {}, 2]];
  if (templatePhrases) buckets.push([t.queries, 3]);
  for (const [bucket, min] of buckets) {
    for (const [q, m] of Object.entries(bucket)) {
      if (!usable(q, m, min)) continue;
      if (reject && reject(q)) continue;
      return q.trim().toLowerCase();
    }
  }
  return null;
}

/** Every usable phrase, best first — used for the description's keyword tail. */
function copyPhrases(templateId, exampleId = null, n = 4) {
  const t = forTemplate(templateId);
  if (!t) return [];
  const out = [];
  const buckets = [];
  if (exampleId && t.examples[exampleId]) buckets.push(t.examples[exampleId].queries || {});
  buckets.push(t.queries);
  for (const bucket of buckets) {
    for (const [q, m] of Object.entries(bucket)) {
      if (!usable(q, m, 2)) continue;
      const s = q.trim().toLowerCase();
      // Drop near-duplicates: "travel journal collage" / "travel journal photo collage"
      if (out.some((p) => p.includes(s) || s.includes(p))) continue;
      out.push(s);
      if (out.length >= n) return out;
    }
  }
  return out;
}

/** Image impressions this specific example's page earned, for tie-breaks. */
function exampleImpressions(templateId, exampleId) {
  const t = forTemplate(templateId);
  return (t && t.examples[exampleId] && t.examples[exampleId].i) || 0;
}

module.exports = { loadDemand, forTemplate, score, copyPhrase, copyPhrases, exampleImpressions, COPY_STOP };

// ---------------------------------------------------------------- cli

if (require.main === module) {
  const arg = (n, d = null) => {
    const a = process.argv.find((x) => x.startsWith(`--${n}=`));
    return a ? a.split("=").slice(1).join("=") : (process.argv.includes(`--${n}`) ? true : d);
  };
  const ymd = (d) => d.toISOString().slice(0, 10);

  if (arg("pull")) {
    const to = arg("to", ymd(new Date(Date.now() - 3 * 86400000)));
    const from = arg("from", ymd(new Date(Date.parse(to) - 89 * 86400000)));
    pull({ key: arg("key", DEFAULT_KEY), from, to }).catch((e) => { console.error(e.message); process.exit(1); });
  } else {
    const d = loadDemand();
    if (!d) { console.error("no demand file — run with --pull first"); process.exit(1); }
    const limit = Number(arg("limit", 40));
    console.log(`# demand ${d.window.from} → ${d.window.to}  (${Object.keys(d.templates).length} templates)\n`);
    console.log("score".padStart(7), "imgI".padStart(6), "imgC".padStart(5), "webI".padStart(6), " template / phrase");
    for (const [id] of Object.entries(d.templates).slice(0, limit)) {
      const t = d.templates[id];
      console.log(
        String(Math.round(score(id))).padStart(7),
        String(t.image.i).padStart(6), String(t.image.c).padStart(5), String(t.web.i).padStart(6),
        ` ${id}\n${" ".repeat(28)}“${copyPhrase(id) || "—"}”`,
      );
    }
  }
}
