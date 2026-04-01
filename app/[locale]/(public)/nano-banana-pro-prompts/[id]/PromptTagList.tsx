"use client";

import Link from "next/link";
import { useClickTracking } from "@/services/useTracking";

export default function PromptTagList({
  tags,
  locale,
}: {
  tags: string[];
  locale: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => {
        const handleClick = useClickTracking(
          `nano_prompt_tags:${tag}`,
          "tag_capsule"
        );

        return (
          <Link
            key={tag}
            href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`}
            onClick={handleClick}
            className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            {tag}
          </Link>
        );
      })}
    </div>
  );
}