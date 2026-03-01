// app/[locale]/_components/ContentCreationToolsSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Type, ShoppingBag, Sparkles, History } from "lucide-react";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function SidebarToolItem({
  icon,
  colorClass,
  title,
  desc,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={classNames(
        "group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-neutral-50",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div
        className={classNames(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
          colorClass
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-[15px] font-semibold text-neutral-900">{title}</h4>
          {badge}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function NanoBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
      {label}
    </span>
  );
}

export default function ContentCreationToolsSidebar({
  activeLang,
}: {
  activeLang: "en" | "zh";
}) {
  const router = useRouter();
  const t = useTranslations("contentCreationSidebar");

  // ✅ Dedicated nano template slugs (keep your existing slug conventions)
  const nanoWordCardSlug = "template-word-scene";
  const nanoEcommerceDetailsSlug = "template-fashion-ecommerce";
  const nanoWhatIfHistorySlug = "template-what-if-history";

  const nanoWordCardPath = `/${activeLang}/nano-template/${nanoWordCardSlug}`;
  const nanoEcommerceDetailsPath = `/${activeLang}/nano-template/${nanoEcommerceDetailsSlug}`;
  const nanoWhatIfHistoryPath = `/${activeLang}/nano-template/${nanoWhatIfHistorySlug}`;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-neutral-900">
        {t("title")}
      </h3>

      <div className="space-y-3">
        {/* Tools */}
        <SidebarToolItem
          icon={
            <img
              src="/icons/translation-icon.png"
              alt={t("tools.videoTranslator.alt")}
              className="h-6 w-6"
            />
          }
          colorClass="bg-blue-600"
          title={t("tools.videoTranslator.title")}
          desc={t("tools.videoTranslator.desc")}
          onClick={() => router.push(`/${activeLang}/video-dubbing`)}
        />

        <SidebarToolItem
          icon={
            <img
              src="/icons/subtitle-icon.png"
              alt={t("tools.subtitleGenerator.alt")}
              className="h-6 w-6"
            />
          }
          colorClass="bg-green-500"
          title={t("tools.subtitleGenerator.title")}
          desc={t("tools.subtitleGenerator.desc")}
          onClick={() => router.push(`/${activeLang}/bilingual-subtitles`)}
        />

        {/* Nano templates */}
        <SidebarToolItem
          icon={<Type className="h-5 w-5" />}
          colorClass="bg-purple-500"
          title={t("nano.wordCard.title")}
          desc={t("nano.wordCard.desc")}
          badge={<NanoBadge label={t("nano.badge")} />}
          onClick={() => router.push(nanoWordCardPath)}
        />

        <SidebarToolItem
          icon={<ShoppingBag className="h-5 w-5" />}
          colorClass="bg-sky-500"
          title={t("nano.ecommerceDetails.title")}
          desc={t("nano.ecommerceDetails.desc")}
          badge={<NanoBadge label={t("nano.badge")} />}
          onClick={() => router.push(nanoEcommerceDetailsPath)}
        />

        <SidebarToolItem
          icon={<History className="h-5 w-5" />}
          colorClass="bg-orange-500"
          title={t("nano.whatIfHistory.title")}
          desc={t("nano.whatIfHistory.desc")}
          badge={<NanoBadge label={t("nano.badge")} />}
          onClick={() => router.push(nanoWhatIfHistoryPath)}
        />
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-4">
        <button
          onClick={() => router.push(`/${activeLang}/tools`)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          {t("cta")}
        </button>
      </div>
    </div>
  );
}