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

  // Pull localized topic displayNames for this locale so e.g. zh "动漫" still
  // resolves to slug "anime". Mirrors the relative-path import style used in
  // i18n/request.ts (the @/ alias doesn't always resolve in dynamic imports).
  let localizedTopics: Record<string, { displayName?: string }> = {};
  try {
    const home = (await import(`../../../../messages/${locale}/home.json`)).default;
    localizedTopics = (home as any).topics ?? {};
  } catch {
    const home = (await import(`../../../../messages/en/home.json`)).default;
    localizedTopics = (home as any).topics ?? {};
  }

  // Exact topic slug match → go straight to the topic page (reuses all existing infrastructure)
  const exactSlug = ALL_SUGGESTIONS.find((s) => {
    if (s.slug === query) return true;
    if (s.label.toLowerCase() === query) return true;
    const localized = localizedTopics[s.slug]?.displayName?.toLowerCase();
    return !!localized && localized === query;
  });
  if (exactSlug) redirect(`/${locale}/topics/${exactSlug.slug}`);

  type InspRecord = {
    id: string;
    template_id: string;
    asset: { preview_image_url: string; image_url: string };
    params?: Record<string, unknown>;
    locales?: Record<string, { title?: string; category?: string }>;
    tags?: string[];
  };

  // Free-text match across id, template_id, tags, params (e.g. character_name,
  // art_style), and per-locale title/category — covers long-tail terms like
  // "wukong" or "paper cutting" that exist in the data but not in tags.
  const inspirations = (nanoInspiration as InspRecord[])
    .filter((r) => {
      const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [
        l?.title,
        l?.category,
      ]);
      const blob = [
        r.id,
        r.template_id,
        ...(r.tags ?? []),
        ...Object.values(r.params ?? {}),
        ...localeFields,
      ]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .join(" ")
        .toLowerCase();
      return blob.includes(query);
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
