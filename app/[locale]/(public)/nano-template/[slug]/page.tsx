import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ExampleImagesGrid from "./ExampleImagesGrid";
import NanoTemplateDetailClient from "./NanoTemplateDetailClient";

import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";

import {
  buildNanoTemplateMetadata,
  buildNanoH1,
  resolveContentSections,
} from "@/lib/nano_seo_utils";

import {
  buildNanoPageContext,
  buildOrderedTemplateImageGridItems,
  buildOtherTemplateCards,
  getImageViewsForTemplate,
  buildNanoTemplateDetailData,
} from "@/lib/nano_page_data";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getPageData(localeStr: string, slug: string) {
  const ctx = await buildNanoPageContext(localeStr, slug);

  const data = buildNanoTemplateDetailData(
    ctx.reg,
    ctx.templateId,
    ctx.contentLocale,
    ctx.translateNano
  );

  return {
    ...ctx,
    data,
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
    localizedEntry.title ||
    localizedEntry.category ||
    template.category ||
    template.template_id;

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
  } = await getPageData(localeStr, slug);

  if (!data) notFound();

  const { template } = data;
  const templateTopics = template.topics ?? [];

  const { h2What, h2Who, h2How, h2Prompts } = resolveContentSections(
    templateId,
    nanoMessages
  );

  const categoryLabel =
    localizedEntry.category || template.category || template.template_id;

  const h1 = buildNanoH1(localizedEntry.title, categoryLabel);

  const intro =
    localizedEntry.description ||
    template.description ||
    "Copy and customize this Nano Banana prompt to generate structured, shareable visuals in seconds.";

  const imageViews = getImageViewsForTemplate(reg, templateId, contentLocale);

  const orderedImageIds =
    template.cards?.length > 0
      ? template.cards.map((c) => c.image_id)
      : imageViews.map((x) => x.id);

  const section2Images = buildOrderedTemplateImageGridItems(
    imageViews,
    orderedImageIds
  );

  const otherNanoCards = buildOtherTemplateCards(
    reg,
    contentLocale,
    translateNano,
    template.template_id
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{h1}</h1>
            <p className="mt-2 text-sm text-neutral-600">{intro}</p>

            {templateTopics.length > 0 ? (
  <TopicNavRow
    locale={pageLocale}    
    topics={templateTopics}
    className="mt-4 mb-0"
    showDisabled={false}
  />
) : null}
          </div>

          {categoryLabel ? (
            <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {categoryLabel}
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

<section className="mt-8">
<h2 className="mb-4 text-lg font-bold text-neutral-900">
              From this template
            </h2>
<ExampleImagesGrid
          items={section2Images}
          locale={pageLocale}
          maxRows={2}
        />
</section>
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
              <h3 className="text-base font-semibold text-neutral-900">
                How to use it
              </h3>
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