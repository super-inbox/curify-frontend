#!/usr/bin/env node
// scripts/refresh_rank_scores.cjs
//
// (1) Backfills `creation_date` on templates that don't have one yet —
//     assumes ~4 templates per day, walking from the end of the file and
//     stamping today, yesterday, two-days-ago, etc.
// (2) Recomputes `rank_score = base_rank_score + freshness_bonus`,
//     where freshness_bonus decays linearly from BONUS_MAX at age 0 to 0
//     at age WINDOW_DAYS.
//
// Run this:
//   - on the initial backfill (today)
//   - whenever new templates are added (the script will stamp them with
//     today's date and re-decay everyone's rank_score)
//   - daily as a cron, to keep the freshness curve current
//
// Usage:
//   node scripts/refresh_rank_scores.cjs            # apply
//   node scripts/refresh_rank_scores.cjs --dry-run  # show what would change
//
// Tuning knobs at the top of the file.

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TPL_PATH = path.join(ROOT, "public/data/nano_templates.json");

// Freshness curve.
const BONUS_MAX = 40;     // bonus added to base_rank_score at age 0
const WINDOW_DAYS = 14;   // bonus reaches 0 at this age

// Rate of new templates per day, used to backfill creation_date in
// reverse-chronological order based on position in the array.
const TEMPLATES_PER_DAY = 4;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  return isoDate(new Date());
}

function daysOldUtc(creationDateStr) {
  // Both sides snap to midnight UTC so days_old is a clean integer.
  const created = new Date(`${creationDateStr}T00:00:00.000Z`).getTime();
  const today = new Date(`${todayIso()}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.floor((today - created) / 86400000));
}

function freshnessBonus(daysOld) {
  if (daysOld >= WINDOW_DAYS) return 0;
  // Linear decay from BONUS_MAX at age 0 to 0 at age WINDOW_DAYS.
  return Math.round(BONUS_MAX * (1 - daysOld / WINDOW_DAYS));
}

const templates = JSON.parse(fs.readFileSync(TPL_PATH, "utf-8"));
console.log(`Loaded ${templates.length} templates`);

// ── (1) Backfill creation_date ────────────────────────────────────────────
// Walk from the end of the array. Group of TEMPLATES_PER_DAY → one day,
// most recent group is today. Only fills missing dates; preserves any
// creation_date already set.

const missingIdxs = [];
for (let i = 0; i < templates.length; i++) {
  if (!templates[i].creation_date) missingIdxs.push(i);
}
console.log(`Templates missing creation_date: ${missingIdxs.length}`);

const today = new Date(`${todayIso()}T00:00:00.000Z`);
let stampedCount = 0;
// Walk missing indices from the LAST in array order (= most recent),
// stamping in TEMPLATES_PER_DAY-sized groups to today, today-1, today-2…
const reversedMissing = [...missingIdxs].reverse();
for (let n = 0; n < reversedMissing.length; n++) {
  const idx = reversedMissing[n];
  const groupAgeDays = Math.floor(n / TEMPLATES_PER_DAY);
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() - groupAgeDays);
  templates[idx].creation_date = isoDate(d);
  stampedCount++;
}
console.log(`Stamped creation_date on ${stampedCount} templates`);

// ── (2) Recompute rank_score = base_rank_score + freshness ────────────────
let recomputed = 0;
let bumped = 0;
for (const t of templates) {
  const base = typeof t.base_rank_score === "number" ? t.base_rank_score : 0;
  const age = daysOldUtc(t.creation_date);
  const bonus = freshnessBonus(age);
  const newScore = base + bonus;
  if (t.rank_score !== newScore) {
    t.rank_score = newScore;
    bumped++;
  }
  recomputed++;
}
console.log(`Recomputed ${recomputed} rank scores; ${bumped} changed`);

// ── Sanity stats ──────────────────────────────────────────────────────────
const ageHistogram = new Map();
for (const t of templates) {
  const age = daysOldUtc(t.creation_date);
  const bucket =
    age < 1 ? "today"
    : age < 7 ? "1-6 days"
    : age < 14 ? "7-13 days"
    : age < 30 ? "14-29 days"
    : "30+ days";
  ageHistogram.set(bucket, (ageHistogram.get(bucket) || 0) + 1);
}
console.log("\nAge buckets:");
for (const [k, v] of ageHistogram) console.log(`  ${k}: ${v}`);

if (dryRun) {
  console.log("\n(dry run — no file written)");
  process.exit(0);
}

fs.writeFileSync(TPL_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
console.log(`\nWrote ${TPL_PATH}`);
