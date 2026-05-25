"use client";

import { useClickTracking } from "@/services/useTracking";
import MetaChipLink from "./MetaChipLink";

type Props = {
  tags: string[];
  locale: string;
  title: string;
  subtitle?: string;
  className?: string;
};

// Tracked chip so Related Tags adoption is measurable. Uses
// content_type=tag_capsule (same as PromptTagChips) so the two
// surfaces aggregate cleanly, with a distinct content_id prefix
// (`nano_related_tags:` vs `nano_prompt_tags:`) so analytics can
// separate "clicked the prompt's own tag" from "clicked a related
// tag we proposed."
function RelatedTagChip({
  tag,
  locale,
}: {
  tag: string;
  locale: string;
}) {
  const handleClick = useClickTracking(
    `nano_related_tags:${tag}`,
    "tag_capsule",
  );
  return (
    <MetaChipLink
      href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`}
      onClick={handleClick}
      color="blue"
      size="small"
    >
      {tag}
    </MetaChipLink>
  );
}

export default function RelatedTagsSection({
  tags,
  locale,
  title,
  subtitle,
  className = "",
}: Props) {
  if (!tags.length) return null;
  return (
    <section className={`mt-10 ${className}`}>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RelatedTagChip key={tag} tag={tag} locale={locale} />
        ))}
      </div>
    </section>
  );
}
