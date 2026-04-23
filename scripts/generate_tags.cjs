#!/usr/bin/env node

/**
 * Full tagging pipeline:
 * raw tags → aggregated → LLM condense (60–80) → normalized final tags (~40–50)
 * + mapping original → final
 */

const fs = require("fs");
const path = require("path");

// ===== LOAD ENV =====
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envRaw = fs.readFileSync(envPath, "utf-8");
  envRaw.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

// ===== CONFIG =====
const INPUT_PATH = path.join(__dirname, "../public/data/03_27_output.json");
const OUTPUT_PATH = path.join(__dirname, "../public/data/final_tags.json");

const MIN_COUNT = 3;
const MAX_TAGS_FOR_LLM = 300;

// ===== HELPERS =====

function normalizeTag(tag) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function isValidTag(tag) {
  const blacklist = new Set([
    "image",
    "photo",
    "picture",
    "beautiful",
    "creative",
    "modern",
    "hd",
    "4k",
    "8k",
  ]);
  if (!tag || tag.length < 2 || tag.length > 40) return false;
  if (blacklist.has(tag)) return false;
  return true;
}

function extractJson(content) {
  const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("❌ Cannot parse LLM output");
  }
}

// ===== STAGE 3 NORMALIZATION =====

function normalizeFinalTags(tags) {
  const map = new Map();

  function canonical(t) {
    if (t.includes("woman")) return "woman";
    if (t.includes("man")) return "man";

    if (["serenity"].includes(t)) return "serene";
    if (["playful spirit"].includes(t)) return "playful";
    if (["urban style", "urban elegance", "urban landscape"].includes(t))
      return "urban";
    if (["cozy atmosphere", "cozy living room"].includes(t)) return "cozy";

    const blacklist = [
      "beach sunset",
      "winter wonderland",
      "festive cheer",
    ];
    if (blacklist.includes(t)) return null;

    if (t.split(" ").length > 3) return null;

    return t;
  }

  tags.forEach((t) => {
    const c = canonical(t);
    if (c) map.set(c, true);
  });

  return Array.from(map.keys());
}

// ===== LOAD DATA =====

console.log("📥 Loading...");
const raw = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));

const tagMap = new Map();

raw.prompts.forEach((item) => {
  if (!item.tags) return;
  item.tags.forEach((tag) => {
    const t = normalizeTag(tag);
    if (!isValidTag(t)) return;
    tagMap.set(t, (tagMap.get(t) || 0) + 1);
  });
});

// ===== PREP TAG LIST =====

let tagList = Array.from(tagMap.entries())
  .map(([tag, count]) => ({ tag, count }))
  .filter((t) => t.count >= MIN_COUNT)
  .sort((a, b) => b.count - a.count)
  .slice(0, MAX_TAGS_FOR_LLM);

console.log(`✅ ${tagList.length} candidate tags`);

// ===== STAGE 2 LLM CONDENSE =====

async function condenseTags() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const inputText = tagList.map((t) => `${t.tag} (${t.count})`).join(", ");

  const prompt = `
Condense the following tags into 60–80 tags.

Rules:
- Merge similar tags
- Keep meaningful diversity
- Prefer simple phrases (1–3 words)
- Allow slight redundancy (will be cleaned later)

Output JSON array only.

${inputText}
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const json = await res.json();
  return extractJson(json.choices[0].message.content);
}

// ===== BUILD MAPPING =====

function buildMapping(originalTags, finalTags) {
  const mapping = {};

  originalTags.forEach((tag) => {
    let best = finalTags.find((t) => tag.includes(t));

    if (!best) {
      // fallback: closest length heuristic
      best = finalTags.reduce((a, b) =>
        Math.abs(b.length - tag.length) < Math.abs(a.length - tag.length)
          ? b
          : a
      );
    }

    mapping[tag] = best;
  });

  return mapping;
}

// ===== MAIN =====

(async () => {
  try {
    console.log("🤖 Stage 2: LLM condense...");
    const condensed = await condenseTags();

    console.log(`→ condensed: ${condensed.length}`);

    console.log("🧹 Stage 3: normalization...");
    const finalTags = normalizeFinalTags(condensed).slice(0, 50);

    console.log(`→ final: ${finalTags.length}`);

    const originalTags = Array.from(tagMap.keys());

    console.log("🔗 Building mapping...");
    const mapping = buildMapping(originalTags, finalTags);

    const output = {
      final_tags: finalTags,
      mapping,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    console.log("\n🎯 Final tags:");
    console.log(finalTags);

    console.log(`\n💾 Saved to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();