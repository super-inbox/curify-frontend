// Copy for /enterprise, in the two languages the Enterprise-AI line actually
// sells in: English (UK/EU/US entity) and Chinese (CN entity). Every other
// locale falls back to English.
//
// Source of truth for the substance:
// ~/curify-studio/docs/enterprise-ai-capability-one-pager.md — keep in sync.
//
// The Chinese is not a translation of the English; it is written in the
// vocabulary CN enterprise buyers use (招投标解读 / 合同审查 / 私有化部署 /
// 可溯源), because the CN buyers in this pipeline are traditional
// manufacturing, military-software and trading owners reached through
// relationships, not through search.
//
// TWO INTEGRITY CONSTRAINTS, both from
// ~/curify-studio/docs/workstream-enterprise-ai-b2b.md — do not relax them
// without a real change in the underlying facts:
//   1. The anchor engagement is a PROPOSAL, not a delivered contract. The
//      buyer is not named and it is described as architecture/approach.
//   2. The KPI numbers are targets we CONTRACT to and validate in the paid
//      POC on the buyer's own documents — not measured production averages.

export type EnterpriseLang = "en" | "zh";

export type EnterpriseCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  h1: string;
  problem: string;
  positioning: string;
  ctaPrimary: string;
  ctaSecondary: string;
  pillarsTitle: string;
  pillarsIntro: string;
  pillars: Array<{ n: string; title: string; body: string; detail: string[] }>;
  commitTitle: string;
  commitIntro: string;
  commitments: Array<{ metric: string; label: string; note: string }>;
  onPrem: { lead: string; body: string };
  whoTitle: string;
  founderTitle: string;
  founderBody: string;
  teamTitle: string;
  teamBody: string;
  teamCaveat: string;
  engageTitle: string;
  forEnterprises: string;
  pocTitle: string;
  pocBody: string;
  pocCta: string;
  forSi: string;
  siTitle: string;
  siBody: string;
  siCta: string;
  siAnchor: string;
  fitTitle: string;
  fits: Array<[string, string]>;
  closeTitle: string;
  closeBody: string;
  closeCta: string;
};

