"use client";

import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import { PageLocale } from "@/lib/locale_utils";
import blogsData from "@/public/data/blogs.json";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

interface NanoBananaExamplesProps {
  locale: string;
  /** Real blog slug (e.g. "character-prompt-generator") or a sub-group
   *  key (e.g. "mbti-character-generator-universe") that prefixes one
   *  or more groupKeys in the catalog's nanoTemplates arrays. */
  blogSlug?: string;
}

interface NanoTemplateCard {
  groupKey: string;
  template_id: string;
  sample_parameters: Record<string, any>;
  category: string;
  description: string;
  image_urls: string[];
  preview_image_urls: string[];
}

export default function NanoBananaExamples({ locale, blogSlug }: NanoBananaExamplesProps) {
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signin");
    return false;
  }, [user, setDrawerState]);
  const onViewClick = () => {};

  // Flatten all nanoTemplates across the catalog into a single card pool.
  // blogSlug filters by groupKey prefix, so both real slugs (single-card
  // posts) and sub-group keys (mbti-character-generator-universe etc.)
  // resolve cleanly.
  const allCards = (blogsData as { nanoTemplates?: NanoTemplateCard[] }[])
    .flatMap((blog) => blog.nanoTemplates || []);

  const exampleCards: NanoInspirationCardType[] = allCards.map((card) => ({
    id: card.groupKey,
    template_id: card.template_id,
    language: locale as PageLocale,
    category: card.category,
    description: card.description,
    image_urls: card.image_urls,
    preview_image_urls: card.preview_image_urls,
    sample_parameters: card.sample_parameters,
    base_prompt: "",
    topics: card.template_id === "template-travel" ? ["travel"] : ["learning"],
  }));

  const filteredCards = blogSlug
    ? exampleCards.filter((card) => card.id.startsWith(blogSlug))
    : exampleCards;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Popular Template Examples</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-6">Explore our most popular Nano Banana prompt templates to see what's possible:</p>
        
        <NanoInspirationRow 
          cards={filteredCards}
          requireAuth={requireAuth}
          onViewClick={onViewClick}
        />
      </div>
    </section>
  );
}
