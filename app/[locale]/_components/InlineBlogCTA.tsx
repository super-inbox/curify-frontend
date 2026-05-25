"use client";

// Inline blog CTA component - truncated version of BlogCTACard for mid-post insertion.
// Shows only the primary CTA in a compact format, designed to be inserted after
// the first h2 or major section in lengthy posts to capture readers before they scroll away.

import Link from "next/link";
import { ExternalLink, Wrench, GraduationCap, MessageCircle, Calendar } from "lucide-react";
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

// Category → CTAs. Returns only the primary CTA for inline display.
function ctasFor(category: string, locale: string, slug?: string): CTA | null {
  switch (category) {
    case "video-translation-dubbing":
    case "video-dubbing":
      return {
        id: "video-dubbing-tool",
        label: "Try Video Dubbing",
        description: "Dub any video into 30+ languages with native-sounding voices.",
        href: `/${locale}/tools/video-dubbing`,
        Icon: Wrench,
      };

    case "creator-tools": {
      const override = slug ? CREATOR_TOOL_OVERRIDES[slug] : undefined;
      return {
        id: override ? `creator-tool-${slug}` : "creator-tools-index",
        label: override?.label ?? "Browse Creator Tools",
        description: override
          ? "Open the exact tool this post walks through."
          : "Bilingual subtitles, video summaries, transcript extraction, and more.",
        href: `/${locale}${override?.href ?? "/tools"}`,
        Icon: Wrench,
      };
    }

    case "ds-ai-engineering":
      return {
        id: "mentorcruise-jaywang",
        label: "Book AI / DS Coaching",
        description: "1:1 sessions with Jay Wang on MentorCruise — AI strategy, data science, ML engineering.",
        href: MENTORCRUISE,
        external: true,
        Icon: GraduationCap,
      };

    case "content-automation":
      return {
        id: "contact-page",
        label: "Talk to us about a pilot",
        description: "Custom content-automation pipelines, scale-out, or partnership.",
        href: `/${locale}/contact`,
        Icon: MessageCircle,
      };

    case "nano-template":
      return {
        id: "contact-template-partner",
        label: "Partner on custom templates",
        description: "Brand-aligned template packs, edtech IP licensing, or a private template library.",
        href: `/${locale}/contact`,
        Icon: MessageCircle,
      };

    case "learning-education":
      return {
        id: "contact-edtech",
        label: "Partner on edtech",
        description: "K-5 vocabulary engines, bilingual content packs, or classroom-deploy pilots.",
        href: `/${locale}/contact`,
        Icon: MessageCircle,
      };

    default:
      return null;
  }
}

export default function InlineBlogCTA({ category, slug, locale }: Props) {
  const cta = ctasFor(category, locale, slug);
  if (!cta) return null;

  // content_id is greppable in admin: blog-cta-inline:<category>:<cta.id>
  const trackClick = useClickTracking(
    `blog-cta-inline:${category}:${cta.id}`,
    "menu_link",
    "cards"
  );

  const className =
    "my-8 flex items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md";

  const inner = (
    <>
      <cta.Icon className="h-5 w-5 flex-shrink-0 text-blue-700" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-blue-700">{cta.label}</span>
          {cta.external && (
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
          )}
        </div>
        <p className="text-xs leading-snug text-neutral-600 mt-0.5">{cta.description}</p>
      </div>
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
