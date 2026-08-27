"use client";

// Bulk-production GTM callout — the "one image is a sample, a line needs the
// whole set" message, rendered on template detail, topic pages, and
// collection-style blog posts.
//
// Vocabulary note: this is deliberately "bulk", never "batch". `batch: true`
// on a template already means something else entirely (the pre-generated
// Download Packs ZIP, wired through ExampleImagesGrid / NanoInspirationCard /
// UnifiedActionBar). Reusing the word here would make the copy and the flag
// disagree on 43 templates.
//
// The CTA carries its context into /contact via query params, so an inbound
// lead arrives saying which template or topic produced it rather than as an
// anonymous "Trial Request". ContactClient reads them; the backend stores
// `source` on the lead and puts it in the team notification.

import { Layers, ArrowRight } from "lucide-react";
import { Link as IntlLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useClickTracking } from "@/services/useTracking";

type Props = {
  /**
   * Where this render lives, e.g. "nano-template/brand-ip-mascot-design-board"
   * or "topics/stickers". Becomes the tracking id and the contact-form
   * `source`, so it must be stable and greppable.
   */
  source: string;
  /**
   * Noun for the headline — the template or topic the reader is looking at
   * ("sticker", "packaging"). Omit for the generic headline; do not pass a
   * whole sentence, it is interpolated mid-title.
   */
  subject?: string;
  className?: string;
};

export default function BulkDesignCallout({ source, subject, className }: Props) {
  const t = useTranslations("bulkCallout");
  // content_id is greppable in admin: bulk-callout:<source>
  const trackClick = useClickTracking(`bulk-callout:${source}`, "menu_link", "cards");

  const title = subject ? t("titleWithSubject", { subject }) : t("title");

  const contactHref = {
    pathname: "/contact" as const,
    query: {
      subject: subject
        ? t("contactSubjectWith", { subject })
        : t("contactSubject"),
      source: `bulk-cta:${source}`,
    },
  };

  return (
    <section
      className={`rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 shadow-sm sm:p-8 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-purple-700">
        <Layers className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {t("eyebrow")}
        </span>
      </div>

      <h2 className="mt-3 max-w-3xl text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
        {title}
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">
        {t("body")}
      </p>

      <ul className="mt-5 grid max-w-4xl gap-2.5 sm:grid-cols-3">
        {(["point1", "point2", "point3"] as const).map((key) => (
          <li
            key={key}
            className="flex items-start gap-2 text-sm leading-6 text-neutral-700"
          >
            <span aria-hidden="true" className="mt-0.5 text-purple-500">
              ✓
            </span>
            {t(key)}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <IntlLink
          href={contactHref}
          onClick={trackClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
        >
          {t("cta")}
          <ArrowRight className="h-4 w-4" />
        </IntlLink>
        <p className="text-xs leading-5 text-neutral-500">{t("note")}</p>
      </div>
    </section>
  );
}
