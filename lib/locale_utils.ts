import { getTranslations } from "next-intl/server";
export type Locale = "zh" | "en";

export function resolveContentLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en";
}

export function makeSafeNanoTranslator(tNano: Awaited<ReturnType<typeof getTranslations>>) {
  return (key: string): string => {
    try {
      return tNano(key as any) ?? "";
    } catch {
      return "";
    }
  };
}