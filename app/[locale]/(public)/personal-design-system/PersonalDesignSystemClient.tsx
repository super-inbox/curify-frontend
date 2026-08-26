"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Palette, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  DESIGN_DISCIPLINES,
  MAX_PORTFOLIO_DESCRIPTION_LEN,
  MIN_PORTFOLIO_DESCRIPTION_LEN,
  type PersonalDesignSystemResult,
  type SupportedPersonalDesignSystemLocale,
} from "@/lib/personal_design_system";
import { useTracking } from "@/services/useTracking";

const GENERATE_ENDPOINT = "/api/personal-design-system/generate";

type Copy = {
  steps: [string, string, string];
  nameLabel: string;
  namePlaceholder: string;
  disciplineLabel: string;
  whatYouGetLabel: string;
  whatYouGetItems: string[];
  descriptionLabel: string;
  descriptionHelper: string;
  descriptionPlaceholder: string;
  charCount: (len: number, min: number, max: number) => string;
  submitLabel: string;
  submittingLabel: string;
  loadingTitle: string;
  loadingBody: string;
  errorRetryLabel: string;
  resultBadge: string;
  colorSystemTitle: string;
  visualStyleTitle: string;
  typographyTitle: string;
  compositionTitle: string;
  signatureMotifsTitle: string;
  imageLanguageTitle: string;
  designPrinciplesTitle: string;
  copyLabel: string;
  copiedLabel: string;
  startOverLabel: string;
  nextActionTitle: string;
  nextActionBody: string;
  nextActionCta: string;
  disclaimer: string;
};

const EN_COPY: Copy = {
  steps: [
    "Describe your portfolio",
    "Curify synthesizes it",
    "Get a reusable design system",
  ],
  nameLabel: "Your name or studio (optional)",
  namePlaceholder: "e.g. Mia Chen Design",
  disciplineLabel: "Primary discipline (optional)",
  whatYouGetLabel: "What you'll get",
  whatYouGetItems: [
    "Visual Style",
    "Color System",
    "Typography",
    "Composition",
    "Signature Motifs",
    "Image Language",
    "Design Principles",
  ],
  descriptionLabel: "Describe your portfolio in your own words",
  descriptionHelper:
    "There's no portfolio link to paste — tell Curify about your work directly: the mediums you work in, colors and materials you keep returning to, typographic habits, recurring motifs, and a project you're proud of and why.",
  descriptionPlaceholder:
    "e.g. I design packaging and brand identity for independent food & beverage brands. I keep coming back to warm, tactile palettes — terracotta, cream, deep olive — paired with a single confident serif headline and a lot of negative space. My favorite project was a tea brand relaunch where...",
  charCount: (len, min, max) => (len < min ? `${len}/${min} min` : `${len}/${max}`),
  submitLabel: "Generate my design system",
  submittingLabel: "Generating…",
  loadingTitle: "Synthesizing your personal design system…",
  loadingBody:
    "Curify is reading your description and structuring it into visual style, color, typography, composition, motifs, image language, and design principles. This usually takes 10–20 seconds.",
  errorRetryLabel: "Try again",
  resultBadge: "Your personal design system",
  colorSystemTitle: "Color System",
  visualStyleTitle: "Visual Style",
  typographyTitle: "Typography",
  compositionTitle: "Composition",
  signatureMotifsTitle: "Signature Visual Motifs",
  imageLanguageTitle: "Image / Illustration / Photography Language",
  designPrinciplesTitle: "Design Principles",
  copyLabel: "Copy as text",
  copiedLabel: "Copied",
  startOverLabel: "Start over",
  nextActionTitle: "Put this design system to work",
  nextActionBody:
    "Take the visual language above into the Brand Direction Explorer and generate a concrete visual from it — a poster, moodboard, or campaign key visual in the same direction.",
  nextActionCta: "Explore a new creative direction with this design system",
  disclaimer:
    "Generated from the description you wrote above by an OpenAI model — Curify does not crawl portfolio URLs or analyze uploaded images for this tool. Review before sharing it as a final deliverable.",
};

