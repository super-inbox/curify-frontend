import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { getTranslations } from "next-intl/server";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
  getImageViewsForTemplate,
  buildNanoFeedCards,
  getNanoExampleById,
} from "@/lib/nano_utils";

import {
  resolveContentLocale,
  makeSafeTranslator,
  Locale,
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
  const contentLocale: Locale = resolveContentLocale(localeStr);
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
    }));
}

export function buildOtherTemplateCards(
  reg: ReturnType<typeof buildNanoRegistry>,
  contentLocale: Locale,
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
  contentLocale: Locale,
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