const EN: EnterpriseCopy = {
  meta: {
    title: "Enterprise AI Document Intelligence",
    description:
      "Production-grade, source-traceable AI over your own documents, on your own infrastructure. Tender and contract interpretation, private RAG knowledge management, and compliance review — delivered as a 2–4 week paid POC or as your white-label AI delivery partner.",
  },
  eyebrow: "Enterprise AI implementation",
  h1: "Production-grade AI over your own documents, on your own infrastructure.",
  problem:
    "Enterprises don’t fail at AI because the model is weak. They fail at production — turning probabilistic output into reliable, source-traceable, secure results at scale. Demos are easy; permissions, evaluation, audit logs and “never fabricate” are hard.",
  positioning:
    "We build the deterministic layer enterprises need above foundation models — not a prompt wrapper.",
  ctaPrimary: "Scope a 2-week POC",
  ctaSecondary: "I’m an SI / consultancy looking for a delivery partner →",
  pillarsTitle: "What we deliver",
  pillarsIntro:
    "Three capabilities on one stack: knowledge graph and intent routing, a template and rule engine, RAG with mandatory source citation, multilingual OCR and parsing, and local desensitisation before any AI step — so security is part of the pipeline rather than bolted on.",
  pillars: [
    {
      n: "01",
      title: "Intelligent document interpretation",
      body: "Import → parse → understand → structured output for tenders, contracts, reports and specs.",
      detail: [
        "Multi-format ingestion with OCR, auto-classification and foldering",
        "8-dimension structured extraction into your own checklist or schema — value, unit, condition, source, confidence",
        "Fields that aren’t in the document are marked “not specified”, never invented",
        "One-click package export",
      ],
    },
    {
      n: "02",
      title: "AI knowledge management (RAG)",
      body: "A private, source-cited insight repository instead of scattered reports and inboxes.",
      detail: [
        "Natural-language Q&A answered with citation to document · chapter · page",
        "Role-based permissions and tenant isolation",
        "Immutable audit log over every query and answer",
      ],
    },
    {
      n: "03",
      title: "Contract & compliance review",
      body: "Rule-library risk grading with every finding anchored to the clause it came from.",
      detail: [
        "High / medium / low risk grading, red-line and change-diff",
        "Seal and signature verification, negotiation-window alerts",
        "Rules maintained in natural language by legal or finance — no code",
      ],
    },
  ],
  commitTitle: "What we commit to",
  commitIntro:
    "These are the numbers we write into the POC and measure against — on your documents, in your environment, before any production rollout. If we miss them, you have not bought a production system and we have not earned the rollout.",
  commitments: [
    { metric: "≥ 90%", label: "extraction accuracy", note: "on key parameters and risk clauses" },
    { metric: "100%", label: "source-traceable", note: "every value anchored to doc · chapter · page" },
    { metric: "≥ 98%", label: "run consistency", note: "same input, same output — production, not gacha" },
    { metric: "6", label: "languages", note: "CN · EN · FR · ES · RU · PT, OCR and parsing" },
  ],
  onPrem: {
    lead: "On-premise by default.",
    body: "Sensitive data never leaves your servers; local desensitisation runs before any AI step. Private and air-gapped deployments supported.",
  },
  whoTitle: "Who builds it",
  founderTitle: "Jay Wang — founder, AI lead",
  founderBody:
    "16+ years in AI and data: Head of AI at ByBit, previously Principal Applied Science Manager at Microsoft and Director of Data Science at Kuaishou. Ph.D. in Statistics. Author of Building Recommender Systems Using LLMs (Springer, 2025) and a repeat speaker on RAG and enterprise LLM systems.",
  teamTitle: "Applied-AI team",
  teamBody:
    "Computer vision, speech and generative video, with production pipelines shipped across crawling, transcription, translation, TTS and synthesis — plus a reference architecture for six-language, on-premise tender interpretation and contract review scoped for a listed power-industry manufacturer.",
  teamCaveat:
    "(That engagement is in progress; we cite it as architecture and approach, not as a delivered reference.)",
  engageTitle: "How we engage",
  forEnterprises: "For enterprises",
  pocTitle: "A 2–4 week paid POC on one real workflow",
  pocBody:
    "We take one of your actual documents or workflows, run it end to end, and measure against the commitments above. Standardised scope — not open-ended custom development. Production rollout follows the POC, or it doesn’t.",
  pocCta: "Book a 30-minute discovery call",
  forSi: "For systems integrators & consultancies",
  siTitle: "White-label AI delivery partner",
  siBody:
    "You hold the framework positions, the qualifications and the client relationship. We deliver the agent / RAG / document-intelligence core underneath your name. Useful where a bid is technically weighted and the AI depth is the scored part.",
  siCta: "Talk about a partnership",
  siAnchor: "si-partners",
  fitTitle: "Typical starting points",
  fits: [
    ["A knowledge-management or market-intelligence repository", "insight repo with cited answers — capability 02"],
    ["An audit or financial data-extraction platform", "structured extraction plus audit trail — capability 01"],
    ["Tender and contract interpretation", "checklist extraction and risk review — capabilities 01 + 03"],
  ],
  closeTitle: "Bring us one document you dread.",
  closeBody:
    "The fastest way to find out whether this works on your data is to run it on your data. Two weeks, fixed scope, measured against the numbers above.",
  closeCta: "Start a conversation",
};

