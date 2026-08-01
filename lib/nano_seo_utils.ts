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
import { getCanonicalUrl } from "@/lib/canonical";
import {
  resolveVerticalForTopics,
  type VerticalSchema,
} from "@/lib/vertical_schema";
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
    // VerticalPageSchema v1 — Pillar 2 (ontology values → chip strip + schema.org)
    // and Pillar 1 authored knowledge slots. Both are flat string maps keyed by the
    // vertical schema's attribute/knowledge-slot keys. See lib/vertical_schema.ts.
    // Template-level: applies to the template page AND (as a fallback) every example.
    attributes?: Record<string, unknown>;
    vertical?: Record<string, unknown>;
    // Example-level overrides — same shape, keyed by example id (the image id,
    // e.g. "template-mbti-nba-erling-haaland"). Merged over the template-level
    // maps (example wins) by resolveExampleVerticalSections so a specific
    // high-SEO example page can carry its own type code / knowledge.
    examples?: Record<
      string,
      { attributes?: Record<string, unknown>; vertical?: Record<string, unknown> }
    >;
  };
};

export type NanoMessagesDict = Record<string, NanoLocaleMessageEntry>;

export type NanoTemplateCore = {
  id: string;
  og_image?: string;
  locales?: Record<string, unknown>;
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

  const path = `/nano-template/${slug}`;

  // Templates only have content in the locales listed under `locales`
  // in nano_templates.json (typically just "en", sometimes "en"+"zh").
  // Pages rendered for any other locale fall back to that content,
  // producing identical output across many URLs — Google then flags them
  // as "Duplicate without user-selected canonical". To prevent that:
  //   - hreflang lists ONLY the localized locales (not all 10)
  //   - locales without their own content canonical to the primary one
  //     and are noindex'd
  const localizedLocales = (
    templateCore?.locales ? Object.keys(templateCore.locales) : ["en"]
  ).filter((l) => SUPPORTED_LOCALES.includes(l as (typeof SUPPORTED_LOCALES)[number]));
  const primaryLocale = localizedLocales.includes("en")
    ? "en"
    : localizedLocales[0] ?? "en";
  const isLocalized = localizedLocales.includes(localeStr);

  const canonicalUrl = isLocalized
    ? getCanonicalUrl(localeStr, path)
    : getCanonicalUrl(primaryLocale, path);

  const languages = Object.fromEntries(
    localizedLocales.map((locale) => [locale, getCanonicalUrl(locale, path)])
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
        "x-default": getCanonicalUrl(primaryLocale, path),
      },
    },
    robots: isLocalized
      ? { index: true, follow: true }
      : { index: false, follow: true },
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
 * Derive the display H1 from the localized title. Strips the SEO-only
 * decorations that belong in the <title> tag but read as jargon in the
 * visible heading: the leading "Nano Banana Prompt:" prefix (English, the
 * French "Prompt :" spacing variant, and the Hindi translation) and the
 * trailing "| Curify AI" suffix. The <title> meta tag keeps the full string,
 * so the "nano banana" keyword is retained where it matters for SEO.
 */
