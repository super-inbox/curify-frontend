import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    'en',    // 🇬🇧 English
    'zh',    // 🇨🇳 中文
    'es',    // 🇪🇸 Español
    'fr',    // 🇫🇷 Français
    'de',    // 🇩🇪 Deutsch
    'ja',    // 🇯🇵 日本語
    'ko',    // 🇰🇷 한국어
    'hi',    // 🇮🇳 हिंदी
    'tr',    // 🇹🇷 Türkçe
    'ru'     // 🇷🇺 Русский
  ],
  defaultLocale: 'en',
  localePrefix: "as-needed",
  // Disable cookie/Accept-Language detection: the URL is the only source of
  // truth for the locale. Without this, the NEXT_LOCALE cookie set during a
  // zh session causes the middleware to redirect en URLs back to /zh/... even
  // after the user has switched back to English.
  localeDetection: false,
  alternateLinks: false
});
