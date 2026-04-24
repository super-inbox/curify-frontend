"use client";

import Link from "next/link";
import CdnImage from "../../_components/CdnImage";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
}

const PILLARS = [
  {
    id: "nano-template",
    label: "Nano Template",
    icon: "🍌",
    description: "AI visual prompts, templates & lookbooks",
    hub: "ultimate-directory-of-nano-banana-prompts",
  },
  {
    id: "creator-tools",
    label: "Creator Tools",
    icon: "🎨",
    description: "AI tools, workflows & creative pipelines",
    hub: "best-ai-tools",
  },
  {
    id: "video-translation-dubbing",
    label: "Video Dubbing",
    icon: "🎬",
    description: "Video translation, dubbing & voice cloning",
    hub: "ai-youtube-video-translator",
  },
  {
    id: "content-automation",
    label: "Content Automation",
    icon: "⚙️",
    description: "AI-driven content systems & distribution",
    hub: "curify-ai-growth-engine",
  },
  {
    id: "learning-education",
    label: "Learning & Education",
    icon: "📚",
    description: "Visual learning tools for students & parents",
    hub: "visual-learning-tools",
  },
  {
    id: "ds-ai-engineering",
    label: "DS & AI Engineering",
    icon: "🔬",
    description: "AI architecture, pipelines & platform design",
    hub: "ai-content-production-system",
  },
];

export default function BlogListPage() {
  const t = useTranslations("blog");
  const { locale } = useParams() as { locale: string };
  const blogPosts = t.raw("posts") as BlogPost[];
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const blogBySlug = useMemo(
    () => new Map(blogPosts.map((p) => [p.slug, p])),
    [blogPosts]
  );

  const filteredPosts = useMemo(() => {
    if (selectedTag === "All") return blogPosts;
    return blogPosts.filter((post) => post.tag === selectedTag);
  }, [blogPosts, selectedTag]);

  const blogHref = (slug: string) => `/${locale}/blog/${slug}`;

  return (
    <div className="pt-2 pb-16">
      <div className="mx-auto max-w-[1180px] px-4">

        {/* ── Pillar Hub Section ───────────────────────────────────────── */}
        <section className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-neutral-900">{t("latestArticles")}</h1>
          <p className="mb-8 text-neutral-500 text-base">Explore our 6 content pillars — each hub anchors a cluster of deep-dive articles.</p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PILLARS.map((pillar) => {
              const hubPost = blogBySlug.get(pillar.hub);
              return (
                <Link
                  key={pillar.id}
                  href={hubPost ? blogHref(pillar.hub) : "#"}
                  onClick={() => setSelectedTag(pillar.label)}
                  className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
                >
                  <span className="text-2xl">{pillar.icon}</span>
                  <span className="text-sm font-bold text-neutral-900 group-hover:text-purple-700 leading-tight">
                    {pillar.label}
                  </span>
                  <span className="text-xs text-neutral-400 leading-snug">
                    {pillar.description}
                  </span>
                  <span className="mt-auto text-[11px] font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read hub →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Tag Filter ───────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", ...PILLARS.map((p) => p.label)].map((tag) => (
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
