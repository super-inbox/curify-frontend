/**
 * Match-pair v2 — fight-poster redesign.
 *
 * v1 was too infographic-heavy. v2: 1v1 battle visual dominates the top
 * (Vinícius Jr vs Takefusa Kubo, the actual headline winger duel — Mitoma
 * is OUT injured, hamstring tear), with a light info strip below (basics
 * + what-to-watch). Web-verified squad facts:
 *   - BRA: Vini Jr (Real Madrid, '24 Ballon d'Or runner-up), Marquinhos C,
 *          coach Ancelotti, chasing 24-year drought since 2002.
 *   - JPN: Mitoma + Endō both OUT injured; Itakura captain; Takefusa Kubo
 *          (Real Sociedad) carries the attack.
 *
 * Output: raw/wc-matchpair-test/02_bra_v_jpn_fightposter.jpg
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

const PROMPT = `Generate a single vertical 8K knockout-matchup FIGHT POSTER for the FIFA World Cup 2026 Round of 32 — Brazil vs Japan. Aesthetic: bold, cinematic boxing / UFC fight-card poster crossed with a modern football editorial cover. Magazine-quality artwork, NOT photorealistic faces (stylized illustration so player likeness is unmistakable without being uncanny).

VERTICAL LAYOUT, 3:4 portrait, two zones:

═══ ZONE 1 — TOP 70% — 1v1 BATTLE VISUAL ═══
- Vertical split-screen background. LEFT half is rich Brazil yellow with a subtle green-gradient haze and a faint Brazilian flag motif. RIGHT half is crisp Japanese white with a dramatic red sun behind the player. Strong diagonal line where they meet, with a sharp gold lightning crack down the center.
- LEFT PLAYER — Vinícius Júnior of Brazil. Full-body figure, knee-up framing, wearing the yellow Brazil home jersey with #10 (or #7) and green shorts. Dynamic attacking pose: ball at his feet, leaning forward as if exploding into a dribble, fierce focused expression looking right (toward Kubo / camera). Stylized cartoon-realistic illustration in a Marvel-poster / FIFA-Ultimate-Team-style key art rendering — strong jawline, recognizable hair, dark skin tone faithfully rendered. Sweat highlights + motion lines behind him.
- RIGHT PLAYER — Takefusa Kubo of Japan. Mirror full-body figure, knee-up framing, in the samurai-blue Japan home jersey with #7. Mirror attacking pose: ball at his feet, leaning forward, calm focused expression looking left (toward Vinícius / camera). Same stylized rendering — short black hair, light skin tone faithfully rendered, recognizable but not photoreal.
- Between them, slightly above center: a HUGE gold metallic "VS" letterform with two crossed gold soccer boots behind it. Glow + lens flare around the VS.
- Top header banner in thin gold-on-navy strip: "ROUND OF 32  ·  FIFA WORLD CUP 2026" with a tiny World Cup trophy icon
- Player NAMES in bold sans-serif at the bottom of zone 1, centered under each figure:
   "VINÍCIUS JR"  (gold, left)   ·   "TAKEFUSA KUBO"  (silver-blue, right)
- Each name has a small subtitle: "Real Madrid · #10" / "Real Sociedad · #7"

═══ ZONE 2 — BOTTOM 30% — LIGHT INFO STRIP ═══
- Cream background, two columns separated by a thin gold vertical line.

LEFT COLUMN — "MATCH BASICS" (small gold caps header):
   📅 Mon, June 29 · 12:00 PM CT
   🏟️ NRG Stadium, Houston, TX
   🆚 Brazil (Ancelotti) vs Japan (Moriyasu)
   📊 DraftKings: BRA -140 · O/U 2.5

RIGHT COLUMN — "WHAT TO WATCH" (small gold caps header):
   ⚡ Vinícius vs Kubo — La Liga winger duel (Real Madrid vs Real Sociedad)
   🏆 Brazil hunts the pentacampeões' first crown since 2002 — 24-year drought
   🌸 Japan in knockouts again after 2022 — eyeing first-ever QF berth
   📈 H2H: BRA 11W · 1D · JPN 1W (last: BRA 1-0, 2022 friendly)

Bottom-most footer strip in dark navy with tiny gold serif: "Generated for Curify · Tap any tile to remix"

DESIGN CONSTRAINTS:
- Vertical 3:4 aspect ratio (poster portrait)
- Cinematic, high-contrast, magazine-cover quality
- All English text MUST be legible and correctly spelled (especially player names "VINÍCIUS JR" with the accent and "TAKEFUSA KUBO")
- Stylized illustration only — NO photorealistic faces (avoids uncanny-valley + likeness IP risk)
- Bold, confident color palette: BRA yellow + green + gold, JPN white + red + samurai-blue, gold "VS" letterform
- The top 70% must feel like a fight-poster you'd see at a stadium concourse, not an infographic
- The bottom 30% must feel LIGHT — short lines, emoji-led, scannable at a glance — NOT a stats dump
- No fake/garbled text, no fake stat numbers beyond the few authoritative ones above`;

(async () => {
  console.log(`Calling ${MODEL} for match-pair v2 (fight-poster)...`);
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
      const out = path.join(OUTDIR, "02_brazil_vs_japan_fightposter.jpg");
      fs.writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
      console.log(`  wrote ${out}`);
      saved++;
    } else if (part.text) {
      console.log(`  (text part): ${part.text.slice(0, 200)}`);
    }
  }
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s. Saved ${saved} image(s).`);
})().catch((err) => { console.error("Render failed:", err); process.exit(1); });
