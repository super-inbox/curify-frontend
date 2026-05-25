"use client";

import Link from "next/link";
import CdnImage from "../../_components/CdnImage";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import blogsData from "@/public/data/blogs.json";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
  category?: string;
}

// Pillar labels shown in the tag filter row — the order also controls
// the filter pill order. Drop a pillar here to remove it from the
// filter; the hub for each pillar is still a regular post in the feed
// so it stays reachable.
const PILLAR_LABELS = [
  "Nano Template",
  "Creator Tools",
  "Video Dubbing",
  "Content Automation",
  "Learning & Education",
  "DS & AI Engineering",
];

export default function BlogListPage() {
  const t = useTranslations("blog");
  const { locale } = useParams() as { locale: string };
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // public/data/blogs.json is the single source of truth for the feed
  // catalog. The file is hand-curated and not strictly chronological,
  // so sort by parsed date (most recent first) at render time.
  const blogPosts = useMemo(() => {
    return (blogsData as BlogPost[]).slice().sort((a, b) => {
      const da = Date.parse(a.date) || 0;
      const db = Date.parse(b.date) || 0;
      return db - da;
    });
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedTag === "All") return blogPosts;
    return blogPosts.filter((post) => post.tag === selectedTag);
  }, [blogPosts, selectedTag]);

  const blogHref = (slug: string) => `/${locale}/blog/${slug}`;

  return (
    <div className="pt-2 pb-16">
      <div className="mx-auto max-w-[1400px] px-4">

        <h1 className="mb-6 text-4xl font-bold text-neutral-900">{t("latestArticles")}</h1>

        {/* ── Tag Filter ───────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", ...PILLAR_LABELS].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedTag === tag
                  ? "bg-purple-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ── Post Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link
              href={blogHref(post.slug)}
              key={post.slug}
              className="group overflow-hidden rounded-xl border border-neutral-200 shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-48 w-full bg-neutral-100">
                <CdnImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-600">
                  {post.tag}
                </div>
                <div className="mb-2 text-xs text-neutral-400">
                  {post.date} · {post.readTime}
                </div>
                <h2 className="text-base font-semibold leading-snug text-neutral-900 transition group-hover:text-purple-700">
                  {post.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
