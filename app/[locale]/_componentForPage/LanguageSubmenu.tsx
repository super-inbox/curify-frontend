
"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { allLanguages } from "@/lib/language_config";

interface LanguageSubmenuProps {
  currentLocale: string;
  onClose?: () => void;
  setShowLanguageSubmenu: (show: boolean) => void;
  languages?: typeof allLanguages;
  className?: string;
  itemClassName?: string;
}

export default function LanguageSubmenu({
  currentLocale,
  onClose,
  setShowLanguageSubmenu,
  languages = allLanguages,
  className = "absolute right-full top-0 w-72 -mr-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10",
  itemClassName = "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer",
}: LanguageSubmenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className={className}>
      {languages.map((lang) => {
        // Handle inconsistent property naming: 'code' vs 'locale'
        const langCode = lang.code || (lang as any).locale;
        
        return (
          <button
            key={langCode}
            onClick={() => {
              const currentSearchParams = new URLSearchParams(searchParams.toString());
              const queryString = currentSearchParams.toString();
              const newPath = queryString ? `${pathname}?${queryString}` : pathname;

              router.replace(newPath, { locale: langCode });
              setShowLanguageSubmenu(false);
              if (onClose) onClose();
            }}
            className={`${itemClassName} ${
              langCode === currentLocale
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700"
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        );
      })}
    </div>
  );
}
