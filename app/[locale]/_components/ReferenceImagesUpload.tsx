"use client";

/**
 * Multi-reference upload — N slots, reported as an ordered array.
 *
 * Composes ReferenceImageUpload rather than changing its contract: ten callers
 * depend on the single-slot component, and widening its signature to serve one
 * surface would put all of them at risk for no gain.
 *
 * Why this exists: the 21q evaluation measured Curify consuming 21 of 30 input
 * assets, because 7 multi-image tasks could only send one reference. The 08-14
 * canary was the same defect from the other side — a garment reference omitted,
 * so the model invented a jacket. Briefs of the form "3-5 references -> new
 * original design" are unservable with a single slot.
 *
 * Order is meaningful: the first image is the base the model works from, so
 * slots fill left to right and removal preserves the order of the rest.
 */
import { useCallback, useMemo } from "react";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";

type Props = {
  /** Ordered blob_urls. First is treated as the base image. */
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  max?: number;
  label?: string;
  hint?: string;
  signInLabel?: string;
};

export default function ReferenceImagesUpload({
  value,
  onChange,
  onUploadingChange,
  max = 5,
  label = "Reference images",
  hint = "The first image is the base; the rest are additional references.",
  signInLabel = "Sign in to upload reference images",
}: Props) {
  // Render one slot per uploaded image plus a single empty slot, so the UI
  // grows on demand instead of showing five empty boxes up front.
  const slots = useMemo(
    () => (value.length < max ? [...value, ""] : value),
    [value, max],
  );

  const setAt = useCallback(
    (i: number, blobUrl: string | null) => {
      const next = [...value];
      if (blobUrl) {
        next[i] = blobUrl;
      } else {
        next.splice(i, 1); // removal keeps the remaining order intact
      }
      onChange(next.filter(Boolean).slice(0, max));
    },
    [value, onChange, max],
  );

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-neutral-700">{label}</span>
        <span className="text-xs text-neutral-500">
          {value.length}/{max}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>

      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slots.map((url, i) => (
          <div key={`${url || "empty"}-${i}`}>
            <ReferenceImageUpload
              variant="compact"
              label={i === 0 ? "Base" : `Ref ${i + 1}`}
              hint={i === 0 ? "primary" : "optional"}
              signInLabel={signInLabel}
              onChange={(blobUrl: string | null) => setAt(i, blobUrl)}
              onUploadingChange={onUploadingChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