const ZH_COPY: Copy = {
  steps: ["描述你的作品集", "Curify 进行归纳整理", "获得可复用的设计系统"],
  nameLabel: "你的姓名或工作室（可选）",
  namePlaceholder: "例如：陈米亚设计工作室",
  disciplineLabel: "主要设计领域（可选）",
  whatYouGetLabel: "你将获得",
  whatYouGetItems: [
    "视觉风格",
    "色彩系统",
    "字体与排版",
    "构图",
    "标志性视觉元素",
    "图像语言",
    "设计原则",
  ],
  descriptionLabel: "用你自己的话描述你的作品集",
  descriptionHelper:
    "无需粘贴作品集链接 —— 直接告诉 Curify 你的创作情况：常用的媒介、反复使用的色彩与材质、排版习惯、常见的视觉元素，以及一个你最自豪的项目及原因。",
  descriptionPlaceholder:
    "例如：我为独立食品与饮品品牌设计包装和品牌视觉识别。我常常使用温暖、有质感的调色板——赤陶色、奶油色、深橄榄绿——搭配一个自信有力的衬线标题字体，并大量留白。我最喜欢的项目是一次茶品牌重塑，当时……",
  charCount: (len, min, max) => (len < min ? `${len}/${min} 最少字数` : `${len}/${max}`),
  submitLabel: "生成我的设计系统",
  submittingLabel: "生成中…",
  loadingTitle: "正在归纳你的个人设计系统…",
  loadingBody:
    "Curify 正在阅读你的描述，并将其整理为视觉风格、色彩系统、字体、构图、标志性元素、图像/插画/摄影语言与设计原则。通常需要 10–20 秒。",
  errorRetryLabel: "重试",
  resultBadge: "你的个人设计系统",
  colorSystemTitle: "色彩系统",
  visualStyleTitle: "视觉风格",
  typographyTitle: "字体排印",
  compositionTitle: "构图",
  signatureMotifsTitle: "标志性视觉元素",
  imageLanguageTitle: "图像 / 插画 / 摄影语言",
  designPrinciplesTitle: "设计原则",
  copyLabel: "复制为文本",
  copiedLabel: "已复制",
  startOverLabel: "重新开始",
  nextActionTitle: "把这个设计系统用起来",
  nextActionBody:
    "把上面的视觉语言带入品牌创意方向探索工具，生成一个具体的视觉方案——同一方向下的海报、mood board 或活动主视觉。",
  nextActionCta: "用这个设计系统探索新的创意方向",
  disclaimer:
    "以上内容由 OpenAI 模型根据你在上方填写的描述生成 —— 本工具不会抓取作品集链接，也不会分析上传的图片。作为最终交付物分享前请自行复核。",
};

function copyForLocale(locale: SupportedPersonalDesignSystemLocale): Copy {
  return locale === "zh" ? ZH_COPY : EN_COPY;
}

function resolveUiLocale(locale: string): SupportedPersonalDesignSystemLocale {
  return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

type Phase = "input" | "loading" | "result" | "error";

function SectionCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-indigo-700">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{body}</p>
    </div>
  );
}

function resultAsPlainText(result: PersonalDesignSystemResult, uiLocale: SupportedPersonalDesignSystemLocale, copy: Copy): string {
  const l = uiLocale;
  const lines = [
    result.summary[l],
    "",
    `${copy.visualStyleTitle}: ${result.visualStyle[l]}`,
    "",
    `${copy.colorSystemTitle}: ${result.colorSystem[l]}`,
    ...result.colorSystem.palette.map((c) => `  - ${c.hex} ${c.name[l]}`),
    "",
    `${copy.typographyTitle}: ${result.typography[l]}`,
    "",
    `${copy.compositionTitle}: ${result.composition[l]}`,
    "",
    `${copy.signatureMotifsTitle}: ${result.signatureMotifs[l]}`,
    "",
    `${copy.imageLanguageTitle}: ${result.imageLanguage[l]}`,
    "",
    `${copy.designPrinciplesTitle}: ${result.designPrinciples[l]}`,
  ];
  return lines.join("\n");
}

