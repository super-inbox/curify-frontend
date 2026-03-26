"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import PromptCard from "./PromptCard";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPromptBase } from "@/types/nanoPrompts";

/**
 * UI Prompt Shape (view model)
 */
type Prompt = {
  id: number;
  title: string;
  description: string | null;
  promptText: string;
  imageUrl: string | null;
  category: string | null;
  sourceType: string | null;
  domainCategory: string | null;
};

type Pagination = {
  total: number;
  hasNextPage: boolean;
};

interface DomainCategory {
  category: string;
  count: number;
}

interface Props {
  initialData: Prompt[] | null;
  error: string | null;
}

function mapNanoPromptToUI(p: NanoPromptBase): Prompt {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    promptText: p.prompt,
    imageUrl: p.imageURL ?? null,
    category: p.tags?.[0] ?? null,
    sourceType: null,
    domainCategory: p.tags?.[0] ?? null,
  };
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NanoBananaProPromptsClient({
  initialData,
  error,
}: Props) {
  const t = useTranslations("nanoGallery");

  const [allPrompts, setAllPrompts] = useState<Prompt[]>(initialData || []);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const [isLoading, setIsLoading] = useState(!initialData);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sources, setSources] = useState<string[]>(["all"]);
  const [domainCategories, setDomainCategories] = useState<DomainCategory[]>(
    []
  );
  const [displayedCount, setDisplayedCount] = useState(20);

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    hasNextPage: false,
  });

  useEffect(() => {
    if (!error) loadData();
    else setIsLoading(false);
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);

      const nanoPrompts = await nanoPromptsService.getMostPopularNanoPrompts();
      const mapped = nanoPrompts.map(mapNanoPromptToUI);

      processPrompts(mapped);
    } catch (err) {
      console.error("Error loading prompts:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function processPrompts(data: Prompt[]) {
    const valid = data.filter(
      (p) => p && typeof p.id === "number" && typeof p.title === "string"
    );

    setAllPrompts(valid);

    const uniqueSources = Array.from(
      new Set(valid.map((p) => p.sourceType).filter(Boolean))
    ) as string[];

    setSources(["all", ...uniqueSources]);

    const counts: Record<string, number> = {};
    valid.forEach((p) => {
      if (p.domainCategory) {
        counts[p.domainCategory] = (counts[p.domainCategory] || 0) + 1;
      }
    });

    setDomainCategories(
      Object.entries(counts)
        .map(([category, count]) => ({
          category,
          count,
        }))
        .sort((a, b) => b.count - a.count)
    );
  }

  const filterPrompts = useCallback(() => {
    let filtered = [...allPrompts];

    if (sourceFilter !== "all") {
      filtered = filtered.filter((p) => p.sourceType === sourceFilter);
    }

    const total = filtered.length;
    const visible = Math.min(displayedCount, total);

    setPagination({
      total,
      hasNextPage: visible < total,
    });

    return filtered.slice(0, displayedCount);
  }, [allPrompts, sourceFilter, displayedCount]);

  useEffect(() => {
    setDisplayedCount(20);
  }, [sourceFilter]);

  useEffect(() => {
    setPrompts(filterPrompts());
  }, [filterPrompts]);

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

        {domainCategories.length > 0 && (
          <section className="sticky top-24 z-20 mb-8 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Categories
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {domainCategories.map(({ category, count }) => (
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
          </section>
        )}

        {prompts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
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