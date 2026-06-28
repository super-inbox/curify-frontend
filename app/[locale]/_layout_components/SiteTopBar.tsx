"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import SearchBar from "@/app/[locale]/_components/SearchBar";
import LocaleSwitcher from "@/app/[locale]/_components/LocaleSwitcher";
import TopicStrip from "@/app/[locale]/_components/TopicStrip";
import { ENTRY_BAR_ITEMS } from "@/lib/entry_bar";
import { resolveTopicPath } from "@/lib/topic_path_overrides";

export default function SiteTopBar({ locale }: { locale: string }) {
  const tHeader = useTranslations("header");
  const tEntryBar = useTranslations("entryBar");
  const pathname = usePathname();
  const isBlogPage =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === `/${locale}/blog` ||
    pathname.startsWith(`/${locale}/blog/`);

  if (isBlogPage) return null;

  // Hide the topic strip on template-detail, example-detail,
  // gallery-prompt-detail, search results, and the tools surface —
  // those have their own in-page navigation (in-hero topic chips /
  // use-case chips for the detail pages, the "Browse:" related-queries
  // row for /search, or the tool cards + "Who it's for" persona chips
  // for /tools and /tools/[slug]), so the topbar strip would duplicate
  // them. Keep SearchBar and LocaleSwitcher visible.
  //
  // On every other page the strip is always visible and lives in the
  // sticky bar's flow. Replaced the old pill EntryBar on 2026-06-29
  // with the Canva-style TopicStrip (singleRow=true to fit a single
  // rail in the sticky bar's vertical budget).
  const hideEntryBar =
    /\/nano-template\/[^/]+/.test(pathname) ||
    /\/nano-banana-pro-prompts\/\d+(?:\/|$)/.test(pathname) ||
    /\/search(?:\/|$|\?)/.test(pathname) ||
    /\/tools(?:\/|$|\?)/.test(pathname);

  // Build TopicStrip items from the curated ENTRY_BAR_ITEMS so the
  // top-bar surface keeps showing the same hand-picked tier-1 topics
  // (world-cup, character, ai-portrait, learning, language, lifestyle,
  // travel, food, visual, product, merch) — not the longer auto-derived
  // template-count list used on /topics/<slug> bottom or home.
  const topbarItems = ENTRY_BAR_ITEMS.map((item) => {
    const labelKey = `items.${item.id}`;
    const label = tEntryBar.has(labelKey) ? tEntryBar(labelKey) : item.id;
    // Use the entry's own slug (e.g. "ai-portrait") as the strip slug
    // so the deterministic color hash and the entry-bar i18n key stay
    // aligned. For routing, prefer the entry's `path` directly so
    // existing destinations (/topics/portrait for ai-portrait) keep
    // working; resolveTopicPath only matters when the path looks like
    // /topics/<slug>.
    const path = item.path.startsWith("/topics/")
      ? resolveTopicPath(item.path.slice("/topics/".length))
      : item.path;
    return { slug: item.id, path, label };
  });

  return (
    <div className="hidden lg:block sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur px-4 pt-3 pb-4">
      {/* Logo + SearchBar + LocaleSwitcher share the first row. Logo
          moved here from the sidebar Header so the sidebar can collapse
          to icon-only width. Logo height ~10% smaller than the prior
          h-16 (64px → 56px = h-14). */}
      <div className="flex items-start gap-4">
        <Link
          href="/"
          aria-label={tHeader("logoAlt")}
          className="relative h-14 w-[140px] shrink-0 self-center"
        >
          <Image
            src="/logo.svg"
            alt={tHeader("logoAlt")}
            fill
            sizes="160px"
            className="object-contain object-left"
            priority
          />
        </Link>
        <div className="flex-1 min-w-0">
          <SearchBar locale={locale} />
        </div>
        <LocaleSwitcher />
      </div>
      {!hideEntryBar && (
        <div className="mt-3">
          <TopicStrip
            items={topbarItems}
            locale={locale}
            trackPrefix="site-topbar-strip"
            singleRow
          />
        </div>
      )}
    </div>
  );
}
