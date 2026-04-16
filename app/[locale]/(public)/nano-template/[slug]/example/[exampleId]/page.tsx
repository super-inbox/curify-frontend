// app/[locale]/nano-template/[slug]/example/[exampleId]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import ExampleImagesGrid from "../../ExampleImagesGrid";
import NanoTemplateDetailClient from "../../NanoTemplateDetailClient";
import ReproduceTemplateSection from "../../ReproduceTemplateSection";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";
import MetaChipLink from "@/app/[locale]/_components/MetaChipLink";
import { buildTopicHref } from "@/lib/locale_utils";
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
  buildOtherTemplateCards,
  getImageViewsForTemplate,
  resolveLocalizedExampleCopy,
  buildNanoTemplateDetailData,
} from "@/lib/nano_page_data";

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

  const { title, category } = resolveLocalizedExampleCopy(
    example,
    ctx.contentLocale,
    ctx.localizedEntry
  );

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

  const templateDetail = buildNanoTemplateDetailData(ctx.reg, ctx.templateId, ctx.contentLocale, ctx.translateNano);

  const exampleTags: string[] = (example as any).topics ?? [];

  return {
    ...ctx,
    imageId,
    example,
    title,
    category,
    prompt,
    tags,
    exampleTags,
    paramEntries,
    gridItems,
    prevNext,
    otherNanoCards,
    templateTopics,
    templateBatch,
    templateDetail,
    imageViews,
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
    exampleTags,
    paramEntries,
    gridItems,
    otherNanoCards,
    templateTopics,
    templateBatch,
    templateDetail,
    imageViews,
  } = pageData;

  const examplePageUrl = `${SITE_URL}/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`;

  const templateForReproduce = {
    template_id: templateId,
    base_prompt: templateDetail?.template?.base_prompt || "",
    parameters: templateDetail?.template?.parameters || [],
    batch: templateBatch,
    allow_generation: !!(templateDetail?.template as any)?.allow_generation,
    topics: templateTopics,
    existingExamples: imageViews
      .filter((v) => v.params && Object.keys(v.params).length > 0)
      .map((v) => ({ id: v.id, params: v.params as Record<string, string> })),
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href={`/${rawLocale}`} className="hover:text-neutral-800">Home</Link>
        <span>/</span>
        <Link href={`/${rawLocale}/nano-template/${slug}`} className="hover:text-neutral-800">
          {category || slug}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 font-medium text-neutral-800">{title}</span>
      </nav>

      {/* Title + topic tags */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {templateTopics.length > 0 && (
            <TopicNavRow
              locale={pageLocale}
              topics={templateTopics}
              className="mb-0"
              showDisabled={false}
              size="small"
            />
          )}
          {exampleTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {exampleTags.map((tag) => (
                <MetaChipLink
                  key={tag}
                  href={buildTopicHref(rawLocale, tag)}
                  color="blue"
                  size="small"
                >
                  {tag}
                </MetaChipLink>
              ))}
            </div>
          )}
          {category && (
            <Link
              href={`/${rawLocale}/nano-template/${slug}`}
              className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
            >
              {category}
            </Link>
          )}
        </div>
      </div>

      {/* Unified reproduce section */}
      <ReproduceTemplateSection
        template={templateForReproduce}
        sampleImage={{
          url: example.asset.image_url,
          previewUrl: example.asset.preview_image_url,
          alt: title,
        }}
        initialParams={paramEntries}
      />

      <section className="mt-8">
        {gridItems.length > 0 && (
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