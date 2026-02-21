import { notFound } from "next/navigation";
import type { Metadata } from "next";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

// ✅ NEW: merged seo json
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

// ✅ NEW: types for SEO JSON (lightweight)
type SeoBlock = {
  canonical_slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  robots?: string;
  schema?: any;
};

type SeoTemplateEntry = {
  id: string;
  locales: Record<string, { seo: SeoBlock }>;
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

function resolveSeo(templateId: string, locale: string): SeoBlock | null {
  const list = (nanoSeo as any)?.templates as SeoTemplateEntry[] | undefined;
  if (!list?.length) return null;

  const entry = list.find((t) => t.id === templateId);
  if (!entry) return null;

  // prefer exact locale, fallback to "en", then first locale
  const loc =
    entry.locales?.[locale]?.seo ??
    entry.locales?.["en"]?.seo ??
    Object.values(entry.locales || {})[0]?.seo;

  return loc ?? null;
}

function toAbsUrlMaybe(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // allow "/images/..." in seo json
  return `${SEO_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

  const seo = resolveSeo(templateId, locale);

  // ✅ canonical: prefer seo.canonical_slug if present, else keep current slug
  const canonicalSlug = seo?.canonical_slug || slug;
  const canonicalPath = `/${localeStr}/nano-template/${canonicalSlug}`;

  const title =
    seo?.meta_title ||
    `${data.template.template_id} | Nano Template`;

  const description =
    seo?.meta_description ||
    data.template.description ||
    "Explore this nano template and generate curated outputs with Curify.";

  const keywords = seo?.meta_keywords?.length ? seo.meta_keywords : undefined;

  const ogImage = toAbsUrlMaybe(seo?.og_image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: parseRobots(seo?.robots) || {
      index: true,
      follow: true,
    },
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
  const { locale: localeStr, slug } = await params;

  const locale = normalizeLocale(localeStr);
  const templateId = slugToTemplateId(slug);

  const templates = nanoTemplates as unknown as RawTemplate[];
  const images = nanoImages as unknown as RawNanoImageRecord[];

  const reg = buildNanoRegistry(templates, images);
  const data = buildNanoTemplateDetailData(reg, templateId, locale);

  if (!data) notFound();

  const { template } = data;

  // ✅ NEW: pull schema for JSON-LD injection (optional)
  const seo = resolveSeo(templateId, locale);
  const schema = seo?.schema;

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
    }));

  // SECTION 3: other templates
  const otherNanoCards = buildNanoFeedCards(reg, locale as Locale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
  }).filter((c) => c.template_id !== template.template_id);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
      {/* ✅ Optional JSON-LD schema */}
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

      {/* SECTION 2 */}
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

        {/* SECTION 3 */}
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