import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeClient from "./HomeClient";
// 1. Import your service and mapper
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.curify-ai.com";

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
  const rawData = await inspirationService.getCards({ 
    review_status: "APPROVED", 
    limit: 50 // You might want a smaller limit for Home vs the full Hub
  });

  // 3. Transform Data
  const cards = rawData.map(mapDTOToUICard);

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
      <HomeClient cards={cards} />
    </>
  );
}
