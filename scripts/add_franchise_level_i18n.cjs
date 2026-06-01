// Add i18n for 9 new franchise tier-3 entries + 3 new level tier-2 entries
// into all 10 locale topics.json files. Round 2026-06-01 promote-template-
// families-to-tier-3 work. Per add_b2b_use_cases_i18n.cjs pattern: EN+ZH
// hand-translated, other 8 locales fall back to EN.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"];

const EN = {
  naruto: {
    displayName: "Naruto",
    title: "Naruto Visual Prompts, Templates and Inspiration",
    description: "Explore Naruto AI visuals — MBTI character analyses, Hidden Leaf ninja portraits, and fandom-grid posters spanning Team 7, Akatsuki, and the Kage.",
    intro: "Dive into our Naruto-focused AI visual template collection — MBTI-personality mappings of the Hidden Leaf ninjas, character profile cards, and fandom-grid posters spanning Team 7, Akatsuki, and the Kage. Whether you're a fan creating shareable content, a designer producing anime-style fan art, or a content creator working with the Naruto franchise, browse the examples below.",
    keywords: ["anime", "shonen", "hidden-leaf", "ninja", "shippuden", "boruto"],
  },
  "harry-potter": {
    displayName: "Harry Potter",
    title: "Harry Potter Visual Prompts, Templates and Inspiration",
    description: "Explore Harry Potter AI visuals — Hogwarts house MBTI mappings, wizarding character profiles, and fandom posters across Gryffindor, Slytherin, Ravenclaw, and Hufflepuff.",
    intro: "Dive into our Harry Potter AI visual template collection — MBTI-personality mappings across the four Hogwarts houses, character profile cards, and wizarding world fandom posters. Whether you're a Potterhead creating shareable content, a designer producing wizarding-style fan art, or a content creator working with the franchise, browse the examples below.",
    keywords: ["hogwarts", "wizard", "magic", "harry", "potter", "gryffindor", "slytherin"],
  },
  friends: {
    displayName: "Friends",
    title: "Friends TV Show Visual Prompts, Templates and Inspiration",
    description: "Explore Friends AI visuals — MBTI mappings of the six core cast, Central Perk-themed character profiles, and 90s sitcom fandom posters.",
    intro: "Dive into our Friends-focused AI visual template collection — MBTI-personality mappings of Ross, Rachel, Monica, Chandler, Joey, and Phoebe; Central Perk-themed character profile cards; and 90s sitcom fandom posters. Whether you're a fan creating shareable content, a designer producing sitcom-style fan art, or a creator working with the IP, browse the examples below.",
    keywords: ["sitcom", "tv-show", "central-perk", "90s", "ross", "rachel", "monica"],
  },
  marvel: {
    displayName: "Marvel",
    title: "Marvel Visual Prompts, Templates and Inspiration",
    description: "Explore Marvel AI visuals — MBTI character mappings across the Avengers, X-Men, Guardians of the Galaxy, and the broader MCU, plus superhero fandom posters.",
    intro: "Dive into our Marvel-focused AI visual template collection — MBTI-personality mappings across the Avengers, X-Men, Guardians of the Galaxy, and the broader MCU; character profile cards; and superhero fandom posters. Whether you're a Marvel fan creating content, a designer producing superhero-style art, or a content creator working with the franchise, browse the examples below.",
    keywords: ["mcu", "avengers", "x-men", "superhero", "spider-man", "iron-man"],
  },
  "breaking-bad": {
    displayName: "Breaking Bad",
    title: "Breaking Bad Visual Prompts, Templates and Inspiration",
    description: "Explore Breaking Bad AI visuals — Walter White and Jesse Pinkman MBTI mappings, character profile cards, and Albuquerque crime-drama fandom posters.",
    intro: "Dive into our Breaking Bad AI visual template collection — MBTI-personality mappings of Walter White, Jesse Pinkman, Saul Goodman, Gus Fring, and the Albuquerque cast; character profile cards; and crime-drama fandom posters. Whether you're a fan, a designer producing crime-drama art, or a content creator working with the franchise, browse the examples below.",
    keywords: ["walter-white", "jesse-pinkman", "albuquerque", "crime-drama", "amc"],
  },
  yellowstone: {
    displayName: "Yellowstone",
    title: "Yellowstone Visual Prompts, Templates and Inspiration",
    description: "Explore Yellowstone AI visuals — Dutton family MBTI mappings, western character profiles, and Montana ranch-drama fandom posters.",
    intro: "Dive into our Yellowstone AI visual template collection — MBTI-personality mappings of John, Beth, Kayce, and the Dutton family; western character profile cards; and Montana ranch-drama fandom posters. Whether you're a fan, a designer producing western-style art, or a content creator working with the franchise, browse the examples below.",
    keywords: ["dutton", "montana", "ranch", "western", "kevin-costner", "neo-western"],
  },
  ghibli: {
    displayName: "Studio Ghibli",
    title: "Studio Ghibli Visual Prompts, Templates and Inspiration",
    description: "Explore Studio Ghibli AI visuals — character MBTI mappings across My Neighbor Totoro, Spirited Away, Howl's Moving Castle, and the broader Miyazaki filmography.",
    intro: "Dive into our Studio Ghibli AI visual template collection — MBTI-personality mappings across Totoro, Spirited Away, Howl's Moving Castle, Princess Mononoke, and the broader Ghibli filmography. Character profile cards, watercolor-style fan art, and animation fandom posters. Whether you're a Ghibli fan or a creator working with the studio's aesthetic, browse the examples below.",
    keywords: ["miyazaki", "totoro", "spirited-away", "howl", "anime", "japanese-animation"],
  },
  "silicon-valley": {
    displayName: "Silicon Valley",
    title: "Silicon Valley TV Show Visual Prompts, Templates and Inspiration",
    description: "Explore Silicon Valley AI visuals — Pied Piper MBTI mappings, startup character profiles, and tech-comedy fandom posters.",
    intro: "Dive into our Silicon Valley-focused AI visual template collection — MBTI-personality mappings of Richard, Erlich, Dinesh, Gilfoyle, and the Pied Piper crew; startup character profile cards; and tech-comedy fandom posters. Whether you're a tech fan, a startup operator, or a creator producing Silicon-Valley-style content, browse the examples below.",
    keywords: ["tech", "startup", "hbo", "pied-piper", "richard-hendricks"],
  },
  nba: {
    displayName: "NBA",
    title: "NBA Visual Prompts, Templates and Inspiration",
    description: "Explore NBA AI visuals — player MBTI mappings spanning Jordan and Kobe to LeBron and Curry, plus basketball legend character profile cards.",
    intro: "Dive into our NBA-focused AI visual template collection — MBTI-personality mappings of basketball legends from Jordan and Kobe to LeBron and Curry; player profile cards; and NBA fandom posters across decades. Whether you're a basketball fan, a sports content creator, or a designer producing NBA-themed art, browse the examples below.",
    keywords: ["basketball", "lebron", "jordan", "kobe", "curry", "nba-finals", "playoffs"],
  },
  beginner: {
    displayName: "Beginner",
    title: "Beginner Language Learning Visual Prompts, Templates and Inspiration",
    description: "Explore beginner-level AI language learning visuals — kid-friendly vocabulary cards, phonics posters, and basic dialogue templates for early learners.",
    intro: "Dive into our beginner-level AI language learning visual template collection — phonics posters, CVC word cards, kid-friendly vocabulary flashcards, and basic dialogue templates. Whether you're a primary school teacher, an ESL educator working with early learners, a parent supporting at-home learning, or a content creator producing K-5 educational content, browse the examples below.",
    keywords: ["esl", "early-learning", "k-5", "phonics", "basic-vocabulary", "kids"],
  },
  intermediate: {
    displayName: "Intermediate",
    title: "Intermediate Language Learning Visual Prompts, Templates and Inspiration",
    description: "Explore intermediate-level AI language learning visuals — vocabulary expansion, dialogue scenes, idioms, and word-difference comparisons for confident learners.",
    intro: "Dive into our intermediate-level AI language learning visual template collection — vocabulary expansion cards, dialogue scenes, idiom learning, and word-difference comparisons. Whether you're a language teacher, an ESL educator, a self-directed learner past basics, or a content creator producing intermediate-tier study material, browse the examples below.",
    keywords: ["esl", "language-learning", "vocabulary-expansion", "dialogue", "idiom"],
  },
  advanced: {
    displayName: "Advanced",
    title: "Advanced Language Learning Visual Prompts, Templates and Inspiration",
    description: "Explore advanced-level AI language learning visuals — IELTS-tier vocabulary, native expressions, error correction, and word-origin maps for exam preparation.",
    intro: "Dive into our advanced-level AI language learning visual template collection — IELTS-tier vocabulary posters, native expression mappings, error correction, and word-origin maps. Whether you're preparing for IELTS / TOEFL / SAT, a language educator producing exam-prep material, or an advanced learner refining nuance, browse the examples below.",
    keywords: ["ielts", "toefl", "advanced-vocabulary", "exam-prep", "language-learning"],
  },
};

