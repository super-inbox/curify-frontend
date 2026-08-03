/**
 * Visible rich content for visual-format topic pages (Infographic, Poster,
 * Sticker, Flashcard, …). Topic pages otherwise carry only image grids +
 * template links (their intro/description are sr-only), which reads as thin to
 * search engines. This renders an authored, per-locale body — lead paragraph,
 * "How to make …" steps, use cases, and an FAQ (with FAQPage JSON-LD for rich
 * results) — for topics that declare a `format` block in messages/<loc>/topics.json.
 *
 * Server component (no client JS). No-ops when the topic has no format block,
 * so non-format topics render unchanged.
 */

export type TopicFormatContent = {
  /** 1–2 sentence visible lead under the format heading. */
  lead?: string;
  howToTitle?: string;
  howTo?: string[];
  usesTitle?: string;
  uses?: string[];
  faqTitle?: string;
  faq?: { q: string; a: string }[];
};

export default function TopicFormatContent({
  content,
  displayName,
}: {
  content: TopicFormatContent | null | undefined;
  displayName: string;
}) {
  if (!content) return null;
  const { lead, howToTitle, howTo, usesTitle, uses, faqTitle, faq } = content;
  const hasHowTo = Array.isArray(howTo) && howTo.length > 0;
  const hasUses = Array.isArray(uses) && uses.length > 0;
  const hasFaq = Array.isArray(faq) && faq.length > 0;
  if (!lead && !hasHowTo && !hasUses && !hasFaq) return null;

  const faqJsonLd = hasFaq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq!.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
          About {displayName}
        </h2>
        {lead ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700 sm:text-base">
            {lead}
          </p>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {hasHowTo ? (
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {howToTitle || `How to make ${displayName.toLowerCase()}`}
              </h3>
              <ol className="mt-4 flex flex-col gap-4">
                {howTo!.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-6 text-neutral-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {hasUses ? (
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {usesTitle || "What you can make"}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {uses!.map((u, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-neutral-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {hasFaq ? (
          <div className="mt-10 border-t border-neutral-100 pt-6">
            <h3 className="text-base font-bold text-neutral-900">
              {faqTitle || "Frequently asked questions"}
            </h3>
            <dl className="mt-4 flex flex-col divide-y divide-neutral-100">
              {faq!.map((f, i) => (
                <div key={i} className="py-4">
                  <dt className="text-sm font-semibold text-neutral-900">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-6 text-neutral-700">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>

      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
    </section>
  );
}
