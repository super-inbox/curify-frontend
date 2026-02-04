import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";

type PageParams = { locale: string; id: string };

// --- Metadata Logic ---
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id, locale } = await params;

  const dto = await inspirationService.getCardById(id);
  if (!dto) return { title: "Inspiration Not Found" };

  const card = mapDTOToUICard(dto);

  const title = card.hook?.text || card.signal?.summary || "Curify Inspiration";
  const description =
    card.signal?.summary ||
    card.translation?.tag ||
    "Discover creative inspiration";

  const imageUrl =
    card.visual?.images?.[0]?.preview_image_url || "/og-default.png";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.curify-ai.com";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      url: `${baseUrl}/${locale}/i/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// --- Page Component ---
export default async function InspirationPermalinkPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id, locale } = await params;

  const dto = await inspirationService.getCardById(id);
  if (!dto) notFound();

  const card = mapDTOToUICard(dto);
  const images = card.visual?.images || [];

  return (
    <main className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          {/* Header */}
          <header className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400">
                {(card.lang || locale).toUpperCase()}
              </span>
              {card.rating && (
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <span>⭐</span>
                  <span>{card.rating.score.toFixed(1)}</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-tight text-neutral-900">
              {card.hook?.text || "Inspiration"}
            </h1>

            {card.translation?.tag && (
              <div className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">
                {card.translation.tag}
              </div>
            )}
          </header>

          {/* Images */}
          {images.length > 0 && (
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              {images.slice(0, 2).map((img: any, idx: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={img.url}
                  alt={img.alt || `Visual ${idx + 1}`}
                  className="w-full h-auto rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {/* Signal */}
          {card.signal?.summary && (
            <section className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Signal Source
              </h2>
              <p className="text-lg leading-relaxed text-neutral-800">
                {card.signal.summary}
              </p>
            </section>
          )}

          {/* Angles */}
          {card.translation?.angles && card.translation.angles.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Creative Angles
              </h2>
              <div className="flex flex-wrap gap-2">
                {card.translation.angles.map((angle: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                  >
                    {angle}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Production */}
          {card.production && (
            <section className="rounded-xl bg-neutral-50 p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-800">
                {card.production.title || "Production Guide"}
              </h2>

              <div className="mb-4 text-sm text-neutral-600">
                <span className="font-medium text-neutral-900">Format:</span>{" "}
                {card.production.format || "N/A"}
                {card.production.durationSec && (
                  <span className="ml-3 border-l border-neutral-300 pl-3">
                    {card.production.durationSec}s
                  </span>
                )}
              </div>

              {card.production.beats && card.production.beats.length > 0 && (
                <ul className="space-y-2 text-neutral-700">
                  {card.production.beats.map((beat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                      <span>{beat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* CTA */}
          <footer className="mt-10 border-t border-neutral-100 pt-8">
            <a
              href={`/${locale}/inspiration-hub`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-4 text-base font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-lg sm:w-auto"
            >
              <span>Explore More Inspirations</span>
              <span>→</span>
            </a>
          </footer>
        </article>
      </div>
    </main>
  );
}
