import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CdnImage from "../../../_components/CdnImage";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import { SITE_URL } from "@/lib/constants";
import { toAbsUrlMaybe, buildProPromptMetadata } from "@/lib/nano_seo_utils";

import { nanoPromptsService } from "@/services/nanoPrompts";
import { NanoPrompt, NanoPromptBase } from "@/types/nanoPrompts";

const DEFAULT_CONTENT_LOCALE = "en";

// ─── UI Types ────────────────────────────────────────────────────────────────

type PromptCardData = {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  image_url: string;
  tags: string[];
};

type PromptPageData = {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  image_url: string;
  tags: string[];
  related: PromptCardData[];

  // meta (optional / future-ready)
  author: string;
  author_handle?: string;
  date: string;
  category: string;
  source_url: string;
  source_type: string;
  likes: number;
  retweets: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildPromptUrl = (locale: string, id: string) =>
  `${SITE_URL}/${locale}/nano-banana-pro-prompts/${id}`;

const buildPromptPath = (locale: string, id: string) =>
  `/${locale}/nano-banana-pro-prompts/${id}`;

const getSourceBadgeClass = (sourceType: string): string => {
  const classes: Record<string, string> = {
    twitter: "bg-blue-100 text-blue-800",
    youtube: "bg-red-100 text-red-800",
    promptgather: "bg-purple-100 text-purple-800",
  };
  return classes[sourceType] ?? "bg-gray-100 text-gray-800";
};

const normalizeImageUrl = (raw: string | null | undefined): string => {
  if (!raw) return "/images/default-prompt-image.jpg";
  if (raw.includes("static/images/")) return raw.replace("/static/images/", "/images/");
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `/${raw}`;
};

// ─── Mapping Layer ───────────────────────────────────────────────────────────

function mapPromptCard(item: NanoPromptBase): PromptCardData {
  return {
    id: String(item.id),
    title: item.title || "Untitled Prompt",
    description: item.description || "",
    prompt_text: item.prompt || "",
    image_url: normalizeImageUrl(item.imageURL),
    tags: item.tags || [],
  };
}

function mapPromptDetail(item: NanoPrompt): PromptPageData {
  return {
    id: String(item.id),
    title: item.title || "Untitled Prompt",
    description: item.description || "",
    prompt_text: item.prompt || "",
    image_url: normalizeImageUrl(item.imageURL),
    tags: item.tags || [],
    related: Array.isArray(item.related)
      ? item.related.map(mapPromptCard)
      : [],

    // default meta (can upgrade later)
    author: "Anonymous",
    author_handle: undefined,
    date: new Date().toISOString().split("T")[0],
    category: item.tags?.[0] || "Uncategorized",
    source_url: "#",
    source_type: "unknown",
    likes: 0,
    retweets: 0,
  };
}

async function fetchPrompt(id: string): Promise<PromptPageData | null> {
  try {
    const prompt = await nanoPromptsService.getNanoPrompt(id);
    return mapPromptDetail(prompt);
  } catch (err) {
    console.error("Error fetching prompt:", err);
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

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

  const absoluteImageUrl =
    toAbsUrlMaybe(prompt.image_url) ??
    `${SITE_URL}/images/default-prompt-image.jpg`;

  return buildProPromptMetadata(
    {
      title: prompt.title,
      description:
        prompt.description ||
        prompt.prompt_text.slice(0, 160) ||
        "Creative AI prompt from Nano Banana.",
      absoluteImageUrl,
      pageUrl: buildPromptUrl(locale, id),
      canonicalUrl: buildPromptUrl(DEFAULT_CONTENT_LOCALE, id),
      date: prompt.date,
      author: prompt.author,
      authorHandle: prompt.author_handle,
      keywords: [
        "AI prompt",
        "Nano Banana",
        "prompt library",
        prompt.category,
      ].filter(Boolean),
    },
    (l) => buildPromptUrl(l, id)
  );
}

// ─── Components ──────────────────────────────────────────────────────────────

function RelatedPromptCard({
  prompt,
  locale,
}: {
  prompt: PromptCardData;
  locale: string;
}) {
  return (
    <Link
      href={buildPromptPath(locale, prompt.id)}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gray-50">
        <CdnImage
          src={prompt.image_url}
          alt={prompt.title}
          fill
          className="object-cover transition-transform group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {prompt.title}
        </h3>

        {prompt.description && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-600">
            {prompt.description}
          </p>
        )}

        {prompt.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const prompt = await fetchPrompt(id);

  if (!prompt) notFound();

  const canonicalUrl = buildPromptUrl(DEFAULT_CONTENT_LOCALE, prompt.id);
  const absoluteImageUrl =
    toAbsUrlMaybe(prompt.image_url) ??
    `${SITE_URL}/images/default-prompt-image.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: prompt.title,
    description:
      prompt.description ||
      prompt.prompt_text.slice(0, 200),
    image: [absoluteImageUrl],
    datePublished: new Date(prompt.date).toISOString(),
    author: {
      "@type": "Person",
      name: prompt.author,
    },
    genre: prompt.category,
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
              {new Date(prompt.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl py-6 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-lg bg-white shadow">
          {/* Image */}
          <div className="px-6 py-4">
            <div className="relative flex h-96 w-full items-center justify-center bg-gray-50">
              <CdnImage
                src={prompt.image_url}
                alt={prompt.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">
              {prompt.title}
            </h1>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getSourceBadgeClass(
                prompt.source_type
              )}`}
            >
              {prompt.source_type}
            </span>
          </div>

          {/* Description */}
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

          {/* Prompt */}
          <div className="px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Prompt
              </h2>

              <UnifiedActionBar
                tracking={{
                  contentId: prompt.id,
                  contentType: "nano_gallery",
                  viewMode: "cards",
                }}
                copy={{
                  enabled: true,
                  text: prompt.prompt_text,
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
                {prompt.prompt_text}
              </pre>
            </div>
          </div>
        </article>

        {/* Related */}
        {prompt.related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Related Images
            </h2>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {prompt.related.map((p) => (
                <RelatedPromptCard
                  key={p.id}
                  prompt={p}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}