import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeClient from "./HomeClient";
// 1. Import your service and mapper
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { SITE_URL } from "@/lib/constants";
import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
  type NanoInspirationCardType,
} from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";

// Nano cards on the home page are intentionally locale-agnostic for now —
// always built from the en content + en translations regardless of URL locale.
// Surrounding page chrome (hero copy, header) still respects URL locale via i18n.
async function buildHomeNanoCards(): Promise<NanoInspirationCardType[]> {
  try {
    const t = await getTranslations({ locale: "en", namespace: "nano" });
    const reg = buildNanoRegistry(
      nanoTemplates as unknown as RawTemplate[],
      nanoInspiration as unknown as RawNanoImageRecord[]
    );
    return buildNanoFeedCards(reg, "en", {
      perTemplateMaxImages: 2,
      strictLocale: true,
      translate: (key: string) => {
        try {
          return (t as any)(key) ?? "";
        } catch {
          return "";
        }
      },
    }) as NanoInspirationCardType[];
  } catch (err) {
    console.error("[nano] failed to build nano cards on server:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });

  const baseUrl = SITE_URL;

  const canonicalUrl = getCanonicalUrl(locale); // home = no path

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguagesMap(),
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonicalUrl,   // ← was using the wrong /en/ url here too
      siteName: "Curify",
      images: [
        {
          url: `${baseUrl}/og-cover.jpg`,
          width: 1200,
          height: 630,
          alt: "Curify – Turn Ideas Into Visual Thinking",
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [`${baseUrl}/og-cover.jpg`],
    },
  };
}

export default async function HomePage() {
  // 2. Fetch Data (Server-Side)
  // We reuse the same query as your Inspiration Hub to get the feed data
  let cards: ReturnType<typeof mapDTOToUICard>[] = [];
  try {
    const rawData = await inspirationService.getCards({
      review_status: "APPROVED",
      limit: 50,
    });
    cards = rawData.map(mapDTOToUICard);
  } catch (err) {
    console.error("[HomePage] inspiration API failed, falling back to nano cards only:", err);
  }

  // Build nano cards on the server so the client bundle stays slim.
  const nanoCards = await buildHomeNanoCards();

  // 4. Pass 'cards' prop to the Client Component
  return (
    <>
     <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Curify",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web",
      "description":
        "Curify is an AI-powered visual thinking platform that transforms trends, ideas, and knowledge into structured, shareable visual content including inspiration cards, infographics, and localized media.",
      "url": "https://www.curify-ai.com",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    })
  }}
/>
      <HomeClient cards={cards} nanoCards={nanoCards} />
    </>
  );
}
