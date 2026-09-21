#!/usr/bin/env node

/**
 * Snapshot recently-USED nano templates (real GENERATE events) → static JSON.
 *
 * Output: public/data/recent_templates.json
 * Schema:
 *   { generated_at, window, min_users, max_age_days, templates: [
 *       { id, generations, users, last_used }  // ranked, most-used first
 *   ]}
 *
 * The home grid ("Trending templates & examples") ordered templates by
 * `rank_score` — an editorial number, not a behavioural one. This pins the
 * templates people actually generated with to the front of that grid, and
 * leaves rank_score to order the long tail behind them.
 *
 * Same no-backend shape as snapshot_top_remix_prompts.cjs: one SQL pull,
 * hydrated and validated against local public/data JSON, committed as a
 * static file so the home page stays ISR-friendly with no per-render DB hit.
 *
 * ⛔ DENYLIST is load-bearing, not hygiene. Five templates reproduce
 *    third-party IP (workstream-seo-smm-growth.md §2026-09-18 table) and one
 *    of them — the Straits Times fruit infographic — ranks high on real usage.
 *    Promoting it to the top of the HOME PAGE is a different exposure from
 *    leaving it live in the catalogue, so usage alone must not be able to
 *    surface it here.
 *
 * Usage:
 *   node scripts/snapshot_recent_templates.cjs
 *   node scripts/snapshot_recent_templates.cjs --dry-run
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = process.cwd();
const TEMPLATES_PATH = path.join(ROOT, "public", "data", "nano_templates.json");
const INSPIRATION_PATH = path.join(ROOT, "public", "data", "nano_inspiration.json");
const OUT_PATH = path.join(ROOT, "public", "data", "recent_templates.json");

const WINDOW_DAYS = 90;     // how far back usage counts
const MAX_AGE_DAYS = 60;    // "recently" — must have been used this recently
const MIN_USERS = 2;        // >1 distinct person, so one operator test cannot pin a tile
const MAX_PINNED = 12;

// workstream-seo-smm-growth.md §2026-09-18 — reproduces a third-party work.
const IP_DENYLIST = new Set([
  "template-fruit-commercial-lifestyle-infographic-poster",     // Straits Times masthead + staff artist credit
  "template-ballroom-dance-step-vintage-tutorial-infographic",  // Art of Manliness roundel + © notice
  "template-book-minimalist",                                   // real in-copyright covers and authors
  "template-musical-instrument-technical-infographic-poster",   // Fender script logo, named musicians
  "template-national-culture-history-infographic",              // Beatles logotype, NHS logo, Elizabeth II
]);

const BOT_UA_REGEX =
  "bot|crawler|spider|slurp|lighthouse|prerender|headless|ahrefs|semrush|petalbot|mj12bot|dotbot|" +
  "bytespider|baiduspider|yandexbot|sogou|naverbot|360spider|facebookexternalhit|whatsapp|telegram|" +
  "slackbot|discordbot|skypeuripreview|linkedinbot|pinterest|chatgpt|claude|anthropic|perplexity|" +
  "gptbot|ccbot|cohere|mistral|external(agent|fetcher)|amazonbot|google-extended";

loadLocalEnv();

function loadLocalEnv() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^DATABASE_URL\s*=\s*(.+?)\s*$/);
    if (m) { process.env.DATABASE_URL = m[1].replace(/^['"]|['"]$/g, ""); break; }
  }
}

/**
 * content_id is not a clean template id. Observed shapes:
 *   template-x                      plain
 *   workflow-sticker:template-x     workflow prefix — the template is the 2nd part
 *   template-x:template-x-example   template:example — the template is the 1st
 *   product-video:generate          a tool, not a template at all
 * So: split on ':', keep the segments that are real template ids, take the first.
 */
function normaliseTemplateId(contentId, known) {
  if (!contentId) return null;
  for (const part of String(contentId).split(":")) {
    if (part.startsWith("template-") && known.has(part)) return part;
  }
  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
  const known = new Set(templates.map((t) => t.id));

  // A pinned template has to be able to render a tile.
  const renderable = new Set();
  for (const r of JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"))) {
    const a = r.asset || {};
    if (r.template_id && (a.preview_image_url || a.image_url)) renderable.add(r.template_id);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const { rows } = await client.query(
    `SELECT content_id,
            COUNT(*)::int AS generations,
            COUNT(DISTINCT COALESCE(user_id::text, session_id))::int AS users,
            MAX(created_at) AS last_used
       FROM user_interactions
      WHERE action_type::text = 'GENERATE'
        AND created_at > NOW() - INTERVAL '${WINDOW_DAYS} days'
        AND content_id IS NOT NULL AND content_id <> ''
        AND (user_id IS NULL OR user_id NOT IN (155, 1117, 1267))
        AND NOT (COALESCE(user_agent,'') ~* '${BOT_UA_REGEX}')
      GROUP BY 1`
  );
  await client.end();

  const agg = new Map();
  for (const r of rows) {
    const id = normaliseTemplateId(r.content_id, known);
    if (!id) continue;
    const cur = agg.get(id) || { id, generations: 0, users: 0, last_used: null };
    cur.generations += r.generations;
    cur.users += r.users;
    if (!cur.last_used || r.last_used > cur.last_used) cur.last_used = r.last_used;
    agg.set(id, cur);
  }

  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const dropped = { ip: [], thin: [], stale: [], unrenderable: [] };
  const picked = [];
  for (const t of agg.values()) {
    if (IP_DENYLIST.has(t.id)) { dropped.ip.push(t.id); continue; }
    if (!renderable.has(t.id)) { dropped.unrenderable.push(t.id); continue; }
    if (t.users < MIN_USERS) { dropped.thin.push(t.id); continue; }
    if (new Date(t.last_used).getTime() < cutoff) { dropped.stale.push(t.id); continue; }
    picked.push(t);
  }
  picked.sort((a, b) =>
    b.users - a.users ||
    b.generations - a.generations ||
    new Date(b.last_used) - new Date(a.last_used));

  const out = {
    generated_at: new Date().toISOString(),
    window: `${WINDOW_DAYS}d`,
    min_users: MIN_USERS,
    max_age_days: MAX_AGE_DAYS,
    templates: picked.slice(0, MAX_PINNED).map((t) => ({
      id: t.id,
      generations: t.generations,
      users: t.users,
      last_used: new Date(t.last_used).toISOString().slice(0, 10),
    })),
  };

  console.log(`matched ${agg.size} templates from ${rows.length} GENERATE content_ids`);
  console.log(`dropped: ${dropped.ip.length} IP-denylisted, ${dropped.thin.length} single-user, ` +
              `${dropped.stale.length} stale, ${dropped.unrenderable.length} unrenderable`);
  if (dropped.ip.length) console.log(`  ⛔ IP denylist hit: ${dropped.ip.join(", ")}`);
  console.log(`\npinning ${out.templates.length}:`);
  for (const t of out.templates) {
    console.log(`  ${t.id.padEnd(56)} ${String(t.generations).padStart(3)} gens ${String(t.users).padStart(3)}u  ${t.last_used}`);
  }

  if (dryRun) { console.log("\n--dry-run: not written"); return; }
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nwrote ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
