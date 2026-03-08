// lib/canonical.ts
import { routing } from "@/i18n/routing";
import { SITE_URL } from "./constants";

export function getCanonicalUrl(locale: string, path: string = ""): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  // Ensure path starts with / if not empty
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  return `${SITE_URL}${prefix}${normalizedPath}`;
}

export function getLanguagesMap(path: string = ""): Record<string, string> {  
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  
  const languages: Record<string, string> = {};
  routing.locales.forEach((lang: string) => {
    languages[lang] = getCanonicalUrl(lang, normalizedPath);
  });
  languages["x-default"] = getCanonicalUrl("en", normalizedPath);
  
  return languages;
}