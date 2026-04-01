"use client";

import { useState } from "react";
import clsx from "clsx";

type PromptPreviewBlockProps = {
  text: string;
  label?: string;
  collapsedRows?: number;
  expandable?: boolean;
  className?: string;
  preClassName?: string;
  containerClassName?: string;
  defaultExpanded?: boolean;
  showFadeHint?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
};

export default function PromptPreviewBlock({
  text,
  label,
  collapsedRows = 3,
  expandable = true,
  className,
  preClassName,
  containerClassName,
  defaultExpanded = false,
  showFadeHint = true,
  expandLabel = "Show full prompt",
  collapseLabel = "Show less",
}: PromptPreviewBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const promptText = (text || "").trim();

  if (!promptText) return null;

  const isCollapsed = expandable && !expanded;

  return (
    <div
      className={clsx(
        "rounded-xl bg-neutral-50 p-4",
        containerClassName,
        className
      )}
    >
      {label && (
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
          {label}
        </div>
      )}

      <div className="relative">
        <pre
          className={clsx(
            "text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap break-words",
            isCollapsed && "overflow-hidden",
            preClassName
          )}
          style={
            isCollapsed
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: collapsedRows,
                  WebkitBoxOrient: "vertical",
                }
              : undefined
          }
        >
          {promptText}
        </pre>

        {isCollapsed && showFadeHint && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-50 to-transparent" />
        )}
      </div>

      {expandable && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            {expanded ? collapseLabel : expandLabel}
          </button>
        </div>
      )}
    </div>
  );
}