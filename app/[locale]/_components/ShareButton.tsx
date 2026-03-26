"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";

type ShareButtonProps = {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  onShared?: () => void;
};

function isMobileLikeDevice() {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || coarsePointer;
}

export default function ShareButton({
  url,
  title,
  text,
  className = "",
  onShared,
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied">("idle");

  const prefersNativeShare = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isMobileLikeDevice() && typeof navigator.share === "function";
  }, []);

  const resetStatusLater = () => {
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    onShared?.();
    setStatus("copied");
    resetStatusLater();
  };

  const handleShare = async () => {
    try {
      if (prefersNativeShare) {
        await navigator.share({
          title,
          text,
          url,
        });

        onShared?.();
        setStatus("shared");
        resetStatusLater();
        return;
      }

      await copyLink();
    } catch (err) {
      try {
        await copyLink();
      } catch (copyErr) {
        console.warn("Share/copy failed:", copyErr || err);
      }
    }
  };

  const label =
    status === "shared"
      ? "Shared"
      : status === "copied"
      ? "Link copied"
      : "Share";

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 cursor-pointer ${className}`}
      aria-label="Share"
    >
      <Share2 className="h-4 w-4" />
      {label}
    </button>
  );
}