import type { Metadata } from "next";
import InspirationHubClient from "./InspirationHubClient";
import fs from "node:fs/promises";
import path from "node:path";

type Feed = { items: any[] };

export const metadata: Metadata = {
  title: "Daily Inspiration Hub | Curify",
  description:
    "A curated feed of signals → creator angles → hooks → production notes. Discover ready-to-use inspiration cards for short-form content.",
  alternates: {
    canonical: "/inspiration-hub"
  },
  openGraph: {
    title: "Daily Inspiration Hub | Curify",
    description:
      "Curated inspiration cards: signal, creator lens, hook, and production notes.",
    url: "/inspiration-hub",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Inspiration Hub | Curify",
    description:
      "Curated inspiration cards for creators: signal → angle → hook → production."
  }
};

async function loadFeed(): Promise<Feed> {
  const filePath = path.join(process.cwd(), "public", "data", "inspiration.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as Feed;
}

export default async function Page() {
  const feed = await loadFeed();
  const cards = (feed.items || [])
    .filter((x) => x.status === "PUBLISHED" && x.featured)
    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));

  // Minimal JSON-LD: ItemList of CreativeWork
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Daily Inspiration Hub",
    itemListElement: cards.map((c: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: c?.hook?.text?.replaceAll("“", "").replaceAll("”", "") || c.title || c.id,
        inLanguage: c.lang || "zh",
        description: c?.signal?.summary || c?.translation?.tag || "",
        url: `/inspiration-hub#${c.id}`,
        image: (c?.visual?.images || []).map((img: any) => img.url)
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-16">
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
