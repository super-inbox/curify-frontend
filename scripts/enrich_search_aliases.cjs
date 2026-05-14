// scripts/enrich_search_aliases.cjs
//
// LLM-driven search-alias enrichment for public/data/nano_inspiration.json.
// For each inspiration without `search_aliases`, ask gpt-4o-mini for ~5
// Chinese + English synonyms a user might type to find that image. Writes
// the field back to the JSON. Idempotent: re-running skips records that
// already have search_aliases.
//
// Usage:
//   node scripts/enrich_search_aliases.cjs --sample=10 --dry-run
//   node scripts/enrich_search_aliases.cjs --sample=10
//   node scripts/enrich_search_aliases.cjs --all
//
// Flags:
//   --sample=N   random N records (default 10 if neither --sample nor --all)
//   --all        process every un-enriched record
//   --dry-run    print proposals; do NOT write back
//   --concurrency=N  parallel LLM calls (default 4)
//   --force      re-enrich even records that already have search_aliases
//
// Source of truth: messages from gpt-4o-mini. Cost ~$0.0005/record, so a
// 10-record dry run is ~$0.005.

require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const ROOT = process.cwd();
const INSP_JSON = path.join(ROOT, "public", "data", "nano_inspiration.json");
const TEMPLATES_JSON = path.join(ROOT, "public", "data", "nano_templates.json");
const EN_NANO_JSON = path.join(ROOT, "messages", "en", "nano.json");

function parseArgs(argv) {
  const out = { sample: null, all: false, dryRun: false, concurrency: 4, force: false };
  for (const a of argv.slice(2)) {
    if (a.startsWith("--sample=")) out.sample = parseInt(a.split("=")[1], 10);
    else if (a === "--all") out.all = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--concurrency=")) out.concurrency = parseInt(a.split("=")[1], 10);
    else if (a === "--force") out.force = true;
  }
  if (out.sample == null && !out.all) out.sample = 10;
  return out;
}

function pickN(arr, n) {
  // Random sample without replacement.
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// Build context per record. Pulls in the parent template's EN i18n
// (title/description) so the model knows what the template is about,
// plus the inspiration's own params/locales for specifics.
function recordContext(rec, templatesById, enNanoById) {
  const tpl = templatesById.get(rec.template_id) ?? {};
  const tplI18n = enNanoById.get(rec.template_id) ?? {};
  const enLoc = rec.locales?.en?.title ?? "";
  const zhLoc = rec.locales?.zh?.title ?? "";
  return {
    id: rec.id,
    template_id: rec.template_id,
    template_title: tplI18n.title || "",
    template_category: tplI18n.category || "",
    template_description: (tplI18n.description || "").slice(0, 200),
    params: rec.params || {},
    locales: { en: enLoc, zh: zhLoc },
    existing_tags: rec.tags || [],
  };
}

const SYSTEM_PROMPT = `\
You generate hidden search synonyms for image records in a creative-AI catalog.

For each record you receive (template + params + existing tags), output 5–8
terms a user might TYPE into search to find that image. Mix Chinese and
English. Prefer concrete nouns the user might search for that are NOT
already in the record (subject, theme, related concept, common synonyms,
alternate phrasings). Skip the literal id/template_id/param values that are
already searchable.

Output strict JSON: an object keyed by record id, value is an array of
strings. No prose, no markdown fences. Example:

{"template-herbal-lily":["鲜花","花朵","百合花","white flower","wedding flower"]}`;

function buildUserPrompt(contexts) {
  const lines = contexts.map((c) =>
    JSON.stringify(c, null, 0)
  );
  return `Records (one per line):\n${lines.join("\n")}\n\nReturn the JSON object now.`;
}

async function enrichBatch(client, contexts) {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 2500,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(contexts) },
    ],
  });
  let raw = (resp.choices[0].message.content || "").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`bad JSON from model: ${e.message}\nraw: ${raw.slice(0, 500)}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`expected object keyed by id, got ${typeof parsed}`);
  }
  return parsed;
}

async function withConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function runOne() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        results[i] = await worker(items[i], i);
      } catch (e) {
        results[i] = { error: e.message };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runOne));
  return results;
}

(async () => {
  const args = parseArgs(process.argv);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in .env.local");
  }
  const client = new OpenAI({ apiKey, timeout: 180000, maxRetries: 2 });

  const inspirations = JSON.parse(fs.readFileSync(INSP_JSON, "utf-8"));
  const templates = JSON.parse(fs.readFileSync(TEMPLATES_JSON, "utf-8"));
  const enNano = JSON.parse(fs.readFileSync(EN_NANO_JSON, "utf-8"));

  const templatesById = new Map(templates.map((t) => [t.id, t]));
  const enNanoById = new Map(Object.entries(enNano));

  // Eligibility: missing search_aliases (unless --force).
  const eligible = inspirations.filter((r) => {
    if (args.force) return true;
    return !Array.isArray(r.search_aliases) || r.search_aliases.length === 0;
  });

  let targets;
  if (args.all) {
    targets = eligible;
  } else {
    targets = pickN(eligible, Math.min(args.sample, eligible.length));
  }

  console.log(
    `[enrich] inspirations=${inspirations.length} eligible=${eligible.length} target=${targets.length} dryRun=${args.dryRun} concurrency=${args.concurrency}`
  );
  if (targets.length === 0) {
    console.log("[enrich] nothing to do");
    return;
  }

  // Batch into groups of 5 per LLM call (keeps prompt small + JSON deterministic).
  const BATCH = 5;
  const batches = [];
  for (let i = 0; i < targets.length; i += BATCH) {
    batches.push(targets.slice(i, i + BATCH));
  }

  const results = await withConcurrency(batches, args.concurrency, async (batch, idx) => {
    const contexts = batch.map((r) => recordContext(r, templatesById, enNanoById));
    process.stdout.write(`[enrich] batch ${idx + 1}/${batches.length} (${contexts.length} records)…\n`);
    const map = await enrichBatch(client, contexts);
    return { batch, map };
  });

  // Apply results, mutating inspirations in place by id.
  const byId = new Map(inspirations.map((r, i) => [r.id, i]));
  let updated = 0;
  let missed = 0;
  for (const result of results) {
    if (result?.error) {
      console.warn(`[enrich] batch error: ${result.error}`);
      continue;
    }
    if (!result?.batch || !result?.map) continue;
    for (const rec of result.batch) {
      const aliases = result.map[rec.id];
      if (!Array.isArray(aliases) || aliases.length === 0) {
        missed++;
        continue;
      }
      const cleaned = Array.from(
        new Set(
          aliases
            .filter((x) => typeof x === "string")
            .map((x) => x.trim())
            .filter((x) => x.length > 0 && x.length <= 60)
        )
      );
      if (!cleaned.length) {
        missed++;
        continue;
      }
      if (args.dryRun) {
        console.log(`  ${rec.id}\n    -> ${JSON.stringify(cleaned)}`);
      }
      const idx = byId.get(rec.id);
      if (idx != null) {
        inspirations[idx].search_aliases = cleaned;
        updated++;
      }
    }
  }

  console.log(`[enrich] updated=${updated} missed=${missed} dryRun=${args.dryRun}`);

  if (!args.dryRun && updated > 0) {
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
