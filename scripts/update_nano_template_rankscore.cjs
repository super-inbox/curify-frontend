#!/usr/bin/env node

/**
 * Update public/data/nano_templates.json with rank_score from Postgres.
 *
 * Behavior:
 * - Runs only on Tuesday / Thursday in America/Los_Angeles by default
 * - Can be bypassed with:
 *    1) --force
 *    2) SKIP_WEEKDAY_CHECK=true
 * - Loads DATABASE_URL from:
 *    1) process.env (e.g. GitHub Actions secrets on server)
 *    2) .env.local locally if DATABASE_URL is not already set
 * - Defaults rank_score to 1 for templates with no matching data
 * - Verifies template count before/after write so templates are not dropped
 *
 * Usage:
 *   node scripts/update_nano_template_rankscore.cjs
 *   node scripts/update_nano_template_rankscore.cjs --force
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

async function fetchRankScores(client) {
  const sql = `
    SELECT
      content_id,
      SUM(
        CASE
          WHEN action_type = 'CLICK' THEN 1
          WHEN action_type = 'COPY' THEN 2
          WHEN action_type = 'REMIX' THEN 3
          WHEN action_type = 'GENERATE' THEN 4
          ELSE 0
        END
      ) AS rank_score
    FROM user_interactions
    WHERE created_at >= NOW() - INTERVAL '3 days'
    GROUP BY content_id
    HAVING SUM(
      CASE
        WHEN action_type IN ('CLICK', 'COPY', 'REMIX', 'GENERATE') THEN 1
        ELSE 0
      END
    ) > 0
    ORDER BY rank_score DESC;
  `;

  const res = await client.query(sql);

  // content_id may appear more than once across content_type
  // collapse to a single template-level score
  const scoreMap = new Map();

  for (const row of res.rows) {
    const templateId = row.content_id;
    const score = Number(row.rank_score || 0);

    if (!templateId) continue;
    scoreMap.set(templateId, (scoreMap.get(templateId) || 0) + score);
  }

  return scoreMap;
}

function mergeRankScoresIntoTemplates(templates, scoreMap) {
  let changedCount = 0;
  let defaultedCount = 0;

  const updated = templates.map((template) => {
    const hasScore = scoreMap.has(template.id);
    const nextScore = hasScore ? scoreMap.get(template.id) : 1;
    const prevScore = Number(template.rank_score ?? 1);

    if (!hasScore) {
      defaultedCount += 1;
    }

    if (prevScore !== nextScore) {
      changedCount += 1;
    }

    return {
      ...template,
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
      `[rankscore] Updated rank_score on ${changedCount} templates. Defaulted ${defaultedCount} templates to rank_score=1.`
    );
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error("[rankscore] Failed:", err);
  process.exit(1);
});