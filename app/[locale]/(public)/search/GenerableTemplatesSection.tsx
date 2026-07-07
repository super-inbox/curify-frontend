"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toCdnUrl } from "@/app/[locale]/_components/CdnImage";
import { useClickTracking, useTracking } from "@/services/useTracking";
import { toSlug } from "@/lib/nano_pure";
import { intentCtaContentId } from "@/lib/output_intent";
import type { TemplateMatch } from "@/lib/searchTemplateMatch";

// Confidence threshold below which we hedge the label.
const HIGH_CONFIDENCE = 0.7;
// Confidence threshold below which we drop the match entirely.
const MIN_CONFIDENCE = 0.4;

function GenerableCard({
  match,
  locale,
  query,
}: {
  match: TemplateMatch;
  locale: string;
  query: string;
}) {
  const preview = match.og_image ?? "/images/default-prompt-image.jpg";
  const slug = toSlug(match.template_id);
  const qs = new URLSearchParams(match.params).toString();
  const href = `/${locale}/nano-template/${slug}${qs ? `?${qs}` : ""}#reproduce`;
  const handleClick = useClickTracking(
    `search_generable_template:${match.template_id}`,
    "nano_inspiration_template_card",
    "cards",
  );
  const { trackAction } = useTracking();
  const hedged = match.confidence < HIGH_CONFIDENCE;
  const ctaShown = Boolean(match.cta) && !hedged;
  return (
    <Link
      href={href}
      onClick={() => {
        handleClick();
        // Intent-CTA press instrumentation (2026-07-07). In search the whole
        // card is the click target and the differentiated CTA badge is
        // decorative, so attribute the click to the intent CTA only when that
        // badge was actually shown (same condition as the badge below).
        if (ctaShown) {
          trackAction(
            {
              contentId: intentCtaContentId(match.template_id),
              contentType: "nano_inspiration_template_card",
              viewMode: "cards",
            },
            "click",
          );
        }
      }}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toCdnUrl(preview)}
          alt={match.template_id}
          className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {/* P0-2: differentiated Key Action verb from the template's output intent */}
        {match.cta && !hedged && (
          <span className="absolute left-2 top-2 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {match.cta}
          </span>
        )}
        <span
          className={`absolute bottom-2 left-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${
            hedged ? "bg-amber-600" : "bg-indigo-600"
          }`}
          title={match.reason || undefined}
        >
          {hedged ? `might fit "${query}"` : `generate "${query}"`}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <div className="truncate font-mono text-[10px] text-gray-500">
          {match.template_id.replace(/^template-/, "")}
        </div>
        <div className="mt-1 space-y-0.5 font-mono text-[10px] leading-tight text-gray-600">
          {Object.entries(match.params).slice(0, 3).map(([k, v]) => (
            <div key={k} className="truncate" title={`${k}: ${v}`}>
              <span className="text-gray-400">{k}:</span> {String(v)}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function GenerableTemplatesSection({
  query,
  locale,
}: {
  query: string;
  locale: string;
}) {
  const [matches, setMatches] = useState<TemplateMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    setMatches(null);
    setError(null);
    fetch("/api/search-template-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((data: { matches?: TemplateMatch[] }) => {
        if (cancelled) return;
        const filtered = (data.matches ?? []).filter(
          (m) => m.confidence >= MIN_CONFIDENCE,
        );
        setMatches(filtered);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "fetch failed");
        setMatches([]);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Loading skeleton — surface a clear "we are looking" message so the
  // empty Section B doesn't read as a render bug while the LLM works.
  if (matches === null) {
    return (
      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">
          Generate &ldquo;{query}&rdquo; yourself
        </h2>
        <p className="text-sm text-neutral-500">
          Looking for templates that can generate this…
        </p>
      </section>
    );
  }

  // No matches found — quietly skip rather than show an empty state.
  if (matches.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-neutral-900">
          Generate &ldquo;{query}&rdquo; yourself
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          These templates can create new images for your query. Click any card
          to customize the parameters and generate.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {matches.map((m) => (
          <GenerableCard
            key={m.template_id}
            match={m}
            locale={locale}
            query={query}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500" role="status">
          {error}
        </p>
      )}
    </section>
  );
}
