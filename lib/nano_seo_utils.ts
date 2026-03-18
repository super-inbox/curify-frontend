/**
 * nano_seo_utils.ts
 *
 * Shared SEO/metadata utilities for nano-template pages.
 * Updated to use:
 * - og_image from public/data/nano_templates.json
 * - title/category/description/content from messages/[locale]/nano.json
 * - fixed robots = index,follow
 */

import type { Metadata } from "next";
import nanoTemplates from "@/public/data/nano_templates.json";
import { CDN_BASE, SITE_URL } from "@/lib/constants";
import { SUPPORTED_LOCALES } from "@/lib/generated/locales";
// ─── Types ────────────────────────────────────────────────────────────────────

export type SeoContentSections = {
  what?: string;
  who?: string;
  how?: string[];
  prompts?: string[];
};

export type NanoLocaleMessageEntry = {
  title?: string;
  category?: string;
  description?: string;
  content?: {
    sections?: {
      what?: unknown;
      who?: unknown;
      how?: unknown;
      prompts?: unknown;
    };
  };
};

export type NanoMessagesDict = Record<string, NanoLocaleMessageEntry>;

export type NanoTemplateCore = {
  id: string;
  og_image?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize arbitrary values to string safely. */
export function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

/** Trim any value to a string, returning "" if empty/non-meaningful. */
export function normalizeText(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  return s;
}

/**
 * Normalize unknown input into a clean string array.
 * Supports:
 * - ["a", "b"]
 * - "single string" => ["single string"]
 * - anything else => []
 */
export function normalizeStringArray(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((x) => normalizeText(x)).filter(Boolean);
  }

  if (typeof v === "string") {
    const s = normalizeText(v);
    return s ? [s] : [];
  }

  return [];
}

/**
 * Convert a relative path to an absolute URL using CDN_BASE,
 * or return as-is if it's already absolute.
 */
