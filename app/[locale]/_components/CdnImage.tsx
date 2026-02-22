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
  const { src, unoptimized, ...rest } = props;

  const hasFill = (rest as any).fill === true;
  const hasWH =
    typeof (rest as any).width !== "undefined" &&
    typeof (rest as any).height !== "undefined";

  // Helper: render with safe defaults
  const render = (finalSrc: ImageProps["src"], forceUnoptimized?: boolean) => {
    const finalUnoptimized =
      typeof forceUnoptimized === "boolean"
        ? forceUnoptimized
        : typeof unoptimized === "boolean"
          ? unoptimized
          : true; // ✅ default to true (no Vercel transformations)

    if (!hasFill && !hasWH) {
      return (
        <Image
          src={finalSrc}
          width={512}
          height={512}
          unoptimized={finalUnoptimized}
          {...rest}
        />
      );
    }

    return <Image src={finalSrc} unoptimized={finalUnoptimized} {...rest} />;
  };

  // StaticImageData or other non-string src: let Next handle it.
  // (Still set unoptimized default ONLY if caller provided it; otherwise keep Next default)
  if (typeof src !== "string") {
    // If caller didn't pass unoptimized, do NOT force it here (local/static is usually fine)
    const finalUnoptimized = typeof unoptimized === "boolean" ? unoptimized : undefined;

    if (!hasFill && !hasWH) {
      return (
        <Image
          src={src}
          width={512}
          height={512}
          unoptimized={finalUnoptimized}
          {...rest}
        />
      );
    }
    return <Image src={src} unoptimized={finalUnoptimized} {...rest} />;
  }

  const trimmed = src.trim();

  // ✅ Avoid Next/Image crash / empty src warnings
  if (!trimmed) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[CdnImage] Empty src string passed");
      // eslint-disable-next-line no-console
      console.trace();
    }
    return null;
  }

  const finalSrc = toCdnUrl(trimmed);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[CdnImage]", { rawSrc: src, finalSrc, CDN_BASE });
  }

  // ✅ For CDN/remote strings: default to unoptimized=true to avoid Vercel transformations
  return render(finalSrc, true);
}