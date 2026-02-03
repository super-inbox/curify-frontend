import type { Metadata } from "next";
import InspirationHubClient from "./InspirationHubClient";
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";
import { InspirationCardUI } from "@/types/inspiration";

export const metadata: Metadata = {
  title: "Daily Inspiration Hub | Curify",
  description: "Curated cards that translate real-world signals into creator-ready hooks and production beats.",
  alternates: { canonical: "/inspiration-hub" },
};

// Helper for SEO Schema
function generateJsonLd(cards: InspirationCardUI[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Daily Inspiration Hub",
    itemListElement: cards.slice(0, 50).map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: c.hook.text.replace(/"/g, ""), // Clean quotes
        inLanguage: c.lang,
        description: c.signal.summary || c.translation.tag,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/inspiration-hub#${c.id}`,
        ...(c.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: c.rating.score,
            bestRating: 5,
            worstRating: 0,
            ratingCount: 1,
          },
        }),
      },
    })),
  };
}

export default async function InspirationHubPage() {
  // 1. Fetch
  const rawData = await inspirationService.getCards({ 
    review_status: "APPROVED", 
    limit: 100 
  });

  // 2. Transform
  const cards = rawData.map(mapDTOToUICard);

  // 3. SEO
  const jsonLd = generateJsonLd(cards);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Daily Inspiration Hub
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            Curated cards that translate real-world signals into creator-ready
            hooks and production beats. AI-rated for quality.
          </p>
        </header>

        {/* Pass mapped UI cards to Client */}
        <InspirationHubClient cards={cards} />
      </main>
    </>
  );
}