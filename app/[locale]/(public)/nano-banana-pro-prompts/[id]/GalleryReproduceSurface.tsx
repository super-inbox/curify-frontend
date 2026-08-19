"use client";
import { IMAGE_GENERATION_CREDITS } from "@/lib/pricing";

import { useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Download, Loader2, ArrowUpRight, Wand2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { useFreeformGenerate } from "@/services/useFreeformGenerate";
import { PRODUCTION_TILES } from "@/lib/gallery_production_tiles";

type Props = {
  locale: string;
  promptId: string | number;
  initialPrompt: string;
  /** Source image for display (may be a relative CDN path — CdnImage handles it). */
  sourceImageUrl: string;
  /** Absolute URL of the source image, sent to the backend as the reference
   *  for production-tile transforms (must be fetchable server-side). */
  sourceReferenceUrl: string;
  sourceImageAlt?: string;
  /** Copy/share affordances for the source prompt. */
  copyText: string;
  shareUrl: string;
  title: string;
};

type ResultItem = { id: string; url: string; label: string };

export default function GalleryReproduceSurface({
  locale,
  promptId,
  initialPrompt,
  sourceImageUrl,
  sourceReferenceUrl,
  sourceImageAlt,
  title,
}: Props) {
  const t = useTranslations("actionButtons");

  const [editedPrompt, setEditedPrompt] = useState(initialPrompt);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [results, setResults] = useState<ResultItem[]>([]);
  // Which trigger is currently running ("custom" or a tile key) — drives the
  // per-control spinner. The hook serializes generations (one at a time).
  const [activeKey, setActiveKey] = useState<string | null>(null);
  // Selected output format (on par with the template-example workbench): null =
  // the edited prompt itself; otherwise a production-tile key whose transform
  // runs on Generate.
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const resultSeq = useRef(0);

  const tracking = {
    contentId: `gallery-remix:${String(promptId)}`,
    contentType: "nano_gallery" as const,
    viewMode: "cards" as const,
  };

  // State flows through the hook's lifecycle callbacks so a post-signin
  // auto-resumed generation (fired inside the hook, not from run()) restores
  // the right tile spinner and lands in the tray identically to a direct click.
  const { generate, isGenerating } = useFreeformGenerate({
    tracking,
    onStart: (args) => setActiveKey((args.meta?.key as string) ?? "custom"),
    onSuccess: (url, args) => {
      resultSeq.current += 1;
      setResults((prev) => [
        {
          id: `${(args.meta?.key as string) ?? "gen"}-${resultSeq.current}`,
          url,
          label: (args.meta?.label as string) ?? "Generation",
        },
        ...prev,
      ]);
    },
    onSettled: () => setActiveKey(null),
  });

  const run = (
    key: string,
    label: string,
    prompt: string,
    referenceUrl?: string,
  ) => {
    if (isGenerating) return;
    generate({
      prompt,
      referenceImageUrl: referenceUrl,
      sourcePromptId: String(promptId),
      tracking: { ...tracking, contentId: `gallery-${key}:${String(promptId)}` },
      meta: { key, label },
    });
  };

  // Production tiles transform the image the user is working with: their own
  // upload when present, otherwise the gallery source image.
  const tileReference = referenceImageUrl ?? sourceReferenceUrl;

  const selectedTile = selectedFormat
    ? PRODUCTION_TILES.find((tl) => tl.key === selectedFormat) ?? null
    : null;

  const promptIsBlank = !editedPrompt.trim();
  // Generate runs the SELECTED output format: the edited prompt (default) or the
  // chosen production tile's transform on the current reference image.
  const handleGenerate = () => {
    if (selectedTile) {
      run(selectedTile.key, selectedTile.label, selectedTile.prompt, tileReference);
    } else {
      run("custom", "Custom prompt", editedPrompt, referenceImageUrl ?? undefined);
    }
  };
  const generateDisabled =
    isGenerating || isUploadingImage || (!selectedTile && promptIsBlank);

  const latest = results[0] ?? null;

  const handleResetPrompt = () => setEditedPrompt(initialPrompt);

  const labelCls =
    "mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500";

  return (
    <section className="mt-2 rounded-3xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-6">
      {/* items-stretch makes all three columns equal height; each column is a
          flex-col with a flex-1 element (image / spacer / result) absorbing the
          slack so the heights stay balanced regardless of content. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* ── 1. SOURCE ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-3">
          <div className={labelCls}>1 · Source</div>
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
            <div className="relative min-h-[200px] flex-1 overflow-hidden rounded-xl bg-neutral-100">
              <CdnImage
                src={sourceImageUrl}
                alt={sourceImageAlt || title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* ── 2. INTERACTION ────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-4">
          <div className={labelCls}>2 · Make it yours</div>
          <div className="flex flex-1 flex-col gap-3">
            {/* Prompt folds into a disclosure, same as the template-example
                workbench — collapsed by default; expand to customize. */}
            <details className="group rounded-xl border border-neutral-200 bg-white">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-neutral-400" />
                  Advanced prompt editing
                  {editedPrompt !== initialPrompt && (
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-700">
                      edited
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-neutral-100 p-3">
                <label htmlFor={`remix-prompt-${promptId}`} className="sr-only">
                  Prompt
                </label>
                <textarea
                  id={`remix-prompt-${promptId}`}
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="min-h-[140px] w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-sm leading-relaxed text-neutral-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  placeholder="Edit the prompt to make it your own…"
                />
                {editedPrompt !== initialPrompt && (
                  <button
                    type="button"
                    onClick={handleResetPrompt}
                    className="mt-1.5 self-start text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
                  >
                    Reset to original
                  </button>
                )}
              </div>
            </details>

            <ReferenceImageUpload
              onChange={setReferenceImageUrl}
              onUploadingChange={setIsUploadingImage}
              hint="When attached, your prompt and the output formats use this image instead of the source."
            />

            {/* Output format — chosen ABOVE Generate (on par with the template
                example workbench). Default = the edited prompt; other options run
                that production transform on the current reference. */}
            <div className="mt-auto">
              <div className="mb-2 flex items-baseline justify-between">
                <span className={labelCls + " mb-0"}>Output format</span>
                <span className="text-[11px] text-neutral-400">{IMAGE_GENERATION_CREDITS} credits</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: null as string | null, label: "Custom prompt", icon: Sparkles }, ...PRODUCTION_TILES].map((opt) => {
                  const active = (opt.key ?? null) === selectedFormat;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key ?? "__custom"}
                      type="button"
                      onClick={() => setSelectedFormat(opt.key ?? null)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                        active
                          ? "border-purple-500 bg-purple-50 ring-1 ring-purple-300"
                          : "border-neutral-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${active ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[11px] font-semibold leading-tight text-neutral-700">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={generateDisabled}
                onClick={handleGenerate}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {activeKey
                  ? t("generating")
                  : selectedTile
                    ? `Generate · ${selectedTile.label}`
                    : `Generate (${IMAGE_GENERATION_CREDITS} credits)`}
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. PRODUCTION ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-5">
          <div className={labelCls}>3 · Result</div>

          {/* Result lives in this panel — latest generation fills the slack so
              the column matches the others' height. */}
          <div className="mt-3 flex flex-1 flex-col">
            <div className="relative flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white p-2">
              {latest ? (
                <a
                  href={latest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={latest.url}
                    alt={latest.label}
                    className="mx-auto h-full max-h-[420px] w-auto rounded-lg object-contain"
                  />
                </a>
              ) : (
                <p className="px-4 text-center text-xs text-neutral-400">
                  {isGenerating
                    ? "Generating…"
                    : "Tap a tile or edit the prompt — your generation appears here and saves to your workspace."}
                </p>
              )}
              {latest && (
                <a
                  href={latest.url}
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

            {/* Earlier generations this session + workspace link. */}
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
