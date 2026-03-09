/**
 * nano_seo_utils.ts
 *
 * Shared SEO/metadata utilities for nano-template pages.
 * Extracted from NanoTemplatePage so both the template and example
 * detail pages can share the same resolution logic without duplication.
 */

import type { Metadata } from "next";
import nanoSeo from "@/public/data/nano_template_seo.json";
import { CDN_BASE, SITE_URL } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeoBlock = {
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  robots?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  schema?: any;
};

export type SeoContentSections = {
  what?: string;
  who?: string;
  how?: string[];
  prompts?: string[];
};

export type SeoLocalePayload = {
  seo?: SeoBlock;
  content?: {
    sections?: SeoContentSections;
  };
};

export type SeoTemplateEntry = {
  id: string;
  locales: Record<string, SeoLocalePayload>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize arbitrary values to string safely. */
export function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

/** Trim a value to a string, returning "" if falsy. */
export function normalizeText(s?: string): string {
  if (!s) return "";
  return String(s).trim();
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

/**
 * Parse a robots string like "index, follow" or "noindex, nofollow"
 * into Next.js Metadata robots shape.
 */
export function parseRobots(robots?: string): Metadata["robots"] | undefined {
  if (!robots) return undefined;
  const s = robots.toLowerCase().replace(/\s/g, "");
  const index = s.includes("noindex") ? false : s.includes("index") ? true : undefined;
  const follow = s.includes("nofollow") ? false : s.includes("follow") ? true : undefined;
  if (index === undefined && follow === undefined) return undefined;
  return { index, follow };
}

// ─── SEO JSON resolution ──────────────────────────────────────────────────────

/** Find the SEO entry for a given templateId in the JSON file. */
export function resolveSeoEntry(templateId: string): SeoTemplateEntry | null {
  const list = (nanoSeo as any)?.templates as SeoTemplateEntry[] | undefined;
  if (!list?.length) return null;
  return list.find((t) => t.id === templateId) ?? null;
}

/**
 * Resolve the locale-specific SEO payload for a template.
 * Prefers the exact locale, falls back to "en", then the first available locale.
 */
export function resolveSeoPayload(
  templateId: string,
  locale: string
): SeoLocalePayload | null {
  const entry = resolveSeoEntry(templateId);
  if (!entry) return null;

  const payload =
    entry.locales?.[locale] ??
    entry.locales?.["en"] ??
    Object.values(entry.locales || {})[0];

  return payload ?? null;
}

// ─── Metadata builders ────────────────────────────────────────────────────────

/**
 * Build the full Next.js Metadata object for the nano-template detail page.
 *
 * @param opts.templateId  - e.g. "template-battle-zh"
 * @param opts.locale      - normalized locale string, e.g. "en"
 * @param opts.localeStr   - raw locale from params (used in paths/OG locale)
 * @param opts.slug        - URL slug, e.g. "battle-zh"
 * @param opts.fallbackTitle       - used when no SEO meta_title is set
 * @param opts.fallbackDescription - used when no SEO meta_description is set
 */
export function buildNanoTemplateMetadata(opts: {
  templateId: string;
  locale: string;
  localeStr: string;
  slug: string;
  fallbackTitle: string;
  fallbackDescription: string;
}): Metadata {
  const { templateId, locale, localeStr, slug, fallbackTitle, fallbackDescription } = opts;

  const payload = resolveSeoPayload(templateId, locale);
  const seo = payload?.seo;

  const canonicalPath = `/${localeStr}/nano-template/${slug}`;

  const title = normalizeText(seo?.meta_title) || fallbackTitle;
  const description = normalizeText(seo?.meta_description) || fallbackDescription;
  const ogImage = toAbsUrlMaybe(seo?.og_image);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: parseRobots(seo?.robots) || { index: true, follow: true },
    openGraph: {
      type: (seo?.og_type as any) || "website",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: `${SITE_URL}${canonicalPath}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: "Curify",
      locale: localeStr,
    },
    twitter: {
      card: (seo?.twitter_card as any) || "summary_large_image",
      title: seo?.twitter_title || title,
      description: seo?.twitter_description || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/**
 * Derive the display H1 from the SEO meta_title by stripping the
 * "| Curify AI" suffix that's typically appended for search engines.
 */
export function buildNanoH1(seoMetaTitle: string | undefined, fallback: string): string {
  const raw = normalizeText(seoMetaTitle) || fallback;
  return raw.replace(/\s*[｜|]\s*Curify AI\s*$/i, "");
}

// ─── Pro-prompt metadata ──────────────────────────────────────────────────────

/** Locales supported by the nano-banana-pro-prompts section. */
export const PRO_PROMPT_LOCALES = [
  "en", "zh", "ja", "ko", "de", "es", "fr", "ru", "hi", "tr",
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
  /** Resolved prompt title — used in `<title>` and OG/Twitter tags. */
  title: string;
  /** Short description or first 160 chars of prompt text. */
  description: string;
  /** Absolute image URL (already resolved to https://…). */
  absoluteImageUrl: string;
  /** Page URL for the current locale. */
  pageUrl: string;
  /** Canonical URL (always the "en" locale URL). */
  canonicalUrl: string;
  /** ISO date string, or undefined. */
  date?: string;
  /** Author display name, or undefined. */
  author?: string;
  /** Author handle (e.g. "@foo"), or undefined. */
  authorHandle?: string;
  /** Prompt category, source type, etc. — filtered for falsiness by the caller. */
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
 * Normalize the content sections from the SEO payload so callers
 * get ready-to-render, already-trimmed values.
 */
export function resolveContentSections(payload: SeoLocalePayload | null): {
  h2What: string;
  h2Who: string;
  h2How: string[];
  h2Prompts: string[];
} {
  const sections = payload?.content?.sections;
  return {
    h2What: normalizeText(sections?.what),
    h2Who: normalizeText(sections?.who),
    h2How: (sections?.how ?? []).map((x) => normalizeText(x)).filter(Boolean),
    h2Prompts: (sections?.prompts ?? []).map((x) => normalizeText(x)).filter(Boolean),
  };
}