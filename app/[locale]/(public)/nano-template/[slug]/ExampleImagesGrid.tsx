"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CdnImage from "@/app/[locale]/_components/CdnImage";

type Item = {
  id: string;
  title: string;
  preview: string;
  templateId: string; // e.g. "template-character-zh"
};

function useCols() {
  const [cols, setCols] = useState(1);

  useMemo(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 640) return 2;
      return 1;
    };
    const onResize = () => setCols(calc());
    setCols(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return cols;
}

export default function ExampleImagesGrid({
  items,
  maxRows = 3,
  locale = "en",
}: {
  items: Item[];
  maxRows?: number;
  locale?: string;
}) {
  const cols = useCols();
  const limit = cols * maxRows;

  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, limit);
  const hiddenCount = Math.max(0, items.length - visible.length);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((it) => (
          <Link
            key={it.id}
            href={`/${locale}/nano-template/${it.templateId}/example/${encodeURIComponent(it.id)}`}
            className="group block overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="relative overflow-hidden">
              <CdnImage
                src={it.preview}
                alt={it.title || it.id}
                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Hover overlay with "View details" CTA */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                <span className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-neutral-900 shadow">
                  View prompt →
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                {it.title || it.id}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length > limit && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            {expanded ? "See less" : `See more (${items.length - limit})`}
          </button>
        </div>
      )}
    </div>
  );
}
