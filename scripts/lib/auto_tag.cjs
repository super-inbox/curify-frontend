/**
 * Shared auto-tag helpers for nano_inspiration records.
 *
 * Picks one Tier-3 tag per record via gpt-4o-mini, using the parent
 * template's Tier-1 ancestor and the Tier-1 → Tier-3 mapping defined
 * in lib/taxonomy.json (single source of truth, also read by
 * lib/topicRegistry.ts and lib/searchIndex.ts).
 *
 * Used by:
 *   - scripts/sync_nano_inspiration.cjs (gallery + Supabase ingest)
 *   - scripts/generate_template_examples.cjs (config-driven batch gen)
 */

"use strict";

const path = require("path");
const https = require("https");
const http = require("http");
const taxonomy = require(path.join(__dirname, "..", "..", "lib", "taxonomy.json"));

let sharp;
try { sharp = require("sharp"); } catch { sharp = null; }

const TIER1_TAG_CHILDREN = taxonomy.tier3;
const EXPLICIT_CHILD_TOPICS = taxonomy.tier2 || {};

const TIER2_TO_TIER1 = {};
for (const [t1, t2s] of Object.entries(EXPLICIT_CHILD_TOPICS)) {
  for (const t2 of t2s) TIER2_TO_TIER1[t2] = t1;
}

/**
 * Find the first Tier-1 in the template's topics list that has Tier-3
 * tag children. Walks the topics in order: direct Tier-1 hits first,
 * then Tier-2 → Tier-1 lookup.
 */
function findTier1WithTagChildren(templateTopics) {
  if (!Array.isArray(templateTopics)) return null;
  for (const t of templateTopics) {
    if (TIER1_TAG_CHILDREN[t]) return t;
  }
  for (const t of templateTopics) {
    const t1 = TIER2_TO_TIER1[t];
    if (t1 && TIER1_TAG_CHILDREN[t1]) return t1;
  }
  return null;
}

/**
 * For each record, ask the model for a single best Tier-3 tag from the
 * candidate list and append it to record.topics. Mutates records in
 * place. Returns { tagged, skipped, failed } counters.
 */
async function autoTagInspirations(records, templatesById, openai, model) {
  if (!records || records.length === 0) return { tagged: 0, skipped: 0, failed: 0 };

  let tagged = 0, skipped = 0, failed = 0;

  for (const record of records) {
    const tpl = templatesById.get(record.template_id);
    const templateTopics = Array.isArray(tpl?.topics) ? tpl.topics : [];
    const tier1 = findTier1WithTagChildren(templateTopics);
    if (!tier1) { skipped++; continue; }

    const candidates = TIER1_TAG_CHILDREN[tier1] || [];
    if (candidates.length === 0) { skipped++; continue; }

    const titleEn = record.locales?.en?.title || record.locales?.zh?.title || "";
    const paramsStr = JSON.stringify(record.params || {});

    const prompt = `Pick the single best Tier 3 topic tag for the inspiration below.

Inspiration:
  template_id: ${record.template_id}
  template topics: ${templateTopics.join(", ")}
  title: ${titleEn}
  params: ${paramsStr}
  id: ${record.id}

Tier 1 ancestor: ${tier1}
Allowed Tier 3 tags: ${JSON.stringify(candidates)}

Rules:
- Choose exactly one tag from the allowed list, or null if none cleanly applies.
- Prefer the most specific match using all signals (title, params, id slug).
- Output JSON: {"tag": "<one of the allowed strings>" or null}`;

    process.stdout.write(`  → ${record.id} (${tier1}) ... `);
    try {
      const res = await openai.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          { role: "system", content: "You are a precise topic classifier. Always return valid JSON." },
          { role: "user", content: prompt },
        ],
      });
      const text = res.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(text);
      const chosen = parsed?.tag;
      if (typeof chosen === "string" && candidates.includes(chosen)) {
        const existing = Array.isArray(record.topics) ? record.topics : [];
        record.topics = [...new Set([...existing, chosen])];
        console.log(`✓ ${chosen}`);
        tagged++;
      } else {
        console.log("(no match)");
        skipped++;
      }
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }

  return { tagged, skipped, failed };
}

