import { notFound } from "next/navigation";
import type { Metadata } from "next";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

// ✅ merged seo json (minimal + optional content sections)
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

/**
 * ✅ Minimal SEO schema + optional content sections
 * Keep this compatible with both "full" and "minimal" seo json
 */
type SeoBlock = {
  canonical_slug?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  robots?: string;
  // optional future fields (ok if absent)
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
  how?: string[]; // list items
  prompts?: string[]; // list items
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

  // prefer exact locale, fallback to "en", then first locale
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

  const payload = resolveSeoPayload(templateId, locale);
  const seo = payload?.seo;

  // ✅ IMPORTANT:
  // canonical_slug is a "canonical identifier", not necessarily the actual route slug.
  // We keep the page route as-is, but can point canonical to a preferred URL.
  // If you actually want canonical_slug to be routable, you must add redirect logic elsewhere.
  const canonicalSlug = slug;
  const canonicalPath = `/${localeStr}/nano-template/${canonicalSlug}`;

  const title = normalizeText(seo?.meta_title) || `${data.template.template_id} | Nano Template`;

  const description =
    normalizeText(seo?.meta_description) ||
    normalizeText(data.template.description) ||
    "Explore this nano template and generate curated outputs with Curify.";

  const ogImage = toAbsUrlMaybe(seo?.og_image);

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

  // ✅ server-side H2 content sections (minimal)
  const sections = payload?.content?.sections;
  const h2What = normalizeText(sections?.what);
  const h2Who = normalizeText(sections?.who);
  const h2How = (sections?.how || []).map((x) => normalizeText(x)).filter(Boolean);
  const h2Prompts = (sections?.prompts || []).map((x) => normalizeText(x)).filter(Boolean);

  // SECTION 2: example images
  const imageViews = getImageViewsForTemplate(reg, templateId, template.locale);
  const imageMap = new Map(imageViews.map((x) => [x.id, x]));

  const orderedImageIds =
    template.cards?.length > 0 ? template.cards.map((c) => c.image_id) : imageViews.map((x) => x.id);

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
            <h1 className="text-2xl font-bold text-neutral-900">{template.template_id}</h1>
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

      {/* ✅ NEW SECTION: server-side SEO content (H2 blocks) */}
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
                  <li key={i} className="mt-1">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {h2Prompts.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-base font-semibold text-neutral-900">Example prompts</h3>
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

      {/* SECTION 2: example images */}
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