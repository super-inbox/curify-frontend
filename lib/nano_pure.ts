// Client-safe nano helpers + types. This module deliberately imports NO data
// (no nano_inspiration.json / nano_templates.json). Client components must
// import the pure functions and types from HERE, not from nano_utils.ts —
// importing nano_utils drags the ~4MB JSON registry into the client bundle
// (it shipped on every public page via the shared layout, driving Vercel Fast
// Data Transfer). nano_utils.ts re-exports everything below for server callers
// and is marked `server-only` so a regression fails the build.
import { SUPPORTED_LOCALES } from "./generated/locales";
import { PageLocale } from "@/lib/locale_utils";

export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "language_pair";
  placeholder?: string;
  options?: string[];
};

export type RawTemplate = {
  id: string;
  topics?: string | string[];
  /** Curated editorial intent — persona slugs this template surfaces on
   *  (e.g. ["for-creators", "for-designers"]). When present, overrides
   *  the topic-derived fallback in getUseCasesForTopics. Optional;
   *  ~half the catalog is currently untagged and still uses topic
   *  derivation. */
  use_cases?: string[];
  rank_score?: number;
  batch?: boolean;
  allow_generation?: boolean;
  requires_image_upload?: boolean;
  /** Reference-input mode: "none" (text-only) | "optional" (text/image/both) |
   *  "required" (must upload). Source of truth for the reproduce upload UI. */
  image_input?: "none" | "optional" | "required";
  /** Explicit override for example-page indexing (see lib/example_indexing).
   *  Absent → derived from topics (info-heavy → index, generator-demo → noindex).
   *  Set to true/false only to override the topic-derived default per template. */
  index_examples?: boolean;
  /** "creation" (default, absent) vs "consumption" — gates UI for templates
   *  the operator publishes for viewing rather than user-driven generation
   *  (daily recaps, news cards, scheduled standings). See memory
   *  feedback_creation_vs_consumption_templates.md. */
  archetype?: "creation" | "consumption";

  /** Template-level intro/demo video (relative CDN path, e.g.
   *  "/video/template_intro/template-herbal.mp4"). ~109 templates carry one;
   *  surfaced as a zero-cost "Watch video" tile in the column-3 workbench. */
  intro_video_url?: string;

  locales?: Partial<
    Record<
    PageLocale,
      {
        base_prompt: string;
        parameters: TemplateParameter[];
      }
    >
  >;

  cards?: Array<{ image_id: string; params: Record<string, any> }>;
};

export type RawNanoImageRecord = {
  id: string;
  template_id: string;

  asset: {
    image_url: string;
    preview_image_url: string;
    audio_url?: string;
    video_url?: string;
  };

  params: Record<string, any>;
  locales?: Partial<Record<PageLocale, { category?: string; title?: string }>>;
  topics?: string[];
  tags?: string[];
  /**
   * When true, this example renders with locale-specific
   * title/description/metaDescription from messages/<locale>/example.json
   * for all 10 locales, and gets a full 10-locale entry in the sitemap.
   * When false / absent, the example uses template-level i18n fallback and
   * non-en/zh locale renders are noindex'd to avoid thin-content penalties.
   */
  allow_i18n?: boolean;
};

export type TemplateView = {
  template_id: string;
  slug: string;
  locale: PageLocale;
  category: string;
  description: string;
  topics: string[];
  use_cases: string[];
  rank_score?: number;
  batch?: boolean;
  allow_generation?: boolean;
  requires_image_upload?: boolean;
  /** Reference-input mode: "none" (text-only) | "optional" (text/image/both) |
   *  "required" (must upload). Source of truth for the reproduce upload UI. */
  image_input?: "none" | "optional" | "required";
  /** Explicit override for example-page indexing (see lib/example_indexing). */
  index_examples?: boolean;
  archetype?: "creation" | "consumption";
  /** Template-level intro/demo video (relative CDN path). See RawTemplate. */
  intro_video_url?: string;
  base_prompt: string;
  parameters: TemplateParameter[];
  cards: Array<{ image_id: string; params: Record<string, any> }>;
};

