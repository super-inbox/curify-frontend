/**
 * Head swap for raw/fashion-change-09-07.
 *
 * Puts the head of the man in reference-head.jpg (cropped from the Douyin
 * screenshot's bottom-left video thumbnail — the only unobstructed face in it)
 * onto the two studio fashion shots, keeping each model's head pose, scale and
 * sunglasses.
 *
 * Works on a 1600x1600 head crop cut from the 4000x5328 original so the garment,
 * body and background of the original survive untouched; oneoff_fashion_head_swap_composite_2026-09-07.py pastes
 * the result home.
 *
 * Requires GEMINI_API_KEY in .env.local.
 *   node scripts/oneoff_fashion_head_swap_2026-09-07.cjs [variantCount]
 */
try { require("dotenv").config({ path: "/Users/qqwjq/curify-frontend/.env.local" }); } catch {}
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY in .env.local"); process.exit(1); }
const MODEL = process.env.MODEL || "gemini-3-pro-image-preview";
const gemini = new GoogleGenAI({ apiKey: KEY });

const SCRATCH = "/private/tmp/claude-501/-Users-qqwjq-curify-frontend/045cecb1-8848-4166-8f97-d2c129aa9a41/scratchpad";
const OUT = path.join(SCRATCH, "crop_out");
fs.mkdirSync(OUT, { recursive: true });
const REF = path.join(SCRATCH, "refhead.jpg");
const SG = { "model-1": path.join(SCRATCH, "sg1.png"), "model-2": path.join(SCRATCH, "sg2.png") };

const COMMON = `IMAGE 1 is a square crop from a studio fashion photograph of a male model. IMAGE 2 is a phone-camera photograph of a different man — call him THE PERSON.

Return IMAGE 1 with ONE change: the model's entire head is replaced by THE PERSON's head. Every pixel that is not head or hair stays exactly as it is.

TAKE FROM IMAGE 2 — the head only:
- THE PERSON's exact facial identity: face shape and width, jawline, chin, cheekbones, nose shape and bridge, philtrum, mouth and lip shape, brow shape and thickness, eye shape and spacing, ear shape, hairline, and his natural skin texture with visible pores.
- THE PERSON's hair: soft, STRAIGHT, near-black dark hair in a Korean-style layered mop cut with a full textured fringe falling over the forehead, matte natural finish, covering the tops of the ears at the sides, ending at the nape. It is SHORT — it does not reach the shoulders and it is not a mullet.
- He is a young East Asian man, early twenties, slim face.

KEEP FROM IMAGE 1 — unchanged, exactly as photographed:
- the square crop, its framing, its scale and every edge of it. Do not zoom, pan, re-crop or re-compose. The picture must line up pixel for pixel with IMAGE 1 everywhere outside the head.
- every garment and its every detail — collar shape, seams, buttons, braid trim, zips, fabric colour and weave — the bag and its strap, the necklace and chains, the shoulders and body
- the seamless white studio background and the soft, even, frontal studio lighting
- the model's own neck, its length and width, and the skin tone of his neck

THE SUNGLASSES STAY ON, AND IMAGE 3 IS THE EXACT PAIR. IMAGE 3 is a close-up of the very sunglasses worn in IMAGE 1, shown at their true size against a face. Reproduce that pair exactly — its frame shape, its glossy black plastic, its thick temple arms, its opaque black lenses with no eyes showing through — and reproduce its SIZE relative to the face.

{GLASSES}

Re-seat them on THE PERSON's face: bridge on his nose, rims just under his brow line, temple arms running straight back toward his ears. They must not float, tilt or change style. Do NOT draw a bigger, rounder, more oval or more bug-eyed pair than IMAGE 3; oversized shades are the single most common mistake here.

HEAD GEOMETRY — this is what makes or breaks the picture:
- The new head sits at exactly the same position in the crop and at exactly the same pixel size as the head it replaces. Do not enlarge it, do not shrink it, do not move it. Head-to-shoulder proportion stays exactly as in IMAGE 1.
- It is turned and tilted at exactly the same three-dimensional angle as the head in IMAGE 1.
- The jaw meets the neck of IMAGE 1 cleanly; neck width and the skin tone at the jawline are continuous with the neck already in IMAGE 1.
- Grade his skin to IMAGE 1's studio exposure and white balance so head and neck read as one person under one light.
- Where the removed blonde hair used to cover the collar, shoulders and background, rebuild what is behind it: the same garment continuing its seams and colour, and the same plain white background.

EXPRESSION: calm, cool, neutral editorial expression. Mouth closed, lips relaxed and together. Not smiling, not frowning.

DO NOT:
- do not leave any blonde, bleached, platinum, curly, wavy or permed hair anywhere in the picture, and no dark roots — his hair is uniformly dark and straight
- no lip piercing, no labret ring, no stud, no facial piercing of any kind
- no hat, no cap, no headband, no earrings that were not in IMAGE 1
- do not restyle, recolour, resize or re-drape any garment; do not move the bag or the necklace; do not change the background
- no beauty filter, no skin smoothing that erases pores, no reshaping of his face toward the model's face
- no added smoke, mist, haze, glow, props or scenery
- no text, watermark, logo or caption anywhere

The result is a real photograph from the same studio session: sharp, natural skin, individual hair strands, a natural contact shadow where the hair meets the collar.`;

