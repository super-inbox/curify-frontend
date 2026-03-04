// app/[locale]/_components/LanguageSwitchVideoDemo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";

export type DemoLangKey = string;

export type LanguageSwitchVideoDemoProps = {
  ariaLabel: string;
  caption?: string;
  nowPlayingText: (label: string) => string;

  // { en: {flag, video, label}, zh: ... }
  languages: Record<DemoLangKey, { flag: string; video: string; label: string }>;

  // optional default
  defaultLang?: DemoLangKey;

  // optional: position of buttons
  buttonsClassName?: string;
};

export default function LanguageSwitchVideoDemo(props: LanguageSwitchVideoDemoProps) {
  const { ariaLabel, caption, nowPlayingText, languages, defaultLang, buttonsClassName } = props;

  const keys = Object.keys(languages);
  const initialLang = defaultLang && languages[defaultLang] ? defaultLang : keys[0];

  const [activeLanguage, setActiveLanguage] = useState<DemoLangKey>(initialLang);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const videoSrc = languages[activeLanguage]?.video;

  const handleLanguageSwitch = (lang: DemoLangKey) => {
    if (!languages[lang]) return;
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

  return (
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
            aria-label={ariaLabel}
          />

          <div
            className={
              buttonsClassName ??
              "absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-10"
            }
          >
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSwitch(code)}
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
            {nowPlayingText(languages[activeLanguage].label)}
          </p>

          {caption ? <p className="text-sm text-gray-500 mt-2">{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}