/**
 * Common helper: lazily build an OpenAI client when --auto-tag is on.
 * Returns the client, or null if openai is missing / API key absent.
 * Caller is responsible for warning the user.
 */
function tryBuildOpenAIClient() {
  let OpenAI;
  try {
    OpenAI = require("openai");
  } catch {
    return { client: null, reason: "openai package not installed" };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { client: null, reason: "OPENAI_API_KEY not set" };
  }
  return { client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000 }), reason: null };
}

// ── Vision-based tagging ────────────────────────────────────────────────────
//
// Unlike autoTagInspirations (text signals → closed Tier-3 vocabulary),
// these helpers read actual image pixels via gpt-4o vision and return
// short open-vocabulary descriptors ("vintage", "moody", "portrait"…).
// Used by scripts/tag-inspirations-with-gpt.cjs for batch corpus retag.

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUpTo(arr, n) {
  return arr.length <= n ? arr : shuffle([...arr]).slice(0, n);
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchBuffer(res.headers.location).then(resolve).catch(reject);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/** Resize image to max 512px and return data: base64 JPEG URL. */
async function resizeImageToBase64(url) {
  const buf = await fetchBuffer(url);
  if (sharp) {
    const resized = await sharp(buf)
      .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  }
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/**
 * Ask gpt-4o vision to assign up to 5 short descriptive tags from one or
 * two source images. Returns string[] (lowercase, free-form).
 */
async function tagFromImagesVision({ imageUrls, openai, model = "gpt-4o", maxTokens = 100, maxTags = 5 }) {
  const imageContent = await Promise.all(
    imageUrls.map(async (url) => {
      let src = url;
      try { src = await resizeImageToBase64(url); } catch { /* fall back to URL */ }
      return { type: "image_url", image_url: { url: src, detail: "low" } };
    })
  );

  const res = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text:
              `Look at the image(s) and assign up to ${maxTags} short descriptive tags that capture the visual style, mood, subject, or theme. ` +
              `Return ONLY a JSON array of lowercase strings, no explanation. Example: ["vintage","portrait","moody","urban"]`,
          },
        ],
      },
    ],
  });

  const text = res.choices?.[0]?.message?.content?.trim() || "[]";
  const match = text.match(/\[[\s\S]*\]/);
  const tags = match ? JSON.parse(match[0]) : [];
  return Array.isArray(tags) ? tags.slice(0, maxTags) : [];
}

/**
 * Batch retag inspirations from their images. Does NOT mutate the
 * inspiration records — returns a separate annotation array suitable
 * for writing to scripts/inspiration_tags_output.json.
 *
 * @param {object} args
 * @param {Array}  args.records      nano_inspiration entries (with asset.image_url, asset.preview_image_url)
 * @param {object} args.openai       OpenAI client
 * @param {string} args.cdnBase      base URL prefix for /images/... paths
 * @param {number} [args.concurrency=5]
 * @param {Set}    [args.doneIds]    example_ids to skip (resume support)
 * @param {string} [args.model='gpt-4o']
 * @param {function} [args.onBatch]  ({results, processed, total}) after each batch
 * @returns {Promise<Array>}  [{ template_id, example_id, tags, error? }, ...]
 */
