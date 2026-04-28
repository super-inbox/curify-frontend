"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link as IntlLink } from "@/i18n/navigation";

import { ENTRY_BAR_ITEMS } from "@/lib/entry_bar";
import { USE_CASES } from "@/lib/use-cases";
import { getCanonicalPath } from "@/lib/canonical";
import { useClickTracking } from "@/services/useTracking";
import SearchBar from "./SearchBar";

type Props = {
  locale: string;
  className?: string;
};

type ItemProps = {
  item: {
    id: string;
    emoji?: string;
    path: string;
  };
  locale: string;
};

function EntryBarItem({ item, locale }: ItemProps) {
  const t = useTranslations("entryBar");
  const pathname = usePathname();

  const trackClick = useClickTracking(
    `entry-bar:${item.id}`,
    "topic_capsule",
    "cards"
  );

  const href = getCanonicalPath(locale, item.path);
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={trackClick}
      className={
        isActive
          ? "inline-flex items-center gap-2 rounded-full border border-blue-500 bg-blue-200 px-4 py-2 text-sm font-semibold text-blue-900 transition"
          : "inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 transition hover:border-blue-400 hover:bg-blue-100"
      }
    >
      {item.emoji ? <span aria-hidden="true">{item.emoji}</span> : null}
      <span>{t(`items.${item.id}`)}</span>
    </Link>
  );
}

function UseCaseBarItem({ slug }: { slug: string }) {
  const t = useTranslations("entryBar");
  const pathname = usePathname();
  const trackClick = useClickTracking(
    `use-case:${slug}`,
    "topic_capsule",
    "cards"
  );

  const isActive =
    pathname === `/use-cases/${slug}` ||
    pathname.endsWith(`/use-cases/${slug}`);

  return (
    <IntlLink
      href={`/use-cases/${slug}`}
      onClick={trackClick}
      className={
        isActive
          ? "inline-flex items-center rounded-full border border-purple-500 bg-purple-200 px-4 py-2 text-sm font-semibold text-purple-900 transition"
          : "inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-800 transition hover:border-purple-400 hover:bg-purple-100"
      }
    >
      {t(`useCases.${slug}`)}
    </IntlLink>
  );
}

export default function EntryBar({ locale, className }: Props) {
  const t = useTranslations("entryBar");
  const pathname = usePathname();

  const isBlogPage =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === `/${locale}/blog` ||
    pathname.startsWith(`/${locale}/blog/`);

  if (isBlogPage) return null;

  return (
    <div className="hidden lg:block sticky top-0 z-40 bg-[#FDFDFD]/95 px-4 pt-3 pb-4 backdrop-blur md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
        <div className="w-full max-w-[1080px]">
          <section
            className={[
              "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm",
              className ?? "",
            ].join(" ")}
            aria-label={t("question")}
          >
            <div className="flex flex-col gap-3">
              <SearchBar locale={locale} />

              <div className="flex flex-wrap gap-2">
                {ENTRY_BAR_ITEMS.map((item) => (
                  <EntryBarItem key={item.id} item={item} locale={locale} />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-neutral-800">
                  {t("useCasesQuestion")}
                </span>
                {USE_CASES.map((uc) => (
                  <UseCaseBarItem key={uc.slug} slug={uc.slug} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}