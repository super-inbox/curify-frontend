import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import InspirationHubClient from "./InspirationHubClient";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";
import { InspirationCardUI } from "@/types/inspiration";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { makeSafeTranslator } from "@/lib/locale_utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Daily Inspiration Hub | Curify",
    description:
      "Curated cards that translate real-world signals into creator-ready hooks and production beats.",
    alternates: {
      canonical: getCanonicalUrl(locale, "/inspiration-hub"),
      languages: getLanguagesMap("/inspiration-hub"),
    },
  };
}

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
        name: c.hook.text.replace(/"/g, ""),
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

export default async function InspirationHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const tTopicsRoot = await getTranslations({ locale });  

  const rawData = await inspirationService.getCards({
    review_status: "APPROVED",
    limit: 100,
  });

  const cards = rawData.map(mapDTOToUICard);
  const jsonLd = generateJsonLd(cards);

  const handleTopicClick = (topicId: string) => {
    console.log(`Topic clicked: ${topicId}`);
    // Add your custom logic here
  };

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

        <InspirationHubClient cards={cards} />
      </main>
    </>
  );
}