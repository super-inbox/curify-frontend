import { getTranslations } from "next-intl/server";
import { SUPPORTED_LOCALES } from "@/lib/generated/locales";

export type PageLocale = (typeof SUPPORTED_LOCALES)[number];


export const DEFAULT_LOCALE: PageLocale =
  (SUPPORTED_LOCALES.includes("en" as PageLocale) ? "en" : SUPPORTED_LOCALES[0]) as PageLocale;

export function isSupportedLocale(locale: string): locale is PageLocale {
  return SUPPORTED_LOCALES.includes(locale as PageLocale);
}

export function resolveContentLocale(locale: string): PageLocale {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getSupportedLocales(): readonly PageLocale[] {
  return SUPPORTED_LOCALES;
}

export function makeSafeTranslator(
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  return (key: string): string => {
    try {
      return t(key as never) ?? "";
    } catch {
      return "";
    }
  };
}

// backward-compatible alias
export const makeSafeNanoTranslator = makeSafeTranslator;

export function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildLocalizedHref(locale: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? normalizedPath : `/${locale}${normalizedPath}`;
}

export function buildTopicHref(locale: string, topic: string) {
  return buildLocalizedHref(locale, `/topics/${topic}`);
}

export function getTopicLabel(
  topic: string,
  translateTopics: (key: string) => string
): string {
  return translateTopics(`topics.${topic}.displayName`) || titleCaseFromSlug(topic);
}