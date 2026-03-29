"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import PromptCard from "./PromptCard";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPromptBase } from "@/types/nanoPrompts";

type Pagination = {
  total: number;
  hasNextPage: boolean;
};

interface TagCategory {
  category: string;
  count: number;
}

interface Props {
  initialData: NanoPromptBase[] | null;
  error: string | null;
  staticCategories: TagCategory[];
}

export default function NanoBananaProPromptsClient({
  initialData,
  error,
  staticCategories,
}: Props) {
  const t = useTranslations("nanoGallery");

  const [allPrompts, setAllPrompts] = useState<NanoPromptBase[]>(
    initialData || []
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [displayedCount, setDisplayedCount] = useState(20);

  useEffect(() => {
    if (initialData || error) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);
        const nanoPrompts =
          await nanoPromptsService.getMostPopularNanoPrompts();
        setAllPrompts(
          nanoPrompts.filter(
            (p) => p && typeof p.id === "number" && typeof p.title === "string"
          )
        );
      } catch (err) {
        console.error("Error loading prompts:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [initialData, error]);

  const categories = staticCategories;
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const prompts = useMemo(() => {
    return allPrompts.slice(0, displayedCount);
  }, [allPrompts, displayedCount]);

  const pagination = useMemo<Pagination>(() => {
    return {
      total: allPrompts.length,
      hasNextPage: displayedCount < allPrompts.length,
    };
  }, [allPrompts.length, displayedCount]);

  const loadMore = () => setDisplayedCount((prev) => prev + 20);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">
            {t.rich("description", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </header>

        {categories.length > 0 && (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Categories
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {(categoriesExpanded ? categories : categories.slice(0, 8)).map(({ category, count }) => (
                <Link
                  key={category}
                  href={`/nano-banana-pro-prompts/tag/${encodeURIComponent(category)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
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
                onClick={() => setCategoriesExpanded((prev) => !prev)}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
              >
                {categoriesExpanded ? "▲ Show less" : `▼ Show all ${categories.length} categories`}
              </button>
            )}
          </section>
        )}

        {prompts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>

            {pagination.hasNextPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="rounded-md bg-indigo-600 px-6 py-3 text-white"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg bg-white py-12 text-center shadow">
      <p className="text-gray-500">No prompts found</p>
    </div>
  );
}