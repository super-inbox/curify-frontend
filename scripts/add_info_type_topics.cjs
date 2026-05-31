// Add 6 new info-type tier-2 topics (insight, information-card, quote,
// map, quiz, story) into lib/taxonomy.json and i18n entries into all 10
// locale topics.json files. Round 2A follow-through 2026-05-31.
//
// (Original draft had fact + analysis as separate topics; user merged
// them into one umbrella `insight` — covers both single-line cold facts
// and structured deep dives.)
//
// Per add_b2b_use_cases_i18n.cjs pattern: EN + ZH hand-translated;
// other 8 locales (de/es/fr/hi/ja/ko/ru/tr) use the EN copy as fallback.
//
// Parent assignment (each info-type → tier-1 parent → tier-2 entry):
//   learning    : insight, information-card
//   culture     : quote, story
//   travel      : map
//   personality : quiz

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TAX_PATH = path.join(REPO, "lib/taxonomy.json");
const LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"];

const TIER2_ADDS = {
  learning:    ["insight", "information-card"],
  culture:     ["quote", "story"],
  travel:      ["map"],
  personality: ["quiz"],
};

const EN = {
  insight: {
    displayName: "Insights",
    title: "Insight Visual Prompts, Templates and Inspiration",
    description: "Explore insight-driven AI visuals — cold-knowledge cards, structured analyses, book summaries, hot-event breakdowns, and framework explainers that turn knowledge into shareable visual form.",
    intro: "Dive into our collection of insight-driven AI visual templates that surface knowledge in shareable form — from single-line cold-knowledge cards to structured book summaries, hot-event breakdowns, and framework explainers. Whether you're a creator turning trivia into a shareable post, an analyst visualizing a framework, or an educator producing structured study aids, these templates give you a fast way to render understanding visually. Browse the examples below to find your shape.",
    keywords: ["trivia", "cold-knowledge", "did-you-know", "breakdown", "deep-dive", "framework", "book-summary", "facts", "analysis"],
  },
  "information-card": {
    displayName: "Info Cards",
    title: "Information Card Visual Prompts, Templates and Inspiration",
    description: "Explore information card AI visuals — encyclopedia-style attribute cards for plants, animals, herbs, landmarks, and cultural artifacts.",
    intro: "Dive into our collection of information card AI visual templates — name + image + structured attributes for plants, herbs, animal species, landmarks, and cultural artifacts. Whether you're a creator building encyclopedia-style content, an educator producing study cards, or a designer making catalog-style references, these templates give you a fast way to render attribute-rich visual entries. Browse the examples below to find your shape.",
    keywords: ["encyclopedia", "catalog-card", "wiki", "attribute-card", "info-graphic"],
  },
  quote: {
    displayName: "Quotes",
    title: "Quote Visual Prompts, Templates and Inspiration",
    description: "Explore quote AI visuals — typography-driven one-message posters, name + portrait + quote, and poetic ink-wash quote illustrations.",
    intro: "Dive into our collection of quote-driven AI visual templates that pair a single message with a striking visual treatment. Whether you're a creator turning a memorable line into a shareable poster, a designer building typography-led illustrations, or a brand producing inspirational visuals, these templates give you a fast way to make a quote visually unforgettable. Browse the examples below to find your style.",
    keywords: ["typography", "poster", "saying", "motivational", "name-and-quote"],
  },
  map: {
    displayName: "Maps",
    title: "Map Visual Prompts, Templates and Inspiration",
    description: "Explore map AI visuals — region landmark maps, whimsical travel maps, historical event maps, and word-origins infographics with spatial layout.",
    intro: "Dive into our collection of map-style AI visual templates — geographic and spatial layouts ranging from 3D region landmark maps to whimsical illustrated travel maps, historical event maps, and word-origins infographics. Whether you're a creator illustrating a journey, an educator visualizing a historical period, or a designer producing tourism-style visuals, these templates give you a fast way to ground content in space. Browse the examples below.",
    keywords: ["geography", "spatial", "landmark-map", "travel-map", "atlas"],
  },
  quiz: {
    displayName: "Quizzes",
    title: "Quiz Visual Prompts, Templates and Inspiration",
    description: "Explore quiz AI visuals — MBTI personality posters, character-matching charts, choice-driven cards, and 9-traits self-assessment templates.",
    intro: "Dive into our collection of quiz-style AI visual templates including MBTI personality mappings, 16-cell character matching charts, choice-driven quiz cards, and 9-trait self-assessment posters. Whether you're a creator producing shareable personality content, an educator building interactive study aids, or a designer working with fandom-MBTI mash-ups, these templates give you a fast way to turn a framework into a visual self-test. Browse the examples below.",
    keywords: ["personality-test", "mbti", "matching-chart", "choice-card", "self-assessment"],
  },
  story: {
    displayName: "Stories",
    title: "Story Visual Prompts, Templates and Inspiration",
    description: "Explore story-driven AI visuals — multi-panel narratives, travel journals, scrolling illustrations, and life-journey narrative posters.",
    intro: "Dive into our collection of story-driven AI visual templates that string panels into a coherent narrative — travel journals, scrolling illustrations, life-journey posters, and multi-panel narrative arcs. Whether you're a creator turning a trip into a visual diary, a designer producing scroll-style content, or a brand building narrative campaigns, these templates give you a fast way to tell something. Browse the examples below.",
    keywords: ["narrative", "multi-panel", "scrapbook-style", "journey", "scroll"],
  },
};

