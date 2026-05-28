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

// Per-post full-override table. When a high-traffic post deserves a
// fundamentally different CTA than its category default (not just a
// different tool URL), list the explicit CTA array here. ctasFor()
// picks this up before the category switch. Hrefs are path-only and
// get locale-prefixed at use site; external URLs pass through.
//
// Driven by the GSC top-traffic list in docs/interconnection.md (P1
// internal-link strength audit). Add an entry when a category default
// sends a top-clicked post somewhere noticeably off-intent — e.g. an
// MBTI generator post under nano-template currently defaults to
// /contact ("Partner on custom templates"), but the actual reader wants
// MBTI templates, not a partnership form.
type OverrideCTA = Omit<CTA, "href"> & { href: string };
const BLOG_POST_OVERRIDES: Record<string, OverrideCTA[]> = {
  // 25+ clicks across locales; readers came for character templates.
  // Default creator-tools CTA sends to /tools (video tools), wrong audience.
  "character-prompt-generator": [
    {
      id: "character-templates",
      label: "Browse Character Templates",
      description:
        "Custom + MBTI + universe-specific cards — every template referenced in this post is one click away.",
      href: "/topics/character",
      Icon: Wrench,
    },
    {
      id: "use-cases-for-creators",
      label: "Creators playbook",
      description: "Persona page with the tools and reads creators actually use.",
      href: "/use-cases/for-creators",
      Icon: MessageCircle,
    },
  ],
  // 22 clicks; reader intent is "show me MBTI templates," not "partner with us."
  "mbti-character-generator": [
    {
      id: "character-templates",
      label: "Browse MBTI Templates",
      description:
        "All 16 personality cards plus universe-specific MBTI sets — Marvel, Ghibli, NBA, Harry Potter, Friends, more.",
      href: "/topics/character",
      Icon: Wrench,
    },
    {
      id: "use-cases-for-creators",
      label: "Creators playbook",
      description: "Persona page with the tools and reads creators actually use.",
      href: "/use-cases/for-creators",
      Icon: MessageCircle,
    },
  ],
  // 11+ clicks (ko locale especially); readers want to try the prompt patterns,
  // not a partnership conversation.
  "10-prompting-tips-nano-banana": [
    {
      id: "character-templates",
      label: "Try the templates",
      description:
        "Browse the character + lifestyle + learning catalogs — every prompt pattern from the post is already wired up.",
      href: "/topics/character",
      Icon: Wrench,
    },
    {
      id: "nano-banana-prompts",
      label: "Browse Nano Banana Prompts",
      description:
        "Curated nano-banana prompt directory — every prompt family the post references, ready to copy.",
      href: "/nano-banana-pro-prompts",
      Icon: Wrench,
    },
  ],
  // Nano-banana directory + dedicated-explainer posts — readers come for prompts,
  // route them to the prompt directory and a partnership fork (not /tools).
  "ultimate-directory-of-nano-banana-prompts": [
    {
      id: "nano-banana-prompts",
      label: "Browse Nano Banana Prompts",
      description:
        "The curated directory itself — character, design, lifestyle, learning, and more.",
      href: "/nano-banana-pro-prompts",
      Icon: Wrench,
    },
    {
      id: "contact-partner",
      label: "Partner with us",
      description:
        "Custom Nano Banana template work, brand-locked visual contracts, or scale-out partnership.",
      href: "/contact",
      Icon: MessageCircle,
    },
  ],
  "nano-banana-dedicated": [
    {
      id: "nano-banana-prompts",
      label: "Browse Nano Banana Prompts",
      description:
        "Curated nano-banana prompt directory across character, design, lifestyle, and learning.",
      href: "/nano-banana-pro-prompts",
      Icon: Wrench,
    },
    {
      id: "contact-partner",
      label: "Partner with us",
      description:
        "Custom Nano Banana template work or scale-out partnership.",
      href: "/contact",
      Icon: MessageCircle,
    },
  ],
  // Soccer-poster post — route readers straight to the two templates the post
  // walks through, not the generic nano-banana directory.
  "brazil-argentina-soccer-poster-prompts": [
    {
      id: "sports-battle-template",
      label: "Try the Sports Battle template",
      description:
        "1v1 player VS poster — supply two names, get the comic-book rivalry poster.",
      href: "/nano-template/sports-battle",
      Icon: Wrench,
    },
    {
      id: "group-poster-template",
      label: "Try the Team Poster template",
      description:
        "Full national-team ensemble poster — supply the squad name, get the cinematic lineup.",
      href: "/nano-template/celebrity-movie-group-poster",
      Icon: Wrench,
    },
  ],
  // Top-of-page-3 traffic; this post drives interest in design / collage
  // templates, not a partnership form.
  "ai-collage-digital-wallpaper-guide": [
    {
      id: "design-templates",
      label: "Browse Design Templates",
      description:
        "3×3 grid collages, vintage scrapbooks, poster series — every template family the post references.",
      href: "/topics/design",
      Icon: Wrench,
    },
    {
      id: "use-cases-for-designers",
      label: "Designers playbook",
      description:
        "Persona page for freelance illustrators and printable-pack sellers.",
      href: "/use-cases/for-designers",
      Icon: MessageCircle,
    },
  ],
  // B2B sales-narrative posts shaped like engineering deep-dives — readers
  // come with buyer intent (EdTech / Publisher / Agency / DTC / ProgSEO).
  // Category defaults (content-automation → /contact + Calendly; or
  // ds-ai-engineering → MentorCruise + /contact) aren't the conversion
  // path we built. Override each to its matching /use-cases/for-* page +
  // Calendly direct so buyer-intent traffic gets the landing page that
  // sells the pitch.
  "multimodal-ai-educational-publishing": [
    {
      id: "use-cases-for-publishers",
      label: "EdTech + Publishers playbook",
      description:
        "Format extension, K-5 vocab engine, bilingual editions, white-label license vs done-for-you packs — the buyer-side breakdown.",
      href: "/use-cases/for-publishers",
      Icon: MessageCircle,
    },
    {
      id: "calendly-15min",
      label: "Book a 15-min audit",
      description:
        "Direct calendar — map your existing content stack to where Curify fits, no demo.",
      href: CALENDLY,
      external: true,
      Icon: Calendar,
    },
  ],
  "ai-content-factory-for-agencies": [
    {
      id: "use-cases-for-marketers",
      label: "Growth Agencies playbook",
      description:
        "White-label content engine — serve 50 clients with the headcount you have for 10. Per-seat or per-managed-account, no custom retainer.",
      href: "/use-cases/for-marketers",
      Icon: MessageCircle,
    },
    {
      id: "calendly-15min",
      label: "Book a 15-min audit",
      description:
        "Direct calendar — walk through your per-AM throughput ceiling and where the engine bundles in.",
      href: CALENDLY,
      external: true,
      Icon: Calendar,
    },
  ],
  "content-tagging-system": [
    {
      id: "use-cases-for-programmatic-seo",
      label: "Programmatic SEO playbook",
      description:
        "Hub-and-spoke generator with original hero imagery — the productionization of the tagging architecture this post walks through.",
      href: "/use-cases/for-programmatic-seo",
      Icon: MessageCircle,
    },
    {
      id: "calendly-15min",
      label: "Book a 15-min audit",
      description:
        "Direct calendar — pipeline review of your existing SEO content stack, no demo.",
      href: CALENDLY,
      external: true,
      Icon: Calendar,
    },
  ],
  "programmatic-seo-dtc-visual-first": [
    {
      id: "use-cases-for-dtc-brands",
      label: "DTC brands playbook",
      description:
        "1 product photo → 100 scene variants, SMM-scheduled. The buyer-side build of the programmatic-SEO engine this post walks through.",
      href: "/use-cases/for-dtc-brands",
      Icon: MessageCircle,
    },
    {
      id: "calendly-15min",
      label: "Book a 15-min audit",
      description:
        "Direct calendar — map your existing landing-page stack to where the visual-first engine bundles in.",
      href: CALENDLY,
      external: true,
      Icon: Calendar,
    },
  ],
};