async function tagInspirationsVision({ records, openai, cdnBase, concurrency = 5, doneIds = new Set(), model = "gpt-4o", onBatch }) {
  const toAbs = (u) => {
    if (!u) return null;
    if (u.startsWith("http")) return u;
    return `${cdnBase}${u}`;
  };

  const todo = records.filter((e) => e.asset?.image_url && !doneIds.has(e.id));
  const results = [];
  let processed = 0;

  for (let i = 0; i < todo.length; i += concurrency) {
    const batch = todo.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(async (entry) => {
        const candidates = [toAbs(entry.asset?.preview_image_url), toAbs(entry.asset?.image_url)].filter(Boolean);
        const imageUrls = pickUpTo(candidates, 2);
        if (imageUrls.length === 0) return null;
        const tags = await tagFromImagesVision({ imageUrls, openai, model });
        return { template_id: entry.template_id, example_id: entry.id, tags };
      })
    );
    for (let j = 0; j < settled.length; j++) {
      const s = settled[j];
      const entry = batch[j];
      if (s.status === "fulfilled" && s.value) {
        results.push(s.value);
      } else {
        results.push({ template_id: entry.template_id, example_id: entry.id, tags: [], error: s.reason?.message || "unknown" });
      }
    }
    processed += batch.length;
    if (onBatch) onBatch({ results: [...results], processed, total: todo.length });
  }

  return results;
}

// ── search-alias enrichment ─────────────────────────────────────────────────
//
// Generates 5–8 hidden search synonyms per inspiration record (Chinese +
// English) so users typing terms like "鲜花" / "重庆" find the right
// content even when params/locales are English-only. Fed into the search
// blob in app/[locale]/(public)/search/page.tsx via record.search_aliases.
//
// Same shared module as autoTagInspirations so both content-ingestion
// scripts pick this up automatically:
//   - scripts/sync_nano_inspiration.cjs
//   - scripts/generate_template_examples.cjs
//
// Also called by scripts/enrich_search_aliases.cjs for catalog backfill.

let _enNanoByIdCache = null;
function getEnNanoById() {
  if (_enNanoByIdCache) return _enNanoByIdCache;
  try {
    const fs = require("fs");
    const enNanoPath = path.join(__dirname, "..", "..", "messages", "en", "nano.json");
    const data = JSON.parse(fs.readFileSync(enNanoPath, "utf-8"));
    _enNanoByIdCache = new Map(Object.entries(data));
  } catch {
    _enNanoByIdCache = new Map();
  }
  return _enNanoByIdCache;
}

function buildAliasContext(record, templatesById, enNanoById) {
  const tpl = templatesById.get(record.template_id) ?? {};
  const tplI18n = enNanoById.get(record.template_id) ?? {};
  return {
    id: record.id,
    template_id: record.template_id,
    template_title: tplI18n.title || "",
    template_category: tplI18n.category || "",
    template_description: (tplI18n.description || "").slice(0, 200),
    params: record.params || {},
    locales: {
      en: record.locales?.en?.title ?? "",
      zh: record.locales?.zh?.title ?? "",
    },
    existing_tags: record.topics || record.tags || [],
  };
}

const ALIAS_SYSTEM_PROMPT = `\
You generate hidden search synonyms for image records in a creative-AI catalog.

For each record you receive (template + params + existing tags), output 5–8
terms a user might TYPE into search to find that image. Mix Chinese and
English. Prefer concrete nouns the user might search for: subject, theme,
related concept, common synonyms, alternate phrasings.

CRITICAL — cross-language coverage for proper nouns and branded terms:
If any param value or title carries a PROPER NOUN, BRAND, FRANCHISE,
PERSONAL NAME, NAMED CONCEPT, or REGIONAL TERM (e.g. "Chiikawa",
"Tour de France", "Aromatherapy Diffuser", "Mountain Bike", "Bordeaux",
"Coq au Vin"), you MUST include:
  - The literal value as-is in the aliases (so it stays searchable when
    the catalog blob is filtered or restructured)
  - Its translation in the OTHER language if there is one — e.g. include
    both "Chiikawa" AND "吉伊卡哇" / "ちいかわ"; both "Tour de France"
    AND "环法自行车赛"; both "Aromatherapy" AND "香薰".
Skip only the literal id slug and template_id — those are not user-typed
search terms. Param values ARE user-typed search terms.

Output strict JSON: an object keyed by record id, value is an array of
strings. No prose, no markdown fences. Example:

{"template-herbal-lily":["鲜花","花朵","百合花","white flower","wedding flower"]}`;

