import Link from "next/link";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { getCanonicalPath } from "@/lib/canonical";

/**
 * Above-the-fold hand-off from an article to the tool it describes.
 *
 * Same image-card UI as the heroCta block in GenericBlogContent, whose own
 * comment records it at "33% engagement vs 0% for plain GenericBlogContent" —
 * the pattern was originally ported OUT of this page, so this puts it back.
 *
 * WHY (measured 2026-08-21): 89% of tool-intent impressions land on /blog/*
 * rather than a tool page. "mbti generator" ranks pos 5.7 with this article
 * (286 impr / 6 clicks); "random mbti generator" pos 5.9 with 271 impressions
 * and ZERO clicks. The searcher wants a generator and gets prose.
 */
export default function ToolHandoffBanner({
  locale,
  href,
  image,
  imageAlt,
  label,
  title,
  cta = "Try it →",
}: {
  locale: string;
  href: string;
  image: string;
  imageAlt?: string;
  label?: string;
  title: string;
  cta?: string;
}) {
  return (
    <section className="mb-8 not-prose">
      <Link
        href={getCanonicalPath(locale, href)}
        className="block group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-white no-underline"
      >
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <CdnImage
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
          />
        </div>
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {label && (
              <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">{label}</div>
            )}
            <div className="text-base font-semibold text-gray-900 truncate">{title}</div>
          </div>
          <div className="flex-shrink-0 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold group-hover:bg-blue-700 transition">
            {cta}
          </div>
        </div>
      </Link>
    </section>
  );
}
