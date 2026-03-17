// app/[locale]/nano-template/[slug]/example/[exampleId]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import ExampleImagesGrid from "../../ExampleImagesGrid";
import NanoTemplateDetailClient from "../../NanoTemplateDetailClient";
import ExampleActionBar from "./ExampleActionBar";
import ProgressiveCdnImage from "@/app/[locale]/_components/ProgressiveCdnImage";
import PromptBreakdown from "@/app/[locale]/_components/PromptBreakdown";
import {
  toSlug,
  getNanoExampleById,
  type RawNanoImageRecord,
} from "@/lib/nano_utils";

import { toAbsUrlMaybe } from "@/lib/nano_seo_utils";
import { SITE_URL } from "@/lib/constants";

import {
  buildNanoPageContext,
  buildTemplateImageGridItems,
  buildOtherTemplateCards,
  getImageViewsForTemplate,
  resolveLocalizedExampleCopy,
} from "@/lib/nano_page_data";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageParams = {
  locale: string;
  slug: string;
  exampleId: string;
};

// ─── Shared page data ─────────────────────────────────────────────────────────

async function getPageData(localeStr: string, slug: string, rawExampleId: string) {
  const ctx = await buildNanoPageContext(localeStr, slug);
  const imageId = decodeURIComponent(rawExampleId);

  const example = getNanoExampleById(ctx.templateId, imageId, ctx.contentLocale);
  if (!example) return null;

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

  const imageViews = getImageViewsForTemplate(ctx.reg, ctx.templateId, ctx.contentLocale);
  const gridItems = buildTemplateImageGridItems(imageViews, imageId);

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
    otherNanoCards,
  };
}

// ─── Static generation ────────────────────────────────────────────────────────

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

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug, exampleId: rawExampleId } = await params;

  const pageData = await getPageData(rawLocale, slug, rawExampleId);
  if (!pageData) return {};

  const { title, category, example } = pageData;
  const ogImage = toAbsUrlMaybe(example.asset.preview_image_url);

  return {
    title: `${title} — Nano Banana Prompt Generator`,
    description: `Generate images like "${title}" with Nano Banana. See the full prompt, breakdown, and use cases for this ${category} template.`,
    openGraph: {
      title: `${title} | Nano Banana`,
      description: `Nano Banana ${category.toLowerCase()} prompt — see the exact prompt and how to recreate this image.`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    alternates: {
      canonical: `/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    otherNanoCards,
  } = pageData;

  const examplePageUrl = `${SITE_URL}/${rawLocale}/nano-template/${slug}/example/${rawExampleId}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
      
        <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm lg:h-[480px]">
          <ProgressiveCdnImage
            previewSrc={example.asset.preview_image_url}
            fullSrc={example.asset.image_url}
            alt={title}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-3 lg:h-[480px]">
          {category && (
            <span className="inline-block w-fit rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {category}
            </span>
          )}

          <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
            {title}
          </h1>

          <section aria-labelledby="prompt-heading" className="min-h-0 flex-1">
            <h2
              id="prompt-heading"
              className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500"
            >
              Prompt
            </h2>
            <div className="h-full overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-800 sm:text-sm">
                {prompt || "—"}
              </pre>
            </div>
          </section>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600 sm:px-2.5 sm:py-1 sm:text-[11px]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <Link
              href={`/${rawLocale}/nano-template/${slug}?${new URLSearchParams(paramEntries).toString()}`}
              className="inline-block rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-700"
            >
              Try this template →
            </Link>

            <ExampleActionBar
              exampleId={example.id}
              pageUrl={examplePageUrl}
              title={title}
              promptText={prompt}
            />
          </div>
        </div>
      </div>

      <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">Prompt breakdown</h2>
        <PromptBreakdown prompt={prompt} params={example.params ?? {}} />
      </section>

      <section className="mt-8">
        {gridItems.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              More from this template
            </h2>
            <ExampleImagesGrid items={gridItems} locale={pageLocale} maxRows={3} />
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
