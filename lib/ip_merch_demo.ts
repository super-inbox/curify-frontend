// IP-merch demo seed — drives app/[locale]/(public)/ip-merch-demo/.
//
// Factory-operator-facing demo: the 4-template Curify stack from
// /blog/ip-merch-design-ai-workflow (shipped 2026-06-08). One IP
// brief → 4 sequential stages of merch-design output, narrating
// "brand → series → SKU" ontology in 4 concrete outputs.
//
// MVP scope (locked 2026-06-10): tour walkthrough using the 4 hero
// examples from the blog — graduation alpaca / empress cow cat /
// busan boogi duck / bronze rabbit qingqing — each at its matching
// template stage. NO live Gemini generation in MVP; everything is
// pre-rendered and shipped in /public/images/nano_insp/. Same noindex
// pitch-mode surface as /illustrator-demo and /progseo-demo.
//
// i18n (2026-06-13): seed is locale-aware via getIpMerchSeed(locale).
// English is authoritative; Chinese (zh) is a full translation for the
// merch/factory audience. Other locales fall back to English — extend
// LOCALE_SEEDS to add more. Structural fields (order/id/template_id/
// image_url) are shared from the English seed; the zh seed only overrides
// display text, so the two can't drift on assets.
//
// V2 would add: "run your own IP brief" text input → live Gemini call
// on stage 1 → user picks the locked character sheet → stages 2-4
// fan out cached or live. Not in MVP — reactions first.

export type IpMerchStage = {
  /** 1..4 — order in the workflow narrative */
  order: number;
  /** Internal id for tracking + future API wiring */
  id: string;
  /** Step label shown above the image */
  step_label: string;
  /** Short label for the stage dot-nav chip (no "Stage N —" prefix) */
  short_label: string;
  /** Curify template id this stage maps to (blog source of truth) */
  template_id: string;
  /** IP example used for this stage in the MVP walkthrough */
  ip_info: string;
  /** Human caption describing what this template produces */
  template_caption: string;
  /** What the factory operator gets at this stage — value claim */
  operator_outcome: string;
  /** Full-size rendered example image (in /public/images/nano_insp/) */
  image_url: string;
  /** Preview / thumbnail image */
  preview_image_url: string;
};

/** Chrome / UI labels (localized) */
export type IpMerchUi = {
  eyebrow: string;
  prevStage: string;
  nextStage: string;
  /** "Stage" / "阶段" — used in "Stage 2 / 4" + the mobile chip */
  stageWord: string;
};

/** "Merch Workflow" instant-burst demo block (localized). Drives the
 *  doodle → 10 production-sheets feature. Product `dims`/shape/icon are
 *  structural (held in the component); only labels + chrome strings are
 *  localized here. */
export type IpMerchWorkflow = {
  eyebrow: string;
  title: string;
  subtitle: string;
  uploadPrompt: string;
  uploadHint: string;
  uploadCta: string;
  runLabel: string;
  runningLabel: string;
  /** Result heading; "{n}" is replaced with the sheet count. */
  resultHeading: string;
  resetLabel: string;
  dpi: string;
  color: string;
  bleed: string;
  /** 10 products, in burst order. `key` maps to component-side dims/shape/icon. */
  products: { key: string; label: string }[];
};

export type IpMerchDemoSeed = {
  /** Hero pitch shown at the top of the page */
  hero: {
    title: string;
    subtitle: string;
    workflow_summary: string;
  };
  /** 4 sequential stages — order is load-bearing */
  stages: IpMerchStage[];
  /** Bottom-of-page CTA to outbound conversation */
  cta: {
    primary_label: string;
    primary_href: string;
    secondary_label: string;
    secondary_href: string;
    closing_line: string;
  };
  /** Localized chrome labels */
  ui: IpMerchUi;
  /** "Merch Workflow" instant-burst demo */
  workflow: IpMerchWorkflow;
};

/** Shared product order/keys — labels are localized per seed. */
export const MERCH_WORKFLOW_PRODUCT_KEYS = [
  "mug", "tote", "badge", "tshirt", "sticker",
  "poster", "phonecase", "notebook", "coaster", "keychain",
] as const;

