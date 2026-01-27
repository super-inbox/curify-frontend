// app/[locale]/inspiration-hub/page.tsx
import type { Metadata } from "next";
import InspirationHubClient from "./InspirationHubClient";
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";

export const metadata: Metadata = {
  title: "Daily Inspiration Hub | Curify",
  description:
    "A curated feed of signals → creator angles → hooks → production notes. Discover ready-to-use inspiration cards for short-form content.",
  alternates: { canonical: "/inspiration-hub" },
  openGraph: {
    title: "Daily Inspiration Hub | Curify",
    description:
      "Curated inspiration cards: signal, creator lens, hook, and production notes.",
    url: "/inspiration-hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Inspiration Hub | Curify",
    description:
      "Curated inspiration cards for creators: signal → angle → hook → production.",
  },
};

export default async function Page() {
  // 1) Fetch DTOs from backend
  const rows = await inspirationService.getCards();

  // 2) Filter for public display (MVP: only PUBLISHED)
  const cards = rows
    .filter((r) => r.status === "PUBLISHED")
    .map(mapDTOToUICard);

  // JSON-LD: ItemList of CreativeWork
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Daily Inspiration Hub",
    itemListElement: cards.slice(0, 50).map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: (c?.hook?.text || c.id).replaceAll("“", "").replaceAll("”", ""),
        inLanguage: c.lang || "zh",
        description: c?.signal?.summary || c?.translation?.tag || "",
        url: `/inspiration-hub#${c.id}`,
        // Images intentionally omitted for now (per your request)
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"        
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Daily Inspiration Hub
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            Curated cards that translate real-world signals into creator-ready
            hooks and production beats.
          </p>
        </header>

        <InspirationHubClient cards={cards} />
      </main>
    </>
  );
}
