"use client";

import { useState, useRef, useEffect } from "react";
import Buttons from "./Buttons";
import BgParticle from "./BgParticle";
import SignDrawer from "./drawer/SignDrawer";
import EmailDrawer from "./drawer/EmailDrawer";
import GoogleLoginButton from "../_components/button/GoogleLoginButton";
import Link from 'next/link';

export default function HomeClient() {
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
        videoRef.current!.currentTime = currentTime;
        videoRef.current!.play();
      };
    }
  }, [activeLanguage]);

  const coreFeatures = [
    { title: "One-Shot Translation", desc: "Complete video translation with voice-over, subtitles, and lip sync in a single process.", icon: "🎯" },
    { title: "Tone Color Preservation", desc: "Maintains the original speaker's unique voice characteristics and tonal qualities.", icon: "🎨" },
    { title: "Emotional Speech", desc: "AI reproduces emotional nuances, ensuring authentic expression across languages.", icon: "❤️" },
    { title: "Lip Sync Technology", desc: "Advanced lip synchronization that perfectly matches mouth movements to translated audio.", icon: "👄" },
    { title: "Subtitle Captioner", desc: "Intelligent subtitle generation with precise timing and natural language flow.", icon: "📝" },
    { title: "170+ Languages", desc: "Translate your content into over 170 languages with native-level accuracy.", icon: "🌍" }
  ];

  const upcomingProducts = [
    { title: "Subtitle Removal", desc: "AI-powered subtitle removal that cleanly erases existing text while preserving video quality.", icon: "🧹", status: "Coming Q3 2025" },
    { title: "Manga Translation", desc: "Automated manga and comic translation with text detection, bubble editing, and cultural adaptation.", icon: "📚", status: "Coming Q3 2025" },
    { title: "Templated Video Generation", desc: "Create professional videos from templates with AI-generated content and custom branding.", icon: "🎬", status: "Coming Q4 2025" }
  ];

  return (
    <>
    <BgParticle />
      <div className="relative flex flex-col items-center mt-24 lg:mt-28 mb-18 mx-auto px-6 sm:px-10 max-w-[1280px]">
        

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
  {/* Book a Demo CTA */}
  <Link href="/contact">
    <button className="h-14 px-7 rounded-xl text-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
      Book a Demo
    </button>
  </Link>

  {/* Google Button */}
  <GoogleLoginButton callbackUrl="/workspace?fromLocalStorage=true" variant="home" />
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

              {/* Capsule Language Buttons with Flag + Abbreviation */}
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
            </div>
          </div>
        </section>

        {/* Products & Services */}
        <section className="w-full mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">Products & Services</h2>
            <p className="text-base sm:text-lg text-[var(--c2)]">
              Our AI-driven solutions are live and continuously improving — already used by creators and teams worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[var(--c1)] mb-3">{feature.title}</h3>
                <p className="text-sm text-[var(--c2)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Audience */}
        <section className="w-full mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">Our Target Audience</h2>
            <ul className="text-base sm:text-lg text-[var(--c2)] leading-relaxed list-disc list-inside space-y-2 text-left">
              <li>🎥 Video creators and YouTubers expanding to global markets</li>
              <li>📖 Educators and knowledge platforms converting books to lectures</li>
              <li>🎶 Media and entertainment companies localizing content across languages</li>
              <li>📚 Manga publishers and fan translators automating translation and typesetting</li>
            </ul>
          </div>
        </section>

        {/* Upcoming Products */}
        <section className="w-full mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c1)] mb-4">Coming Soon</h2>
            <p className="text-base sm:text-lg text-[var(--c2)]">
              Next-generation features in development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingProducts.map((product, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-2 right-2 bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium">
                  {product.status}
                </div>
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold text-[var(--c1)] mb-3">{product.title}</h3>
                <p className="text-sm text-[var(--c2)] leading-relaxed mb-4">{product.desc}</p>
                <video
                  className="rounded-lg shadow-md w-full mt-auto"
                  controls
                  loop
                  src={`/video/demo_${product.title.toLowerCase().replace(/\s+/g, "_")}.mp4`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

    </>
  );
}