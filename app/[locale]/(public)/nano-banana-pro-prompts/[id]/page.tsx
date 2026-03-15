// app/[locale]/nano-banana-pro-prompts/[id]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import path from "path";
import fs from "fs";
import { getTranslations } from "next-intl/server";
import CopyButton from "./CopyButton";
import CdnImage from "../../../_components/CdnImage";
import NanoTemplateDetailClient from "../../nano-template/[slug]/NanoTemplateDetailClient";
import { SITE_URL } from "@/lib/constants";
import { toAbsUrlMaybe, buildProPromptMetadata } from "@/lib/nano_seo_utils";
import {  
  buildNanoRegistry,
  buildNanoFeedCards,
  type RawTemplate,
  type RawNanoImageRecord,  
} from "@/lib/nano_utils";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { resolveContentLocale } from "@/lib/locale_utils";
import { Locale, makeSafeNanoTranslator } from "@/lib/locale_utils";
import PromptActionBar from "./PromptActionBar";
// ─── Types ────────────────────────────────────────────────────────────────────

interface JsonPrompt {
  id: number;
  title: string | null;
  description: string | null;
  promptText: string;
  author: string | null;
  authorHandle: string | null;
  date: string | null;
  category: string | null;
  sourceUrl: string | null;
  sourceType: string | null;
  imageUrl: string | null;
  likes: number | null;
  retweets: number | null;
}

interface JsonData {
  prompts: JsonPrompt[];
  metadata: {
    sources: string[];
    layoutCategories: Array<{ category: string; count: number }>;
    domainCategories: Array<{ category: string; count: number }>;
    total: number;
    lastUpdated: string;
  };
}

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
    const jsonPath = path.join(process.cwd(), "public", "data", "nanobanana.json");
    const data: JsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const p = data.prompts.find((p) => p.id.toString() === id);
    if (!p) return null;

    return {
      id: p.id.toString(),
      title: p.title || "Untitled Prompt",
      description: p.description || "",
      prompt_text: p.promptText || "",
      author: p.author || "Anonymous",
      author_handle: p.authorHandle ?? undefined,
      date: p.date || new Date().toISOString().split("T")[0],
      category: p.category || "Uncategorized",
      source_url: p.sourceUrl || "#",
      source_type: p.sourceType || "unknown",
      image_url: normalizeImageUrl(p.imageUrl),
      likes: p.likes ?? 0,
      retweets: p.retweets ?? 0,
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

  // ── Nano templates feed — identical to template page ──
  const reg = buildNanoRegistry(
    nanoTemplates as unknown as RawTemplate[],
    nanoImages as unknown as RawNanoImageRecord[]
  );
  const tNano = await getTranslations({ locale, namespace: "nano" });
  const translateNano = makeSafeNanoTranslator(tNano);

  const nanoCards = buildNanoFeedCards(reg, resolveContentLocale(locale) as Locale, {
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
          {/* Image */}
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

          {/* Title + source badge */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getSourceBadgeClass(prompt.source_type)}`}
            >
              {prompt.source_type}
            </span>
          </div>

          {/* Description */}
          {prompt.description && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{prompt.description}</p>
            </div>
          )}

          {/* Prompt text */}
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
              <pre className="whitespace-pre-wrap font-sans text-gray-800">{prompt.prompt_text}</pre>
            </div>
          </div>

          {/* Author / meta footer */}
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
            {prompt.category && (
              <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                {prompt.category}
              </span>
            )}
            {prompt.source_url && prompt.source_url !== "#" && (
              <a
                href={prompt.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-indigo-500 hover:text-indigo-700"
              >
                View source ↗
              </a>
            )}
          </div>
        </article>

        {/* ── Other templates — same component & data as template page ── */}
        <section className="mt-8">
          <NanoTemplateDetailClient
            locale={locale}
            template={{ template_id: "", base_prompt: "", parameters: [] }}
            otherNanoCards={nanoCards}
            showReproduce={false}
            showOtherTemplates={true}
          />
        </section>
      </main>
    </div>
  );
}
