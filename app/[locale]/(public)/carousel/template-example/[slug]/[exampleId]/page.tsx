import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CarouselClient from "../../../CarouselClient";
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
  // Optional context handed in by ExampleImagesGrid so the carousel
  // can mirror the grid the user clicked from:
  //   ids: comma-separated example IDs in the grid's display order
  //        (slides may span multiple templates)
  //   from: encoded pathname (+search) of the grid page; carousel
  //        close navigates here instead of the example detail page
  ids?: string;
  from?: string;
};

// noindex + canonical to the example detail page — the carousel is a UX
// surface for the same content, not a separate SEO target.
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, exampleId: rawExampleId } = await params;
  return {
    alternates: {
      canonical: `/nano-template/${slug}/example/${rawExampleId}`,
    },
    robots: { index: false, follow: true },
  };
}

export default async function TemplateExampleCarouselPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, slug, exampleId: rawExampleId } = await params;
  const { media, ids: idsParam, from } = await searchParams;

  const isVideo = media === "video";
  const exampleId = decodeURIComponent(rawExampleId);

  const ctx = await buildNanoPageContext(locale, slug);
  const templateImages = ctx.reg.imagesByTemplateId.get(ctx.templateId) ?? [];

  // Default ordering: every image of the entry template.
  // Grid-context ordering (when ?ids= is present): the exact IDs the
  // user just saw on the grid, in their order — even when the grid
  // spans multiple templates (search, /topics, blog embeds). Build a
  // cross-template lookup once and resolve each id against it.
  let slidesSource: typeof templateImages;
  if (idsParam) {
    const orderedIds = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allImages: typeof templateImages = [];
    for (const arr of ctx.reg.imagesByTemplateId.values()) {
      for (const img of arr) allImages.push(img);
    }
    const byId = new Map(allImages.map((img) => [img.id, img]));
    const resolved = orderedIds
      .map((id) => byId.get(id))
      .filter((img): img is (typeof templateImages)[number] => Boolean(img));
    // If somehow none of the ids resolved (stale URL?), fall back to
    // the template's own images.
    slidesSource = resolved.length > 0 ? resolved : templateImages;
  } else {
    slidesSource = templateImages;
  }

  const filtered = isVideo
    ? slidesSource.filter((x) => Boolean(x.asset.video_url))
    : slidesSource.filter((x) => !x.asset.video_url);

  if (filtered.length === 0) notFound();

  const idxInFiltered = filtered.findIndex((x) => x.id === exampleId);
  const fallbackIdx = slidesSource.findIndex((x) => x.id === exampleId);

  // If the entry exampleId isn't in the filtered set (e.g. media=image
  // but the clicked card had a video), fall back to the unfiltered list
  // so the user still lands on what they clicked.
  const finalSource =
    idxInFiltered === -1 && fallbackIdx !== -1 ? slidesSource : filtered;
  const initialIndex =
    idxInFiltered !== -1
      ? idxInFiltered
      : fallbackIdx !== -1
      ? fallbackIdx
      : 0;

  const slides = finalSource.map((img) => {
    const example = getNanoExampleById(
      img.template_id,
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
      kind: "template-example" as const,
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

  const templateView = getTemplateView(ctx.reg, ctx.templateId, ctx.contentLocale);
  const templateTopics = templateView?.topics ?? [];
  const templateParameters = templateView?.parameters ?? [];
  const templateAllowGeneration = templateView?.allow_generation ?? false;
  const templateBatch = templateView?.batch ?? false;
  const basePrompt = templateView?.base_prompt ?? "";

  const existingExamples = templateImages.map((img) => ({
    id: img.id,
    params: img.params ?? {},
  }));

  return (
    <CarouselClient
      mode="template-example"
      slides={slides}
      initialIndex={initialIndex}
      locale={locale}
      siteUrl={SITE_URL}
      slug={slug}
      media={isVideo ? "video" : "image"}
      templateTopics={templateTopics}
      templateParameters={templateParameters}
      templateAllowGeneration={templateAllowGeneration}
      templateBatch={templateBatch}
      basePrompt={basePrompt}
      existingExamples={existingExamples}
      closeHref={from ? decodeURIComponent(from) : undefined}
      gridIds={idsParam}
    />
  );
}