export type ImageView = {
  id: string;
  template_id: string;
  locale: PageLocale;
  title?: string;
  category?: string;
  params: Record<string, any>;
  image_url: string;
  preview_image_url?: string;
  audio_url?: string;
  video_url?: string;
  rank_score?: number;
};

export type NanoInspirationCardType = {
  id: string;
  template_id: string;
  language: PageLocale;
  category: string;
  topics: string[];
  rank_score?: number;
  image_urls: string[];
  preview_image_urls: string[];
  // Canonical example (inspiration) id per image, parallel to image_urls.
  // Used to deep-link to /nano-template/<slug>/example/<id>. Must come from
  // the data (ImageView.id) — do NOT derive it from the image filename, which
  // bakes in the content locale (template-travel-zh-beijing.jpg) and isn't a
  // valid example id.
  example_ids?: string[];
  description?: string;
  base_prompt?: string;
  template_parameters?: TemplateParameter[];
  sample_parameters?: Record<string, any>;
  batch?: boolean;
};

/**
 * The ONLY fields TemplateStrip reads. Used for the sibling "other templates"
 * rails, which cross a client boundary and are therefore serialized into the
 * page's RSC flight payload.
 *
 * The `?: never` members are not decoration. They make NanoInspirationCardType
 * structurally UNASSIGNABLE to this type, so a full feed card cannot reach a
 * strip surface by accident. A plain Pick<> would not do it: TS excess-property
 * checking only fires on object literals, so `otherNanoCards={fullCards}` would
 * still compile — which is exactly how 18 siblings' complete base_prompt (27KB
 * of hoisted Flight rows) ended up in every /nano-template/* page, putting the
 * HSK prompt verbatim on a vocabulary-flashcard page and letting generic hubs
 * absorb their specific siblings' keywords.
 */
export type NanoTemplateStripCard = {
  id: string;
  template_id: string;
  category: string;
  topics: string[];
  image_urls: string[];
  preview_image_urls: string[];
  base_prompt?: never;
  template_parameters?: never;
  sample_parameters?: never;
  description?: never;
  example_ids?: never;
};

/** Project a full feed card down to what a strip actually renders. */
export function toTemplateStripCard(c: NanoInspirationCardType): NanoTemplateStripCard {
  return {
    id: c.id,
    template_id: c.template_id,
    category: c.category,
    topics: c.topics,
    // The strip renders index 0 only (see TemplateStrip `thumbnail`).
    image_urls: c.image_urls?.slice(0, 1) ?? [],
    preview_image_urls: c.preview_image_urls?.slice(0, 1) ?? [],
  };
}

export type NanoRegistry = {
  templates: RawTemplate[];
  images: RawNanoImageRecord[];
  templateById: Map<string, RawTemplate>;
  imagesByTemplateId: Map<string, RawNanoImageRecord[]>;
  imageById: Map<string, RawNanoImageRecord>;
};

export type TranslateFn = (key: string) => string;

export function nanoTemplateI18nKey(templateId: string, field: string): string {
  return `${templateId}.${field}`;
}

export function toSlug(templateId: string) {
  return templateId.replace(/^template-/, "");
}

/** Deterministic djb2 hash → 7-char base36. Used as a uniqueness suffix
 *  for non-ASCII param values that the slug step would otherwise drop.
 */
function shortHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36).padStart(7, "0").slice(0, 7);
}

/** Builds a deterministic example ID from template_id + params.
 *  Used for duplicate detection and as the example_id sent to the backend.
 *
 *  Pure-ASCII values produce a clean human-readable slug (unchanged):
 *    {destination:"Kyoto", date_range:"4/16"} → "template-travel-kyoto-4-16"
 *
 *  Values containing any non-ASCII characters (CJK, Cyrillic, Arabic,
 *  etc.) also append a deterministic short hash of the raw value, so
 *  inputs that the slug would otherwise strip to nothing still get
 *  unique IDs:
 *    {idiom:"没完没了"}  → "template-...-a3kj92x"
 *    {idiom:"画蛇添足"}  → "template-...-b1f4p9q"   (different hash)
 *    {trip_duration:"7", destination_name:"台湾"}
 *                       → "template-series-travel-7-d9j3w8b"
 */
