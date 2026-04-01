import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { SUPPORTED_LOCALES } from "./generated/locales";
import { PageLocale } from "@/lib/locale_utils";

export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type RawTemplate = {
  id: string;
  topics?: string | string[];
  rank_score?: number;
  batch?: boolean;

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
  };

  params: Record<string, any>;
  locales?: Partial<Record<PageLocale, { category?: string; title?: string }>>;
};

export type TemplateView = {
  template_id: string;
  slug: string;
  locale: PageLocale;
  category: string;
  description: string;
  topics: string[];
  rank_score?: number;
  batch?: boolean;
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
    rank_score: raw.rank_score,
    batch: raw.batch,
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