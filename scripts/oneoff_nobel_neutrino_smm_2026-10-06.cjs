/**
 * 2026 诺贝尔物理学奖 · 中微子 / 冰立方 card set — second drop of the
 * education smm_daily RedNote series (「反常识科普」).
 *
 * Source of truth for every fact on these cards:
 *   raw/诺奖中微子-smm-10-06/source_xinzhiyuan.txt
 *   (新智元, 2026-10-06, https://mp.weixin.qq.com/s/7h8-McqGIAUxqN1CmcMGgg,
 *    which cites the nobelprize.org 2026 physics press release)
 *
 * One deliberate deviation from the article: it says 650亿 neutrinos pass
 * through your fingernail "此刻". The standard figure is ~6.5×10^10 per cm² per
 * SECOND, so the cards say 每秒. Without "per second" the number is meaningless.
 *
 * Same structure as oneoff_rove_beetle_smm_2026-09-21.cjs: each card reuses a
 * shipped nano template's base_prompt verbatim with its parameter filled, then
 * appends a FACTS block and a GUARD block. The template page is the landing page.
 *
 * Halzen is a real living person, so no card renders his face — the cards are
 * about the neutrino and the detector, which is also where the reverse-trivia is.
 *
 * Requires GEMINI_API_KEY in .env.local.
 * Usage: node scripts/oneoff_nobel_neutrino_smm_2026-10-06.cjs [--only 3]
 */
try { require("dotenv").config({ path: ".env.local" }); } catch {}
const fs = require("fs");
const path = require("path");
const { GoogleGenAI, Modality } = require("@google/genai");

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("❌ Missing GEMINI_API_KEY in .env.local"); process.exit(1); }
const MODEL = process.env.MODEL || "gemini-3-pro-image-preview";
const gemini = new GoogleGenAI({ apiKey: KEY });

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "raw", "诺奖中微子-smm-10-06", "out");
const TEMPLATES = path.join(ROOT, "public", "data", "nano_templates.json");

// ── facts, straight off the article ──────────────────────────────────────────
const F_GHOST = `
- 中微子：不带电，质量几乎为零，几乎不与任何物质发生作用，被称为「宇宙幽灵」。
- 每秒约有 650 亿个来自太阳的中微子穿过你的指甲盖，你完全感觉不到。
- 它走绝对直线：不受磁场影响，也不会被尘埃云挡住。
- 宇宙射线会被磁场带偏，伽马射线会被尘埃挡住，只有中微子能直线飞到地球。
- 所以它是宇宙最完美的「信使」，能把黑洞附近发生的事直接带到地球。`;

const F_ICECUBE = `
- 名称：冰立方中微子天文台 IceCube Neutrino Observatory，位于南极点。
- 体积：一立方公里的南极纯冰，约十亿吨。
- 线缆：86 根，竖直沉入用高压热水钻融出的深井，井深两公里多。
- 传感器：5160 个球形光学传感器，挂在线缆上，被称作「逆向运作的灯泡」——接收光而不是发光。
- 探测深度：冰下 1450 米至 2450 米，线缆排成六边形阵列。
- 冰面上有冰立方实验室，冰下信号汇总到这里，再经卫星传出。
- 2011 年竣工。`;

// Round 1 rendered this card with full sentences and garbled a dozen glyphs
// (啨尔岑, 南椒, 中徽子, 鋯到). Each milestone is now one short line.
const F_TIMELINE = `
1988：提出在南极冰下建中微子天文台
1993：深冰实验起步，1400 米以下的冰纯净透明
2004：冰立方开工
2011：86 根线缆全部就位，冰立方建成
2013：首次确认来自太阳系外的高能中微子
2017：一个中微子指向耀变体 TXS 0506+056
2022：活跃星系 NGC 1068 方向找到 79 个中微子
2023：第一次在中微子里看到银河系
2026：诺贝尔物理学奖，一人独得`;

