"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  primaryLanguages,
  moreLanguages,
  getLanguageByCode,
  isMoreLanguage,
} from "@/lib/language_config";
import LanguageSubmenu from "@/app/[locale]/_componentForPage/LanguageSubmenu";

export default function LocaleSwitcher() {
  const t = useTranslations("header");
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const currentLanguage = getLanguageByCode(locale);
  const isCurrentMoreLang = isMoreLanguage(locale);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (nextLocale: string) => {
    const qs = new URLSearchParams(searchParams.toString()).toString();
    const newPath = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newPath, { locale: nextLocale });
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {primaryLanguages.map((lang) => (
        <button
          key={lang.locale}
          onClick={() => switchLocale(lang.locale)}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            locale === lang.locale
              ? "bg-blue-50 text-blue-600"
              : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          }`}
        >
          {lang.name}
        </button>
      ))}

      <div className="relative" ref={moreRef}>
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isCurrentMoreLang
              ? "bg-blue-50 text-blue-600"
              : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          }`}
        >
          {isCurrentMoreLang && currentLanguage ? currentLanguage.flag : t("more")}
          <ChevronDown className="h-3 w-3" />
        </button>

        {moreOpen && (
          <LanguageSubmenu
            currentLocale={locale}
            languages={moreLanguages as any}
            setShowLanguageSubmenu={setMoreOpen}
            className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
            itemClassName="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
          />
        )}
      </div>
    </div>
  );
}
