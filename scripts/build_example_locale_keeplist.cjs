#!/usr/bin/env node
/**
 * @file build_example_locale_keeplist.cjs
 * @description Which localized example URLs have EVER earned an impression.
 *
 * sitemap-examples.xml advertised 11,190 URLs, 85% of them locale-prefixed and
 * 75.8% with zero impressions in 90 days. Bulk-listing every locale variant and
 * hoping Google sorts it out is the wrong pattern — hreflang is the discovery
 * mechanism for alternates, and the pages already emit it. This produces the
 * evidence file the sitemap route uses to keep only variants that earn traffic.
 *
 * Refresh periodically: it is a traffic snapshot, and a locale that starts
 * earning impressions should be re-admitted.
 *
 *   node scripts/build_example_locale_keeplist.cjs [--days 90]
 */
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const KEY = "/Users/qqwjq/curify-studio/curify_background/google-service-account.json";
const OUT = path.join(__dirname, "..", "public", "data", "example_locale_keeplist.json");
const days = Number((process.argv.find((a) => a.startsWith("--days=")) || "--days=90").split("=")[1]);

(async () => {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const sc = google.searchconsole({ version: "v1", auth });
  const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
  const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10);

  const rows = (await sc.searchanalytics.query({
    siteUrl: "sc-domain:curify-ai.com",
    requestBody: { startDate: start, endDate: end, dimensions: ["page"], rowLimit: 25000 },
  })).data.rows || [];

  // "<locale>|<route>" for every localized example URL with >=1 impression.
  const keep = new Set();
  let seen = 0;
  for (const r of rows) {
    const u = r.keys[0].replace("https://www.curify-ai.com", "").replace(/\/$/, "");
    if (!u.includes("/example/")) continue;
    seen++;
    const m = u.match(/^\/([a-z]{2})(\/nano-template\/.+)$/);
    if (m) keep.add(`${m[1]}|${m[2]}`);          // localized variant that earns
  }
  const payload = {
    _note:
      "Localized example URLs with >=1 impression. Bare-EN examples are ALWAYS emitted and are not listed here. " +
      "Locale variants absent from this list are reachable via hreflang but not advertised in sitemap-examples.xml. " +
      "Regenerate with scripts/build_example_locale_keeplist.cjs when locale traffic changes.",
    generated: end,
    windowDays: days,
    exampleUrlsWithImpressions: seen,
    keep: [...keep].sort(),
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`  example URLs with impressions: ${seen}`);
  console.log(`  localized variants that earn:  ${keep.size}`);
  console.log(`  written: public/data/example_locale_keeplist.json`);
})();
