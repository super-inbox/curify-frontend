"use client";

import { useMemo, useState } from "react";
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
  const lines = useMemo(() => {
    return promptText ? promptText.split("\n") : [];
  }, [promptText]);

  const shouldFold = expandable && lines.length > collapsedRows;

  const displayText = useMemo(() => {
    if (!shouldFold || expanded) return promptText;
    return lines.slice(0, collapsedRows).join("\n");
  }, [promptText, lines, collapsedRows, shouldFold, expanded]);

  return (
    <div className={clsx("rounded-xl bg-neutral-50 p-4", containerClassName, className)}>
      {label && (
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
          {label}
        </div>
      )}

      <pre
        className={clsx(
          "whitespace-pre-wrap text-sm leading-relaxed text-neutral-800",
          preClassName
        )}
      >
        {displayText}
      </pre>

      {!expanded && shouldFold && showFadeHint && (
        <div className="mt-2 text-sm text-neutral-500">...</div>
      )}

      {shouldFold && (
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