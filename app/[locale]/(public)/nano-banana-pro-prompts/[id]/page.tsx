import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getCanonicalPath } from "@/lib/canonical";
import { toAbsUrlMaybe, buildProPromptMetadata } from "@/lib/nano_seo_utils";
import PromptTagChips from "./PromptTagChips";
import GalleryReproduceSurface from "./GalleryReproduceSurface";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPrompt } from "@/types/nanoPrompts";
import PromptCard from "../PromptCard";
import { resolveContentLocale, makeSafeTranslator } from "@/lib/locale_utils";
import { getTopicsForTag, getTemplatesForTopic } from "@/lib/topicRegistry";
import { getRelatedTagsForPrompt } from "@/lib/relatedTags";
import { nanoRegistry } from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import RelatedTagsSection from "@/app/[locale]/_components/RelatedTagsSection";

const TEMPLATE_CARDS_CAP = 30;

// Cache the prompt detail page for 4 hours with ISR. Prompts rarely
// change and the page does a backend fetch per render, so caching
// keeps Vercel execution time and Azure API load down — particularly
// useful against bot crawls.
export const revalidate = 14400;

const DEFAULT_CONTENT_LOCALE = "en";

const buildPromptPath = (locale: string, id: number | string) =>
  getCanonicalPath(locale, `/nano-banana-pro-prompts/${id}`);

const normalizeImageUrl = (raw: string | null | undefined): string => {
  if (!raw) return "/images/default-prompt-image.jpg";
  if (raw.includes("static/images/")) {
    return raw.replace("/static/images/", "/images/");
  }
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `/${raw}`;
};

