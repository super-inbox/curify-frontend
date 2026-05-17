"use client";

import { useEffect, useState } from "react";
import CdnImage, { toCdnUrl } from "@/app/[locale]/_components/CdnImage";

export default function ProgressiveCdnImage({
  previewSrc,
  fullSrc,
  alt,
  className = "",
  priority = false,
  noZoom = false,
  fill = false,
}: {
  previewSrc?: string;
  fullSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
  noZoom?: boolean;
  /** Forward Next/Image's `fill` mode to CdnImage. When true, the image is
   *  absolutely positioned to fill its nearest positioned ancestor — caller
   *  must wrap in a `relative` parent and not provide width/height. Used to
   *  match the gallery prompt page's image rendering so the example page
   *  doesn't drift to intrinsic 512x512 sizing. */
  fill?: boolean;
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

  const inner = (
    <CdnImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      {...(fill ? { fill: true } : {})}
    />
  );

  if (noZoom) {
    // In fill mode the image is absolute-positioned to its nearest
    // positioned ancestor — caller owns the `relative` wrapper, so the
    // extra `block h-full w-full` div would only obstruct that. Render
    // the image directly instead.
    return fill ? inner : <div className="block h-full w-full">{inner}</div>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block h-full w-full cursor-zoom-in"
        aria-label="Open full image"
      >
        {inner}
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