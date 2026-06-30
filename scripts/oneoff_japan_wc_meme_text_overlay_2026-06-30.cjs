/**
 * One-off text-overlay edit on raw/wc-meme-06-30/japan-wc.jpeg.
 *
 * The image is a quiet, cinematic poster of Snoopy in a Japan #10
 * kit sitting in a pink flower field, facing Mt. Fuji at sunset
 * with the World Cup trophy glowing at the summit. Operator wants
 * two caption variants overlaid:
 *
 *   V-A (jec)  Japanese + English + Chinese
 *   V-B (je)   Japanese + English only
 *
 * Same image, same Japanese top line — the bottom strip is where
 * V-A vs V-B differ.
 *
 * CJK gotcha: gemini-2.5-flash-image mangles Chinese & longer
 * Japanese, so hardcode gemini-3-pro-image-preview here.
 * (See feedback_chinese_caption_gemini_model.md / runbook §2.7.)
 *
 * Output:
 *   raw/wc-meme-06-30/japan-wc-jec.jpg
 *   raw/wc-meme-06-30/japan-wc-je.jpg
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-3-pro-image-preview";

const SRC = path.join(process.cwd(), "raw/wc-meme-06-30/japan-wc.jpeg");

const VERSIONS = [
  {
    name: "jec",
    out: path.join(process.cwd(), "raw/wc-meme-06-30/japan-wc-jec.jpg"),
    prompt: `Edit this image by overlaying THREE caption lines. Do not alter the existing image — Snoopy, Mt. Fuji, the trophy at the peak, the Shinkansen train, the pink flower field, and the sunset sky must remain pixel-identical. ONLY add the captions.

TOP caption (Japanese):
- Text: "ありがとう、サムライブルー"
- Placement: upper sky region, horizontally centered, well ABOVE the trophy at the peak so the trophy stays fully visible. About 6-8% from the top edge.
- Style: clean white sans-serif Japanese characters with a thin black outline (~2px) for legibility against the pink sunset clouds. Medium size (roughly 4% of image height).

BOTTOM caption — two stacked lines, both horizontally centered in the lower flower-field area, NOT covering Snoopy:

  Line 1 (English, smaller, above):
  - Text: "Thank you, Samurai Blue. The world stopped to applaud."
  - Style: clean white serif with a thin black outline (~2px). About 3% of image height.

  Line 2 (Simplified Chinese, larger, below the English line):
  - Text: "差一点点，但你让世界为你鼓掌"
  - Style: BOLD red (#E63329) Simplified Chinese characters with a thin black outline (~2-3px) for readability over the pink flowers. About 5% of image height.

Stack the two bottom lines tightly (small gap), centered horizontally, with the Chinese line near the very bottom edge (about 4% from bottom).

Constraints:
- Use the exact characters given — no transliteration, no translation, no extra punctuation, no quotation marks in the output.
- All three lines must be sharply legible.
- Do not redraw or modify the figure, the mountain, the trophy, or the train.

Output the edited image directly.`,
  },
  {
    name: "je",
    out: path.join(process.cwd(), "raw/wc-meme-06-30/japan-wc-je.jpg"),
    prompt: `Edit this image by overlaying TWO caption lines. Do not alter the existing image — Snoopy, Mt. Fuji, the trophy at the peak, the Shinkansen train, the pink flower field, and the sunset sky must remain pixel-identical. ONLY add the captions.

TOP caption (Japanese):
- Text: "ありがとう、サムライブルー"
- Placement: upper sky region, horizontally centered, well ABOVE the trophy at the peak so the trophy stays fully visible. About 6-8% from the top edge.
- Style: clean white sans-serif Japanese characters with a thin black outline (~2px) for legibility against the pink sunset clouds. Medium size (roughly 4% of image height).

BOTTOM caption (English):
- Text: "So close. The world stopped to applaud."
- Placement: horizontally centered in the lower flower-field area, NOT covering Snoopy, about 5% from the bottom edge.
- Style: clean white serif with a thin black outline (~2-3px) for readability over the pink flowers. About 4-5% of image height — slightly larger than the Japanese line so it carries the moment.

Constraints:
- Use the exact characters given — no transliteration, no translation, no extra punctuation, no quotation marks in the output.
- Both lines must be sharply legible.
- Do not redraw or modify the figure, the mountain, the trophy, or the train.

Output the edited image directly.`,
  },
];

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error(`Source not found: ${SRC}`); process.exit(1);
  }
  const imageBuffer = fs.readFileSync(SRC);
  const b64 = imageBuffer.toString("base64");

  for (const v of VERSIONS) {
    console.log(`\n=== ${v.name} → ${path.basename(v.out)} ===`);
    console.log(`Calling ${MODEL}...`);
    const t0 = Date.now();
    const res = await gemini.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: v.prompt },
            { inlineData: { mimeType: "image/jpeg", data: b64 } },
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
        fs.writeFileSync(v.out, data);
        console.log(`  ✓ ${v.out}`);
        saved++;
      } else if (part?.text) {
        console.log(`  (text): ${part.text.slice(0, 160)}`);
      }
    }
    console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s, saved ${saved}`);
  }
})().catch((err) => { console.error("Edit failed:", err); process.exit(1); });
