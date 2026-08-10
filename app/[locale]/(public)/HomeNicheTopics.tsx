import { getTranslations } from "next-intl/server";
import Link from "next/link";

import HomeFusedRow, {
  type HomeExampleTile,
  type TopRemixPrompt,
} from "@/app/[locale]/(public)/HomeFusedRow";
import { makeSafeTranslator } from "@/lib/locale_utils";
import { getGalleryTag } from "@/lib/topicRegistry";
import { nanoPromptsService } from "@/services/nanoPrompts";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import nanoTemplates from "@/public/data/nano_templates.json";

/**
 * Home "Explore by niche" section — surfaces a curated few of the niche
 * design topics that live on /inspiration-hub as image rows on the home page.
 * Each row = the topic's top-ranked example images (filled with gallery
 * prompts via the topic's gallery tag) and links to the /topics/<slug> page.
 * Mirrors the inspiration-hub niche-row build so the surfaces stay in sync.
 *
 * Only populated niches are listed here so every home row shows images.
 */
const HOME_NICHE_SLUGS = [
  "sneaker-design",
  "museum-merchandise",
  "coffee-shop-branding",
] as const;

const ROW_ITEM_LIMIT = 10;

type Insp = {
  id: string;
  template_id: string;
  asset?: { preview_image_url?: string; video_url?: string };
  locales?: Record<string, { title?: string }>;
  topics?: string[];
};
type Template = { id: string; topics?: string[]; rank_score?: number };

export default async function HomeNicheTopics({ locale }: { locale: string }) {
  const tRoot = await getTranslations({ locale });
  const t = makeSafeTranslator(tRoot);

  const templateById = new Map<string, Template>(
    (nanoTemplates as unknown as Template[]).map((x) => [x.id, x]),
  );

  const rows = await Promise.all(
    HOME_NICHE_SLUGS.map(async (topic) => {
      const items = (nanoInspiration as unknown as Insp[])
        .filter((insp) => {
          const own = insp.topics ?? [];
          const parent = templateById.get(insp.template_id)?.topics ?? [];
          return own.includes(topic) || parent.includes(topic);
        })
        .slice(0, ROW_ITEM_LIMIT);

      const examples: HomeExampleTile[] = items
        .map((x) => ({
          id: x.id,
          templateId: x.template_id,
          title:
            x.locales?.[locale]?.title ||
            x.locales?.en?.title ||
            x.locales?.zh?.title ||
            "",
          preview: x.asset?.preview_image_url || "",
        }))
        .filter((e) => Boolean(e.preview));

      let gallery: TopRemixPrompt[] = [];
      const gtag = getGalleryTag(topic);
      if (gtag) {
        try {
          const raw = await nanoPromptsService.getNanoPromptsByTag(gtag, { limit: 12 });
          gallery = raw
            .filter((p) => !(p.tags ?? []).includes("revealing-female"))
            .map((p) => ({
              id: p.id,
              title: p.title,
              image_url: (p as unknown as { imageURL?: string }).imageURL || "",
              tags: p.tags || [],
              unique_copies_30d: 0,
              total_copies_30d: 0,
            }))
            .filter((g) => Boolean(g.image_url));
        } catch {
          // gallery is non-critical; row falls back to examples only
        }
      }

      return { topic, examples, gallery };
    }),
  );

  const visibleRows = rows.filter((r) => r.examples.length + r.gallery.length > 0);
  if (visibleRows.length === 0) return null;

  return (
    <section className="mt-12 w-full max-w-[1400px]">
      <div className="mb-4 pl-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
          {t("home.nicheTopics.title") || "Explore by niche"}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {t("home.nicheTopics.subtitle") ||
            "Style-explored design niches — see the range, then make your own."}
        </p>
      </div>

      <div className="space-y-8">
        {visibleRows.map(({ topic, examples, gallery }) => {
          const displayName = t(`topics.${topic}.displayName`) || topic;
          const description = t(`topics.${topic}.description`);
          return (
            <div key={`home-niche-${topic}`}>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    <Link
                      href={`/${locale}/topics/${topic}`}
                      className="hover:text-purple-700"
                    >
                      {displayName}
                    </Link>
                  </h3>
                  {description ? (
                    <p className="mt-0.5 max-w-3xl text-xs text-neutral-600">
                      {description}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/${locale}/topics/${topic}`}
                  className="shrink-0 whitespace-nowrap text-sm font-semibold text-purple-700 hover:text-purple-900"
                >
                  See all →
                </Link>
              </div>
              <HomeFusedRow
                examples={examples}
                galleryPrompts={gallery}
                locale={locale}
                maxRows={1}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
