#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");

// ===== Config =====
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.curify-ai.com").replace(/\/+$/, "");
const JSON_PATH = path.resolve("public/data/nano_templates.json");
const DRY_RUN = process.argv.includes("--dry-run");

// ===== Guards =====
if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY");
  process.exit(1);
}

// ===== Utils =====
function readJson() {
  return JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
}

function writeJson(data) {
  const target = DRY_RUN
    ? JSON_PATH.replace(".json", ".backup.json")
    : JSON_PATH;

  const tmp = target + ".tmp";

  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, target); // atomic write

  console.log(`💾 saved: ${target}`);
}

function getBasePrompt(t) {
  if (t.base_prompt) return t.base_prompt;

  const locales = t.locales || {};
  for (const k of Object.keys(locales)) {
    if (locales[k]?.base_prompt) return locales[k].base_prompt;
  }

  return "";
}

function getOgImageUrl(t) {
  if (!t.og_image) return null;
  if (t.og_image.startsWith("http")) return t.og_image;
  return `${CDN_BASE}${t.og_image}`;
}

// ===== Prompt =====
function buildPrompt(t) {
  return `
Analyze this template for content production capability.

We care about:
- batch: can generate many cards easily
- video: can convert cards → slideshow video
- narration: natural for voiceover / TTS

Also classify structure_type:
- multi_card
- single_card
- dialogue
- infographic
- narrative
- other

Return STRICT JSON:

{
  "structure_type": "...",
  "batch": true,
  "video": true,
  "narration": true,
  "analysis": "short explanation"
}

Template:
${JSON.stringify({
    id: t.id,
    topics: t.topics,
    base_prompt: getBasePrompt(t),
  }, null, 2)}
`;
}

// ===== Response Parsing =====
function extractText(data) {
  if (data.output_text) return data.output_text;

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (!item.content) continue;

      for (const c of item.content) {
        if (c.type === "output_text" && c.text) {
          return c.text;
        }
      }
    }
  }

  return null;
}

function normalize(result) {
  return {
    structure_type: result.structure_type || "other",
    batch: !!result.batch,
    video: !!result.video,
    narration: !!result.narration,
    analysis: result.analysis || ""
  };
}

// ===== Retry =====
async function withRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;
    console.log("🔁 retrying...");
    await new Promise(r => setTimeout(r, 1000));
    return withRetry(fn, retries - 1);
  }
}

// ===== OpenAI =====
async function callOpenAI(t) {
  const imageUrl = getOgImageUrl(t);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: buildPrompt(t) },
          ...(imageUrl ? [{ type: "input_image", image_url: imageUrl }] : [])
        ]
      }],
      text: {
        format: { type: "json_object" } // critical for stability
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  const text = extractText(data);

  if (!text) {
    console.error("❌ Empty response:", JSON.stringify(data, null, 2));
    throw new Error("No output text");
  }

  try {
    return normalize(JSON.parse(text));
  } catch (e) {
    console.error("❌ JSON parse error:\n", text);
    throw e;
  }
}

// ===== Main =====
async function main() {
  const data = readJson();

  const templates = Array.isArray(data)
    ? data
    : Object.values(data);

  const errorLogPath = JSON_PATH.replace(".json", ".errors.log");
  const results = [];

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];

    if (t.structure_type) {
      console.log(`⏭ skip ${t.id}`);
      continue;
    }

    console.log(`⚙️ analyzing ${t.id}`);

    try {
      const result = await withRetry(() => callOpenAI(t));

      // write structured fields
      t.structure_type = result.structure_type;
      t.batch = result.batch;
      t.video = result.video;
      t.narration = result.narration;

      results.push({
        id: t.id,
        analysis: result.analysis
      });

      // ✅ incremental save
      writeJson(data);

      console.log(`✅ done ${t.id}`);

    } catch (err) {
      console.error(`❌ failed ${t.id}`);

      fs.appendFileSync(
        errorLogPath,
        `[${new Date().toISOString()}] ${t.id}\n${err.stack}\n\n`
      );

      continue;
    }
  }

  // ===== Markdown =====
  const mdPath = JSON_PATH.replace(".json", ".analysis.md");

  const md = [
    "# Template Analysis",
    "",
    `Generated: ${new Date().toISOString()}`,
    ""
  ];

  results.forEach(r => {
    md.push(`## ${r.id}`);
    md.push(r.analysis);
    md.push("");
  });

  fs.writeFileSync(mdPath, md.join("\n"));

  console.log(`📝 Markdown: ${mdPath}`);
}

// ===== Run =====
main().catch(err => {
  console.error(err);
  process.exit(1);
});