// Category → CTAs. Each category gets a primary plus an optional secondary,
// so the reader has a strong fork without scrolling past a weak nano-template
// link. Categories not listed render nothing.
function ctasFor(category: string, locale: string, slug?: string): CTA[] {
  // Per-post complete override wins. Path-only hrefs get locale-prefixed
  // here; external URLs (http, mailto) pass through unchanged.
  if (slug && BLOG_POST_OVERRIDES[slug]) {
    return BLOG_POST_OVERRIDES[slug].map((c) => ({
      ...c,
      href:
        c.external || /^[a-z]+:/i.test(c.href)
          ? c.href
          : `/${locale}${c.href}`,
    }));
  }
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
        {
          id: "contact-partner",
          label: "Partner with us",
          description:
            "Custom creator pipeline, white-label tooling, or scale-out partnership.",
          href: `/${locale}/contact`,
          Icon: MessageCircle,
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

    case "ai-strategy":
      return [
        {
          id: "mentorcruise-ai-strategy",
          label: "Book AI Strategy Coaching",
          description:
            "1:1 sessions with Jay Wang on MentorCruise — org redesign, AI-leverage playbooks, transformation roadmap for SMB leaders.",
          href: MENTORCRUISE,
          external: true,
          Icon: GraduationCap,
        },
        {
          id: "calendly-pilot-scope",
          label: "Scope a 90-day pilot",
          description:
            "Direct 15-min calendar with Jay to map friction, identify redesign candidates, and outline the pilot shape.",
          href: CALENDLY,
          external: true,
          Icon: Calendar,
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
          id: "nano-banana-prompts",
          label: "Browse Nano Banana Prompts",
          description:
            "Curated nano-banana prompt directory — character, design, lifestyle, learning, and more.",
          href: `/${locale}/nano-banana-pro-prompts`,
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

// Two-tone CTA palette: first card leads with light-purple, second with
// light-blue. Both gradients run between the two hues so each card actually
// shows the "light purple + light blue" treatment rather than fading to
// white. Tailwind's JIT needs the class names to appear as literals, so we
// keep the variants in a static map instead of interpolating the color.
const ACCENT_STYLES = {
  purple: {
    card:
      "border-purple-200 bg-gradient-to-br from-purple-100 via-purple-50 to-blue-50 hover:border-purple-400 hover:from-purple-200 hover:via-purple-100 hover:to-blue-100",
    icon: "text-purple-700",
  },
  blue: {
    card:
      "border-blue-200 bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 hover:border-blue-400 hover:from-blue-200 hover:via-blue-100 hover:to-purple-100",
    icon: "text-blue-700",
  },
} as const;

type Accent = keyof typeof ACCENT_STYLES;

function CtaButton({
  cta,
  category,
  accent,
}: {
  cta: CTA;
  category: string;
  accent: Accent;
}) {
  // content_id is greppable in admin: blog-cta:<category>:<cta.id>
  const trackClick = useClickTracking(
    `blog-cta:${category}:${cta.id}`,
    "menu_link",
    "cards"
  );

  const styles = ACCENT_STYLES[accent];
  const className = `group flex flex-col gap-2 rounded-xl border ${styles.card} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`;

  const inner = (
    <>
      <div className={`flex items-center gap-2 ${styles.icon}`}>
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
        {ctas.map((cta, i) => (
          <CtaButton
            key={cta.id}
            cta={cta}
            category={category}
            accent={i === 0 ? "purple" : "blue"}
          />
        ))}
      </div>
    </section>
  );
}
