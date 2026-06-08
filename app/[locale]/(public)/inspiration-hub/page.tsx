import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import InspirationHubClient from "./InspirationHubClient";
import ExampleImagesGrid from "@/app/[locale]/(public)/nano-template/[slug]/ExampleImagesGrid";
import { inspirationService } from "@/services/inspiration";
import { mapDTOToUICard } from "@/services/inspirationMapper";
import { InspirationCardUI } from "@/types/inspiration";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { routing } from "@/i18n/routing";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import nanoTemplates from "@/public/data/nano_templates.json";

// Prerender per locale -> edge-cached (cuts Fast Origin Transfer). Backend data
// is captured at build (refreshes on next deploy). generateMetadata sets the
// correct per-locale canonical + hreflang, so SEO output is unchanged.
export const revalidate = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Topic rows shown at the top of the hub. Order matters — these render
// in the listed sequence. Each topic should resolve to a `topics.${slug}`
// translation entry in messages/<locale>/topics.json.
const TOPIC_ROWS = [
  "mbti", "anime", "vocabulary", "history", "reading",
  "animals", "food-and-drink", "culture", "travel", "food",
  "fashion", "fitness", "guides", "kawaii", "watercolor",
] as const;

const ROW_LIMIT = 12;

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

// For each TOPIC_ROWS slug, pull the top N inspirations whose topic
// chain (own + parent template's) includes the slug, sorted by the
// parent template's rank_score (which already factors freshness +
// engagement). Maps each inspiration to the shape ExampleImagesGrid
// expects.
type Inspiration = {
  id: string;
  template_id: string;
  asset: {
    image_url: string;
    preview_image_url: string;
    video_url?: string;
  };
  params?: Record<string, string>;
  topics?: string[];
  locales?: Record<string, { title?: string }>;
};

type Template = { id: string; topics?: string[]; rank_score?: number };

function buildTopicRows(locale: string) {
  const templates = nanoTemplates as unknown as Template[];
  const inspirations = nanoInspiration as unknown as Inspiration[];

  const templateById = new Map(templates.map((t) => [t.id, t]));

  return TOPIC_ROWS.map((topic) => {
    // Group matched inspirations by template so the row showcases
    // multiple templates instead of being dominated by whichever
    // template happens to have the most examples tagged with this topic.
    const buckets = new Map<string, Inspiration[]>();
    for (const insp of inspirations) {
      const own = insp.topics ?? [];
      const parent = templateById.get(insp.template_id)?.topics ?? [];
      if (!own.includes(topic) && !parent.includes(topic)) continue;
      const arr = buckets.get(insp.template_id);
      if (arr) arr.push(insp);
      else buckets.set(insp.template_id, [insp]);
    }

    // Sort templates by rank_score desc, then take 1 inspiration per
    // template (the first one — already in input order). If we hit the
    // row limit before exhausting templates, stop. If we run out of
    // unique templates and still have room, do a second pass picking
    // additional examples from the highest-ranked templates.
    const sortedTemplateIds = [...buckets.keys()].sort((a, b) => {
      const ar = templateById.get(a)?.rank_score ?? 0;
      const br = templateById.get(b)?.rank_score ?? 0;
      return br - ar;
    });

    const picked: Inspiration[] = [];
    for (const tid of sortedTemplateIds) {
      if (picked.length >= ROW_LIMIT) break;
      picked.push(buckets.get(tid)![0]);
    }
    if (picked.length < ROW_LIMIT) {
      for (const tid of sortedTemplateIds) {
        const rest = (buckets.get(tid) ?? []).slice(1);
        for (const insp of rest) {
          if (picked.length >= ROW_LIMIT) break;
          picked.push(insp);
        }
        if (picked.length >= ROW_LIMIT) break;
      }
    }

    const items = picked.map((x) => ({
      id: x.id,
      title:
        x.locales?.[locale]?.title ||
        x.locales?.en?.title ||
        x.locales?.zh?.title ||
        "",
      preview: x.asset.preview_image_url,
      templateId: x.template_id,
      params: x.params,
      videoUrl: x.asset.video_url,
    }));

    return { topic, items };
  }).filter((row) => row.items.length > 0);
}

export default async function InspirationHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({ locale });
  const safeT = (key: string) => {
    try { return t(key as never) ?? ""; } catch { return ""; }
  };

  const rawData = await inspirationService.getCards({
    review_status: "APPROVED",
    limit: 100,
  });

  const cards = rawData.map(mapDTOToUICard);
  const jsonLd = generateJsonLd(cards);

  const topicRows = buildTopicRows(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-[1400px] px-4 pt-4 pb-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Daily Inspiration Hub
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            Browse curated AI templates and examples by topic — from MBTI
            personality cards to watercolor illustrations.
          </p>
        </header>

        {/* Topic rows: localized name + 1-line description + grid of
            top-ranked examples for that topic. */}
        {topicRows.map(({ topic, items }) => {
          const displayName = safeT(`topics.${topic}.displayName`) || topic;
          const description = safeT(`topics.${topic}.description`);
          return (
            <section key={topic} className="mb-10">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    <Link
                      href={`/${locale}/topics/${topic}`}
                      className="hover:text-purple-700"
                    >
                      {displayName}
                    </Link>
                  </h2>
                  {description ? (
                    <p className="mt-1 text-sm text-neutral-600">
                      {description}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/${locale}/topics/${topic}`}
                  className="shrink-0 text-sm font-semibold text-purple-700 hover:text-purple-900"
                >
                  See all →
                </Link>
              </div>
              <ExampleImagesGrid items={items} maxRows={1} locale={locale} />
            </section>
          );
        })}

        {/* Original signal-based card feed below the topic rows. */}
        <section className="mt-12 border-t border-neutral-200 pt-8">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900">
            Today&apos;s Signals
          </h2>
          <InspirationHubClient cards={cards} />
        </section>
      </main>
    </>
  );
}