import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { inspirationService } from "@/services/inspiration";
import { normalizeNanoImageUrl } from "../../../_components/NanoInspirationCard";

type PageParams = { locale: string; id: string };

// --- Metadata Logic ---
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id, locale } = await params;

  const card = await inspirationService.getNanoCardById(id);

  if (!card) {
    return { title: "Nano Inspiration Not Found" };
  }

  const title = `${card.category} - Curify Nano Inspiration`;
  const description = (card.prompt || "").slice(0, 160);
  const imageUrl = normalizeNanoImageUrl(card.image_urls?.[0] || "");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.curify-ai.com";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      url: `${baseUrl}/${locale}/n/${id}`,
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
export default async function NanoPermalinkPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id, locale } = await params;

  const card = await inspirationService.getNanoCardById(id);

  if (!card) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <article className="rounded-2xl border border-purple-100 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
              <span>💡</span>
              <span>{card.category}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
              Nano Inspiration
            </h1>
          </header>

          {/* Prompt Section */}
          <section className="mb-8 overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-purple-900/60">
              Image Generation Prompt
            </h2>
            <p className="font-mono text-lg leading-relaxed text-neutral-800">
              {card.prompt}
            </p>
          </section>

          {/* Images Grid */}
          {card.image_urls && card.image_urls.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Generated Examples ({card.image_urls.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {card.image_urls.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-xl bg-neutral-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeNanoImageUrl(imgUrl)}
                      alt={`${card.category} example ${idx + 1}`}
                      className="h-auto w-full transform transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <footer className="mt-10 border-t border-purple-100 pt-8">
            <a
              href={`/${locale}/inspiration-hub`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-4 text-base font-medium text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 hover:shadow-purple-300 sm:w-auto"
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