export function toAbsUrlMaybe(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${CDN_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ─── Template core resolution ────────────────────────────────────────────────

/** Find the template core entry for a given templateId in nano_templates.json. */
export function resolveTemplateCore(templateId: string): NanoTemplateCore | null {
  const list = nanoTemplates as NanoTemplateCore[];
  if (!Array.isArray(list) || !list.length) return null;
  return list.find((t) => t.id === templateId) ?? null;
}

/**
 * Resolve localized nano message payload.
 * Prefers the exact templateId entry only.
 */
export function resolveLocaleMessage(
  templateId: string,
  nanoMessages: NanoMessagesDict | null | undefined
): NanoLocaleMessageEntry | null {
  if (!nanoMessages) return null;
  return nanoMessages[templateId] ?? null;
}

// ─── Metadata builders ────────────────────────────────────────────────────────

/**
 * Build the full Next.js Metadata object for the nano-template detail page.
 *
 * @param opts.templateId  - e.g. "template-battle"
 * @param opts.localeStr   - raw locale from params, e.g. "en"
 * @param opts.slug        - URL slug, e.g. "battle"
 * @param opts.nanoMessages - localized messages from messages/[locale]/nano.json
 * @param opts.fallbackTitle       - optional fallback when no localized title exists
 * @param opts.fallbackDescription - optional fallback when no localized description exists
 */
export function buildNanoTemplateMetadata(opts: {
  templateId: string;
  localeStr: string;
  slug: string;
  nanoMessages: NanoMessagesDict;
  fallbackTitle?: string;
  fallbackDescription?: string;
}): Metadata {
  const {
    templateId,
    localeStr,
    slug,
    nanoMessages,
    fallbackTitle = "Nano Banana Template | Curify AI",
    fallbackDescription = "",
  } = opts;

  const templateCore = resolveTemplateCore(templateId);
  const message = resolveLocaleMessage(templateId, nanoMessages);

  const canonicalUrl = `${SITE_URL}/${localeStr}/nano-template/${slug}`;

  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [
      locale,
      `${SITE_URL}/${locale}/nano-template/${slug}`,
    ])
  );

  const title = normalizeText(message?.title) || fallbackTitle;
  const description = normalizeText(message?.description) || fallbackDescription;
  const ogImage = toAbsUrlMaybe(templateCore?.og_image);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/en/nano-template/${slug}`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: "Curify",
      locale: localeStr,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/**
 * Derive the display H1 from the localized title by stripping the
 * "| Curify AI" suffix that's typically appended for search engines.
 */
export function buildNanoH1(title: string | undefined, fallback: string): string {
  const raw = normalizeText(title) || fallback;
  return raw.replace(/\s*[｜|]\s*Curify AI\s*$/i, "");
}

/**
 * Resolve localized template display fields.
 */
export function resolveNanoDisplayData(
  templateId: string,
  nanoMessages: NanoMessagesDict | null | undefined
): {
  title: string;
  category: string;
  description: string;
} {
  const message = resolveLocaleMessage(templateId, nanoMessages);

  return {
    title: normalizeText(message?.title),
    category: normalizeText(message?.category),
    description: normalizeText(message?.description),
  };
}

// ─── Pro-prompt metadata ──────────────────────────────────────────────────────

/** Locales supported by the nano-banana-pro-prompts section. */
export const PRO_PROMPT_LOCALES = [
  "en",
  "zh",
  "ja",
  "ko",
  "de",
  "es",
  "fr",
  "ru",
  "hi",
  "tr",
] as const;

export type ProPromptLocale = (typeof PRO_PROMPT_LOCALES)[number];

/**
 * Build a locale → absolute URL map for hreflang `<link rel="alternate">` tags.
 * The canonical locale ("en") is also set as "x-default".
 */
export function buildProPromptAlternates(
  buildUrl: (locale: string) => string
): Record<string, string> & { "x-default": string } {
  const canonical = buildUrl("en");
  return {
    ...Object.fromEntries(PRO_PROMPT_LOCALES.map((l) => [l, buildUrl(l)])),
    "x-default": canonical,
  };
}

export type ProPromptMetadataInput = {
  title: string;
  description: string;
  absoluteImageUrl: string;
  pageUrl: string;
  canonicalUrl: string;
  date?: string;
  author?: string;
  authorHandle?: string;
  keywords: string[];
};

/**
 * Build the full Next.js Metadata object for the nano-banana-pro-prompts
 * detail page, including hreflang alternates, author, keywords, and
 * article-typed OpenGraph.
 */
export function buildProPromptMetadata(
  input: ProPromptMetadataInput,
  buildUrl: (locale: string) => string
): Metadata {
  const {
    title,
    description,
    absoluteImageUrl,
    pageUrl,
    canonicalUrl,
    date,
    author,
    authorHandle,
    keywords,
  } = input;

  const fullTitle = `${title} | Nano Banana Pro Prompts`;

  return {
    metadataBase: new URL(SITE_URL),

    title: fullTitle,
    description,

    alternates: {
      canonical: canonicalUrl,
      languages: buildProPromptAlternates(buildUrl),
    },

    robots: { index: true, follow: true },

    authors: author
      ? [
          {
            name: author,
            url: authorHandle
              ? `https://x.com/${authorHandle.replace("@", "")}`
              : undefined,
          },
        ]
      : undefined,

    keywords,

    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      url: pageUrl,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: title }],
      publishedTime: date ? new Date(date).toISOString() : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteImageUrl],
    },
  };
}

/**
 * Normalize the content sections from the localized nano messages so callers
 * get ready-to-render, already-trimmed values.
 */
export function resolveContentSections(
  templateId: string,
  nanoMessages: NanoMessagesDict | null | undefined
): {
  h2What: string;
  h2Who: string;
  h2How: string[];
  h2Prompts: string[];
} {
  const sections = resolveLocaleMessage(templateId, nanoMessages)?.content?.sections;

  return {
    h2What: normalizeText(sections?.what),
    h2Who: normalizeText(sections?.who),
    h2How: normalizeStringArray(sections?.how),
    h2Prompts: normalizeStringArray(sections?.prompts),
  };
}

export function normalizeNanoLocaleMessageEntry(
  entry: unknown
): NanoLocaleMessageEntry {
  const obj =
    entry && typeof entry === "object"
      ? (entry as Record<string, unknown>)
      : {};

  const content =
    obj.content && typeof obj.content === "object"
      ? (obj.content as Record<string, unknown>)
      : {};

  const sections =
    content.sections && typeof content.sections === "object"
      ? (content.sections as Record<string, unknown>)
      : {};

  return {
    title: normalizeText(obj.title),
    category: normalizeText(obj.category),
    description: normalizeText(obj.description),
    content: {
      sections: {
        what: normalizeText(sections.what),
        who: normalizeText(sections.who),
        how: normalizeStringArray(sections.how),
        prompts: normalizeStringArray(sections.prompts),
      },
    },
  };
}