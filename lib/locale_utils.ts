export type ContentLocale = "en" | "zh";
export type Locale = "zh" | "en";

export function resolveContentLocale(locale: string): ContentLocale {
  return locale === "zh" ? "zh" : "en";
}