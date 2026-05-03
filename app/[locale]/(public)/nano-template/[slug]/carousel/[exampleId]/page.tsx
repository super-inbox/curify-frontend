import { notFound } from "next/navigation";

import CarouselClient from "./CarouselClient";
import {
  buildNanoPageContext,
  resolveLocalizedExampleCopy,
} from "@/lib/nano_page_data";
import { getNanoExampleById } from "@/lib/nano_example_utils";
import { getTemplateView } from "@/lib/nano_utils";
import { SITE_URL } from "@/lib/constants";

type PageParams = {
  locale: string;
  slug: string;
  exampleId: string;
};

type SearchParams = {
  media?: string;
};

export default async function NanoCarouselPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, slug, exampleId: rawExampleId } = await params;
  const { media } = await searchParams;

  const isVideo = media === "video";
  const exampleId = decodeURIComponent(rawExampleId);

  const ctx = await buildNanoPageContext(locale, slug);
  const rawImages = ctx.reg.imagesByTemplateId.get(ctx.templateId) ?? [];

  const filtered = isVideo
    ? rawImages.filter((x) => Boolean(x.asset.video_url))
    : rawImages.filter((x) => !x.asset.video_url);

  if (filtered.length === 0) notFound();

  const idxInFiltered = filtered.findIndex((x) => x.id === exampleId);
  const fallbackIdx = rawImages.findIndex((x) => x.id === exampleId);

  // If the entry exampleId isn't in the filtered set, fall back to the unfiltered list
  // so the user lands on the example they clicked.
  const slidesSource =
    idxInFiltered === -1 && fallbackIdx !== -1 ? rawImages : filtered;
  const initialIndex =
    idxInFiltered !== -1
      ? idxInFiltered
      : fallbackIdx !== -1
      ? fallbackIdx
      : 0;

  // Per-slide data (title, category, params, topics)
  const slides = slidesSource.map((img) => {
    const example = getNanoExampleById(
      ctx.templateId,
      img.id,
      ctx.contentLocale
    );
    const { title, category } = example
      ? resolveLocalizedExampleCopy(example, ctx.contentLocale, ctx.localizedEntry)
      : { title: img.id, category: "" };

    const paramEntries = Object.fromEntries(
      Object.entries(img.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
    );

    return {
      id: img.id,
      title,
      category,
      templateId: img.template_id,
      imageUrl: img.asset.image_url,
      previewImageUrl: img.asset.preview_image_url,
      videoUrl: img.asset.video_url,
      params: paramEntries,
      topics: img.topics ?? [],
    };
  });

  // Template-level data (constant across slides in this carousel)
  const templateView = getTemplateView(ctx.reg, ctx.templateId, ctx.contentLocale);
  const templateTopics = templateView?.topics ?? [];
  const templateParameters = templateView?.parameters ?? [];
  const templateAllowGeneration = templateView?.allow_generation ?? false;
  const templateBatch = templateView?.batch ?? false;
  const basePrompt = templateView?.base_prompt ?? "";

  const existingExamples = rawImages.map((img) => ({
    id: img.id,
    params: img.params ?? {},
  }));

  return (
    <CarouselClient
      slides={slides}
      initialIndex={initialIndex}
      locale={locale}
      slug={slug}
      media={isVideo ? "video" : "image"}
      templateTopics={templateTopics}
      templateParameters={templateParameters}
      templateAllowGeneration={templateAllowGeneration}
      templateBatch={templateBatch}
      basePrompt={basePrompt}
      existingExamples={existingExamples}
      siteUrl={SITE_URL}
    />
  );
}
