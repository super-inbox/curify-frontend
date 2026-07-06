"use client";

import { useState } from "react";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { useDirectGenerate } from "@/services/useDirectGenerate";

/**
 * Inline image2image generate block for the /tools/ecommerce-photo page.
 *
 * Instead of the video-oriented CreateNewModal, the user drops a product
 * photo directly on the tool page and generates a listing-ready image. Wraps
 * the same shared primitives the nano reproduce surfaces use:
 *   - ReferenceImageUpload  → uploads the photo to GCS, reports its blob_url,
 *                             and self-gates the upload behind sign-in (the
 *                             /images/upload endpoint requires auth)
 *   - useDirectGenerate     → auth-gate + credit-gate + async generate/poll
 *
 * The backing template is passed in (product-poster / fashion-ecommerce); it
 * must be a requires_image_upload template. product-poster has no params, so
 * this is a pure "drop image → generate" flow.
 */
export default function EcommercePhotoGenerate({ templateId }: { templateId: string }) {
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Same content_type the nano reproduce surfaces emit, so tool-driven
  // generations fold into the existing generate analytics (backend rejects
  // unknown content_type values — reuse a known one).
  const tracking = {
    contentId: templateId,
    contentType: "nano_inspiration_reproduce_section" as const,
    viewMode: "cards" as const,
  };

  const { generate, dismissAndGenerate, isGenerating, duplicateWarning, clearWarning } =
    useDirectGenerate({
      templateId,
      params: {},
      tracking,
      referenceImageUrl: referenceImageUrl ?? undefined,
      onSuccess: (signedUrl) => setGeneratedImageUrl(signedUrl),
    });

  const needsImage = !referenceImageUrl;

  const handleGenerate = () => {
    if (needsImage || isUploadingImage) return;
    generate();
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm">
      <ReferenceImageUpload
        variant="full"
        required
        label="Your product photo"
        hint="Drop or select a product photo — JPEG, PNG, or WebP."
        replaceLabel="Replace"
        uploadingLabel="Uploading…"
        signInLabel="Sign in to upload your product photo"
        onChange={(url) => {
          clearWarning();
          setGeneratedImageUrl(null);
          setReferenceImageUrl(url);
        }}
        onUploadingChange={setIsUploadingImage}
        onRemove={() => setGeneratedImageUrl(null)}
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || needsImage || isUploadingImage}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2.5 font-bold text-white shadow-lg transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? "Generating…" : "Generate listing image"}
      </button>

      {duplicateWarning && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You just generated an image.{" "}
          <button
            type="button"
            onClick={dismissAndGenerate}
            className="cursor-pointer font-semibold underline hover:text-amber-900"
          >
            Generate another version
          </button>
          .
        </p>
      )}

      {generatedImageUrl && (
        <div className="mt-5">
          <CdnImage
            src={generatedImageUrl}
            alt="Generated e-commerce listing image"
            className="mx-auto max-h-[420px] w-auto rounded-2xl border border-neutral-200 object-contain"
          />
          <a
            href={generatedImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-3 block w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-center font-semibold text-purple-700 transition-colors hover:bg-purple-100"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
