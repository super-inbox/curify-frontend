"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { groupTools } from "@/lib/tools-registry";
import type { ToolGroupId } from "@/lib/tools-hub";

import BgParticle from "@/app/[locale]/_componentForPage/BgParticle";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
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

  // -------------------------
  // Language switching demo
  // -------------------------
  const [activeLanguage, setActiveLanguage] = useState<"en" | "zh" | "es">("en");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const hasInteracted = useRef(false);

  const languages = {
    en: { flag: "🇺🇸", video: "/video/training_en.mp4", label: "EN" },
    zh: { flag: "🇨🇳", video: "/video/training_zh.mp4", label: "ZH" },
    es: { flag: "🇪🇸", video: "/video/training_es.mp4", label: "ES" },
  };

  const videoSrc = languages[activeLanguage].video;

  const handleLanguageSwitch = (lang: "en" | "zh" | "es") => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    hasInteracted.current = true;
    setActiveLanguage(lang);
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const restoreAndPlay = () => {
      vid.currentTime = currentTime;
      if (hasInteracted.current) vid.play().catch(() => {});
    };

    vid.onloadeddata = restoreAndPlay;
    return () => {
      vid.onloadeddata = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLanguage]);

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

        {/* Language switching demo */}
        <section className="w-full mt-2 mb-20">
          <div className="text-center mb-8">
            <p className="text-base sm:text-lg text-[var(--c2)] mb-6">
              {t("tools.hero.watch_demo")}
            </p>
          </div>

          <div className="flex flex-col items-center">
            {/* Demo container shrunk ~20% from max-w-2xl (672px) → 538px
                so the video doesn't dominate the hero on wide screens.
                Aspect ratio preserved via w-full + intrinsic video ratio. */}
            <div className="w-full max-w-[538px] relative">
              <CdnVideo
                ref={videoRef}
                src={videoSrc}
                className="rounded-xl w-full shadow-2xl"
                controls
                loop
                preload="metadata"
                aria-label="AI-translated multilingual demo video"
              />

              <p className="text-sm text-gray-500 mt-4">
                {t("tools.hero.transcript_label")}: "{t("tools.hero.training_transcript")}"
              </p>

              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                {Object.entries(languages).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageSwitch(code as "en" | "zh" | "es")}
                    className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                      activeLanguage === code
                        ? "bg-blue-600 text-white shadow-md scale-110"
                        : "bg-white/80 text-gray-800 hover:bg-gray-100 border border-gray-300"
                    }`}
                    type="button"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-center mt-4 text-[var(--c2)] font-medium">
                {t("tools.hero.currently_playing", {
                  label: languages[activeLanguage].label,
                })}
              </p>
            </div>
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