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
} from "@/lib/nano_example_utils";

import {
  buildNanoPageContext,
  buildTemplateImageGridItems,
  buildSimilarExampleGridItems,
  buildOtherTemplateCards,
  getImageViewsForTemplate,
  resolveLocalizedExampleCopy,
} from "@/lib/nano_page_data";

// Cache example detail pages for 4 hours with ISR — example data
// rarely changes after publication and the page builds a heavy data
// graph (template view, prevNext, similar items, etc.) per render.
export const revalidate = 14400;

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

  const { title, category } = resolveLocalizedExampleCopy(
    example,
    ctx.contentLocale,
    ctx.localizedEntry
  );

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

  const { title, category, example, templateTopics } = pageData;
  const ogImage = toAbsUrlMaybe(example.asset.preview_image_url);

  const topicText = templateTopics?.length ? templateTopics[0] : "";
  const categoryText = category || topicText || "nano banana";

  return {
    title: `${title} — Nano Banana Prompt Generator`,
    description: `Generate images like "${title}" with Nano Banana. See the full prompt, breakdown, and use cases for this ${categoryText} template.`,
    openGraph: {
      title: `${title} | Nano Banana`,
      description: `Nano Banana ${categoryText.toLowerCase()} prompt — see the exact prompt and how to recreate this image.`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    alternates: {
      canonical: `/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`,
    },
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
              href={`/${rawLocale}/nano-template/${slug}/carousel/${rawExampleId}?media=image`}
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
