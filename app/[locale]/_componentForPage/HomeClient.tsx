"use client";

import { useState, useRef, useEffect } from "react";
import Buttons from "./Buttons";
import BgParticle from "./BgParticle";
import SignDrawer from "./drawer/SignDrawer";
import EmailDrawer from "./drawer/EmailDrawer";
import GoogleLoginButton from "../_components/button/GoogleLoginButton";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CdnVideo from "../_components/CdnVideo";

export default function HomeClient() {
  const [activeLanguage, setActiveLanguage] = useState<"en" | "zh" | "es">("en");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const { locale } = useParams();
  const t = useTranslations();

  // Mapping language → static CDN video path
  const languages = {
    en: { flag: "🇺🇸", video: "/video/training_en.mp4", label: "EN" },
    zh: { flag: "🇨🇳", video: "/video/training_zh.mp4", label: "ZH" },
    es: { flag: "🇪🇸", video: "/video/training_es.mp4", label: "ES" },
  };

  // Always derive src directly from state (React way)
  const videoSrc = languages[activeLanguage].video;

  const handleLanguageSwitch = (lang: "en" | "zh" | "es") => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
    setActiveLanguage(lang);
  };

  // Restore playback position + autoplay after switching language
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
  }, [activeLanguage]);

  const coreFeatures = [
    {
      title: t("coreFeatures.oneShot.title"),
      desc: t("coreFeatures.oneShot.desc"),
      icon: "🎯",
    },
    {
      title: t("coreFeatures.toneColor.title"),
      desc: t("coreFeatures.toneColor.desc"),
      icon: "🎨",
    },
    {
      title: t("coreFeatures.emotional.title"),
      desc: t("coreFeatures.emotional.desc"),
      icon: "❤️",
    },
    {
      title: t("coreFeatures.lipSync.title"),
      desc: t("coreFeatures.lipSync.desc"),
      icon: "👄",
    },
    {
      title: t("coreFeatures.subtitle.title"),
      desc: t("coreFeatures.subtitle.desc"),
      icon: "📝",
    },
    {
      title: t("coreFeatures.languages.title"),
      desc: t("coreFeatures.languages.desc"),
      icon: "🌍",
    },
  ];

  const upcomingProducts = [
    {
      title: t("upcoming.styleTransfer.title"),
      desc: t("upcoming.styleTransfer.desc"),
      icon: "🎨",
      status: t("upcoming.statusQ3"),
    },
    {
      title: t("upcoming.mangaTranslation.title"),
      desc: t("upcoming.mangaTranslation.desc"),
      icon: "📚",
      status: t("upcoming.statusQ3"),
    },
    {
      title: t("upcoming.templatedVideo.title"),
      desc: t("upcoming.templatedVideo.desc"),
      icon: "🎬",
      status: t("upcoming.statusQ4"),
    },
  ];

  return (
    <>
      <BgParticle />

      <div className="relative flex flex-col items-center mt-36 lg:mt-40 mb-18 mx-auto px-6 sm:px-10 max-w-[1280px]">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-center text-[var(--c1)] mb-6 leading-tight">
          {t("home.hero.title")}
        </h1>

        <div className="text-center max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl text-[var(--c2)] leading-relaxed">
            {t("home.hero.description")}
          </p>
        </div>

        <br />

        <div className="flex flex-col sm:flex-row gap-8 items-center justify-center mb-8">
          <a href={`/${locale}/contact`}>
            <button className="h-14 px-7 rounded-xl text-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
              Book a Demo
            </button>
          </a>

          <GoogleLoginButton
            callbackUrl="/workspace?fromLocalStorage=true"
            variant="home"
          />
        </div>

        {/* -------------------------------------------------- */}
        {/* LANGUAGE SWITCHING CDN VIDEO DEMO */}
        {/* -------------------------------------------------- */}
        <section className="w-full mt-10 mb-20">
          <div className="text-center mb-8">
            <p className="text-base sm:text-lg text-[var(--c2)] mb-6">
              Watch the same video translated across different languages with
              preserved emotion and lip sync
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
                Transcript: "Welcome to Curify Studio. In this video, we
                showcase how AI translates and dubs content across languages..."
              </p>

              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                {Object.entries(languages).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() =>
                      handleLanguageSwitch(code as "en" | "zh" | "es")
                    }
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

        {/* -------------------------------------------------- */}
        {/* PRODUCTS & SERVICES */}
        {/* -------------------------------------------------- */}
        <section className="w-full mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              Products & Services
            </h2>
            <p className="text-base sm:text-lg text-[var(--c2)]">
              Our AI-driven solutions are live and continuously improving —
              already used by creators and teams worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const isSubtitle =
                feature.title.toLowerCase().includes("subtitle");
              const isDubbing =
                feature.title.toLowerCase().includes("translation");

              const card = (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-[var(--c1)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--c2)] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );

              if (isSubtitle) {
                return (
                  <a
                    key={index}
                    href="/bilingual-subtitles"
                    className="block hover:no-underline"
                  >
                    {card}
                  </a>
                );
              }

              if (isDubbing) {
                return (
                  <a
                    key={index}
                    href="/video-dubbing"
                    className="block hover:no-underline"
                  >
                    {card}
                  </a>
                );
              }

              return <div key={index}>{card}</div>;
            })}
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* TARGET AUDIENCE */}
        {/* -------------------------------------------------- */}
        <section className="w-full mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">
              Our Target Audience
            </h2>
            <ul className="text-base sm:text-lg text-[var(--c2)] leading-relaxed list-disc list-inside space-y-2 text-left">
              <li>
                🎥 Video creators and YouTubers expanding to global markets
              </li>
              <li>
                📖 Educators and knowledge platforms converting books to
                lectures
              </li>
              <li>
                🎶 Media and entertainment companies localizing content across
                languages
              </li>
              <li>
                📚 Manga publishers and fan translators automating translation
                and typesetting
              </li>
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* UPCOMING PRODUCTS */}
        {/* -------------------------------------------------- */}
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
            {["styleTransfer", "mangaTranslation", "templatedVideo"].map(
              (key, index) => {
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
                      src={`/video/demo_${key}.mp4`} // served from CDN
                      aria-label={`Demo video for ${t(
                        `upcoming.${key}.title`
                      )}`}
                    />

                    <p className="text-xs text-gray-400 mt-2">
                      Transcript: {transcriptKey}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </section>
      </div>
    </>
  );
}
