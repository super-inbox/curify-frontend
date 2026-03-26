"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export default function CopyPromptButton({
  text,
  onCopied,
}: {
  text: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied?.();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer"
    >
      <Copy className="h-4 w-4" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}