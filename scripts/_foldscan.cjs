// Index/crawl-state scanner over an arbitrary URL list.
//
// Usage:
//   node scripts/_foldscan.cjs <out.tsv>                    # every /blog/<slug> in blogs.json
//   node scripts/_foldscan.cjs <out.tsv> --urls-file=<path> # one absolute-or-site-relative URL per line
//
// The blog default is how this started, but the doc has needed an arbitrary URL
// list three times now (recrawl-stale-folds-2026-09-01.txt,
// reping-postfix-folds-2026-09-02.txt, and the 2026-09-15 /tools/* crawl
// checkpoint), and each time the script could not answer it. Hence --urls-file.
//
// Output is append-only TSV: coverageState \t lastCrawl \t googleCanonical \t url
// then a literal __DONE__ line, so a partial run is distinguishable from a
// finished one.
const { google } = require("googleapis");
const fs = require("fs");

const SITE = "sc-domain:curify-ai.com";
const ORIGIN = "https://www.curify-ai.com";

function urlsFromFile(p) {
  return fs
    .readFileSync(p, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => (l.startsWith("http") ? l : ORIGIN + (l.startsWith("/") ? l : "/" + l)));
}

function urlsFromBlogs() {
  return require("../public/data/blogs.json").map((b) => `${ORIGIN}/blog/${b.slug}`);
}

(async () => {
  const out = process.argv[2];
  if (!out) {
    console.error("usage: node scripts/_foldscan.cjs <out.tsv> [--urls-file=<path>]");
    process.exit(1);
  }
  const fileArg = process.argv.slice(3).find((a) => a.startsWith("--urls-file="));
  const urls = fileArg ? urlsFromFile(fileArg.split("=").slice(1).join("=")) : urlsFromBlogs();

  const auth = new google.auth.GoogleAuth({
    keyFile: "/Users/qqwjq/curify-studio/curify_background/google-service-account.json",
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });
  const sc = google.searchconsole({ version: "v1", auth });

  for (const u of urls) {
    const label = u.replace(ORIGIN, "") || "/";
    try {
      const r = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: u, siteUrl: SITE, languageCode: "en-US" },
      });
      const i = r.data.inspectionResult?.indexStatusResult || {};
      const canonical = (i.googleCanonical || "-").replace(ORIGIN, "") || "/";
      fs.appendFileSync(
        out,
        `${i.coverageState || "?"}\t${(i.lastCrawlTime || "NEVER").slice(0, 10)}\t${canonical}\t${label}\n`
      );
    } catch (e) {
      fs.appendFileSync(out, `ERROR\t-\t-\t${label}\n`);
    }
  }
  fs.appendFileSync(out, "__DONE__\n");
})();