const F_DETECT = `
六个分区，按顺序，每区一句：
1. 出发：黑洞附近的极端事件产生高能中微子，直线飞越数亿光年。
2. 穿行：绝大多数中微子直接穿过地球和探测器，什么也不碰。
3. 相撞：极少数中微子一头撞上南极冰里的原子核。
4. 闪光：撞出的带电粒子（如缪子）在冰中跑得比光在冰中还快，发出幽幽蓝光——切伦科夫辐射。
5. 记录：冰下 5160 个光学传感器抓拍这道蓝光，转成电信号传回冰面。
6. 反推：根据蓝光的时间和位置，反推出中微子从哪个方向飞来。`;

const GUARD = `

STRICT ACCURACY REQUIREMENTS:
- Use ONLY the facts supplied above. Do NOT invent numbers, dates, energies, names or statistics.
- ABSOLUTELY NO pie charts, bar charts, graphs or percentages. No quantitative series was supplied, so any chart would be fabricated. Use illustrations, icons and text blocks only.
- Do NOT draw any real person's face or portrait. No photograph or likeness of any scientist.
- Do NOT include any phone number, company name, logo, QR code or watermark text.
- Neutrinos are invisible particles: draw them as small glowing dots or light streaks travelling in straight lines, never as creatures with faces on a science-accuracy card unless the template is explicitly cartoon-style.
- The IceCube detector is a cubic kilometre of ice deep BELOW the surface at the South Pole. Strings hang vertically. The only thing on the surface is a small laboratory building.

CHINESE TEXT QUALITY:
- Use MAINLAND SIMPLIFIED Chinese glyph forms ONLY. No Japanese shinjitai forms, no traditional forms, no rare variants.
- Every character must be a real, correctly-formed character that belongs in its word. Do not substitute a similar-looking or same-sounding character: 中微子 not 中徽子, 冰立方 not 冰立万, 传感器 not 传感噐, 切伦科夫 not 切仑科夫.
- Copy each sentence from the facts above EXACTLY. Do not paraphrase, do not add a trailing clause, do not duplicate a character at the end of a line.
- Keep units exactly as given: PeV, TeV, 米, 公里, 亿. Never convert them.
- These meta-instructions are for you, not for the reader. Never render any of this instruction text onto the image itself.
- Prefer FEWER words rendered correctly over more words rendered badly. If a block would be crowded, drop a whole sentence, never mangle one.`;

// ── the four cards ───────────────────────────────────────────────────────────
const CARDS = [
  {
    n: 1,
    file: "01_ghost_through_fingernail",
    template: "template-weird-cold-knowledge-popular-science-card",
    param: "science_topic",
    value: "每秒有 650 亿个中微子穿过你的指甲盖",
    beat: "cover — the reverse-trivia hook: you are being passed through right now",
    override: "IMPORTANT OVERRIDE: all card text must be in Simplified Chinese. Do not add any badge or label above the title. Background theme: deep space and starlight. The central illustration is a human hand with glowing neutrino streaks passing straight through the fingernail.",
    facts: `${F_GHOST}\n\n标题就是：每秒有 650 亿个中微子穿过你的指甲盖。\n底部补一句：2026 年诺贝尔物理学奖，就颁给了抓住它的人。`,
  },
  {
    n: 2,
    file: "02_icecube_structure",
    template: "template-bilingual-object-structure-labeling",
    param: "object_name",
    value: "IceCube Neutrino Observatory 冰立方中微子天文台",
    beat: "the detector itself — biggest telescope on Earth, pointing into the ice",
    override: "IMPORTANT OVERRIDE: show a photorealistic CUTAWAY cross-section of the Antarctic ice sheet: a small lab building on the snow surface, and far below it a cubic kilometre volume of clear dark-blue ice threaded with vertical cables carrying spherical sensors in a hexagonal grid. A thin scale bar on the side marks 1450 米 and 2450 米 depth. Render ONLY a title line (冰立方中微子天文台 IceCube Neutrino Observatory) and the labels listed below; the facts are context for the picture, do NOT render them as a paragraph block.",
    facts: `${F_ICECUBE}\n\n请标注的关键部位（拼音 + 英文 + 中文）：冰立方实验室 bīng lì fāng shí yàn shì IceCube Lab（冰面上）、线缆 xiàn lǎn String（共 86 根）、光学传感器 guāng xué chuán gǎn qì（注意 guāng 是第一声） Optical Sensor（共 5160 个）、探测区 tàn cè qū Detector Volume（一立方公里纯冰）、南极冰盖 nán jí bīng gài Antarctic Ice Sheet（只标一次，指向冰体侧面）、深度 1450 米—2450 米。`,
  },
  {
    n: 3,
    file: "03_crazy_idea_to_nobel",
    template: "template-history-timeline-infographic",
    param: "timeline_topic",
    value: "从疯狂构想到诺贝尔奖：冰立方 38 年",
    beat: "the story — 1988 idea → 2026 prize",
    override: "IMPORTANT OVERRIDE: all card text must be in Simplified Chinese. Replace the English title suffix with the Chinese title only. Themed aesthetic: polar night, ice blue and aurora tones. Each milestone shows the year large and the one-line event beside it, nothing more. Copy each line exactly.",
    facts: F_TIMELINE,
  },
  {
    n: 4,
    file: "04_how_to_catch_a_ghost",
    template: "template-science-education-infographic",
    param: "topic",
    value: "一个中微子是怎么被「抓」到的",
    beat: "the mechanism — six steps from black hole to blue flash",
    override: "IMPORTANT OVERRIDE: all card text must be in Simplified Chinese — no English words anywhere, not even sound effects or labels. Skip the watermark at top left. Put the title 一个中微子是怎么被「抓」到的 large at the very top. Number the six sections 1 to 6 exactly as given.",
    facts: F_DETECT,
  },
];

