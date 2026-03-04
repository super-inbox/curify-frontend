import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

export type Locale = "zh" | "en";

export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type RawTemplate = {
  id: string; // canonical template id, e.g. "template-education-card"
  locales?: Partial<
    Record<
      Locale,
      {
        category: string;
        description: string;
        base_prompt: string;
        parameters: TemplateParameter[];
      }
    >
  >;

  // curated presets: image_id + params
  cards?: Array<{ image_id: string; params: Record<string, any> }>;
};

export type RawNanoImageRecord = {
  id: string; // canonical image id, stable across locales
  template_id: string;

  asset: {
    image_url: string; // "/images/insp/xxx.jpg"
    preview_image_url?: string; // "/images/insp_preview/xxx-prev.jpg"
  };

  params: Record<string, any>;

  // localized metadata per image
  locales?: Partial<Record<Locale, { category?: string; title?: string }>>;
};

export type TemplateView = {
  template_id: string;
  slug: string;
  locale: Locale;
  category: string;
  description: string;
  base_prompt: string;
  parameters: TemplateParameter[];
  cards: Array<{ image_id: string; params: Record<string, any> }>;
};

export type ImageView = {
  id: string;
  template_id: string;
  locale: Locale;
  title?: string;
  category?: string;
  params: Record<string, any>;
  image_url: string;
  preview_image_url?: string;
};

// what the feed card component consumes
export type NanoInspirationCardType = {
  id: string; // group card id (usually template_id)
  template_id: string;
  language: Locale; // keep existing prop name to avoid churn
  category: string;

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

export function toSlug(templateId: string) {
  return templateId.replace(/^template-/, "");
}

export function normalizeLocale(locale: string): Locale {
  return locale === "en" ? "en" : "zh";
}

export function getLocaleFromPath(): Locale {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  return pathname.startsWith("/en") ? "en" : "zh";
}

export function makeNanoTemplateUrl(templateId: string, locale: Locale) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";
  const slug = toSlug(templateId);
  return `${base}/${locale}/nano-template/${slug}`;
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

// ------------------------
// Registry + parsers
// ------------------------

function pickLocale<T>(
  locales: Partial<Record<Locale, T>> | undefined,
  locale: Locale
): { value: T; resolved: Locale } | null {
  if (!locales) return null;

  const v = locales[locale];
  if (v) return { value: v, resolved: locale };

  if (locales.zh) return { value: locales.zh, resolved: "zh" };
  if (locales.en) return { value: locales.en, resolved: "en" };

  return null;
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
    console.log("[nano][image]", img.id, "→", img.template_id);

    imageById.set(img.id, img);
    const arr = imagesByTemplateId.get(img.template_id) ?? [];
    arr.push(img);
    imagesByTemplateId.set(img.template_id, arr);
  }

  return { templates, images, templateById, imagesByTemplateId, imageById };
}

// ✅ add this singleton registry
export const nanoRegistry: NanoRegistry = buildNanoRegistry(
  nanoTemplates as unknown as RawTemplate[],
  nanoImages as unknown as RawNanoImageRecord[]
);

export function getTemplateView(
  reg: NanoRegistry,
  templateId: string,
  locale: Locale
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
    category: value.category,
    description: value.description,
    base_prompt: value.base_prompt,
    parameters: value.parameters,
    cards: raw.cards ?? [],
  };
}

export function getImageViewsForTemplate(
  reg: NanoRegistry,
  templateId: string,
  locale: Locale
): ImageView[] {
  const imgs = reg.imagesByTemplateId.get(templateId) ?? [];

  return imgs.map((img) => {
    const loc =
      img.locales?.[locale] ?? img.locales?.zh ?? img.locales?.en ?? {};

    const imageUrl = img.asset.image_url;
    const previewUrl = img.asset.preview_image_url ?? img.asset.image_url;

    // // 🔍 DEBUG: verify preview image path
    // console.log("[nano_utils] preview check", {
    //   templateId,
    //   imageId: img.id,
    //   image_url: img.asset.image_url,
    //   preview_image_url: img.asset.preview_image_url      
    // });

    return {
      id: img.id,
      template_id: img.template_id,
      locale,
      title: loc.title,
      category: loc.category,
      params: img.params ?? {},
      image_url: imageUrl,
      preview_image_url: previewUrl,
    };
  });
}

