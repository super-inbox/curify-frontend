/**
 * Shared auto-tag helpers for nano_inspiration records.
 *
 * Picks one Tier-3 tag per record via gpt-4o-mini, using the parent
 * template's Tier-1 ancestor and the Tier-1 → Tier-3 mapping defined
 * in lib/topic_tag_mappings.json (single source of truth, also read by
 * lib/topicRegistry.ts).
 *
 * Used by:
 *   - scripts/sync_nano_inspiration.cjs (gallery + Supabase ingest)
 *   - scripts/generate_template_examples.cjs (config-driven batch gen)
 */

"use strict";

const path = require("path");
const topicTagMappings = require(path.join(__dirname, "..", "..", "lib", "topic_tag_mappings.json"));

const TIER1_TAG_CHILDREN = topicTagMappings.TIER1_TAG_CHILDREN;
const EXPLICIT_CHILD_TOPICS = topicTagMappings.EXPLICIT_CHILD_TOPICS || {};

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

module.exports = {
  TIER1_TAG_CHILDREN,
  EXPLICIT_CHILD_TOPICS,
  TIER2_TO_TIER1,
  findTier1WithTagChildren,
  autoTagInspirations,
  tryBuildOpenAIClient,
};
