"use client";

// Inline lead capture — email (plus an optional note) posted straight to
// /user/contact-team from wherever it renders.
//
// WHY THIS EXISTS. Every commercial CTA on the site used to be a link to
// /contact. That is two page loads and a four-field form between "I want this"
// and a reachable address, and /contact measured ~7 people a month in the
// refined cohort. The ask is "leave your contact details", so ask for them
// where the person already is.
//
// The link-out is kept as the secondary action, because /contact is also where
// the Calendly embed lives and some buyers want the call, not the form.
//
// TRACKING. Two events, both content_type "menu_link" (the backend enum
// silently rejects unknown values — see feedback_tracking_enums):
//   <trackingId>            on submit ATTEMPT  — denominator
//   contact:submit:<source> on success        — numerator
// The success id is deliberately identical to the one ContactClient fires, so
// a lead counts the same whether it came from this form or from the full page.

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link as IntlLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useTracking } from "@/services/useTracking";
import { contactService } from "@/services/contact";

// Backend caps `source` at 200 chars and 422s the whole submission otherwise;
// content_id is a varchar(255).
const MAX_SOURCE = 200;

type Props = {
  /** Lead attribution, e.g. "bulk-cta:tool/ai-fashion-model-generator". */
  source: string;
  /** Prefilled subject on the lead — already localized by the caller. */
  subject: string;
  /** Submit button label — already localized by the caller. */
  cta: string;
  /**
   * Placeholder for the optional note field. Omit for the compact variant
   * (email + button on one row), which is what a hero block wants.
   */
  note?: string;
  /** Tracking id for the submit attempt, e.g. "bulk-callout:<source>". */
  trackingId: string;
  /** Show the "or book a call" link through to /contact. Default true. */
  showCallLink?: boolean;
  className?: string;
};

export default function InlineContactCapture({
  source,
  subject,
  cta,
  note,
  trackingId,
  showCallLink = true,
  className,
}: Props) {
  const tContact = useTranslations("contact");
  const { trackAction } = useTracking();

  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  // Honeypot. /contact was one public form on one page; this component puts the
  // same email-sending endpoint on several thousand template, topic and blog
  // pages, so the cheap naive-bot filter is worth the five lines. A real
  // browser never fills a field it cannot see or tab to.
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const clampedSource = source.slice(0, MAX_SOURCE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      // Report success rather than an error: telling a bot which check it
      // failed is how it learns to pass. No request, no event.
      setStatus("ok");
      return;
    }
    setLoading(true);
    setStatus("idle");
    trackAction({ contentId: trackingId.slice(0, 255), contentType: "menu_link" }, "click");

    try {
      await contactService.sendMail({
        email,
        subject,
        // The note is optional; the subject alone is still a usable lead, and
        // the backend appends "Submitted from: <source>" to whatever is here.
        content: body.trim() || subject,
        source: clampedSource,
      });
      trackAction(
        {
          contentId: `contact:submit:${clampedSource}`.slice(0, 255),
          contentType: "menu_link",
        },
        "click",
      );
      setStatus("ok");
      setEmail("");
      setBody("");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "ok") {
    return (
      <p
        role="status"
        className={`rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ${className ?? ""}`}
      >
        {tContact("form.success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="text"
        name="company_website"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {note && (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={note}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      )}

      <div className={`flex flex-col gap-2.5 sm:flex-row ${note ? "mt-2.5" : ""}`}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder={tContact("form.emailPlaceholder")}
          className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? tContact("form.sending") : cta}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      {status === "error" && (
        <p role="status" className="mt-2 text-xs leading-5 text-red-600">
          {tContact("form.error")}
        </p>
      )}

      {showCallLink && (
        <p className="mt-2.5 text-xs leading-5 text-neutral-500">
          <IntlLink
            href={{
              pathname: "/contact",
              query: { subject, source: `${clampedSource}:call` },
            }}
            onClick={() =>
              trackAction(
                { contentId: `${trackingId}:call`.slice(0, 255), contentType: "menu_link" },
                "click",
              )
            }
            className="font-semibold text-purple-700 underline-offset-2 hover:underline"
          >
            {tContact("call.title")}
          </IntlLink>
        </p>
      )}
    </form>
  );
}
