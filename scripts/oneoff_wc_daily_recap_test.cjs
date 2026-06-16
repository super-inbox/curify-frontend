/**
 * One-off Gemini fidelity test for the proposed WC Daily Recap template.
 * Generates 2 variations of the SAME data (June 14 → June 15 recap, lifted
 * from raw/world-cup-daily/daily matches..jpg) so we can eyeball whether
 * Gemini renders scores / scorer names / minutes / fixture times faithfully.
 *
 * If both come out clean: we promote this prompt to a real nano_template.
 * If text is garbled: pivot to HTML+CSS+Jinja2 renderer (same as
 * dev/jayw/event-card-generator/).
 *
 * Output: raw/world-cup-daily/test/01_*.jpg, 02_*.jpg
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI, Modality } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("❌ Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-3-pro-image-preview";

const OUTDIR = path.join(process.cwd(), "raw/world-cup-daily/test");
fs.mkdirSync(OUTDIR, { recursive: true });

const PROMPT = `Generate a single vertical 8K infographic poster titled "FIFA World Cup 2026 — Results & Today's Matches" with a clean modern sports-graphic design, white/cream background, gold + blue accents, and stylized cartoon player avatars where shown.

VERTICAL LAYOUT, TOP TO BOTTOM, six sections:

═══ HEADER ═══
- Top-left: gold World Cup trophy illustration; top-right: gold-trimmed soccer ball with motion confetti
- Centered bold serif title: "FIFA World Cup 2026"
- Subtitle smaller: "Results & Today's Matches"
- Calendar icon + date: "Monday, June 15, 2026"

═══ YESTERDAY: JUNE 14 RESULTS ═══
- Star-banner header reading: "★ Yesterday: June 14 Results ★" (gold gradient banner)
- 2x2 grid of FOUR match-result cards, each card showing:
  · "Group X" label above
  · Left round flag badge + country name
  · Big bold center score with white FT pill (e.g. "7 - 1 FT")
  · Right round flag badge + country name
  · Below each team name: tiny bullet list of goal scorers with minute markers (e.g. "Felix Nmecha 6'")

The four match cards, EXACTLY:

CARD 1 (top-left):
  Group E
  🇩🇪 GERMANY  7 - 1 FT  CURAÇAO 🇨🇼
  Germany scorers: Felix Nmecha 6', Nico Schlotterbeck 38', Kai Havertz 45+5' PK 88', Jamal Musiala 47', Nathaniel Brown 68', Deniz Unday 78'
  Curaçao scorers: Livano Comencenia 21'

CARD 2 (top-right):
  Group E
  🇨🇮 CÔTE D'IVOIRE  1 - 0 FT  ECUADOR 🇪🇨
  Côte d'Ivoire scorers: Amad Diallo 90'
  Ecuador scorers: (none)

CARD 3 (bottom-left):
  Group F
  🇳🇱 NETHERLANDS  2 - 2 FT  JAPAN 🇯🇵
  Netherlands scorers: Virgil van Dijk 50', Crysencio Summerville 64'
  Japan scorers: Keito Nakamura 57', Daichi Kamada 88'

CARD 4 (bottom-right):
  Group F
  🇸🇪 SWEDEN  5 - 1 FT  TUNISIA 🇹🇳
  Sweden scorers: Yasin Ayari 7' + 90+6', Alexander Isak 30', Viktor Gyökeres 60', Mattias Svanberg 84'
  Tunisia scorers: Omar Rekik 43'

═══ GOLDEN BOOT LEADERS ═══
- Yellow rounded box on left with: gold boot icon + "Golden Boot Leaders" label
- Three stylized cartoon player avatars (chibi-style, big sparkle eyes, jersey color matches country) side by side:
  · Folarin Balogun — flag 🇺🇸 United States — 2 goals
  · Kai Havertz — flag 🇩🇪 Germany — 2 goals
  · Yasin Ayari — flag 🇸🇪 Sweden — 2 goals
- Yellow box on right with: "Tournament Goals" label + huge number "38"

═══ TODAY: JUNE 15 MATCHES ═══
- Blue-banner header reading: "▶ Today: June 15 Matches"
- 4 FIXTURE CARDS stacked vertically, each card showing:
  · "Group X" label
  · Left flag + country, "VS" in middle, right flag + country
  · Venue line with 📍 icon: "Stadium Name — City, USA"
  · Multi-timezone time table with columns: Pacific | Mexico CT | Colombia | Eastern | UTC-3 | UK | Central Europe | Japan | East Aus | West Aus | Jun 15 | Jun 16
  · Big bold time on right (e.g. "12:00 ET")

The four fixture cards, EXACTLY:

CARD 1:
  Group H · 🇪🇸 SPAIN vs CABO VERDE 🇨🇻
  📍 Atlanta Stadium — Atlanta, USA
  Times: Pacific 09:00 | Mexico CT 10:00 | Colombia 11:00 | Eastern 12:00 | UTC-3 13:00 | UK 17:00 | Central Europe 18:00 | Japan 01:00 (Jun 16) | East Aus 02:00 (Jun 16) | West Aus 00:00 (Jun 16)
  Big time: 12:00 ET

CARD 2:
  Group G · 🇧🇪 BELGIUM vs EGYPT 🇪🇬
  📍 Seattle Stadium — Seattle, USA
  Times: Pacific 12:00 | Mexico CT 13:00 | Colombia 14:00 | Eastern 15:00 | UTC-3 16:00 | UK 20:00 | Central Europe 21:00 | Japan 04:00 (Jun 16) | East Aus 05:00 (Jun 16) | West Aus 03:00 (Jun 16)
  Big time: 12:00 PT

CARD 3:
  Group G · 🇸🇦 SAUDI ARABIA vs URUGUAY 🇺🇾
  📍 Miami Stadium — Miami, USA
  Times: Pacific 15:00 | Mexico CT 16:00 | Colombia 17:00 | Eastern 18:00 | UTC-3 19:00 | UK 23:00 | Central Europe 00:00 (Jun 16) | Japan 07:00 (Jun 16) | East Aus 08:00 (Jun 16) | West Aus 06:00 (Jun 16)
  Big time: 18:00 ET

CARD 4:
  Group H · 🇮🇷 IRAN vs NEW ZEALAND 🇳🇿
  📍 Los Angeles Stadium — Los Angeles, USA
  Times: Pacific 18:00 | Mexico CT 19:00 | Colombia 20:00 | Eastern 21:00 | UTC-3 22:00 | UK 02:00 (Jun 16) | Central Europe 03:00 (Jun 16) | Japan 10:00 (Jun 16) | East Aus 11:00 (Jun 16) | West Aus 09:00 (Jun 16)
  Big time: 18:00 PT

═══ FOOTER ═══
- Small note centered with clock icon: "Times marked Jun 16 occur on the next day locally."

CRITICAL RENDERING REQUIREMENTS:
- ALL scores, scorer names, minute markers (e.g. "45+5'", "90+6'"), and timezone numbers MUST be reproduced VERBATIM — no substitution, no approximation, no creative re-spelling
- Country names rendered in ALL CAPS where shown
- Round flag badges with thin gold ring; flags drawn accurately for the listed countries
- Cartoon avatars: chibi style, sparkly eyes, jersey color matches country
- Aspect ratio: 4:5 portrait, optimized for vertical infographic poster sharing
- Color palette: white/cream background, navy + gold accents, soft drop shadows
- Typography: bold serif for titles, clean sans-serif for data
- Print-quality vector-style infographic — sharp edges, no photoreal textures`;

async function gen(seed) {
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: PROMPT }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  const parts = res?.candidates?.[0]?.content?.parts || res?.parts || [];
  for (const p of parts) {
    if (p?.inlineData?.data) return Buffer.from(p.inlineData.data, "base64");
  }
  const txt = parts.map((p) => p.text || "").join("\n");
  throw new Error(`No image returned. Text: ${txt.slice(0, 200) || "[none]"}`);
}

async function main() {
  console.log(`=== oneoff_wc_daily_recap_test (model=${MODEL}) ===`);
  console.log(`  output: ${OUTDIR}\n`);
  for (let i = 1; i <= 2; i++) {
    const name = `${String(i).padStart(2, "0")}_wc_daily_recap_jun15_test.jpg`;
    process.stdout.write(`  [${name}] ... `);
    try {
      const buf = await gen(i);
      const out = path.join(OUTDIR, name);
      fs.writeFileSync(out, buf);
      console.log(`✓ ${buf.length.toLocaleString()} bytes → ${path.relative(process.cwd(), out)}`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }
}
main();
