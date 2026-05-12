"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  text: string;
  lines?: number;
  className?: string;
};

const useIso =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function DescriptionClamp({
  text,
  lines = 2,
  className,
}: Props) {
  const t = useTranslations("actionButtons");
  const ref = useRef<HTMLParagraphElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useIso(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const overflow = el.scrollHeight - el.clientHeight > 1;
      setIsOverflow((prev) => (prev !== overflow ? overflow : prev));
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines, expanded]);

  const clampClass = !expanded
    ? lines === 1
      ? "line-clamp-1"
      : lines === 2
      ? "line-clamp-2"
      : lines === 3
      ? "line-clamp-3"
      : "line-clamp-4"
    : "";

  return (
    <div className={className}>
      <p
        ref={ref}
        className={`whitespace-pre-line text-sm leading-6 text-neutral-600 ${clampClass}`}
      >
        {text}
      </p>
      {(isOverflow || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 cursor-pointer text-xs font-semibold text-purple-600 hover:text-purple-700"
        >
          {expanded ? t("readLess") : t("readMore")}
        </button>
      )}
    </div>
  );
}
