#!/usr/bin/env node

/**
 * Snapshot top-25 most-copied gallery prompts (last 30d) → static JSON.
 *
 * Output: public/data/top_remix_prompts.json
 * Schema:
 *   {
 *     "generated_at": "<ISO timestamp>",
 *     "window": "30d",
 *     "prompts": [{ id, title, image_url, tags, unique_copies_30d, total_copies_30d }, ...]
 *   }
 *
 * Two steps, fully no-backend:
 *   1. SQL against user_interactions for the top-N (id, copy_count).
 *      Same prod DB the rankscore script (and other admin pulls) use.
 *   2. Hydrate title/image/tags from the local public/data/nanobanana.json
 *      (4117 prompts indexed locally — no HTTP hop, no backend dependency).
 *
 * The home page reads the output JSON at build time so the hottest cached
 * page stays ISR-friendly with no per-render DB hit.
 *
 * Runs in the existing sync_nanoprompts_to_redis.yml workflow (DB
 * credentials, bot token, and commit-back already wired there).
 *
 * Usage:
 *   node scripts/snapshot_top_remix_prompts.cjs
 *   node scripts/snapshot_top_remix_prompts.cjs --dry-run
 *   DATABASE_URL=... node scripts/snapshot_top_remix_prompts.cjs
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = process.cwd();
const NANOBANANA_PATH = path.join(ROOT, "public", "data", "nanobanana.json");
const OUT_PATH = path.join(ROOT, "public", "data", "top_remix_prompts.json");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

const BOT_UA =
  "bot|crawl|spider|slurp|http|preview|fetch|monitor|whatsapp|telegram|render";
const TEST_USERS = [155, 1117];
// Raised 25 → 40 on 2026-06-27 so HomeFusedRow has a larger interleave
// pool now that the density bumped (every 2 templates instead of 3) +
// the new fresh-picks tier slots in.
const TOP_N = 40;
// Window for the "fresh picks" tier — any prompt whose date or
// createdAt falls inside this window AND came from a curated daily
// drop gets promoted into a recency tier between featured + organic.
// Catches the jun25 / jun26 image2image families without waiting for
// them to accrue 30d copy signal organically.
const FRESH_PICKS_DAYS = 14;
const FRESH_PICKS_MAX  = 18;

loadLocalEnv();

function loadLocalEnv() {
  // GitHub Actions provides DATABASE_URL via secret. Locally, fall back
  // to .env.local. Mirrors the pattern used by
  // scripts/update_nano_template_rankscore.cjs.
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const m = line.match(/^DATABASE_URL\s*=\s*(.+?)\s*$/);
    if (m) {
      process.env.DATABASE_URL = m[1].replace(/^['"]|['"]$/g, "");
      break;
    }
  }
}

// DB encoding gotcha: content_type / action_type are bound to PG enums
// via SQLAlchemy SQLEnum, which stores the enum NAME (uppercase). SQL
// filters MUST use 'NANO_GALLERY' / 'COPY', not the lowercase enum
// values. See feedback_jobtype_enum_addition.md for the broader pattern.
//
// Distinct-by-actor (DISTINCT user_id|session_id) so a single power user
// copying the same prompt 80 times can't sweep the leaderboard. Includes
// anon sessions. Bot UA + test users excluded — same exclusions other
// admin pulls use.
const SQL_TOP_COPIES = `
  WITH bot_free AS (
    SELECT user_id, session_id, content_id
    FROM user_interactions
    WHERE created_at >= NOW() - INTERVAL '30 days'
      AND content_type::text = 'NANO_GALLERY'
      AND action_type::text = 'COPY'
      AND (user_id IS NULL OR user_id NOT IN (${TEST_USERS.join(",")}))
      AND (user_agent IS NULL OR user_agent !~* '${BOT_UA}')
      AND content_id IS NOT NULL
      AND content_id ~ '^[0-9]+$'
  )
  SELECT content_id,
         COUNT(DISTINCT COALESCE(user_id::text, session_id))::int AS unique_copies,
         COUNT(*)::int                                            AS total_copies
  FROM bot_free
  GROUP BY content_id
  ORDER BY unique_copies DESC, total_copies DESC
  LIMIT ${TOP_N};
`;

async function fetchTopCounts() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const res = await client.query(SQL_TOP_COPIES);
    return res.rows;
  } finally {
    await client.end();
  }
}

function buildPromptIndex() {
  const raw = JSON.parse(fs.readFileSync(NANOBANANA_PATH, "utf-8"));
  const arr = Array.isArray(raw) ? raw : raw.prompts || [];
  const byId = new Map();
  for (const p of arr) {
    if (typeof p?.id === "number") byId.set(p.id, p);
  }
  return byId;
}

function hydrate(byId, contentId) {
  const id = parseInt(contentId, 10);
  if (!Number.isFinite(id)) return null;
  const p = byId.get(id);
  if (!p) return null;
  return {
    id,
    title: p.title || "",
    image_url: p.imageUrl || p.imageURL || p.image_url || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    featured_boost: Number(p.featured_boost || 0),
  };
}

(async () => {
  console.log(
    `Pulling top-${TOP_N} 30d copy counts (distinct-by-actor) from user_interactions...`
  );
  const rows = await fetchTopCounts();
  console.log(`  ${rows.length} rows from SQL\n`);

  console.log("Hydrating from local public/data/nanobanana.json...");
  const byId = buildPromptIndex();
  console.log(`  ${byId.size} prompts indexed locally`);

  const out = [];
  let skipped = 0;
  for (const r of rows) {
    const meta = hydrate(byId, r.content_id);
    if (!meta) {
      skipped++;
      console.log(`  ! skip ${r.content_id} (not in nanobanana.json)`);
      continue;
    }
    meta.unique_copies_30d = r.unique_copies;
    meta.total_copies_30d = r.total_copies;
    out.push(meta);
  }

  // Editorial featured boost — pull every prompt in nanobanana.json with
  // featured_boost > 0 and prepend to the list (deduped by id). Same
  // signal that drives nano_prompts:most_popular ranking in Redis, so
  // featured picks dominate BOTH the gallery list page (via Redis) AND
  // the home rail (via this snapshot). 30d copy count still ranks
  // organic-only positions within each tier.
  const featuredIds = new Set();
  const featuredPrompts = [];
  for (const p of byId.values()) {
    const boost = Number(p.featured_boost || 0);
    if (boost <= 0) continue;
    const hydrated = hydrate(byId, String(p.id));
    if (!hydrated) continue;
    // Inherit existing copy counts if already in the organic list
    const existing = out.find((x) => x.id === hydrated.id);
    hydrated.unique_copies_30d = existing?.unique_copies_30d ?? 0;
    hydrated.total_copies_30d = existing?.total_copies_30d ?? 0;
    featuredPrompts.push(hydrated);
    featuredIds.add(hydrated.id);
  }
  // Sort featured by boost desc (so a 2000 boost outranks 1000)
  featuredPrompts.sort((a, b) => (b.featured_boost || 0) - (a.featured_boost || 0));

  // Fresh-picks tier — newly-curated drops (jun25 pet-customization,
  // jun26 surreal fashion, etc.) that haven't had time to accrue 30d
  // copy signal. Promotes prompts whose `date` or `createdAt` is within
  // FRESH_PICKS_DAYS AND whose sourceType marks them as curated drops
  // (so we don't promote miscellaneous twitter scrapes). Sorted by date
  // desc so the most-recently-added land first.
  const freshIds = new Set();
  const freshPrompts = [];
  const freshCutoff = Date.now() - FRESH_PICKS_DAYS * 24 * 60 * 60 * 1000;
  const isCurated = (p) =>
    typeof p?.sourceType === "string" && p.sourceType.startsWith("curated");
  const promptDate = (p) => {
    const raw = p?.date || p?.createdAt;
    if (typeof raw !== "string") return 0;
    const t = Date.parse(raw);
    return Number.isFinite(t) ? t : 0;
  };
  const freshCandidates = [];
  for (const p of byId.values()) {
    if (!isCurated(p)) continue;
    const t = promptDate(p);
    if (t === 0 || t < freshCutoff) continue;
    if (featuredIds.has(p.id)) continue;  // featured wins, no double-listing
    freshCandidates.push({ p, t });
  }
  freshCandidates.sort((a, b) => b.t - a.t);
  for (const { p } of freshCandidates.slice(0, FRESH_PICKS_MAX)) {
    const hydrated = hydrate(byId, String(p.id));
    if (!hydrated) continue;
    const existing = out.find((x) => x.id === hydrated.id);
    hydrated.unique_copies_30d = existing?.unique_copies_30d ?? 0;
    hydrated.total_copies_30d = existing?.total_copies_30d ?? 0;
    freshPrompts.push(hydrated);
    freshIds.add(hydrated.id);
  }

  // Final list: featured → fresh → organic (deduped), capped at TOP_N.
  const organicOnly = out.filter(
    (p) => !featuredIds.has(p.id) && !freshIds.has(p.id)
  );
  const merged = [...featuredPrompts, ...freshPrompts, ...organicOnly].slice(0, TOP_N);
  console.log(`  featured-boosted prompts prepended: ${featuredPrompts.length}`);
  console.log(`  fresh-picks prompts inserted:      ${freshPrompts.length}`);

  const payload = {
    generated_at: new Date().toISOString(),
    window: "30d",
    prompts: merged,
  };
  const text = JSON.stringify(payload, null, 2) + "\n";

  if (isDryRun) {
    console.log(`\n[dry-run] would write ${merged.length} prompts to ${OUT_PATH}`);
  } else {
    fs.writeFileSync(OUT_PATH, text, "utf-8");
    console.log(`\n  wrote ${merged.length} prompts → ${OUT_PATH}`);
  }
  if (skipped) {
    console.log(`  skipped ${skipped} (not in nanobanana.json)`);
  }
  console.log("\n  top 12 preview:");
  for (const p of merged.slice(0, 12)) {
    const t = (p.title || "").slice(0, 50);
    const badge = (p.featured_boost || 0) > 0
      ? "★F"
      : freshIds.has(p.id)
        ? "✦N"
        : "  ";
    console.log(
      `   ${badge} ${String(p.unique_copies_30d).padStart(3)}u/${String(p.total_copies_30d).padStart(3)}t  ${String(p.id).padStart(5)}  ${t}`
    );
  }
})().catch((err) => {
  console.error("Snapshot failed:", err);
  process.exit(1);
});
