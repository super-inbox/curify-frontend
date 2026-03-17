import { getTranslations } from "next-intl/server";

export type Locale = "zh" | "en";

export function resolveContentLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en";
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

export function buildTopicHref(locale: string, topic: string) {
  return locale === "en" ? `/topics/${topic}` : `/${locale}/topics/${topic}`;
}

export function getTopicLabel(
  topic: string,
  translateTopics: (key: string) => string
): string {
  return translateTopics(`topics.${topic}.displayName`) || titleCaseFromSlug(topic);
}