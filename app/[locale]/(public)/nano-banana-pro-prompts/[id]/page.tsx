import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CdnImage from "../../../_components/CdnImage";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import { SITE_URL } from "@/lib/constants";
import { toAbsUrlMaybe, buildProPromptMetadata } from "@/lib/nano_seo_utils";

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
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/nano-banana-pro-prompts`}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Gallery
            </Link>

            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl py-4 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-6 py-4">
            <div className="relative flex h-96 w-full items-center justify-center bg-gray-50">
              <CdnImage
                src={imageUrl}
                alt={prompt.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="border-b border-gray-200 px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">
              {prompt.title}
            </h1>

            {prompt.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {prompt.description && (
            <div className="border-b border-gray-200 px-6 py-6">
              <h2 className="mb-3 text-lg font-medium text-gray-900">
                Description
              </h2>
              <p className="whitespace-pre-line text-gray-600">
                {prompt.description}
              </p>
            </div>
          )}

          <div className="px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Prompt</h2>

              <UnifiedActionBar
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
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap text-gray-800">
                {promptText}
              </pre>
            </div>
          </div>
        </article>

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