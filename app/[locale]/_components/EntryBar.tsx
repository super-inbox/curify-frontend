"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { ENTRY_BAR_ITEMS } from "@/lib/entry_bar";
import { getCanonicalPath } from "@/lib/canonical";
import { useClickTracking } from "@/services/useTracking";
import UseCaseChipsRow from "./UseCaseChipsRow";

type Props = {
  locale: string;
  className?: string;
};

type ItemProps = {
  item: {
    id: string;
    emoji?: string;
    path: string;
    isHot?: boolean;
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
      {item.isHot ? (
        <span aria-label="Hot" className="ml-0.5 text-base leading-none">
          🔥
        </span>
      ) : null}
    </Link>
  );
}

export default function EntryBar({ locale, className }: Props) {
  const t = useTranslations("entryBar");

  return (
    <section
      className={[
        "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm",
        className ?? "",
      ].join(" ")}
      aria-label={t("question")}
    >
      <div className="flex flex-wrap gap-2">
        {ENTRY_BAR_ITEMS.map((item) => (
          <EntryBarItem key={item.id} item={item} locale={locale} />
        ))}
      </div>

      {/* Second row — persona nav, restored alongside the tier-1 topic
          capsules. The "Explore by Use Case:" lead-in label is opt-in
          via showQuestion so visitors immediately understand what the
          chips mean instead of seeing six unlabeled persona pills. */}
      <div className="mt-2">
        <UseCaseChipsRow showQuestion />
      </div>
    </section>
  );
}
