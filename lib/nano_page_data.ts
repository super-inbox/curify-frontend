import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { getTranslations } from "next-intl/server";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  type NanoInspirationCardType,
  type TranslateFn,
  buildNanoRegistry,
  getTemplateView,
  getTemplateViewWithTranslations,
  nanoTemplateI18nKey,
} from "@/lib/nano_utils";

import {
  getImageViewsForTemplate,
  getNanoExampleById,
  getSimilarExamples,
} from "@/lib/nano_example_utils";

import {
  resolveContentLocale,
  makeSafeTranslator,
  PageLocale,
} from "@/lib/locale_utils";

import {
  type NanoMessagesDict,
  normalizeNanoLocaleMessageEntry,
} from "@/lib/nano_seo_utils";

export function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

export async function loadNanoMessages(localeStr: string): Promise<NanoMessagesDict> {
  try {
    const mod = await import(`@/messages/${localeStr}/nano.json`);
    return (mod.default ?? {}) as NanoMessagesDict;
  } catch {
    return {};
  }
}

export async function buildNanoPageContext(localeStr: string, slug: string) {
  const pageLocale = localeStr;
  const contentLocale: PageLocale = resolveContentLocale(localeStr);
  const templateId = slugToTemplateId(slug);

  const templates = nanoTemplates as unknown as RawTemplate[];
  const images = nanoImages as unknown as RawNanoImageRecord[];
  const reg = buildNanoRegistry(templates, images);

  const nanoMessagesRaw = await loadNanoMessages(localeStr);
  const localizedRawEntry = nanoMessagesRaw?.[templateId];
  const localizedEntry = normalizeNanoLocaleMessageEntry(localizedRawEntry);

  const tNano = await getTranslations({ locale: pageLocale, namespace: "nano" });
  const translateNano = makeSafeTranslator(tNano);

  const tTopics = await getTranslations({ locale: pageLocale });
  const translateTopics = makeSafeTranslator(tTopics);

  const nanoMessages: NanoMessagesDict = {
    [templateId]: localizedEntry,
  };

  return {
    pageLocale,
    contentLocale,
    templateId,
    reg,
    nanoMessages,
    localizedEntry,
    translateNano,
    translateTopics,
  };
}

type NanoImageView = ReturnType<typeof getImageViewsForTemplate>[number];

export function buildTemplateImageGridItems(
  imageViews: NanoImageView[],
  excludeImageId?: string
) {
  return imageViews
    .filter((img) => img.id !== excludeImageId)
    .map((img) => ({
      id: img.id,
      title: img.title || "",
      preview: img.preview_image_url || img.image_url,
      templateId: img.template_id,
      params: img.params ?? {},
    }));
}

export function buildSimilarExampleGridItems(
  reg: ReturnType<typeof buildNanoRegistry>,
  currentId: string,
  opts?: { limit?: number; maxPerTemplate?: number }
) {
  const similar = getSimilarExamples(reg, currentId, opts);
  return similar.map((img) => ({
    id: img.id,
    title: (img.locales?.["en"]?.title ?? img.locales?.["zh"]?.title ?? ""),
    preview: img.asset.preview_image_url || img.asset.image_url,
    templateId: img.template_id,
    params: img.params ?? {},
  }));
}

export function buildOrderedTemplateImageGridItems(
  imageViews: NanoImageView[],
  orderedImageIds?: string[]
) {
  const imageMap = new Map(imageViews.map((x) => [x.id, x] as const));
  const ids = orderedImageIds?.length ? orderedImageIds : imageViews.map((x) => x.id);

  return ids
    .map((id) => imageMap.get(id))
    .filter((img): img is NanoImageView => Boolean(img))
    .map((img) => ({
      id: img.id,
      title: img.title || "",
      preview: img.preview_image_url || img.image_url,
      templateId: img.template_id,
      params: img.params ?? {},
    }));
}

export function buildNanoFeedCards(
  reg: ReturnType<typeof buildNanoRegistry>,
  locale: PageLocale,
  opts?: {
    perTemplateMaxImages?: number;
    strictLocale?: boolean;
    translate?: TranslateFn;
    useCaseSlugs?: string[];
  }
): NanoInspirationCardType[] {
  const perTemplateMaxImages = opts?.perTemplateMaxImages ?? 6;
  const strictLocale = opts?.strictLocale ?? true;
  const t = opts?.translate;
  const useCaseSlugs = opts?.useCaseSlugs;

  const out: NanoInspirationCardType[] = [];

  const sortedTemplates = [...reg.templates].sort(
    (a, b) => (b.rank_score ?? 1) - (a.rank_score ?? 1)
  );
  
  for (const raw of sortedTemplates) {
    if (useCaseSlugs?.length) {
      const rawUseCases: string[] = (raw as RawTemplate & { use_cases?: string[] }).use_cases ?? [];
      if (!useCaseSlugs.some((uc) => rawUseCases.includes(uc))) continue;
    }

    const tv = getTemplateView(reg, raw.id, locale);
    if (!tv) continue;

    if (strictLocale && tv.locale !== locale) continue;

    const imgs = getImageViewsForTemplate(reg, raw.id, tv.locale);
    if (imgs.length === 0) continue;

    const sliced = imgs.slice(0, perTemplateMaxImages);

    const category = t ? t(nanoTemplateI18nKey(raw.id, "category")) : "";
    const description = t ? t(nanoTemplateI18nKey(raw.id, "description")) : "";

    out.push({
      id: tv.template_id,
      template_id: tv.template_id,
      language: tv.locale,
      category,
      topics: tv.topics,
      rank_score: tv.rank_score,
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
  template: ReturnType<typeof getTemplateView>;
  cards: Array<{
    image_id: string;
    params: Record<string, any>;
    image_url: string;
    preview_image_url: string;
  }>;
};

export function buildNanoTemplateDetailData(
  reg: ReturnType<typeof buildNanoRegistry>,
  templateId: string,
  locale: PageLocale,
  translate?: TranslateFn
) {
  const template = translate
    ? getTemplateViewWithTranslations(reg, templateId, locale, translate)
    : getTemplateView(reg, templateId, locale);

  if (!template) return null;

  const images = getImageViewsForTemplate(reg, templateId, template.locale);
  const imageMap = new Map(images.map((x) => [x.id, x] as const));

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
    .filter(Boolean) as Array<{
      image_id: string;
      params: Record<string, any>;
      image_url: string;
      preview_image_url: string;
    }>;

  return { template, cards };
}

export function buildOtherTemplateCards(
  reg: ReturnType<typeof buildNanoRegistry>,
  contentLocale: PageLocale,
  translateNano: (key: string) => string,
  excludeTemplateId: string
) {
  return buildNanoFeedCards(reg, contentLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  }).filter((c) => c.template_id !== excludeTemplateId);
}

export function resolveLocalizedExampleCopy(
  example: NonNullable<ReturnType<typeof getNanoExampleById>>,
  contentLocale: PageLocale,
  localizedEntry?: { title?: string | null; category?: string | null }
) {
  const fallbackLoc =
    example.locales?.[contentLocale] ??
    example.locales?.en ??
    example.locales?.zh ??
    {};

  return {
    title: localizedEntry?.title ?? fallbackLoc.title ?? example.id,
    category: localizedEntry?.category ?? fallbackLoc.category ?? "",
  };
}

export { getImageViewsForTemplate };