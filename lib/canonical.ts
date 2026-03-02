// lib/canonical.ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.curify-ai.com";

export function getCanonicalUrl(locale: string, path: string = ""): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  // Ensure path starts with / if not empty
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  return `${siteUrl}${prefix}${normalizedPath}`;
}

export function getLanguagesMap(path: string = ""): Record<string, string> {
  const { routing } = require("@/i18n/routing");
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  
  const languages: Record<string, string> = {};
  routing.locales.forEach((lang: string) => {
    languages[lang] = getCanonicalUrl(lang, normalizedPath);
  });
  languages["x-default"] = getCanonicalUrl("en", normalizedPath);
  
  return languages;
}