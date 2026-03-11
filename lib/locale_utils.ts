export type ContentLocale = "en" | "zh";

export function resolveContentLocale(locale: string): ContentLocale {
  return locale === "zh" ? "zh" : "en";
}