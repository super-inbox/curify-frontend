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
  defaultLocale: 'en'
});
