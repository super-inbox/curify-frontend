export type Locale = "zh" | "en";

export function resolveContentLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en";
}