"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { filterSuggestions } from "@/lib/searchIndex";

type InspRecord = {
  id: string;
  template_id: string;
  asset: { preview_image_url: string; image_url: string };
  topics?: string[];
  tags?: string[];
};

type Props = {
  query: string;
  locale: string;
  inspirations: InspRecord[];
};

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE ?? "https://cdn.curify-ai.com";

export default function SearchResultsClient({ query, locale, inspirations }: Props) {
  const [input, setInput] = useState(query);
  const router = useRouter();

  // Deduplicate: one card per template_id
  const cards = useMemo(() => {
    const seen = new Set<string>();
    return inspirations.filter((r) => {
      if (seen.has(r.template_id)) return false;
      seen.add(r.template_id);
      return true;
    });
  }, [inspirations]);

  // Related topic suggestions
  const relatedTopics = useMemo(() => filterSuggestions(query, 6), [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(q.toLowerCase())}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Related topic chips */}
      {relatedTopics.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-neutral-500 self-center">Browse:</span>
          {relatedTopics.map((s) => (
            <Link
              key={s.slug}
              href={`/${locale}/topics/${s.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {s.emoji && <span>{s.emoji}</span>}
              {s.label}
            </Link>
          ))}
        </div>
      )}

      {/* Results heading */}
      <p className="mb-5 text-sm text-neutral-500">
        {cards.length > 0
          ? `${cards.length} template${cards.length !== 1 ? "s" : ""} for "${query}"`
          : `No results for "${query}"`}
      </p>

      {cards.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-400 mb-4">Try browsing a topic instead:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {relatedTopics.map((s) => (
              <Link
                key={s.slug}
                href={`/${locale}/topics/${s.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {s.emoji} {s.label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/${locale}/nano-template/${card.template_id}`}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                <CdnImage
                  src={card.asset.preview_image_url}
                  alt={card.template_id}
                  width={280}
                  height={373}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
