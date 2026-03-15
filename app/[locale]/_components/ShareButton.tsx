"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type ShareButtonProps = {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  onShared?: () => void;
};

export default function ShareButton({
  url,
  title,
  text,
  className = "",
  onShared,
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }

      onShared?.();

      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (err) {
      // 用户取消 share sheet 不算报错，不需要打断 UI
      console.warn("Share cancelled or failed:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 ${className}`}
      aria-label="Share"
    >
      <Share2 className="h-4 w-4" />
      {shared ? "Shared" : "Share"}
    </button>
  );
}