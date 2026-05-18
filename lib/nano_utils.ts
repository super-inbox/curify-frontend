import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { SUPPORTED_LOCALES } from "./generated/locales";
import { PageLocale } from "@/lib/locale_utils";
import { getUseCasesForTopics } from "./topicRegistry";

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
  rank_score?: number;
  batch?: boolean;
  allow_generation?: boolean;

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
  description?: string;
  base_prompt?: string;
  template_parameters?: TemplateParameter[];
  sample_parameters?: Record<string, any>;
  batch?: boolean;
};

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

function pickLocale<T>(
  locales: Partial<Record<PageLocale, T>> | undefined,
  locale: PageLocale
): { value: T; resolved: PageLocale } | null {
  if (!locales) return null;

  const v = locales[locale];
  if (v) return { value: v, resolved: locale };
  if (locales.zh) return { value: locales.zh, resolved: "zh" };
  if (locales.en) return { value: locales.en, resolved: "en" };

  return null;
}

function normalizeTopicValues(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function getTemplateTopics(template: RawTemplate): string[] {
  return dedupeStrings(normalizeTopicValues(template.topics));
}

export function buildNanoRegistry(
  templates: RawTemplate[],
  images: RawNanoImageRecord[]
): NanoRegistry {
  const templateById = new Map<string, RawTemplate>();
  const imagesByTemplateId = new Map<string, RawNanoImageRecord[]>();
  const imageById = new Map<string, RawNanoImageRecord>();

  for (const t of templates) {
    templateById.set(t.id, t);
  }

  for (const img of images) {
    imageById.set(img.id, img);
    const arr = imagesByTemplateId.get(img.template_id) ?? [];
    arr.push(img);
    imagesByTemplateId.set(img.template_id, arr);
  }

  return { templates, images, templateById, imagesByTemplateId, imageById };
}

export const nanoRegistry: NanoRegistry = buildNanoRegistry(
  nanoTemplates as unknown as RawTemplate[],
  nanoImages as unknown as RawNanoImageRecord[]
);

export function getTemplateView(
  reg: NanoRegistry,
  templateId: string,
  locale: PageLocale
): TemplateView | null {
  const raw = reg.templateById.get(templateId);
  if (!raw) return null;

  const picked = pickLocale(raw.locales, locale);
  if (!picked) return null;

  const { value, resolved } = picked;

  return {
    template_id: raw.id,
    slug: toSlug(raw.id),
    locale: resolved,
    category: "",
    description: "",
    topics: getTemplateTopics(raw),
    use_cases: getUseCasesForTopics(getTemplateTopics(raw)),
    rank_score: raw.rank_score,
    batch: raw.batch,
    allow_generation: raw.allow_generation,
    base_prompt: value.base_prompt,
    parameters: value.parameters,
    cards: raw.cards ?? [],
  };
}

export function getTemplateViewWithTranslations(
  reg: NanoRegistry,
  templateId: string,
  locale: PageLocale,
  t: TranslateFn
): TemplateView | null {
  const view = getTemplateView(reg, templateId, locale);
  if (!view) return null;

  return {
    ...view,
    category: t(nanoTemplateI18nKey(templateId, "category")),
    description: t(nanoTemplateI18nKey(templateId, "description")),
  };
}