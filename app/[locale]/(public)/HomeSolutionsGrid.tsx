"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useClickTracking } from "@/services/useTracking";

/**
 * The 6 Solutions as audience entry points (per docs/positioning-solutions-and-site-ia.md).
 * Each links to its EXISTING surface — no new pages — so this is the
 * manifestation layer over use-cases / tools / search. Per-card click tracking
 * (home-solution:<key>) so we can see which solution entry converts. Copy in
 * messages/<locale>/home.json under home.solutions.
 */
type Solution = {
  key: string;
  emoji: string;
  /** Object form is used where the link needs to carry query params. */
  href: string | { pathname: "/contact"; query: Record<string, string> };
};

// Order set 2026-09-22: commercial ICPs first, consumer/creator entry points
// after. E-commerce and photographers lead because they are the two audiences
// the production offer actually sells to today.
//
// `merch` and `design` came out of the grid in the same pass. Their copy is
// deliberately LEFT in messages/*/home.json under solutions.items so either can
// be restored without re-translating ten locales — they are not dead keys by
// accident, and lib/use-cases.ts still carries both personas.
const SOLUTIONS: Solution[] = [
  { key: "ecommerce", emoji: "🛒", href: "/use-cases/for-dtc-brands" },
  { key: "photographers", emoji: "📷", href: "/use-cases/for-photographers" },
  { key: "marketing", emoji: "🌍", href: "/use-cases/for-programmatic-seo" },
  // ⚠️ `education`'s copy says "at scale" but for-parents is a CONSUMER page
  // ("support your child's learning"). Left pointing there because no
  // education-at-scale persona page exists to point at — the mismatch is in the
  // destination, not the ordering, and inventing a page was explicitly not the
  // ask. Worth revisiting together.
  { key: "education", emoji: "📚", href: "/use-cases/for-parents" },
  { key: "video", emoji: "🎬", href: "/tools" },
  // Carries ?source= like every other commercial /contact link on the site, so
  // a developer enquiry is attributable instead of arriving anonymous.
  {
    key: "developers",
    emoji: "⚙️",
    href: { pathname: "/contact", query: { source: "home-solution:developers" } },
  },
];

function SolutionCard({ s }: { s: Solution }) {
  const t = useTranslations("home.solutions");
  const trackClick = useClickTracking(`home-solution:${s.key}`, "topic_capsule", "cards");
  return (
    <Link
      href={s.href}
      onClick={trackClick}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
    >
      <span className="text-2xl">{s.emoji}</span>
      <span className="text-base font-bold text-neutral-900">{t(`items.${s.key}.label`)}</span>
      <span className="text-sm leading-snug text-neutral-600">{t(`items.${s.key}.message`)}</span>
      <span className="mt-1 text-xs font-semibold text-purple-600 opacity-0 transition group-hover:opacity-100">
        {t("explore")}
      </span>
    </Link>
  );
}

export default function HomeSolutionsGrid() {
  const t = useTranslations("home.solutions");
  return (
    <section id="solutions" className="scroll-mt-24 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          {t("heading")}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{t("subheading")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <SolutionCard key={s.key} s={s} />
        ))}
      </div>
    </section>
  );
}
