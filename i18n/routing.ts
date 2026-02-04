import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    'en',    // 🇬🇧 English
    'zh',    // 🇨🇳 中文
    'es',    // 🇪🇸 Español  
    'de',    // 🇩🇪 Deutsch
    'ja',    // 🇯🇵 日本語  
    'hi',    // 🇮🇳 हिंदी
    'tr'     // 🇹🇷 Türkçe
  ],
  defaultLocale: 'en'
});
