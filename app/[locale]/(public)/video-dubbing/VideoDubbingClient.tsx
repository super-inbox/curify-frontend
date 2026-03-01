'use client';

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { userAtom, drawerAtom, modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";

type Lang = 'en' | 'zh' | 'es';

export default function VideoDubbingClient() {
  const t = useTranslations("videoDubbing");
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const [, setModalState] = useAtom(modalAtom);
  const setJobType = useSetAtom(jobTypeAtom);

  const [activeLanguage, setActiveLanguage] = useState<Lang>('en');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const languages: Record<Lang, { flag: string; video: string; label: string }> = {
    en: { flag: '🇺🇸', video: '/video/training_en.mp4', label: 'EN' },
    zh: { flag: '🇨🇳', video: '/video/training_zh.mp4', label: 'ZH' },
    es: { flag: '🇪🇸', video: '/video/training_es.mp4', label: 'ES' }
  };

  const videoSrc = languages[activeLanguage].video;

  const handleLanguageSwitch = (lang: Lang) => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    setActiveLanguage(lang);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.src = languages[activeLanguage].video;
    videoRef.current.load();
    videoRef.current.onloadeddata = () => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = currentTime;
      void videoRef.current.play();
    };
  }, [activeLanguage, currentTime]);

  const handleTryItClick = () => {
    if (user?.user_id) {
      setJobType("translation");
      setModalState("add");
    } else {
      setDrawer("signin");
    }
  };

  return (
    <main className="max-w-5xl mx-auto pt-24 px-6 py-12 text-[var(--c2)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--c1)]">{t("title")}</h1>
      <p className="text-lg mb-6">{t("description")}</p>

      {/* Video Section with Language Switcher */}
      <section className="w-full mb-12">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl relative">
            <CdnVideo
              ref={videoRef}
              src={videoSrc}
              className="rounded-xl w-full shadow-2xl"
              controls
              loop
              preload="metadata"
              aria-label={t("demo.aria")}
            />

            {/* Language Switch Buttons */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageSwitch(code as Lang)}
                  className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                    activeLanguage === code
                      ? 'bg-blue-600 text-white shadow-md scale-110'
                      : 'bg-white/80 text-gray-800 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>

            <p className="text-center mt-4 text-[var(--c2)] font-medium">
              {t("demo.nowPlaying", { lang: languages[activeLanguage].label })}
            </p>
            <p className="text-sm text-gray-500 mt-2">{t("demo.caption")}</p>
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleTryItClick}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 px-6 rounded-xl transition"
        >
          {t("cta")}
        </button>
      </div>

      {/* Features Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">{t("why.title")}</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>{t("why.point1")}</li>
          <li>{t("why.point2")}</li>
          <li>{t("why.point3")}</li>
          <li>{t("why.point4")}</li>
          <li>{t("why.point5")}</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">{t("faq.title")}</h2>

        <div className="space-y-6">
          <div>
            <p className="text-base font-medium mb-2">{t("faq.q1")}</p>
            <p className="text-sm text-gray-600">{t("faq.a1")}</p>
          </div>

          <div>
            <p className="text-base font-medium mb-2">{t("faq.q2")}</p>
            <p className="text-sm text-gray-600">{t("faq.a2")}</p>
          </div>

          <div>
            <p className="text-base font-medium mb-2">{t("faq.q3")}</p>
            <p className="text-sm text-gray-600">{t("faq.a3")}</p>
          </div>
        </div>
      </section>

      {/* ✅ New: High-authority SEO content */}
      <section className="mt-20 space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.what.title")}</h2>
          <p className="text-base">{t("deep.what.p1")}</p>
          <p className="text-base">{t("deep.what.p2")}</p>
          <p className="text-base">{t("deep.what.p3")}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.how.title")}</h2>
          <p className="text-base">{t("deep.how.p1")}</p>
          <p className="text-base">{t("deep.how.p2")}</p>
          <p className="text-base">{t("deep.how.p3")}</p>
          <p className="text-base">{t("deep.how.p4")}</p>
          <p className="text-base">{t("deep.how.p5")}</p>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.usecases.title")}</h2>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">{t("deep.usecases.creatorsTitle")}</h3>
            <p className="text-base">{t("deep.usecases.creatorsBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">{t("deep.usecases.educationTitle")}</h3>
            <p className="text-base">{t("deep.usecases.educationBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">{t("deep.usecases.businessTitle")}</h3>
            <p className="text-base">{t("deep.usecases.businessBody")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.compare.title")}</h2>
          <p className="text-base">{t("deep.compare.p1")}</p>
          <p className="text-base">{t("deep.compare.p2")}</p>
        </div>
      </section>
    </main>
  );
}