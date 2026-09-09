"use client";

// Sibling of RelatedBlogs that takes a categories list directly instead of
// looking up the current blog post. Used on tool detail pages and use-case
// pages where the host surface is not itself a blog and there is no
// "current slug" to derive a category from. Source of truth for the
// mappings: docs/interconnection.md.

import { useTranslations } from "next-intl";
import blogsData from "@/public/data/blogs.json";
import RelatedBlogCard from "./RelatedBlogCard";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
  category?: string;
  lastmod?: string;
}

type Props = {
  categories: string[];
  locale: string;
  max?: number;
  heading?: string;
  /** Slugs to hoist above the date sort, if they are in `categories`.
   *  Freshness alone cannot give a specific post an inbound link: `merch-pod`
   *  holds 12 posts and `max` is 3, so `url-to-product-video` (lastmod
   *  2026-07-16) sits at rank 7 and never renders. The KD-campaign spokes are
   *  linked deliberately, not because they happen to be recent — see
   *  TOOL_PINNED_BLOGS. */
  pinnedSlugs?: string[];
};

export default function RelatedBlogsByCategory({
  categories,
  locale,
  max = 3,
  heading,
  pinnedSlugs,
}: Props) {
  const t = useTranslations("blog");
  const set = new Set(categories);
  const pinned = new Set(pinnedSlugs ?? []);

  // Filter then sort by `lastmod ?? date` desc so the freshest in-category
  // posts surface first — matches the blog sitemap's lastmod signal. Pinned
  // slugs sort ahead of that, keeping their own relative freshness order.
  const filtered = (blogsData as BlogPost[])
    .filter((b) => b.category && set.has(b.category))
    .sort((a, b) => {
      const aPin = pinned.has(a.slug) ? 1 : 0;
      const bPin = pinned.has(b.slug) ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      const aKey = a.lastmod || a.date || "";
      const bKey = b.lastmod || b.date || "";
      return bKey.localeCompare(aKey);
    })
    .slice(0, max);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {heading ?? t("relatedArticles", { defaultValue: "Related Articles" })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((blog) => (
          <RelatedBlogCard
            key={blog.slug}
            blog={blog}
            locale={locale}
            category={blog.category || ""}
          />
        ))}
      </div>
    </section>
  );
}
