"use client";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Download, Loader2 } from "lucide-react";
import {
  BRAND_DIRECTION_CASES,
  MAX_PREFERENCE_FIELD_LEN,
  buildBrandDirectionPrompt,
  toCreativeDirection,
  type BrandDirectionCase,
  type CreativeDirection,
  type GeneratedCreativeDirection,
  type PreferenceProfile,
  type SupportedBrandDirectionLocale,
} from "@/lib/brand_direction_explorer";
import { useFreeformGenerate } from "@/services/useFreeformGenerate";
import { useTracking } from "@/services/useTracking";

// This component calls only the internal Next.js API route below — it never
// imports lib/brandDirectionOpenAI.ts (that module is `server-only`-guarded
// and would fail the build if a client component imported it).
const DIRECTIONS_ENDPOINT = "/api/brand-direction-explorer/directions";
const DIRECTIONS_FETCH_DEBOUNCE_MS = 600;

type Copy = {
  heroTitle: string;
  heroDescription: string;
  steps: [string, string, string];
  fieldsSectionTitle: string;
  preferenceSectionTitle: string;
  preferenceHelperText: string;
  preferenceLikesLabel: string;
  preferenceLikesPlaceholder: string;
  preferenceDislikesLabel: string;
  preferenceDislikesPlaceholder: string;
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
  directionsFieldsHint: string;
  directionsLoadingLabel: string;
  directionsRetryLabel: string;
  faqTitle: string;
  faq: [{ q: string; a: string }, { q: string; a: string }, { q: string; a: string }];
};

