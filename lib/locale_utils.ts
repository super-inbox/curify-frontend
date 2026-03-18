import { getTranslations } from "next-intl/server";
import { SUPPORTED_LOCALES } from "@/lib/generated/locales";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale =
  (SUPPORTED_LOCALES.includes("en" as Locale) ? "en" : SUPPORTED_LOCALES[0]) as Locale;

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function resolveContentLocale(locale: string): Locale {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getSupportedLocales(): readonly Locale[] {
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