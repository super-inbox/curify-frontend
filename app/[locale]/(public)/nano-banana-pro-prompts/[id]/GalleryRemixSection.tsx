"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import Upload from "@/app/[locale]/_components/Upload";
import { useFreeformGenerate } from "@/services/useFreeformGenerate";

type Props = {
  promptId: string | number;
  initialPrompt: string;
  /** Source image of the gallery prompt — shown next to the result placeholder
   *  so the user has a visual anchor for what they're remixing. */
  sourceImageUrl?: string;
  sourceImageAlt?: string;
};

export default function GalleryRemixSection({
  promptId,
  initialPrompt,
  sourceImageUrl,
  sourceImageAlt,
}: Props) {
  const t = useTranslations("actionButtons");

  const [editedPrompt, setEditedPrompt] = useState(initialPrompt);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const tracking = {
    contentId: `gallery-remix:${String(promptId)}`,
    contentType: "nano_gallery" as const,
    viewMode: "cards" as const,
  };

  const { generate, isGenerating } = useFreeformGenerate({
    prompt: editedPrompt,
    referenceImageUrl: referenceImageUrl ?? undefined,
    sourcePromptId: String(promptId),
    tracking,
    onSuccess: (signedUrl) => setGeneratedImageUrl(signedUrl),
  });

  const promptIsBlank = !editedPrompt.trim();
  const canGenerate = !promptIsBlank && !isUploadingImage && !isGenerating;

  const handleResetPrompt = () => setEditedPrompt(initialPrompt);

  const handleRemoveReference = () => {
    setReferenceImageUrl(null);
    setReferencePreviewUrl(null);
    setImageUploadError(null);
  };

  return (
    <section className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50/50 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Remix this prompt</h2>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          AI gen
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: prompt + image inputs */}
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor={`remix-prompt-${promptId}`}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Prompt
            </label>
            <textarea
              id={`remix-prompt-${promptId}`}
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              rows={8}
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Reference image (optional)
            </label>
            {referencePreviewUrl ? (
              <div className="relative inline-block overflow-hidden rounded-xl border border-neutral-300 bg-white">
                <img
                  src={referencePreviewUrl}
                  alt="Reference"
                  className="block max-h-48 w-auto object-contain"
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
              When attached, your prompt is interpreted against this image.
            </p>
          </div>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={generate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? t("generating") : "Generate (10 credits)"}
          </button>
        </div>

        {/* Right: result placeholder / generated image */}
        <div className="flex flex-col">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {generatedImageUrl ? "Your generation" : "Result will appear here"}
          </label>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-white p-3 min-h-[280px]">
            {generatedImageUrl ? (
              <a
                href={generatedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
              >
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="mx-auto max-h-[480px] w-auto object-contain"
                />
              </a>
            ) : sourceImageUrl ? (
              <div className="text-center">
                <CdnImage
                  src={sourceImageUrl}
                  alt={sourceImageAlt || "Source"}
                  width={240}
                  height={240}
                  className="mx-auto max-h-48 w-auto rounded-lg object-contain opacity-40"
                />
                <p className="mt-3 text-xs text-neutral-400">
                  {isGenerating ? "Generating…" : "Your remix will replace this preview."}
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                {isGenerating ? "Generating…" : "Click Generate to create your version."}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
