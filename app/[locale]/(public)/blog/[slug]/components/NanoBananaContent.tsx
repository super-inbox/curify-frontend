import Link from "next/link";

import { formatNanoBananaContent } from "../utils/content-formatters";
import NanoBananaExamples from "../NanoBananaExamples";

interface NanoBananaContentProps {
  slug: string;
  t: any;
  locale: string;
}

type GridItem = { url: string; tag: string; href: string };

// Tag-image grids per section. The image URLs are real CDN-hosted gallery
// thumbnails; the hrefs land on the tag-filtered slice of
// /nano-banana-pro-prompts. These live in JSX (not inside the message
// strings) because next-intl's ICU MessageFormat parser treats raw <...>
// as rich-text tags and returns the message empty when it can't resolve a
// callback function — i.e., inlining <div>/<img> HTML inside a message
// silently breaks the section.
const TAG_GRIDS: Record<string, GridItem[]> = {
  ecosystemContent: [
    { url: "https://cdn.curify-ai.com/images/93279ddaad6b4046e5405d8b8eec1613_thumb_1762921259135.jpg", tag: "playful", href: "/nano-banana-pro-prompts/tag/playful" },
    { url: "https://cdn.curify-ai.com/images/b5640759ad5b235388048538af81f39f_thumb_1762921250734.jpg", tag: "confident", href: "/nano-banana-pro-prompts/tag/confident" },
    { url: "https://cdn.curify-ai.com/images/d1192a782173539265755d1c5cde7824_thumb_1762921246720.jpg", tag: "serene", href: "/nano-banana-pro-prompts/tag/serene" },
    { url: "https://cdn.curify-ai.com/images/4f61825a8edc8bb57ae2652db01fce88_thumb_1762936816791.jpg", tag: "cozy", href: "/nano-banana-pro-prompts/tag/cozy" },
  ],
  seoContent: [
    { url: "https://cdn.curify-ai.com/images/56596451bddad8b6266bdb04198443ad_thumb_1762936827785.jpg", tag: "portrait", href: "/nano-banana-pro-prompts/tag/portrait" },
    { url: "https://cdn.curify-ai.com/images/d63001868ebfa6f0446efcc39bf39a61_thumb_1762921253788.jpg", tag: "woman", href: "/nano-banana-pro-prompts/tag/woman" },
    { url: "https://cdn.curify-ai.com/images/fa7ea9cf0d74d684bfa0cecf79a9b318_thumb_1762936835149.jpg", tag: "portrait", href: "/nano-banana-pro-prompts/tag/portrait" },
    { url: "https://cdn.curify-ai.com/images/73f21d17ffd1a82af14442792656c491_thumb_1762921268851.jpg", tag: "woman", href: "/nano-banana-pro-prompts/tag/woman" },
  ],
  generatorContent: [
    { url: "https://cdn.curify-ai.com/images/45658b99d089618b244c024b1ea93cc9_thumb_1762921242171.jpg", tag: "illustration", href: "/nano-banana-pro-prompts/tag/illustration" },
    { url: "https://cdn.curify-ai.com/images/d694b47bc9f57eddde10717db6dbd64d_thumb_1762921272689.jpg", tag: "minimalist", href: "/nano-banana-pro-prompts/tag/minimalist" },
    { url: "https://cdn.curify-ai.com/images/67341860a3687829ef075e57553c62b6_thumb_1762939887482.jpg", tag: "vintage", href: "/nano-banana-pro-prompts/tag/vintage" },
    { url: "https://cdn.curify-ai.com/images/8d2db728c2ea296531c309c8c7d5eaaf_thumb_1762936845959.jpg", tag: "neon", href: "/nano-banana-pro-prompts/tag/neon" },
  ],
  toolsContent: [
    { url: "https://cdn.curify-ai.com/images/d8ae8a26b113dc75bf3e670211c455f8_thumb_1762936831007.jpg", tag: "golden hour", href: "/nano-banana-pro-prompts/tag/golden%20hour" },
    { url: "https://cdn.curify-ai.com/images/73f21d17ffd1a82af14442792656c491_thumb_1762921268851.jpg", tag: "night", href: "/nano-banana-pro-prompts/tag/night" },
    { url: "https://cdn.curify-ai.com/images/d1192a782173539265755d1c5cde7824_thumb_1762921246720.jpg", tag: "winter", href: "/nano-banana-pro-prompts/tag/winter" },
    { url: "https://cdn.curify-ai.com/images/4475613ddf6aee3245139cdc3600de98_thumb_1763100965872.jpg", tag: "cinematic", href: "/nano-banana-pro-prompts/tag/cinematic" },
  ],
};

function TagImageGrid({ items, locale }: { items: GridItem[]; locale: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
      {items.map((item, idx) => (
        <Link
          key={`${item.tag}-${idx}`}
          href={`/${locale}${item.href}`}
          className="block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          title={item.tag}
        >
          <img
            src={item.url}
            alt={item.tag}
            loading="lazy"
            className="w-full h-36 object-cover block"
          />
        </Link>
      ))}
    </div>
  );
}

function Section({
  title,
  body,
  grid,
  locale,
}: {
  title: string;
  body: string;
  grid?: GridItem[];
  locale: string;
}) {
  if (!body && !title) return null;
  return (
    <section>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {grid && <TagImageGrid items={grid} locale={locale} />}
      {body && (
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: formatNanoBananaContent(body) }}
        />
      )}
    </section>
  );
}

const SECTION_KEYS: Array<{ titleKey: string; contentKey: string }> = [
  { titleKey: "whatIsTitle", contentKey: "whatIsContent" },
  { titleKey: "ecosystemTitle", contentKey: "ecosystemContent" },
  { titleKey: "seoTitle", contentKey: "seoContent" },
  { titleKey: "generatorTitle", contentKey: "generatorContent" },
  { titleKey: "toolsTitle", contentKey: "toolsContent" },
  { titleKey: "curifyTitle", contentKey: "curifyContent" },
  { titleKey: "promptExamplesTitle", contentKey: "promptExamplesContent" },
  { titleKey: "promptTemplatesTitle", contentKey: "promptTemplatesContent" },
];

export default function NanoBananaContent({ slug, t, locale }: NanoBananaContentProps) {
  const get = (k: string) => {
    const v = t(k, "");
    return typeof v === "string" ? v : "";
  };
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">{get("intro")}</p>

      {SECTION_KEYS.map(({ titleKey, contentKey }) => {
        const title = get(titleKey);
        const body = get(contentKey);
        if (!title && !body) return null;
        return (
          <Section
            key={contentKey}
            title={title}
            body={body}
            grid={TAG_GRIDS[contentKey]}
            locale={locale}
          />
        );
      })}

      <NanoBananaExamples locale={locale} blogSlug={slug} />
    </div>
  );
}
