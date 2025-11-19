'use client';

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { userAtom, drawerAtom, modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";

export default function VideoDubbingClient() {
  const t = useTranslations("videoDubbing");
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setModal = useSetAtom(modalAtom);
  const [, setModalState] = useAtom(modalAtom);
  const setJobType = useSetAtom(jobTypeAtom);

  const [activeLanguage, setActiveLanguage] = useState<'en' | 'zh' | 'es'>('en');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const languages = {
    en: { flag: '🇺🇸', video: '/video/training_en.mp4', label: 'EN' },
    zh: { flag: '🇨🇳', video: '/video/training_zh.mp4', label: 'ZH' },
    es: { flag: '🇪🇸', video: '/video/training_es.mp4', label: 'ES' }
  };


  const handleLanguageSwitch = (lang: 'en' | 'zh' | 'es') => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
    setActiveLanguage(lang);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = languages[activeLanguage].video;
      videoRef.current.load();
      videoRef.current.onloadeddata = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          videoRef.current.play();
        }
      };
    }
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
    <main className="max-w-3xl mx-auto pt-24 px-6 py-12 text-[var(--c2)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--c1)]">
        {t("title")}
      </h1>
      <p className="text-lg mb-6">
        {t("description")}
      </p>

      {/* Video Section with Language Switcher */}
      <section className="w-full mb-12">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl relative">
            <CdnVideo
              ref={videoRef}
              className="rounded-xl w-full shadow-2xl"
              controls
              loop
              preload="metadata"
              aria-label="AI video dubbing demo across multiple languages"
            />
            
            {/* Language Switch Buttons */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageSwitch(code as 'en' | 'zh' | 'es')}
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
              Currently playing: {languages[activeLanguage].label} version
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Example: AI-dubbed video with emotion preservation and lip sync across languages
            </p>
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleTryItClick}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 px-6 rounded-xl transition"
        >
          Try It Free
        </button>
      </div>

      {/* Features Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">
          Why Choose Curify AI Video Dubbing?
        </h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>Natural AI voice cloning that preserves speaker emotion and tone</li>
          <li>Automatic lip sync for seamless viewing experience</li>
          <li>Support for 170+ languages and dialects</li>
          <li>Fast processing with professional quality results</li>
          <li>Perfect for YouTube, TikTok, corporate training, and e-learning</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <div>
            <p className="text-base font-medium mb-2">How accurate is the AI dubbing?</p>
            <p className="text-sm text-gray-600">
              Our AI dubbing uses advanced voice cloning technology to maintain the original speaker's 
              emotional tone and speaking style. The lip sync feature ensures natural-looking results.
            </p>
          </div>

          <div>
            <p className="text-base font-medium mb-2">What languages are supported?</p>
            <p className="text-sm text-gray-600">
              We support over 170 languages including English, Spanish, Chinese, French, German, 
              Japanese, Korean, Arabic, and many more.
            </p>
          </div>

          <div>
            <p className="text-base font-medium mb-2">How long does dubbing take?</p>
            <p className="text-sm text-gray-600">
              Processing time depends on video length, but most videos are ready within minutes. 
              You'll receive a notification when your dubbed video is complete.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}