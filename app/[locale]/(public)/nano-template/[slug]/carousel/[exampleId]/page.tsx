import { notFound } from "next/navigation";

import CarouselClient from "./CarouselClient";
import {
  buildNanoPageContext,
  getImageViewsForTemplate,
} from "@/lib/nano_page_data";

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
  const all = getImageViewsForTemplate(
    ctx.reg,
    ctx.templateId,
    ctx.contentLocale
  );

  const filtered = isVideo
    ? all.filter((x) => Boolean(x.video_url))
    : all.filter((x) => !x.video_url);

  if (filtered.length === 0) notFound();

  const idxInFiltered = filtered.findIndex((x) => x.id === exampleId);
  const fallbackIdx = all.findIndex((x) => x.id === exampleId);

  // If the entry exampleId isn't in the filtered set, fall back to the unfiltered list
  // so the user lands on the example they clicked.
  const slidesSource = idxInFiltered === -1 && fallbackIdx !== -1 ? all : filtered;
  const initialIndex =
    idxInFiltered !== -1
      ? idxInFiltered
      : fallbackIdx !== -1
      ? fallbackIdx
      : 0;

  const slides = slidesSource.map((s) => ({
    id: s.id,
    title: s.title ?? "",
    templateId: s.template_id,
    imageUrl: s.image_url,
    previewImageUrl: s.preview_image_url,
    videoUrl: s.video_url,
  }));

  return (
    <CarouselClient
      slides={slides}
      initialIndex={initialIndex}
      locale={locale}
      slug={slug}
      media={isVideo ? "video" : "image"}
    />
  );
}
