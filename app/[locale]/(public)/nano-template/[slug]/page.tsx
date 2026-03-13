import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import ExampleImagesGrid from "./ExampleImagesGrid";
import { getTranslations } from "next-intl/server";
import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
  buildNanoTemplateDetailData,
  getImageViewsForTemplate,
  buildNanoFeedCards,
} from "@/lib/nano_utils";

import {
  resolveContentLocale,
  makeSafeTranslator,
  buildTopicHref,
  getTopicLabel,
} from "@/lib/locale_utils";

import {
  type NanoMessagesDict,
  buildNanoTemplateMetadata,
  buildNanoH1,
  resolveContentSections,
  normalizeNanoLocaleMessageEntry,
} from "@/lib/nano_seo_utils";

import NanoTemplateDetailClient from "./NanoTemplateDetailClient";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

async function loadNanoMessages(localeStr: string): Promise<NanoMessagesDict> {
  try {
    const mod = await import(`@/messages/${localeStr}/nano.json`);
    return (mod.default ?? {}) as NanoMessagesDict;
  } catch {
    return {};
  }
}

async function getPageData(localeStr: string, slug: string) {
  const pageLocale = localeStr;
  const contentLocale = resolveContentLocale(localeStr);
  const templateId = slugToTemplateId(slug);

  const templates = nanoTemplates as unknown as RawTemplate[];
  const images = nanoImages as unknown as RawNanoImageRecord[];
  const reg = buildNanoRegistry(templates, images);

  const nanoMessagesRaw = await loadNanoMessages(localeStr);
  const localizedRawEntry = nanoMessagesRaw?.[templateId];
  const localizedEntry = normalizeNanoLocaleMessageEntry(localizedRawEntry);

  const tNano = await getTranslations({ locale: pageLocale, namespace: "nano" });
  const translateNano = makeSafeTranslator(tNano);

  const tTopics = await getTranslations({ locale: pageLocale});
  const translateTopics = makeSafeTranslator(tTopics);

  const data = buildNanoTemplateDetailData(
    reg,
    templateId,
    contentLocale,
    translateNano
  );

  const nanoMessages: NanoMessagesDict = {
    [templateId]: localizedEntry,
  };

  return {
    pageLocale,
    contentLocale,
    templateId,
    reg,
    data,
    nanoMessages,
    localizedEntry,
    translateNano,
    translateTopics,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr, slug } = await params;

  const { templateId, data, nanoMessages, localizedEntry } = await getPageData(
    localeStr,
    slug
  );

  if (!data) {
    return {
      title: "Template Not Found",
      description: "The requested nano template could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const { template } = data;

  const fallbackTitle =
    localizedEntry.category || template.category || template.template_id;

  const fallbackDescription =
    localizedEntry.description ||
    template.description ||
    "Explore this nano template and generate curated outputs with Curify.";

  return buildNanoTemplateMetadata({
    templateId,
    localeStr,
    slug,
    nanoMessages,
    fallbackTitle: `${fallbackTitle} | Nano Template`,
    fallbackDescription,
  });
}

export default async function NanoTemplatePage({ params }: Props) {
  const { locale: localeStr, slug } = await params;

  const {
    pageLocale,
    contentLocale,
    templateId,
    reg,
    data,
    nanoMessages,
    localizedEntry,
    translateNano,
    translateTopics,
  } = await getPageData(localeStr, slug);

  if (!data) notFound();

  const { template } = data;
  const templateTopics = template.topics ?? [];

  const { h2What, h2Who, h2How, h2Prompts } = resolveContentSections(
    templateId,
    nanoMessages
  );

  const h1 = buildNanoH1(
    localizedEntry.title,
    localizedEntry.category || template.category || template.template_id
  );

  const intro =
    localizedEntry.description ||
    template.description ||
    "Copy and customize this Nano Banana prompt to generate structured, shareable visuals in seconds.";

  const imageViews = getImageViewsForTemplate(reg, templateId, contentLocale);
  const imageMap = new Map(imageViews.map((x) => [x.id, x]));

  const orderedImageIds =
    template.cards?.length > 0
      ? template.cards.map((c) => c.image_id)
      : imageViews.map((x) => x.id);

  const section2Images = orderedImageIds
    .map((id) => imageMap.get(id))
    .filter(Boolean)
    .map((img) => ({
      id: img!.id,
      title: img!.title || "",
      preview: img!.preview_image_url || img!.image_url,
      templateId: img!.template_id,
    }));

  const otherNanoCards = buildNanoFeedCards(reg, contentLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  }).filter((c) => c.template_id !== template.template_id);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{h1}</h1>
            <p className="mt-2 text-sm text-neutral-600">{intro}</p>

            {templateTopics.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {templateTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={buildTopicHref(pageLocale, topic)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                  >
                    {getTopicLabel(topic, translateTopics)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {localizedEntry.category || template.category ? (
            <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {localizedEntry.category || template.category}
            </span>
          ) : null}
        </div>
      </div>

      <NanoTemplateDetailClient
        locale={pageLocale}
        template={{
          template_id: template.template_id,
          base_prompt: template.base_prompt || "",
          parameters: template.parameters || [],
        }}
        otherNanoCards={otherNanoCards}
        showReproduce={true}
        showOtherTemplates={false}
      />

      {h2What || h2Who || h2How.length > 0 || h2Prompts.length > 0 ? (
        <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">About this template</h2>

          {h2What ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">
                What is this template?
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{h2What}</p>
            </div>
          ) : null}

          {h2Who ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Who should use it?
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{h2Who}</p>
            </div>
          ) : null}

          {h2How.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">How to use it</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm leading-6 text-neutral-700">
                {h2How.map((s, i) => (
                  <li key={i} className="mt-1">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {h2Prompts.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Example prompts
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-neutral-700">
                {h2Prompts.map((s, i) => (
                  <li key={i} className="mt-1">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-8">
        <ExampleImagesGrid
          items={section2Images}
          locale={pageLocale}
          maxRows={3}
        />

        <NanoTemplateDetailClient
          locale={pageLocale}
          template={{
            template_id: template.template_id,
            base_prompt: template.base_prompt || "",
            parameters: [],
          }}
          otherNanoCards={otherNanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />
      </section>
    </main>
  );
}