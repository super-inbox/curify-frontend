"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Download, Loader2 } from "lucide-react";
import {
  BRAND_DIRECTION_CASES,
  buildBrandDirectionPrompt,
  type BrandDirectionCase,
  type CreativeDirection,
  type SupportedBrandDirectionLocale,
} from "@/lib/brand_direction_explorer";
import { useFreeformGenerate } from "@/services/useFreeformGenerate";
import { useTracking } from "@/services/useTracking";

type Copy = {
  heroTitle: string;
  heroDescription: string;
  steps: [string, string, string];
  fieldsSectionTitle: string;
  directionsSectionTitle: string;
  charCount: (len: number, max: number) => string;
  previewComingSoon: string;
  presetStyleReference: string;
  selectedBadge: string;
  promptPreviewLabel: string;
  promptPreviewHint: string;
  generateReadyLabel: string;
  generatingLabel: string;
  perGenerationInfo: string;
  creditsInfo: string;
  regenerateLabel: string;
  regenerateCreditsNotice: string;
  downloadLabel: string;
  generatingResultText: string;
  resultSectionTitle: string;
  resultEmptyState: string;
  faqTitle: string;
  faq: [{ q: string; a: string }, { q: string; a: string }, { q: string; a: string }];
};

const EN_COPY: Copy = {
  heroTitle: "Brand Direction Explorer",
  heroDescription:
    "Pick a creative direction from a preset scenario, then generate the matching visual.",
  steps: ["Choose a scenario", "Pick a direction", "Generate a visual"],
  fieldsSectionTitle: "Tell us about your brand",
  directionsSectionTitle: "Pick a direction",
  charCount: (len, max) => `${len}/${max}`,
  previewComingSoon: "Preview coming soon",
  presetStyleReference: "Preset style reference",
  selectedBadge: "Selected",
  promptPreviewLabel: "Prompt preview",
  promptPreviewHint: "Fill in the fields above and pick a direction to preview the prompt.",
  generateReadyLabel: "Generate visual",
  generatingLabel: "Generating",
  perGenerationInfo: "1 image per generation",
  creditsInfo: "10 credits",
  regenerateLabel: "Regenerate",
  regenerateCreditsNotice: "Regenerating uses another 10 credits.",
  downloadLabel: "Download",
  generatingResultText: "Generating your visual…",
  resultSectionTitle: "Result",
  resultEmptyState: "Your generated visual will appear here.",
  faqTitle: "FAQ",
  faq: [
    {
      q: "Are these directions generated automatically in real time?",
      a: "The directions in this P0 are curated by hand, to keep presentation quality and stability predictable.",
    },
    {
      q: "How many results does one generation produce?",
      a: "After you pick one direction, a single generation produces exactly one result.",
    },
    {
      q: "Is the generated text guaranteed to be fully accurate?",
      a: "Short headlines tend to render more reliably in image generation — please double-check any important text afterward.",
    },
  ],
};

const ZH_COPY: Copy = {
  heroTitle: "品牌创意方向探索",
  heroDescription: "从预置场景中选择一个创意方向，再生成对应的视觉方案。",
  steps: ["选择场景", "选择方向", "生成视觉"],
  fieldsSectionTitle: "填写品牌基本信息",
  directionsSectionTitle: "选择方向",
  charCount: (len, max) => `${len}/${max}`,
  previewComingSoon: "预览图待生成",
  presetStyleReference: "预置风格参考",
  selectedBadge: "已选择",
  promptPreviewLabel: "提示词预览",
  promptPreviewHint: "填写上方字段并选择一个方向后，即可预览提示词。",
  generateReadyLabel: "生成视觉",
  generatingLabel: "生成中",
  perGenerationInfo: "每次生成 1 张图片",
  creditsInfo: "10 积分",
  regenerateLabel: "重新生成",
  regenerateCreditsNotice: "重新生成将再消耗 10 积分。",
  downloadLabel: "下载",
  generatingResultText: "正在生成视觉方案…",
  resultSectionTitle: "生成结果",
  resultEmptyState: "生成结果将在这里显示。",
  faqTitle: "常见问题",
  faq: [
    { q: "这些方向是实时自动生成的吗？", a: "P0 中的方向是经过人工预置的，以保证展示质量和稳定性。" },
    { q: "一次会生成几个结果？", a: "用户选择一个方向后，一次只生成一个结果。" },
    { q: "生成文字是否保证完全准确？", a: "短标题通常更适合图像生成，重要文字仍应在后续编辑中复核。" },
  ],
};

function copyForLocale(locale: SupportedBrandDirectionLocale): Copy {
  return locale === "zh" ? ZH_COPY : EN_COPY;
}

