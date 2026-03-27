"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { ENTRY_BAR_ITEMS } from "@/lib/entry_bar";
import { getCanonicalPath } from "@/lib/canonical";
import { useClickTracking } from "@/services/useTracking";

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

  const trackClick = useClickTracking(
    `entry-bar:${item.id}`,
    "topic_capsule",
    "cards"
  );

  const href = getCanonicalPath(locale, item.path);

  return (
    <Link
      href={href}
      onClick={trackClick}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
    >
      {item.emoji ? <span aria-hidden="true">{item.emoji}</span> : null}
      <span>{t(`items.${item.id}`)}</span>
    </Link>
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
    <section
      className={[
        "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm",
        className ?? "",
      ].join(" ")}
      aria-label={t("question")}
    >
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-neutral-800 sm:text-base">
          {t("question")}
        </div>

        <div className="flex flex-wrap gap-2">
          {ENTRY_BAR_ITEMS.map((item) => (
            <EntryBarItem key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}