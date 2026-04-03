"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import PromptCard from "./PromptCard";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPromptBase } from "@/types/nanoPrompts";
import CategoriesSection from "@/app/[locale]/_components/NanoBananaPromptsTags";


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

        <CategoriesSection categories={categories} currentTag="" />

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