// Only en/zh have real copy right now; every other route locale falls back
// to English rather than rendering a raw i18n key or a missing string.
function resolveUiLocale(locale: string): SupportedBrandDirectionLocale {
  return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

// Purely presentational — keyed by direction id, not part of the seed data in
// lib/brand_direction_explorer.ts (that file stays UI-agnostic). Every
// previewImage.src is null in P0, so these are static, hand-picked Tailwind
// treatments standing in for a real image: coffee directions get one blended
// gradient card; tea directions get a small palette-swatch strip loosely
// matching each direction's actual color palette described in its
// promptModifier, so the three tea cards read as visually distinct at a
// glance even before there is a preview photo.
const COFFEE_PREVIEW_GRADIENT: Record<string, string> = {
  "coffee-warm-neighborhood": "bg-gradient-to-br from-amber-100 via-orange-100 to-amber-300",
  "coffee-modern-specialty": "bg-gradient-to-br from-stone-50 via-neutral-100 to-stone-300",
  "coffee-retro-roastery": "bg-gradient-to-br from-red-900 via-amber-800 to-stone-900",
};
const COFFEE_PREVIEW_TEXT_CLASS: Record<string, string> = {
  "coffee-warm-neighborhood": "text-amber-900/70",
  "coffee-modern-specialty": "text-neutral-500",
  "coffee-retro-roastery": "text-amber-50/80",
};
const TEA_PREVIEW_SWATCHES: Record<string, string[]> = {
  "tea-zen-minimalist": ["bg-green-200", "bg-stone-100", "bg-neutral-900", "bg-amber-300"],
  "tea-apothecary-vintage": ["bg-amber-50", "bg-amber-700", "bg-green-800", "bg-neutral-900"],
  "tea-modern-oriental": ["bg-green-900", "bg-neutral-900", "bg-orange-700", "bg-stone-50"],
};

function aspectClassFor(brandCase: BrandDirectionCase): string {
  return brandCase.outputFormat.aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-[3/4]";
}

function DirectionPreview({
  brandCase,
  direction,
  copy,
}: {
  brandCase: BrandDirectionCase;
  direction: CreativeDirection;
  copy: Copy;
}) {
  const aspect = aspectClassFor(brandCase);

  if (direction.previewImage.kind === "placeholder") {
    return (
      <div
        className={`relative ${aspect} w-full overflow-hidden rounded-t-2xl ${COFFEE_PREVIEW_GRADIENT[direction.id] ?? "bg-neutral-100"}`}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-wide ${COFFEE_PREVIEW_TEXT_CLASS[direction.id] ?? "text-neutral-500"}`}
        >
          {copy.previewComingSoon}
        </div>
      </div>
    );
  }

  const swatches = TEA_PREVIEW_SWATCHES[direction.id] ?? [];
  return (
    <div className={`relative ${aspect} w-full overflow-hidden rounded-t-2xl bg-neutral-50`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex gap-1.5">
          {swatches.map((swatchClass, i) => (
            <span
              key={i}
              className={`h-8 w-8 rounded-md border border-black/5 ${swatchClass}`}
            />
          ))}
        </div>
        <span className="text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {copy.presetStyleReference}
        </span>
      </div>
    </div>
  );
}

function DirectionCard({
  brandCase,
  direction,
  selected,
  disabled,
  onSelect,
  copy,
  uiLocale,
}: {
  brandCase: BrandDirectionCase;
  direction: CreativeDirection;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  copy: Copy;
  uiLocale: SupportedBrandDirectionLocale;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${
        selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-neutral-200"
      }`}
    >
      <div className="relative">
        <DirectionPreview brandCase={brandCase} direction={direction} copy={copy} />
        {selected && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            <Check className="h-3 w-3" />
            {copy.selectedBadge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold text-neutral-900">
          {direction.title.en}
          <span className="font-normal text-neutral-400"> / {direction.title.zh}</span>
        </h3>
        <p className="text-xs font-medium text-neutral-500">
          {direction.subtitle.en}
          <span className="text-neutral-400"> · {direction.subtitle.zh}</span>
        </p>
        <p className="text-sm text-neutral-600">{direction.description[uiLocale]}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {direction.styleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// Snapshot of exactly what a generation was run with, captured at click time
// and set alongside the result once it lands — never derived from whatever
// activeCaseId/selectedDirectionId/fieldValues happen to be *now*, since the
// user could switch case/direction/fields while a generation is in flight in
// principle (in practice those controls are disabled during isGenerating, but
// this keeps the result's label/alt text correct regardless).
type GeneratedContext = {
  caseId: BrandDirectionCase["id"];
  directionId: string;
  prompt: string;
  fieldValues: Record<string, string>;
};

export default function BrandDirectionExplorerClient({ locale }: { locale: string }) {
  const uiLocale = resolveUiLocale(locale);
  const copy = copyForLocale(uiLocale);
  const { trackAction } = useTracking();

  const [activeCaseId, setActiveCaseId] = useState<BrandDirectionCase["id"]>(
    BRAND_DIRECTION_CASES[0].id,
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(null);
  const [promptPreviewExpanded, setPromptPreviewExpanded] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [generatedContext, setGeneratedContext] = useState<GeneratedContext | null>(null);

  const activeCase = useMemo(
    () => BRAND_DIRECTION_CASES.find((c) => c.id === activeCaseId) ?? BRAND_DIRECTION_CASES[0],
    [activeCaseId],
  );

  // useFreeformGenerate's own `args`/`meta` threading already survives the
  // anonymous-user auth stash + post-signin auto-resume (see pendingArgsRef in
  // services/useFreeformGenerate.ts) — the exact args passed to generate() are
  // replayed verbatim once the user signs in, however long that takes. So
  // args.meta below IS the "this result belongs to what I clicked" snapshot;
  // a separate ref would just duplicate what the hook already guarantees.
  const { generate, isGenerating } = useFreeformGenerate({
    tracking: { contentId: `brand-direction-explorer:${activeCase.id}`, contentType: "tool_card" },
    onSuccess: (url, args) => {
      const context = args.meta as GeneratedContext | undefined;
      if (!context) return;
      setResultUrl(url);
      setGeneratedContext(context);
    },
  });

  const handleSelectCase = (caseId: BrandDirectionCase["id"]) => {
    if (isGenerating) return;
    if (caseId === activeCaseId) return;
    setActiveCaseId(caseId);
    setFieldValues({});
    setSelectedDirectionId(null);
    setPromptPreviewExpanded(false);
    setResultUrl(null);
    setGeneratedContext(null);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    if (isGenerating) return;
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    setResultUrl(null);
    setGeneratedContext(null);
  };

  const handleSelectDirection = (directionId: string) => {
    if (isGenerating) return;
    if (directionId !== selectedDirectionId) {
      setResultUrl(null);
      setGeneratedContext(null);
    }
    setSelectedDirectionId(directionId);
  };

  const selectedDirection = useMemo(
    () => activeCase.directions.find((d) => d.id === selectedDirectionId) ?? null,
    [activeCase, selectedDirectionId],
  );

  const allRequiredFieldsFilled = activeCase.inputFields.every(
    (field) => !field.required || (fieldValues[field.id] ?? "").trim().length > 0,
  );

  const promptPreview = useMemo(() => {
    if (!selectedDirection || !allRequiredFieldsFilled) return null;
    try {
      return buildBrandDirectionPrompt(activeCase, selectedDirection, fieldValues);
    } catch {
      // Defensive only — allRequiredFieldsFilled already guards the one way
      // buildBrandDirectionPrompt can throw (a missing required field).
      return null;
    }
  }, [activeCase, selectedDirection, allRequiredFieldsFilled, fieldValues]);

  const canGenerate = allRequiredFieldsFilled && !!selectedDirection && !isGenerating;

  // Shared by the Generate button and Regenerate — same case/direction/fields
  // in both cases (editing any of them already cleared the prior result and
  // hid the Regenerate control), so there is nothing to distinguish. Builds
  // the prompt exclusively via buildBrandDirectionPrompt — this component
  // never assembles its own prompt string.
  const handleGenerateClick = () => {
    if (!canGenerate || !selectedDirection) return;
    let prompt: string;
    try {
      prompt = buildBrandDirectionPrompt(activeCase, selectedDirection, fieldValues);
    } catch {
      return;
    }
    setResultUrl(null);
    setGeneratedContext(null);
    generate({
      prompt,
      tracking: {
        contentId: `brand-direction-explorer:${activeCase.id}:${selectedDirection.id}`,
        contentType: "tool_card",
      },
      meta: {
        caseId: activeCase.id,
        directionId: selectedDirection.id,
        prompt,
        fieldValues: { ...fieldValues },
      } satisfies GeneratedContext,
    });
  };

  const generatedCase = useMemo(
    () =>
      generatedContext
        ? BRAND_DIRECTION_CASES.find((c) => c.id === generatedContext.caseId) ?? null
        : null,
    [generatedContext],
  );
  const generatedDirection = useMemo(
    () =>
      generatedCase && generatedContext
        ? generatedCase.directions.find((d) => d.id === generatedContext.directionId) ?? null
        : null,
    [generatedCase, generatedContext],
  );
  const resultAlt = generatedCase && generatedDirection
    ? `${generatedCase.title[uiLocale]} ${generatedDirection.title[uiLocale]} generated visual`
    : "generated visual";

  const handleDownloadClick = () => {
    if (!generatedContext) return;
    trackAction(
      {
        contentId: `brand-direction-explorer:download:${generatedContext.caseId}:${generatedContext.directionId}`,
        contentType: "tool_card",
      },
      "download",
    );
  };

  const controlsDisabled = isGenerating;

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="space-y-3 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          {copy.heroTitle}
          <span className="ml-2 text-lg font-normal text-neutral-400 sm:text-xl">
            {uiLocale === "en" ? "品牌创意方向探索" : "Brand Direction Explorer"}
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-600 sm:mx-0">
          {copy.heroDescription}
        </p>
      </header>

      {/* ── 3-step explainer ─────────────────────────────────────────── */}
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

      {/* ── Case tabs ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {BRAND_DIRECTION_CASES.map((brandCase) => {
            const active = brandCase.id === activeCaseId;
            return (
              <button
                key={brandCase.id}
                type="button"
                aria-pressed={active}
                disabled={controlsDisabled}
                onClick={() => handleSelectCase(brandCase.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {brandCase.title[uiLocale]}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-neutral-600">{activeCase.description[uiLocale]}</p>
      </section>

      {/* ── Input fields ─────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {copy.fieldsSectionTitle}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeCase.inputFields.map((field) => {
            const value = fieldValues[field.id] ?? "";
            return (
              <div key={field.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor={`bde-field-${field.id}`}
                    className="text-sm font-medium text-neutral-800"
                  >
                    {field.label[uiLocale]}
                    {field.required && <span className="ml-0.5 text-red-500">*</span>}
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    {copy.charCount(value.length, field.maxLength)}
                  </span>
                </div>
                <input
                  id={`bde-field-${field.id}`}
                  type="text"
                  value={value}
                  maxLength={field.maxLength}
                  aria-required={field.required}
                  disabled={controlsDisabled}
                  placeholder={field.placeholder[uiLocale]}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Direction cards ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {copy.directionsSectionTitle}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {activeCase.directions.map((direction) => (
            <DirectionCard
              key={direction.id}
              brandCase={activeCase}
              direction={direction}
              selected={direction.id === selectedDirectionId}
              disabled={controlsDisabled}
              onSelect={() => handleSelectDirection(direction.id)}
              copy={copy}
              uiLocale={uiLocale}
            />
          ))}
        </div>

        {/* ── Prompt preview ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <button
            type="button"
            aria-expanded={promptPreviewExpanded}
            onClick={() => setPromptPreviewExpanded((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-neutral-800">
              {copy.promptPreviewLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-400 transition-transform ${
                promptPreviewExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {promptPreviewExpanded && (
            <div className="border-t border-neutral-100 px-4 py-3">
              {promptPreview ? (
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-700">
                  {promptPreview}
                </pre>
              ) : (
                <p className="text-xs text-neutral-500">{copy.promptPreviewHint}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Generate ─────────────────────────────────────────────────── */}
      <section className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={handleGenerateClick}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
          {isGenerating ? copy.generatingLabel : copy.generateReadyLabel}
        </button>
        <p className="text-xs text-neutral-500">
          {copy.perGenerationInfo} · {copy.creditsInfo}
        </p>
      </section>

      {/* ── Result ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {copy.resultSectionTitle}
        </h2>
        <div
          className={`relative flex ${aspectClassFor(activeCase)} w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border-2 ${
            resultUrl ? "border-solid border-neutral-200 bg-white" : "border-dashed border-neutral-200 bg-neutral-50"
          } px-6 text-center`}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <p className="text-sm text-neutral-500">{copy.generatingResultText}</p>
            </div>
          ) : resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultUrl} alt={resultAlt} className="h-full w-full object-contain" />
          ) : (
            <p className="text-sm text-neutral-400">{copy.resultEmptyState}</p>
          )}
        </div>

        {resultUrl && !isGenerating && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={resultUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              <Download className="h-4 w-4" />
              {copy.downloadLabel}
            </a>
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerateClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.regenerateLabel}
            </button>
            <span className="text-xs text-neutral-500">{copy.regenerateCreditsNotice}</span>
          </div>
        )}
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="space-y-4 border-t border-neutral-100 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {copy.faqTitle}
        </h2>
        <dl className="space-y-4">
          {copy.faq.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-semibold text-neutral-800">{item.q}</dt>
              <dd className="mt-1 text-sm text-neutral-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
