/**
 * Match-pair v3 — fight-poster, parameterized over all 6 R32 fixtures.
 *
 * Per-country background vocabularies replace the literal flag-tearing
 * motif. v2 user feedback: Brazil side shouldn't look like a "torn /
 * militarized" flag; Japan side must avoid the rising-sun (旭日旗)
 * and use plain Hinomaru + sakura / origami / ripples / Fuji /
 * samurai-blue speed lines.
 *
 * Output: raw/wc-matchpair-test/03_<slug>.jpg
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

// Per-country background visual vocabulary. Designed to be unmistakable
// as the country WITHOUT literal flag-tearing motifs. Japan deliberately
// avoids the 旭日旗 (rising-sun) — sensitive imagery in East Asia.
const BG = {
  Brazil:       "abstract sports-poster background, deep yellow base with green halftone dots, faint silhouettes of Christ the Redeemer and a soccer pitch perspective, gold motion lines, NO literal Brazilian flag, NO torn-flag treatment, just bold magazine-cover graphic design",
  Japan:        "plain Hinomaru flag motif (white background, single red disc behind the player), accented with cherry blossom petals drifting, faint Mount Fuji silhouette at the horizon, blue-and-white geometric speed lines, origami crane shapes, samurai-blue gradient sweep, white kinetic motion lines, NO rising-sun rays",
  Canada:       "deep red base with white maple-leaf abstract patterns, faint hockey-rink line silhouettes (Canadian sports culture), CN Tower silhouette, white pinstripe speed lines, sports-poster aesthetic",
  "South Africa": "vivid green and gold radial gradient (Bafana Bafana colors), faint silhouettes of Table Mountain + a stylized springbok, golden African sun motif, bold yellow speed lines",
  Germany:      "black-red-gold tricolor abstract gradient (not literal flag), faint Brandenburg Gate silhouette, white geometric pinstripes, eagle iconography in line-art, modern minimal sports-magazine style",
  Paraguay:     "deep red and blue dual gradient with crisp white center band, faint silhouette of the Itaipú dam, jaguar line-art accent, white motion lines",
  Netherlands:  "vivid orange base with crisp navy + white accents (KNVB colors), faint silhouette of a Dutch windmill + tulip field, lion-rampant line-art accent, orange motion lines",
  Morocco:      "deep crimson red base with green five-pointed star center motif (national symbol), faint silhouette of Hassan II Mosque minaret + Atlas Mountains, golden Berber pattern overlay, sports-poster aesthetic",
  "Ivory Coast": "orange-white-green dual gradient (Les Éléphants colors), faint silhouette of a stylized elephant + Basilica of Our Lady of Peace, gold halftone dots, sports-magazine vibe",
  Norway:       "deep blue-and-red base with white Nordic cross accents (subtle, not literal flag), faint silhouette of fjord cliffs + Viking longship, white pinstripe speed lines",
  France:       "blue-white-red horizontal sweep (subtle Tricolore feel, not literal flag), faint Eiffel Tower silhouette + Gallic rooster line-art accent, gold motion lines",
  Sweden:       "blue-and-yellow Scandinavian color block (subtle, not literal flag), faint silhouette of a Stockholm skyline + Three Crowns motif, golden geometric speed lines",
};

// Match definitions — one entry per R32 fixture.
const MATCHES = [
  // (kept ordering matches lib/wc_2026_schedule.ts R32 block)
  {
    slug: "south-africa-vs-canada",
    teamA: "South Africa", teamB: "Canada",
    starA: { name: "Lyle Foster",    club: "Burnley · #11",     side: "left" },
    starB: { name: "Jonathan David", club: "Lille · #20",       side: "right" },
    starApose: "South Africa green-and-yellow striker kit, attacking shooting pose, ball mid-strike",
    starBpose: "Canada red home kit, attacking running pose, ball at feet",
    coachA: "Hugo Broos", coachB: "Jesse Marsch",
    stage: "ROUND OF 32",
    dateLine: "Sun, June 28 · 12:00 PM PT",
    venue: "SoFi Stadium, Inglewood, CA",
    odds: "DraftKings: CAN -140 · O/U 2.5",
    watch: [
      "🎯 Lyle Foster vs Jonathan David — striker duel for first-ever knockout goal",
      "🆕 Both nations' FIRST-EVER World Cup knockout match",
      "⚡ Alphonso Davies dynamism vs Bafana's pressing comeback story",
      "📈 H2H: ZERO previous meetings · Open historic ground",
    ],
  },
  {
    slug: "brazil-vs-japan",
    teamA: "Brazil", teamB: "Japan",
    starA: { name: "Vinícius Jr",    club: "Real Madrid · #10",   side: "left" },
    starB: { name: "Takefusa Kubo",  club: "Real Sociedad · #7",  side: "right" },
    starApose: "Brazil yellow home kit with green shorts, explosive attacking dribble, ball at his feet, leaning forward",
    starBpose: "Japan samurai-blue home kit, mirror attacking dribble, ball at feet, calm focus",
    coachA: "Carlo Ancelotti", coachB: "Hajime Moriyasu",
    stage: "ROUND OF 32",
    dateLine: "Mon, June 29 · 12:00 PM CT",
    venue: "NRG Stadium, Houston, TX",
    odds: "DraftKings: BRA -140 · O/U 2.5",
    watch: [
      "⚡ Vinícius vs Kubo — La Liga winger duel (Real Madrid vs Real Sociedad)",
      "🏆 Brazil hunts pentacampeões' first crown since 2002 — 24-year drought",
      "🌸 Japan back in knockouts — eyeing first-ever QF berth",
      "📈 H2H: BRA 11W · 1D · JPN 1W · last: BRA 1-0, 2022 friendly",
    ],
  },
  {
    slug: "germany-vs-paraguay",
    teamA: "Germany", teamB: "Paraguay",
    starA: { name: "Jamal Musiala",  club: "Bayern Munich · #10", side: "left" },
    starB: { name: "Miguel Almirón", club: "Atlanta United · #10", side: "right" },
    starApose: "Germany white home kit with black/red details, dribbling at high speed, ball at feet",
    starBpose: "Paraguay red-and-white striped home kit, attacking running pose, ball at feet",
    coachA: "Julian Nagelsmann", coachB: "Gustavo Alfaro",
    stage: "ROUND OF 32",
    dateLine: "Mon, June 29 · 4:30 PM ET",
    venue: "Gillette Stadium, Foxborough, MA",
    odds: "DraftKings: GER -280 · O/U 2.5",
    watch: [
      "🎯 Musiala-Wirtz-Havertz front three vs Paraguay's disciplined block",
      "⏪ 2002 callback: GER beat PAR 1-0 in R16 — Oliver Neuville 88'",
      "💪 Germany favorites at -280 despite shock 2-1 loss to Ecuador in group",
      "📈 Paraguay arrives off a 1-0 group win vs Türkiye, looking to upset",
    ],
  },
  {
    slug: "netherlands-vs-morocco",
    teamA: "Netherlands", teamB: "Morocco",
    starA: { name: "Cody Gakpo",     club: "Liverpool · #11",     side: "left" },
    starB: { name: "Achraf Hakimi",  club: "PSG · #2",            side: "right" },
    starApose: "Netherlands orange home kit, attacking running pose, ball at feet, leaning forward",
    starBpose: "Morocco red home kit, dynamic overlapping run pose, ball at feet",
    coachA: "Ronald Koeman", coachB: "Walid Regragui",
    stage: "ROUND OF 32",
    dateLine: "Mon, June 29 · 8:00 PM CT",
    venue: "Estadio BBVA, Guadalupe, MX",
    odds: "DraftKings: NED +115 · O/U 2.5",
    watch: [
      "⚡ Cody Gakpo vs Achraf Hakimi — winger meets PSG's marauding right-back",
      "🌟 Koeman publicly called Hakimi 'the star man' before the tie",
      "🇲🇦 Morocco unbeaten in group, level points with Brazil on GD",
      "📈 NED 10 goals in group · MAR finished Group C runner-up",
    ],
  },
  {
    slug: "ivory-coast-vs-norway",
    teamA: "Ivory Coast", teamB: "Norway",
    starA: { name: "Nicolas Pépé",     club: "Villarreal · #19",   side: "left" },
    starB: { name: "Erling Haaland",  club: "Man City · #9",      side: "right" },
    starApose: "Ivory Coast orange home kit, attacking dribble pose, ball at feet, leaning forward",
    starBpose: "Norway red home kit, powerful striker pose, ball mid-strike, shooting stance",
    coachA: "Emerse Faé", coachB: "Ståle Solbakken",
    stage: "ROUND OF 32",
    dateLine: "Tue, June 30 · 12:00 PM CT",
    venue: "AT&T Stadium, Arlington, TX",
    odds: "DraftKings: NOR +100 · O/U 2.5",
    watch: [
      "🎯 Pépé creator vs Haaland finisher — winger vs striker showdown",
      "💥 Haaland already 4 goals in group stage (vs Iraq, Senegal)",
      "🇨🇮 Les Éléphants' FIRST-EVER World Cup knockout berth",
      "📈 H2H: just 2 prior friendlies, both even · Open historical ground",
    ],
  },
  {
    slug: "france-vs-sweden",
    teamA: "France", teamB: "Sweden",
    starA: { name: "Kylian Mbappé",   club: "Real Madrid · #10",  side: "left" },
    starB: { name: "Viktor Gyökeres", club: "Arsenal · #9",       side: "right" },
    starApose: "France blue home kit, blazing-fast sprint pose, ball at feet, leaning forward",
    starBpose: "Sweden yellow home kit, powerful striker pose, ball mid-strike, shooting stance",
    coachA: "Didier Deschamps", coachB: "Jon Dahl Tomasson",
    stage: "ROUND OF 32",
    dateLine: "Tue, June 30 · 5:00 PM ET",
    venue: "MetLife Stadium, East Rutherford, NJ",
    odds: "DraftKings: FRA -330 · O/U 2.5",
    watch: [
      "⚡ Mbappé pace vs Gyökeres-Isak striker pairing — two of Europe's best",
      "🇫🇷 France perfect 9 pts in group (10 goals scored, 2 conceded)",
      "🇸🇪 Sweden qualified via playoffs · Gyökeres 4 playoff goals to seal berth",
      "📈 H2H since 2005: France 5W · Sweden 2W",
    ],
  },
];

function buildPrompt(m) {
  const bgA = BG[m.teamA] || "abstract sports-poster background";
  const bgB = BG[m.teamB] || "abstract sports-poster background";
  return `Generate a single vertical 8K knockout-matchup FIGHT POSTER for the FIFA World Cup 2026 ${m.stage} — ${m.teamA} vs ${m.teamB}. Aesthetic: bold cinematic boxing / UFC fight-card poster crossed with a modern football editorial cover. Magazine-quality artwork, NOT photorealistic faces (stylized illustration so player likeness is unmistakable without being uncanny).

VERTICAL LAYOUT, 3:4 portrait, two zones:

═══ ZONE 1 — TOP 70% — 1v1 BATTLE VISUAL ═══
- Vertical split-screen background. LEFT half background: ${bgA}. RIGHT half background: ${bgB}. Strong diagonal seam between the two halves, with a gold lightning crack down the center.

- LEFT PLAYER — ${m.starA.name} of ${m.teamA}. Full-body figure, knee-up framing. ${m.starApose}. Fierce focused expression looking toward the opponent. Stylized cartoon-realistic illustration in a Marvel-poster / FIFA-Ultimate-Team key-art rendering — strong jawline, recognizable hair and skin tone faithfully rendered, but NOT photoreal. Sweat highlights + motion lines behind him.

- RIGHT PLAYER — ${m.starB.name} of ${m.teamB}. Mirror full-body figure, knee-up framing. ${m.starBpose}. Focused expression looking toward the opponent. Same stylized rendering — recognizable hair and skin tone faithfully rendered, NOT photoreal.

- Between them, slightly above center: HUGE gold metallic "VS" letterform with two crossed gold soccer boots behind it. Strong glow + lens flare around the VS.

- Top header banner in thin gold-on-navy strip: "${m.stage}  ·  FIFA WORLD CUP 2026" with a tiny World Cup trophy icon.

- Player NAMES in bold sans-serif at the bottom of zone 1, centered under each figure:
   "${m.starA.name.toUpperCase()}"  (gold, left)   ·   "${m.starB.name.toUpperCase()}"  (silver-blue, right)
- Each name has a small subtitle: "${m.starA.club}" / "${m.starB.club}"

═══ ZONE 2 — BOTTOM 30% — LIGHT INFO STRIP ═══
- Cream background, two columns separated by a thin gold vertical line.

LEFT COLUMN — "MATCH BASICS" (small gold caps header):
   📅 ${m.dateLine}
   🏟️ ${m.venue}
   🆚 ${m.teamA} (${m.coachA}) vs ${m.teamB} (${m.coachB})
   📊 ${m.odds}

RIGHT COLUMN — "WHAT TO WATCH" (small gold caps header):
   ${m.watch.join("\n   ")}

Bottom-most footer strip in dark navy with tiny gold serif: "Generated for Curify · Tap any tile to remix"

DESIGN CONSTRAINTS:
- Vertical 3:4 aspect ratio (poster portrait)
- Cinematic, high-contrast, magazine-cover quality
- All English text MUST be legible and correctly spelled (especially player names with accents)
- Stylized illustration only — NO photorealistic faces (avoids uncanny-valley + likeness IP risk)
- The country backgrounds DELIBERATELY avoid literal "torn flag" or militaristic motifs — use the descriptive visual vocabulary above (silhouettes, halftone dots, motion lines, abstract gradient sweeps)
- The top 70% must feel like a fight-poster you'd see at a stadium concourse, not an infographic
- The bottom 30% must feel LIGHT — short emoji-led lines, scannable at a glance, NOT a stats dump
- No fake/garbled text, no fake stat numbers beyond the few authoritative ones above`;
}

async function renderOne(m) {
  const out = path.join(OUTDIR, `03_${m.slug}.jpg`);
  console.log(`\n→ ${m.slug}  (${m.teamA} vs ${m.teamB})`);
  const t0 = Date.now();
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: buildPrompt(m),
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
  for (const m of MATCHES) {
    try { await renderOne(m); }
    catch (e) { console.error(`   render failed for ${m.slug}: ${e?.message || e}`); }
  }
  console.log("\nAll done.");
})().catch((err) => { console.error(err); process.exit(1); });
