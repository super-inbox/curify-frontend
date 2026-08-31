"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { useTracking } from "@/services/useTracking";

type Props = {
  promptId: string | number;
  locale: string;
  title: string;
  description?: string;
  prompt: string;
  tags: string[];
};

// Right-side panel rendered alongside the prompt-gallery carousel on desktop.
// Mirrors the visual shape of ExampleRightColumn (chips → title → prompt) but
// drops the reproduce flow since prompts have no parameterized generation.
export default function PromptRightColumn({
  promptId,
  locale,
  title,
  description,
  prompt,
  tags,
}: Props) {
  const [copied, setCopied] = useState(false);
  const { track } = useTracking();

  const handleCopy = async () => {
    if (!prompt) return;
    track({
      contentId: String(promptId),
      contentType: "nano_gallery",
      actionType: "copy",
      viewMode: "cards",
    });
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-3 lg:min-h-[520px]">
      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tags.slice(0, 10).map((tag) => (
            <Link
              key={tag}
              href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
        {title}
      </h1>

      {/* Description */}
      {description ? (
        <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
          {description}
        </p>
      ) : null}

      {/* Prompt section */}
      <section aria-labelledby="prompt-heading" className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <h2
            id="prompt-heading"
            className="text-[11px] font-bold uppercase tracking-wider text-neutral-500"
          >
            Prompt
          </h2>
          {prompt ? (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-200"
              aria-label={copied ? "Copied" : "Copy prompt"}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          ) : null}
        </div>
        {prompt ? (
          <div className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm leading-relaxed text-neutral-800 whitespace-pre-line">
            {prompt}
          </div>
        ) : (
          <p className="text-sm italic text-neutral-400">No prompt text.</p>
        )}
      </section>

      {/* View prompt CTA */}
      <Link
        href={`/${locale}/nano-banana-pro-prompts/${promptId}`}
        className="mt-2 inline-flex w-full items-center justify-center rounded-full border-2 border-purple-500 bg-white px-4 py-2 text-sm font-bold text-purple-700 shadow-sm transition hover:border-purple-600 hover:bg-purple-50"
      >
        View prompt page →
      </Link>
    </div>
  );
}
