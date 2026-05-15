import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { getActivePack } from "@/lib/etsy_packs";
import DownloadButton from "./DownloadButton";

// These are paid landing pages for Etsy buyers, not organic content —
// keep them out of Google's index entirely (see generateMetadata
// below). Dynamic routes with no generateStaticParams render on-
// demand; that is what we want here since the registry can rotate at
// any time and we need active=false to take effect immediately.

type Props = {
  params: Promise<{ locale: string; sku: string }>;
  searchParams: Promise<{ c?: string; t?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const pack = getActivePack(sku);
  if (!pack) return { title: "Pack Not Found", robots: { index: false, follow: false } };
  return {
    title: `${pack.title} — Curify`,
    description: pack.description,
    robots: { index: false, follow: false },
  };
}

export default async function PackPage({ params, searchParams }: Props) {
  const { sku } = await params;
  const { c: code, t: token } = await searchParams;
  const pack = getActivePack(sku);
  if (!pack) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100">
            <CdnImage
              src={pack.cover_image}
              alt={pack.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="px-8 py-10">
            <div className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Thanks for your purchase
            </div>

            <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              {pack.title}
            </h1>

            <p className="mb-6 text-base text-gray-600">{pack.description}</p>

            <div className="mb-8 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase text-gray-500">Cards</div>
                <div className="text-lg font-semibold text-gray-900">
                  {pack.card_count}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Size</div>
                <div className="text-lg font-semibold text-gray-900">
                  {pack.file_size_mb} MB
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Format</div>
                <div className="text-lg font-semibold text-gray-900">
                  ZIP / JPG
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-gray-200 pt-8">
              <DownloadButton
                sku={pack.sku}
                code={code ?? null}
                token={token ?? null}
              />
              <p className="text-center text-xs text-gray-500">
                Your download link is single-use and expires in 5 minutes. You
                can come back to this page anytime to re-download.
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-indigo-200 bg-indigo-50/50 p-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-indigo-900">
                Want to customize these?
              </h2>
              <p className="text-sm text-indigo-800">
                Every card in this pack was generated with Curify AI. Sign up
                free to remix any of them — change the topic, swap the language
                pair, or generate brand-new packs of your own.
              </p>
              <a
                href="/signup?ref=etsy"
                className="mt-3 inline-flex items-center text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Try Curify free →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
