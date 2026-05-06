import { redirect } from "next/navigation";
import type { Metadata } from "next";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import nanoTemplates from "@/public/data/nano_templates.json";
import {
  ALL_SUGGESTIONS,
  TIER2_SUGGESTIONS,
  type SuggestionEntry,
} from "@/lib/searchIndex";
import SearchResultsClient from "./SearchResultsClient";

// Build once per request — small enough to recompute, big enough we don't want
// to do it inside the inspiration loop.
const SUGGESTION_BY_SLUG = new Map<string, SuggestionEntry>(
  ALL_SUGGESTIONS.map((s) => [s.slug, s])
);
const TIER_2_3_SLUGS = new Set(
  ALL_SUGGESTIONS.filter((s) => s.tier !== 1).map((s) => s.slug)
);
const TEMPLATE_TOPICS = new Map<string, string[]>();
for (const t of nanoTemplates as any[]) {
  if (typeof t?.id === "string" && Array.isArray(t.topics)) {
    TEMPLATE_TOPICS.set(t.id, t.topics);
  }
}

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

  // Load template-level i18n so non-Latin queries (e.g. zh "反义词") and locale-
  // specific terms can match against template titles / categories / descriptions
  // that don't appear in inspiration data. Always include the user's locale plus
  // en + zh: most templates are zh-authored so zh has the source-of-truth strings,
  // and en is the universal fallback.
  const localesToScan = Array.from(new Set([locale, "en", "zh"]));
  type NanoTemplateMessages = Record<
    string,
    {
      category?: string;
      title?: string;
      description?: string;
      content?: { sections?: { what?: string; who?: string } };
    }
  >;
  const templateSearchBlob = new Map<string, string>(); // template_id -> blob
  for (const loc of localesToScan) {
    let entries: NanoTemplateMessages = {};
    try {
      entries = (await import(`../../../../messages/${loc}/nano.json`)).default as NanoTemplateMessages;
    } catch {
      continue;
    }
    for (const [tid, e] of Object.entries(entries)) {
      const parts = [
        e?.category,
        e?.title,
        e?.description,
        e?.content?.sections?.what,
        e?.content?.sections?.who,
      ].filter((v): v is string => typeof v === "string" && v.length > 0);
      if (parts.length === 0) continue;
      templateSearchBlob.set(
        tid,
        (templateSearchBlob.get(tid) ?? "") + " " + parts.join(" ").toLowerCase()
      );
    }
  }
  const matchedTemplateIdsByI18n = new Set<string>();
  for (const [tid, blob] of templateSearchBlob) {
    if (blob.includes(query)) matchedTemplateIdsByI18n.add(tid);
  }

  // Topic slug match → go straight to the topic page (reuses all existing
  // infrastructure). Exact match first; if nothing exact, fall back to a
  // single-unambiguous-substring/alias match so query "emotion" resolves
  // to the "emotions" topic and "love" resolves to "relationship" (via
  // its alias) instead of bouncing to the generic search-results page.
  let target = ALL_SUGGESTIONS.find((s) => {
    if (s.slug === query) return true;
    if (s.label.toLowerCase() === query) return true;
    if ((s.aliases ?? []).some((a) => a.toLowerCase() === query)) return true;
    const localized = localizedTopics[s.slug]?.displayName?.toLowerCase();
    return !!localized && localized === query;
  });
  if (!target) {
    const containsQuery = ALL_SUGGESTIONS.filter((s) => {
      if (s.slug.includes(query)) return true;
      if (s.label.toLowerCase().includes(query)) return true;
      if ((s.aliases ?? []).some((a) => a.toLowerCase().includes(query))) return true;
      const localized = localizedTopics[s.slug]?.displayName?.toLowerCase();
      return !!localized && localized.includes(query);
    });
    // Only redirect when the substring match is unambiguous (single hit).
    if (containsQuery.length === 1) target = containsQuery[0];
  }
  if (target) redirect(`/${locale}/topics/${target.slug}`);

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
  // Also include inspirations whose parent template's i18n matched the query
  // (so e.g. zh "反义词" surfaces all examples under the chinese-verb-opposite
  // template even though the inspiration records themselves have no zh tags).
  const inspirations = (nanoInspiration as InspRecord[])
    .filter((r) => {
      if (matchedTemplateIdsByI18n.has(r.template_id)) return true;
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

  // Related queries: aggregate Tier-2/3 topics across matched templates,
  // sort by frequency, fall back to popular Tier-2 if nothing matched.
  const matchedTemplateIds = new Set(inspirations.map((r) => r.template_id));
  const topicCounts = new Map<string, number>();
  for (const tid of matchedTemplateIds) {
    for (const slug of TEMPLATE_TOPICS.get(tid) ?? []) {
      if (!TIER_2_3_SLUGS.has(slug)) continue;
      if (slug === query) continue; // don't suggest the query back to the user
      topicCounts.set(slug, (topicCounts.get(slug) ?? 0) + 1);
    }
  }

  let relatedTopics: SuggestionEntry[] = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug]) => SUGGESTION_BY_SLUG.get(slug))
    .filter((s): s is SuggestionEntry => !!s);

  if (relatedTopics.length === 0) {
    relatedTopics = TIER2_SUGGESTIONS.filter((s) => s.slug !== query).slice(0, 8);
  }

  return (
    <SearchResultsClient
      query={query}
      locale={locale}
      inspirations={inspirations}
      relatedTopics={relatedTopics}
    />
  );
}
