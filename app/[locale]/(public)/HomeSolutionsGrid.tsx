"use client";

import { Link } from "@/i18n/navigation";
import { useClickTracking } from "@/services/useTracking";

/**
 * The 6 Solutions as audience entry points (per docs/positioning-solutions-and-site-ia.md).
 * Each links to its EXISTING surface — no new pages — so this is the
 * manifestation layer over use-cases / tools / search. Per-card click tracking
 * (home-solution:<key>) so we can see which solution entry converts.
 */
type Solution = {
  key: string;
  emoji: string;
  label: string;
  message: string;
  href: string;
};

const SOLUTIONS: Solution[] = [
  { key: "merch", emoji: "🎁", label: "Merch & POD", message: "Turn one character into 100 products.", href: "/use-cases/for-merch-operators" },
  { key: "design", emoji: "🎨", label: "Designers", message: "Find better design inspiration in seconds.", href: "/search" },
  { key: "education", emoji: "📚", label: "Education", message: "Create bilingual learning content at scale.", href: "/use-cases/for-parents" },
  { key: "video", emoji: "🎬", label: "Video Creators", message: "Translate and subtitle videos for global audiences.", href: "/tools" },
  { key: "marketing", emoji: "🌍", label: "Marketing & SEO", message: "Build multilingual visual content that ranks.", href: "/use-cases/for-programmatic-seo" },
  { key: "developers", emoji: "⚙️", label: "Developers", message: "Integrate visual AI into your own product.", href: "/contact" },
];

function SolutionCard({ s }: { s: Solution }) {
  const trackClick = useClickTracking(`home-solution:${s.key}`, "topic_capsule", "cards");
  return (
    <Link
      href={s.href}
      onClick={trackClick}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
    >
      <span className="text-2xl">{s.emoji}</span>
      <span className="text-base font-bold text-neutral-900">{s.label}</span>
      <span className="text-sm leading-snug text-neutral-600">{s.message}</span>
      <span className="mt-1 text-xs font-semibold text-purple-600 opacity-0 transition group-hover:opacity-100">
        Explore →
      </span>
    </Link>
  );
}

export default function HomeSolutionsGrid() {
  return (
    <section id="solutions" className="scroll-mt-24 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          One platform. Six ways to use it.
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Pick the job you&apos;re here to do.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <SolutionCard key={s.key} s={s} />
        ))}
      </div>
    </section>
  );
}
