"use client";

import Image, { type ImageProps } from "next/image";

const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL ||
  process.env.NEXT_PUBLIC_CDN_BASE || // keep compatibility if you used this name elsewhere
  "";

/**
 * Contract:
 * - src should be a relative path starting with "/images/..."
 * - If src is absolute ("http(s)://"), we keep it as-is.
 */
function toCdnUrl(src: string): string {
  // Already absolute
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // Enforce leading slash
  const clean = src.startsWith("/") ? src : `/${src}`;

  // If no CDN, serve from origin
  if (!CDN_BASE) return clean;

  // Only CDN-ify asset paths we expect
  if (
    clean.startsWith("/images/") ||
    clean.startsWith("/video/") ||
    clean.startsWith("/audio/")
  ) {
    return `${CDN_BASE}${clean}`;
  }

  // Unknown path: keep as relative
  return clean;
}

export default function CdnImage(props: ImageProps) {
  const { src, ...rest } = props;

  // If StaticImageData, just pass through (Next handles it)
  if (typeof src !== "string") {
    // If caller forgot sizes AND not using fill, provide safe defaults
    const hasFill = (rest as any).fill === true;
    const hasWH =
      typeof (rest as any).width !== "undefined" &&
      typeof (rest as any).height !== "undefined";

    if (!hasFill && !hasWH) {
      return <Image src={src} width={512} height={512} {...rest} />;
    }
    return <Image src={src} {...rest} />;
  }

  const finalSrc = toCdnUrl(src);

  // Debug: prints the final URL that Next/Image will request
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[CdnImage]", { rawSrc: src, finalSrc, CDN_BASE });
  }

  // Next/Image requires either:
  // 1) width + height, OR
  // 2) fill={true}
  const hasFill = (rest as any).fill === true;
  const hasWH =
    typeof (rest as any).width !== "undefined" &&
    typeof (rest as any).height !== "undefined";

  if (!hasFill && !hasWH) {
    // Safe defaults for your inspiration/nano preview images
    return <Image src={finalSrc} width={512} height={512} {...rest} />;
  }

  return <Image src={finalSrc} {...rest} />;
}
