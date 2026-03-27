// lib/canonical.ts
import { routing } from "@/i18n/routing";
import { SITE_URL } from "./constants";

function buildCanonicalPath(locale: string, path: string = ""): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const normalizedPath =
    path && !path.startsWith("/") ? `/${path}` : path;

  return `${prefix}${normalizedPath}`;
}

export function getCanonicalPath(locale: string, path: string = ""): string {
  return buildCanonicalPath(locale, path);
}

export function getCanonicalUrl(locale: string, path: string = ""): string {
  return `${SITE_URL}${buildCanonicalPath(locale, path)}`;
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