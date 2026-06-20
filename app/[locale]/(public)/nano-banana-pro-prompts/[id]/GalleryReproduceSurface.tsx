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

  const { generate, isGenerating } = useFreeformGenerate({ tracking });

  const run = async (
    key: string,
    label: string,
    prompt: string,
    referenceUrl?: string,
  ) => {
    if (isGenerating) return;
    setActiveKey(key);
    const url = await generate({
      prompt,
      referenceImageUrl: referenceUrl,
      sourcePromptId: String(promptId),
      tracking: { ...tracking, contentId: `gallery-${key}:${String(promptId)}` },
    });
    if (url) {
      resultSeq.current += 1;
      setResults((prev) => [{ id: `${key}-${resultSeq.current}`, url, label }, ...prev]);
    }
    setActiveKey(null);
  };

  // Production tiles transform the image the user is working with: their own
  // upload when present, otherwise the gallery source image.
  const tileReference = referenceImageUrl ?? sourceReferenceUrl;

  const promptIsBlank = !editedPrompt.trim();
  const customDisabled = promptIsBlank || isUploadingImage || isGenerating;

  const handleResetPrompt = () => setEditedPrompt(initialPrompt);
  const handleRemoveReference = () => {
    setReferenceImageUrl(null);
    setReferencePreviewUrl(null);
    setImageUploadError(null);
  };

  return (
    <section className="mt-2 rounded-3xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Remix &amp; produce</h2>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          AI gen
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── 1. SOURCE ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            1 · Source
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
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
        <div className="lg:col-span-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            2 · Make it yours
          </div>
          <div className="flex flex-col gap-4">
            <div>
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
                rows={6}
                className="w-full resize-y rounded-xl border border-neutral-300 bg-white p-3 text-sm leading-relaxed text-neutral-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="Edit the prompt to make it your own…"
              />
              {editedPrompt !== initialPrompt && (
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="mt-1.5 text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
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
                    className="block max-h-40 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveReference}
                    aria-label="Remove reference image"
                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {isUploadingImage && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Uploading…
                    </span>
                  )}
                </div>
              ) : (
                <Upload
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
              <p className="mt-1.5 text-xs text-neutral-500">
                When attached, your prompt and the tiles use this image instead of the source.
              </p>
            </div>

            <button
              type="button"
              disabled={customDisabled}
              onClick={() =>
                run("custom", "Custom remix", editedPrompt, referenceImageUrl ?? undefined)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="lg:col-span-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              3 · Turn it into design work
            </span>
            <span className="text-[11px] text-neutral-400">10 credits each</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRODUCTION_TILES.map((tile) => {
              const Icon = tile.icon;
              const busy = activeKey === tile.key;
              return (
                <button
                  key={tile.key}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => run(tile.key, tile.label, tile.prompt, tileReference)}
                  className="group flex flex-col items-start gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="text-sm font-semibold leading-tight text-neutral-800">
                    {tile.label}
                  </span>
                  <span className="text-[11px] leading-tight text-neutral-500">
                    {tile.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RESULT TRAY (full width) ──────────────────────────────────── */}
      <div className="mt-6 border-t border-neutral-200 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">Your generations</h3>
          {results.length > 0 && (
            <Link
              href={`/${locale}/workspace`}
              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
            >
              View in workspace <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-4 text-center">
            <p className="text-xs text-neutral-400">
              {isGenerating
                ? "Generating…"
                : "Edit the prompt or tap a tile above — your generations appear here and save to your workspace."}
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1">
            {isGenerating && (
              <div className="flex aspect-square w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white text-neutral-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-[11px]">Generating…</span>
              </div>
            )}
            {results.map((r) => (
              <div
                key={r.id}
                className="group relative w-40 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative aspect-square w-full bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.url}
                      alt={r.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </a>
                <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                  <span className="truncate text-[11px] font-medium text-neutral-600">
                    {r.label}
                  </span>
                  <a
                    href={r.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download"
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-neutral-400">
          Generations are saved to your workspace automatically.
        </p>
      </div>
    </section>
  );
}