export default function PersonalDesignSystemClient({ locale }: { locale: string }) {
  const uiLocale = resolveUiLocale(locale);
  const copy = copyForLocale(uiLocale);
  const { trackAction } = useTracking();

  const [designerName, setDesignerName] = useState("");
  const [discipline, setDiscipline] = useState<string>("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<PersonalDesignSystemResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const trimmedLen = portfolioDescription.trim().length;
  const canSubmit = trimmedLen >= MIN_PORTFOLIO_DESCRIPTION_LEN && trimmedLen <= MAX_PORTFOLIO_DESCRIPTION_LEN && phase !== "loading";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPhase("loading");
    setErrorMessage(null);
    trackAction(
      { contentId: `personal-design-system:${discipline || "unspecified"}`, contentType: "tool_card" },
      "generate",
    );
    try {
      const res = await fetch(GENERATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designerName, discipline, portfolioDescription }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.result) {
        setErrorMessage(
          typeof data.error === "string" && data.error
            ? data.error
            : "Could not generate your design system right now. Please try again.",
        );
        setPhase("error");
        return;
      }
      setResult(data.result as PersonalDesignSystemResult);
      setPhase("result");
    } catch {
      setErrorMessage("Could not generate your design system right now. Please try again.");
      setPhase("error");
    }
  };

  const handleStartOver = () => {
    setPhase("input");
    setResult(null);
    setErrorMessage(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resultAsPlainText(result, uiLocale, copy));
      setCopied(true);
      trackAction(
        { contentId: `personal-design-system:copy:${discipline || "unspecified"}`, contentType: "tool_card" },
        "copy",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; nothing to recover.
    }
  };

  // Deep-links the result into the Brand Direction Explorer's free-form
  // "agent-brief" case via ?brief=/&brandName= — a real, existing route
  // (BrandDirectionExplorerClient reads these on mount). Kept short: the
  // brief field there caps at 400 chars, so this only ever sends the
  // one-line summary, never the full design system.
  const exploreHref = useMemo(() => {
    if (!result) return "/tools/brand-direction-explorer";
    const params = new URLSearchParams();
    const brief = result.summary[uiLocale].slice(0, 380);
    params.set("brief", brief);
    if (designerName.trim()) params.set("brandName", designerName.trim().slice(0, 60));
    return `/tools/brand-direction-explorer?${params.toString()}`;
  }, [result, uiLocale, designerName]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 pb-10 pt-2 sm:px-6">
      {/* The tools page shell already renders the H1 + description, matching
          the Brand Direction Explorer's convention of not repeating it here. */}

      {phase === "input" || phase === "loading" || phase === "error" ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {copy.steps.map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-neutral-800">{step}</span>
              </div>
            ))}
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg bg-indigo-50/70 px-3 py-2.5">
              <span className="text-xs font-semibold text-indigo-700">{copy.whatYouGetLabel}:</span>
              {copy.whatYouGetItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-inset ring-indigo-100"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-800" htmlFor="pds-name">
                {copy.nameLabel}
              </label>
              <input
                id="pds-name"
                type="text"
                value={designerName}
                disabled={phase === "loading"}
                onChange={(e) => setDesignerName(e.target.value)}
                placeholder={copy.namePlaceholder}
                maxLength={80}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-semibold text-neutral-800">{copy.disciplineLabel}</span>
              <div className="flex flex-wrap gap-2">
                {DESIGN_DISCIPLINES.map((d) => {
                  const active = d.id === discipline;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      aria-pressed={active}
                      disabled={phase === "loading"}
                      onClick={() => setDiscipline(active ? "" : d.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {d.label[uiLocale]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-800" htmlFor="pds-description">
                {copy.descriptionLabel}
              </label>
              <p className="text-xs text-neutral-500">{copy.descriptionHelper}</p>
              <textarea
                id="pds-description"
                value={portfolioDescription}
                disabled={phase === "loading"}
                onChange={(e) => setPortfolioDescription(e.target.value)}
                placeholder={copy.descriptionPlaceholder}
                maxLength={MAX_PORTFOLIO_DESCRIPTION_LEN}
                rows={7}
                className="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
              <div className="text-right text-xs text-neutral-400">
                {copy.charCount(portfolioDescription.length, MIN_PORTFOLIO_DESCRIPTION_LEN, MAX_PORTFOLIO_DESCRIPTION_LEN)}
              </div>
            </div>

            {phase === "error" && errorMessage && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-6 py-3 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {copy.submittingLabel}
                </>
              ) : phase === "error" ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  {copy.errorRetryLabel}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {copy.submitLabel}
                </>
              )}
            </button>
          </section>

          {phase === "loading" && (
            <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <h2 className="text-base font-bold text-neutral-900">{copy.loadingTitle}</h2>
              <p className="max-w-md text-sm text-neutral-600">{copy.loadingBody}</p>
            </section>
          )}
        </>
      ) : null}

      {phase === "result" && result && (
        <div className="space-y-8">
          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-sm sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              <Sparkles className="h-3 w-3" />
              {copy.resultBadge}
            </span>
            <p className="mt-4 text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
              {result.summary[uiLocale]}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {result.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-700">
              <Palette className="h-4 w-4" />
              {copy.colorSystemTitle}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700">{result.colorSystem[uiLocale]}</p>
            <div className="flex flex-wrap gap-3">
              {result.colorSystem.palette.map((swatch) => (
                <div key={swatch.hex} className="flex w-20 flex-col items-center gap-1.5 text-center">
                  <span
                    className="h-14 w-14 rounded-lg border border-black/5 shadow-sm"
                    style={{ backgroundColor: swatch.hex }}
                    aria-hidden
                  />
                  <span className="text-[10px] font-semibold uppercase text-neutral-500">{swatch.hex}</span>
                  <span className="text-[11px] leading-tight text-neutral-600">{swatch.name[uiLocale]}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SectionCard title={copy.visualStyleTitle} body={result.visualStyle[uiLocale]} />
            <SectionCard title={copy.typographyTitle} body={result.typography[uiLocale]} />
            <SectionCard title={copy.compositionTitle} body={result.composition[uiLocale]} />
            <SectionCard title={copy.signatureMotifsTitle} body={result.signatureMotifs[uiLocale]} />
            <SectionCard title={copy.imageLanguageTitle} body={result.imageLanguage[uiLocale]} />
            <SectionCard title={copy.designPrinciplesTitle} body={result.designPrinciples[uiLocale]} />
          </div>

          <p className="text-xs text-neutral-400">{copy.disclaimer}</p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? copy.copiedLabel : copy.copyLabel}
            </button>
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              {copy.startOverLabel}
            </button>
          </div>

          <section className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-stone-50 to-neutral-100 p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-neutral-900">{copy.nextActionTitle}</h3>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600">{copy.nextActionBody}</p>
            <Link
              href={exploreHref}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              {copy.nextActionCta}
            </Link>
          </section>
        </div>
      )}
    </main>
  );
}
