"use client";

import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import { PageLocale } from "@/lib/locale_utils";
import blogToNanoTemplateMapping from "@/public/data/blog-to-nano-template-mapping.json";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

interface NanoBananaExamplesProps {
  locale: string;
  blogSlug?: string;
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

  // Generate example cards from JSON mapping
  const exampleCards: NanoInspirationCardType[] = Object.entries(blogToNanoTemplateMapping).map(([blogId, mapping]: [string, any]) => ({
    id: `${mapping.template_id}-${blogId}`,
    template_id: mapping.template_id,
    language: locale as PageLocale,
    category: mapping.category,
    description: mapping.description,
    image_urls: mapping.image_urls,
    preview_image_urls: mapping.preview_image_urls,
    sample_parameters: mapping.sample_parameters,
    base_prompt: "",
    topics: mapping.template_id === "template-travel" ? ["travel"] : ["learning"]
  }));

  // If blogSlug is provided, filter to show only relevant template
  const filteredCards = blogSlug 
    ? exampleCards.filter(card => card.id.includes(blogSlug))
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