export function buildExampleId(templateId: string, params: Record<string, string>): string {
  const pieces = Object.values(params)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => {
      const raw = v.trim();
      const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const hasNonAscii = /[^\x00-\x7F]/.test(raw);
      if (!hasNonAscii) return slug;
      return slug ? `${slug}-${shortHash(raw)}` : shortHash(raw);
    })
    .filter(Boolean);
  const suffix = pieces.join("-");
  return suffix ? `${templateId}-${suffix}` : templateId;
}

export function getLocaleFromPath(pathname?: string): PageLocale {
  if (!pathname) return "en";

  const seg = pathname.split("/")[1];

  if (SUPPORTED_LOCALES.includes(seg as any)) {
    return seg as PageLocale;
  }

  return "en";
}

export function makeNanoTemplateUrl(
  templateId: string,
  locale: PageLocale = "en"
): string {
  const slug = toSlug(templateId);

  return locale === "en"
    ? `/nano-template/${slug}`
    : `/${locale}/nano-template/${slug}`;
}

export function normalizeCarouselUrls(
  imageUrls?: string[],
  previewUrls?: string[]
) {
  const imageUrlsSafe = Array.isArray(imageUrls) ? imageUrls : [];
  const previewUrlsSafe = Array.isArray(previewUrls) ? previewUrls : [];
  const fixedPreview = previewUrlsSafe.length ? previewUrlsSafe : imageUrlsSafe;
  return { imageUrls: imageUrlsSafe, previewUrls: fixedPreview };
}

export function buildParamSummary(params?: Record<string, any>, maxPairs = 2) {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, v]) => v !== undefined && v !== null && `${v}`.trim() !== ""
  );
  if (entries.length === 0) return "";
  return entries
    .slice(0, maxPairs)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" · ");
}

export function fillPrompt(basePrompt?: string, params?: Record<string, any>) {
  if (!basePrompt) return "";
  let p = basePrompt;
  if (!params) return p;

  for (const [k, v] of Object.entries(params)) {
    const regex = new RegExp(`\\{${k}\\}`, "g");
    p = p.replace(regex, String(v));
  }
  return p;
}

/**
 * Descriptive `alt` text for a template's gallery image.
 *
 * WHY (measured 2026-09-01). Image search carries more impressions than web
 * search here (19,035 vs 12,752 over 28d) at position 41, and alt text is one
 * of the few ranking signals we control on an AI-generated image whose filename
 * is a hash. What we shipped instead was the taxonomy label — `alt="sports"`,
 * `alt="world-cup"`, `alt="Anime MBTI Infographic Category"` — or nothing at
 * all. A bare tag describes a *bucket*, not the picture in it.
 *
 * Prefers the template description (a real sentence) and falls back to the
 * category with its trailing " Category" suffix removed, since that suffix is
 * an internal taxonomy artifact that reads as noise in a screen reader.
 */
