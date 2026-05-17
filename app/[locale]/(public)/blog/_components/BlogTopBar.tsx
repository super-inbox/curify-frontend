"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import SearchBar from "@/app/[locale]/_components/SearchBar";
import LocaleSwitcher from "@/app/[locale]/_components/LocaleSwitcher";
import blogs from "@/public/data/blogs.json";

type BlogIndexEntry = { slug: string; title: string };

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/[a-zA-Z]{2}(?=\/|$)/, "") || "/";
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BlogTopBar({ locale }: { locale: string }) {
  const pathname = usePathname();

  const breadcrumbItems = useMemo(() => {
    const path = stripLocale(pathname);
    const segments = path.split("/").filter(Boolean);
    // segments will be ["blog"] for the list, or ["blog", "<slug>"] for a post.
    const localePrefix = locale === "en" ? "" : `/${locale}`;

    const items: { name: string; href?: string }[] = [
      { name: "Home", href: `${localePrefix}/` },
      { name: "Blog", href: `${localePrefix}/blog` },
    ];

    if (segments[0] === "blog" && segments[1]) {
      const slug = decodeURIComponent(segments[1]);
      const entry = (blogs as BlogIndexEntry[]).find((b) => b.slug === slug);
      items.push({ name: entry?.title ?? humanizeSlug(slug) });
    }

    // Mark the last entry as current (no href).
    items[items.length - 1] = { ...items[items.length - 1], href: undefined };
    return items;
  }, [pathname, locale]);

  return (
    <div className="sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur px-4 pt-3 pb-3 -mx-4 -mt-4 mb-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 border-b border-neutral-200/60">
      {/* Row 1: search (flex-1) + locale switcher (desktop only — mobile uses Header's floater) */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <SearchBar locale={locale} />
        </div>
        <div className="hidden lg:block shrink-0">
          <LocaleSwitcher />
        </div>
      </div>

      {/* Row 2: breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-neutral-600"
      >
        {breadcrumbItems.map((item, i) => (
          <div key={`${item.name}-${i}`} className="flex items-center">
            {i > 0 && <ChevronRight className="mx-1 h-4 w-4 text-neutral-400" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-neutral-900 transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-neutral-900 font-medium line-clamp-1">{item.name}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
