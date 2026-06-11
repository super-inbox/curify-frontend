import Link from "next/link";
import CdnImage from "./CdnImage";
import { getCanonicalPath } from "@/lib/canonical";
import type { WcTravelRecommendation } from "@/lib/wcTravelRail";

// Full-width travel cross-sell rail rendered BELOW the example hero on
// WC content pages. Detects WC content via the `<country>-world-cup`
// compound tag (set by backfill_wc_country_tags.py per the existing
// convention) and surfaces travel inspirations for the same country.
//
// Why a separate component (not a second MoreLikeThisRail): the right-
// rail MoreLikeThis is presentation-only with thumbnail aspect-[3/4];
// this rail has its own framing copy ("Plan your trip to X") plus a
// 4-up grid sized for landscape travel posters. Different shape, same
// click target (example pages).

type Props = {
  recommendation: WcTravelRecommendation;
  locale: string;
};

export default function WcTravelRail({ recommendation, locale }: Props) {
  const items = recommendation.items.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          {/* Eyebrow line was "Heading to X for the World Cup?" — dropped
              because the WC 2026 hosts are Mexico / USA / Canada, so a
              user on a Brazil-or-England squad page isn't actually
              traveling there for the tournament. The heading stays
              venue-agnostic ("Plan your trip to X"). */}
          <h2 className="text-xl font-bold text-neutral-900">
            Plan your trip to {recommendation.countryLabel}
          </h2>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const slug = item.template_id.replace(/^template-/, "");
          const href = getCanonicalPath(
            locale,
            `/nano-template/${slug}/example/${item.id}`,
          );
          return (
            <li key={item.id}>
              <Link
                href={href}
                className="group block overflow-hidden rounded-2xl border border-amber-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label={item.title}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <CdnImage
                    src={item.image}
                    alt={item.title}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-6 text-[10px] font-medium leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="line-clamp-2">{item.title}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
