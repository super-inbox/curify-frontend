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
  maxVisible = 8,
}: {
  tags: string[];
  locale: string;
  size?: "default" | "small";
  /**
   * Cap the number of VISIBLE tag chips (some prompts carry 25-30 tags, which
   * swamps the page). The overflow tags are still rendered as real <Link>s in an
   * sr-only wrapper, so the internal link graph to /tag/<tag> is unchanged for
   * crawlers — only the visual display is trimmed.
   */
  maxVisible?: number;
}) {
  if (!tags.length) return null;

  const visible = tags.slice(0, maxVisible);
  const overflow = tags.slice(maxVisible);

  return (
    <>
      {visible.map((tag, i) => (
        <TagChip key={`${tag}-${i}`} tag={tag} locale={locale} size={size} />
      ))}
      {overflow.length > 0 ? (
        <span className="sr-only">
          {overflow.map((tag, i) => (
            <TagChip key={`ov-${tag}-${i}`} tag={tag} locale={locale} size={size} />
          ))}
        </span>
      ) : null}
    </>
  );
}