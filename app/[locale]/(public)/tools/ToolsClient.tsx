"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAtom } from "jotai";
import { modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import BgParticle from "@/app/[locale]/_componentForPage/BgParticle";
import GoogleLoginButton from "@/app/[locale]/_components/button/GoogleLoginButton";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";

export default function ToolsClient() {
  const [, setModalState] = useAtom(modalAtom);
  const [, setJobType] = useAtom(jobTypeAtom);
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();

  const openModal = useCallback(
    (mode: "translation" | "subtitles") => {
      setJobType(mode);
      setModalState("add");
    },
    [setJobType, setModalState]
  );

  // ---------------------------
  // Tools hub cards (existing)
  // ---------------------------
  const tools = [
    {
      id: "video-dubbing",
      title: t("tools.video_dubbing.title"),
      desc: t("tools.video_dubbing.desc"),
      status: "create" as const,
      onClick: () => openModal("translation"),
    },
    {
      id: "subtitle-captioner",
      title: (
        <span>
          {t("tools.subtitle_captioner.title")}{" "}
          <span className="text-red-600 font-bold">for FREE</span>
        </span>
      ),
      desc: t("tools.subtitle_captioner.desc"),
      status: "create" as const,
      onClick: () => openModal("subtitles"),
    },
    {
      id: "lip-syncing",
      title: t("tools.lip_syncing.title"),
      desc: t("tools.lip_syncing.desc"),
      status: "coming_soon" as const,
      onClick: () => alert("Launch lip sync flow"),
    },
    {
      id: "style-transfer",
      title: t("tools.style_transfer.title"),
      desc: t("tools.style_transfer.desc"),
      status: "coming_soon" as const,
      onClick: () => alert("Style transfer feature coming soon"),
    },
  ];

  // ---------------------------
  // Language switching demo (from HomeClient)
  // ---------------------------
  const [activeLanguage, setActiveLanguage] = useState<"en" | "zh" | "es">("en");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const languages = {
    en: { flag: "🇺🇸", video: "/video/training_en.mp4", label: "EN" },
    zh: { flag: "🇨🇳", video: "/video/training_zh.mp4", label: "ZH" },
    es: { flag: "🇪🇸", video: "/video/training_es.mp4", label: "ES" },
  };

  const videoSrc = languages[activeLanguage].video;

  const handleLanguageSwitch = (lang: "en" | "zh" | "es") => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    setActiveLanguage(lang);
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const restoreAndPlay = () => {
      vid.currentTime = currentTime;
      vid.play().catch(() => {});
    };

    vid.onloadeddata = restoreAndPlay;
    return () => {
      vid.onloadeddata = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLanguage]);

  // ---------------------------
  // Feature sections (from HomeClient)
  // ---------------------------
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

      <div className="relative flex flex-col items-center mt-28 lg:mt-36 mb-18 mx-auto px-6 sm:px-10 max-w-[1280px]">

        {/* --------------------------- */}
        {/* Tools grid (central hub) */}
        {/* --------------------------- */}
        <section className="w-full mb-14">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-2xl shadow-lg p-5 flex flex-col justify-between bg-white bg-[linear-gradient(135deg,_#E0E7FF_0%,_#F0F4FF_100%)] border border-gray-100"
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tool.desc}</p>
                </div>

                {tool.status === "create" ? (
                  <button
                    onClick={tool.onClick}
                    className="mt-4 w-full text-white px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] hover:opacity-90 transition-opacity duration-300 shadow-lg cursor-pointer"
                    type="button"
                  >
                    {t("tools.create")}
                  </button>
                ) : (
                  <p className="mt-4 text-center text-blue-500 font-semibold italic text-lg">
                    {t("tools.coming_soon")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------- */}
        {/* Language switching demo */}
        {/* --------------------------- */}
        <section className="w-full mt-2 mb-20">
          <div className="text-center mb-8">
            <p className="text-base sm:text-lg text-[var(--c2)] mb-6">
              Watch the same video translated across different languages with preserved emotion and lip sync
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl relative">
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
                Transcript: "Welcome to Curify Studio. In this video, we showcase how AI translates and dubs content across languages..."
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
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-center mt-4 text-[var(--c2)] font-medium">
                Currently playing: {languages[activeLanguage].label} version
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------- */}
        {/* Products & Services (core features) */}
        {/* --------------------------- */}
        <section className="w-full mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              Products & Services
            </h2>
            <p className="text-base sm:text-lg text-[var(--c2)]">
              Our AI-driven solutions are live and continuously improving — already used by creators and teams worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const isSubtitle = feature.title.toLowerCase().includes("subtitle");
              const isDubbing = feature.title.toLowerCase().includes("translation");

              const card = (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-[var(--c1)] mb-3">{feature.title}</h3>
                  <p className="text-sm text-[var(--c2)] leading-relaxed">{feature.desc}</p>
                </div>
              );

              if (isSubtitle) {
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

        {/* --------------------------- */}
        {/* Target audience */}
        {/* --------------------------- */}
        <section className="w-full mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              Our Target Audience
            </h2>
            <ul className="text-base sm:text-lg text-[var(--c2)] leading-relaxed list-disc list-inside space-y-2 text-left">
              <li>🎥 Video creators and YouTubers expanding to global markets</li>
              <li>📖 Educators and knowledge platforms converting books to lectures</li>
              <li>🎶 Media and entertainment companies localizing content across languages</li>
              <li>📚 Manga publishers and fan translators automating translation and typesetting</li>
            </ul>
          </div>
        </section>

        {/* --------------------------- */}
        {/* Upcoming products */}
        {/* --------------------------- */}
        <section className="w-full mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              {t("upcoming.title")}
            </h2>
            <p className="text-base sm:text-lg text-[var(--c2)]">
              {t("upcoming.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["styleTransfer", "mangaTranslation", "templatedVideo"].map((key, index) => {
              const transcriptKey = `upcoming.${key}.transcript`;

              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 relative overflow-hidden flex flex-col"
                >
                  <h3 className="text-xl font-bold text-[var(--c1)] mb-3">
                    {t(`upcoming.${key}.title`)}
                  </h3>
                  <p className="text-sm text-[var(--c2)] leading-relaxed mb-4">
                    {t(`upcoming.${key}.desc`)}
                  </p>

                  <CdnVideo
                    className="rounded-lg shadow-md w-full mt-auto"
                    controls
                    loop
                    src={`/video/demo_${key}.mp4`}
                    aria-label={`Demo video for ${t(`upcoming.${key}.title`)}`}
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Transcript: {transcriptKey}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
