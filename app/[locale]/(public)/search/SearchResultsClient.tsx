"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import ExampleImagesGrid from "@/app/[locale]/(public)/nano-template/[slug]/ExampleImagesGrid";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import type { SuggestionEntry } from "@/lib/searchIndex";

type InspRecord = {
  id: string;
  template_id: string;
  asset: {
    preview_image_url: string;
    image_url: string;
    video_url?: string;
  };
  params?: Record<string, unknown>;
  topics?: string[];
  tags?: string[];
  locales?: Record<string, { title?: string }>;
};

type Props = {
  query: string;
  locale: string;
  inspirations: InspRecord[];
  relatedTopics: SuggestionEntry[];
  matchedTemplates: NanoInspirationCardType[];
};

export default function SearchResultsClient({
  query,
  locale,
  inspirations,
  relatedTopics,
  matchedTemplates,
}: Props) {
  const [input, setInput] = useState(query);
  const router = useRouter();
  const t = useTranslations("topics");
  const localize = useCallback(
    (slug: string) => (t.has(`${slug}.displayName`) ? t(`${slug}.displayName`) : undefined),
    [t]
  );
  const renderLabel = useCallback(
    (slug: string, fallback: string) => localize(slug) ?? fallback,
    [localize]
  );

  // Cap at 3 examples per template_id — keeps results diverse without
  // crowding the grid with near-duplicate variants of the same template.
  // Then map to the shape ExampleImagesGrid expects.
  const gridItems = useMemo(() => {
    const counts = new Map<string, number>();
    return inspirations
      .filter((r) => {
        const n = counts.get(r.template_id) ?? 0;
        if (n >= 3) return false;
        counts.set(r.template_id, n + 1);
        return true;
      })
      .map((r) => ({
        id: r.id,
        title:
          r.locales?.[locale]?.title ||
          r.locales?.en?.title ||
          r.locales?.zh?.title ||
          "",
        preview: r.asset.preview_image_url,
        templateId: r.template_id,
        params: Object.fromEntries(
          Object.entries(r.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
        ) as Record<string, string>,
        videoUrl: r.asset.video_url,
      }));
  }, [inspirations, locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(q.toLowerCase())}`);
  };

  const hasResults = gridItems.length > 0 || matchedTemplates.length > 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Mobile-only search input — desktop uses SiteTopBar's SearchBar */}
      <form onSubmit={handleSearch} className="lg:hidden mb-8 flex gap-2">
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
              {renderLabel(s.slug, s.label)}
            </Link>
          ))}
        </div>
      )}

      <p className="mb-5 text-sm text-neutral-500">
        {hasResults
          ? `Results for "${query}"`
          : `No results for "${query}"`}
      </p>

      {!hasResults ? (
        <div className="py-16 text-center">
          <p className="text-neutral-400 mb-4">Try browsing a topic instead:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {relatedTopics.map((s) => (
              <Link
                key={s.slug}
                href={`/${locale}/topics/${s.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {s.emoji} {renderLabel(s.slug, s.label)}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Examples grid (top): same UI used on /topics, /nano-template
              detail, /inspiration-hub. Tracking, share, remix all carry over
              for free. */}
          {gridItems.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-bold text-neutral-900">
                Examples
              </h2>
              <ExampleImagesGrid
                items={gridItems}
                locale={locale}
                maxRows={3}
              />
            </section>
          )}

          {/* Templates rail (bottom): renders the matched template cards
              with the same component the topic page uses. */}
          {matchedTemplates.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-3 text-lg font-bold text-neutral-900">
                Templates
              </h2>
              <NanoTemplateDetailClient
                locale={locale}
                otherNanoCards={matchedTemplates}
                showReproduce={false}
                showOtherTemplates={true}
                showOtherTemplateTitle={false}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