export const IP_MERCH_DEMO_SEED: IpMerchDemoSeed = {
  hero: {
    title: "IP-merch design workflow — one brief, four stages, full SKU family",
    subtitle:
      "Walk one IP through the four Curify templates that turn a character brief into a retail-shelf-ready merch family. Brand → series → SKU, locked at every stage.",
    workflow_summary:
      "These four stages are the same engine we run with paid factory customers. Each stage takes the previous stage's locked output as its constraint, so the illustrator's hand stays consistent from the character sheet through to the gift-box mockup. Below is one walkthrough per stage, using the IP example from our 2026-06-08 case study.",
  },
  stages: [
    {
      order: 1,
      id: "character-sprite-emoji-sheet",
      step_label: "Stage 1 — Lock the character canon",
      short_label: "Lock the character canon",
      template_id: "template-ip-character-sprite-emoji-sheet",
      ip_info: "graduation alpaca",
      template_caption:
        "IP Character Sprite + Emoji Sheet — 12-pose action library across a single grid.",
      operator_outcome:
        "Character canon locked. Every later stage references this sheet as the structural source, so face, proportions, and silhouette stay consistent across the entire SKU family.",
      image_url:
        "/images/nano_insp/template-ip-character-sprite-emoji-sheet-graduation-alpaca.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-character-sprite-emoji-sheet-graduation-alpaca-prev.jpg",
    },
    {
      order: 2,
      id: "emoji-sticker-sheet-poster",
      step_label: "Stage 2 — Distribution-ready pack",
      short_label: "Distribution-ready pack",
      template_id: "template-ip-emoji-sticker-sheet-poster",
      ip_info: "empress cow cat",
      template_caption:
        "IP Emoji Sticker Sheet Poster — 16-piece WeChat-standard distribution pack.",
      operator_outcome:
        "Sticker pack ready for the channels that drive top-of-funnel discovery. The 16-piece WeChat layout matches the platform's distribution rules so the pack ships day-one, not after a re-cut.",
      image_url:
        "/images/nano_insp/template-ip-emoji-sticker-sheet-poster-empress-cow-cat.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-emoji-sticker-sheet-poster-empress-cow-cat-prev.jpg",
    },
    {
      order: 3,
      id: "gift-box-stationery-set-mockup",
      step_label: "Stage 3 — Retail-shelf mockup",
      short_label: "Retail-shelf mockup",
      template_id: "template-ip-gift-box-stationery-set-mockup",
      ip_info: "busan boogi duck",
      template_caption:
        "IP Gift Box Stationery Set Mockup — retail-shelf gift box + matching stationery family.",
      operator_outcome:
        "Channel-ready mockup. Use it on the licensee pitch deck the same day the IP brief lands — buyer sees the gift-box first, not a character study with no commercial framing.",
      image_url:
        "/images/nano_insp/template-ip-gift-box-stationery-set-mockup-busan-boogi-duck.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-gift-box-stationery-set-mockup-busan-boogi-duck-prev.jpg",
    },
    {
      order: 4,
      id: "creative-cultural-goods-mockup-set",
      step_label: "Stage 4 — Full SKU family",
      short_label: "Full SKU family",
      template_id: "template-ip-creative-cultural-goods-mockup-set",
      ip_info: "bronze rabbit qingqing",
      template_caption:
        "IP Creative Cultural Goods Mockup Set — 5+ merch surface designs rendered together.",
      operator_outcome:
        "Full SKU family in one render — mug, tote, sticker sheet, pin set, packaging. This is the moment the licensing deck stops being a character study and starts being a product roadmap.",
      image_url:
        "/images/nano_insp/template-ip-creative-cultural-goods-mockup-set-bronze-rabbit-qingqing.jpg",
      preview_image_url:
        "/images/nano_insp_preview/template-ip-creative-cultural-goods-mockup-set-bronze-rabbit-qingqing-prev.jpg",
    },
  ],
  cta: {
    primary_label: "15-min walkthrough on your IP",
    primary_href: "https://calendly.com/qqwjq9916/15-minute-meeting",
    secondary_label: "Read the case study",
    secondary_href: "/blog/ip-merch-design-ai-workflow",
    closing_line:
      "Each stage takes a real IP brief and outputs at SKU velocity. Run this on your character — we'll send back a two-piece sample on any stage you pick.",
  },
  ui: {
    eyebrow: "IP-merch design demo · pitch-mode",
    prevStage: "Previous stage",
    nextStage: "Next stage",
    stageWord: "Stage",
  },
  workflow: {
    eyebrow: "Live · Merch Workflow",
    title: "From a doodle to 10 production-ready sheets — in one click.",
    subtitle:
      "Drop any rough sketch. Curify's Merch Workflow returns print-ready production sheets for your whole SKU set — 300 DPI, CMYK, perfect 3mm bleed, crop marks, every product sized.",
    uploadPrompt: "Drop your sketch",
    uploadHint: "Even a 10-second doodle works — PNG or JPG.",
    uploadCta: "Choose a file",
    runLabel: "Run Merch Workflow",
    runningLabel: "Generating production sheets…",
    resultHeading: "{n} production-ready sheets · 300 DPI · CMYK · 3mm bleed",
    resetLabel: "Start over",
    dpi: "300 DPI",
    color: "CMYK",
    bleed: "3mm bleed",
    products: [
      { key: "mug", label: "Ceramic mug" },
      { key: "tote", label: "Canvas tote" },
      { key: "badge", label: "Enamel badge" },
      { key: "tshirt", label: "T-shirt" },
      { key: "sticker", label: "Die-cut sticker" },
      { key: "poster", label: "A2 poster" },
      { key: "phonecase", label: "Phone case" },
      { key: "notebook", label: "Notebook cover" },
      { key: "coaster", label: "Round coaster" },
      { key: "keychain", label: "Acrylic keychain" },
    ],
  },
};

