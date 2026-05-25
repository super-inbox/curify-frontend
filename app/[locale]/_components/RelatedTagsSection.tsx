import MetaChipLink from "./MetaChipLink";

type Props = {
  tags: string[];
  locale: string;
  title: string;
  subtitle?: string;
  className?: string;
};

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
          <MetaChipLink
            key={tag}
            href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`}
            color="neutral"
            size="small"
          >
            {tag}
          </MetaChipLink>
        ))}
      </div>
    </section>
  );
}
