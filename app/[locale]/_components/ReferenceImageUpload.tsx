"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";
import Upload from "@/app/[locale]/_components/Upload";

/**
 * Reference-image upload for image2image flows. Encapsulates the
 * preview / uploading / error state that was duplicated across the gallery
 * reproduce surface, the example workbench, and the template-detail reproduce
 * section. Reports the uploaded blob_url out via `onChange`; presentation is
 * parameterized by `variant`:
 *   - "compact": small dropzone + X-overlay remove (the 3-column workbenches).
 *   - "full":    full dropzone + a text "replace" affordance (template detail).
 *
 * The component is self-managing (uncontrolled): the parent only keeps the
 * blob_url it gets from `onChange` (for the generate call + gating) and, if it
 * needs to disable Generate while a file uploads, the flag from
 * `onUploadingChange`.
 */
type Props = {
  onChange: (blobUrl: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  /** Extra side-effect on remove (e.g. clear a stale generated result). */
  onRemove?: () => void;
  variant?: "compact" | "full";
  label?: string;
  /** Helper line under the dropzone (compact variant). */
  hint?: string;
  /** Text for the remove/replace affordance (full variant). */
  replaceLabel?: string;
  uploadingLabel?: string;
  /** Mark the field required (shows a "*"); otherwise shows "(optional)". */
  required?: boolean;
  className?: string;
  /** Copy for the anonymous sign-in gate (the /images/upload endpoint requires
   *  auth, so anon users get a sign-in CTA instead of a dropzone that 401s). */
  signInLabel?: string;
};

export default function ReferenceImageUpload({
  onChange,
  onUploadingChange,
  onRemove,
  variant = "compact",
  label = "Reference image",
  hint,
  replaceLabel = "Replace",
  uploadingLabel = "Uploading…",
  required = false,
  className,
  signInLabel = "Sign in to upload an image",
}: Props) {
  const rawUser = useAtomValue(userAtom);
  const clientMounted = useAtomValue(clientMountedAtom);
  const setDrawer = useSetAtom(drawerAtom);
  // userAtom is atomWithStorage — treat as anonymous until mounted so SSR
  // (always anon) and the first client render agree (no hydration mismatch);
  // a logged-in user swaps to the real uploader post-mount via an effect.
  const user = clientMounted ? rawUser : null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUploadingState = (u: boolean) => {
    setUploading(u);
    onUploadingChange?.(u);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    onRemove?.();
  };

  const compact = variant === "compact";

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-xs font-medium text-neutral-600">
          {label}
          {required ? (
            <span className="text-purple-600"> *</span>
          ) : (
            <span className="text-neutral-400"> (optional)</span>
          )}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="cursor-pointer text-[11px] font-semibold text-purple-600 hover:text-purple-700"
          >
            {replaceLabel}
          </button>
        )}
      </div>

      {previewUrl ? (
        <div className="relative inline-block overflow-hidden rounded-xl border border-neutral-300 bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Reference"
            className={compact ? "block max-h-24 w-auto object-contain" : "max-h-48 w-full object-contain"}
          />
          {compact && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove reference image"
              className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {uploading && (
            compact ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                {uploadingLabel}
              </span>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-semibold text-neutral-700">
                {uploadingLabel}
              </div>
            )
          )}
        </div>
      ) : !user ? (
        // Anonymous: /images/upload requires auth and fires before the
        // generate step, so a dropzone here would 401 into "Upload failed".
        // Gate with a sign-in CTA; the uploader appears post-signin (userAtom
        // flips). Shared across every image2image surface.
        <button
          type="button"
          onClick={() => setDrawer("signin")}
          className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 text-center transition-colors hover:bg-purple-50 ${
            compact ? "h-28 p-3" : "h-40 gap-2 p-6"
          }`}
        >
          <span className={compact ? "text-lg" : "text-2xl"}>🖼️</span>
          <span
            className={`font-semibold text-purple-700 ${compact ? "text-xs" : "text-sm"}`}
          >
            {signInLabel}
          </span>
          {!compact && (
            <span className="text-xs text-neutral-500">Free to start.</span>
          )}
        </button>
      ) : (
        <div className={compact ? undefined : "overflow-hidden rounded-xl"}>
          <Upload
            compact={compact}
            acceptedKinds="image"
            onPreviewReady={(localUrl) => {
              setPreviewUrl(localUrl);
              setError(null);
            }}
            onUploadStart={() => setUploadingState(true)}
            onUploaded={(_imageId, blobUrl) => {
              onChange(blobUrl);
              setUploadingState(false);
            }}
            onUploadError={(err) => {
              setUploadingState(false);
              setPreviewUrl(null);
              setError(err);
            }}
          />
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-[11px] text-neutral-500">{hint}</p>}
    </div>
  );
}
