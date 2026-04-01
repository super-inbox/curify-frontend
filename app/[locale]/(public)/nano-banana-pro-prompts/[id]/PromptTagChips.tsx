"use client";

import { useClickTracking } from "@/services/useTracking";
import MetaChipLink from "@/app/[locale]/_components/MetaChipLink";

export default function PromptTagChips({
  tags,
  locale,
  size = "small",
}: {
  tags: string[];
  locale: string;
  size?: "default" | "small";
}) {
  if (!tags.length) return null;

  return (
    <>
      {tags.map((tag) => {
        const handleClick = useClickTracking(
          `nano_prompt_tags:${tag}`,
          "tag_capsule"
        );

        return (
          <MetaChipLink
            key={tag}
            href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`}
            onClick={handleClick}
            color="purple"
            size={size}
          >
            {tag}
          </MetaChipLink>
        );
      })}
    </>
  );
}