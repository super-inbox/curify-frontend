import Link from "next/link";
import { getCanonicalPath } from "@/lib/canonical";

/**
 * Hand-off from an MBTI *answer* page to the MBTI *generator*.
 *
 * WHY (measured 2026-08-30, 28-day window). Fourteen `/nano-template/…/example/…`
 * MBTI pages rank positions 3–9 and take, between them, essentially zero
 * clicks — 2,852 impressions, 2 clicks. That is not a ranking failure. The
 * queries behind them ("minato mbti", "yellowstone mbti", "lamine yamal mbti")
 * are single-fact questions, and Google now answers them in an AI Overview
 * above our result. `haaland mbti` alone lost 47% of its impressions this way.
 * Nobody needs to click a page to be told a character is an ISTP.
 *
 * So these pages are never going to convert their own queries, and chasing
 * their CTR is chasing a question Google has already answered. What they DO
 * have is standing: Google trusts them enough to rank them top-ten across a
 * large character/MBTI family. This component spends that standing instead of
 * mourning it — every one of those pages points at the generator, which serves
 * creation-intent queries ("random mbti generator", "mbti character maker")
 * where a click is the only way to get the thing.
 *
 * It doubles as the indexation fix: on this site page AGE predicts indexation,
 * and a new surface needs at least three links from already-indexed pages to
 * get crawled at all. Fourteen page-one sources is a strong start.
 *
 * Rendered only for MBTI templates — see `isMbtiTemplate`.
 */

/** True for the MBTI template family: `template-mbti-*`, plus the ones that
 *  carry it as a suffix (`template-friends-character-mbti`,
 *  `template-zhenhuan-mbti-character-analysis`, `template-city-mbti`, …). */
export function isMbtiTemplate(templateId: string | undefined | null): boolean {
  return !!templateId && /(^|-)mbti(-|$)/i.test(templateId);
}

export default function MbtiGeneratorLink({
  locale,
  templateId,
}: {
  locale: string;
  templateId?: string | null;
}) {
  if (!isMbtiTemplate(templateId)) return null;

  return (
    <section className="not-prose my-8">
      <Link
        href={getCanonicalPath(locale, "/blog/mbti-character-generator")}
        className="group flex flex-col gap-3 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 px-5 py-4 no-underline transition-colors hover:border-purple-300 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <div className="text-base font-bold text-gray-900">
            Not sure which type to make?
          </div>
          <div className="mt-0.5 text-sm text-gray-600">
            Spin the random MBTI generator — get one of the 16 types, then turn it into a card.
          </div>
        </div>
        <span className="flex-none rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-purple-700">
          Random MBTI generator →
        </span>
      </Link>
    </section>
  );
}
