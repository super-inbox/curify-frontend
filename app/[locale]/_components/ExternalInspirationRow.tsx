import { getTranslations } from "next-intl/server";
import { makeSafeTranslator } from "@/lib/locale_utils";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import type { ExternalInspiration } from "@/lib/externalInspiration";

/**
 * "Inspiration from around the web" — the third content source
 * (external_inspiration): prompt-less reference images that ENRICH a topic with
 * a real outbound source link (attribution). Rendered on topic / niche pages.
 * Each card links out to its source (rel="nofollow noopener external"), with the
 * creator credited — we surface the reference, we don't claim it as ours.
 */
export default async function ExternalInspirationRow({
  locale,
  items,
}: {
  locale: string;
  items: ExternalInspiration[];
}) {
  if (!items.length) return null;
  const tRoot = await getTranslations({ locale });
  const t = makeSafeTranslator(tRoot);
  const heading = t("topics.externalInspiration.heading") || "Inspiration from around the web";
  const subtitle =
    t("topics.externalInspiration.subtitle") ||
    "Curated real-world design references — each links out to its original source.";
  const viewSource = t("topics.externalInspiration.viewSource") || "View source";

  return (
    <section className="mt-10">
      <div className="mb-3">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">{heading}</h2>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <a
            key={it.id}
            href={it.source_url}
            target="_blank"
            rel="nofollow noopener external"
            data-external-inspiration={it.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-purple-300 hover:shadow-sm hover:no-underline"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
              <CdnImage
                src={it.image_url}
                alt={it.title || "Design inspiration"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col p-3">
              {it.title ? (
                <p className="line-clamp-2 text-sm font-semibold text-neutral-900" title={it.title}>
                  {it.title}
                </p>
              ) : null}
              {it.creator ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500" title={it.creator}>
                  {it.creator}
                </p>
              ) : null}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 group-hover:text-purple-900">
                {viewSource}
                <span aria-hidden>↗</span>
                <span className="ml-1 font-normal text-neutral-400">· {it.source_site}</span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
