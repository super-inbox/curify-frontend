"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { groupTools } from "@/lib/tools-registry";
import type { ToolGroupId } from "@/lib/tools-hub";

import BgParticle from "@/app/[locale]/_componentForPage/BgParticle";
import RelatedBlogsByCategory from "@/app/[locale]/_components/RelatedBlogsByCategory";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import CreateNewModal from "./CreateNewModal";

// Group order on the hub. "design" sits after "image" because it consumes what
// the image tools produce.
const GROUP_ORDER: ToolGroupId[] = ["video", "image", "design", "audio"];

export default function ToolsClient() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();

  // Cards, auth gating, modal opening and tool_card tracking all live in the
  // shared ToolsGrid — the same component the home strip, /use-cases/[slug] and
  // the "Other tools" footer render. This page used to hand-roll a second,
  // larger card with its own CTA button and its own copy of that wiring, so the
  // hub looked unlike every other surface and the two implementations drifted.
  const grouped = groupTools();

  const coreFeatures = [
    { title: t("coreFeatures.oneShot.title"), desc: t("coreFeatures.oneShot.desc"), icon: "🎯" },
    { title: t("coreFeatures.toneColor.title"), desc: t("coreFeatures.toneColor.desc"), icon: "🎨" },
    { title: t("coreFeatures.emotional.title"), desc: t("coreFeatures.emotional.desc"), icon: "❤️" },
    { title: t("coreFeatures.lipSync.title"), desc: t("coreFeatures.lipSync.desc"), icon: "👄" },
    { title: t("coreFeatures.subtitle.title"), desc: t("coreFeatures.subtitle.desc"), icon: "📝" },
    { title: t("coreFeatures.languages.title"), desc: t("coreFeatures.languages.desc"), icon: "🌍" },
  ];

  return (
    <>
      <BgParticle />

      <div className="relative flex flex-col items-center mt-0 lg:mt-0 mb-18 mx-auto px-6 sm:px-10 max-w-[1400px]">
        <h1 className="sr-only">{t("tools.meta.title")}</h1>

        {/* Tools hub (grouped) */}
        <section className="w-full mb-14">
          <div className="space-y-10">
            {GROUP_ORDER.map((groupId) =>
              grouped[groupId].length ? (
                <div key={groupId} className="w-full">
                  <h2 className="mb-4 text-xl font-bold text-[var(--c1)] sm:text-2xl">
                    {t(`tools.groups.${groupId}`)}
                  </h2>
                  <ToolsGrid tools={grouped[groupId]} />
                </div>
              ) : null,
            )}
          </div>
        </section>

        {/* Products & Services */}
        <section className="w-full mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              {t("tools.products.title")}
            </h2>
            <p className="text-base sm:text-lg text-[var(--c2)]">
              {t("tools.products.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const isSubtitle = feature.title.toLowerCase().includes("subtitle");
              const isDubbing = feature.title.toLowerCase().includes("translation");

              const card = (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-[var(--c1)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--c2)] leading-relaxed">{feature.desc}</p>
                </div>
              );

              if (isSubtitle) {
                // ✅ these legacy routes redirect to /tools/* already
                return (
                  <Link key={index} href="/bilingual-subtitles" className="block hover:no-underline">
                    {card}
                  </Link>
                );
              }
              if (isDubbing) {
                return (
                  <Link key={index} href="/video-dubbing" className="block hover:no-underline">
                    {card}
                  </Link>
                );
              }
              return <div key={index}>{card}</div>;
            })}
          </div>
        </section>

        {/* Target audience */}
        <section className="w-full mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              {t("tools.audience.title")}
            </h2>
            <ul className="text-base sm:text-lg text-[var(--c2)] leading-relaxed list-disc list-inside space-y-2 text-left">
              <li>{t("tools.audience.v1")}</li>
              <li>{t("tools.audience.v2")}</li>
              <li>{t("tools.audience.v3")}</li>
              <li>{t("tools.audience.v4")}</li>
            </ul>
          </div>
        </section>

        {/* Read about how it works — latest blogs from creator-tools +
            video-translation-dubbing categories. Replaces the prior
            "Upcoming products" video-demo strip; those demos now live on
            their own /tools/<slug> pages (manga-translation, style-transfer). */}
        <section className="w-full mb-20">
          <RelatedBlogsByCategory
            categories={["creator-tools", "video-translation-dubbing"]}
            locale={locale}
            max={3}
            heading={t("tools.relatedReading", {
              defaultValue: "Read about how it works",
            })}
          />
        </section>

        {/* Who uses this — audience-targeted landing pages. Sits below
            the tools grid (WHAT) and the blog row (WHY/HOW). */}
        <section className="w-full mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-6 text-center">
            {t("tools.whoItsFor", { defaultValue: "Who it's for" })}
          </h2>
          <div className="flex justify-center">
            <UseCaseChipsRow />
          </div>
        </section>
      </div>

      {/* ✅ Modal must be rendered in the same component tree where modalAtom is set */}
      <CreateNewModal />
    </>
  );
}