/**
 * 夏可 — targeted button-sharpening pass on the approved 棚拍正面 frame.
 *
 * WHY NOT JUST RE-RENDER THE FRAME
 * --------------------------------
 * Tried first and it failed outright: asking for "the same photograph with
 * sharper buttons" produced four takes, three of which relocated her to a café
 * or a window and one of which returned a different woman entirely. A whole-frame
 * re-render is a new photograph no matter how firmly the prompt says otherwise.
 *
 * So this crops the chest, re-renders only that, and composites it home — the
 * same shape as oneoff_fashion_head_swap_2026-09-07.cjs. Everything outside the
 * pasted region is bit-for-bit the approved frame, so pose, identity, lighting
 * and framing cannot drift.
 *
 * Two nested boxes on purpose:
 *   CROP  large, gives the model context (collar, shoulders, rib direction)
 *   PASTE small, centred on the placket, feathered — the smaller the pasted
 *         area, the less chance of a visible seam or a colour step.
 *
 *   node scripts/oneoff_xiake_button_pass_2026-09-14.cjs [--n 3]
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleGenAI } = require("@google/genai");

const BG_ENV = "/Users/qqwjq/curify-studio/curify_background/.env";
const key = fs
  .readFileSync(BG_ENV, "utf-8")
  .match(/^GEMINI_API_KEY_TRYON_RETOUCHING=(.+)$/m)[1]
  .trim()
  .replace(/^["']|["']$/g, "");
const MODEL = process.env.MODEL || "gemini-3-pro-image-preview";

const REQ = "/Users/qqwjq/curify-gallery/client_VC_portfolio/夏可测试（一套5张）";
const OUT = path.join(REQ, "output");
const SRC = path.join(OUT, "anchor-03.png");
const COLLAR_REF = path.join(
  REQ,
  "SWGQ305139022+SWGQ110019014/SWGQ305139022/SWGQ305139022 (3).jpg"
);
const WORK = path.join(OUT, ".button-pass");

// anchor-03 is 3584x4800; the placket sits around x1520-2040, y900-1660.
const CROP = { w: 1500, h: 1500, x: 1200, y: 650 };
// inner box, relative to the crop, that actually gets pasted back
const PASTE = { w: 780, h: 1000, x: 280, y: 180, feather: 40 };

const PROMPT = `IMAGE 1 is a square crop from an approved studio fashion photograph.
IMAGE 2 is the supplier's close-up of the same garment's collar and buttons.

Return IMAGE 1 with ONE thing changed: the three buttons on the centre-front
placket are rendered SHARP. Every other pixel stays as it is.

THE BUTTONS, as IMAGE 2 shows them:
  - three small tonal pale-blue buttons down a narrow flat-knit placket, evenly
    spaced, all fastened
  - each is a hard little object with a crisp circular outline, a slightly raised
    rim catching the light, a shallow dished centre, and FOUR DISTINCT HOLES
    reading as four small dark dots in a square
  - they sit flat against the placket with a small contact shadow under the rim
  - the placket is a narrow clean strip with defined edges, finishing in a neat
    horizontal bar at its lower end

KEEP EXACTLY AS IN IMAGE 1 — do not redraw, move, resize or relight any of it:
  - the crop, its framing, its scale and every edge. The result must line up
    pixel for pixel with IMAGE 1 everywhere except the buttons themselves.
  - her face, her neck, her hair, her skin tone and its texture
  - the collar's shape and position, the broad vertical rib of the knit, the
    sleeves, the shoulders
  - the seamless studio background and the soft frontal studio light
  - the colour of everything: the same pale powder blue, the same white balance

DO NOT add a fourth button, do not remove one, do not change their spacing, do
not widen the placket, do not make the buttons larger or darker or whiter than
the knit around them. No text, no watermark, no logo.

The result is the same photograph, in focus.`;

async function main() {
  const n = Number(
    (process.argv.includes("--n") && process.argv[process.argv.indexOf("--n") + 1]) || 3
  );
  fs.mkdirSync(WORK, { recursive: true });

  const crop = path.join(WORK, "crop.png");
  execSync(
    `magick "${SRC}" -crop ${CROP.w}x${CROP.h}+${CROP.x}+${CROP.y} +repage "${crop}"`,
    { stdio: "pipe" }
  );

  const ai = new GoogleGenAI({ apiKey: key });
  const part = (p) => ({
    inlineData: {
      mimeType: p.endsWith(".png") ? "image/png" : "image/jpeg",
      data: fs.readFileSync(p).toString("base64"),
    },
  });

  for (let i = 1; i <= n; i++) {
    process.stdout.write(`button pass ${i}/${n} ... `);
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { role: "user", parts: [part(crop), part(COLLAR_REF), { text: PROMPT }] },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: { aspectRatio: "1:1", imageSize: "2K" },
      },
    });
    let got = null;
    for (const c of resp.candidates || [])
      for (const p of c.content?.parts || [])
        if (p.inlineData?.data) { got = Buffer.from(p.inlineData.data, "base64"); break; }
    if (!got) { console.log("no image"); continue; }

    const raw = path.join(WORK, `patch-${i}.png`);
    fs.writeFileSync(raw, got);

    // back to the crop's own pixel size before anything is measured or pasted
    const fitted = path.join(WORK, `fitted-${i}.png`);
    execSync(`magick "${raw}" -resize ${CROP.w}x${CROP.h}! "${fitted}"`, { stdio: "pipe" });

    // feathered paste of the inner box only
    const mask = path.join(WORK, `mask-${i}.png`);
    execSync(
      `magick -size ${CROP.w}x${CROP.h} xc:black -fill white ` +
        `-draw "rectangle ${PASTE.x},${PASTE.y} ${PASTE.x + PASTE.w},${PASTE.y + PASTE.h}" ` +
        `-blur 0x${PASTE.feather} "${mask}"`,
      { stdio: "pipe" }
    );
    const blended = path.join(WORK, `blended-${i}.png`);
    execSync(
      `magick "${crop}" "${fitted}" "${mask}" -compose over -composite "${blended}"`,
      { stdio: "pipe" }
    );

    const out = path.join(OUT, `front-buttons-${String(i).padStart(2, "0")}.png`);
    execSync(
      `magick "${SRC}" "${blended}" -geometry +${CROP.x}+${CROP.y} -compose over -composite "${out}"`,
      { stdio: "pipe" }
    );
    console.log(path.basename(out));
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
