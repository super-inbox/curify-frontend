import Link from "next/link";
import { getCanonicalPath } from "@/lib/canonical";

/**
 * Above-the-fold hand-off from an article to the tool it describes.
 *
 * WHY (measured 2026-08-21): 89% of our tool-intent search impressions land on
 * /blog/* rather than on a tool or template page — "mbti generator" ranks at
 * position 5.7 with our ARTICLE, 286 impressions and 6 clicks. Someone typing
 * "…generator" wants a generator, and we answered with prose, so they bounce.
 * When a tool page does surface for those queries it converts at 15.4% versus
 * the blog's 2.1%.
 *
 * The article can keep ranking — it just has to hand off in the first screen
 * instead of two thirds of the way down.
 */
export default function ToolHandoffBanner({
  locale,
  href,
  label,
  title,
  cta = "Open it →",
}: {
  locale: string;
  href: string;
  label: string;
  title: string;
  cta?: string;
}) {
  return (
    <Link
      href={getCanonicalPath(locale, href)}
      className="not-prose mb-8 flex items-center justify-between gap-4 rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 no-underline transition hover:border-purple-300 hover:bg-purple-100"
    >
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-purple-700">{label}</div>
        <div className="truncate text-base font-semibold text-gray-900">{title}</div>
      </div>
      <span className="flex-shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
        {cta}
      </span>
    </Link>
  );
}
