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

  // Hide the EntryBar (tier-1 topic capsules + use-case chip row) on
  // template-detail, example-detail, gallery-prompt-detail, search
  // results, and the tools surface — those have their own in-page
  // navigation (in-hero topic chips / use-case chips for the detail
  // pages, the "Browse:" related-queries row for /search, or the tool
  // cards + "Who it's for" persona chips for /tools and /tools/[slug]),
  // so the EntryBar duplicates them. Keep SearchBar and LocaleSwitcher
  // visible.
  //
  // On every other page the EntryBar is always visible and lives in the
  // sticky bar's flow. Earlier iterations tried scroll-driven folding —
  // either reflow-flashed the page content on toggle (in-flow conditional
  // render) or masked the content underneath (absolute positioning). The
  // reading-area gain wasn't worth either trade-off, so the fold logic
  // is gone.
  const hideEntryBar =
    /\/nano-template\/[^/]+/.test(pathname) ||
    /\/nano-banana-pro-prompts\/\d+(?:\/|$)/.test(pathname) ||
    /\/search(?:\/|$|\?)/.test(pathname) ||
    /\/tools(?:\/|$|\?)/.test(pathname);

  return (
    <div className="hidden lg:block sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur px-4 pt-3 pb-4">
      {/* LocaleSwitcher lives in the SearchBar row so that hiding the
          EntryBar collapses the sticky-bar height cleanly. */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <SearchBar locale={locale} />
        </div>
        <LocaleSwitcher />
      </div>
      {!hideEntryBar && (
        <div className="mt-3">
          <EntryBar locale={locale} />
        </div>
      )}
    </div>
  );
}