async function fetchPrompt(id: string): Promise<NanoPrompt | null> {
  try {
    return await nanoPromptsService.getNanoPrompt(id);
  } catch (err) {
    console.error("Error fetching prompt:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const prompt = await fetchPrompt(id);

  if (!prompt) {
    return {
      title: "Prompt Not Found",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = normalizeImageUrl(prompt.imageURL);
  const promptText = prompt.prompt;

  const absoluteImageUrl =
    toAbsUrlMaybe(imageUrl) ?? "/images/default-prompt-image.jpg";

  return buildProPromptMetadata(
    {
      title: prompt.title,
      description:
        prompt.description ||
        promptText.slice(0, 160) ||
        "Creative AI prompt from Nano Banana.",
      absoluteImageUrl,
      pageUrl: buildPromptPath(locale, prompt.id),
      canonicalUrl: buildPromptPath(DEFAULT_CONTENT_LOCALE, prompt.id),
      date: new Date().toISOString().split("T")[0],
      author: "Anonymous",
      keywords: [
        "AI prompt",
        "Nano Banana",
        "prompt library",
        ...prompt.tags,
      ].filter(Boolean),
      locale,
    },
    (l) => buildPromptPath(l, prompt.id)
  );
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const prompt = await fetchPrompt(id);

  if (!prompt) notFound();

  const imageUrl = normalizeImageUrl(prompt.imageURL);
  // Absolute URL for the backend to fetch as the image2image reference when a
  // production tile transforms the source image (server can't resolve a
  // relative CDN path).
  const absoluteImageUrl =
    toAbsUrlMaybe(imageUrl) ?? "/images/default-prompt-image.jpg";
  const promptText = prompt.prompt;

  const canonicalPath = buildPromptPath(DEFAULT_CONTENT_LOCALE, prompt.id);

  const related = Array.isArray(prompt.related) ? prompt.related : [];

  // Reverse-map: gather Tier-1 topics from this prompt's tags, then pull
  // templates touching those topics. Same shape as the tag page section.
  // Prompts whose tags don't appear in TOPIC_GALLERY_TAG skip the section.
  const contentLocale = resolveContentLocale(locale);
  const promptTags = Array.isArray(prompt.tags) ? prompt.tags : [];
  const mappedTopics = new Set<string>();
  for (const tag of promptTags) {
    for (const t of getTopicsForTag(tag)) mappedTopics.add(t);
  }
  let templateCards: ReturnType<typeof buildNanoFeedCards> = [];
  if (mappedTopics.size > 0) {
    const allowed = new Set<string>();
    for (const topicId of mappedTopics) {
      for (const t of getTemplatesForTopic(topicId)) allowed.add(t.id);
    }
    if (allowed.size > 0) {
      const tNano = await getTranslations({ locale, namespace: "nano" });
      const translateNano = makeSafeTranslator(tNano);
      const all = buildNanoFeedCards(nanoRegistry, contentLocale, {
        perTemplateMaxImages: 2,
        strictLocale: false,
        translate: translateNano,
        limit: 200,
      });
      templateCards = all
        .filter((c) => allowed.has(c.template_id))
        .slice(0, TEMPLATE_CARDS_CAP);
    }
  }

  const nextPrompt = related.length > 0 ? related[0] : null;
  const prevPrompt = related.length > 1 ? related[related.length - 1] : null;

  const prevNext =
    nextPrompt || prevPrompt
      ? {
          prev: {
            href: buildPromptPath(
              locale,
              prevPrompt?.id ?? nextPrompt!.id
            ),
            label: prevPrompt?.title || "Previous",
          },
          next: {
            href: buildPromptPath(
              locale,
              nextPrompt?.id ?? prevPrompt!.id
            ),
            label: nextPrompt?.title || "Next",
          },
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": canonicalPath,
    url: canonicalPath,
    name: prompt.title,
    description: prompt.description || promptText.slice(0, 200),
    image: [imageUrl],
    datePublished: new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Anonymous",
    },
    genre: prompt.tags[0] || "AI Prompt",
    keywords: prompt.tags,
    publisher: {
      "@type": "Organization",
      name: "Curify",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href={getCanonicalPath(locale)} className="hover:text-neutral-800">
            Home
          </Link>
          <span>/</span>
          <Link
            href={getCanonicalPath(locale, "/nano-banana-pro-prompts")}
            className="hover:text-neutral-800"
          >
            Nano Banana Prompts
          </Link>
          <span>/</span>
          <span className="line-clamp-1 font-medium text-neutral-800">
            {prompt.title}
          </span>
        </nav>

        {/* Header — H1 + tag chips */}
        <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
            {prompt.title}
          </h1>
          <PromptTagChips tags={prompt.tags} locale={locale} size="small" />
        </header>

        {/* Unified reproduce surface — Source · Make-it-yours · Production
            tiles, full width (the old "More like this" right rail is removed;
            related images below now run full width from the first item). All
            generations ride the freeform pipeline (NANO_FREEFORM_GENERATION)
            and land in the user's workspace. */}
        <GalleryReproduceSurface
          locale={locale}
          promptId={prompt.id}
          initialPrompt={promptText}
          sourceImageUrl={imageUrl}
          sourceReferenceUrl={absoluteImageUrl}
          sourceImageAlt={prompt.title}
          copyText={promptText}
          shareUrl={buildPromptPath(locale, prompt.id)}
          title={prompt.title}
        />

        {/* Prev / next within the related set — kept for crawl + navigation
            now that the hero's overlay arrows are gone. */}
        {prevNext && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link
              href={prevNext.prev.href}
              className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              ← Prev
            </Link>
            <Link
              href={prevNext.next.href}
              className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Next →
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Related Images
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          </section>
        )}

        {templateCards.length > 0 && (
          <section className="mt-12">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-neutral-900">
                Related Templates
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Generate your own prompts in these template formats.
              </p>
            </div>
            <NanoTemplateDetailClient
              locale={locale}
              otherNanoCards={templateCards}
              showReproduce={false}
              showOtherTemplates={true}
              showOtherTemplateTitle={false}
            />
          </section>
        )}

        <RelatedTagsSection
          tags={getRelatedTagsForPrompt(promptTags, { limit: 12, liveOnly: true })}
          locale={locale}
          title="Related Tags"
          subtitle="Tags from the same category clusters as this prompt."
        />
      </main>
    </div>
  );
}