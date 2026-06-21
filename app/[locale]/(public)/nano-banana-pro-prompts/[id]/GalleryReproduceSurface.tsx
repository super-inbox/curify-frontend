"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, X, Download, Loader2, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import Upload from "@/app/[locale]/_components/Upload";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
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
  copyText,
  shareUrl,
  title,
}: Props) {
  const t = useTranslations("actionButtons");

  const [editedPrompt, setEditedPrompt] = useState(initialPrompt);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const [results, setResults] = useState<ResultItem[]>([]);
  // Which trigger is currently running ("custom" or a tile key) — drives the
  // per-control spinner. The hook serializes generations (one at a time).
  const [activeKey, setActiveKey] = useState<string | null>(null);
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

  const promptIsBlank = !editedPrompt.trim();
  const customDisabled = promptIsBlank || isUploadingImage || isGenerating;

  const latest = results[0] ?? null;

  const handleResetPrompt = () => setEditedPrompt(initialPrompt);
  const handleRemoveReference = () => {
    setReferenceImageUrl(null);
    setReferencePreviewUrl(null);
    setImageUploadError(null);
  };

  const labelCls =
    "mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500";

  return (
    <section className="mt-2 rounded-3xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Remix &amp; produce</h2>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          AI gen
        </span>
      </div>

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
          <div className="mt-2">
            <UnifiedActionBar
              tracking={tracking}
              copy={{ enabled: true, text: copyText }}
              share={{ enabled: true, url: shareUrl, title }}
            />
          </div>
        </div>

        {/* ── 2. INTERACTION ────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-4">
          <div className={labelCls}>2 · Make it yours</div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-1 flex-col">
              <label
                htmlFor={`remix-prompt-${promptId}`}
                className="mb-1.5 block text-xs font-medium text-neutral-600"
              >
                Prompt
              </label>
              <textarea
                id={`remix-prompt-${promptId}`}
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[120px] w-full flex-1 resize-none rounded-xl border border-neutral-300 bg-white p-3 text-sm leading-relaxed text-neutral-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Reference image (optional)
              </label>
              {referencePreviewUrl ? (
                <div className="relative inline-block overflow-hidden rounded-xl border border-neutral-300 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referencePreviewUrl}
                    alt="Reference"
                    className="block max-h-24 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveReference}
                    aria-label="Remove reference image"
                    className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {isUploadingImage && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Uploading…
                    </span>
                  )}
                </div>
              ) : (
                <Upload
                  compact
                  acceptedKinds="image"
                  onPreviewReady={(localUrl) => {
                    setReferencePreviewUrl(localUrl);
                    setImageUploadError(null);
                  }}
                  onUploadStart={() => setIsUploadingImage(true)}
                  onUploaded={(_id, blobUrl) => {
                    setReferenceImageUrl(blobUrl);
                    setIsUploadingImage(false);
                  }}
                  onUploadError={(err) => {
                    setIsUploadingImage(false);
                    setImageUploadError(err);
                  }}
                />
              )}
              {imageUploadError && (
                <p className="mt-1.5 text-xs text-red-600">{imageUploadError}</p>
              )}
              <p className="mt-1.5 text-[11px] text-neutral-500">
                When attached, your prompt and the tiles use this image instead of the source.
              </p>
            </div>

            <button
              type="button"
              disabled={customDisabled}
              onClick={() =>
                run("custom", "Custom remix", editedPrompt, referenceImageUrl ?? undefined)
              }
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeKey === "custom" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {activeKey === "custom" ? t("generating") : "Generate (10 credits)"}
            </button>
          </div>
        </div>

        {/* ── 3. PRODUCTION ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:col-span-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              3 · Turn it into design work
            </span>
            <span className="text-[11px] text-neutral-400">10 credits each</span>
          </div>

          {/* Smaller tiles — 3-up compact grid. */}
          <div className="grid grid-cols-3 gap-2">
            {PRODUCTION_TILES.map((tile) => {
              const Icon = tile.icon;
              const busy = activeKey === tile.key;
              return (
                <button
                  key={tile.key}
                  type="button"
                  title={tile.hint}
                  disabled={isGenerating}
                  onClick={() => run(tile.key, tile.label, tile.prompt, tileReference)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-neutral-700">
                    {tile.label}
                  </span>
                </button>
              );
            })}
          </div>

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