const ZH = {
  naruto: {
    displayName: "火影忍者",
    title: "火影忍者视觉灵感、模板与提示词",
    description: "探索火影忍者 AI 视觉模板 —— MBTI 角色解读、木叶忍者肖像，以及涵盖第七班、晓组织与影级的同人海报。",
    intro: "深入了解我们的火影忍者 AI 视觉模板合集 —— 木叶忍者的 MBTI 性格映射、角色档案卡，以及覆盖第七班、晓组织、各代火影的同人海报。无论你是粉丝创作可分享内容、设计师产出动漫同人，还是基于火影 IP 的内容创作者，浏览下方示例。",
    keywords: ["动漫", "少年漫画", "木叶", "忍者", "疾风传", "博人传"],
  },
  "harry-potter": {
    displayName: "哈利波特",
    title: "哈利波特视觉灵感、模板与提示词",
    description: "探索哈利波特 AI 视觉模板 —— 霍格沃茨四学院 MBTI 映射、魔法角色档案与魔法世界同人海报。",
    intro: "深入了解我们的哈利波特 AI 视觉模板合集 —— 霍格沃茨四大学院的 MBTI 性格映射、角色档案卡，以及魔法世界同人海报。无论你是哈迷创作可分享内容、设计师产出魔法风格同人画，还是基于哈利波特 IP 的内容创作者，浏览下方示例。",
    keywords: ["霍格沃茨", "魔法", "哈利", "波特", "格兰芬多", "斯莱特林"],
  },
  friends: {
    displayName: "老友记",
    title: "《老友记》视觉灵感、模板与提示词",
    description: "探索《老友记》AI 视觉模板 —— 六位主角 MBTI 映射、中央咖啡馆主题角色档案与 90 年代情景喜剧同人海报。",
    intro: "深入了解我们的《老友记》AI 视觉模板合集 —— 罗斯、瑞秋、莫妮卡、钱德勒、乔伊与菲比的 MBTI 性格映射、中央咖啡馆主题角色档案，以及 90 年代情景喜剧同人海报。无论你是粉丝、设计师还是基于此 IP 的创作者，浏览下方示例。",
    keywords: ["情景喜剧", "美剧", "中央咖啡馆", "90年代", "罗斯", "瑞秋"],
  },
  marvel: {
    displayName: "漫威",
    title: "漫威视觉灵感、模板与提示词",
    description: "探索漫威 AI 视觉模板 —— 复仇者联盟、X 战警、银河护卫队及更广 MCU 的 MBTI 角色映射与超级英雄同人海报。",
    intro: "深入了解我们的漫威 AI 视觉模板合集 —— 复仇者联盟、X 战警、银河护卫队及更广 MCU 的 MBTI 性格映射、角色档案，以及超级英雄同人海报。无论你是漫威粉丝、超级英雄风格的设计师，还是基于漫威 IP 的内容创作者，浏览下方示例。",
    keywords: ["MCU", "复仇者联盟", "X战警", "超级英雄", "蜘蛛侠", "钢铁侠"],
  },
  "breaking-bad": {
    displayName: "绝命毒师",
    title: "《绝命毒师》视觉灵感、模板与提示词",
    description: "探索《绝命毒师》AI 视觉模板 —— 沃尔特·怀特与杰西·平克曼的 MBTI 映射、角色档案与阿尔伯克基犯罪剧同人海报。",
    intro: "深入了解我们的《绝命毒师》AI 视觉模板合集 —— 沃尔特·怀特、杰西·平克曼、索尔·古德曼、古斯·弗林以及阿尔伯克基剧组的 MBTI 性格映射、角色档案，以及犯罪剧同人海报。无论你是粉丝、犯罪剧风格设计师，还是基于此 IP 的创作者，浏览下方示例。",
    keywords: ["沃尔特怀特", "杰西", "阿尔伯克基", "犯罪剧", "AMC"],
  },
  yellowstone: {
    displayName: "黄石",
    title: "《黄石》视觉灵感、模板与提示词",
    description: "探索《黄石》AI 视觉模板 —— 达顿家族 MBTI 映射、西部角色档案与蒙大拿牧场剧同人海报。",
    intro: "深入了解我们的《黄石》AI 视觉模板合集 —— 约翰、贝丝、凯西以及达顿家族的 MBTI 性格映射、西部角色档案，以及蒙大拿牧场剧同人海报。无论你是粉丝、西部风格设计师，还是基于此 IP 的创作者，浏览下方示例。",
    keywords: ["达顿", "蒙大拿", "牧场", "西部", "凯文科斯特纳", "新西部"],
  },
  ghibli: {
    displayName: "吉卜力",
    title: "吉卜力工作室视觉灵感、模板与提示词",
    description: "探索吉卜力 AI 视觉模板 —— 《龙猫》《千与千寻》《哈尔的移动城堡》及宫崎骏作品集的角色 MBTI 映射。",
    intro: "深入了解我们的吉卜力 AI 视觉模板合集 —— 龙猫、千与千寻、哈尔的移动城堡、幽灵公主以及更广吉卜力作品的 MBTI 性格映射。角色档案、水彩风同人画与动画同人海报。无论你是吉卜力粉丝，还是创作工作室美学的内容创作者，浏览下方示例。",
    keywords: ["宫崎骏", "龙猫", "千与千寻", "哈尔", "动漫", "日本动画"],
  },
  "silicon-valley": {
    displayName: "硅谷",
    title: "《硅谷》美剧视觉灵感、模板与提示词",
    description: "探索《硅谷》AI 视觉模板 —— Pied Piper 团队 MBTI 映射、创业角色档案与科技喜剧同人海报。",
    intro: "深入了解我们的《硅谷》AI 视觉模板合集 —— Richard、Erlich、Dinesh、Gilfoyle 与 Pied Piper 团队的 MBTI 性格映射、创业角色档案，以及科技喜剧同人海报。无论你是科技爱好者、创业者，还是创作硅谷风格内容的创作者，浏览下方示例。",
    keywords: ["科技", "创业", "HBO", "Pied Piper", "Richard"],
  },
  nba: {
    displayName: "NBA",
    title: "NBA 视觉灵感、模板与提示词",
    description: "探索 NBA AI 视觉模板 —— 从乔丹与科比到詹姆斯与库里的球员 MBTI 映射，篮球传奇角色档案。",
    intro: "深入了解我们的 NBA AI 视觉模板合集 —— 从乔丹与科比到詹姆斯与库里的篮球传奇 MBTI 性格映射、球员档案，以及跨年代的 NBA 同人海报。无论你是篮球迷、体育内容创作者，还是 NBA 主题艺术设计师，浏览下方示例。",
    keywords: ["篮球", "詹姆斯", "乔丹", "科比", "库里", "总决赛"],
  },
  beginner: {
    displayName: "初级",
    title: "初级语言学习视觉灵感、模板与提示词",
    description: "探索初级 AI 语言学习视觉 —— 适合幼儿与早期学习者的词汇卡、自然拼读海报与基础对话模板。",
    intro: "深入了解我们的初级 AI 语言学习视觉模板合集 —— 自然拼读海报、CVC 单词卡、亲子友好的词汇闪卡与基础对话模板。无论你是小学教师、面向早期学习者的 ESL 教育者、支持家庭学习的家长，还是 K-5 教育内容创作者，浏览下方示例。",
    keywords: ["ESL", "早期教育", "K-5", "自然拼读", "基础词汇", "儿童"],
  },
  intermediate: {
    displayName: "中级",
    title: "中级语言学习视觉灵感、模板与提示词",
    description: "探索中级 AI 语言学习视觉 —— 词汇拓展、对话场景、习语与近义词对比，适合已掌握基础的学习者。",
    intro: "深入了解我们的中级 AI 语言学习视觉模板合集 —— 词汇拓展卡、对话场景、习语学习与近义词差异对比。无论你是语言教师、ESL 教育者、已过基础的自主学习者，还是中阶学习材料的内容创作者，浏览下方示例。",
    keywords: ["ESL", "语言学习", "词汇拓展", "对话", "习语"],
  },
  advanced: {
    displayName: "高级",
    title: "高级语言学习视觉灵感、模板与提示词",
    description: "探索高级 AI 语言学习视觉 —— 雅思级词汇、地道表达、错误纠正与词源地图，服务于考试备考与精进学习。",
    intro: "深入了解我们的高级 AI 语言学习视觉模板合集 —— 雅思级词汇海报、地道表达映射、错误纠正与词源地图。无论你是备考 IELTS / TOEFL / SAT、产出备考材料的语言教育者，还是追求语感的高级学习者，浏览下方示例。",
    keywords: ["IELTS", "TOEFL", "高级词汇", "考试备考", "语言学习"],
  },
};

function main() {
  let total = 0;
  for (const locale of LOCALES) {
    const p = path.join(REPO, "messages", locale, "topics.json");
    if (!fs.existsSync(p)) continue;
    const doc = JSON.parse(fs.readFileSync(p, "utf-8"));
    const content = locale === "zh" ? ZH : EN;
    let perLocale = 0;
    for (const [key, value] of Object.entries(content)) {
      if (doc.topics[key]) continue;
      doc.topics[key] = value;
      perLocale++;
      total++;
    }
    if (perLocale) {
      fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
      console.log(`  ${locale}: +${perLocale} topic entries`);
    }
  }
  console.log(`\nDone. Added ${total} topic-locale entries (12 topics × 10 locales).`);
}

main();
