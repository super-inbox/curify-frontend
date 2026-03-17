import { Locale } from "@/lib/locale_utils";
import {
  nanoRegistry,
  fillPrompt,
  getTemplateView,
  getTemplateViewWithTranslations,
  toSlug,
  type ImageView,
  type NanoRegistry,
  type RawNanoImageRecord,
  type TemplateView,
  type TranslateFn,
} from "@/lib/nano_utils";

export type CircularNeighbors<T> = {
  prev: T;
  current: T;
  next: T;
  index: number;
  total: number;
};

export type NanoExampleDetail = RawNanoImageRecord & {
  base_prompt: string;
  filled_prompt: string;
};

export type NanoExampleDetailData = {
  image: ImageView;
  filled_prompt: string;
  template: TemplateView;
  related: ImageView[];
};

export function buildNanoExampleHref(params: {
  locale: string;
  slug: string;
  exampleId: string;
}) {
  return `/${params.locale}/nano-template/${params.slug}/example/${encodeURIComponent(
    params.exampleId
  )}`;
}

export function buildNanoExampleHrefFromTemplateId(params: {
  locale: string;
  templateId: string;
  exampleId: string;
}) {
  return buildNanoExampleHref({
    locale: params.locale,
    slug: toSlug(params.templateId),
    exampleId: params.exampleId,
  });
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

export function getCircularNeighbors<T extends { id: string }>(
  items: T[],
  currentId: string
): CircularNeighbors<T> | null {
  if (!items.length) return null;

  const index = items.findIndex((item) => item.id === currentId);
  if (index === -1) return null;

  return {
    prev: items[(index - 1 + items.length) % items.length],
    current: items[index],
    next: items[(index + 1) % items.length],
    index,
    total: items.length,
  };
}

export function getCircularImageViewNeighbors(
  reg: NanoRegistry,
  templateId: string,
  locale: Locale,
  currentId: string
): CircularNeighbors<ImageView> | null {
  const views = getImageViewsForTemplate(reg, templateId, locale);
  return getCircularNeighbors(views, currentId);
}

export function getNanoExamplesByTemplateId(
  templateId: string
): RawNanoImageRecord[] {
  return nanoRegistry.imagesByTemplateId.get(templateId) ?? [];
}

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

export function buildCircularExampleNav(params: {
  reg: NanoRegistry;
  templateId: string;
  contentLocale: Locale;
  pageLocale: string;
  slug: string;
  currentExampleId: string;
}) {
  const neighbors = getCircularImageViewNeighbors(
    params.reg,
    params.templateId,
    params.contentLocale,
    params.currentExampleId
  );

  if (!neighbors || neighbors.total <= 1) return null;

  return {
    prev: {
      ...neighbors.prev,
      href: buildNanoExampleHref({
        locale: params.pageLocale,
        slug: params.slug,
        exampleId: neighbors.prev.id,
      }),
    },
    next: {
      ...neighbors.next,
      href: buildNanoExampleHref({
        locale: params.pageLocale,
        slug: params.slug,
        exampleId: neighbors.next.id,
      }),
    },
    index: neighbors.index,
    total: neighbors.total,
  };
}