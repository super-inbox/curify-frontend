"use client";

import Link from "next/link";
import CdnImage from "../../_components/CdnImage";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import BlogCategoryNav from "../../_components/BlogCategoryNav";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
}

export default function BlogListPage() {
  const t = useTranslations("blog");
  const blogPosts = t.raw("posts") as BlogPost[];
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const uniqueTags = useMemo(() => {
    const tags = new Set(blogPosts.map((post) => post.tag));
    return ["All", ...Array.from(tags)];
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedTag === "All") return blogPosts;
    return blogPosts.filter((post) => post.tag === selectedTag);
  }, [blogPosts, selectedTag]);

  return (
    <>
      <BlogCategoryNav
        blogPosts={blogPosts}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        isFloating={true}
      />
      
      <div className="pt-2 pb-8">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="mb-6 text-4xl font-bold">{t("latestArticles")}</h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.slug}
                className="group overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-56 w-full">
                  <CdnImage
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-2 text-xs font-semibold uppercase text-red-600">
                    {post.tag}
                  </div>

                  <div className="mb-2 text-sm text-gray-500">
                    {post.date} &nbsp; / &nbsp; {post.readTime}
                  </div>

                  <h2 className="text-lg font-semibold transition group-hover:text-blue-600">
                    {post.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}