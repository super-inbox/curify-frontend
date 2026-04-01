import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CdnImage from "../../../_components/CdnImage";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import ExamplePromptHero from "@/app/[locale]/_components/ExamplePromptHero";
import { SITE_URL } from "@/lib/constants";
import { toAbsUrlMaybe, buildProPromptMetadata } from "@/lib/nano_seo_utils";
import PromptTagChips from "./PromptTagChips";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPrompt } from "@/types/nanoPrompts";
import PromptCard from "../PromptCard";

const DEFAULT_CONTENT_LOCALE = "en";

const buildPromptUrl = (locale: string, id: number | string) =>
  `${SITE_URL}/${locale}/nano-banana-pro-prompts/${id}`;

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
    toAbsUrlMaybe(imageUrl) ??
    `${SITE_URL}/images/default-prompt-image.jpg`;

  return buildProPromptMetadata(
    {
      title: prompt.title,
      description:
        prompt.description ||
        promptText.slice(0, 160) ||
        "Creative AI prompt from Nano Banana.",
      absoluteImageUrl,
      pageUrl: buildPromptUrl(locale, prompt.id),
      canonicalUrl: buildPromptUrl(DEFAULT_CONTENT_LOCALE, prompt.id),
      date: new Date().toISOString().split("T")[0],
      author: "Anonymous",
      keywords: [
        "AI prompt",
        "Nano Banana",
        "prompt library",
        ...prompt.tags,
      ].filter(Boolean),
    },
    (l) => buildPromptUrl(l, prompt.id)
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
  const promptText = prompt.prompt;

  const canonicalUrl = buildPromptUrl(DEFAULT_CONTENT_LOCALE, prompt.id);
  const absoluteImageUrl =
    toAbsUrlMaybe(imageUrl) ??
    `${SITE_URL}/images/default-prompt-image.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: prompt.title,
    description: prompt.description || promptText.slice(0, 200),
    image: [absoluteImageUrl],
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
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ExamplePromptHero
          title={prompt.title}
          prompt={promptText}
          promptVariant="preview"
          description={prompt.description || undefined}
          breadcrumbs={[
            {
              label: "Home",
              href: `/${locale}`,
            },
            {
              label: "Nano Banana Prompts",
              href: `/${locale}/nano-banana-pro-prompts`,
            },
            {
              label: prompt.title,
            },
          ]}
          metaChips={<PromptTagChips tags={prompt.tags} locale={locale} size="small" />}
          image={
            <div className="relative h-full min-h-[360px] w-full lg:min-h-0">
              <CdnImage
                src={imageUrl}
                alt={prompt.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          }
          actionBar={
            <UnifiedActionBar
              className="pt-2"
              tracking={{
                contentId: String(prompt.id),
                contentType: "nano_gallery",
                viewMode: "cards",
              }}
              copy={{
                enabled: true,
                text: promptText,
              }}
              share={{
                enabled: true,
                url: buildPromptUrl(locale, prompt.id),
                title: prompt.title,
              }}
            />
          }
        />

        {prompt.related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Related Images
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prompt.related.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}