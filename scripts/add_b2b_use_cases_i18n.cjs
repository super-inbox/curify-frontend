// Adds B2B-tier use-case i18n into all 9 non-en locales:
//   - entryBar.useCases label rewrites (for-marketers, for-publishers) +
//     two new labels (for-dtc-brands, for-programmatic-seo)
//   - interconnection.builtForTeams / .apiAvailable / .apiContactCTA
//   - useCasePage entries for the 4 B2B pages (rewrites for-marketers and
//     for-publishers, adds for-dtc-brands and for-programmatic-seo)
//
// Run once: `node scripts/add_b2b_use_cases_i18n.cjs`
//
// ZH gets a hand translation. Other 8 locales get the EN copy as a
// fallback — B2B buyers for these ICPs (DTC cross-border, EdTech,
// ProgSEO, growth agencies) are mostly English-speaking; refine the
// other locales after market validation.

const fs = require('fs');
const path = require('path');

const EN = {
  entryLabels: {
    'for-marketers': 'For Growth Agencies',
    'for-publishers': 'For EdTech & Publishers',
    'for-dtc-brands': 'For DTC Brands',
    'for-programmatic-seo': 'For Programmatic SEO',
  },
  interconnection: {
    builtForTeams: 'Built for teams',
    apiAvailable: 'APIs available on request.',
    apiContactCTA: 'Let’s talk scope →',
  },
  pages: {
    'for-marketers': {
      title: 'For Marketing & Growth Agencies',
      subtitle: 'Serve 50 clients with the headcount you have for 10',
      description: 'Agency scaling is people-scaling — until it isn’t. Hand each account manager a white-labeled content factory: brief in a brand profile, get back a month of platform-native posts across travel, lifestyle, design, and product verticals. The same engineer ships for all 50 clients. Margin scales linearly; headcount doesn’t.',
      bullet0: 'White-label content engine — your brand, your client, your delivery',
      bullet1: 'Per-account brand profiles: tone, style, palette, posting schedule',
      bullet2: 'Covers travel · lifestyle · design · product verticals out of the box',
      bullet3: 'Packaged as: per-seat license OR per-managed-account tier — pick a model, no custom retainer',
    },
    'for-publishers': {
      title: 'For EdTech & Children’s Publishers',
      subtitle: 'Industrial-grade content pipeline — what your illustrator ships in 3 months, ship in a weekend',
      description: 'Outsourced illustrators take months to deliver a 500-card vocabulary set. Our engine takes hours. Same characters across cards, posters, classroom decor, and social — one title, ten surfaces. Or license the underlying vocabulary engine so your own platform can generate K-5 content in en / es / zh / ja / ko, bilingual editions included, no translator team required.',
      bullet0: 'K-5 vocabulary engine across animals · nature · space · family · transportation (30+ templates, 5 languages)',
      bullet1: 'Format extension: one title → cards · posters · social · classroom decor',
      bullet2: 'Bilingual editions (en-zh / en-es / en-ja / en-ko) — no translator team',
      bullet3: 'Packaged as: white-label engine license OR done-for-you pack subscription — pick a shape, no half-builds',
    },
    'for-dtc-brands': {
      title: 'For DTC Brands & Cross-Border Ecommerce',
      subtitle: 'One product photo → 100 scroll-stopping scenes, auto-scheduled to Pinterest, Instagram, TikTok, X',
      description: 'Cross-border ecommerce lives or dies by daily social volume. Stop waiting on a design contractor to ship five lifestyle shots a week. One product photo enters our engine; a hundred styled scenes — café, garden, kids’ room, vacation, seasonal — come out, watermark-clean and scheduled across four platforms before lunch. Built to move ROAS, not to win portfolio awards.',
      bullet0: 'Batch-generate 100+ lifestyle / scene variants from one product photo',
      bullet1: 'Style presets matched to Pinterest / Instagram / TikTok / X aesthetics',
      bullet2: 'Auto-schedule across four platforms via the built-in SMM queue',
      bullet3: 'Packaged as: 500-image / 2,000-image / unlimited monthly tiers — fixed scope, no custom dev',
    },
    'for-programmatic-seo': {
      title: 'For Programmatic SEO Builders',
      subtitle: 'We ran our own 5,500-page hub-and-spoke generator — now you can run yours',
      description: 'Long-tail keyword pages don’t rank without original imagery and editorial layout. We know — we built 5,500 of them for Curify itself, and you’re reading one of the hubs right now. License the same generator: batch-generated hero imagery, schema-aware page templates, internal-link mesh. Affiliate sites, vertical portals (travel, study-abroad, parenting), local-SEO networks — pick your niche, generate the pages, get indexed.',
      bullet0: 'Hub-and-spoke generator with built-in internal-link mesh',
      bullet1: 'Original hero imagery per page — no royalty-free filler, no thin-content penalty',
      bullet2: 'Schema-aware templates ready for AffiliateProduct / FAQ / HowTo markup',
      bullet3: 'Packaged as: hosted generator OR self-hosted Docker — fixed-scope CMS adapter, no custom rewrites',
    },
  },
};

