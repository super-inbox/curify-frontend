"use client";

import Buttons from "./_componentForPage/Buttons";
import Videos from "./_componentForPage/videos/Videos";
import BgParticle from "./_componentForPage/BgParticle";
import SignDrawer from "./_componentForPage/drawer/SignDrawer";
import EmailDrawer from "./_componentForPage/drawer/EmailDrawer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center mt-48 mb-18 mx-auto px-15 max-w-[1280px]">
        <BgParticle />
        <h1 className="text-8xl font-bold text-center text-[var(--c1)] mb-10">
          High-Quality
          <br />
          AI Video Generation
          <br />
          Editing & Localization
        </h1>
        <p className="text-4xl mb-16">
          AI-powered video generation, editing and localization
        </p>
        <Buttons />
        <Videos />
      </div>
      <SignDrawer />
      <EmailDrawer />
    </>
  );
}
