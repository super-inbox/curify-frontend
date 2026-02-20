import { notFound } from "next/navigation";
import type { Metadata } from "next";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

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

import NanoTemplateDetailClient from "./NanoTemplateDetailClient";
import CdnImage from "@/app/[locale]/_components/CdnImage";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

function safeString(v: any) {
  if (v === null || v === undefined) return "";
  return String(v);
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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${data.template.template_id} | Nano Template`;
  const description =
    data.template.description ||
    "Explore this nano template and generate curated outputs with Curify.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${localeStr}/nano-template/${slug}`,
    },
  };
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

  // ----------------------------
  // SECTION 2 needs localized titles per image
  // We'll build a curated ordered list using template.cards if exists
  // ----------------------------
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
    }));

  // ----------------------------
  // SECTION 3 uses NanoInspirationRow (client).
  // Build grouped cards (like home) and filter out current template.
  // Preload 1-2 images per card.
  // ----------------------------
  const otherNanoCards = buildNanoFeedCards(reg, locale as Locale, {
    perTemplateMaxImages: 2, // preload 1-2 images per card
    strictLocale: false,
  }).filter((c) => c.template_id !== template.template_id);

  return (
    // push down to avoid sticky header
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {template.template_id}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {template.description}
            </p>
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

{/* SECTION 1 */}
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


      {/* SECTION 2: simple list of images + localized title */}
      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-neutral-900">Example images</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {section2Images.length} curated outputs for this template.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section2Images.map((it) => (
            <div
              key={it.id}
              className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CdnImage
                src={it.preview}
                alt={it.title || it.id}
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                  {it.title || it.id}
                </div>
              </div>
            </div>
          ))}
        </div>


{/* SECTION 3: other nano templates (lower) */}
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
