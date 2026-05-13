// app/[locale]/nano-template/[slug]/example/[exampleId]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ExampleImagesGrid from "../../ExampleImagesGrid";
import NanoTemplateDetailClient from "../../NanoTemplateDetailClient";
import ExampleRightColumn from "./ExampleRightColumn";
import ExampleVideoPlayer from "./ExampleVideoPlayer";
import ProgressiveCdnImage from "@/app/[locale]/_components/ProgressiveCdnImage";
import ExamplePromptHero from "@/app/[locale]/_components/ExamplePromptHero";
import { toAbsUrlMaybe } from "@/lib/nano_seo_utils";
import { SITE_URL } from "@/lib/constants";

import { toSlug, getTemplateView, type RawNanoImageRecord } from "@/lib/nano_utils";
import {
  getNanoExampleById,
  buildCircularExampleNav,
  getExampleI18n,
} from "@/lib/nano_example_utils";
import { routing } from "@/i18n/routing";

import {
  buildNanoPageContext,
  buildTemplateImageGridItems,
  buildSimilarExampleGridItems,
  buildOtherTemplateCards,
  getImageViewsForTemplate,
  resolveLocalizedExampleCopy,
} from "@/lib/nano_page_data";

// Example data is entirely bundled (nano_inspiration.json) and only
// changes on redeploy. generateStaticParams (below) pre-builds every
// example at deploy, and revalidate=false keeps the Full Route Cache
// pinned until the next deploy. Avoids pointless 4h rebuilds with
// byte-identical output.
export const revalidate = false;

type PageParams = {
  locale: string;
  slug: string;
  exampleId: string;
};

