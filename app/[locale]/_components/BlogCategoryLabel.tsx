"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import blogsData from "@/public/data/blogs.json";

type BlogCategoryLabelProps = {
  /** Blog slug — used to look up the active category from blogs.json. */
  slug?: string;
  /** Category slug — bypasses blogs.json lookup when caller already has it. */
  category?: string;
  /** Locale override; defaults to URL param (which is set by next-intl). */
  locale?: string;
  className?: string;
};

// Same pillar ordering as the /blog index filter row. Each pillar
// renders as a chip linking to /blog?category=<slug>. Display name +
// underlying category-slug stay paired here so the chip text and the
// /blog filter param align.
const PILLARS: Array<{ slug: string; label: string }> = [
  { slug: "nano-template",       label: "Nano Template" },
  { slug: "creator-tools",       label: "Creator Tools" },
  { slug: "video-dubbing",       label: "Video Dubbing" },
  { slug: "content-automation",  label: "Content Automation" },
  { slug: "learning-education",  label: "Learning & Education" },
  { slug: "ds-ai-engineering",   label: "DS & AI Engineering" },
  { slug: "ai-strategy",         label: "AI Strategy" },
];

function resolveCategorySlug(slug?: string, category?: string): string | null {
  if (category) return category;
  if (!slug) return null;
  const blog = (blogsData as Array<{ slug: string; category?: string }>).find(
    (b) => b.slug === slug,
  );
  return blog?.category ?? null;
}

export default function BlogCategoryLabel({
  slug,
  category,
  locale: localeProp,
  className = "",
}: BlogCategoryLabelProps) {
  const params = useParams();
  const locale = localeProp || ((params as { locale?: string })?.locale ?? "en");
  const active = resolveCategorySlug(slug, category);
  return (
    <div
      className={`mb-4 -mx-1 flex flex-wrap gap-2 ${className}`}
      aria-label="Blog categories"
    >
      {PILLARS.map((p) => {
        const isActive = p.slug === active;
        return (
          <Link
            key={p.slug}
            href={`/${locale}/blog?category=${encodeURIComponent(p.slug)}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              isActive
                ? "bg-purple-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
