import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, CDN_BASE } from "@/lib/constants";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { MBTI_TYPES, MBTI_META, IP_COLORS } from "@/lib/mbti-meta";
import mbtiCharacters from "@/public/data/mbti_characters.json";
import PersonalityResultClient from "./PersonalityResultClient";

type Props = { params: Promise<{ locale: string; type: string }> };

export function generateStaticParams() {
  return MBTI_TYPES.flatMap((type) => [
    { type: type.toUpperCase() },
    { type: type.toLowerCase() },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const mbti = type.toUpperCase();
  const meta = MBTI_META[mbti as keyof typeof MBTI_META];
  if (!meta) return {};

  const title = `${mbti} — ${meta.tagline}`;
  const description = meta.description;
  const canonicalUrl = getCanonicalUrl(locale, `/personality/${mbti}`);

  // Use the first character's image as OG image
  const firstChar = (mbtiCharacters as Record<string, Array<{name:string;img:string;ip:string;templateSlug:string}>>) [mbti]?.[0];
  const ogImage = firstChar
    ? `${CDN_BASE}${firstChar.img}`
    : `${SITE_URL}/images/og-prompts.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguagesMap(`/personality/${mbti}`),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "Curify Studio",
      images: [{ url: ogImage, width: 600, height: 800, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PersonalityTypePage({ params }: Props) {
  const { locale, type } = await params;
  const mbti = type.toUpperCase();
  const meta = MBTI_META[mbti as keyof typeof MBTI_META];
  if (!meta) notFound();

  const chars = (mbtiCharacters as Record<string, Array<{name:string;img:string;ip:string;templateSlug:string}>>) [mbti] ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero */}
      <div className="mx-auto max-w-2xl px-6 pt-16 pb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-500">
          Visual Personality Test · Curify
        </p>
        <h1 className="text-7xl font-black tracking-tight text-neutral-900">{mbti}</h1>
        <p className="mt-3 text-2xl font-semibold text-neutral-700">{meta.tagline}</p>
        <p className="mt-4 mx-auto max-w-lg text-base text-neutral-500 leading-relaxed">
          {meta.description}
        </p>
      </div>

      {/* Character gallery */}
      <div className="mx-auto max-w-2xl px-6 pb-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Your type across universes
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {chars.slice(0, 4).map((char) => (
            <div key={char.name} className="relative overflow-hidden rounded-2xl shadow-sm">
              <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN_BASE}${char.img}`}
                  alt={`${char.name} — ${mbti}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2.5">
                <p className="text-sm font-bold text-white leading-tight">{char.name}</p>
                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${IP_COLORS[char.ip] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {char.ip}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client: share + quiz CTA + generate buttons */}
      <PersonalityResultClient mbti={mbti} locale={locale} chars={chars} />
    </div>
  );
}
