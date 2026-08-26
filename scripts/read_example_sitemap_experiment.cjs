#!/usr/bin/env node
/**
 * @file read_example_sitemap_experiment.cjs
 * @description Read out the sitemap-listing A/B. Run 4-8 weeks after assignment.
 *
 * Every URL in both arms had ZERO impressions when assigned, so the primary
 * metric is simply the share of URLs that have since gained >=1 impression.
 * Treatment was de-listed from sitemap-examples.xml; control stayed. If the
 * arms come out equal, hreflang alone is sufficient and the sitemap can be
 * shrunk site-wide with confidence. If control wins, listing matters and the
 * de-listing should be reverted.
 *
 * Arms are unequal by design (~2,000 vs ~4,969), so compare RATES, never counts.
 *
 *   node scripts/read_example_sitemap_experiment.cjs [--days 42]
 */
const { google } = require("googleapis");
const path = require("path");
const R = path.join(__dirname, "..");
const KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";
const exp = require(`${R}/public/data/example_sitemap_experiment.json`);
const days = Number((process.argv.find(a => a.startsWith("--days=")) || "--days=42").split("=")[1]);

// Normal CDF via Abramowitz-Stegun erf, so the verdict is a p-value not a vibe.
function erf(x) {
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
const twoSidedP = z => 1 - erf(Math.abs(z) / Math.SQRT2);

(async () => {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const sc = google.searchconsole({ version: "v1", auth });
  const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
  const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10);
  let rows = [], startRow = 0;
  for (;;) {
    const r = (await sc.searchanalytics.query({ siteUrl: "sc-domain:curify-ai.com",
      requestBody: { startDate: start, endDate: end, dimensions: ["page"], rowLimit: 25000, startRow } })).data.rows || [];
    rows = rows.concat(r);
    if (r.length < 25000) break;
    startRow += 25000;
  }
  const perf = new Map();
  for (const r of rows) perf.set(r.keys[0].replace("https://www.curify-ai.com", "").replace(/\/$/, ""),
    { impr: r.impressions, clicks: r.clicks });

  const score = keys => {
    let gained = 0, impr = 0, clicks = 0;
    for (const k of keys) {
      const [loc, route] = k.split("|");
      const p = perf.get(`/${loc}${route}`);
      if (p && p.impr > 0) { gained++; impr += p.impr; clicks += p.clicks; }
    }
    return { n: keys.length, gained, rate: gained / keys.length, impr, clicks };
  };
  const T = score(exp.treatment), C = score(exp.control);

  console.log(`assigned ${exp.generated}   readout window ${start}..${end} (${days}d)\n`);
  const row = (l, a) => console.log(`  ${l.padEnd(28)} n=${String(a.n).padStart(5)}  gained>=1 impr ${String(a.gained).padStart(4)}  rate ${(a.rate*100).toFixed(2).padStart(5)}%  ${String(a.impr).padStart(6)} impr  ${String(a.clicks).padStart(4)} clk`);
  row("TREATMENT (de-listed)", T);
  row("CONTROL   (still listed)", C);

  const p = (T.gained + C.gained) / (T.n + C.n);
  const se = Math.sqrt(p * (1 - p) * (1 / T.n + 1 / C.n));
  const z = se > 0 ? (C.rate - T.rate) / se : 0;
  const pv = twoSidedP(z);
  console.log(`\n  lift (control - treatment): ${((C.rate - T.rate) * 100).toFixed(2)} pp   z=${z.toFixed(2)}   p=${pv.toFixed(4)}`);
  if (T.gained + C.gained < 20) {
    console.log(`\n  VERDICT: inconclusive -- only ${T.gained + C.gained} URLs gained anything across both arms.`);
    console.log(`  Too few events to separate the arms. Either wait longer or accept that these URLs`);
    console.log(`  are inert either way, which is itself an answer: de-listing them cost nothing.`);
  } else if (pv < 0.05 && C.rate > T.rate) {
    console.log(`\n  VERDICT: sitemap listing MATTERS. Control outperformed. Re-list the treatment arm`);
    console.log(`  and do NOT pursue the site-wide sitemap cut.`);
  } else if (pv < 0.05 && T.rate > C.rate) {
    console.log(`\n  VERDICT: treatment beat control, which no causal story supports -- suspect a`);
    console.log(`  confound (seasonality, a template-level change) before acting.`);
  } else {
    console.log(`\n  VERDICT: no detectable difference. hreflang alone appears sufficient, so the`);
    console.log(`  remaining dead locale variants can be de-listed site-wide.`);
  }
})();
