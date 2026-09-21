/**
 * 隐翅虫 (rove beetle) safety-science card set — first drop of the education
 * smm_daily RedNote series.
 *
 * Source of truth for every fact on these cards:
 *   raw/隐翅虫-smm-09-21/北京隐翅虫出没注意事项及防护指南.pdf
 *   (新大正物业服务中心 resident notice, Beijing, 2026-09)
 *
 * WHY THE FACTS ARE PINNED IN THIS FILE: an image model asked for "a rove beetle
 * safety poster" will happily invent a bite mechanism, a wrong body length, or a
 * folk remedy. Every card therefore ships the PDF's own numbers as a FACTS block
 * appended to the template prompt, plus an explicit do-not-invent instruction.
 * The three claims most likely to be hallucinated — that it bites, that it
 * sprays, and that alcohol/toothpaste help — are stated as negatives.
 *
 * The property company's hotline and branding are deliberately NOT carried over:
 * the facts are public-health facts, the contact details are theirs.
 *
 * Each card reuses a shipped nano template verbatim (base_prompt from
 * public/data/nano_templates.json) with its own parameter filled, so the set is
 * reproducible on-site by anyone visiting the template page.
 *
 * Model is gemini-3-pro-image-preview, not flash: these cards are CJK-heavy and
 * flash garbles Chinese glyphs (memory: feedback_chinese_caption_gemini_model).
 *
 * Requires GEMINI_API_KEY in .env.local.
 * Usage: node scripts/oneoff_rove_beetle_smm_2026-09-21.cjs [--only 3]
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
const OUT = path.join(ROOT, "raw", "隐翅虫-smm-09-21", "out");
const TEMPLATES = path.join(ROOT, "public", "data", "nano_templates.json");

// ── facts, straight off the PDF ──────────────────────────────────────────────
const F_IDENT = `
- 中文名：隐翅虫（因鞘翅极短、后翅"隐藏"于其下而得名）。
- 体长约 0.6—1 厘米，体型细长，形似大蚂蚁。
- 体色黑红相间：头部和腹部末端为黑色，胸部及腹部前半段为橘红色。
- 鞘翅极短而厚，仅盖住腹部前端约 1/3；后翅发达，飞行能力强。`;

const F_HABIT = `
- 昼伏夜出：白天藏匿于草丛、枯木、落叶等潮湿阴暗处，夜间活动频繁。
- 趋光性强：对灯光有强烈趋向性，夜间易飞入室内，尤其聚集在日光灯、屏幕光源附近。
- 季节活跃：7—9 月活动频繁，降雨前后闷热天气尤为多见。
- 飞行能力强：可飞上高层楼宇——已有市民在 17 层家中发现隐翅虫，高层住宅并非安全区。`;

const F_MECHANISM = `
- 它不会主动咬人，也不会主动喷射毒液。被称为"飞行的硫酸"容易被误解。
- 真正的危险来自虫体被拍碎、捏烂或揉搓后，体内含强酸性的"隐翅虫素"（pH 值约 1—2）流出沾染皮肤。
- 毒液沾染皮肤后引发"隐翅虫皮炎"。虫体腹部是毒液集中位置；头部和口器没有毒性。
- 潜伏期：接触毒液后数小时至 2 天内发病。
- 皮损形态：条索状、片状或点簇状水肿性红斑，其上可见密集丘疹、水疱甚至脓疱。
- 自觉症状：明显瘙痒、灼痛和灼热感，严重时可出现糜烂、结痂。
- 好发部位：面部、颈部、胸背、四肢等裸露部位。`;

const F_STEPS = `
第一步 轻轻拨走：切勿拍打。可轻轻吹气将其吹走，或用纸片、纸巾将其轻轻托离/拨落皮肤。
第二步 尽快清洗：立即用肥皂水（碱性）配合流动清水反复冲洗 15 分钟以上，通过酸碱中和减轻损伤。注意：若眼周沾染，严禁使用肥皂水，只用大量清水轻柔冲洗。
第三步 冷敷缓解：冲洗后用干净毛巾轻轻蘸干，可局部冷敷减轻灼痛和红肿。保持患处清洁干燥，切勿抓挠、摩擦，避免二次感染。
第四步 及时就医：若出现水疱、糜烂、疼痛加重，或皮损面积较大、症状明显，请及时前往医院皮肤科就诊。`;

const F_BAN = `
切勿在患处涂抹酒精、碘伏、牙膏、酱油、盐水等"偏方"——这些物品可能加重皮肤损伤或引发感染。`;

const F_PREVENT = `
居家防护：安装并关好纱窗纱门，检查并修补破损处；夜间尽量减少不必要的开灯，或开灯时拉好窗帘，减少光源吸引；睡觉前检查床铺、枕头，抖一抖衣物和蚊帐；室内发现隐翅虫时不要徒手捕捉，可用杀虫剂喷洒或用纸巾包裹后处理；保持室内及阳台环境清洁，及时清理杂草、落叶和垃圾。
户外防护：傍晚及夜间尽量避免长时间在草丛、树林、花坛等潮湿多虫区域逗留；夜间外出穿着长袖长裤，减少皮肤暴露面积；暴露部位可涂抹驱蚊驱避剂；户外活动归来后，及时检查衣物和身体。`;

// Appended to every prompt. The model's default instinct on an "insect danger"
// brief is to draw a biting/stinging insect and a spray cloud; both are wrong
// here and both would make the card actively unsafe advice.
// Round 2 additions are all from observed failures on round 1, not speculation:
//   card 3 drew a pie chart labelled 拍打处理/正确处理 off no data at all, wrote
//   隍翅虫 for 隐翅虫, and emitted the nonsense string 宣发瘙素性丘疹水疱红斑;
//   card 4 wrote 袴 for 将, 捐伤 for 损伤, and the Japanese shinjitai 軽軽 for 轻轻.
// The chart ban and the character-form rule below exist to stop exactly those.
const GUARD = `

STRICT ACCURACY REQUIREMENTS:
- Use ONLY the facts supplied above. Do NOT invent symptoms, numbers, timeframes, treatments or statistics.
- ABSOLUTELY NO charts, pie charts, bar charts, graphs, percentages or survey figures. No quantitative data was supplied, so any chart would be fabricated. Use icons and text blocks only.
- Never depict or imply that this insect BITES or STINGS a person, and never depict it SPRAYING liquid — neither happens. The harm comes only from the insect being crushed against skin.
- Do NOT include any phone number, company name, logo, QR code or watermark.
- Render the beetle accurately: about 1 cm, slender, ant-like, black head and black abdomen tip, orange-red thorax and front abdomen, very short wing covers.

CHINESE TEXT QUALITY — every one of these has already gone wrong once, so check each character:
- Use MAINLAND SIMPLIFIED Chinese glyph forms ONLY. No Japanese shinjitai forms (軽, 髙, 実, 強…), no traditional forms, no rare variants. 轻 must be 轻, never 軽.
- Every character must be a real, correctly-formed character that belongs in its word. Do not substitute a similar-looking or same-sounding character: 将 not 袴, 损伤 not 捐伤, 隐翅虫 not 隍翅虫, 水疱 not 水抱, 感染 not 喊染.
- Do not emit invented medical compounds. Every clinical phrase must be copied from the supplied facts verbatim.
- Copy each sentence from the facts above EXACTLY. Do not paraphrase, do not add a trailing clause, do not duplicate a character at the end of a line.
- The only safe removal methods that may appear anywhere on the card are: blowing it off gently, and lifting/brushing it off with paper. Do not add a third method. In particular never show or name flicking it with a finger (弹走/弹开), shaking it off (抖落) or brushing it away with a hand — a finger-flick crushes the insect against the skin, which is the exact injury this card exists to prevent.
- These meta-instructions are for you, not for the reader. Never render any of this instruction text, or any prohibition worded as a rule, onto the image itself. The card shows only the positive facts supplied above.
- Prefer FEWER words rendered correctly over more words rendered badly. If a block would be crowded, shorten it by dropping a whole sentence, never by mangling one.`;

// ── the four cards ───────────────────────────────────────────────────────────
// Each pairs a shipped template with the PDF beat it covers.
const CARDS = [
  {
    n: 1,
    file: "01_structure_bilingual",
    template: "template-bilingual-object-structure-labeling",
    param: "object_name",
    value: "Rove Beetle 隐翅虫",
    beat: "PDF 二（一）形态特征 — what it actually looks like",
    facts: `${F_IDENT}\n\n请标注的关键部位（拼音 + 英文 + 中文）：头部 tóu bù Head、触角 chù jiǎo Antenna、胸部 xiōng bù Thorax（橘红色）、鞘翅 qiào chì Elytra（极短，仅盖住腹部前端约1/3）、后翅 hòu chì Hindwing（发达，能飞）、腹部 fù bù Abdomen（毒液集中位置）、腹部末端 fù bù mò duān Abdomen tip（黑色）、足 zú Leg。\n在图中标出体长约 0.6—1 厘米的比例尺。`,
  },
  {
    n: 2,
    file: "02_species_science",
    template: "template-species-science",
    param: "species_name",
    value: "隐翅虫 Rove Beetle (Paederus)",
    beat: "PDF 二（二）生活习性 — where and when you meet it",
    // This template's base_prompt asks for English text; RedNote needs Chinese.
    override: "IMPORTANT OVERRIDE: all card text must be in Simplified Chinese, not English.",
    facts: `${F_IDENT}\n${F_HABIT}\n\n信息卡片应包含：形态特征、体色与体长、鞘翅与飞行能力、昼伏夜出、趋光性、季节活跃期（7—9月）、可飞上高层（17层）。`,
  },
  {
    n: 3,
    file: "03_why_not_slap",
    template: "template-popular-science-health-infographic-poster",
    param: "knowledge_topic_info",
    value: "隐翅虫皮炎科普：它不咬人也不喷毒，「拍打」才是元凶",
    beat: "PDF 三 — the reverse-trivia core: the slap is the injury",
    facts: `${F_MECHANISM}\n\n模块建议：① 误区纠正（"隐翅虫会咬人/会喷毒" ✕）② 真相解释（毒液来自被拍碎的虫体）③ 危害说明（隐翅虫素 pH 1—2，强酸）④ 症状与潜伏期 ⑤ 正确做法（不拍、不捏、不揉）。

⑤ 正确做法只有两条：轻轻吹气把它吹走；或用纸片、纸巾把它轻轻托离、拨落。`,
  },
  {
    n: 4,
    file: "04_first_aid_and_prevention",
    template: "template-educational-topic-cheat-sheet-poster",
    param: "subject_topic_info",
    value: "隐翅虫应急处理四步法与日常防护清单",
    beat: "PDF 四 + 五 — the four steps, the banned folk remedies, the checklist",
    facts: `四步处理法（按顺序，编号清晰）：\n${F_STEPS}\n\n必须单独设一个醒目的警告区块：${F_BAN}\n\n防护清单（分「居家」与「户外」两栏）：\n${F_PREVENT}`,
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
  if (filled.includes("{")) {
    // A leftover placeholder means the param name drifted from the template.
    const leftover = filled.match(/\{[a-z_]+\}/g);
    if (leftover) throw new Error(`card ${card.n}: unfilled placeholders ${leftover.join(",")}`);
  }
  return [
    filled,
    card.override || "",
    "\n\n以下是必须使用的事实内容（来自北京物业隐翅虫防护指南，逐条使用，不要改写数字）：",
    card.facts,
    GUARD,
  ].filter(Boolean).join("\n");
}

async function gen(card, prompt) {
  const resp = await gemini.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
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

  for (const card of todo) {
    const prompt = buildPrompt(templates, card);
    fs.writeFileSync(path.join(OUT, `${card.file}.prompt.txt`), prompt);
    process.stdout.write(`[${card.n}] ${card.template}\n    ${card.beat}\n`);
    try {
      const out = await gen(card, prompt);
      console.log(`    ✓ ${path.basename(out)}  (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`    ⚠️  ${e.message}`);
    }
  }
  console.log("\nDone. Review the CJK glyphs before watermarking.");
})();
