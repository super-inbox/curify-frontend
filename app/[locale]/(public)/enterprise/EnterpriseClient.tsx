"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link as IntlLink } from "@/i18n/navigation";
import { useTracking, useViewTracking } from "@/services/useTracking";
import { ENTERPRISE_COPY, enterpriseLang } from "./copy";

// Bilingual (en / zh) — all copy lives in ./copy.ts, including the two
// integrity constraints documented there (anchor engagement is a proposal,
// not a delivered reference; KPIs are contracted targets, not measured
// production averages). Layout is language-agnostic.

export default function EnterpriseClient() {
  const locale = useLocale();
  const lang = enterpriseLang(locale);
  const c = ENTERPRISE_COPY[lang];

  const { trackAction } = useTracking();

  // Per-visit view signal. The session-start tracker in (public)/layout.tsx
  // only fires on a session's ENTRY page, which undercounts internal
  // navigation here; this fires on any visit. Language is in the id so the
  // CN and EN audiences are separable in the rollup — the CN pipeline is
  // relationship-sourced (WeChat) and the EN one is LinkedIn/SI-sourced,
  // and we want to know which channel is actually landing people.
  const heroRef = useViewTracking(`enterprise:${lang}`, "page");

  // The conversion event that matters for this line. Distinct ids per CTA so
  // "read the page" and "asked for a call" are separable.
  const trackCta = useCallback(
    (id: string) =>
      trackAction({ contentId: `enterprise::${id}`, contentType: "page" }, "click"),
    [trackAction]
  );

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 sm:px-10">
      {/* Hero */}
      <section ref={heroRef as React.RefObject<HTMLElement>} className="mb-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-purple-600">
          {c.eyebrow}
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          {c.h1}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-neutral-700">{c.problem}</p>
        <p className="mt-4 max-w-2xl text-lg font-semibold text-purple-700">
          {c.positioning}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <IntlLink
            href="/contact"
            onClick={() => trackCta("cta-hero-poc")}
            className="inline-flex items-center gap-2 rounded-full bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-800"
          >
            {c.ctaPrimary}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </IntlLink>
          <a
            href={`#${c.siAnchor}`}
            onClick={() => trackCta("cta-hero-si")}
            className="text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
          >
            {c.ctaSecondary}
          </a>
        </div>
      </section>

      {/* Pillars */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900">{c.pillarsTitle}</h2>
        <p className="mt-2 max-w-2xl text-base text-neutral-600">{c.pillarsIntro}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {c.pillars.map((p) => (
            <div
              key={p.n}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="text-[11px] font-bold tracking-widest text-purple-500">
                {p.n}
              </div>
              <h3 className="mt-2 text-lg font-bold text-neutral-900">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-700">{p.body}</p>
              <ul className="mt-4 space-y-2">
                {p.detail.map((d) => (
                  <li key={d} className="flex gap-2 text-sm text-neutral-600">
                    <span aria-hidden="true" className="mt-0.5 text-purple-500">
                      ✓
                    </span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Commitments — contracted targets, not claimed production averages. */}
      <section className="mb-16 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-neutral-900">{c.commitTitle}</h2>
        <p className="mt-2 max-w-2xl text-base text-neutral-600">{c.commitIntro}</p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.commitments.map((x) => (
            <div key={x.label}>
              <dt className="text-3xl font-extrabold tracking-tight text-purple-700">
                {x.metric}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-neutral-900">{x.label}</dd>
              <dd className="mt-0.5 text-sm text-neutral-600">{x.note}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 border-t border-neutral-200 pt-6 text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">{c.onPrem.lead} </span>
          {c.onPrem.body}
        </p>
      </section>

      {/* Credibility — deliberately no delivered-reference claim. */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900">{c.whoTitle}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h3 className="text-lg font-bold text-neutral-900">{c.founderTitle}</h3>
            <p className="mt-3 text-sm text-neutral-700">{c.founderBody}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h3 className="text-lg font-bold text-neutral-900">{c.teamTitle}</h3>
            <p className="mt-3 text-sm text-neutral-700">
              {c.teamBody}{" "}
              <span className="text-neutral-500">{c.teamCaveat}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Engagement models */}
      <section id={c.siAnchor} className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-neutral-900">{c.engageTitle}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/40 p-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              {c.forEnterprises}
            </div>
            <h3 className="mt-2 text-lg font-bold text-neutral-900">{c.pocTitle}</h3>
            <p className="mt-3 text-sm text-neutral-700">{c.pocBody}</p>
            <IntlLink
              href="/contact"
              onClick={() => trackCta("cta-enterprise-poc")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
            >
              {c.pocCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </IntlLink>
          </div>

          <div className="rounded-2xl border-2 border-neutral-200 bg-white p-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {c.forSi}
            </div>
            <h3 className="mt-2 text-lg font-bold text-neutral-900">{c.siTitle}</h3>
            <p className="mt-3 text-sm text-neutral-700">{c.siBody}</p>
            <IntlLink
              href="/contact"
              onClick={() => trackCta("cta-si-partner")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
            >
              {c.siCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </IntlLink>
          </div>
        </div>
      </section>

      {/* Fit */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900">{c.fitTitle}</h2>
        <ul className="mt-6 space-y-3">
          {c.fits.map(([what, which]) => (
            <li
              key={what}
              className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-semibold text-neutral-900">{what}</span>
              <span className="text-sm text-neutral-600">{which}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Close */}
      <section className="rounded-2xl bg-neutral-900 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{c.closeTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-neutral-300">{c.closeBody}</p>
        <IntlLink
          href="/contact"
          onClick={() => trackCta("cta-footer")}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
        >
          {c.closeCta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </IntlLink>
      </section>
    </main>
  );
}
