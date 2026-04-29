"use client";

import { useEffect, useState } from "react";
import CdnImage, { toCdnUrl } from "@/app/[locale]/_components/CdnImage";

export default function ProgressiveCdnImage({
  previewSrc,
  fullSrc,
  alt,
  className = "",
  priority = false,
}: {
  previewSrc?: string;
  fullSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [src, setSrc] = useState(previewSrc || fullSrc);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSrc(previewSrc || fullSrc);

    if (!fullSrc || fullSrc === previewSrc) return;

    const img = new Image();
    img.src = toCdnUrl(fullSrc);
    img.onload = () => setSrc(fullSrc);
  }, [previewSrc, fullSrc]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block h-full w-full cursor-zoom-in"
        aria-label="Open full image"
      >
        <CdnImage
          src={src}
          alt={alt}
          className={className}
          priority={priority}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[95vh] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <CdnImage
              src={fullSrc}
              alt={alt}
              className="max-h-[95vh] w-auto max-w-[95vw] object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}