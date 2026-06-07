import React from "react";
import blogsData from "@/public/data/blogs.json";
import categoriesData from "@/public/data/blog-categories.json";

type BlogCategoryLabelProps = {
  /** Blog slug — used to look up the category from blogs.json. */
  slug?: string;
  /** Category slug — bypasses blogs.json lookup when caller already has it. */
  category?: string;
  className?: string;
};

const CATEGORY_NAME_FALLBACK: Record<string, string> = {
  "ds-ai-engineering": "DS & AI Engineering",
  "content-automation": "Content Automation",
  "creator-tools": "Creator Tools",
  "ai-strategy": "AI Strategy",
  "learning-education": "Learning & Education",
  "video-translation": "Video Translation",
  "video-translation-dubbing": "Video Translation",
  "video-dubbing": "Video Dubbing",
  "nano-template": "Nano Templates",
  "nano-banana-prompts": "Nano Banana Prompts",
  "culture": "Culture",
};

function resolveCategorySlug(slug?: string, category?: string): string | null {
  if (category) return category;
  if (!slug) return null;
  const blog = (blogsData as Array<{ slug: string; category?: string }>).find(
    (b) => b.slug === slug,
  );
  return blog?.category ?? null;
}

function categoryDisplayName(categorySlug: string): string {
  const fromConfig =
    (categoriesData as { categories: Record<string, { name?: string }> })
      .categories[categorySlug]?.name;
  return fromConfig || CATEGORY_NAME_FALLBACK[categorySlug] || categorySlug;
}

export default function BlogCategoryLabel({
  slug,
  category,
  className = "",
}: BlogCategoryLabelProps) {
  const resolved = resolveCategorySlug(slug, category);
  if (!resolved) return null;
  return (
    <div
      className={`text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2 ${className}`}
    >
      {categoryDisplayName(resolved)}
    </div>
  );
}
