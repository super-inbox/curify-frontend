"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Wand2, Sparkles, Loader2, Download, ArrowUpRight, ChevronDown } from "lucide-react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import LanguagePairSelector from "@/app/[locale]/_components/LanguagePairSelector";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { fillPrompt, type TemplateParameter } from "@/lib/nano_pure";
import { normalizePrefills } from "@/lib/nano_prompt_utils";
import type { ExistingExampleRef } from "@/lib/editDistance";
import { useDirectGenerate } from "@/services/useDirectGenerate";
import { useFreeformGenerate } from "@/services/useFreeformGenerate";
import { getTemplateWorkflows } from "@/lib/template_workflows";
import { resizeToSocialBundle } from "@/lib/resize_bundle";
import { userAtom, clientMountedAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";

const CREDITS_COST = 10;

type Props = {
  locale: string;
  templateId: string;
  slug: string;
  title: string;
  /** Per-locale description, kept in the DOM (sr-only) for SEO. */
  description?: string;
  /** Column-1 image node, built by the page (video player or progressive image). */
  image: ReactNode;
  /** Absolute URL of the example image — the base for production transforms when
   *  the user hasn't generated a fresh result yet. */
  sourceReferenceUrl: string;
  parameters: TemplateParameter[];
  initialParams: Record<string, string>;
  basePrompt: string;
  allowGeneration: boolean;
  requiresImageUpload?: boolean;
  batchEnabled?: boolean;
  exampleId: string;
  examplePageUrl: string;
  existingExamples?: ExistingExampleRef[];
  useCaseFilter?: readonly string[];
  copyText: string;
  shareUrl: string;
};

type ResultItem = { id: string; url: string; label: string };

export default function ExampleReproduceSurface({
  locale,
  templateId,
  slug,
  title,
  description,
  image,
  sourceReferenceUrl,
  parameters,
  initialParams,
  basePrompt,
  allowGeneration,
  requiresImageUpload = false,
  batchEnabled = false,
  exampleId,
  examplePageUrl,
  existingExamples = [],
  useCaseFilter,
  copyText,
  shareUrl,
}: Props) {
  const t = useTranslations("actionButtons");
  const { trackAction, track } = useTracking();
  const [user] = useAtom(userAtom);
  const [clientMounted] = useAtom(clientMountedAtom);

  // Seed empty params from their placeholder/default so a required field is
  // never sent blank. Some examples ship empty values (e.g. every travel
  // example has date_range="") and params like `daterange` have no picker —
  // an empty required param makes the backend reject the generate BEFORE a
  // project is even created ("generation failed" with no result).
  const [form, setForm] = useState<Record<string, string>>(() => {
    const seeded: Record<string, string> = { ...initialParams };
    for (const p of parameters) {
      if (!seeded[p.name] || !seeded[p.name].trim()) {
        const { candidates } = normalizePrefills(p.placeholder);
        const fallback = (p as { default?: string }).default || candidates[0];
        if (fallback) seeded[p.name] = fallback;
      }
    }
    return seeded;
  });
  const [results, setResults] = useState<ResultItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [soonNote, setSoonNote] = useState<string | null>(null);
  // image2image: the uploaded reference image (blob_url) + its upload-in-flight
  // flag. Only used when requiresImageUpload.
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const resultSeq = useRef(0);

  const tracking = {
    contentId: `${templateId}:${exampleId}`,
    contentType: "nano_inspiration_reproduce_section" as const,
    viewMode: "cards" as const,
  };

  const pushResult = (key: string, label: string, url: string) => {
    resultSeq.current += 1;
    setResults((prev) => [{ id: `${key}-${resultSeq.current}`, url, label }, ...prev]);
  };

  // Template generation (params → templated image; + uploaded reference for
  // image2image templates).
  const { generate, dismissAndGenerate, isGenerating: directGenerating, duplicateWarning, clearWarning } =
    useDirectGenerate({
      templateId,
      params: form,
      existingExamples,
      tracking,
      referenceImageUrl: referenceImageUrl ?? undefined,
      onSuccess: (signedUrl) => pushResult("generate", "Your generation", signedUrl),
    });

  // Production transforms (image2image on the latest result / example image).
  const { generate: freeformGenerate, isGenerating: freeformGenerating } = useFreeformGenerate({
    tracking,
    onStart: (args) => setActiveKey((args.meta?.key as string) ?? null),
    onSuccess: (url, args) => pushResult((args.meta?.key as string) ?? "wf", (args.meta?.label as string) ?? "Result", url),
    onSettled: () => setActiveKey(null),
  });

  const anyGenerating = directGenerating || freeformGenerating;
  const latestUrl = results[0]?.url ?? null;
  const transformSource = latestUrl ?? sourceReferenceUrl;
  const workflows = useMemo(() => getTemplateWorkflows(templateId), [templateId]);

  const filledPrompt = useMemo(() => fillPrompt(basePrompt, form), [basePrompt, form]);

  // Generate inline when the template is generable (allow_generation) OR is an
  // image2image template (requires_image_upload) — the latter now uploads
  // inline here instead of redirecting to the detail page. needsImage gates the
  // button until the reference image is present.
  const canGenerateInline = allowGeneration || requiresImageUpload;
  const needsImage = requiresImageUpload && !referenceImageUrl;

  const onFormChange = (name: string, value: string) => {
    clearWarning();
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyGenerate = async () => {
    try {
      await navigator.clipboard.writeText(filledPrompt || basePrompt);
      trackAction(tracking, "generate");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const runWorkflow = async (wf: (typeof workflows)[number]) => {
    if (wf.kind === "soon") {
      track({ contentId: `workflow-soon:${wf.key}:${templateId}`, contentType: "topic_capsule", actionType: "click" });
      setSoonNote(`${wf.label} is coming soon — we prioritize these by demand, so your click counts.`);
      return;
    }
    // P0-4: One-Click Resize Bundle — client-side, no backend/credits. Crops the
    // current image to the 3 social sizes and drops them into the result tray.
    if (wf.kind === "resize") {
      if (activeKey || anyGenerating) return;
      setSoonNote(null);
      setActiveKey(wf.key);
      track({ contentId: `workflow-${wf.key}:${templateId}`, contentType: tracking.contentType, actionType: "download" });
      try {
        const variants = await resizeToSocialBundle(transformSource);
        variants.forEach((v) => pushResult(`resize-${v.key}`, v.label, v.url));
      } catch {
        setSoonNote("Couldn't resize this image here. Generate a fresh result first, then try again.");
      } finally {
        setActiveKey(null);
      }
      return;
    }
    if (anyGenerating || !wf.prompt) return;
    freeformGenerate({
      prompt: wf.prompt,
      referenceImageUrl: transformSource,
      sourcePromptId: templateId,
      tracking: { ...tracking, contentId: `workflow-${wf.key}:${templateId}` },
      meta: { key: wf.key, label: wf.label },
    });
  };

  const labelCls = "mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500";

  return (
    <section className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-6">
      {description ? <p className="sr-only whitespace-pre-line">{description}</p> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* ── 1. SOURCE ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-3">
          <div className={labelCls}>1 · Source</div>
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {image}
          </div>
          <div className="mt-2">
            <UnifiedActionBar
              tracking={tracking}
              copy={{ enabled: true, text: copyText }}
              share={{ enabled: true, url: shareUrl, title }}
              {...(batchEnabled ? { batchDownload: { enabled: true, templateId } } : {})}
            />
          </div>
        </div>

        {/* ── 2. MAKE IT YOURS ──────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-4">
          <div className={labelCls}>2 · Make it yours</div>
          <div className="flex flex-1 flex-col gap-3">
            {parameters.length > 0 && (
              <div className="flex flex-col gap-3">
                {parameters.map((p) => {
                  const value = form[p.name] ?? "";
                  const { displayPlaceholder, candidates } = normalizePrefills(p.placeholder);
                  const inputClass =
                    "w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200";
                  return (
                    <div key={p.name}>
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-neutral-700">{p.label || p.name}</div>
                        {candidates.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1">
                            {candidates.slice(0, 4).map((cand) => (
                              <button
                                key={`${p.name}-${cand}`}
                                type="button"
                                onClick={() => onFormChange(p.name, cand)}
                                className="cursor-pointer rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
                              >
                                {cand}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {p.type === "select" ? (
                        <select value={value} onChange={(e) => onFormChange(p.name, e.target.value)} className={inputClass}>
                          {(p.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : p.type === "language_pair" ? (
                        <LanguagePairSelector value={value} onChange={(v) => onFormChange(p.name, v)} className={inputClass} />
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => onFormChange(p.name, e.target.value)}
                          placeholder={displayPlaceholder}
                          className={inputClass}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* image2image: upload the photo to transform, inline (no longer a
                redirect to the detail page). Generate is gated on it below. */}
            {requiresImageUpload && (
              <ReferenceImageUpload
                required
                label="Your image"
                hint="Upload the photo to transform — the template is applied to it."
                onChange={setReferenceImageUrl}
                onUploadingChange={setIsUploadingImage}
              />
            )}

            {/* Raw prompt hidden behind an Advanced disclosure — kept in the DOM
                (details stays rendered) for SEO + power users, out of the way
                for B2B users who'd find the code-like text overwhelming. */}
            <details className="group rounded-xl border border-neutral-200 bg-white">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-neutral-400" />
                  Advanced prompt editing
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-neutral-100 p-3">
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-neutral-700">
                  {filledPrompt || basePrompt}
                </pre>
              </div>
            </details>

            {duplicateWarning && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>
                  A very similar image already exists ({Math.round(duplicateWarning.score * 100)}% match).{" "}
                  <button type="button" className="font-semibold underline hover:text-amber-900 cursor-pointer" onClick={dismissAndGenerate}>
                    generate anyway
                  </button>
                  .
                </span>
              </div>
            )}

            {/* Primary generate (mt-auto pins it to the column base). */}
            <div className="mt-auto pt-1">
              {canGenerateInline ? (
                <>
                  <button
                    type="button"
                    onClick={generate}
                    disabled={anyGenerating || needsImage || isUploadingImage}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                  >
                    {directGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {directGenerating ? t("generating") : t("generate")}
                    {clientMounted && !user && <span className="ml-1 text-xs opacity-80">🔒</span>}
                    {clientMounted && user && <span className="ml-1 text-xs opacity-80">· {CREDITS_COST} credits</span>}
                  </button>
                  {needsImage && (
                    <p className="mt-1.5 text-[11px] text-neutral-500">Upload your image above to generate.</p>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyGenerate}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700"
                >
                  <Wand2 className="h-4 w-4" /> {copied ? t("copied") : t("generate")}
                </button>
              )}
            </div>

            {(useCaseFilter?.length ?? 0) > 0 && (
              <div className="border-t border-neutral-100 pt-3">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Use this for
                </div>
                <UseCaseChipsRow filterTo={useCaseFilter} />
              </div>
            )}
          </div>
        </div>

        {/* ── 3. PRODUCTION ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              3 · Turn it into design work
            </span>
            <span className="text-[11px] text-neutral-400">{CREDITS_COST} credits each</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {workflows.map((wf) => {
              const Icon = wf.icon;
              const busy = activeKey === wf.key;
              const isSoon = wf.kind === "soon";
              return (
                <button
                  key={wf.key}
                  type="button"
                  title={wf.hint}
                  disabled={anyGenerating && !isSoon}
                  onClick={() => runWorkflow(wf)}
                  className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
                    isSoon ? "border-dashed border-neutral-300 bg-neutral-50" : "border-neutral-200 bg-white hover:border-purple-300"
                  }`}
                >
                  {isSoon && (
                    <span className="absolute right-1 top-1 rounded bg-neutral-200 px-1 text-[9px] font-bold uppercase tracking-wide text-neutral-500">
                      Soon
                    </span>
                  )}
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${isSoon ? "bg-neutral-100 text-neutral-400" : "bg-purple-50 text-purple-600"}`}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-neutral-700">{wf.label}</span>
                </button>
              );
            })}
          </div>

          {soonNote && <p className="mt-2 text-[11px] text-neutral-500">{soonNote}</p>}

          {/* Result tray — latest fills the slack; earlier gens as thumbnails. */}
          <div className="mt-3 flex flex-1 flex-col">
            <div className="relative flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white p-2">
              {latestUrl ? (
                <a href={latestUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={latestUrl} alt={results[0]?.label} className="mx-auto h-full max-h-[420px] w-auto rounded-lg object-contain" />
                </a>
              ) : (
                <p className="px-4 text-center text-xs text-neutral-400">
                  {anyGenerating
                    ? "Generating…"
                    : "Fill the parameters and Generate, or tap a tile to turn this into design work — results appear here and save to your workspace."}
                </p>
              )}
              {latestUrl && (
                <a
                  href={latestUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download"
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-2 overflow-x-auto">
                  {results.slice(1).map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={r.label}
                      className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.url} alt={r.label} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
                <Link
                  href={`/${locale}/workspace`}
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-purple-600 hover:text-purple-800"
                >
                  Workspace <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
