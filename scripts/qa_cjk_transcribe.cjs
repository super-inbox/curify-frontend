/**
 * CJK proofreading pass for generated cards.
 *
 * WHY: image models render Chinese as *shapes*, and the failure mode is not a
 * missing glyph — it is a plausible WRONG one. Observed on this batch: 袴 for 将,
 * 捐伤 for 损伤, and 軽軽 (Japanese shinjitai) for 轻轻. All four are invisible at
 * thumbnail size and all four survive a human skim, which is how a garbled card
 * ends up published (see memory: project_hsk2_reading_deliverable).
 *
 * So: send each rendered card BACK to the model and ask for a verbatim
 * transcription, then diff that against the source facts by eye. Transcription
 * is a different task from generation, and it reliably reports the character
 * that was actually drawn rather than the one that was intended.
 *
 * Usage: node scripts/qa_cjk_transcribe.cjs <image> [<image> ...]
 */
try { require("dotenv").config({ path: ".env.local" }); } catch {}
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("❌ Missing GEMINI_API_KEY in .env.local"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = process.env.QA_MODEL || "gemini-3-pro-image-preview";

const ASK = `Transcribe EVERY piece of text in this image, verbatim, exactly as the glyphs are drawn.

Rules:
- Reproduce the character that is ACTUALLY drawn, even if it is wrong, rare, or a Japanese shinjitai form. Do NOT silently correct it to the character you think was intended.
- After the transcription, add a section "SUSPECT:" listing any character that is (a) not standard Simplified Chinese, (b) a malformed/nonsense word, or (c) a likely wrong homophone. Quote the surrounding phrase for each.
- Also add a section "NUMBERS:" listing every numeral, measurement, pH value, duration and percentage shown.
- Also add a section "CHARTS:" describing any chart, graph or percentage figure, and whether it carries a data label.
- If there are none for a section, write "none".`;

const mime = (p) => (path.extname(p).toLowerCase() === ".jpg" ? "image/jpeg" : "image/png");

(async () => {
  for (const file of process.argv.slice(2)) {
    console.log("\n" + "=".repeat(78));
    console.log(path.basename(file));
    console.log("=".repeat(78));
    try {
      const resp = await gemini.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [
          { inlineData: { mimeType: mime(file), data: fs.readFileSync(file).toString("base64") } },
          { text: ASK },
        ] }],
      });
      const text = (resp.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text).filter(Boolean).join("\n");
      console.log(text || "(no text returned)");
    } catch (e) {
      console.error("⚠️ ", e.message);
    }
  }
})();
