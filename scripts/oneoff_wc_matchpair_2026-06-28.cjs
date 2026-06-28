/**
 * One-off match-pair sample render — Brazil vs Japan (Round of 32, 2026-06-29).
 *
 * Goal: produce one concrete image so the user can eyeball whether the
 * proposed template-wc-knockout-matchup-poster format actually renders
 * the way the strawman ASCII suggests (split-screen crests + stats +
 * footer with date/venue/betting line).
 *
 * Output: raw/wc-matchpair-test/01_bra_v_jpn.jpg
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

const OUTDIR = path.join(process.cwd(), "raw/wc-matchpair-test");
fs.mkdirSync(OUTDIR, { recursive: true });

const PROMPT = `Generate a single vertical 8K knockout-matchup poster for FIFA World Cup 2026 Round of 32, with a premium clean sports-graphic design — cream background, gold + navy accents, bold geometric layout, no chaotic textures, designed to read at a glance.

VERTICAL LAYOUT, TOP TO BOTTOM, four sections:

═══ HEADER STRIP ═══
- Thin navy bar across the top
- Centered gold serif text reading: "ROUND OF 32  ·  2026 FIFA WORLD CUP"
- Sub-line in white sans-serif: "NRG Stadium, Houston, Texas  ·  June 29 · 12:00 PM CT"

═══ TEAM A — UPPER HALF (Brazil) ═══
- Large stylized Brazil national crest (yellow CBF shield with green diamond and stars) centered
- Below crest: "🇧🇷 BRAZIL" in massive bold gold sans-serif (huge, dominant)
- Subtitle in smaller white-on-navy bar: "Manager: Dorival Júnior  ·  Captain: Casemiro  ·  Formation: 4-2-3-1"
- One-line headline in gold italic: "Pentacampeões return"
- Three pictographic player silhouettes (no faces, just team-colored kit) — Vinicius, Rodrygo, Endrick

═══ DIVIDER ═══
- A bold centered "vs" set in a circle, gold-on-navy, with two crossed lightning bolts behind

═══ TEAM B — LOWER HALF (Japan, mirrored layout) ═══
- "JAPAN 🇯🇵" in massive bold sans-serif (samurai-blue color this time)
- Below: large stylized Japan JFA crest (rising-sun-and-three-legged-crow), centered
- Subtitle: "Manager: Hajime Moriyasu  ·  Captain: Wataru Endō  ·  Formation: 4-3-3"
- Headline in samurai-blue italic: "Samurai Blue, first knockout since 2018"
- Three pictographic Japan-blue player silhouettes — Mitoma, Kubo, Endō

═══ FOOTER STRIP — H2H + ODDS ═══
- Dark navy strip
- Left third: gold text "HEAD TO HEAD"
- Center: "13 matches  ·  BRA 11W  ·  1D  ·  JPN 1W"
- Right third: "DraftKings: BRA -140  ·  O/U 2.5"
- Tiny footer line in dim white: "Last meeting: BRA 1 - 0 JPN  ·  Jun 6, 2022 friendly"

DESIGN CONSTRAINTS:
- Vertical aspect ratio 3:4 (poster portrait)
- High-contrast, magazine-cover quality
- All text MUST be legible and English-only (no garbled / fake characters)
- No crowd photos, no realistic player faces (silhouettes only)
- Avoid drop-shadows, gradients, lens-flare — keep it modern flat geometric
- Color palette: cream background, BRA gold + green, JPN navy + samurai-blue, dark-navy footer
- Style reference: cross between vintage Penguin Books cover and modern sports broadcast lower-third`;

(async () => {
  console.log(`Calling ${MODEL} for the match-pair sample render...`);
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
      const out = path.join(OUTDIR, "01_brazil_vs_japan_matchpair.jpg");
      fs.writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
      console.log(`  wrote ${out}`);
      saved++;
    } else if (part.text) {
      console.log(`  (text part): ${part.text.slice(0, 200)}`);
    }
  }
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s. Saved ${saved} image(s).`);
})().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
