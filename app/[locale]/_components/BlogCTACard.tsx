"use client";

// Unified blog CTA card, rendered just above Related Articles. Picks the
// right call-to-action based on the post's category. Click logging fires
// via useClickTracking so the admin funnel can answer "which blog
// categories actually drive tool / coaching / contact engagement."

import Link from "next/link";
import { Mail, ExternalLink, Wrench, GraduationCap, MessageCircle } from "lucide-react";
import { useClickTracking } from "@/services/useTracking";

type Props = {
  category: string;
  locale: string;
};

type CTA = {
  id: string;
  label: string;
  description: string;
  href: string;
  external?: boolean;
  Icon: React.ComponentType<{ className?: string }>;
};

// Category → CTAs. A category can produce multiple CTAs (content-automation
// renders both an email link and a contact-page link). Categories not listed
// here render nothing — keeps the section out of the way on nano-template /
// learning-education posts that already have their own template embeds.
function ctasFor(category: string, locale: string): CTA[] {
  switch (category) {
    case "video-translation-dubbing":
    case "video-dubbing":
      return [
        {
          id: "video-dubbing-tool",
          label: "Try Video Dubbing",
          description:
            "Dub any video into 30+ languages with native-sounding voices.",
          href: `/${locale}/tools/video-dubbing`,
          Icon: Wrench,
        },
      ];
    case "creator-tools":
      return [
        {
          id: "creator-tools-index",
          label: "Browse Creator Tools",
          description:
            "Bilingual subtitles, video summaries, transcript extraction, and more.",
          href: `/${locale}/tools`,
          Icon: Wrench,
        },
      ];
    case "ds-ai-engineering":
      return [
        {
          id: "mentorcruise-jaywang",
          label: "Book AI / DS Coaching",
          description:
            "1:1 sessions with Jay Wang on MentorCruise — AI strategy, data science, ML engineering.",
          href: "https://mentorcruise.com/mentor/jaywang/",
          external: true,
          Icon: GraduationCap,
        },
      ];
    case "content-automation":
      return [
        {
          id: "contact-email",
          label: "Email team@curify-ai.com",
          description:
            "Ask about a content-automation pilot, custom pipeline, or partnership.",
          href: "mailto:team@curify-ai.com",
          external: true,
          Icon: Mail,
        },
        {
          id: "contact-page",
          label: "Visit Contact Page",
          description: "Other ways to reach us.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
        },
      ];
    default:
      return [];
  }
}

function CtaButton({ cta, category }: { cta: CTA; category: string }) {
  // content_id is greppable in admin: blog-cta:<category>:<cta.id>
  const trackClick = useClickTracking(
    `blog-cta:${category}:${cta.id}`,
    "menu_link",
    "cards"
  );

  const className =
    "group flex flex-col gap-2 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md";

  const inner = (
    <>
      <div className="flex items-center gap-2 text-blue-700">
        <cta.Icon className="h-5 w-5" />
        <span className="text-base font-semibold">{cta.label}</span>
        {cta.external && (
          <ExternalLink className="h-3.5 w-3.5 opacity-60" />
        )}
      </div>
      <p className="text-sm leading-snug text-neutral-600">{cta.description}</p>
    </>
  );

  if (cta.external) {
    return (
      <a
        href={cta.href}
        target={cta.href.startsWith("mailto:") ? undefined : "_blank"}
        rel={cta.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
        onClick={trackClick}
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={cta.href} onClick={trackClick} className={className}>
      {inner}
    </Link>
  );
}

export default function BlogCTACard({ category, locale }: Props) {
  const ctas = ctasFor(category, locale);
  if (ctas.length === 0) return null;
  return (
    <section className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-neutral-900">
        Take the next step
      </h2>
      <p className="mb-5 text-sm text-neutral-600">
        Putting what you read into practice.
      </p>
      <div
        className={
          ctas.length > 1
            ? "grid grid-cols-1 gap-4 md:grid-cols-2"
            : "grid grid-cols-1 gap-4"
        }
      >
        {ctas.map((cta) => (
          <CtaButton key={cta.id} cta={cta} category={category} />
        ))}
      </div>
    </section>
  );
}
