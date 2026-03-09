import { notFound } from "next/navigation";
import type { Metadata } from "next";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import ExampleImagesGrid from "./ExampleImagesGrid";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  normalizeLocale,
  buildNanoRegistry,
  buildNanoTemplateDetailData,
  getImageViewsForTemplate,
  buildNanoFeedCards,
  type Locale,
} from "@/lib/nano_utils";

import {
  resolveSeoPayload,
  buildNanoTemplateMetadata,
  buildNanoH1,
  resolveContentSections,
  normalizeText,
  safeString,
} from "@/lib/nano_seo_utils";

import NanoTemplateDetailClient from "./NanoTemplateDetailClient";
import CdnImage from "@/app/[locale]/_components/CdnImage";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr, slug } = await params;

  const locale = normalizeLocale(localeStr);
  const templateId = slugToTemplateId(slug);

  const templates = nanoTemplates as unknown as RawTemplate[];
  const images = nanoImages as unknown as RawNanoImageRecord[];
  const reg = buildNanoRegistry(templates, images);
  const data = buildNanoTemplateDetailData(reg, templateId, locale);

  if (!data) {
    return {
      title: "Template Not Found",
      description: "The requested nano template could not be found.",
      robots: { index: false, follow: false },
    };
  }

  return buildNanoTemplateMetadata({
    templateId,
    locale,
    localeStr,
    slug,
    fallbackTitle: `${data.template.template_id} | Nano Template`,
    fallbackDescription:
      normalizeText(data.template.description) ||
      "Explore this nano template and generate curated outputs with Curify.",
  });
}

export default async function NanoTemplatePage({ params }: Props) {
  const { locale: localeStr, slug } = await params;

  const locale = normalizeLocale(localeStr);
  const templateId = slugToTemplateId(slug);

  const templates = nanoTemplates as unknown as RawTemplate[];
  const images = nanoImages as unknown as RawNanoImageRecord[];

  const reg = buildNanoRegistry(templates, images);
  const data = buildNanoTemplateDetailData(reg, templateId, locale);

  if (!data) notFound();

  const { template } = data;

  const payload = resolveSeoPayload(templateId, locale);
  const seo = payload?.seo;
  const schema = seo?.schema;

  const { h2What, h2Who, h2How, h2Prompts } = resolveContentSections(payload);

  const h1 = buildNanoH1(
    seo?.meta_title,
    `Nano Banana Prompt Template: ${template.template_id}`
  );
  const intro =
    normalizeText(seo?.meta_description) ||
    "Copy and customize this Nano Banana prompt to generate structured, shareable visuals in seconds.";

  // SECTION 2: example images
  const imageViews = getImageViewsForTemplate(reg, templateId, template.locale);
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

  // SECTION 3: other templates
  const otherNanoCards = buildNanoFeedCards(reg, locale as Locale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
  }).filter((c) => c.template_id !== template.template_id);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      {schema ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{h1}</h1>
            <p className="mt-2 text-sm text-neutral-600">{template.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {template.category ? (
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-100">
                {template.category}
              </span>
            ) : null}
            <span className="rounded-full bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 border border-neutral-200">
              {safeString(template.locale || locale).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: generator / reproduce */}
      <NanoTemplateDetailClient
        locale={locale}
        template={{
          template_id: template.template_id,
          base_prompt: template.base_prompt || "",
          parameters: template.parameters || [],
        }}
        otherNanoCards={otherNanoCards}
        showReproduce={true}
        showOtherTemplates={false}
      />

      {/* SEO content blocks */}
      {(h2What || h2Who || h2How.length > 0 || h2Prompts.length > 0) ? (
        <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">About this template</h2>

          {h2What ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">What is this template?</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{h2What}</p>
            </div>
          ) : null}

          {h2Who ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">Who should use it?</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{h2Who}</p>
            </div>
          ) : null}

          {h2How.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">How to use it</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm leading-6 text-neutral-700">
                {h2How.map((s, i) => (
                  <li key={i} className="mt-1">{s}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {h2Prompts.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">Example prompts</h3>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-neutral-700">
                {h2Prompts.map((s, i) => (
                  <li key={i} className="mt-1">{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* SECTION 2: example images */}
      <section className="mt-8">
        <ExampleImagesGrid items={section2Images} maxRows={3} />

        {/* SECTION 3: other templates */}
        <NanoTemplateDetailClient
          locale={locale}
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