const JOBS = [
  {
    id: "model-1",
    glasses: `They are a wide, low, flat-topped black shield/wraparound: the frame's total height is only about a third of its total width, the top edge runs almost straight across, and the outer corners dip slightly downward. The frame is no wider than his face at cheekbone level.`,
    src: path.join(SCRATCH, "m1_crop.png"),
    pose: `POSE OF THE HEAD IN IMAGE 1, to be matched exactly: the head is tilted forward and DOWN with the chin tucked toward the chest, and turned a few degrees to the viewer's left. The face is angled downward, so the forehead is foremost and the underside of the jaw is foreshortened; the gaze goes down. The sunglasses are a wide black shield/wraparound style sitting low across the eyes, with the fringe falling over their top edge.`,
  },
  {
    id: "model-2",
    glasses: `They are narrow rectangular wraparound sport shades with a slight cat-eye upsweep at the outer corners: the frame's total height is a little over a third of its total width, and its width is about the same as his face at cheekbone level — the outer corners sit at the edge of the cheekbones, not beyond them.`,
    src: path.join(SCRATCH, "m2_crop.png"),
    pose: `POSE OF THE HEAD IN IMAGE 1, to be matched exactly: the head faces the camera almost square-on and level, with the chin dipped very slightly so the gaze comes from just under the brow, and only a slight turn to the viewer's left. The sunglasses are narrow black rectangular wraparound sport shades sitting straight across the eyes.`,
  },
];

async function gen(job, variant, attempt = 1) {
  const parts = [
    { inlineData: { mimeType: "image/png", data: fs.readFileSync(job.src).toString("base64") } },
    { inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(REF).toString("base64") } },
    { inlineData: { mimeType: "image/png", data: fs.readFileSync(SG[job.id]).toString("base64") } },
    { text: COMMON.replace("{GLASSES}", job.glasses) + "\n\n" + job.pose },
  ];
  try {
    const resp = await gemini.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts }],
      config: { responseModalities: ["IMAGE", "TEXT"], imageConfig: { aspectRatio: "1:1", imageSize: "2K" } },
    });
    const cand = resp.candidates?.[0]?.content?.parts || [];
    const img = cand.find((p) => p.inlineData?.data);
    if (!img) throw new Error(cand.map((p) => p.text).filter(Boolean).join(" ") || String(resp.candidates?.[0]?.finishReason));
    const file = path.join(OUT, `${job.id}-w${variant}.png`);
    fs.writeFileSync(file, Buffer.from(img.inlineData.data, "base64"));
    console.log("wrote", path.basename(file));
    return file;
  } catch (e) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 4000 * attempt));
      return gen(job, variant, attempt + 1);
    }
    throw new Error(`${job.id} v${variant}: ${e.message}`);
  }
}

(async () => {
  const N = Number(process.argv[2] || 3);
  const tasks = [];
  for (const job of JOBS) for (let v = 1; v <= N; v++) tasks.push({ job, v });
  const results = await Promise.allSettled(tasks.map((t) => gen(t.job, t.v)));
  results.forEach((r) => { if (r.status === "rejected") console.error("FAILED", r.reason.message); });
})();