// 1 card per template for feed/list
export function buildNanoFeedCards(
  reg: NanoRegistry,
  locale: Locale,
  opts?: { perTemplateMaxImages?: number; strictLocale?: boolean }
): NanoInspirationCardType[] {
  const perTemplateMaxImages = opts?.perTemplateMaxImages ?? 6;
  const strictLocale = opts?.strictLocale ?? true;

  const out: NanoInspirationCardType[] = [];

  for (const t of reg.templates) {
    const tv = getTemplateView(reg, t.id, locale);
    if (!tv) continue;

    if (strictLocale && tv.locale !== locale) continue;

    const imgs = getImageViewsForTemplate(reg, t.id, tv.locale);
    if (imgs.length === 0) continue;

    const sliced = imgs.slice(0, perTemplateMaxImages);

    out.push({
      id: tv.template_id,
      template_id: tv.template_id,
      language: tv.locale,
      category: tv.category,
      description: tv.description,
      base_prompt: tv.base_prompt,
      template_parameters: tv.parameters,
      image_urls: sliced.map((x) => x.image_url),
      preview_image_urls: sliced.map((x) => x.preview_image_url ?? x.image_url),
      sample_parameters: sliced[0]?.params,
    });
  }

  return out;
}

export type NanoTemplateDetailData = {
  template: TemplateView;
  cards: Array<{
    image_id: string;
    params: Record<string, any>;
    image_url: string;
    preview_image_url: string;
  }>;
};

export function buildNanoTemplateDetailData(
  reg: NanoRegistry,
  templateId: string,
  locale: Locale
): NanoTemplateDetailData | null {
  const template = getTemplateView(reg, templateId, locale);
  if (!template) return null;

  const images = getImageViewsForTemplate(reg, templateId, template.locale);
  const imageMap = new Map(images.map((x) => [x.id, x]));

  const curated =
    template.cards.length > 0
      ? template.cards
      : images.map((x) => ({ image_id: x.id, params: x.params }));

  const cards = curated
    .map((c) => {
      const img = imageMap.get(c.image_id);
      if (!img) return null;
      return {
        image_id: img.id,
        params: c.params ?? img.params,
        image_url: img.image_url,
        preview_image_url: img.preview_image_url ?? img.image_url,
      };
    })
    .filter(Boolean) as NanoTemplateDetailData["cards"];

  return { template, cards };
}

// ------------------------
// Example detail page helpers
// (used by /nano-template/[templateId]/example/[imageId])
// ------------------------

export type NanoExampleDetailData = {
  image: ImageView;
  filled_prompt: string;
  template: TemplateView;
  related: ImageView[];
};

/**
 * Returns all data needed to render the SEO example detail page for a single image.
 * Returns null if the image or template cannot be found.
 */
export function getNanoExampleDetail(
  reg: NanoRegistry,
  templateId: string,
  imageId: string,
  locale: Locale
): NanoExampleDetailData | null {
  const raw = reg.imageById.get(imageId);
  if (!raw || raw.template_id !== templateId) return null;

  const template = getTemplateView(reg, templateId, locale);
  if (!template) return null;

  const loc = raw.locales?.[locale] ?? raw.locales?.zh ?? raw.locales?.en ?? {};

  const image: ImageView = {
    id: raw.id,
    template_id: raw.template_id,
    locale,
    title: loc.title,
    category: loc.category,
    params: raw.params ?? {},
    image_url: raw.asset.image_url,
    preview_image_url: raw.asset.preview_image_url ?? raw.asset.image_url,
  };

  const filled_prompt = fillPrompt(template.base_prompt, raw.params);

  const related = getImageViewsForTemplate(reg, templateId, locale)
    .filter((x) => x.id !== imageId)
    .slice(0, 6);

  return { image, filled_prompt, template, related };
}

// ── Return type ───────────────────────────────────────────────────────────────
export type NanoExampleDetail = RawNanoImageRecord & {
  base_prompt: string;
  filled_prompt: string;
};

/**
 * Get a single image record by templateId + imageId.
 * Resolves base_prompt from the template and fills it with the image's params.
 */
export function getNanoExampleById(
  templateId: string,
  imageId: string,
  locale: Locale = "zh"
): NanoExampleDetail | null {
  const img = nanoRegistry.imageById.get(imageId);
  if (!img || img.template_id !== templateId) return null;

  const tv = getTemplateView(nanoRegistry, templateId, locale);
  const base_prompt = tv?.base_prompt ?? "";
  const filled_prompt = fillPrompt(base_prompt, img.params ?? {});

  return { ...img, base_prompt, filled_prompt };
}

/**
 * Get all image records for a template (ordered as stored).
 */
export function getNanoExamplesByTemplateId(
  templateId: string
): RawNanoImageRecord[] {
  return nanoRegistry.imagesByTemplateId.get(templateId) ?? [];
}