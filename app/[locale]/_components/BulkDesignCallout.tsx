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
// anonymous "Trial Request". The backend stores `source` on the lead and puts
// it in the team notification.
//
// 2026-09-22: the CTA is no longer a link to /contact. It is the form. Sending
// someone to a second page and a four-field form to say "I want forty of
// these" lost most of them — /contact measures ~7 people a month in the
// refined cohort. InlineContactCapture posts to the same endpoint from here,
// and still offers /contact as the secondary route for people who want the
// Calendly rather than the form.

import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import InlineContactCapture from "./InlineContactCapture";

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

  const title = subject ? t("titleWithSubject", { subject }) : t("title");
  const leadSubject = subject
    ? t("contactSubjectWith", { subject })
    : t("contactSubject");

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

      {/* t("note") — "Tell us roughly how many designs and what they're for" —
          used to sit beside the button as helper text. It is the instruction
          this field wants, so it is the placeholder now rather than a second
          line of copy saying the same thing.
          ⚠️ content_id `bulk-callout:<source>` is unchanged but its meaning
          shifted on 2026-09-22: it was "clicked through to /contact", it is now
          "attempted to send". Same funnel position, so the series is
          comparable, but do not read pre-09-22 rows as form submissions. */}
      <InlineContactCapture
        className="mt-6 max-w-2xl"
        source={`bulk-cta:${source}`}
        subject={leadSubject}
        cta={t("cta")}
        note={t("note")}
        trackingId={`bulk-callout:${source}`}
      />
    </section>
  );
}