export function buildNanoH1(title: string | undefined, fallback: string): string {
  const raw = normalizeText(title) || fallback;
  const cleaned = raw
    .replace(/^\s*(?:Nano Banana Prompt|नैनो बनाना प्रॉम्प्ट)\s*[:：]\s*/i, "")
    .replace(/\s*[｜|]\s*(?:Curify AI|क्यूरिफाई एआई)\s*$/i, "");
  // Never return an empty heading if a title was somehow only decorations.
  return cleaned.trim() || normalizeText(title) || fallback;
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
  /** Current page locale; used to noindex non-en variants (prompts are en-only). */
  locale?: string;
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
    locale,
  } = input;

  const fullTitle = `${title} | Nano Banana Pro Prompts`;

  // Prompt content (title/description/promptText) is en-only — even when
  // rendered under /zh/, /de/, etc., the body is the same English text.
  // Noindex non-en locales so they don't show up as "Crawled - not
  // indexed" duplicates competing with the en canonical.
  const isCanonicalLocale = !locale || locale === "en";

  return {
    metadataBase: new URL(SITE_URL),

    title: fullTitle,
    description,

    alternates: {
      canonical: canonicalUrl,
      // Hreflang only points to the en canonical — there are no real
      // localized variants to alternate between.
      languages: { en: buildUrl("en"), "x-default": buildUrl("en") },
    },

    robots: isCanonicalLocale
      ? { index: true, follow: true }
      : { index: false, follow: true },

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

// ─── VerticalPageSchema v1 (Pillars 1 & 2) ──────────────────────────────────────

export type ResolvedVerticalPage = {
  schema: VerticalSchema;
  /** ontology values present for this page → chip strip + JSON-LD (Pillar 2) */
  attributes: { key: string; label: string; value: string; facet: boolean }[];
  /** authored knowledge specific to THIS example (player / reading card). */
  knowledge: { key: string; label: string; text: string }[];
  /** authored knowledge shared by the MBTI type / HSK level this example belongs
   *  to (the middle tier). Rendered as a distinct "About the {groupLabel}"
   *  section so type/level facts aren't duplicated as if example-specific. */
  groupKnowledge: { key: string; label: string; text: string }[];
  /** display label for the group tier, e.g. "ISFP · The Adventurer" or "HSK 2". */
  groupLabel?: string;
};

function buildAttributes(
  schema: NonNullable<ReturnType<typeof resolveVerticalForTopics>>,
  attrVals: Record<string, string>
) {
  return schema.attributes
    .map((a) => ({ key: a.key, label: a.label, value: normalizeText(attrVals[a.key]), facet: !!a.facet }))
    .filter((a) => a.value);
}

function buildKnowledge(
  schema: NonNullable<ReturnType<typeof resolveVerticalForTopics>>,
  vertVals: Record<string, string>
) {
  return schema.knowledgeSlots
    .map((k) => ({ key: k.key, label: k.label, text: normalizeText(vertVals[k.key]) }))
    .filter((k) => k.text);
}

/**
 * Derive the type/level group key for an example (the middle tier between
 * template and example). MBTI → the character's `type_code` (ISFP, ENTJ, …);
 * HSK → the reading card's level parsed from its id (hsk1/2/3/4). Group content
 * is authored ONCE per key under `__vgroup:<key>` in nano.json and inherited by
 * every example of that type/level. Returns null when no group applies.
 */
export function deriveVGroupKey(
  templateId: string,
  exampleId: string,
  exAttrs: Record<string, unknown> | undefined
): string | null {
  const tc = exAttrs?.type_code;
  if (typeof tc === "string" && tc.trim()) return `mbti:${tc.trim().toUpperCase()}`;
  if (/hsk/i.test(templateId)) {
    const m = /hsk-?(\d)/i.exec(exampleId);
    if (m) return `hsk:${m[1]}`;
  }
  return null;
}

/**
 * Resolve the vertical domain-knowledge layer for a template page: route it to a
 * vertical by `topics`, then join the schema's field defs with the per-locale
 * `content.attributes` / `content.vertical` values from nano.json. Returns null when
 * the template is in no vertical OR has no authored vertical values yet (page renders
 * unchanged — safe to roll out incrementally over the pilot cohort).
 */
function buildResolvedVertical(
  schema: NonNullable<ReturnType<typeof resolveVerticalForTopics>>,
  attrVals: Record<string, string>,
  vertVals: Record<string, string>
): ResolvedVerticalPage | null {
  const attributes = buildAttributes(schema, attrVals);
  const knowledge = buildKnowledge(schema, vertVals);
  if (attributes.length === 0 && knowledge.length === 0) return null;
  return { schema, attributes, knowledge, groupKnowledge: [] };
}

export function resolveVerticalSections(
  templateId: string,
  topics: string[] | undefined | null,
  nanoMessages: NanoMessagesDict | null | undefined
): ResolvedVerticalPage | null {
  const schema = resolveVerticalForTopics(topics);
  if (!schema) return null;

  const content = resolveLocaleMessage(templateId, nanoMessages)?.content;
  return buildResolvedVertical(
    schema,
    (content?.attributes ?? {}) as Record<string, string>,
    (content?.vertical ?? {}) as Record<string, string>
  );
}

/**
 * Example-page variant: same as resolveVerticalSections but merges the
 * example-specific `content.examples[exampleId]` overrides ON TOP of the
 * template-level maps (example wins). Lets a specific high-SEO example page
 * (e.g. an MBTI character with strong impressions) carry its own type code and
 * authored knowledge while unenriched examples of the same template render
 * unchanged. Returns null when neither level has authored values.
 */
export function resolveExampleVerticalSections(
  templateId: string,
  exampleId: string,
  topics: string[] | undefined | null,
  nanoMessages: NanoMessagesDict | null | undefined
): ResolvedVerticalPage | null {
  const schema = resolveVerticalForTopics(topics);
  if (!schema) return null;

  const content = resolveLocaleMessage(templateId, nanoMessages)?.content;
  const ex = content?.examples?.[exampleId];

  // Middle tier: the MBTI type / HSK level this example belongs to. Authored
  // once under `__vgroup:<key>` and shared by all examples of that type/level.
  const groupKey = deriveVGroupKey(
    templateId,
    exampleId,
    (ex?.attributes ?? {}) as Record<string, unknown>
  );
  const groupContent = groupKey
    ? (resolveLocaleMessage(`__vgroup:${groupKey}`, nanoMessages)?.content as
        | { attributes?: Record<string, string>; vertical?: Record<string, string>; label?: string }
        | undefined)
    : undefined;

  // Attributes (profile rows): template → group → example (example wins).
  const attrVals = {
    ...((content?.attributes ?? {}) as Record<string, string>),
    ...((groupContent?.attributes ?? {}) as Record<string, string>),
    ...((ex?.attributes ?? {}) as Record<string, string>),
  };
  // Knowledge stays SPLIT: group tier (type/level) vs example (player/card), so
  // the shared type/level facts render in their own section, not as if unique.
  const groupVertVals = {
    ...((content?.vertical ?? {}) as Record<string, string>),
    ...((groupContent?.vertical ?? {}) as Record<string, string>),
  };
  const exVertVals = { ...((ex?.vertical ?? {}) as Record<string, string>) };

  const attributes = buildAttributes(schema, attrVals);
  const knowledge = buildKnowledge(schema, exVertVals);
  const groupKnowledge = buildKnowledge(schema, groupVertVals);
  if (attributes.length === 0 && knowledge.length === 0 && groupKnowledge.length === 0) {
    return null;
  }

  const groupLabel =
    normalizeText(groupContent?.label) ||
    normalizeText(attrVals.type_code) ||
    normalizeText(attrVals.grade_band) ||
    undefined;

  return { schema, attributes, knowledge, groupKnowledge, groupLabel };
}

/**
 * schema.org JSON-LD for a vertical page. Uses the vertical's @type and maps the
 * best-fit ontology fields to native schema.org properties, exposing the full
 * ontology as `additionalProperty` PropertyValue[] (the rich-result unlock the flat
 * pages can't earn). Returns null when there's nothing to emit.
 */
export function buildVerticalJsonLd(
  resolved: ResolvedVerticalPage | null,
  opts: { name: string; description?: string; url: string; image?: string }
): Record<string, unknown> | null {
  if (!resolved) return null;
  const { schema, attributes } = resolved;
  const val = (k: string) => attributes.find((a) => a.key === k)?.value;

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schema.schemaOrgType,
    name: opts.name,
    url: opts.url,
  };
  if (opts.description) node.description = opts.description;
  if (opts.image) node.image = opts.image;

  if (schema.id === "education") {
    if (val("resource_type")) node.learningResourceType = val("resource_type");
    if (val("grade_band")) node.educationalLevel = val("grade_band");
    if (val("age_range")) node.typicalAgeRange = val("age_range");
    if (val("subject")) node.about = val("subject");
    const teaches = resolved.knowledge.find((k) => k.key === "learning_objective")?.text;
    if (teaches) node.teaches = teaches;
    if (val("duration_min")) node.timeRequired = `PT${String(val("duration_min")).replace(/\D/g, "")}M`;
  } else if (schema.id === "merch") {
    if (val("material")) node.material = val("material");
    if (val("product_type")) node.category = val("product_type");
  } else if (schema.id === "mbti") {
    if (val("type_code")) node.about = val("type_code");
  }

  node.additionalProperty = attributes.map((a) => ({
    "@type": "PropertyValue",
    name: a.label,
    value: a.value,
  }));
  return node;
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

  const normStringMap = (v: unknown): Record<string, string> => {
    if (!v || typeof v !== "object") return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const s = normalizeText(val);
      if (s) out[k] = s;
    }
    return out;
  };

  // Example-level overrides (content.examples[exampleId].{attributes,vertical}).
  // Whitelisted through here so resolveExampleVerticalSections can read them.
  const normExamples = (
    v: unknown
  ): Record<string, { attributes: Record<string, string>; vertical: Record<string, string> }> | undefined => {
    if (!v || typeof v !== "object") return undefined;
    const out: Record<string, { attributes: Record<string, string>; vertical: Record<string, string> }> = {};
    for (const [id, ex] of Object.entries(v as Record<string, unknown>)) {
      if (!ex || typeof ex !== "object") continue;
      const e = ex as Record<string, unknown>;
      const attributes = normStringMap(e.attributes);
      const vertical = normStringMap(e.vertical);
      if (Object.keys(attributes).length || Object.keys(vertical).length) {
        out[id] = { attributes, vertical };
      }
    }
    return Object.keys(out).length ? out : undefined;
  };

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
      attributes: normStringMap(content.attributes),
      vertical: normStringMap(content.vertical),
      examples: normExamples(content.examples),
    },
  };
}