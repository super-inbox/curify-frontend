"use client";

import { useState } from "react";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
}

interface BlogCategoryNavProps {
  blogPosts: BlogPost[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  isFloating?: boolean;
}

export default function BlogCategoryNav({
  blogPosts,
  selectedTag,
  onTagSelect,
  isFloating = false,
}: BlogCategoryNavProps) {
  const uniqueTags = Array.from(
    new Set(blogPosts.map((post) => post.tag))
  );

  const allTags = ["All", ...uniqueTags];

  const navClasses = isFloating
    ? "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    : "mb-8";

  const containerClasses = isFloating
    ? "max-w-[1280px] mx-auto px-4 py-3"
    : "flex flex-wrap gap-2";

  return (
    <div className={navClasses}>
      <div className={containerClasses}>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              selectedTag === tag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
