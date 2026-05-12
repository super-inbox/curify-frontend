#!/usr/bin/env node

/**
 * Update public/data/nano_templates.json with the canonical rank_score:
 *
 *   rank_score = base_rank_score + freshness_bonus + engagement_bonus
 *
 *   freshness_bonus  = max(0, round(20 × (1 − days_old / 14)))   // 0–20
 *   engagement_bonus = min(35, 0.15 × engagement_signal)         // 0–35
 *
 * where days_old comes from each template's creation_date (backfilled
 * here at ~4 templates/day from the end of the file if missing) and
 * engagement_signal is the weighted sum of CLICK/COPY/REMIX/GENERATE
 * events over the last 3 days, pulled from Postgres.
 *
 * Behavior:
 * - Runs only on Tuesday / Thursday in America/Los_Angeles by default
 * - Can be bypassed with:
 *    1) --force
 *    2) SKIP_WEEKDAY_CHECK=true
 * - Loads DATABASE_URL from:
 *    1) process.env (e.g. GitHub Actions secrets on server)
 *    2) .env.local locally if DATABASE_URL is not already set
 * - Verifies template count before/after write so templates are not dropped
 *
 * Usage:
 *   node scripts/update_nano_template_rankscore.cjs
 *   node scripts/update_nano_template_rankscore.cjs --force
 *   node scripts/update_nano_template_rankscore.cjs --dry-run
 *   SKIP_WEEKDAY_CHECK=true node scripts/update_nano_template_rankscore.cjs
 *   DATABASE_URL=... node scripts/update_nano_template_rankscore.cjs
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = process.cwd();
const TEMPLATE_JSON_PATH = path.join(ROOT, "public", "data", "nano_templates.json");

const args = process.argv.slice(2);
const isForce = args.includes("--force");
const isDryRun = args.includes("--dry-run");

loadLocalEnv();

function loadLocalEnv() {
  // Server / GitHub Actions should already provide DATABASE_URL via env.
  // Locally, fall back to .env.local if DATABASE_URL is not set.
  if (process.env.DATABASE_URL) {
    return;
  }

  const envLocalPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envLocalPath)) {
    return;
  }

  const raw = fs.readFileSync(envLocalPath, "utf8");
  parseEnvIntoProcessEnv(raw);
}

function parseEnvIntoProcessEnv(raw) {
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

function getLADayShort() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/Los_Angeles",
  }).format(new Date());
}

function shouldRunToday() {
  const skip = String(process.env.SKIP_WEEKDAY_CHECK || "").toLowerCase() === "true";
  if (skip) return true;

  const day = getLADayShort(); // Tue / Thu / etc.
  return day === "Tue" || day === "Thu";
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function countTemplates(templates) {
  if (!Array.isArray(templates)) {
    throw new Error("Expected templates to be an array.");
  }
  return templates.length;
}

function getUniqueTemplateIdCount(templates) {
  const ids = new Set();

  for (const template of templates) {
    if (template && template.id) {
      ids.add(template.id);
    }
  }

  return ids.size;
}

// Engagement query — mirrors `get_interaction_analytics` in
// curify-studio/curify_background/app/crud/admin.py so the two stay
// consistent. Differences vs. admin.py:
//   - SHARE is added with weight 5 (admin.py drops it since it doesn't
//     count as replication; for ranking we want it as a popularity signal).
// Weights: CLICK=1, COPY=5, REMIX=8, GENERATE=10, SHARE=5.
//
// Example-level events are rolled up to their parent template via the
// 'template-%:...' content_id convention (split_part on ':').
async function fetchRankScores(client) {
  const sql = `
    SELECT
      CASE
        WHEN content_type = 'MBTI_QUIZ' THEN 'mbti_quiz'
        WHEN content_id LIKE 'template-%'
          THEN split_part(content_id, ':', 1)
        ELSE content_id
      END AS template_id,
      (
        SUM(CASE WHEN action_type = 'CLICK'    THEN 1 ELSE 0 END) +
        5  * SUM(CASE WHEN action_type = 'COPY'     THEN 1 ELSE 0 END) +
        8  * SUM(CASE WHEN action_type = 'REMIX'    THEN 1 ELSE 0 END) +
        10 * SUM(CASE WHEN action_type = 'GENERATE' THEN 1 ELSE 0 END) +
        5  * SUM(CASE WHEN action_type = 'SHARE'    THEN 1 ELSE 0 END)
      ) AS score
    FROM user_interactions
    WHERE created_at >= NOW() - INTERVAL '14 days'
      AND content_type NOT IN ('MENU_LINK', 'TOPIC_CAPSULE')
    GROUP BY template_id
    HAVING SUM(
      CASE
        WHEN action_type IN ('CLICK', 'COPY', 'REMIX', 'GENERATE', 'SHARE') THEN 1
        ELSE 0
      END
    ) > 0
    ORDER BY score DESC;
  `;

  const res = await client.query(sql);

  const scoreMap = new Map();
  for (const row of res.rows) {
    const templateId = row.template_id;
    const score = Number(row.score || 0);
    if (!templateId) continue;
    // Multiple rows can in theory map to the same template_id (e.g. if
    // future rollup rules collapse content_types differently); add to be
    // safe even though the GROUP BY today produces one row per template.
    scoreMap.set(templateId, (scoreMap.get(templateId) || 0) + score);
  }
  return scoreMap;
}

// Final rank_score = base_rank_score + freshness_bonus + engagement_bonus,
// where each bonus is capped at 40 so neither component dominates.
const FRESHNESS_BONUS_MAX = 20;
const FRESHNESS_WINDOW_DAYS = 14;
const ENGAGEMENT_WEIGHT = 0.15;
const ENGAGEMENT_BONUS_MAX = 35;

// Used when backfilling creation_date for templates that don't have one.
// Walks from the end of the file, ~4 templates per day = today, today-1, etc.
const TEMPLATES_PER_DAY = 4;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function todayIsoUtc() {
  return new Date().toISOString().slice(0, 10);
}

function daysOldUtc(creationDateStr) {
  if (!creationDateStr) return FRESHNESS_WINDOW_DAYS; // treat as fully decayed
  const created = new Date(`${creationDateStr}T00:00:00.000Z`).getTime();
  const today = new Date(`${todayIsoUtc()}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.floor((today - created) / 86400000));
}

function freshnessBonus(daysOld) {
  if (daysOld >= FRESHNESS_WINDOW_DAYS) return 0;
  return Math.round(FRESHNESS_BONUS_MAX * (1 - daysOld / FRESHNESS_WINDOW_DAYS));
}

function engagementBonus(signal) {
  return Math.min(ENGAGEMENT_BONUS_MAX, ENGAGEMENT_WEIGHT * signal);
}

// Stamp creation_date on any templates that don't have one. Walks the
// missing entries from end of file, grouping every TEMPLATES_PER_DAY into
// one calendar day, with the most recent group = today. Existing
// creation_date values are preserved.
function backfillCreationDates(templates) {
  const missingIdxs = [];
  for (let i = 0; i < templates.length; i++) {
    if (!templates[i].creation_date) missingIdxs.push(i);
  }
  if (missingIdxs.length === 0) return 0;

  const today = new Date(`${todayIsoUtc()}T00:00:00.000Z`);
  const reversedMissing = [...missingIdxs].reverse();
  for (let n = 0; n < reversedMissing.length; n++) {
    const idx = reversedMissing[n];
    const groupAgeDays = Math.floor(n / TEMPLATES_PER_DAY);
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - groupAgeDays);
    templates[idx].creation_date = isoDate(d);
  }
  return missingIdxs.length;
}

function mergeRankScoresIntoTemplates(templates, scoreMap) {
  let changedCount = 0;
  let defaultedCount = 0;

  const updated = templates.map((template) => {
    const baseScore = Number(template.base_rank_score ?? template.rank_score ?? 1);
    const hasScore = scoreMap.has(template.id);
    const userSignal = hasScore ? scoreMap.get(template.id) : 0;

    const fresh = freshnessBonus(daysOldUtc(template.creation_date));
    const engagement = engagementBonus(userSignal);
    const nextScore = baseScore + fresh + engagement;
    const prevScore = Number(template.rank_score ?? 1);

    if (!hasScore) {
      defaultedCount += 1;
    }

    if (prevScore !== nextScore) {
      changedCount += 1;
    }

    return {
      ...template,
      base_rank_score: baseScore,
      rank_score: nextScore,
    };
  });

  return { updated, changedCount, defaultedCount };
}

async function main() {
  const todayStr = getLADayShort();

  console.log(`[rankscore] Args: ${args.join(" ") || "none"}`);

  if (!shouldRunToday() && !isForce) {
    console.log(
      `[rankscore] Skipping run. Today in America/Los_Angeles is ${todayStr}, not Tue/Thu. Use --force to override.`
    );
    return;
  }

  if (isForce && !shouldRunToday()) {
    console.log(
      `[rankscore] Force run enabled. Ignoring weekday restriction (${todayStr}).`
    );
  }

  if (isDryRun) {
    console.log("[rankscore] Running in dry-run mode (no file write).");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL. Set it in GitHub secrets on the server, or in .env.local for local runs."
    );
  }

  ensureFileExists(TEMPLATE_JSON_PATH);

  const templates = readJson(TEMPLATE_JSON_PATH);
  if (!Array.isArray(templates)) {
    throw new Error(`Expected array in ${TEMPLATE_JSON_PATH}`);
  }

  const beforeCount = countTemplates(templates);
  const beforeUniqueIdCount = getUniqueTemplateIdCount(templates);

  console.log(
    `[rankscore] Loaded ${beforeCount} templates from JSON (${beforeUniqueIdCount} unique ids).`
  );

  const stamped = backfillCreationDates(templates);
  if (stamped > 0) {
    console.log(`[rankscore] Backfilled creation_date on ${stamped} templates.`);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    console.log("[rankscore] Connecting to database...");
    await client.connect();

    console.log("[rankscore] Querying recent interaction scores...");
    const scoreMap = await fetchRankScores(client);
    console.log(`[rankscore] Found scores for ${scoreMap.size} content_ids.`);

    const { updated, changedCount, defaultedCount } = mergeRankScoresIntoTemplates(
      templates,
      scoreMap
    );

    const afterCount = countTemplates(updated);
    const afterUniqueIdCount = getUniqueTemplateIdCount(updated);

    console.log(
      `[rankscore] Template count check: before=${beforeCount}, after=${afterCount}.`
    );
    console.log(
      `[rankscore] Unique id count check: before=${beforeUniqueIdCount}, after=${afterUniqueIdCount}.`
    );

    if (beforeCount !== afterCount) {
      throw new Error(
        `[rankscore] Template count mismatch: before=${beforeCount}, after=${afterCount}. Refusing to write.`
      );
    }

    if (beforeUniqueIdCount !== afterUniqueIdCount) {
      throw new Error(
        `[rankscore] Unique template id count mismatch: before=${beforeUniqueIdCount}, after=${afterUniqueIdCount}. Refusing to write.`
      );
    }

    if (!isDryRun) {
      writeJson(TEMPLATE_JSON_PATH, updated);
      console.log(`[rankscore] Wrote ${TEMPLATE_JSON_PATH}.`);
    } else {
      console.log("[rankscore] Dry-run complete. No file written.");
    }

    console.log(
      `[rankscore] Updated rank_score on ${changedCount} templates. ${defaultedCount} had no engagement signal (engagement_bonus=0).`
    );
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error("[rankscore] Failed:", err);
  process.exit(1);
});