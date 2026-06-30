/**
 * One-off text-overlay edit on raw/wc-meme-06-30/wc-meme.jpg.
 *
 * The image is the classic 朱时茂 / 陈佩斯 sketch frame already
 * carrying a red caption at the bottom. The operator wants the
 * caption REPLACED with a WC-themed riff:
 *   "没想到啊 没想到，你小子浓眉大眼的点球也被淘汰了"
 *
 * Reuses the existing image-text-overlay pipeline's Gemini edit
 * call (scripts/image_text_overlay_agent.cjs editImageWithGemini)
 * but skips the OpenAI propose step since the line is already
 * chosen.
 *
 * Output: raw/wc-meme-06-30/wc-meme-edited.jpg
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-2.5-flash-image";

const SRC = path.join(process.cwd(), "raw/wc-meme-06-30/wc-meme.jpg");
const OUT = path.join(process.cwd(), "raw/wc-meme-06-30/wc-meme-edited.jpg");

const NEW_CAPTION = "没想到啊 没想到，你小子浓眉大眼的点球也被淘汰了";

const PROMPT = `Edit this image: REPLACE the existing red Chinese caption at the bottom of the frame with the following caption, in the SAME style — bold red Chinese characters with a thin black outline so it reads cleanly over the stage background, sans-serif font, centered horizontally near the bottom edge:

"${NEW_CAPTION}"

Constraints:
- The two actors, the stage backdrop, the lighting, and everything ABOVE the caption strip must remain pixel-identical.
- Only the bottom caption text changes. Keep the caption at roughly the same vertical position and font size as the original.
- Use Simplified Chinese characters exactly as given — no transliteration, no translation, no extra punctuation.
- Output the edited image directly.`;

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error(`Source not found: ${SRC}`); process.exit(1);
  }
  const imageBuffer = fs.readFileSync(SRC);

  console.log(`Calling ${MODEL} for caption replacement...`);
  const t0 = Date.now();
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          { inlineData: { mimeType: "image/jpeg", data: imageBuffer.toString("base64") } },
        ],
      },
    ],
  });
  const parts = res?.candidates?.[0]?.content?.parts ?? res?.parts ?? [];
  let saved = 0;
  for (const part of parts) {
    if (part?.inlineData?.data) {
      const data =
        typeof part.inlineData.data === "string"
          ? Buffer.from(part.inlineData.data, "base64")
          : part.inlineData.data;
      fs.writeFileSync(OUT, data);
      console.log(`  ✓ ${OUT}`);
      saved++;
    } else if (part?.text) {
      console.log(`  (text): ${part.text.slice(0, 160)}`);
    }
  }
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s. Saved ${saved}.`);
})().catch((err) => { console.error("Edit failed:", err); process.exit(1); });