const ZH = {
  insight: {
    displayName: "洞察",
    title: "洞察视觉灵感、模板与提示词",
    description: "探索洞察驱动 AI 视觉模板 —— 冷知识卡片、结构化分析、书籍精读、热点拆解和框架解析，把知识变成可分享的视觉形态。",
    intro: "深入了解我们以洞察为核心的 AI 视觉模板合集，以可分享的形式呈现知识 —— 从一句话冷知识卡片，到结构化的书籍精读、热点拆解和框架解析。无论你是把趣闻变成可分享内容的创作者，可视化框架的分析师，还是为学习者制作结构化学习卡的教育者，这些模板都能让你快速呈现理解。浏览下方示例，找到适合的形态。",
    keywords: ["冷知识", "趣闻", "你知道吗", "拆解", "深度", "框架", "精读", "事实", "分析"],
  },
  "information-card": {
    displayName: "信息卡",
    title: "信息卡视觉灵感、模板与提示词",
    description: "探索信息卡 AI 视觉模板 —— 百科风格的属性卡，覆盖植物、动物、中草药、地标和文化器物。",
    intro: "深入了解我们的信息卡 AI 视觉模板合集 —— 名称 + 图片 + 结构化属性，涵盖植物、中草药、动物物种、地标、文化器物等品类。无论你是制作百科内容的创作者，制作学习卡的教育者，还是设计目录式参考资料的设计师，这些模板都能让你快速呈现属性丰富的视觉条目。浏览下方示例，找到适合的形态。",
    keywords: ["百科", "目录卡", "维基", "属性卡", "信息图"],
  },
  quote: {
    displayName: "名言",
    title: "名言视觉灵感、模板与提示词",
    description: "探索名言 AI 视觉模板 —— 以字体为主角的单句海报、名字 + 肖像 + 语录、诗意水墨名言插画。",
    intro: "深入了解我们的名言驱动 AI 视觉模板合集，将一句话与极具冲击力的视觉表达结合。无论你是把金句变成可分享海报的创作者，制作字体主导插画的设计师，还是输出励志视觉的品牌方，这些模板都能让一句话视觉化、易传播。浏览下方示例，找到你的风格。",
    keywords: ["字体设计", "海报", "名言警句", "励志", "名字与语录", "诗意"],
  },
  map: {
    displayName: "地图",
    title: "地图视觉灵感、模板与提示词",
    description: "探索地图风格 AI 视觉模板 —— 区域地标 3D 地图、奇趣旅行地图、历史事件地图、词源信息图等空间布局作品。",
    intro: "深入了解我们的地图风格 AI 视觉模板合集 —— 涵盖 3D 区域地标地图、奇趣插画旅行地图、历史事件地图和词源信息图等地理与空间布局作品。无论你是图解旅程的创作者，可视化历史时期的教育者，还是制作旅游主题视觉的设计师，这些模板都能让你以最快速度将内容定位于空间。浏览下方示例。",
    keywords: ["地理", "空间", "地标地图", "旅行地图", "图册", "区域插画"],
  },
  quiz: {
    displayName: "测试",
    title: "测试视觉灵感、模板与提示词",
    description: "探索测试类 AI 视觉模板 —— MBTI 人格海报、角色对应矩阵、选择题卡片、9 项性格自测海报。",
    intro: "深入了解我们的测试风格 AI 视觉模板合集，包括 MBTI 人格映射、16 宫格角色对应矩阵、选择题卡片、9 项性格自测海报等。无论你是制作可分享人格内容的创作者，制作互动学习卡的教育者，还是创作粉丝向 MBTI 跨界作品的设计师，这些模板都能让你以最快速度将一个框架变成可视化自测。浏览下方示例。",
    keywords: ["性格测试", "MBTI", "对应矩阵", "选择卡", "自测", "框架测验"],
  },
  story: {
    displayName: "故事",
    title: "故事视觉灵感、模板与提示词",
    description: "探索故事驱动 AI 视觉模板 —— 多格叙事、旅行日记、滚动卷轴、人生轨迹叙事海报。",
    intro: "深入了解我们以故事为核心的 AI 视觉模板合集，将多格画面串成连贯叙事 —— 旅行日记、卷轴式插画、人生轨迹海报、多格叙事弧线等。无论你是把旅行做成视觉日记的创作者，制作卷轴式内容的设计师，还是构建叙事品牌活动的品牌方，这些模板都能让你以最快方式讲述一段故事。浏览下方示例。",
    keywords: ["叙事", "多格", "拼贴风", "旅程", "卷轴", "分格故事"],
  },
};

