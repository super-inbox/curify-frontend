"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

type CopyPromptButtonProps = {
  text: string;
  className?: string;
  onCopied?: () => void;
};

export default function CopyPromptButton({
  text,
  className = "",
  onCopied,
}: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);

      onCopied?.();

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 ${className}`}
      aria-label="Copy prompt"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy prompt
        </>
      )}
    </button>
  );
}