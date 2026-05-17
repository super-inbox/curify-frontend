"use client";

// Unified blog CTA card, rendered just above Related Articles. Picks the
// right call-to-action(s) based on the post's category — primary + optional
// secondary, never linking to a nano-template grid (those drive remix, not
// signup / coaching / contact). Click logging fires via useClickTracking
// so the admin funnel can answer "which blog categories actually drive
// tool / coaching / contact engagement."
//
// Per-post `creator-tools` overrides let posts about a specific tool route
// to that tool's page instead of the generic /tools index. Add an entry to
// CREATOR_TOOL_OVERRIDES below when a post has a clear tool match.

import Link from "next/link";
import { Mail, ExternalLink, Wrench, GraduationCap, MessageCircle, Calendar } from "lucide-react";
import { useClickTracking } from "@/services/useTracking";

type Props = {
  category: string;
  /** Slug enables per-post creator-tools target overrides. */
  slug?: string;
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

// Slugs in `creator-tools` that have a more specific tool target than
// the generic /tools index. Anything not listed falls through to /tools.
const CREATOR_TOOL_OVERRIDES: Record<string, { href: string; label: string }> = {
  "video-transcription-business-guide": {
    href: "/tools/video-transcription",
    label: "Try Video Transcription",
  },
  "10-prompting-tips-video-generation": {
    href: "/tools/video-dubbing",
    label: "Try Video Dubbing",
  },
  "image-to-narrative-video": {
    href: "/tools",
    label: "Browse Creator Tools",
  },
  "image-generation-model-comparison": {
    href: "/tools",
    label: "Browse Creator Tools",
  },
};

const MENTORCRUISE = "https://mentorcruise.com/mentor/jaywang/";
const CALENDLY = "https://calendly.com/qqwjq9916/15-minute-meeting";

// Category → CTAs. Each category gets a primary plus an optional secondary,
// so the reader has a strong fork without scrolling past a weak nano-template
// link. Categories not listed render nothing.
function ctasFor(category: string, locale: string, slug?: string): CTA[] {
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
        {
          id: "contact-partner",
          label: "Partner with us",
          description:
            "Custom dubbing pipeline, voice cloning at scale, or enterprise use case.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
        },
      ];

    case "creator-tools": {
      const override = slug ? CREATOR_TOOL_OVERRIDES[slug] : undefined;
      return [
        {
          id: override ? `creator-tool-${slug}` : "creator-tools-index",
          label: override?.label ?? "Browse Creator Tools",
          description: override
            ? "Open the exact tool this post walks through."
            : "Bilingual subtitles, video summaries, transcript extraction, and more.",
          href: `/${locale}${override?.href ?? "/tools"}`,
          Icon: Wrench,
        },
      ];
    }

    case "ds-ai-engineering":
      return [
        {
          id: "mentorcruise-jaywang",
          label: "Book AI / DS Coaching",
          description:
            "1:1 sessions with Jay Wang on MentorCruise — AI strategy, data science, ML engineering.",
          href: MENTORCRUISE,
          external: true,
          Icon: GraduationCap,
        },
        {
          id: "contact-partner",
          label: "Partner with us",
          description: "Engineering partnership, pipeline review, or paid pilot.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
        },
      ];

    case "content-automation":
      return [
        {
          id: "contact-page",
          label: "Talk to us about a pilot",
          description:
            "Custom content-automation pipelines, scale-out, or partnership.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
        },
        {
          id: "calendly-15min",
          label: "Book 15 min",
          description: "Direct calendar link with Jay.",
          href: CALENDLY,
          external: true,
          Icon: Calendar,
        },
      ];

    case "nano-template":
      return [
        {
          id: "contact-template-partner",
          label: "Partner on custom templates",
          description:
            "Brand-aligned template packs, edtech IP licensing, or a private template library.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
        },
        {
          id: "tools-index",
          label: "Browse Creator Tools",
          description:
            "Video dubbing, subtitles, and the other tools that pair with the template gallery.",
          href: `/${locale}/tools`,
          Icon: Wrench,
        },
      ];

    case "learning-education":
      return [
        {
          id: "contact-edtech",
          label: "Partner on edtech",
          description:
            "K-5 vocabulary engines, bilingual content packs, or classroom-deploy pilots.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
        },
        {
          id: "tools-index",
          label: "Browse Creator Tools",
          description:
            "Subtitling, dubbing, transcription — the tools educators use day to day.",
          href: `/${locale}/tools`,
          Icon: Wrench,
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

export default function BlogCTACard({ category, slug, locale }: Props) {
  const ctas = ctasFor(category, locale, slug);
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