export function buildImageAlt(opts: {
  category?: string;
  description?: string;
  /** 1-based position within the gallery. Only rendered when total > 1. */
  index?: number;
  total?: number;
}): string {
  const { category, description, index, total } = opts;

  // next-intl returns the lookup key verbatim when a message is missing
  // ("template-mbti-naruto.description"). That must never reach an alt.
  const usable = (s?: string): string => {
    const v = (s ?? "").trim();
    if (!v) return "";
    if (!v.includes(" ") && v.includes(".")) return "";
    return v;
  };

  // Some surfaces pass a polished label ("Anime MBTI Infographic Category"),
  // others pass a raw tag ("sports"). Title-case the bare-token case so it
  // reads as a label rather than as a stray slug in front of a sentence.
  const rawCategory = usable(category).replace(/\s+Category$/i, "");
  const cleanCategory =
    rawCategory && rawCategory === rawCategory.toLowerCase()
      ? rawCategory.replace(/\b[a-z]/g, (c) => c.toUpperCase())
      : rawCategory;
  const cleanDescription = usable(description);

  // First sentence only — descriptions run to two or three, and alt text past
  // ~125 characters is truncated by screen readers and ignored by crawlers.
  const firstSentence = cleanDescription
    ? (cleanDescription.split(/(?<=[.!?])\s+/)[0] ?? cleanDescription)
    : "";

  let base = firstSentence || cleanCategory;
  if (!base) return "AI-generated image example";

  // Case-INSENSITIVE: the tag surfaces pass "sports" against a description of
  // "Sports Team MBTI — Brazil (ESFP)". A case-sensitive check let the tag
  // through and emitted "sports — Sports Team MBTI — Brazil (ESFP)".
  if (
    firstSentence &&
    cleanCategory &&
    !firstSentence.toLowerCase().includes(cleanCategory.toLowerCase())
  ) {
    // Category first reads better as a label and front-loads the keyword.
    base = `${cleanCategory} — ${firstSentence}`;
  }

  const suffix =
    typeof index === "number" && typeof total === "number" && total > 1
      ? ` (${index} of ${total})`
      : "";

  const budget = 125 - suffix.length;
  const trimmed =
    base.length > budget ? `${base.slice(0, budget - 1).trimEnd()}…` : base;

  return `${trimmed}${suffix}`;
}

/**
 * Descriptive `alt` for one example tile in ExampleImagesGrid.
 *
 * The grid is the template hub's main image surface — the same images this
 * repo now advertises in the image sitemap — and it was shipping the raw
 * example title, which for the Naruto MBTI template means `alt="gaara"` and
 * `alt="hinata"`. A bare first name tells a crawler (and a screen reader)
 * nothing about what the picture shows.
 *
 * Composes: the subject (title, or the most specific parameter value when the
 * title is a slug-ish token) + the template's category label. Parameters are
 * the good stuff — `{character_name: "Gaara", art_style: "Anime"}` — because
 * they are what actually varies between two images of the same template.
 */
export function buildExampleImageAlt(
  item: {
    id: string;
    title?: string;
    params?: Record<string, string>;
  },
  context?: string
): string {
  const clean = (s?: string) => (s ?? "").replace(/[-_]+/g, " ").trim();

  // Title-case a bare token so "gaara" reads as "Gaara"; leave real
  // sentences ("Gaara — sand village") alone.
  const titleCaseToken = (s: string) =>
    s.length > 0 && s === s.toLowerCase() && s.split(" ").length <= 3
      ? s.replace(/\b[a-z]/g, (c) => c.toUpperCase())
      : s;

  // Last-resort id fallback: drop the "template-" prefix so it does not read
  // as "Template Travel Kyoto".
  const fallback = clean(item.id).replace(/^template\s+/i, "");
  const subject = titleCaseToken(clean(item.title) || fallback);

  // Parameter values, minus any already contained in the subject — an id
  // fallback of "Travel Kyoto" plus a `{city: "Kyoto"}` param would otherwise
  // emit "Travel Kyoto, Kyoto".
  const paramValues = Object.values(item.params ?? {})
    .map((v) => clean(String(v ?? "")))
    .filter(
      (v) => v.length > 0 && !subject.toLowerCase().includes(v.toLowerCase())
    );

  const parts = [subject, ...paramValues.slice(0, 2)].filter(Boolean);
  const descriptor = parts.join(", ");
  const label = clean(context).replace(/\s+Category$/i, "");

  const base = label
    ? descriptor
      ? `${descriptor} — ${label}`
      : label
    : descriptor;

  if (!base) return "AI-generated image example";
  return base.length > 125 ? `${base.slice(0, 124).trimEnd()}…` : base;
}
