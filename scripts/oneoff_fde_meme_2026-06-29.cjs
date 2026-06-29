/**
 * One-off FDE meme render via template-mbti-contrast.
 *
 * The template is built for two-panel vertical comparison cards
 * (bold title + cute animal + caption per panel). Perfect for the
 * FDE car analogy: Backend Engineer pushing the car (rear-wheel
 * drive) vs Frontend Deployed Engineer pulling the car (front-wheel
 * drive). Same engineer-drives-the-company beat, opposite axle.
 *
 * Output: raw/fde-meme/01_fde_frontwheel_drive.jpg
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI, Modality } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-3-pro-image-preview";

const OUTDIR = path.join(process.cwd(), "raw/fde-meme");
fs.mkdirSync(OUTDIR, { recursive: true });

// Template base_prompt verbatim from public/data/nano_templates.json
// (template-mbti-contrast) with {persona_a} / {persona_b} /
// {scene_title} substituted in line.
const PERSONA_A = "Backend Engineer";
const PERSONA_B = "Frontend Deployed Engineer (FDE)";
const SCENE = "driving the company";

const PROMPT = `(MBTI Meme Designer) You are a top-tier AI visual designer specializing in expressive MBTI comparison cards with strong contrast and clear typography. Based on the user inputs [${PERSONA_A}], [${PERSONA_B}], and [${SCENE}], generate a vertical 9:16 comparison card. The design should be a white card with a thick red border and a two-panel layout stacked vertically. Each panel includes a bold title at the top, a cute anthropomorphic animal illustration in the middle, and a humorous caption at the bottom.

Top panel: title "${PERSONA_A} during ${SCENE}". An anthropomorphic animal engineer (e.g. a beaver in a flannel shirt with thick-rim glasses) PUSHING a small car from BEHIND — the car has its REAR wheels spinning, motion lines trailing behind the back wheels. The engineer is sweating but determined. Caption at the bottom in a bold meme font: "Pushes from the back. Rear-wheel drive. Reliable, invisible." Add a small "RWD" badge on the car's rear.

Bottom panel: title "${PERSONA_B} during ${SCENE}". An anthropomorphic animal engineer (e.g. a fox in a hoodie with a laptop slung over its shoulder) STANDING IN FRONT of the car and PULLING it forward by a rope — the car has its FRONT wheels spinning, motion lines streaming from the front wheels. The fox is grinning, looking at the camera. Caption at the bottom in a bold meme font: "Pulls from the front. Front-wheel drive. Still drives the company — now you can see it." Add a small "FWD" badge on the car's front.

Style: flat cartoon, bright colors, clean composition, clear readable English text in a bold rounded sans-serif meme font, neat layout, 4K resolution, optimized for social media sharing (TikTok, Instagram, Xiaohongshu). The two cars should be the SAME car (color + model) so the comparison is purely about which axle drives — emphasizing that an FDE still drives the company, just from the front. Small "Curify" watermark in the bottom-right corner.

Output the final image directly.`;

(async () => {
  console.log(`Calling ${MODEL} for FDE meme...`);
  const t0 = Date.now();
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: PROMPT,
    config: { responseModalities: [Modality.IMAGE] },
  });
  const parts = res?.candidates?.[0]?.content?.parts ?? [];
  let saved = 0;
  for (const part of parts) {
    if (part.inlineData?.data) {
      const out = path.join(OUTDIR, "01_fde_frontwheel_drive.jpg");
      fs.writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
      console.log(`  ✓ ${out}`);
      saved++;
    } else if (part.text) {
      console.log(`  (text): ${part.text.slice(0, 160)}`);
    }
  }
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s. Saved ${saved}.`);
})().catch((err) => { console.error("Render failed:", err); process.exit(1); });
