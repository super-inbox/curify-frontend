import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeClient from "./HomeClient";
// 1. Import your service and mapper
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });

  return {
    title: t("title"),
    description: t("description"),
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
            "@type": "WebSite",
            "name": "Curify Studio",
            "url": "https://www.curify-ai.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.curify-ai.com/inspiration-hub?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <HomeClient cards={cards} />
    </>
  );
}