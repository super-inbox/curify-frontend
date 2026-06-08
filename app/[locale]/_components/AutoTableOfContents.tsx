"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: number };

type AutoTableOfContentsProps = {
  /**
   * CSS selector for the article root. Default `article` — the
   * existing [slug] and standalone blog pages wrap content in an
   * `<article>` element, so the default works without per-page wiring.
   */
  articleSelector?: string;
  /** Include h3 in addition to h2 when true. */
  includeH3?: boolean;
  /** Minimum headings before the TOC renders. Avoid showing a 1-item TOC. */
  minHeadings?: number;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function AutoTableOfContents({
  articleSelector = "article",
  includeH3 = false,
  minHeadings = 3,
}: AutoTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.querySelector(articleSelector);
    if (!article) return;

    const sel = includeH3 ? "h2, h3" : "h2";
    const nodes = Array.from(
      article.querySelectorAll<HTMLHeadingElement>(sel),
    );

    const found: Heading[] = [];
    const usedIds = new Set<string>();
    for (const el of nodes) {
      let id = el.id;
      if (!id) {
        const base = slugify(el.textContent || "section") || "section";
        let candidate = base;
        let n = 2;
        while (usedIds.has(candidate)) {
          candidate = `${base}-${n++}`;
        }
        id = candidate;
        el.id = id;
      }
      usedIds.add(id);
      found.push({
        id,
        text: (el.textContent || "").trim(),
        level: parseInt(el.tagName.slice(1), 10),
      });
    }

    if (found.length < minHeadings) return;
    setHeadings(found);

    // Active-section tracking — first heading whose center crosses the
    // viewport's upper-middle band lights up.
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => (e.target as HTMLElement).id);
        if (visible.length) setActiveId(visible[0]);
      },
      { rootMargin: "-30% 0% -60% 0%" },
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [articleSelector, includeH3, minHeadings]);

  if (headings.length < minHeadings) return null;

  return (
    <nav
      className="hidden xl:block fixed top-28 right-6 w-56 max-h-[calc(100vh-9rem)] overflow-y-auto text-sm z-30"
      aria-label="Table of contents"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        On this page
      </div>
      <ul className="border-l border-gray-200">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-5" : "pl-0"}>
            <a
              href={`#${h.id}`}
              className={`block py-1 pl-3 -ml-px border-l-2 transition ${
                activeId === h.id
                  ? "border-purple-600 text-purple-700 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
