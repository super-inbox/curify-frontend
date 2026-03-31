import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
} from "@/lib/nano_utils";

import { buildNanoFeedCards } from "@/lib/nano_page_data";
import {
  resolveContentLocale,
  makeSafeTranslator,
  titleCaseFromSlug,
} from "@/lib/locale_utils";

import { getTemplatesForTopic } from "@/lib/topicRegistry";

import nanoImages from "@/public/data/nano_inspiration.json";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

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

  const filteredImages = allImages.filter((img: any) =>
    allowedTemplateIds.has(img?.template_id)
  );

  const reg = buildNanoRegistry(filteredTemplates, filteredImages);

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

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1280px] px-4 pt-4 pb-4 sm:px-6 lg:px-8">        

        <div className="max-w-5xl">
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {topicTitle}
          </h1>

          {topicDescription ? (
            <p className="mt-3 text-base leading-7 text-neutral-600">
              {topicDescription}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8">
        <NanoTemplateDetailClient
          locale={localeStr}          
          otherNanoCards={nanoCards}
          showReproduce={false}
          showOtherTemplates={true}
          showOtherTemplateTitle={false}
        />
      </section>
    </main>
  );
}