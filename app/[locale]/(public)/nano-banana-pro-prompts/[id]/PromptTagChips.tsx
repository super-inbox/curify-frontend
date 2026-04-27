"use client";

import { useClickTracking } from "@/services/useTracking";
import MetaChipLink from "@/app/[locale]/_components/MetaChipLink";

function TagChip({
  tag,
  locale,
  size,
}: {
  tag: string;
  locale: string;
  size: "default" | "small";
}) {
  const handleClick = useClickTracking(`nano_prompt_tags:${tag}`, "tag_capsule");
  return (
    <MetaChipLink
      href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`}
      onClick={handleClick}
      color="purple"
      size={size}
    >
      {tag}
    </MetaChipLink>
  );
}

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
      {tags.map((tag, i) => (
        <TagChip key={`${tag}-${i}`} tag={tag} locale={locale} size={size} />
      ))}
    </>
  );
}