async function _enrichBatch(openai, model, contexts) {
  const userPrompt = `Records (one per line):\n${contexts
    .map((c) => JSON.stringify(c, null, 0))
    .join("\n")}\n\nReturn the JSON object now.`;
  const resp = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 2500,
    messages: [
      { role: "system", content: ALIAS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });
  const raw = (resp.choices?.[0]?.message?.content || "{}").trim();
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`expected JSON object keyed by id, got ${typeof parsed}`);
  }
  return parsed;
}

/**
 * For each record, asks the model for 5–8 hidden search synonyms and
 * writes them to record.search_aliases. Mutates in place. Skips records
 * that already have a non-empty search_aliases unless force=true.
 *
 * @param {Array}  records         inspiration records to enrich
 * @param {Map}    templatesById   template-id → template object
 * @param {object} openai          OpenAI client (from tryBuildOpenAIClient)
 * @param {string} model           model id, e.g. "gpt-4o-mini"
 * @param {object} [opts]
 * @param {Map}    [opts.enNanoById] override for messages/en/nano.json map (auto-loaded if omitted)
 * @param {number} [opts.batchSize=5]    records per LLM call
 * @param {number} [opts.concurrency=4]  parallel LLM calls
 * @param {boolean}[opts.force=false]    re-enrich records that already have aliases
 * @returns {Promise<{enriched: number, skipped: number, failed: number}>}
 */
async function enrichSearchAliases(records, templatesById, openai, model, opts = {}) {
  if (!records || records.length === 0) {
    return { enriched: 0, skipped: 0, failed: 0 };
  }
  const enNanoById = opts.enNanoById || getEnNanoById();
  const batchSize = opts.batchSize ?? 5;
  const concurrency = opts.concurrency ?? 4;
  const force = !!opts.force;

  const targets = records.filter(
    (r) => force || !Array.isArray(r.search_aliases) || r.search_aliases.length === 0
  );
  const preSkipped = records.length - targets.length;
  if (targets.length === 0) {
    return { enriched: 0, skipped: preSkipped, failed: 0 };
  }

  const recordsById = new Map(records.map((r) => [r.id, r]));
  const batches = [];
  for (let i = 0; i < targets.length; i += batchSize) {
    batches.push(targets.slice(i, i + batchSize));
  }

  let enriched = 0;
  let failed = 0;
  let batchesDone = 0;

  // Simple bounded-concurrency executor.
  let cursor = 0;
  async function runOne() {
    while (true) {
      const idx = cursor++;
      if (idx >= batches.length) return;
      const batch = batches[idx];
      const contexts = batch.map((r) => buildAliasContext(r, templatesById, enNanoById));
      try {
        const result = await _enrichBatch(openai, model, contexts);
        for (const rec of batch) {
          const aliases = result[rec.id];
          if (!Array.isArray(aliases) || aliases.length === 0) {
            failed++;
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
          if (cleaned.length === 0) {
            failed++;
            continue;
          }
          const target = recordsById.get(rec.id);
          if (target) {
            target.search_aliases = cleaned;
            enriched++;
          }
        }
      } catch (err) {
        for (const _ of batch) failed++;
        process.stderr.write(`[search_aliases] batch failed: ${err.message}\n`);
      }
      batchesDone++;
      process.stdout.write(`[search_aliases] batch ${batchesDone}/${batches.length} done (enriched=${enriched} failed=${failed})\n`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runOne));

  return { enriched, skipped: preSkipped, failed };
}

module.exports = {
  TIER1_TAG_CHILDREN,
  EXPLICIT_CHILD_TOPICS,
  TIER2_TO_TIER1,
  findTier1WithTagChildren,
  autoTagInspirations,
  enrichSearchAliases,
  tryBuildOpenAIClient,
  // Vision-based open-vocabulary tagging:
  fetchBuffer,
  resizeImageToBase64,
  tagFromImagesVision,
  tagInspirationsVision,
};
