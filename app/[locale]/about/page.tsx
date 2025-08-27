// app/[locale]/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Curify | Vision, Technology & Team",
  description:
    "Learn about Curify's vision to democratize content creation with AI. Discover our multi-modal technology, expressive speech, translation tools, and meet the founding team.",
};

export default function AboutPage() {
  return (
    <main className="relative mx-auto max-w-[1280px] px-6 sm:px-10 py-16 space-y-20">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--c1)]">
          About Curify
        </h1>
        <Link
          href="/"
          className="text-sm sm:text-base font-medium text-[var(--c1)] hover:opacity-80 underline underline-offset-4"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Section 1: Vision */}
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">
            “Power Your Content with AI”
          </h2>
          <p className="text-white/90 mb-2">
            Our mission is to leverage AI technology to make the internationalization of videos efficient and simple,
            enabling anyone—regardless of their expertise—to have their work seen, understood, and appreciated.
          </p>
          <p className="text-white/90 mb-2">
            We firmly believe that language shouldn't be a barrier between people, and we’re driven to start with video.
          </p>
          <p className="text-white/90">
            Every story, impact, and culture deserves to be seen—as the world continues to innovate and develop more
            products that cover diverse media, we aim to break down language barriers and contribute to the diversity of
            communication around the world.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            src="/curify_logo_icon.png"
            alt="Curify Logo"
            width={160}
            height={160}
            className="rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* Section 2: Technologies */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Technologies</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { title: "Technology A", desc: "Introduction Introduction Introduction Introduction Introduction" },
            { title: "Technology B", desc: "Introduction Introduction Introduction Introduction Introduction" },
            { title: "Technology C", desc: "Introduction Introduction Introduction Introduction Introduction" },
            { title: "Technology D", desc: "Introduction Introduction Introduction Introduction Introduction" },
          ].map((tech, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md backdrop-blur"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{tech.title}</h3>
                <span className="text-white/60">▾</span>
              </div>
              <p className="mt-2 text-white/80 text-sm">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Team */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Teams</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            {
              name: "Jay",
              role: "Founder",
              image: "/team/jay.jpg",
              desc: "19+ years ML, PhD, Twitter & Kuaishou. Founder.",
            },
            {
              name: "Ting",
              role: "GTM",
              image: "/team/placeholder.png",
              desc: "Biz Dev & Strategy.",
            },
            {
              name: "Rafi",
              role: "ML Engineer",
              image: "/team/placeholder.png",
              desc: "TTS & CV Systems.",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-center"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={120}
                height={120}
                className="mx-auto mb-3 rounded-full object-cover"
              />
              <h3 className="text-base font-semibold">{member.name}</h3>
              <p className="text-white/70 text-sm mb-1">{member.role}</p>
              <p className="text-white/60 text-xs">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