// ── Chinese (zh) ────────────────────────────────────────────────────────────
// Per-stage display-text overrides, keyed by stage id. Structural fields
// (order/id/template_id/image_url/preview_image_url) are reused from the
// English seed below so the two never drift on assets.
const ZH_STAGE_TEXT: Record<
  string,
  Pick<IpMerchStage, "step_label" | "short_label" | "ip_info" | "template_caption" | "operator_outcome">
> = {
  "character-sprite-emoji-sheet": {
    step_label: "第 1 阶段 —— 锁定角色设定",
    short_label: "锁定角色设定",
    ip_info: "毕业羊驼",
    template_caption: "IP 角色立绘 + 表情包 —— 单张网格上的 12 个动作姿势库。",
    operator_outcome:
      "角色设定锁定。后续每个阶段都以这张设定表作为结构来源，因此整个 SKU 家族的脸型、比例和轮廓都保持一致。",
  },
  "emoji-sticker-sheet-poster": {
    step_label: "第 2 阶段 —— 可分发素材包",
    short_label: "可分发素材包",
    ip_info: "皇后奶牛猫",
    template_caption: "IP 表情贴纸海报 —— 16 张微信标准规格的分发素材包。",
    operator_outcome:
      "贴纸包已就绪，可直接投放到带来上层流量的渠道。16 张的微信版式符合平台分发规则，因此素材包当天即可上线，无需返工重切。",
  },
  "gift-box-stationery-set-mockup": {
    step_label: "第 3 阶段 —— 零售货架样机",
    short_label: "零售货架样机",
    ip_info: "釜山布吉鸭",
    template_caption: "IP 礼盒文具套装样机 —— 可上架礼盒 + 配套文具家族。",
    operator_outcome:
      "可直接用于渠道的样机。IP 简报到手当天就能放进授权商提案里 —— 买家先看到的是礼盒，而不是一张没有商业包装的角色研究图。",
  },
  "creative-cultural-goods-mockup-set": {
    step_label: "第 4 阶段 —— 完整 SKU 家族",
    short_label: "完整 SKU 家族",
    ip_info: "青铜兔青青",
    template_caption: "IP 文创周边样机套装 —— 5+ 种周边载体设计一并呈现。",
    operator_outcome:
      "一次渲染得到完整 SKU 家族 —— 马克杯、托特包、贴纸、徽章套装、包装。从这一刻起，授权提案不再是角色研究，而是产品路线图。",
  },
};

