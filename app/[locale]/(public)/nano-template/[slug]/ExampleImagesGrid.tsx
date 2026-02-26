"use client";

import { useMemo, useState } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";

type Item = { id: string; title: string; preview: string };

function useCols() {
  const [cols, setCols] = useState(1);

  // minimal + safe
  useMemo(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024) return 3; // lg
      if (w >= 640) return 2;  // sm
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
}: {
  items: Item[];
  maxRows?: number;
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
          <div
            key={it.id}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CdnImage
              src={it.preview}
              alt={it.title || it.id}
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                {it.title || it.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length > limit ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            {expanded ? "See less" : `See more (${items.length - limit})`}
          </button>
        </div>
      ) : null}
    </div>
  );
}