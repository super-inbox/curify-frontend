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

// Order set 2026-09-22: commercial ICPs first. Every card now lands on a b2b
// persona page except Video Creators, which routes to /tools.
//
// Education and Developers came out on the second pass. Education was the
// clearer win to lose: its copy said "at scale" while pointing at for-parents,
// a consumer page about a child's learning. `publishers` takes the slot and is
// the same subject told to the buyer — EdTech and children's publishers who
// need a 500-card vocabulary set — so the education angle survives and the
// destination finally matches the promise.
//
// Copy for `education`, `developers` and `design` is deliberately LEFT in
// messages/*/home.json under solutions.items so any of them can be restored
// without re-translating ten locales. All three personas remain in
// lib/use-cases.ts. They are benched, not deleted.
const SOLUTIONS: Solution[] = [
  { key: "ecommerce", emoji: "🛒", href: "/use-cases/for-dtc-brands" },
  { key: "photographers", emoji: "📷", href: "/use-cases/for-photographers" },
  { key: "marketing", emoji: "🌍", href: "/use-cases/for-programmatic-seo" },
  { key: "publishers", emoji: "📚", href: "/use-cases/for-publishers" },
  { key: "merch", emoji: "🎁", href: "/use-cases/for-merch-operators" },
  { key: "video", emoji: "🎬", href: "/tools" },
];

function SolutionCard({ s }: { s: Solution }) {
  const t = useTranslations("home.solutions");
  const trackClick = useClickTracking(`home-solution:${s.key}`, "topic_capsule", "cards");
  return (
    <Link
      href={s.href}
      onClick={trackClick}
      className="group flex h-full flex-col gap-2.5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg"
    >
      {/* The emoji sits in a fixed 44px tinted chip rather than loose in the
          text flow. Bare emoji render at wildly different optical sizes and
          weights across platforms — 🛒 came out pale and small next to 📷 — so
          the chip gives every card the same anchor whatever glyph is in it. */}
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl ring-1 ring-purple-100 transition group-hover:bg-purple-100"
      >
        {s.emoji}
      </span>
      <span className="text-base font-bold text-neutral-900">{t(`items.${s.key}.label`)}</span>
      <span className="text-sm leading-snug text-neutral-600">{t(`items.${s.key}.message`)}</span>
      {/* Was opacity-0 until hover, which meant the only call to action on the
          card was invisible at a glance and permanently invisible on touch.
          Now always shown; the hover flourish is the arrow sliding out. */}
      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-purple-600 transition-all group-hover:gap-2">
        {t("explore")}
      </span>
    </Link>
  );
}

export default function HomeSolutionsGrid() {
  const t = useTranslations("home.solutions");
  return (
    /* The section sits in its own tinted, bordered band. White cards on the
       page's near-white #FDFDFD background with a hairline border barely read
       as cards at all, and this block sits between a busy hero and a 30-tile
       grid — without a surface of its own it reads as a gap between them
       rather than as the audience router it is. */
    <section
      id="solutions"
      className="my-10 scroll-mt-24 rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-white to-blue-50/40 px-5 py-8 shadow-sm sm:px-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {t("heading")}
        </h2>
        <p className="mt-1.5 text-sm text-neutral-600 sm:text-base">{t("subheading")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <SolutionCard key={s.key} s={s} />
        ))}
      </div>
    </section>
  );
}
