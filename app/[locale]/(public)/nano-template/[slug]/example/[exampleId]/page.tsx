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
import MoreLikeThisRail from "@/app/[locale]/_components/MoreLikeThisRail";
import WcTravelRail from "@/app/[locale]/_components/WcTravelRail";
import { getWcTravelRecommendations } from "@/lib/wcTravelRail";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import { getTopicNavList } from "@/lib/topicRegistry";
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
  const templateUseCases = templateView?.use_cases ?? [];
  const templateBatch = templateView?.batch ?? false;
  const templateParameters = templateView?.parameters ?? [];
  const templateAllowGeneration = templateView?.allow_generation ?? false;
  const templateRequiresImageUpload = templateView?.requires_image_upload ?? false;

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

  const exampleTopics: string[] = example.topics ?? [];

  const otherNanoCards = buildOtherTemplateCards(
    ctx.reg,
    ctx.contentLocale,
    ctx.translateNano,
    ctx.templateId,
    Array.from(new Set([...(exampleTopics ?? []), ...(templateTopics ?? [])]))
  );

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
    templateUseCases,
    templateBatch,
    templateParameters,
    templateAllowGeneration,
    templateRequiresImageUpload,
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

  // MBTI head-term injection (2026-06-10 bleed fix). 12+ MBTI character
  // example pages were sitting at SERP pos 3-10 with 0 clicks because
  // titles read "Kobe Bryant — Nano Banana Prompt Generator" instead of
  // matching the query pattern "kobe bryant mbti". Same pattern across
  // /nano-template/{mbti-nba,mbti-yellowstone,mbti-naruto,mbti-generic,
  // friends-character-mbti,...}/example/* — every slug in the family
  // contains "mbti". One title-format swap recovers ~700+ impressions
  // of leaked CTR across the family.
  const isMbtiTemplate = slug.includes("mbti");

  // Use locale-specific metaDescription when available; fall back to a
  // generic template-derived sentence for non-allow_i18n / not-yet-translated.
  const description =
    metaDescription ||
    (isMbtiTemplate
      ? `${title} MBTI personality type — AI-generated character card. Generate similar images with Nano Banana; full prompt + breakdown + example outputs.`
      : `Generate images like "${title}" with Nano Banana. See the full prompt, breakdown, and use cases for this ${categoryText} template.`);

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

  // MBTI: inject "MBTI" head term right after the character name so the
  // SERP title bolds the matched query ("kobe bryant mbti" etc).
  const pageTitle = isMbtiTemplate
    ? `${title} MBTI — Nano Banana Character Card`
    : `${title} — Nano Banana Prompt Generator`;
  const ogTitleStr = isMbtiTemplate
    ? `${title} MBTI | Nano Banana`
    : `${title} | Nano Banana`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: ogTitleStr,
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
    templateUseCases,
    templateBatch,
    templateParameters,
    templateAllowGeneration,
    templateRequiresImageUpload,
    basePrompt,
    existingExamples,
    bodyDescription,
  } = pageData;

  const examplePageUrl = `${SITE_URL}/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`;

  const mergedTopics = [
    ...new Set([...(templateTopics ?? []), ...(exampleTopics ?? [])]),
  ];
  const topicNav = getTopicNavList();
  const metaChips =
    mergedTopics.length > 0 || category ? (
      <>
        {mergedTopics.length > 0 && (
          <TopicNavRow
            locale={rawLocale}
            allTopics={topicNav}
            topics={mergedTopics}
            className="mb-0"
            showDisabled={false}
            size="small"
          />
        )}
        {category && (
          <Link
            href={`/${rawLocale}/nano-template/${slug}`}
            className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
          >
            {category}
          </Link>
        )}
      </>
    ) : null;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-2 sm:px-6 lg:px-8">
      <ExamplePromptHero
        title={title}
        prompt={prompt}
        trackingId={example.id}
        prevNext={prevNext}
        metaChips={metaChips}
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
              className="relative block h-full w-full cursor-zoom-in"
              aria-label="Open image in carousel"
            >
              <ProgressiveCdnImage
                previewSrc={example.asset.preview_image_url}
                fullSrc={example.asset.image_url}
                alt={title}
                className="object-contain"
                fill
                priority
                noZoom
              />
            </Link>
          )
        }
        rightColumnContent={
          <ExampleRightColumn
            title={title}
            description={bodyDescription ?? undefined}
            templateId={templateId}
            slug={slug}
            locale={rawLocale}
            parameters={templateParameters}
            allowGeneration={templateAllowGeneration}
            requiresImageUpload={templateRequiresImageUpload}
            initialParams={paramEntries}
            exampleId={example.id}
            basePrompt={basePrompt}
            batchEnabled={templateBatch}
            examplePageUrl={examplePageUrl}
            existingExamples={existingExamples}
            useCaseFilter={templateUseCases}
            allTopics={topicNav}
          />
        }
        moreLikeThisRail={
          (similarItems.length > 0 ? similarItems : gridItems).length > 0 ? (
            <MoreLikeThisRail
              heading={similarItems.length > 0 ? "More like this" : "More from this template"}
              items={(similarItems.length > 0 ? similarItems : gridItems).map((item) => ({
                href: `/${rawLocale}/nano-template/${toSlug(item.templateId)}/example/${encodeURIComponent(item.id)}`,
                src: item.preview,
                alt: item.title,
                title: item.title,
              }))}
              limit={2}
            />
          ) : null
        }
      />

      <section className="mt-8">
        {similarItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More like this
            </h2>
            {/* desktopHideFirstN=2 unifies with the MoreLikeThisRail above
                — the rail shows similarItems[0..1] on lg+, the grid
                renders items[2..N] on desktop, full 0..N on mobile (rail
                is hidden below lg). One continuous "More like this" flow,
                no duplication. */}
            <ExampleImagesGrid
              items={similarItems}
              locale={pageLocale}
              maxRows={2}
              desktopOpensExample
              desktopHideFirstN={2}
            />
          </>
        )}
        {similarItems.length === 0 && gridItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More from this template
            </h2>
            <ExampleImagesGrid items={gridItems} locale={pageLocale} maxRows={2} desktopOpensExample />
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

      {/* WC → travel cross-sell rail. Renders only on WC content pages
          (those carrying a <country>-world-cup compound tag). Filtered
          by intersecting the country tag with travel-tagged templates.
          See lib/wcTravelRail.ts for the detection logic. */}
      {(() => {
        const rec = getWcTravelRecommendations(
          exampleTopics,
          pageData.contentLocale,
          { limit: 6 },
        );
        return rec ? <WcTravelRail recommendation={rec} locale={rawLocale} /> : null;
      })()}

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
