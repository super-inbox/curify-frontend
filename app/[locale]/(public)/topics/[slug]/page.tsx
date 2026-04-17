import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import ExampleImagesGrid from "@/app/[locale]/(public)/nano-template/[slug]/ExampleImagesGrid";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
} from "@/lib/nano_utils";

import { buildNanoFeedCards, buildTemplateImageGridItems } from "@/lib/nano_page_data";
import { getImageViewsForTemplate } from "@/lib/nano_example_utils";
import {
  resolveContentLocale,
  makeSafeTranslator,
  titleCaseFromSlug,
} from "@/lib/locale_utils";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

import { getTemplatesForTopic, getRelatedTopics, getParentTopic, getTopicById, getNavigationalChildren, getTagChildren, isTopicEnabled, getTier1Ancestor } from "@/lib/topicRegistry";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const t = await getTranslations({ locale });
  const safeT = (key: string) => { try { return t(key as never) ?? ""; } catch { return ""; } };

  const displayName = safeT(`topics.${slug}.displayName`) || titleCaseFromSlug(slug);
  const title = safeT(`topics.${slug}.title`) || `${displayName} — Nano Banana AI Templates`;
  const description = safeT(`topics.${slug}.description`) || `Explore ${displayName} AI visual templates and prompts on Nano Banana.`;

  const canonical = getCanonicalUrl(locale, `/topics/${slug}`);
  const languages = getLanguagesMap(`/topics/${slug}`);

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${displayName} | Nano Banana`,
      description,
      url: canonical,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale: localeStr, slug } = await params;

  const contentLocale = resolveContentLocale(localeStr);

  const tNano = await getTranslations({ locale: localeStr, namespace: "nano" });
  const translateNano = makeSafeTranslator(tNano);

  const tTopicsRoot = await getTranslations({ locale: localeStr });
  const translateTopics = makeSafeTranslator(tTopicsRoot);

  const allTemplates = nanoTemplates as unknown as RawTemplate[];
  const allImages = nanoImages as unknown as RawNanoImageRecord[];

  // From nano_templates: templates that DIRECTLY have this topic in their topics field
  const templateTaggedIds = new Set(
    allTemplates
      .filter((t: any) => {
        const topics: string[] = Array.isArray(t.topics)
          ? t.topics
          : typeof t.topics === "string"
          ? t.topics.split(",").map((s: string) => s.trim())
          : [];
        return topics.map((s: string) => s.trim().toLowerCase()).includes(slug.toLowerCase());
      })
      .map((t: any) => t.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );

  // From nano_inspiration: template IDs referenced by images tagged with this topic
  const inspirationTaggedIds = new Set(
    allImages
      .filter((img: any) => (img.topics ?? []).includes(slug))
      .map((img: any) => img.template_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );

  // Union of both sources
  const allFilteredIds = new Set([...templateTaggedIds, ...inspirationTaggedIds]);

  if (!allFilteredIds.size) notFound();

  const filteredTemplates = allTemplates.filter((t: any) => allFilteredIds.has(t.id));

  // Images: template-tagged → all its images; inspiration-tagged → only that image; deduplicated
  const seenImageIds = new Set<string>();
  const filteredImages: RawNanoImageRecord[] = [];
  for (const img of allImages) {
    const id = (img as any).id;
    if (!img?.template_id || !id || seenImageIds.has(id)) continue;
    const fromTemplate = templateTaggedIds.has(img.template_id);
    const fromInspiration = ((img as any).topics ?? []).includes(slug);
    if (fromTemplate || fromInspiration) {
      seenImageIds.add(id);
      filteredImages.push(img);
    }
  }

  const reg = buildNanoRegistry(filteredTemplates, filteredImages);

  const imagesByTemplate = filteredTemplates
    .map((t) => buildTemplateImageGridItems(getImageViewsForTemplate(reg, t.id, contentLocale)))
    .filter((imgs) => imgs.length > 0);

  // Interleave: round-robin across templates for visual diversity
  const gridItems: typeof imagesByTemplate[number] = [];
  const maxLen = Math.max(0, ...imagesByTemplate.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const imgs of imagesByTemplate) {
      if (i < imgs.length) gridItems.push(imgs[i]);
    }
  }

  const nanoCards = buildNanoFeedCards(reg, contentLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  });

  if (!nanoCards.length) {
    notFound();
  }

  const topicTitle =
    translateTopics(`topics.${slug}.title`) ||
    translateTopics(`topics.${slug}.displayName`) ||
    titleCaseFromSlug(slug);

  const topicDescription =
    translateTopics(`topics.${slug}.description`) || "";

  const exampleImagesHeading =
    translateTopics("topicPage.exampleImagesHeading") || "Example Images";
  const templatesHeading =
    translateTopics("topicPage.templatesHeading") || "Templates";

  const relatedTopicIds = getRelatedTopics(slug);

  const parentTopicId = getParentTopic(slug);

  // Resolve the Tier 1 ancestor for this page (itself if Tier 1, parent if Tier 2, Tier 1 root if Tier 3 tag)
  const tier1Ancestor = getTier1Ancestor(slug);

  // Tier 2 navigational subtopics — shown at top on all tiers
  const navSubTopics = tier1Ancestor ? getNavigationalChildren(tier1Ancestor) : [];

  // Tier 3 tag subtopics — shown at bottom on all tiers
  const tagSubTopics = tier1Ancestor
    ? getTagChildren(tier1Ancestor).filter((id) => id !== slug && isTopicEnabled(id))
    : [];

  const subTopicsHeading = !!parentTopicId
    ? translateTopics("topicPage.exploreMoreHeading") || "Explore More"
    : translateTopics("topicPage.subTopicsHeading") || "Browse by Category";

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1280px] px-4 pt-2 pb-4 sm:px-6 lg:px-8">

        <div>
          {topicDescription ? (
            <p className="mt-3 text-base leading-7 text-neutral-600">
              {topicDescription}
            </p>
          ) : null}

          {relatedTopicIds.length > 0 && (
            <div className="mt-4">
              <TopicNavRow
                locale={localeStr}
                topics={relatedTopicIds}
                activeTopic={slug}
                showDisabled={false}
                size="small"
              />
            </div>
          )}

          {navSubTopics.length > 0 && (
            <div className="mt-4">
              <TopicNavRow
                locale={localeStr}
                topics={navSubTopics}
                activeTopic={slug}
                showDisabled={false}
                size="small"
              />
            </div>
          )}
        </div>
      </section>

      {gridItems.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 pb-8 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
            {exampleImagesHeading}
          </h2>
          <ExampleImagesGrid items={gridItems} locale={localeStr} maxRows={3} />
        </section>
      )}

      <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
          {templatesHeading}
        </h2>
        <NanoTemplateDetailClient
          locale={localeStr}
          otherNanoCards={nanoCards}
          showReproduce={false}
          showOtherTemplates={true}
          showOtherTemplateTitle={false}
        />
      </section>

      {tagSubTopics.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-3">
            {subTopicsHeading}
          </h2>
          <TopicNavRow
            locale={localeStr}
            topics={tagSubTopics}
            showDisabled={false}
            size="default"
          />
        </section>
      )}

    </main>
  );
}