const EN_COPY: Copy = {
  heroTitle: "Brand Direction Explorer",
  heroDescription:
    "Pick a creative direction from a preset scenario, then generate the matching visual.",
  steps: ["Choose a scenario", "Pick a direction", "Generate a visual"],
  fieldsSectionTitle: "Tell us about your brand",
  preferenceSectionTitle: "Visual preference (optional)",
  preferenceHelperText:
    "Optional — tell Curify what visual qualities you prefer or want to avoid.",
  preferenceLikesLabel: "Prefer",
  preferenceLikesPlaceholder: "e.g. editorial typography, warm natural materials",
  preferenceDislikesLabel: "Avoid",
  preferenceDislikesPlaceholder: "e.g. cute mascot illustration, neon gradients",
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
  creditsInfo: `${IMAGE_GENERATION_CREDITS} credits`,
  regenerateLabel: "Regenerate",
  regenerateCreditsNotice: `Regenerating uses another ${IMAGE_GENERATION_CREDITS} credits.`,
  downloadLabel: "Download",
  generatingResultText: "Generating your visual…",
  resultSectionTitle: "Result",
  resultEmptyState: "Your generated visual will appear here.",
  directionsFieldsHint: "Fill in the required fields above to generate three creative directions.",
  directionsLoadingLabel: "Generating directions…",
  directionsRetryLabel: "Try again",
  faqTitle: "FAQ",
  faq: [
    {
      q: "Are these directions generated automatically in real time?",
      a: "Yes — each set of three directions is generated in real time by OpenAI based on what you enter above.",
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
  preferenceSectionTitle: "视觉偏好（可选）",
  preferenceHelperText: "可选 —— 告诉 Curify 你偏好或想避免的视觉风格。",
  preferenceLikesLabel: "偏好",
  preferenceLikesPlaceholder: "例如：编辑感排版、温暖天然材质",
  preferenceDislikesLabel: "避免",
  preferenceDislikesPlaceholder: "例如：可爱吉祥物插画、霓虹渐变",
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
  creditsInfo: `${IMAGE_GENERATION_CREDITS} 积分`,
  regenerateLabel: "重新生成",
  regenerateCreditsNotice: `重新生成将再消耗 ${IMAGE_GENERATION_CREDITS} 积分。`,
  downloadLabel: "下载",
  generatingResultText: "正在生成视觉方案…",
  resultSectionTitle: "生成结果",
  resultEmptyState: "生成结果将在这里显示。",
  directionsFieldsHint: "填写上方必填字段后，将自动生成三个创意方向。",
  directionsLoadingLabel: "正在生成方向…",
  directionsRetryLabel: "重试",
  faqTitle: "常见问题",
  faq: [
    { q: "这些方向是实时自动生成的吗？", a: "是的 —— 每组三个方向都是根据你在上方填写的内容，由 OpenAI 实时生成的。" },
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

// Purely presentational, per-case (not per-direction, since direction ids
// are now model-generated slugs rather than fixed keys): coffee/event
// directions render as a gradient card, tea directions render as a
// palette-swatch strip. Neither carries any creative-direction content —
// that all comes from the API response.
function previewKindForCase(caseId: BrandDirectionCase["id"]): "placeholder" | "preset-reference" {
  return caseId === "tea-brand-exploration" ? "preset-reference" : "placeholder";
}

const GENERIC_PREVIEW_GRADIENT = "bg-gradient-to-br from-stone-50 via-neutral-100 to-stone-300";
const GENERIC_PREVIEW_TEXT_CLASS = "text-neutral-500";
const GENERIC_PREVIEW_SWATCHES = ["bg-stone-100", "bg-neutral-300", "bg-neutral-900", "bg-amber-200"];

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
      <div className={`relative ${aspect} w-full overflow-hidden rounded-t-2xl ${GENERIC_PREVIEW_GRADIENT}`}>
        <div
          className={`absolute inset-0 flex items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-wide ${GENERIC_PREVIEW_TEXT_CLASS}`}
        >
          {copy.previewComingSoon}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspect} w-full overflow-hidden rounded-t-2xl bg-neutral-50`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex gap-1.5">
          {GENERIC_PREVIEW_SWATCHES.map((swatchClass, i) => (
            <span key={i} className={`h-8 w-8 rounded-md border border-black/5 ${swatchClass}`} />
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
// and set alongside the result once it lands. Carries the full selected
// CreativeDirection (not just an id) because directions are now fetched
// per-request from the API — there is no static case-level list left to
// re-look-up an id against after fields change or a new fetch completes.
type GeneratedContext = {
  caseId: BrandDirectionCase["id"];
  caseTitle: { en: string; zh: string };
  direction: CreativeDirection;
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
  const [preferenceLikes, setPreferenceLikes] = useState("");
  const [preferenceDislikes, setPreferenceDislikes] = useState("");
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(null);
  const [promptPreviewExpanded, setPromptPreviewExpanded] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [generatedContext, setGeneratedContext] = useState<GeneratedContext | null>(null);

  // Stage 1 — OpenAI-generated creative directions, fetched from our own
  // internal API route (never from lib/brandDirectionOpenAI.ts directly).
  // No fallback branch: on failure, `directions` stays null and
  // `directionsError` carries the server's sanitized message.
  const [directions, setDirections] = useState<CreativeDirection[] | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const fetchSeqRef = useRef(0);

  const activeCase = useMemo(
    () => BRAND_DIRECTION_CASES.find((c) => c.id === activeCaseId) ?? BRAND_DIRECTION_CASES[0],
    [activeCaseId],
  );

  // Trimmed to undefined-when-empty here (not just on the server) so the
  // debounce effect below and the request body both key off the same stable
  // "is there actually a preference" signal — a whitespace-only textarea
  // does not count as a preference and does not trigger a refetch by itself.
  const preferenceProfile = useMemo<PreferenceProfile | undefined>(() => {
    const likes = preferenceLikes.trim();
    const dislikes = preferenceDislikes.trim();
    if (!likes && !dislikes) return undefined;
    const profile: PreferenceProfile = {};
    if (likes) profile.likes = likes;
    if (dislikes) profile.dislikes = dislikes;
    return profile;
  }, [preferenceLikes, preferenceDislikes]);

  const fetchDirections = useCallback(
    async (
      caseId: BrandDirectionCase["id"],
      values: Record<string, string>,
      preference: PreferenceProfile | undefined,
    ) => {
      const seq = (fetchSeqRef.current += 1);
      setDirectionsLoading(true);
      setDirectionsError(null);

      let data: { success: boolean; directions?: GeneratedCreativeDirection[]; error?: string };
      let ok = false;
      try {
        const res = await fetch(DIRECTIONS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId,
            fieldValues: values,
            ...(preference ? { preferenceProfile: preference } : {}),
          }),
        });
        ok = res.ok;
        data = await res.json();
      } catch {
        if (seq !== fetchSeqRef.current) return;
        setDirections(null);
        setDirectionsError("Could not generate directions right now. Please try again.");
        setDirectionsLoading(false);
        return;
      }

      if (seq !== fetchSeqRef.current) return; // a newer request superseded this one

      if (!ok || !data.success || !data.directions) {
        setDirections(null);
        setDirectionsError(
          typeof data.error === "string" && data.error
            ? data.error
            : "Could not generate directions right now. Please try again.",
        );
        setDirectionsLoading(false);
        return;
      }

      const kind = previewKindForCase(caseId);
      setDirections(data.directions.map((g) => toCreativeDirection(g, kind)));
      setDirectionsLoading(false);
    },
    [],
  );

  const allRequiredFieldsFilled = activeCase.inputFields.every(
    (field) => !field.required || (fieldValues[field.id] ?? "").trim().length > 0,
  );

  // Debounced fetch: fires ~600ms after the fields last changed (or on case
  // switch, since activeCaseId is a dependency), only once every required
  // field is filled. Invalidated by fetchSeqRef if a newer edit supersedes
  // it before the response lands.
  useEffect(() => {
    if (!allRequiredFieldsFilled) return;
    const timer = setTimeout(() => {
      fetchDirections(activeCaseId, fieldValues, preferenceProfile);
    }, DIRECTIONS_FETCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseId, allRequiredFieldsFilled, fieldValues, preferenceProfile, fetchDirections]);

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
    fetchSeqRef.current += 1; // invalidate any in-flight fetch for the old case
    setActiveCaseId(caseId);
    setFieldValues({});
    setSelectedDirectionId(null);
    setPromptPreviewExpanded(false);
    setResultUrl(null);
    setGeneratedContext(null);
    setDirections(null);
    setDirectionsError(null);
    setDirectionsLoading(false);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    if (isGenerating) return;
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    setResultUrl(null);
    setGeneratedContext(null);
    // A field edit invalidates the previous set of directions — they were
    // generated from the old field values and their ids won't necessarily
    // match whatever the next fetch returns.
    setSelectedDirectionId(null);
    setDirections(null);
    setDirectionsError(null);
  };

  // Same invalidation as handleFieldChange — a preference edit changes what
  // the next fetch will return, so the previous direction set/selection is
  // stale. Preference is intentionally not cleared on scenario switch (see
  // handleSelectCase): it describes the user's taste, not the case's brief.
  const handlePreferenceChange = (field: "likes" | "dislikes", value: string) => {
    if (isGenerating) return;
    if (field === "likes") setPreferenceLikes(value);
    else setPreferenceDislikes(value);
    setResultUrl(null);
    setGeneratedContext(null);
    setSelectedDirectionId(null);
    setDirections(null);
    setDirectionsError(null);
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
    () => directions?.find((d) => d.id === selectedDirectionId) ?? null,
    [directions, selectedDirectionId],
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

  // Stage 2 is unreachable without a `selectedDirection` sourced from a
  // successfully loaded OpenAI response — there is no other way for
  // `directions` (and therefore `selectedDirection`) to be non-null.
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
        caseTitle: activeCase.title,
        direction: selectedDirection,
        prompt,
        fieldValues: { ...fieldValues },
      } satisfies GeneratedContext,
    });
  };

  const resultAlt = generatedContext
    ? `${generatedContext.caseTitle[uiLocale]} ${generatedContext.direction.title[uiLocale]} generated visual`
    : "generated visual";

  const handleDownloadClick = () => {
    if (!generatedContext) return;
    trackAction(
      {
        contentId: `brand-direction-explorer:download:${generatedContext.caseId}:${generatedContext.direction.id}`,
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

      {/* ── Visual preference (optional) ─────────────────────────────── */}
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {copy.preferenceSectionTitle}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">{copy.preferenceHelperText}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="bde-preference-likes" className="text-sm font-medium text-neutral-800">
                {copy.preferenceLikesLabel}
              </label>
              <span className="text-[11px] text-neutral-400">
                {copy.charCount(preferenceLikes.length, MAX_PREFERENCE_FIELD_LEN)}
              </span>
            </div>
            <textarea
              id="bde-preference-likes"
              value={preferenceLikes}
              maxLength={MAX_PREFERENCE_FIELD_LEN}
              rows={2}
              disabled={controlsDisabled}
              placeholder={copy.preferenceLikesPlaceholder}
              onChange={(e) => handlePreferenceChange("likes", e.target.value)}
              className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="bde-preference-dislikes" className="text-sm font-medium text-neutral-800">
                {copy.preferenceDislikesLabel}
              </label>
              <span className="text-[11px] text-neutral-400">
                {copy.charCount(preferenceDislikes.length, MAX_PREFERENCE_FIELD_LEN)}
              </span>
            </div>
            <textarea
              id="bde-preference-dislikes"
              value={preferenceDislikes}
              maxLength={MAX_PREFERENCE_FIELD_LEN}
              rows={2}
              disabled={controlsDisabled}
              placeholder={copy.preferenceDislikesPlaceholder}
              onChange={(e) => handlePreferenceChange("dislikes", e.target.value)}
              className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {/* ── Direction cards ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {copy.directionsSectionTitle}
        </h2>

        {!allRequiredFieldsFilled ? (
          <p className="text-sm text-neutral-500">{copy.directionsFieldsHint}</p>
        ) : directionsLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            {copy.directionsLoadingLabel}
          </div>
        ) : directionsError ? (
          <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{directionsError}</p>
            <button
              type="button"
              onClick={() => fetchDirections(activeCaseId, fieldValues, preferenceProfile)}
              className="inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              {copy.directionsRetryLabel}
            </button>
          </div>
        ) : directions && directions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {directions.map((direction) => (
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
        ) : null}

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
