import { redirect } from "next/navigation";
import type { Metadata } from "next";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import { ALL_SUGGESTIONS } from "@/lib/searchIndex";
import SearchResultsClient from "./SearchResultsClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `"${q}" — Curify Search` : "Search — Curify",
    robots: { index: false },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  if (!query) redirect(`/${locale}`);

  // Exact topic slug match → go straight to the topic page (reuses all existing infrastructure)
  const exactSlug = ALL_SUGGESTIONS.find(
    (s) => s.slug === query || s.label.toLowerCase() === query
  );
  if (exactSlug) redirect(`/${locale}/topics/${exactSlug.slug}`);

  type InspRecord = {
    id: string;
    template_id: string;
    asset: { preview_image_url: string; image_url: string };
    topics?: string[];
    tags?: string[];
  };

  // Filter inspiration records by tags, topics, or template_id
  const inspirations = (nanoInspiration as InspRecord[])
    .filter((r) => {
      const tags = (r.tags ?? []).join(" ").toLowerCase();
      const topics = (r.topics ?? []).join(" ").toLowerCase();
      const tid = r.template_id.toLowerCase();
      return tags.includes(query) || topics.includes(query) || tid.includes(query);
    })
    .slice(0, 80);

  return (
    <SearchResultsClient
      query={query}
      locale={locale}
      inspirations={inspirations}
    />
  );
}