function main() {
  // 1. taxonomy.json — add tier-2 entries
  const tax = JSON.parse(fs.readFileSync(TAX_PATH, "utf-8"));
  let addsTaxonomy = 0;
  for (const [parent, leaves] of Object.entries(TIER2_ADDS)) {
    if (!tax.tier2[parent]) tax.tier2[parent] = [];
    for (const leaf of leaves) {
      if (!tax.tier2[parent].includes(leaf)) {
        tax.tier2[parent].push(leaf);
        addsTaxonomy++;
        console.log(`  taxonomy: added tier2.${parent} ← ${leaf}`);
      }
    }
  }
  fs.writeFileSync(TAX_PATH, JSON.stringify(tax, null, 2) + "\n");
  console.log(`\n  → taxonomy.json: ${addsTaxonomy} tier-2 entries added\n`);

  // 2. messages/<locale>/topics.json — add i18n entries
  let totalI18nAdds = 0;
  for (const locale of LOCALES) {
    const p = path.join(REPO, "messages", locale, "topics.json");
    if (!fs.existsSync(p)) {
      console.log(`  SKIP (missing): ${locale}`);
      continue;
    }
    const doc = JSON.parse(fs.readFileSync(p, "utf-8"));
    const content = locale === "zh" ? ZH : EN;
    let perLocale = 0;
    for (const [key, value] of Object.entries(content)) {
      if (doc.topics[key]) {
        // already present, skip
        continue;
      }
      doc.topics[key] = value;
      perLocale++;
      totalI18nAdds++;
    }
    if (perLocale) {
      fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
      console.log(`  ${locale}: +${perLocale} topic entries`);
    }
  }
  console.log(`\n  → i18n: ${totalI18nAdds} topic-locale entries added (${Object.keys(EN).length} topics × ${LOCALES.length} locales).`);
}

main();
