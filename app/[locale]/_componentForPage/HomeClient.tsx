// app/_componentForPage/HomeClient.tsx

"use client";

import Buttons from "./Buttons";
import BgParticle from "./BgParticle";
import SignDrawer from "./drawer/SignDrawer";
import EmailDrawer from "./drawer/EmailDrawer";

export default function HomeClient() {
  return (
    <>
      <div className="relative flex flex-col items-center mt-32 lg:mt-40 mb-18 mx-auto px-6 sm:px-10 max-w-[1280px]">
        <BgParticle />

        {/* Hero Section */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-center text-[var(--c1)] mb-6 leading-tight">
          Power Content Creation with AI
        </h1>
        <p className="text-lg sm:text-2xl lg:text-3xl text-center text-[var(--c2,#95a3b3)] mb-10 max-w-4xl">
          AI-native platform that helps creators, educators, and media teams produce and localize videos, manga, and professional presentations at scale.
        </p>

        <Buttons />

        {/* Feature Section with Demo Video */}
        <section className="w-full mt-24 space-y-20">
          {[
            {
              title: "One-click Video Translation",
              desc: "With just a click, your video can be translated into another language. The original voice tone is cloned and maintained for maximum fidelity, preserving the feel of your original content.",
              reverse: false,
            },
            {
              title: "Emotional Reproduction",
              desc: "Unlike traditional dubbing, we match the emotional tone of the speaker using prosody-aware generation, bringing videos to life in every language.",
              reverse: true,
            },
            {
              title: "Lip Sync",
              desc: "We go beyond speech generation. Our lip sync engine ensures character mouths match audio perfectly — enhancing realism in every frame.",
              reverse: false,
            },
            {
              title: "Subtitle Tool",
              desc: "Automatically generate, remove, or fine-tune subtitles for global accessibility. Add bilingual or monolingual tracks in seconds.",
              reverse: true,
            },
          ].map(({ title, desc, reverse }, i) => (
            <div
              key={i}
              className={`flex flex-col lg:flex-row ${reverse ? "lg:flex-row-reverse" : ""} items-center gap-10`}
            >
              <video
                className="rounded-xl w-full lg:w-1/2 shadow-xl"
                controls
                src="/demo/demo.mp4"
                muted
                loop
              />
              <div className="lg:w-1/2 space-y-4">
                <h3 className="text-2xl sm:text-3xl font-semibold text-[var(--c1)]">{title}</h3>
                <p className="text-md text-white/80 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <SignDrawer />
      <EmailDrawer />
    </>
  );
}
