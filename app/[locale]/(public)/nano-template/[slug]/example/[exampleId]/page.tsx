// app/[locale]/nano-template/[slug]/example/[exampleId]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import ExampleImagesGrid from "../../ExampleImagesGrid";
import NanoTemplateDetailClient from "../../NanoTemplateDetailClient";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import ProgressiveCdnImage from "@/app/[locale]/_components/ProgressiveCdnImage";
import PromptBreakdown from "@/app/[locale]/_components/PromptBreakdown";
import { toAbsUrlMaybe } from "@/lib/nano_seo_utils";
import { SITE_URL } from "@/lib/constants";
import TopicNavRow from "@/app/[locale]/_components/TopicNavRow";

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

  return {
    ...ctx,
    imageId,
    example,
    title,
    category,
    prompt,
    tags,
    paramEntries,
    gridItems,
    prevNext,
    otherNanoCards,
    templateTopics,
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
    tags,
    paramEntries,
    gridItems,
    prevNext,
    otherNanoCards,
    templateTopics,
  } = pageData;

  const examplePageUrl = `${SITE_URL}/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href={`/${rawLocale}`} className="hover:text-neutral-800">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/${rawLocale}/nano-template/${slug}`}
          className="hover:text-neutral-800"
        >
          {category || slug}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 font-medium text-neutral-800">{title}</span>
      </nav>
      <section className="relative">
  {prevNext ? (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:flex items-center">
        <Link
          href={prevNext.prev.href}
          aria-label="Previous example"
          className="pointer-events-auto inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/85 text-base text-neutral-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-neutral-900"
        >
          &lt;
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden lg:flex items-center justify-end">
        <Link
          href={prevNext.next.href}
          aria-label="Next example"
          className="pointer-events-auto inline-flex h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/85 text-base text-neutral-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-neutral-900"
        >
          &gt;
        </Link>
      </div>
    </>
  ) : null}

  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:items-stretch">
    <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm lg:h-[520px]">
      <ProgressiveCdnImage
        previewSrc={example.asset.preview_image_url}
        fullSrc={example.asset.image_url}
        alt={title}
        className="h-full w-full object-contain"
        priority
      />
    </div>

    <div className="flex flex-col gap-4 lg:min-h-[520px]">
      {(templateTopics.length > 0 || category) && (
        <div className="flex flex-wrap items-center gap-2">
          {templateTopics.length > 0 ? (
            <TopicNavRow
              locale={pageLocale}
              topics={[templateTopics[0]]}
              className="mb-0"
              showDisabled={false}
              size="small"
            />
          ) : null}

          {category ? (
            <span className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {category}
            </span>
          ) : null}
        </div>
      )}

      <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
        {title}
      </h1>

      <section aria-labelledby="prompt-heading" className="flex flex-col">
        <h2
          id="prompt-heading"
          className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500"
        >
          Prompt
        </h2>

        <PromptBreakdown prompt={prompt} params={example.params ?? {}} />
      </section>

      <div className="mt-auto">
      <UnifiedActionBar
  className="pt-2"
  tracking={{
    contentId: example.id,
    contentType: "nano_inspiration",
    viewMode: "cards",
  }}
  remix={{
    enabled: true,
    href: `/${rawLocale}/nano-template/${slug}?${new URLSearchParams(paramEntries).toString()}`,
  }}
  copy={{
    enabled: true,
    text: prompt,
  }}
  share={{
    enabled: true,
    url: examplePageUrl,
    title,
    text: `Check out this Nano Banana example: ${title}`,
  }}
/>
      </div>

      
    </div>
  </div>
</section>

      {prevNext ? (
        <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
          <Link
            href={prevNext.prev.href}
            className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            ← Prev
          </Link>

          <span className="text-xs font-medium text-neutral-500">
            {prevNext.index + 1} / {prevNext.total}
          </span>

          <Link
            href={prevNext.next.href}
            className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            Next →
          </Link>
        </div>
      ) : null}

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
          template={{ template_id: templateId, base_prompt: "", parameters: [] }}
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