// ── run ──────────────────────────────────────────────────────────────────────
function basePrompt(templates, id) {
  const t = templates.find((x) => x.id === id);
  if (!t) throw new Error(`template ${id} not found in nano_templates.json`);
  const loc = t.locales.en || Object.values(t.locales)[0];
  if (!loc?.base_prompt) throw new Error(`template ${id} has no base_prompt`);
  if (t.allow_generation !== true) throw new Error(`template ${id} is not generation-enabled`);
  return loc.base_prompt;
}

function buildPrompt(templates, card) {
  const filled = basePrompt(templates, card.template)
    .split(`{${card.param}}`).join(card.value);
  const leftover = filled.match(/\{[a-z_]+\}/g);
  if (leftover) throw new Error(`card ${card.n}: unfilled placeholders ${leftover.join(",")}`);
  return [
    filled,
    card.override || "",
    "\n\n以下是必须使用的事实内容（来自 2026 年诺贝尔物理学奖相关报道，逐条使用，不要改写数字）：",
    card.facts,
    GUARD,
  ].filter(Boolean).join("\n");
}

async function gen(card, prompt) {
  const resp = await gemini.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    // 3:4 is the RedNote card ratio. 2K because at the default ~900px width the
    // small CJK text came back malformed (南极, 线缆, 竣, 银河系) on round 1.
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT], imageConfig: { aspectRatio: "3:4", imageSize: "2K" } },
  });
  const parts = resp.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) {
    throw new Error(`card ${card.n} returned no image. ${parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 200)}`);
  }
  const out = path.join(OUT, `${card.file}.png`);
  fs.writeFileSync(out, Buffer.from(img.inlineData.data, "base64"));
  return out;
}

(async () => {
  const templates = JSON.parse(fs.readFileSync(TEMPLATES, "utf8"));
  fs.mkdirSync(OUT, { recursive: true });

  const onlyIx = process.argv.indexOf("--only");
  const only = onlyIx > -1 ? Number(process.argv[onlyIx + 1]) : null;
  const todo = only ? CARDS.filter((c) => c.n === only) : CARDS;

  console.log(`model: ${MODEL}\nout:   ${OUT}\ncards: ${todo.map((c) => c.n).join(", ")}\n`);

  await Promise.all(todo.map(async (card) => {
    const prompt = buildPrompt(templates, card);
    fs.writeFileSync(path.join(OUT, `${card.file}.prompt.txt`), prompt);
    try {
      const out = await gen(card, prompt);
      console.log(`[${card.n}] ✓ ${path.basename(out)}  (${(fs.statSync(out).size / 1024).toFixed(0)} KB)  ${card.template}`);
    } catch (e) {
      console.error(`[${card.n}] ⚠️  ${e.message}`);
    }
  }));
  console.log("\nDone. Run scripts/qa_cjk_transcribe.cjs before watermarking.");
})();
