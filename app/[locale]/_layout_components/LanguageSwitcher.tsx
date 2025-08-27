"use client";

import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname(); // e.g. /en/charge
  const searchParams = useSearchParams();

  const switchLocale = locale === "en" ? "zh" : "en";

  const handleClick = () => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = switchLocale;
    const newPath = "/" + segments.join("/");

    const query = searchParams.toString();
    const fullPath = query ? `${newPath}?${query}` : newPath;

    window.location.replace(fullPath);
  };

  return (
    <button onClick={handleClick}>
      {locale === "en" ? "切换到 简体中文" : "Switch to English"}
    </button>
  );
}
