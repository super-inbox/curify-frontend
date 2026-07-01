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
type Solution = { key: string; emoji: string; href: string };

const SOLUTIONS: Solution[] = [
  { key: "merch", emoji: "🎁", href: "/use-cases/for-merch-operators" },
  { key: "design", emoji: "🎨", href: "/use-cases/for-designers" },
  { key: "education", emoji: "📚", href: "/use-cases/for-parents" },
  { key: "video", emoji: "🎬", href: "/tools" },
  { key: "marketing", emoji: "🌍", href: "/use-cases/for-programmatic-seo" },
  { key: "developers", emoji: "⚙️", href: "/contact" },
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
