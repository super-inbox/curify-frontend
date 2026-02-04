// lib/language_config.ts

export interface LanguageConfig {
  locale: string;
  name: string;
  flag: string;
  code: string; // For compatibility with existing language_utils
}

// Primary languages shown directly in header
export const primaryLanguages: LanguageConfig[] = [
  { locale: "en", name: "English", flag: "🇬🇧", code: "en" },
  { locale: "zh", name: "中文", flag: "🇨🇳", code: "zh" },
];

// Additional languages in "More" dropdown
export const moreLanguages: LanguageConfig[] = [
  { locale: "es", name: "Español", flag: "🇪🇸", code: "es" },
  { locale: "fr", name: "Français", flag: "🇫🇷", code: "fr" },
  { locale: "de", name: "Deutsch", flag: "🇩🇪", code: "de" },
  { locale: "ja", name: "日本語", flag: "🇯🇵", code: "ja" },
  { locale: "hi", name: "हिंदी", flag: "🇮🇳", code: "hi" },
  { locale: "tr", name: "Türkçe", flag: "🇹🇷", code: "tr" },
];

// All languages combined
export const allLanguages: LanguageConfig[] = [
  ...primaryLanguages,
  ...moreLanguages,
];

// Helper function to get language by code
export function getLanguageByCode(code: string): LanguageConfig | undefined {
  return allLanguages.find((lang) => lang.code === code || lang.locale === code);
}

// Helper function to check if language is in "more" category
export function isMoreLanguage(code: string): boolean {
  return moreLanguages.some((lang) => lang.code === code || lang.locale === code);
}

// Helper function to check if language is primary
export function isPrimaryLanguage(code: string): boolean {
  return primaryLanguages.some((lang) => lang.code === code || lang.locale === code);
}