async function getPageData(localeStr: string, slug: string, rawExampleId: string) {
  const ctx = await buildNanoPageContext(localeStr, slug);
  const imageId = decodeURIComponent(rawExampleId);

  const example = getNanoExampleById(ctx.templateId, imageId, ctx.contentLocale);
  if (!example) return null;

  const templateView = getTemplateView(ctx.reg, ctx.templateId, ctx.contentLocale);
  const templateTopics = templateView?.topics ?? [];
  const templateBatch = templateView?.batch ?? false;
  const templateParameters = templateView?.parameters ?? [];
  const templateAllowGeneration = templateView?.allow_generation ?? false;

  const fallbackCopy = resolveLocalizedExampleCopy(
    example,
    ctx.contentLocale,
    ctx.localizedEntry
  );
  const category = fallbackCopy.category;

  // Always read example.json regardless of allow_i18n. We've backfilled
  // unique descriptions for ~1,275 non-allow_i18n examples; rendering
  // them improves the visible page even for locales we don't index.
  // The allow_i18n flag still gates *indexing* below (hreflang +
  // noindex), so non-allow_i18n examples on non-en/zh stay noindex'd
  // — they just look better to the visitors who do reach them.
  const allowI18n = !!example.allow_i18n;
  const exampleI18n = await getExampleI18n(example.id, ctx.contentLocale);
  const title = exampleI18n?.title || fallbackCopy.title;
  const bodyDescription = exampleI18n?.description || null;
  const metaDescription = exampleI18n?.metaDescription || null;

  const basePrompt = templateView?.base_prompt || example.base_prompt || "";
  const prompt = example.filled_prompt || example.base_prompt || "";
  const tags = [category, "nano banana", "prompt generator", "ai image"].filter(Boolean);

  const paramEntries = Object.fromEntries(
    Object.entries(example.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
  );

  const imageViews = getImageViewsForTemplate(
    ctx.reg,
    ctx.templateId,
    ctx.contentLocale
  );

  const gridItems = buildTemplateImageGridItems(imageViews, imageId);

  const similarItems = buildSimilarExampleGridItems(ctx.reg, imageId, {
    limit: 12,
    maxPerTemplate: 2,
  });

  const prevNext = buildCircularExampleNav({
    reg: ctx.reg,
    templateId: ctx.templateId,
    contentLocale: ctx.contentLocale,
    pageLocale: localeStr,
    slug,
    currentExampleId: imageId,
  });

  const otherNanoCards = buildOtherTemplateCards(
    ctx.reg,
    ctx.contentLocale,
    ctx.translateNano,
    ctx.templateId
  );

  const exampleTopics: string[] = example.topics ?? [];

  const existingExamples = imageViews.map((v) => ({ id: v.id, params: v.params }));

  return {
    ...ctx,
    imageId,
    example,
    title,
    category,
    prompt,
    tags,
    exampleTopics,
    paramEntries,
    gridItems,
    similarItems,
    prevNext,
    otherNanoCards,
    templateTopics,
    templateBatch,
    templateParameters,
    templateAllowGeneration,
    basePrompt,
    existingExamples,
    allowI18n,
    bodyDescription,
    metaDescription,
  };
}

export async function generateStaticParams() {
  const mod = (await import("@/public/data/nano_inspiration.json")) as unknown as {
    default: RawNanoImageRecord[];
  };

  const locales = ["en", "zh"];

  return locales.flatMap((locale) =>
    mod.default.map((img) => ({
      locale,
      slug: toSlug(img.template_id),
      exampleId: encodeURIComponent(img.id),
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const pageData = await getPageData(rawLocale, slug, rawExampleId);
  if (!pageData) return {};

  const { title, category, example, templateTopics, allowI18n, metaDescription } = pageData;
  const ogImage = toAbsUrlMaybe(example.asset.preview_image_url);

  const topicText = templateTopics?.length ? templateTopics[0] : "";
  const categoryText = category || topicText || "nano banana";

  // Use locale-specific metaDescription when available; fall back to a
  // generic template-derived sentence for non-allow_i18n / not-yet-translated.
  const description =
    metaDescription ||
    `Generate images like "${title}" with Nano Banana. See the full prompt, breakdown, and use cases for this ${categoryText} template.`;

  // Build hreflang alternates for allow_i18n entries (10 locales) so Google
  // groups the localized URLs together. For other entries, only en + zh
  // (the locales they actually have meaningful content in).
  const route = `/nano-template/${slug}/example/${rawExampleId}`;
  const hreflangLocales: readonly string[] = allowI18n
    ? routing.locales
    : ["en", "zh"];
  const languages: Record<string, string> = {};
  for (const lng of hreflangLocales) {
    const prefix = lng === "en" ? "" : `/${lng}`;
    languages[lng] = `${prefix}${route}`;
  }
  // x-default mirrors the canonical (root-domain English path).
  languages["x-default"] = route;

  // Non-allow_i18n entries on non-en/zh locales render with template-level
  // fallbacks (thin) — noindex them to avoid SEO penalties for thin content.
  const noindex = !allowI18n && rawLocale !== "en" && rawLocale !== "zh";

  // When noindex'd, point canonical at the EN version (the page Google
  // should actually index) instead of self. A noindex page that
  // canonicals to itself sends conflicting signals — Google ends up
  // classifying it as "Duplicate without user-selected canonical".
  // EN uses no locale prefix (localePrefix: as-needed).
  const canonicalLocale = noindex ? "en" : rawLocale;
  const canonicalPath = canonicalLocale === "en" ? route : `/${canonicalLocale}${route}`;

  return {
    title: `${title} — Nano Banana Prompt Generator`,
    description,
    openGraph: {
      title: `${title} | Nano Banana`,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function NanoExampleDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const pageData = await getPageData(rawLocale, slug, rawExampleId);
  if (!pageData) notFound();

  const {
    pageLocale,
    templateId,
    example,
    title,
    category,
    prompt,
    exampleTopics,
    paramEntries,
    gridItems,
    similarItems,
    prevNext,
    otherNanoCards,
    templateTopics,
    templateBatch,
    templateParameters,
    templateAllowGeneration,
    basePrompt,
    existingExamples,
    bodyDescription,
  } = pageData;

  const examplePageUrl = `${SITE_URL}/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-2 sm:px-6 lg:px-8">
      <ExamplePromptHero
        title={title}
        prompt={prompt}
        trackingId={example.id}
        prevNext={prevNext}
        breadcrumbs={[
          { label: "Home", href: `/${rawLocale}` },
          { label: category || slug, href: `/${rawLocale}/nano-template/${slug}` },
          { label: title },
        ]}
        image={
          example.asset.video_url ? (
            <ExampleVideoPlayer
              templateId={templateId}
              exampleId={example.id}
              videoUrl={example.asset.video_url}
              posterUrl={example.asset.preview_image_url ?? example.asset.image_url}
              title={title}
            />
          ) : (
            <Link
              href={`/${rawLocale}/carousel/template-example/${slug}/${rawExampleId}?media=image`}
              className="block h-full w-full cursor-zoom-in"
              aria-label="Open image in carousel"
            >
              <ProgressiveCdnImage
                previewSrc={example.asset.preview_image_url}
                fullSrc={example.asset.image_url}
                alt={title}
                className="h-full w-full object-contain"
                priority
                noZoom
              />
            </Link>
          )
        }
        rightColumnContent={
          <ExampleRightColumn
            chipTopics={templateTopics}
            chipExampleTopics={exampleTopics}
            chipCategory={category}
            title={title}
            description={bodyDescription ?? undefined}
            templateId={templateId}
            slug={slug}
            locale={rawLocale}
            parameters={templateParameters}
            allowGeneration={templateAllowGeneration}
            initialParams={paramEntries}
            exampleId={example.id}
            basePrompt={basePrompt}
            batchEnabled={templateBatch}
            examplePageUrl={examplePageUrl}
            existingExamples={existingExamples}
          />
        }
      />

      <section className="mt-8">
        {similarItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More like this
            </h2>
            <ExampleImagesGrid items={similarItems} locale={pageLocale} maxRows={2} />
          </>
        )}
        {similarItems.length === 0 && gridItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More from this template
            </h2>
            <ExampleImagesGrid items={gridItems} locale={pageLocale} maxRows={2} />
          </>
        )}

        <NanoTemplateDetailClient
          locale={pageLocale}
          template={{
            template_id: templateId,
            base_prompt: "",
            parameters: [],
            topics: templateTopics,
          }}
          otherNanoCards={otherNanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to create "${title}" with Nano Banana`,
            description: `Use this prompt to generate ${title} images with Nano Banana.`,
            image: example.asset.image_url,
            step: [
              { "@type": "HowToStep", text: "Open Nano Banana and select the template." },
              { "@type": "HowToStep", text: `Enter the prompt: ${prompt}` },
              { "@type": "HowToStep", text: "Generate and download your image." },
            ],
          }),
        }}
      />
    </main>
  );
}
