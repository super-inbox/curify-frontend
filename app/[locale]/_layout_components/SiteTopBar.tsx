"use client";

import { usePathname } from "next/navigation";
import SearchBar from "@/app/[locale]/_components/SearchBar";
import LocaleSwitcher from "@/app/[locale]/_components/LocaleSwitcher";
import EntryBar from "@/app/[locale]/_components/EntryBar";

export default function SiteTopBar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isBlogPage =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === `/${locale}/blog` ||
    pathname.startsWith(`/${locale}/blog/`);

  if (isBlogPage) return null;

  return (
    <div className="hidden lg:block sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur px-4 pt-3 pb-4">
      <SearchBar locale={locale} />
      <div className="mt-3 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <EntryBar locale={locale} />
        </div>
        <LocaleSwitcher />
      </div>
    </div>
  );
}