const ZH_SEED: IpMerchDemoSeed = {
  hero: {
    title: "IP 周边设计工作流 —— 一份简报，四个阶段，完整 SKU 产品家族",
    subtitle:
      "用一个 IP 走完 Curify 的四个模板，把一份角色简报变成可上架的周边产品家族。品牌 → 系列 → SKU，每个阶段都锁定一致性。",
    workflow_summary:
      "这四个阶段就是我们为付费工厂客户运行的同一套引擎。每个阶段都以上一阶段锁定的产出作为约束，因此从角色设定表到礼盒样机，插画师的笔触始终保持一致。下面用我们 2026-06-08 案例研究中的 IP 示例，逐阶段演示一次。",
  },
  stages: IP_MERCH_DEMO_SEED.stages.map((s) => ({ ...s, ...ZH_STAGE_TEXT[s.id] })),
  cta: {
    ...IP_MERCH_DEMO_SEED.cta,
    primary_label: "用你的 IP 做 15 分钟演示",
    secondary_label: "阅读案例研究",
    closing_line:
      "每个阶段都基于真实的 IP 简报，以 SKU 的速度产出。用你的角色跑一遍 —— 你挑任意一个阶段，我们都会回寄一份两件套打样。",
  },
  ui: {
    eyebrow: "IP 周边设计演示 · 提案模式",
    prevStage: "上一阶段",
    nextStage: "下一阶段",
    stageWord: "阶段",
  },
  workflow: {
    eyebrow: "实时 · Merch Workflow",
    title: "一张简笔画，一键变成 10 张可投产图纸。",
    subtitle:
      "上传任意粗糙草图，Curify 的 Merch Workflow 立刻输出整套 SKU 的可印刷生产图纸 —— 300 DPI、CMYK、完美 3mm 出血线、裁切标记，每个产品都已排好尺寸。",
    uploadPrompt: "上传你的草图",
    uploadHint: "哪怕是 10 秒涂鸦也行 —— PNG 或 JPG。",
    uploadCta: "选择文件",
    runLabel: "运行 Merch Workflow",
    runningLabel: "正在生成生产图纸…",
    resultHeading: "{n} 张可投产图纸 · 300 DPI · CMYK · 3mm 出血",
    resetLabel: "重新开始",
    dpi: "300 DPI",
    color: "CMYK",
    bleed: "3mm 出血",
    products: [
      { key: "mug", label: "陶瓷马克杯" },
      { key: "tote", label: "帆布托特包" },
      { key: "badge", label: "搪瓷徽章" },
      { key: "tshirt", label: "T 恤" },
      { key: "sticker", label: "异形贴纸" },
      { key: "poster", label: "A2 海报" },
      { key: "phonecase", label: "手机壳" },
      { key: "notebook", label: "笔记本封面" },
      { key: "coaster", label: "圆形杯垫" },
      { key: "keychain", label: "亚克力钥匙扣" },
    ],
  },
};

const LOCALE_SEEDS: Record<string, IpMerchDemoSeed> = {
  en: IP_MERCH_DEMO_SEED,
  zh: ZH_SEED,
};

/** Locale-aware seed. zh → Chinese; everything else falls back to English. */
export function getIpMerchSeed(locale: string | undefined): IpMerchDemoSeed {
  const lang = (locale || "en").toLowerCase().split("-")[0];
  return LOCALE_SEEDS[lang] ?? IP_MERCH_DEMO_SEED;
}

/** Helper: get a stage by id (mirrors lib/illustrator_demo.ts getStyleById). */
export function getStageById(id: string): IpMerchStage | undefined {
  return IP_MERCH_DEMO_SEED.stages.find((s) => s.id === id);
}
