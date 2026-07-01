/**
 * WC 2026 emotional-moment tribute posters — 6 nations × 6 emotions,
 * Curify-generated (no copyrighted match photos).
 *
 * Aesthetic: illustrated editorial (same lineage as the Japan Snoopy
 * tribute) — semi-realistic painting, symbolic backdrop, kit-clad
 * hero figure, baked-in bilingual caption using the country's native
 * script + English.
 *
 * Model: gemini-3-pro-image-preview (CJK / Arabic / accented Latin
 * mix — flash mangles the non-Latin scripts).
 *
 * Outputs under raw/wc-emotions/.
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI, Modality } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-3-pro-image-preview";

const OUTDIR = path.join(process.cwd(), "raw/wc-emotions");
fs.mkdirSync(OUTDIR, { recursive: true });

const STYLE_COMMON = `
STYLE
- Illustrated editorial poster, painterly semi-realistic. Warm cinematic lighting.
- Portrait 4:5. Balanced composition, focal figure in the lower-third foreground.
- NO photograph realism (this is an illustration, not a fake photo).
- Backdrop symbolic + evocative (national landmark, sky mood, cultural signal).
- The World Cup trophy should appear subtly somewhere in the composition (background, silhouette, or emblem) unless the emotion calls for its absence.
- Small "Curify" wordmark in the bottom-right corner, muted, understated.

CAPTION
- Two lines of text, tightly stacked in the lower area over the field / pavement / negative space, NOT covering the hero figure's face.
- Top line: the native-language caption, larger, in bold or semi-bold with a thin dark outline for legibility.
- Bottom line: the English translation, smaller, in a lighter serif or clean sans-serif with a thin outline.
- Use the EXACT characters given — no transliteration, no substitution, no extra punctuation.

CONSTRAINTS
- No cartoon mascots. No sponsor logos. No real player faces (evocative silhouette or generic build is fine).
- Do not add extra text beyond the two caption lines and the Curify watermark.

Output the final poster directly.`;

const VERSIONS = [
  {
    name: "01_argentina_joy",
    out: "01_argentina_joy.jpg",
    scene: `Argentina — euphoria. A lone player in the sky-blue-and-white Argentina #10 kit stands mid-pitch with both arms raised to the sky, mouth open in a triumphant roar. Streaks of golden confetti falling. Behind him: the warm evening light of a packed Buenos Aires stadium in soft focus, La Bombonera-style stands visible. World Cup trophy silhouetted in the upper-right sky, glowing faintly. Palette: sky blue, ivory white, warm gold, sunset amber.`,
    caption_native: "Otra vez, capitán.",
    caption_english: "Once more, captain.",
  },
  {
    name: "02_portugal_heartbreak",
    out: "02_portugal_heartbreak.jpg",
    scene: `Portugal — heartbreak. A tall player in a red Portugal jersey kneels alone on the center circle, head bowed, one hand covering his eyes. Empty stadium seats blurred in the background. A single tear catches the floodlight. The World Cup trophy visible in the far distance, out of reach, unlit. Palette: deep crimson, forest green, charcoal shadow, cold stadium white-blue lighting.`,
    caption_native: "Uma última dança que ficou por dançar.",
    caption_english: "One last dance we never got to dance.",
  },
  {
    name: "03_cabo_verde_disbelief",
    out: "03_cabo_verde_disbelief.jpg",
    scene: `Cabo Verde — disbelief and joy. A young player in the blue Cabo Verde kit stands wide-eyed, hands on his head in shock, mouth open in a laughing gasp. Two teammates rushing in from the sides to embrace him. In the upper-left corner, a small scoreboard reads "ESP 0 — 0 CPV" in soft glow. The African island silhouette faint in the distant sea horizon backdrop. Palette: ocean blue, coral orange, warm white, tropical light.`,
    caption_native: "Zero a zero. Contra os campeões da Europa.",
    caption_english: "Zero-zero. Against the champions of Europe.",
  },
  {
    name: "04_norway_pride",
    out: "04_norway_pride.jpg",
    scene: `Norway — collective pride. A row of players in red Norway kits stand shoulder-to-shoulder with arms interlocked in the classic Viking Row salute, facing away from camera. Behind them: aurora borealis rippling green and violet across a night sky over fjord silhouettes. Stadium lights on the horizon. World Cup trophy faint in the aurora. Palette: deep navy, aurora green, blood red, silver moonlight.`,
    caption_native: "Vi er tilbake.",
    caption_english: "We're back.",
  },
  {
    name: "05_turkey_ecstasy",
    out: "05_turkey_ecstasy.jpg",
    scene: `Turkey — ecstatic crowd. A packed sea of red-and-white Turkey fans erupting in celebration, one child riding on a parent's shoulders waving a Turkish flag. Red flare smoke rising. Behind the crowd: the Bosphorus at dusk, silhouettes of Istanbul minarets and the bridge. Warm crescent moon rising. World Cup trophy reflected in the water. Palette: crimson red, ivory, deep Bosphorus blue, warm street-light amber.`,
    caption_native: "Bir milletin sesi.",
    caption_english: "One nation's roar.",
  },
  {
    name: "06_morocco_resolve",
    out: "06_morocco_resolve.jpg",
    scene: `Morocco — quiet resolve. A solitary player in a red Morocco kit walks slowly off the pitch, back to the camera, head high. Atlas mountains silhouetted behind the stadium against a starry desert night sky. Moonlight rakes across the pitch. The World Cup trophy appears as a distant star in the constellation above the mountains. Palette: crimson, sand-tan, deep indigo night, silver moonlight.`,
    caption_native: "لا نتنازل.",
    caption_english: "We don't fold.",
  },
];

function buildPrompt(v) {
  return `(WC 2026 Emotional Tribute Poster Designer) You are a senior illustrated-editorial poster artist. Create a portrait 4:5 illustrated tribute poster capturing a single national football team's emotional moment from the 2026 FIFA World Cup.

SCENE
${v.scene}

${STYLE_COMMON}

CAPTION TEXT (verbatim)
- Native line: "${v.caption_native}"
- English line: "${v.caption_english}"`;
}

(async () => {
  for (const v of VERSIONS) {
    const outPath = path.join(OUTDIR, v.out);
    console.log(`\n=== ${v.name} → ${v.out} ===`);
    console.log(`Calling ${MODEL}...`);
    const t0 = Date.now();
    try {
      const res = await gemini.models.generateContent({
        model: MODEL,
        contents: buildPrompt(v),
        config: { responseModalities: [Modality.IMAGE] },
      });
      const parts = res?.candidates?.[0]?.content?.parts ?? [];
      let saved = 0;
      for (const part of parts) {
        if (part?.inlineData?.data) {
          fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
          console.log(`  ✓ ${outPath}`);
          saved++;
        } else if (part?.text) {
          console.log(`  (text): ${part.text.slice(0, 200)}`);
        }
      }
      console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s, saved ${saved}`);
    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
    }
  }
})().catch((err) => { console.error("Batch failed:", err); process.exit(1); });
