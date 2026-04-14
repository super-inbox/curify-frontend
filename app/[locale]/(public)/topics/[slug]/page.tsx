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

import { getTemplatesForTopic, getRelatedTopics, getParentTopic, getChildTopics, getTopicById } from "@/lib/topicRegistry";

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

  const filteredTemplates = getTemplatesForTopic(slug) as RawTemplate[];
  const allImages = nanoImages as unknown as RawNanoImageRecord[];

  if (!filteredTemplates.length) {
    notFound();
  }

  const allowedTemplateIds = new Set(
    filteredTemplates
      .map((t: any) => t.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );

  const isChildTopic = !!getParentTopic(slug);

  const filteredImages = allImages.filter((img: any) => {
    if (!allowedTemplateIds.has(img?.template_id)) return false;
    if (isChildTopic) return (img.topics ?? []).includes(slug);
    return true;
  });

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

  const CHILD_THRESHOLD = 2;
  const parentTopicId = getParentTopic(slug);

  // On a parent page: show its child topics. On a child page: show siblings.
  const siblingOrChildIds = isChildTopic
    ? getChildTopics(parentTopicId!).filter((id) => id !== slug)
    : getChildTopics(slug);

  const visibleSubTopics = siblingOrChildIds.filter(
    (id) => (getTopicById(id)?.templateCount ?? 0) >= CHILD_THRESHOLD
  );

  const subTopicsHeading = isChildTopic
    ? translateTopics("topicPage.exploreMoreHeading") || "Explore More"
    : translateTopics("topicPage.subTopicsHeading") || "Browse by Category";

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1280px] px-4 pt-4 pb-4 sm:px-6 lg:px-8">        

        <div className="max-w-5xl">
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

      {visibleSubTopics.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-3">
            {subTopicsHeading}
          </h2>
          <TopicNavRow
            locale={localeStr}
            topics={visibleSubTopics}
            showDisabled={false}
            size="default"
          />
        </section>
      )}

    </main>
  );
}