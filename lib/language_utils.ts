// File: lib/language_utils.js
export const languages = [
  { code: "en", name: "English (EN)", flag: "🇺🇸" },
  { code: "zh-cn", name: "Chinese (ZH)", flag: "🇨🇳" },
  { code: "es", name: "Spanish (ES)", flag: "🇪🇸" },
  { code: "fr", name: "French (FR)", flag: "🇫🇷" },
  { code: "de", name: "German (DE)", flag: "🇩🇪" },
  { code: "it", name: "Italian (IT)", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese (PT)", flag: "🇵🇹" },
  { code: "pl", name: "Polish (PL)", flag: "🇵🇱" },
  { code: "tr", name: "Turkish (TR)", flag: "🇹🇷" },
  { code: "ru", name: "Russian (RU)", flag: "🇷🇺" },
  { code: "nl", name: "Dutch (NL)", flag: "🇳🇱" },
  { code: "cs", name: "Czech (CS)", flag: "🇨🇿" },
  { code: "ar", name: "Arabic (AR)", flag: "🇸🇦" },
  { code: "ja", name: "Japanese (JA)", flag: "🇯🇵" },
  { code: "hu", name: "Hungarian (HU)", flag: "🇭🇺" },
  { code: "ko", name: "Korean (KO)", flag: "🇰🇷" },
  { code: "hi", name: "Hindi (HI)", flag: "🇮🇳" },
  { code: "th", name: "Thai (TH)", flag: "🇹🇭" }
];

// Lookup functions
export function getLangNameFromCode(code: string): string {
  return languages.find((lang) => lang.code === code)?.name || code;
}

export function getLangCode(displayName: string): string {
  return (
    languages.find((lang) => lang.name.includes(displayName))?.code || "en"
  );
}