const ZH: EnterpriseCopy = {
  meta: {
    title: "企业级 AI 文档智能",
    description:
      "在你自己的服务器上，跑得住的 AI：招投标解读、合同审查、私有化知识库，每一条结论都可溯源到原文页码。2–4 周付费 POC 起步，也可作为集成商的白标交付伙伴。",
  },
  eyebrow: "企业 AI 落地",
  h1: "在你自己的服务器上，跑得住的 AI。",
  problem:
    "企业做 AI 失败，通常不是因为模型不够强，而是卡在「上生产」这一步——如何把概率性的输出，变成可靠、可溯源、可管控的结果，并且规模化跑起来。Demo 很容易；权限、评测、审计留痕、以及「绝不编造」很难。",
  positioning:
    "我们做的是基础模型之上、企业真正需要的那层确定性系统——不是一个 prompt 外壳。",
  ctaPrimary: "聊一个 2 周 POC",
  ctaSecondary: "我是集成商 / 咨询公司，在找交付伙伴 →",
  pillarsTitle: "我们交付什么",
  pillarsIntro:
    "三块能力跑在同一套底座上：知识图谱与意图路由、模板与规则引擎、强制引用来源的 RAG、多语种 OCR 与解析，以及在任何 AI 环节之前先做本地脱敏——安全是流程的一部分，不是事后补的。",
  pillars: [
    {
      n: "01",
      title: "文档智能解读",
      body: "导入 → 解析 → 理解 → 结构化输出，适用于招标文件、合同、报告与技术规格书。",
      detail: [
        "多格式接入，含 OCR、自动分类与归档",
        "按你自己的清单/字段做 8 维结构化抽取——数值、单位、条件、出处、置信度",
        "原文中没有的字段标注为「未提及」，绝不编造",
        "一键导出成套材料",
      ],
    },
    {
      n: "02",
      title: "AI 知识库（RAG）",
      body: "把散落在各处的报告和邮件，变成一个私有的、带出处的知识资产。",
      detail: [
        "自然语言问答，答案精确引用到 文档 · 章节 · 页码",
        "角色权限与租户隔离",
        "每一次提问与回答均留下不可篡改的审计记录",
      ],
    },
    {
      n: "03",
      title: "合同与合规审查",
      body: "基于规则库的风险分级，每一条结论都锚定到具体条款。",
      detail: [
        "高 / 中 / 低风险分级，红线提示与版本比对",
        "印章与签署核验、谈判窗口期提醒",
        "法务或财务用自然语言维护规则——不需要写代码",
      ],
    },
  ],
  commitTitle: "我们承诺的指标",
  commitIntro:
    "这些数字会写进 POC 合同，并在你的文档、你的环境里实测——在任何生产上线之前。达不到，就说明你没有买到一套能上生产的系统，我们也不该拿到后续的推广。",
  commitments: [
    { metric: "≥ 90%", label: "抽取准确率", note: "关键参数与风险条款" },
    { metric: "100%", label: "可溯源", note: "每个数值锚定到 文档 · 章节 · 页码" },
    { metric: "≥ 98%", label: "运行一致性", note: "同样的输入给同样的输出，不靠碰运气" },
    { metric: "6", label: "语种", note: "中 · 英 · 法 · 西 · 俄 · 葡，OCR 与解析" },
  ],
  onPrem: {
    lead: "默认私有化部署。",
    body: "敏感数据不出你的服务器；任何 AI 环节之前先做本地脱敏。支持私有云与内网隔离部署。",
  },
  whoTitle: "谁在做这件事",
  founderTitle: "Jay Wang — 创始人 / AI 负责人",
  founderBody:
    "16 年以上 AI 与数据经验：ByBit AI 负责人，此前任微软 Principal Applied Science Manager、快手数据科学总监。统计学博士，《Building Recommender Systems Using LLMs》（Springer, 2025）作者，多次受邀分享 RAG 与企业级大模型系统。",
  teamTitle: "应用 AI 团队",
  teamBody:
    "覆盖计算机视觉、语音与生成式视频，已上线的生产管线包括采集、转写、翻译、TTS 与合成；并已为一家上市电气制造企业设计了六语种、私有化部署的招投标解读与合同审查参考架构。",
  teamCaveat: "（该项目仍在推进中，我们把它作为架构与方法引用，而非已交付案例。）",
  engageTitle: "合作方式",
  forEnterprises: "面向企业",
  pocTitle: "2–4 周付费 POC，只做一条真实业务流",
  pocBody:
    "拿你手上一份真实的文档或一条真实的流程，端到端跑通，并对照上面的指标实测。范围标准化——不是没有边界的定制开发。跑通了再谈推广，跑不通就不谈。",
  pocCta: "预约 30 分钟沟通",
  forSi: "面向系统集成商与咨询公司",
  siTitle: "白标 AI 交付伙伴",
  siBody:
    "资质、入围资格和客户关系在你那边；智能体 / RAG / 文档智能的内核由我们在你的品牌下交付。特别适合技术分占比高、AI 深度是评分项的项目。",
  siCta: "聊聊合作",
  siAnchor: "si-partners",
  fitTitle: "常见的切入点",
  fits: [
    ["知识库 / 行业情报库", "带出处的问答知识库 — 能力 02"],
    ["审计或财务数据抽取平台", "结构化抽取 + 审计留痕 — 能力 01"],
    ["招投标与合同解读", "清单抽取 + 风险审查 — 能力 01 + 03"],
  ],
  closeTitle: "拿一份你最头疼的文档过来。",
  closeBody:
    "判断这套东西在你的数据上到底行不行，最快的办法是直接在你的数据上跑一遍。两周，范围固定，对照上面的指标验收。",
  closeCta: "开始沟通",
};

export const ENTERPRISE_COPY: Record<EnterpriseLang, EnterpriseCopy> = { en: EN, zh: ZH };

/** Every locale except `zh` gets the English page. */
export function enterpriseLang(locale: string): EnterpriseLang {
  return locale === "zh" ? "zh" : "en";
}
