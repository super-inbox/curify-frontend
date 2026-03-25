// app/[locale]/nano-banana-pro-prompts/[id]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import CdnImage from "../../../_components/CdnImage";
import NanoTemplateDetailClient from "../../nano-template/[slug]/NanoTemplateDetailClient";
import { SITE_URL } from "@/lib/constants";
import { toAbsUrlMaybe, buildProPromptMetadata } from "@/lib/nano_seo_utils";
import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
} from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { resolveContentLocale } from "@/lib/locale_utils";
import { PageLocale, makeSafeNanoTranslator } from "@/lib/locale_utils";
import PromptActionBar from "./PromptActionBar";
import { nanoPromptsService } from "@/services/nanoPrompts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Prompt = {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  author: string;
  author_handle?: string;
  date: string;
  category: string;
  source_url: string;
  source_type: string;
  image_url: string;
  likes: number;
  retweets: number;
};

// ─── Constants & helpers ──────────────────────────────────────────────────────

const DEFAULT_CONTENT_LOCALE = "en";

const buildPromptUrl = (locale: string, id: string) =>
  `${SITE_URL}/${locale}/nano-banana-pro-prompts/${id}`;

const getSourceBadgeClass = (sourceType: string): string => {
  const classes: Record<string, string> = {
    twitter: "bg-blue-100 text-blue-800",
    youtube: "bg-red-100 text-red-800",
    promptgather: "bg-purple-100 text-purple-800",
  };
  return classes[sourceType] ?? "bg-gray-100 text-gray-800";
};

const normalizeImageUrl = (raw: string | null): string => {
  if (!raw) return "/images/default-prompt-image.jpg";
  if (raw.includes("static/images/")) return raw.replace("/static/images/", "/images/");
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchPrompt(id: string): Promise<Prompt | null> {
  try {
    const p = await nanoPromptsService.getNanoPrompt(id);
    return {
      id: p.id.toString(),
      title: p.title || "Untitled Prompt",
      description: p.description || "",
      prompt_text: p.prompt || "",
      author: "Anonymous",
      date: new Date().toISOString().split("T")[0],
      category: p.tags?.[0] || "Uncategorized",
      source_url: "#",
      source_type: "unknown",
      image_url: normalizeImageUrl(p.imageURL),
      likes: 0,
      retweets: 0,
    };
  } catch (err) {
    console.error("Error fetching prompt:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const prompt = await fetchPrompt(id);

  if (!prompt) {
    return { title: "Prompt Not Found", robots: { index: false, follow: false } };
  }

  const absoluteImageUrl =
    toAbsUrlMaybe(prompt.image_url) ?? `${SITE_URL}/images/default-prompt-image.jpg`;

  return buildProPromptMetadata(
    {
      title: prompt.title,
      description:
        prompt.description ||
        prompt.prompt_text.slice(0, 160) ||
        "Creative AI prompt from Nano Banana Pro Prompts.",
      absoluteImageUrl,
      pageUrl: buildPromptUrl(locale, id),
      canonicalUrl: buildPromptUrl(DEFAULT_CONTENT_LOCALE, id),
      date: prompt.date,
      author: prompt.author,
      authorHandle: prompt.author_handle,
      keywords: ["AI prompt", "Nano Banana", "prompt library", prompt.category, prompt.source_type].filter(Boolean),
    },
    (l) => buildPromptUrl(l, id)
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    toAbsUrlMaybe(prompt.image_url) ?? `${SITE_URL}/images/default-prompt-image.jpg`;

  const reg = buildNanoRegistry(
    nanoTemplates as unknown as RawTemplate[],
    nanoImages as unknown as RawNanoImageRecord[]
  );
  const tNano = await getTranslations({ locale, namespace: "nano" });
  const translateNano = makeSafeNanoTranslator(tNano);

  const nanoCards = buildNanoFeedCards(reg, resolveContentLocale(locale) as PageLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: prompt.title,
    description:
      prompt.description || prompt.prompt_text.slice(0, 200) || "AI prompt from Nano Banana Pro Prompts.",
    image: [absoluteImageUrl],
    datePublished: prompt.date ? new Date(prompt.date).toISOString() : undefined,
    author: prompt.author
      ? {
          "@type": "Person",
          name: prompt.author,
          identifier: prompt.author_handle ?? undefined,
          url: prompt.author_handle
            ? `https://x.com/${prompt.author_handle.replace("@", "")}`
            : undefined,
        }
      : undefined,
    genre: prompt.category || undefined,
    keywords: ["AI prompt", "Nano Banana", prompt.category, prompt.source_type].filter(Boolean),
    isBasedOn: prompt.source_url && prompt.source_url !== "#" ? prompt.source_url : undefined,
    publisher: { "@type": "Organization", name: "Curify", url: SITE_URL },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href={`/${locale}/nano-banana-pro-prompts`}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Gallery
            </Link>
            <span className="text-sm text-gray-500">
              {new Date(prompt.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <article className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-4">
            <div className="relative w-full h-96 bg-gray-50 flex items-center justify-center">
              <CdnImage
                src={prompt.image_url}
                alt={prompt.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getSourceBadgeClass(prompt.source_type)}`}
            >
              {prompt.source_type}
            </span>
          </div>

          {prompt.description && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{prompt.description}</p>
            </div>
          )}

          <div className="px-6 py-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-gray-900">Prompt</h2>
              <PromptActionBar
                promptId={prompt.id}
                promptText={prompt.prompt_text}
                pageUrl={buildPromptUrl(locale, prompt.id)}
                title={prompt.title}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {prompt.prompt_text}
              </pre>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>
              By{" "}
              {prompt.author_handle ? (
                <a
                  href={`https://x.com/${prompt.author_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {prompt.author}
                </a>
              ) : (
                <span className="font-medium text-gray-700">{prompt.author}</span>
              )}
            </span>
          </div>
        </article>
      </main>
    </div>
  );
}