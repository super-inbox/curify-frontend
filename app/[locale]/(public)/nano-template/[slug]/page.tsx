import { notFound } from "next/navigation";
import type { Metadata } from "next";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import ExampleImagesGrid from "./ExampleImagesGrid";

import nanoSeo from "@/public/data/nano_template_seo.json";

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

type Props = {
  params: { locale: string; slug: string };
};

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

function safeString(v: any) {
  if (v === null || v === undefined) return "";
  return String(v);
}

type SeoBlock = {
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  robots?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  schema?: any;
};

type SeoContentSections = {
  what?: string;
  who?: string;
  how?: string[];
  prompts?: string[];
};

type SeoLocalePayload = {
  seo?: SeoBlock;
  content?: {
    sections?: SeoContentSections;
  };
};

type SeoTemplateEntry = {
  id: string;
  locales: Record<string, SeoLocalePayload>;
};

const SEO_BASE_URL = "https://www.curify-ai.com";

function parseRobots(robots?: string): Metadata["robots"] | undefined {
  if (!robots) return undefined;
  const s = robots.toLowerCase().replace(/\s/g, "");
  const index = s.includes("noindex") ? false : s.includes("index") ? true : undefined;
  const follow = s.includes("nofollow") ? false : s.includes("follow") ? true : undefined;
  if (index === undefined && follow === undefined) return undefined;
  return { index, follow };
}

function resolveSeoEntry(templateId: string): SeoTemplateEntry | null {
  const list = (nanoSeo as any)?.templates as SeoTemplateEntry[] | undefined;
  if (!list?.length) return null;
  return list.find((t) => t.id === templateId) ?? null;
}

function resolveSeoPayload(templateId: string, locale: string): SeoLocalePayload | null {
  const entry = resolveSeoEntry(templateId);
  if (!entry) return null;

  const payload =
    entry.locales?.[locale] ??
    entry.locales?.["en"] ??
    Object.values(entry.locales || {})[0];

  return payload ?? null;
}

function toAbsUrlMaybe(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SEO_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizeText(s?: string) {
  if (!s) return "";
  return String(s).trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr, slug } = params;

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

  const payload = resolveSeoPayload(templateId, locale);
  const seo = payload?.seo;

  const canonicalPath = `/${localeStr}/nano-template/${slug}`;

  const title =
    normalizeText(seo?.meta_title) ||
    `${data.template.template_id} | Nano Template`;

  const description =
    normalizeText(seo?.meta_description) ||
    normalizeText(data.template.description) ||
    "Explore this nano template and generate curated outputs with Curify.";

  const ogImage = toAbsUrlMaybe(
    seo?.og_image || "/images/seo/default-template.jpg"
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: parseRobots(seo?.robots) || { index: true, follow: true },

    openGraph: {
      type: (seo?.og_type as any) || "website",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: `${SEO_BASE_URL}${canonicalPath}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: "Curify",
      locale: localeStr,
    },

    twitter: {
      card: (seo?.twitter_card as any) || "summary_large_image",
      title: seo?.twitter_title || title,
      description: seo?.twitter_description || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function NanoTemplatePage({ params }: Props) {
  const { locale: localeStr, slug } = params;

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

  const sections = payload?.content?.sections;

  const h2What = normalizeText(sections?.what);
  const h2Who = normalizeText(sections?.who);
  const h2How = (sections?.how || []).map((x) => normalizeText(x)).filter(Boolean);
  const h2Prompts = (sections?.prompts || []).map((x) => normalizeText(x)).filter(Boolean);

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

  const otherNanoCards = buildNanoFeedCards(reg, locale as Locale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
  }).filter((c) => c.template_id !== template.template_id);

  const rawTitle =
    normalizeText(seo?.meta_title) ||
    `Nano Banana Prompt Template: ${template.template_id}`;

  const h1 = rawTitle.replace(/\s*[｜|]\s*Curify AI\s*$/i, "");

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}

      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{h1}</h1>
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

      {(h2What || h2Who || h2How.length > 0 || h2Prompts.length > 0) && (
        <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">
            About this template
          </h2>

          {h2What && (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">
                What is this template?
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {h2What}
              </p>
            </div>
          )}

          {h2Who && (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">
                Who should use it?
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {h2Who}
              </p>
            </div>
          )}

          {h2How.length > 0 && (
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
          )}

          {h2Prompts.length > 0 && (
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
          )}
        </section>
      )}

      <section className="mt-8">
        <ExampleImagesGrid items={section2Images} maxRows={3} />

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