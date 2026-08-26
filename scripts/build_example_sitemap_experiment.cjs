#!/usr/bin/env node
/**
 * @file build_example_sitemap_experiment.cjs
 * @description Assign long-dead localized example URLs to a sitemap A/B cohort.
 *
 * QUESTION: does listing a locale variant in sitemap-examples.xml do anything,
 * given every example page already emits a complete hreflang alternates set?
 * If hreflang is sufficient, de-listing costs nothing and we can shrink the
 * sitemap a lot. If listing matters, we will see it in the control arm.
 *
 * DESIGN
 *   eligible  non-EN example URLs with ZERO impressions in BOTH a 180d and a
 *             28d GSC window, that survive the noindex + thin-locale gates
 *             (so the experiment is not contaminated by URLs already dropped
 *             for other reasons).
 *   treatment ~2,000, stratified by locale in proportion to the pool, REMOVED
 *             from sitemap-examples.xml. Still hreflang-reachable.
 *   control   every remaining eligible URL, KEPT in the sitemap. Deliberately
 *             larger than treatment: unequal allocation costs little power and
 *             avoids stranding thousands of URLs in an unmeasured holdout.
 *
 * Assignment is a djb2 hash of the URL path, not Math.random: rerunning this
 * script reproduces the identical split, so a cohort can be rebuilt if the file
 * is ever lost, and the assignment is auditable rather than trust-me.
 *
 * READOUT after 4-8 weeks: node scripts/read_example_sitemap_experiment.cjs
 * Primary metric is the share of URLs in each arm that gain >=1 impression --
 * every URL starts at zero, so any gain is attributable.
 *
 *   node scripts/build_example_sitemap_experiment.cjs [--treatment 2000]
 */
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const R = path.join(__dirname, "..");
const KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";
const OUT = path.join(R, "public", "data", "example_sitemap_experiment.json");
const arg = (n, d) => Number((process.argv.find(a => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split("=")[1]);
const TREATMENT_TARGET = arg("treatment", 2000);

const tpl = require(`${R}/public/data/nano_templates.json`);
const insp = require(`${R}/public/data/nano_inspiration.json`);
const vis = require(`${R}/public/data/example_visibility_whitelist.json`);
// Parsed from i18n/routing.ts, never hardcoded. A hand-written copy of this
// list is how the first build of this cohort invented "ar" and "pt" (real
// locales, but not OURS) and assigned 1,922 URLs that cannot exist -- which
// would have silently poisoned both arms with pages that can never earn an
// impression, guaranteeing a null result no matter what the sitemap does.
const LOCALES = (() => {
  const m = fs.readFileSync(`${R}/i18n/routing.ts`, "utf8")
    .match(/locales:\s*\[([\s\S]*?)\]/);
  if (!m) throw new Error("could not parse locales from i18n/routing.ts");
  const out = [...m[1].matchAll(/['"]([a-z]{2}(?:-[A-Z]{2})?)['"]/g)].map(x => x[1]);
  if (out.length < 2 || !out.includes("en")) throw new Error(`implausible locale parse: ${out}`);
  return out;
})();
const toSlug = id => id.replace(/^template-/, "");

// Mirror lib/example_indexing.ts CONTENT_SIGNAL_TOPICS.
const CONTENT = new Set(["education","learning","learning-materials","study-sheets","flashcards","science","history",
  "language","vocabulary","dialogue","expressions","reading","information-card","insight","guides","bilingual",
  "kids-learning","mbti","personality","quiz","culture","cultural-festivals","quote","story","mythology","travel",
  "itinerary","city","map","seasonal","recipes","comparison","finance","relationship","nostalgia","astrology"]);
const indexable = (topics, ov) =>
  typeof ov === "boolean" ? ov : !!topics && topics.some(t => CONTENT.has(String(t).toLowerCase()));

const src = fs.readFileSync(`${R}/lib/seo_retitled_templates.ts`, "utf8");
const RETITLED = new Set((src.match(/SEO_RETITLED_TEMPLATE_IDS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/) || [, ""])[1]
  .split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean));
const VIS = new Set(vis.ids || []);

function djb2(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; }

async function gscPages(sc, days) {
  const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
  const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10);
  let all = [], startRow = 0;
  for (;;) {
    const rows = (await sc.searchanalytics.query({ siteUrl: "sc-domain:curify-ai.com",
      requestBody: { startDate: start, endDate: end, dimensions: ["page"], rowLimit: 25000, startRow } })).data.rows || [];
    all = all.concat(rows);
    if (rows.length < 25000) break;
    startRow += 25000;
  }
  const set = new Set(all.map(r => r.keys[0].replace("https://www.curify-ai.com", "").replace(/\/$/, "")));
  return { start, end, seen: set };
}

(async () => {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const sc = google.searchconsole({ version: "v1", auth });
  const [w180, w28] = [await gscPages(sc, 180), await gscPages(sc, 28)];
  console.log(`  GSC 180d ${w180.start}..${w180.end}   28d ${w28.start}..${w28.end}`);

  const tplLocales = new Map(), tplIndexable = new Map();
  for (const t of tpl) {
    if (!t?.id) continue;
    const id = String(t.id).trim();
    const topics = Array.isArray(t.topics) ? t.topics
      : typeof t.topics === "string" ? t.topics.split(",").map(x => x.trim()) : [];
    tplIndexable.set(id, indexable(topics, t.index_examples));
    if (t.locales && Object.keys(t.locales).length) tplLocales.set(id, Object.keys(t.locales));
  }

  // Eligible pool: mirrors the route's gate order exactly.
  const pool = [];
  for (const ex of insp) {
    if (!ex?.id || !ex?.template_id) continue;
    const templateId = String(ex.template_id).trim(), exampleId = String(ex.id).trim();
    if (!(VIS.has(exampleId) || RETITLED.has(templateId))) continue;   // pre-existing B1 cull
    if (tplIndexable.get(templateId) === false) continue;              // noindex gate
    const route = `/nano-template/${encodeURIComponent(toSlug(templateId))}/example/${encodeURIComponent(exampleId)}`;
    const exLoc = ex.locales ? Object.keys(ex.locales) : [];
    let avail = ex.allow_i18n ? LOCALES : ((exLoc.length ? exLoc : tplLocales.get(templateId)) || LOCALES);
    if (!ex.allow_i18n) avail = avail.filter(l => l === "en" || l === "zh");   // thin-locale gate
    // Require a bare-EN entry: it is the <url> that carries the hreflang block
    // for every alternate. Without it, de-listing this example's other locales
    // would remove the entry entirely and take the alternates with it.
    if (!avail.includes("en")) continue;
    for (const l of avail) {
      if (l === "en") continue;                                        // bare EN is never de-listed
      const p = `/${l}${route}`;
      if (w180.seen.has(p) || w28.seen.has(p)) continue;               // must be dead in BOTH windows
      pool.push({ key: `${l}|${route}`, path: p, locale: l, templateId, h: djb2(p) });
    }
  }

  // Stratify by locale so both arms carry the same language mix.
  const byLocale = {};
  for (const r of pool) (byLocale[r.locale] ||= []).push(r);
  const treatment = [], control = [];
  for (const [loc, rows] of Object.entries(byLocale)) {
    rows.sort((a, b) => a.h - b.h || a.path.localeCompare(b.path));
    const want = Math.round((rows.length / pool.length) * TREATMENT_TARGET);
    rows.forEach((r, i) => (i < want ? treatment : control).push(r));
  }

  const mix = a => { const m = {}; for (const r of a) m[r.locale] = (m[r.locale] || 0) + 1; return m; };
  const tplSpread = a => new Set(a.map(r => r.templateId)).size;
  const payload = {
    _note: "Sitemap A/B. treatment = de-listed from sitemap-examples.xml (still hreflang-reachable); " +
      "control = kept. All URLs had ZERO impressions in both a 180d and a 28d window at assignment, so any " +
      "later impression is attributable. Assignment is a djb2 hash of the path -- rerunning reproduces it. " +
      "Read out with scripts/read_example_sitemap_experiment.cjs. Do NOT regenerate mid-flight: it would " +
      "reshuffle arms and destroy the comparison.",
    generated: w28.end,
    windows: { long: [w180.start, w180.end], short: [w28.start, w28.end] },
    poolSize: pool.length,
    treatmentMix: mix(treatment), controlMix: mix(control),
    treatmentTemplates: tplSpread(treatment), controlTemplates: tplSpread(control),
    treatment: treatment.map(r => r.key).sort(),
    control: control.map(r => r.key).sort(),
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`  eligible pool:  ${pool.length}`);
  console.log(`  treatment:      ${treatment.length}  (${tplSpread(treatment)} templates)`);
  console.log(`  control:        ${control.length}  (${tplSpread(control)} templates)`);
  console.log(`  locale mix T:   ${Object.entries(mix(treatment)).sort().map(([k,v])=>`${k}:${v}`).join(" ")}`);
  console.log(`  locale mix C:   ${Object.entries(mix(control)).sort().map(([k,v])=>`${k}:${v}`).join(" ")}`);
  console.log(`  written: public/data/example_sitemap_experiment.json`);
})();
