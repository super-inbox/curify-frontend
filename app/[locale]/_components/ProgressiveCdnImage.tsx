"use client";

import { useEffect, useState } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";

type Props = {
  previewSrc: string;
  fullSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function ProgressiveCdnImage({
  previewSrc,
  fullSrc,
  alt,
  className,
  priority,
}: Props) {
  const [src, setSrc] = useState(previewSrc);

  useEffect(() => {
    if (!fullSrc || fullSrc === previewSrc) return;

    const img = new Image();
    img.src = fullSrc;

    img.onload = () => {
      setSrc(fullSrc);
    };
  }, [fullSrc, previewSrc]);

  return (
    <CdnImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
    />
  );
}