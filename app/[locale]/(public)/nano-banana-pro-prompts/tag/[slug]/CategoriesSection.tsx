"use client";

import { useState } from "react";
import Link from "next/link";

interface TagCategory {
  category: string;
  count: number;
}

interface Props {
  categories: TagCategory[];
  currentTag: string;
}

export default function CategoriesSection({ categories, currentTag }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Categories</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {(expanded ? categories : categories.slice(0, 8)).map(({ category, count }) => (
          <Link
            key={category}
            href={`/nano-banana-pro-prompts/tag/${encodeURIComponent(category)}`}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
              category === currentTag
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            <span>{category}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {count}
            </span>
          </Link>
        ))}
      </div>

      {categories.length > 8 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "▲ Show less" : `▼ Show all ${categories.length} categories`}
        </button>
      )}
    </section>
  );
}
