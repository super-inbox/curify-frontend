/**
 * Thin-team enrichment for 8 WC 2026 teams that had no-click queries
 * (czechia, cabo verde, curaçao, dr congo, iraq, senegal, south africa,
 * croatia) but only 1-4 existing cards each, ALL squad-poster-style.
 *
 * Generates a "team jersey + hero player + storyline" poster per team
 * via the existing template-vintage-football-jersey-intro-watercolor-poster
 * style (single-team artistic, distinct visual archetype from the
 * existing Hollywood-cast squad poster).
 *
 * Output: raw/wc-thin-teams-test/<slug>-jersey.jpg
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

const OUTDIR = path.join(process.cwd(), "raw/wc-thin-teams-test");
fs.mkdirSync(OUTDIR, { recursive: true });

const TEAMS = [
  {
    slug: "czechia",
    teamEn: "Czechia", teamNative: "Česká republika",
    star: "Patrik Schick", starClub: "Bayer Leverkusen",
    kitColors: "red and white horizontal stripe home kit with blue accents",
    bg: "deep crimson red base with Prague castle Charles Bridge silhouette, faint Bohemian crown motif, white pinstripe speed lines, blue accent stripes",
    storyline: "Group A · Beat South Korea 1-0 · Drew Mexico 0-0 · Lost to South Africa 0-2 · Eliminated in group stage on goal difference",
    nativeWord: "Češi", flavor: "Lion of Bohemia",
  },
  {
    slug: "south-africa",
    teamEn: "South Africa", teamNative: "Bafana Bafana",
    star: "Lyle Foster", starClub: "Burnley",
    kitColors: "yellow-and-green home kit with white accents",
    bg: "vivid green-and-gold radial gradient, faint Table Mountain silhouette, springbok line-art accent, golden African sun motif",
    storyline: "Group A · Recovered from opener loss to Mexico · Drew Czechia · Beat South Korea · Through to R32 vs Canada",
    nativeWord: "Bafana", flavor: "Bafana Bafana's first knockout berth",
  },
  {
    slug: "croatia",
    teamEn: "Croatia", teamNative: "Vatreni",
    star: "Luka Modrić", starClub: "AC Milan",
    kitColors: "red-and-white checkered home kit",
    bg: "red-and-white checkerboard motif, faint Dubrovnik old town walls silhouette, sea-blue accent waves",
    storyline: "Group L · Lost opener to England 0-1 · Drew Panama · Tight third match · Group-stage exit by GD",
    nativeWord: "Vatreni", flavor: "The Blazers · 2018 finalist legacy",
  },
  {
    slug: "senegal",
    teamEn: "Senegal", teamNative: "Lions of Teranga",
    star: "Sadio Mané", starClub: "Al Nassr",
    kitColors: "green-and-white home kit with red details",
    bg: "deep emerald green base with golden lion silhouette, baobab tree motif, faint Dakar coastline silhouette",
    storyline: "Group I · Lost to France 1-3 · Beat Senegal-fancy opener · Knocked out narrowly · Carrying African continent hopes",
    nativeWord: "Teranga", flavor: "Lions of Teranga",
  },
  {
    slug: "iraq",
    teamEn: "Iraq", teamNative: "Lions of Mesopotamia",
    star: "Aymen Hussein", starClub: "Al-Quwa Al-Jawiya",
    kitColors: "all-white home kit with green-red trim",
    bg: "deep emerald green and red base, faint Babylon Ishtar gate silhouette, cedar tree motif, sand-colored speed lines",
    storyline: "Group I · Lost to Norway 1-4 · Tight loss to Senegal · Historic WC return after decades",
    nativeWord: "أسود الرافدين", flavor: "Lions of Mesopotamia",
  },
  {
    slug: "dr-congo",
    teamEn: "DR Congo", teamNative: "Léopards",
    star: "Cédric Bakambu", starClub: "Real Betis",
    kitColors: "sky-blue home kit with yellow-red accents",
    bg: "sky-blue base with faint Congo River silhouette, leopard line-art accent, yellow-and-red sash motif",
    storyline: "Group K · Lost to Portugal 0-2 · Tight game vs Uzbekistan · Drew Colombia · Group-stage exit narrowly",
    nativeWord: "Léopards", flavor: "Léopards return to WC for first time since 1974",
  },
  {
    slug: "cabo-verde",
    teamEn: "Cabo Verde", teamNative: "Tubarões Azuis",
    star: "Bebé", starClub: "Rayo Vallecano",
    kitColors: "deep-blue home kit with white-and-red sash",
    bg: "deep ocean-blue base with faint Pico do Fogo volcano silhouette, blue shark line-art accent, white island-arc speed lines",
    storyline: "Group H · WC debut · Lost to Spain 0-3 · Drew Uruguay · Faced Saudi Arabia · Historic first knockout berth narrowly missed",
    nativeWord: "Tubarões Azuis", flavor: "Blue Sharks — first-ever World Cup",
  },
  {
    slug: "curacao",
    teamEn: "Curaçao", teamNative: "Naam",
    star: "Leandro Bacuna", starClub: "Watford",
    kitColors: "blue-and-yellow home kit with white accents",
    bg: "Caribbean turquoise gradient, faint Willemstad colorful colonial buildings silhouette, palm tree line-art accent, yellow-star Curaçao flag motif (subtle, not literal)",
    storyline: "Group E · WC debut · Lost to Germany 0-3 · Lost to Ecuador · Through group stage as giant-killers narrative",
    nativeWord: "Kòrsou", flavor: "Tiny island, big debut — smallest nation ever at a WC",
  },
];

function buildPrompt(t) {
  return `Generate a single vertical 8K WORLD CUP TEAM IDENTITY POSTER for ${t.teamEn} (${t.teamNative}) at the FIFA World Cup 2026. Aesthetic: bold cinematic editorial sports poster — magazine-cover quality, stylized illustration, NOT photorealistic faces.

VERTICAL 3:4 portrait, two zones:

═══ ZONE 1 — TOP 70% — TEAM IDENTITY VISUAL ═══
- Background: ${t.bg}. NO literal flag-tearing or militaristic motifs.

- CENTER: stylized full-body figure of ${t.star} of ${t.teamEn}, knee-up framing, in the ${t.kitColors}. Confident hero pose: ball at his feet, looking into the camera with fierce focus. Stylized cartoon-realistic illustration (Marvel-poster / FIFA-Ultimate-Team key-art style). Recognizable hair, skin tone faithfully rendered, but NOT photoreal. Sweat highlights and motion lines behind him.

- HEADER STRIP across the top: gold-on-navy thin bar reading "FIFA WORLD CUP 2026" with a small trophy icon.

- LARGE COUNTRY WORDMARK: at the bottom of zone 1, the team name in massive bold sans-serif — "${t.teamEn.toUpperCase()}" — in the kit's primary color, with the native nickname "${t.teamNative}" as a smaller subtitle below.

- TAGLINE in italic gold serif, sitting under the wordmark: "${t.flavor}".

- SMALL: player nameplate strip under the figure with "${t.star.toUpperCase()}  ·  ${t.starClub}".

═══ ZONE 2 — BOTTOM 30% — LIGHT INFO STRIP ═══
Cream background. Two columns separated by a thin gold vertical line.

LEFT COLUMN — "WC 2026 RECAP" (small gold caps header):
   📋 ${t.storyline}

RIGHT COLUMN — "TEAM AT A GLANCE" (small gold caps header):
   ⭐ Star Player: ${t.star} (${t.starClub})
   👕 Kit: ${t.kitColors}
   🦁 Nickname: ${t.teamNative}
   🌍 Country word: ${t.nativeWord}

Bottom-most footer strip in dark navy with tiny gold serif: "Generated for Curify · Tap any tile to remix"

DESIGN CONSTRAINTS:
- Vertical 3:4 aspect ratio (poster portrait)
- Cinematic, high-contrast, magazine-cover quality
- All English text MUST be legible and correctly spelled (especially player names and native nicknames)
- Stylized illustration only — NO photorealistic faces (avoids uncanny-valley + likeness IP risk)
- Background DELIBERATELY avoids literal "torn flag" — use the descriptive visual vocabulary above (silhouettes, halftone motifs, motion lines, abstract gradient sweeps, national imagery)
- The top 70% must feel like a fight-poster you'd see at a stadium concourse, not a stats infographic
- The bottom 30% must feel LIGHT — short emoji-led lines, scannable at a glance, NOT a stats dump`;
}

async function renderOne(t) {
  const out = path.join(OUTDIR, `${t.slug}-jersey.jpg`);
  console.log(`\n→ ${t.slug}  (${t.teamEn})`);
  const t0 = Date.now();
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: buildPrompt(t),
    config: { responseModalities: [Modality.IMAGE] },
  });
  const parts = res?.candidates?.[0]?.content?.parts ?? [];
  let saved = 0;
  for (const part of parts) {
    if (part.inlineData?.data) {
      fs.writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
      saved++;
    } else if (part.text) {
      console.log(`   (text part): ${part.text.slice(0, 120)}`);
    }
  }
  console.log(`   ${saved ? "✓" : "✗"} ${out}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

(async () => {
  for (const t of TEAMS) {
    try { await renderOne(t); }
    catch (e) { console.error(`   render failed for ${t.slug}: ${e?.message || e}`); }
  }
  console.log("\nAll done.");
})().catch((err) => { console.error(err); process.exit(1); });
