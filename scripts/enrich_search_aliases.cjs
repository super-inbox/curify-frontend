// scripts/enrich_search_aliases.cjs
//
// Catalog backfill for the `search_aliases` field on inspiration records.
// Delegates the actual LLM call to scripts/lib/auto_tag.cjs so the daily
// content-drop scripts (sync_nano_inspiration.cjs / generate_template_
// examples.cjs) share the same enrichment path.
//
// Usage:
//   node scripts/enrich_search_aliases.cjs --sample=10 --dry-run
//   node scripts/enrich_search_aliases.cjs --sample=10
//   node scripts/enrich_search_aliases.cjs --all
//
// Flags:
//   --sample=N        random N records (default 10 if neither --sample nor --all)
//   --all             process every un-enriched record
//   --dry-run         print proposals; do NOT write back
//   --concurrency=N   parallel LLM calls (default 4)
//   --batch-size=N    records per LLM call (default 5)
//   --force           re-enrich records that already have search_aliases
//   --model=NAME      OpenAI model (default gpt-4o-mini)

require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const { enrichSearchAliases, tryBuildOpenAIClient } = require("./lib/auto_tag.cjs");

const ROOT = process.cwd();
const INSP_JSON = path.join(ROOT, "public", "data", "nano_inspiration.json");
const TEMPLATES_JSON = path.join(ROOT, "public", "data", "nano_templates.json");

function parseArgs(argv) {
  const out = {
    sample: null,
    all: false,
    dryRun: false,
    concurrency: 4,
    batchSize: 5,
    force: false,
    model: "gpt-4o-mini",
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith("--sample=")) out.sample = parseInt(a.split("=")[1], 10);
    else if (a === "--all") out.all = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--concurrency=")) out.concurrency = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--batch-size=")) out.batchSize = parseInt(a.split("=")[1], 10);
    else if (a === "--force") out.force = true;
    else if (a.startsWith("--model=")) out.model = a.split("=").slice(1).join("=");
  }
  if (out.sample == null && !out.all) out.sample = 10;
  return out;
}

function pickN(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

(async () => {
  const args = parseArgs(process.argv);
  const { client, reason } = tryBuildOpenAIClient();
  if (!client) {
    throw new Error(`OpenAI client unavailable: ${reason}`);
  }

  const inspirations = JSON.parse(fs.readFileSync(INSP_JSON, "utf-8"));
  const templates = JSON.parse(fs.readFileSync(TEMPLATES_JSON, "utf-8"));
  const templatesById = new Map(templates.map((t) => [t.id, t]));

  // Eligibility: missing search_aliases (unless --force).
  const eligible = inspirations.filter((r) => {
    if (args.force) return true;
    return !Array.isArray(r.search_aliases) || r.search_aliases.length === 0;
  });

  const targets = args.all
    ? eligible
    : pickN(eligible, Math.min(args.sample, eligible.length));

  console.log(
    `[enrich] inspirations=${inspirations.length} eligible=${eligible.length} target=${targets.length} dryRun=${args.dryRun} concurrency=${args.concurrency} batch=${args.batchSize}`
  );
  if (targets.length === 0) {
    console.log("[enrich] nothing to do");
    return;
  }

  // For --dry-run, snapshot the pre-state so we can print without writing.
  const preState = args.dryRun
    ? new Map(targets.map((r) => [r.id, r.search_aliases ? [...r.search_aliases] : null]))
    : null;

  const stats = await enrichSearchAliases(targets, templatesById, client, args.model, {
    batchSize: args.batchSize,
    concurrency: args.concurrency,
    force: args.force,
  });

  console.log(
    `[enrich] enriched=${stats.enriched} skipped=${stats.skipped} failed=${stats.failed}`
  );

  if (args.dryRun) {
    for (const rec of targets) {
      const prev = preState.get(rec.id);
      const now = rec.search_aliases;
      if (Array.isArray(now) && JSON.stringify(now) !== JSON.stringify(prev)) {
        console.log(`  ${rec.id}\n    -> ${JSON.stringify(now)}`);
        // Revert so disk is untouched.
        if (prev == null) delete rec.search_aliases;
        else rec.search_aliases = prev;
      }
    }
    console.log("[enrich] dry-run — no write");
    return;
  }

  if (stats.enriched > 0) {
    fs.writeFileSync(
      INSP_JSON,
      JSON.stringify(inspirations, null, 2) + "\n",
      "utf-8"
    );
    console.log(`[enrich] wrote ${INSP_JSON}`);
  }
})().catch((e) => {
  console.error("[enrich] fatal:", e);
  process.exit(1);
});
