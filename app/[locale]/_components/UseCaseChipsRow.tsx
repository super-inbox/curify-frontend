"use client";

// Just the second row of EntryBar — the use-case pills — extracted so it
// can be mounted on surfaces where the full EntryBar is too heavy or
// hidden behind another UI layer:
//
//   - /nano-template/[slug] (mobile-only — desktop already shows the
//     full EntryBar at the top of the layout)
//   - /nano-template/[slug]/example/[exampleId] (mobile-only, same)
//   - inside the carousel overlay (any viewport — the overlay covers
//     SiteTopBar, so this is the only place to surface the chips there)
//
// Click tracking matches EntryBar's content_id format so the existing
// admin "use-case chip clicks" rollup keeps working unchanged.

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link as IntlLink } from "@/i18n/navigation";

import { USE_CASES } from "@/lib/use-cases";
import { useClickTracking } from "@/services/useTracking";

function UseCaseChip({ slug }: { slug: string }) {
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
          ? "inline-flex items-center rounded-full border border-purple-500 bg-purple-200 px-3.5 py-1.5 text-sm font-semibold text-purple-900 transition"
          : "inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-sm text-purple-800 transition hover:border-purple-400 hover:bg-purple-100"
      }
    >
      {t(`useCases.${slug}`)}
    </IntlLink>
  );
}

export default function UseCaseChipsRow({
  className,
  showQuestion = false,
}: {
  className?: string;
  /**
   * Show the "Explore by Use Case:" prefix label. Default off — the
   * chips now stand on their own (matches the EntryBar treatment).
   * Callers can still opt back in if they want the lead-in label.
   */
  showQuestion?: boolean;
}) {
  const t = useTranslations("entryBar");

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-2",
        className ?? "",
      ].join(" ")}
    >
      {showQuestion && (
        <span className="text-sm font-medium text-neutral-700">
          {t("useCasesQuestion")}
        </span>
      )}
      {USE_CASES.map((uc) => (
        <UseCaseChip key={uc.slug} slug={uc.slug} />
      ))}
    </div>
  );
}
