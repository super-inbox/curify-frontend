// Add i18n entries for the 4 tier-2 product topics (packaging, ecommerce,
// showcase, branding) into all 10 locale topics.json files.
//
// Round 2D completion 2026-05-31. The tier-3 product buildout (15 entries)
// is being reverted in the same commit — they live without i18n and add
// noise; tier-2 is the actionable level. Per add_info_type_topics.cjs
// pattern: EN + ZH hand-translated; other 8 locales use EN as fallback.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"];

const EN = {
  packaging: {
    displayName: "Packaging",
    title: "Packaging Design Visual Prompts, Templates and Inspiration",
    description: "Explore packaging design AI visuals — food, beverage, cosmetic, and consumer-electronics packaging mockups and label design templates for product brands.",
    intro: "Dive into our packaging-focused AI visual templates — food product packaging, beverage labels, cosmetic packaging mockups, gift packaging, and consumer-electronics design. Whether you're a packaging designer, brand manager, ecommerce seller, or product launch lead, these templates give you a fast way to visualize on-shelf and unboxing design. Browse the examples below.",
    keywords: ["packaging-design", "label", "box-design", "consumer-goods", "product-package", "unboxing"],
  },
  ecommerce: {
    displayName: "Ecommerce",
    title: "Ecommerce Product Visual Prompts, Templates and Inspiration",
    description: "Explore ecommerce AI visuals — product detail images, hero banners, lifestyle shots, and flat-lay templates that lift product-page conversion.",
    intro: "Dive into our ecommerce-focused AI visual templates — product detail shots, hero banners, lifestyle imagery, and conversion-optimized product photography. Whether you're a DTC brand, Shopify seller, marketplace merchant, or ecommerce designer, these templates give you a fast way to produce platform-ready product visuals. Browse the examples below.",
    keywords: ["product-photography", "detail-image", "hero-banner", "flat-lay", "shopify", "dtc"],
  },
  showcase: {
    displayName: "Showcase",
    title: "Product Showcase Visual Prompts, Templates and Inspiration",
    description: "Explore product showcase AI visuals — promotional posters, hero spotlights, mood boards, and product-lineup compositions for launches and campaigns.",
    intro: "Dive into our product-showcase AI visual templates — promotional posters, hero spotlight imagery, mood boards, and product-lineup compositions. Whether you're launching a new product, building a brand campaign, designing a pop-up, or planning a marketing push, these templates give you a fast way to spotlight what you're selling. Browse the examples below.",
    keywords: ["product-spotlight", "promotional", "hero-shot", "mood-board", "launch", "campaign"],
  },
  branding: {
    displayName: "Branding",
    title: "Branding Visual Prompts, Templates and Inspiration",
    description: "Explore branding AI visuals — logo applications, brand-style sheets, color systems, and visual identity templates for new brands and rebrands.",
    intro: "Dive into our branding-focused AI visual templates — logo applications, brand identity sheets, color-system explorations, and typography styling for new brands and rebrand campaigns. Whether you're a designer building a brand book, a founder launching a startup, or an agency presenting a visual identity, these templates give you a fast way to render brand language. Browse the examples below.",
    keywords: ["logo", "brand-identity", "visual-identity", "brand-book", "color-system", "typography"],
  },
};

const ZH = {
  packaging: {
    displayName: "包装设计",
    title: "包装设计视觉灵感、模板与提示词",
    description: "探索包装设计 AI 视觉模板 —— 食品、饮料、化妆品、消费电子等品类的包装效果图与标签设计模板。",
    intro: "深入了解我们的包装设计 AI 视觉模板合集 —— 食品包装、饮料标签、化妆品包装效果图、礼品包装、消费电子设计。无论你是包装设计师、品牌经理、电商卖家，还是产品发布负责人，这些模板都能让你快速将货架与开箱视觉具象化。浏览下方示例。",
    keywords: ["包装设计", "标签", "纸盒设计", "消费品", "产品包装", "开箱"],
  },
  ecommerce: {
    displayName: "电商",
    title: "电商产品视觉灵感、模板与提示词",
    description: "探索电商 AI 视觉模板 —— 产品详情图、主图横幅、场景图与平铺布局模板，提升产品页转化率。",
    intro: "深入了解我们的电商类 AI 视觉模板合集 —— 产品详情图、主图横幅、场景图与转化优化导向的产品摄影。无论你是 DTC 品牌、Shopify 卖家、平台商家还是电商设计师，这些模板都能让你快速产出符合平台规范的产品视觉。浏览下方示例。",
    keywords: ["产品摄影", "详情图", "主图", "平铺", "Shopify", "DTC"],
  },
  showcase: {
    displayName: "产品展示",
    title: "产品展示视觉灵感、模板与提示词",
    description: "探索产品展示 AI 视觉模板 —— 推广海报、聚焦主图、情绪板和产品阵列，适用于发布与营销活动。",
    intro: "深入了解我们的产品展示 AI 视觉模板合集 —— 推广海报、聚焦主图、情绪板与产品阵列。无论你是发布新品、构建品牌活动、设计快闪还是策划营销推广，这些模板都能让你快速聚焦呈现产品。浏览下方示例。",
    keywords: ["产品聚焦", "推广", "主图", "情绪板", "发布", "营销活动"],
  },
  branding: {
    displayName: "品牌",
    title: "品牌视觉灵感、模板与提示词",
    description: "探索品牌视觉 AI 模板 —— 标识应用、品牌风格手册、色彩系统与视觉识别模板，服务新品牌与品牌升级。",
    intro: "深入了解我们的品牌类 AI 视觉模板合集 —— 标识应用、品牌识别手册、色彩系统探索、字体风格设计，适用于新品牌发布与品牌升级。无论你是构建品牌手册的设计师、初创公司的创始人，还是为客户提交视觉方案的代理机构，这些模板都能让你快速呈现品牌语言。浏览下方示例。",
    keywords: ["标识", "品牌识别", "视觉识别", "品牌手册", "色彩系统", "字体"],
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
  console.log(`\nDone. Added ${total} topic-locale entries (4 topics × 10 locales).`);
}

main();
