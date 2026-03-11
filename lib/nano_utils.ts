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
        // NOTE: `category` and `description` have been moved to messages/[locale]/nano.json
        // Only prompt-critical fields remain here
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
  /**
   * `category` and `description` are no longer sourced from nano_templates.json.
   * Callers must inject them from the i18n namespace `nano.templates.{template_id}.category`
   * and `nano.templates.{template_id}.description`.
   * These fields are kept on the type for backward compatibility but will be empty
   * strings when built without translation injection.
   */
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
  /**
   * Populated by the caller via i18n — not sourced from JSON.
   * Use `t(`nano.templates.${template_id}.category`)` at the call site.
   */
  category: string;

  image_urls: string[];
  preview_image_urls: string[];

  /**
   * Populated by the caller via i18n — not sourced from JSON.
   * Use `t(`nano.templates.${template_id}.description`)` at the call site.
   */
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

// ---------------------------------------------------------------------------
// i18n translation resolver type
// Callers pass a function matching next-intl's `t()` signature so that
// nano_utils stays framework-agnostic and testable.
// ---------------------------------------------------------------------------
export type TranslateFn = (key: string) => string;

/**
 * Build the i18n key for a template's display field.
 *
 * nano.json structure (flat, no nesting):
 * {
 *   "template-herbal-zh": { "category": "...", "description": "..." }
 * }
 *
 * When consumed via useTranslations("nano") / getTranslations("nano"),
 * the key passed to t() must be just  "template-herbal-zh.category"
 * — the namespace ("nano") is already bound by useTranslations/getTranslations.
 */
  export function nanoTemplateI18nKey(
    templateId: string,
    field: string
  ): string {
    return `${templateId}.${field}`;
  }
// ---------------------------------------------------------------------------

export function toSlug(templateId: string) {
  return templateId.replace(/^template-/, "");
}

export function getLocaleFromPath(): Locale {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  return pathname.startsWith("/en") ? "en" : "zh";
}

export function makeNanoTemplateUrl(templateId: string, locale: Locale) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";
  const slug = toSlug(templateId);
  return locale === "en"
    ? `${base}/nano-template/${slug}`
    : `${base}/${locale}/nano-template/${slug}`;
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

// ✅ singleton registry
export const nanoRegistry: NanoRegistry = buildNanoRegistry(
  nanoTemplates as unknown as RawTemplate[],
  nanoImages as unknown as RawNanoImageRecord[]
);

/**
 * Returns a TemplateView for the given template + locale.
 *
 * `category` and `description` are intentionally empty strings here —
 * inject them at the call site using:
 *   `t(nanoTemplateI18nKey(templateId, 'category'))`
 *   `t(nanoTemplateI18nKey(templateId, 'description'))`
 *
 * Or pass a `translate` function to `getTemplateViewWithTranslations` instead.
 */
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
    // Callers must fill these from i18n
    category: "",
    description: "",
    base_prompt: value.base_prompt,
    parameters: value.parameters,
    cards: raw.cards ?? [],
  };
}

/**
 * Like `getTemplateView` but resolves `category` and `description` via the
 * supplied translation function so the result is fully populated.
 *
 * Use this in server components (pass `await getTranslations('nano')`),
 * or in client components (pass `useTranslations('nano')`).
 */
export function getTemplateViewWithTranslations(
  reg: NanoRegistry,
  templateId: string,
  locale: Locale,
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

/**
 * Builds feed cards for all templates.
 *
 * Pass `translate` to populate `category` and `description` on each card.
 * If omitted, those fields will be empty strings (fine for structural/data use,
 * not for rendering).
 */
export function buildNanoFeedCards(
  reg: NanoRegistry,
  locale: Locale,
  opts?: {
    perTemplateMaxImages?: number;
    strictLocale?: boolean;
    /** next-intl t() from the 'nano' namespace */
    translate?: TranslateFn;
  }
): NanoInspirationCardType[] {
  const perTemplateMaxImages = opts?.perTemplateMaxImages ?? 6;
  const strictLocale = opts?.strictLocale ?? true;
  const t = opts?.translate;

  const out: NanoInspirationCardType[] = [];

  for (const raw of reg.templates) {
    const tv = getTemplateView(reg, raw.id, locale);
    if (!tv) continue;

    if (strictLocale && tv.locale !== locale) continue;

    const imgs = getImageViewsForTemplate(reg, raw.id, tv.locale);
    if (imgs.length === 0) continue;

    const sliced = imgs.slice(0, perTemplateMaxImages);

    const category = t
      ? t(nanoTemplateI18nKey(raw.id, "category"))
      : "";
    const description = t
      ? t(nanoTemplateI18nKey(raw.id, "description"))
      : "";

    out.push({
      id: tv.template_id,
      template_id: tv.template_id,
      language: tv.locale,
      category,
      description,
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
  locale: Locale,
  /** Pass to get populated category/description; otherwise they'll be empty */
  translate?: TranslateFn
): NanoTemplateDetailData | null {
  const template = translate
    ? getTemplateViewWithTranslations(reg, templateId, locale, translate)
    : getTemplateView(reg, templateId, locale);

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
// ------------------------

export type NanoExampleDetailData = {
  image: ImageView;
  filled_prompt: string;
  template: TemplateView;
  related: ImageView[];
};

export function getNanoExampleDetail(
  reg: NanoRegistry,
  templateId: string,
  imageId: string,
  locale: Locale,
  translate?: TranslateFn
): NanoExampleDetailData | null {
  const raw = reg.imageById.get(imageId);
  if (!raw || raw.template_id !== templateId) return null;

  const template = translate
    ? getTemplateViewWithTranslations(reg, templateId, locale, translate)
    : getTemplateView(reg, templateId, locale);
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

export function getNanoExampleById(
  templateId: string,
  imageId: string,
  locale: Locale = "zh",
  translate?: TranslateFn
): NanoExampleDetail | null {
  const img = nanoRegistry.imageById.get(imageId);
  if (!img || img.template_id !== templateId) return null;

  const tv = translate
    ? getTemplateViewWithTranslations(nanoRegistry, templateId, locale, translate)
    : getTemplateView(nanoRegistry, templateId, locale);

  const base_prompt = tv?.base_prompt ?? "";
  const filled_prompt = fillPrompt(base_prompt, img.params ?? {});

  return { ...img, base_prompt, filled_prompt };
}

export function getNanoExamplesByTemplateId(
  templateId: string
): RawNanoImageRecord[] {
  return nanoRegistry.imagesByTemplateId.get(templateId) ?? [];
}