const ZH = {
  entryLabels: {
    'for-marketers': '营销与代运营',
    'for-publishers': '教育科技与出版',
    'for-dtc-brands': 'DTC 出海品牌',
    'for-programmatic-seo': '程序化 SEO',
  },
  interconnection: {
    builtForTeams: '面向团队打造',
    apiAvailable: '可按需提供 API。',
    apiContactCTA: '我们来聊聊范围 →',
  },
  pages: {
    'for-marketers': {
      title: '面向营销与增长代运营',
      subtitle: '用现有10人团队的人力，服务50个客户',
      description: '代运营的瓶颈是人力规模化——直到它不再是。把白标内容工厂交给每位客户经理：输入品牌资料，输出一个月的多平台原生内容，覆盖旅行、生活方式、设计与产品垂类。同一个工程师服务全部50个客户。利润线性增长，人头不变。',
      bullet0: '白标内容引擎——你的品牌、你的客户、你的交付',
      bullet1: '按账户配置品牌资料：调性、风格、配色、排期',
      bullet2: '开箱覆盖旅行 · 生活方式 · 设计 · 产品垂类',
      bullet3: '打包形态：按席位授权 或 按托管账户分层——挑模式，不做定制保底',
    },
    'for-publishers': {
      title: '面向教育科技与儿童出版',
      subtitle: '工业级内容流水线——插画师三个月的活，一个周末交付',
      description: '外包插画师画一套 500 张词汇卡需要数月。我们的引擎只需几小时。同一套角色铺到卡片、海报、教室装饰与社交——一个标题，十个表面。或者授权底层词汇引擎，让你自己的平台用 en / es / zh / ja / ko 生成 K-5 内容，双语版本开箱可用，不再需要翻译团队。',
      bullet0: 'K-5 词汇引擎，覆盖动物 · 自然 · 太空 · 家庭 · 交通（30+ 模板，5 种语言）',
      bullet1: '格式扩展：一个标题 → 卡片 · 海报 · 社交 · 教室装饰',
      bullet2: '双语版本（en-zh / en-es / en-ja / en-ko）—— 无需翻译团队',
      bullet3: '打包形态：白标引擎授权 或 全托管内容包订阅——挑形态，不留半成品',
    },
    'for-dtc-brands': {
      title: '面向跨境出海品牌与 DTC 独立站',
      subtitle: '一张产品图 → 100 张滑动停留场景，自动排期到 Pinterest / Instagram / TikTok / X',
      description: '跨境电商的生死取决于每日社媒产量。别再等设计外包一周交五张生活场景图。一张产品图进入引擎，午饭前 100 张风格化场景——咖啡馆、花园、儿童房、度假、节日、季节——干净无水印地排期分发到四大平台。为 ROAS 服务，不为作品集服务。',
      bullet0: '从一张产品图批量生成 100+ 生活方式 / 场景变体',
      bullet1: '针对 Pinterest / Instagram / TikTok / X 美学的风格预设',
      bullet2: '内建 SMM 队列，自动排期分发四大平台',
      bullet3: '打包形态：500 图 / 2,000 图 / 不限量月度分层——固定范围，不做定制开发',
    },
    'for-programmatic-seo': {
      title: '面向程序化 SEO 站群运营者',
      subtitle: '我们自己跑了 5,500 页的 hub-and-spoke 生成器——现在你也可以',
      description: '长尾关键词页面没有原创配图与编辑级排版就拿不到排名。我们知道——Curify 自己就建了 5,500 页，你现在读的就是其中一个 hub。授权同一套生成器：批量生成的 hero 图、schema 感知的页面模板、内链网状结构。联盟营销站、垂类门户（旅游、留学、育儿）、本地 SEO 矩阵——挑你的细分，生成页面，等待收录。',
      bullet0: 'Hub-and-spoke 生成器，内置内链网状结构',
      bullet1: '每页原创 hero 图——告别免版税滤镜与瘦内容惩罚',
      bullet2: 'Schema 感知模板，开箱支持 AffiliateProduct / FAQ / HowTo 标记',
      bullet3: '打包形态：托管生成器 或 自托管 Docker——固定范围的 CMS 适配器，不做重写',
    },
  },
};

// Locales receiving EN-fallback for B2B content. Refine after validation.
const FALLBACK_LOCALES = ['de', 'es', 'fr', 'hi', 'ja', 'ko', 'ru', 'tr'];

const LOCALE_PAYLOAD = {
  zh: ZH,
  ...Object.fromEntries(FALLBACK_LOCALES.map((loc) => [loc, EN])),
};

for (const [locale, payload] of Object.entries(LOCALE_PAYLOAD)) {
  const filePath = path.join(__dirname, '..', 'messages', locale, 'common.json');
  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 1) entryBar.useCases labels
  json.entryBar = json.entryBar ?? {};
  json.entryBar.useCases = {
    ...(json.entryBar.useCases ?? {}),
    ...payload.entryLabels,
  };

  // 2) interconnection strings
  json.interconnection = {
    ...(json.interconnection ?? {}),
    ...payload.interconnection,
  };

  // 3) useCasePage entries — overwrite the 2 B2B rebrands, add the 2 new ones
  json.useCasePage = {
    ...(json.useCasePage ?? {}),
    ...payload.pages,
  };

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  console.log('Updated', locale);
}
