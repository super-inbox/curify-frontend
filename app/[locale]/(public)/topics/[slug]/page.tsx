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

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function normalizeTopicValues(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function templateHasTopic(template: RawTemplate, slug: string): boolean {
  const normalizedSlug = slug.trim().toLowerCase();
  const candidates = normalizeTopicValues((template as any)?.topics);
  return candidates.includes(normalizedSlug);
}

export default async function Page({ params }: Props) {
  const { locale: localeStr, slug } = await params;
  const contentLocale = resolveContentLocale(localeStr);

  // Translator A: nano template fields
  const tNano = await getTranslations({ locale: localeStr, namespace: "nano" });
  const translateNano = makeSafeTranslator(tNano);

  // Translator B: generic topic labels / title / description
  // Uses root because home.json is flattened in your current request config
  const tTopicsRoot = await getTranslations({ locale: localeStr });
  const translateTopics = makeSafeTranslator(tTopicsRoot);

  const allTemplates = nanoTemplates as unknown as RawTemplate[];
  const allImages = nanoImages as unknown as RawNanoImageRecord[];

  const filteredTemplates = allTemplates.filter((template) =>
    templateHasTopic(template, slug)
  );

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
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 lg:px-8">
        <TopicNavRow
          locale={localeStr}
          translateTopics={translateTopics}
          activeTopic={slug}
        />

        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
            Topic
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {topicTitle}
          </h1>
          {topicDescription ? (
            <p className="mt-4 text-base leading-7 text-neutral-600">
              {topicDescription}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <NanoTemplateDetailClient
          locale={localeStr}
          template={{ template_id: "", base_prompt: "", parameters: [] }}
          otherNanoCards={nanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />
      </div>
    </main>
  );
}