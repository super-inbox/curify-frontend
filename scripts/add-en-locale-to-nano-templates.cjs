// scripts/add-en-locale-to-nano-templates.cjs
require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FILE_PATH = path.join(process.cwd(), "public", "data", "nano_templates.json");
const MODEL = "gpt-4o-mini";

async function translateLocaleToEn(sourceLocaleKey, sourceLocaleValue, templateId) {
  const payload = {
    base_prompt: sourceLocaleValue.base_prompt || "",
    parameters: Array.isArray(sourceLocaleValue.parameters)
      ? sourceLocaleValue.parameters.map((p) => ({
          name: p.name,
          label: p.label || "",
          type: p.type,
          placeholder: Array.isArray(p.placeholder) ? p.placeholder : [],
        }))
      : [],
  };

  const systemPrompt = `
You are a careful localization assistant for AI prompt templates.

Task:
Translate the given locale content into natural English for the "en" locale.

Rules:
1. Keep JSON structure exactly the same.
2. Translate only:
   - base_prompt
   - each parameter.label
   - each parameter.placeholder item
3. Do NOT change:
   - parameter.name
   - parameter.type
   - any variable placeholders like {herb_name}
   - punctuation style if it affects placeholders or template variables
4. Keep the prompt detailed and faithful, but make it read naturally in English.
5. Return valid JSON only. No markdown fences. No explanation.
`;

  const userPrompt = `
template_id: ${templateId}
source_locale: ${sourceLocaleKey}

Input JSON:
${JSON.stringify(payload, null, 2)}
`;

  const resp = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = resp.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`Empty model response for template ${templateId}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse JSON for template ${templateId}: ${err.message}\nRaw:\n${text}`);
  }

  return {
    base_prompt: parsed.base_prompt || "",
    parameters: Array.isArray(parsed.parameters)
      ? parsed.parameters.map((p, idx) => ({
          name: payload.parameters[idx]?.name ?? p.name,
          type: payload.parameters[idx]?.type ?? p.type,
          label: p.label || "",
          placeholder: Array.isArray(p.placeholder) ? p.placeholder : [],
        }))
      : [],
  };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment.");
  }

  if (!fs.existsSync(FILE_PATH)) {
    throw new Error(`File not found: ${FILE_PATH}`);
  }

  const raw = fs.readFileSync(FILE_PATH, "utf8");
  const templates = JSON.parse(raw);

  if (!Array.isArray(templates)) {
    throw new Error("Expected nano_templates.json to be a top-level array.");
  }

  let updatedCount = 0;

  for (const template of templates) {
    if (!template || typeof template !== "object") continue;

    template.locales = template.locales || {};

    if (template.locales.en) {
      console.log(`Skipping ${template.id}: en already exists`);
      continue;
    }

    const localeKeys = Object.keys(template.locales);
    if (localeKeys.length === 0) {
      console.warn(`Skipping ${template.id}: no source locale found`);
      continue;
    }

    // Prefer zh if present, otherwise first locale
    const sourceLocaleKey = template.locales.zh ? "zh" : localeKeys[0];
    const sourceLocaleValue = template.locales[sourceLocaleKey];

    if (!sourceLocaleValue) {
      console.warn(`Skipping ${template.id}: invalid source locale`);
      continue;
    }

    console.log(`Translating ${template.id} from ${sourceLocaleKey} -> en`);

    try {
      const enLocale = await translateLocaleToEn(
        sourceLocaleKey,
        sourceLocaleValue,
        template.id
      );
      template.locales.en = enLocale;
      updatedCount += 1;
    } catch (err) {
      console.error(`Failed on ${template.id}: ${err.message}`);
    }
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(templates, null, 2) + "\n", "utf8");
  console.log(`Done. Added en locale to ${updatedCount} template(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});