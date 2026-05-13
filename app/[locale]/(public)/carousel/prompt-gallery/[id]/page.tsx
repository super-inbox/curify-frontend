import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CarouselClient from "../../CarouselClient";
import { nanoPromptsService } from "@/services/nanoPrompts";
import { SITE_URL } from "@/lib/constants";
import type { NanoPromptBase } from "@/types/nanoPrompts";

type PageParams = {
  locale: string;
  id: string;
};

// noindex + canonical to the prompt detail page. Mirrors the template-
// example carousel SEO posture.
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: {
      canonical: `/nano-banana-pro-prompts/${id}`,
    },
    robots: { index: false, follow: true },
  };
}

export default async function PromptGalleryCarouselPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, id: rawId } = await params;
  const targetId = decodeURIComponent(rawId);

  // Use the most-popular feed as the slide source. Keeps the UX consistent
  // with the gallery grid which lands users into the carousel; subsequent
  // slides are the same neighbors the user was browsing.
  let prompts: NanoPromptBase[] = [];
  try {
    prompts = await nanoPromptsService.getMostPopularNanoPrompts();
  } catch {
    prompts = [];
  }

  // Ensure the target prompt is in the slide set even if it's not in the
  // popular feed — fetch the single record and prepend it.
  let idxInList = prompts.findIndex((p) => String(p.id) === targetId);
  if (idxInList === -1) {
    try {
      const single = await nanoPromptsService.getNanoPrompt(targetId);
      if (single) {
        // Cast to the base shape used by the gallery row.
        prompts = [single as unknown as NanoPromptBase, ...prompts];
        idxInList = 0;
      }
    } catch {
      // fall through
    }
  }

  if (prompts.length === 0) notFound();

  const slides = prompts.map((p) => ({
    kind: "prompt-gallery" as const,
    id: p.id,
    title: p.title,
    imageUrl: p.imageURL,
    prompt: p.prompt,
    tags: p.tags ?? [],
  }));

  return (
    <CarouselClient
      mode="prompt-gallery"
      slides={slides}
      initialIndex={idxInList === -1 ? 0 : idxInList}
      locale={locale}
      siteUrl={SITE_URL}
    />
  );
}
