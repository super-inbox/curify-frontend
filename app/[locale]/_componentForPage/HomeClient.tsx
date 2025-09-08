"use client";

import { useState, useRef, useEffect } from "react";
import BgParticle from "./BgParticle";
import SignDrawer from "./drawer/SignDrawer";
import EmailDrawer from "./drawer/EmailDrawer";
import GoogleLoginButton from "../_components/button/GoogleLoginButton";
import Link from "next/link";

export default function HomeClient() {
  const [activeLanguage, setActiveLanguage] = useState<"en" | "zh" | "es">("en");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const languages = {
    en: { flag: "🇺🇸", video: "/video/training_en.mp4", label: "EN" },
    zh: { flag: "🇨🇳", video: "/video/training_zh.mp4", label: "ZH" },
    es: { flag: "🇪🇸", video: "/video/training_es.mp4", label: "ES" },
  };

  const handleLanguageSwitch = (lang: "en" | "zh" | "es") => {
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
        videoRef.current!.currentTime = currentTime;
        videoRef.current!.play(); // ✅ always resume playback on switch
      };
    }
  }, [activeLanguage]);

  return (
    <>
      <BgParticle />
      <div className="relative flex flex-col items-center mt-32 lg:mt-36 mb-18 mx-auto px-6 sm:px-10 max-w-[1280px]">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-center text-[var(--c1)] mb-6 leading-tight">
          Power Content Creation with AI
        </h1>

        <div className="text-center max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl text-[var(--c2)] leading-relaxed">
            Curify Studio is building an AI-native content creation platform that empowers creators and organizations to
            overcome language and format barriers. We solve the challenge of scaling content across global audiences,
            enabling authentic translations that preserve tone, style, and emotional depth. Operating at the intersection
            of media, education, and entertainment, we provide tools for creators to adapt content seamlessly in a rapidly
            globalizing industry.
          </p>
        </div>

        <br />

        {/* Auth Buttons Section */}
        <div className="flex flex-col sm:flex-row gap-8 items-center justify-center mb-8">
          <Link href="/contact">
            <button className="h-14 px-7 rounded-xl text-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
              Book a Demo
            </button>
          </Link>
          <GoogleLoginButton callbackUrl="/workspace" variant="home" />
        </div>

        {/* Demo Video Section */}
        <section className="w-full mt-10 mb-20">
          <div className="text-center mb-8">
            <p className="text-base sm:text-lg text-[var(--c2)] mb-6">
              Watch the same video translated across different languages with preserved emotion and lip sync
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl relative">
              <video
                ref={videoRef}
                className="rounded-xl w-full shadow-2xl"
                controls
                loop
                preload="metadata"
              />

              {/* Capsule Language Buttons */}
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
      </div>

      <SignDrawer />
      <EmailDrawer />
    </>
  );
}
