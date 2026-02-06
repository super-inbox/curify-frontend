import { notFound } from "next/navigation";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  normalizeLocale,
  buildNanoRegistry,
  buildNanoTemplateDetailData,
} from "@/lib/nano_utils";

import NanoTemplateDetailClient from "./NanoTemplateDetailClient";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

function templateIdToSlug(templateId: string) {
  return templateId.replace(/^template-/, "");
}

function safeString(v: any) {
  if (v === null || v === undefined) return "";
  return String(v);
}

// Convert template-detail cards -> NanoInspirationRow expected shape
function toNanoCardsForTimeline(args: { template: any; cards: any[] }) {
  const { template, cards } = args;

  return (cards || []).map((c) => ({
    id: c.image_id,
    template_id: template.template_id,
    language: ((template as any).language || "zh") as "zh" | "en",
    category: template.category || "Nano Template",

    image_urls: [c.image_url || c.preview_image_url].filter(Boolean),
    preview_image_urls: [c.preview_image_url || c.image_url].filter(Boolean),

    description: template.description || "",
    base_prompt: template.base_prompt || "",
    template_parameters: template.parameters || [],
    sample_parameters: (c as any).parameters || undefined,
  }));
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

  const { template, cards } = data;

  const otherTemplates = (templates || [])
    .filter((t) => t?.id && t.id !== template.template_id)
    .map((t) => ({
      template_id: t.id,
      description: (t as any).description || "",
      category: (t as any).category || "",
      language: (t as any).language || "",
    }))
    .slice(0, 12);

  const timelineCards = toNanoCardsForTimeline({ template, cards });

  return (
    // ✅ push down to avoid your global header
    <main className="mx-auto max-w-6xl px-4 pt-20 pb-10">
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
              {safeString((template as any).language || locale).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ One client component renders both sections */}
      <NanoTemplateDetailClient
        locale={locale}
        template={{
          template_id: template.template_id,
          base_prompt: template.base_prompt || "",
          parameters: template.parameters || [],
        }}
        timelineCards={timelineCards}
      />

      {/* SECTION 3: Other nano templates */}
      <section className="mt-10">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-neutral-900">
            Other nano templates
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Explore other categories and presets.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherTemplates.map((t) => {
            const otherSlug = templateIdToSlug(t.template_id);
            return (
              <a
                key={t.template_id}
                href={`/${locale}/nano-template/${otherSlug}`}
                className="group block rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-neutral-900 line-clamp-1">
                    {t.template_id}
                  </div>
                  <span className="text-xs font-semibold text-neutral-500">
                    {safeString(t.language).toUpperCase()}
                  </span>
                </div>

                {t.category ? (
                  <div className="mt-2 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-100">
                    {t.category}
                  </div>
                ) : null}

                {t.description ? (
                  <p className="mt-3 text-sm text-neutral-600 line-clamp-2">
                    {t.description}
                  </p>
                ) : null}

                <div className="mt-4 text-xs font-semibold text-purple-700">
                  View template →
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
