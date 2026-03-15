"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { toSlug } from "@/lib/nano_utils";
import { useClickTracking } from "@/services/useTracking";

type Item = {
  id: string;
  title: string;
  preview: string;
  templateId: string;
};

function getCols() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

function useCols() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const onResize = () => setCols(getCols());

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return cols;
}

function ExampleImageCard({
  item,
  locale,
}: {
  item: Item;
  locale: string;
}) {
  const trackClick = useClickTracking(item.id, "nano_inspiration", "cards");

  return (
    <Link
      href={`/${locale}/nano-template/${toSlug(item.templateId)}/example/${encodeURIComponent(item.id)}`}
      onClick={trackClick}
      className="group block overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative overflow-hidden">
        <CdnImage
          src={item.preview}
          alt={item.title || item.id}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-4 opacity-0 transition-colors duration-200 group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-neutral-900 shadow backdrop-blur-sm">
            View prompt →
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors group-hover:text-purple-700">
          {item.title || item.id}
        </div>
      </div>
    </Link>
  );
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

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

      {visible.map((it) => (
  <ExampleImageCard
    key={it.id}
    item={it}
    locale={locale}
  />
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