"use client";

import { useState } from "react";
import Image from "next/image";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const technologies = [
  {
    key: "multimodal",
    title: "Multi-modal Recognition",
    desc: "We combine speech and subtitle signals to achieve more accurate and robust transcription. This dual-channel recognition reduces errors and ensures better alignment with the original content, especially in noisy or complex audio scenes.",
    image: "/images/multimodal.png",
  },
  {
    key: "emotional",
    title: "Emotional Speech",
    desc: "Our voice synthesis models generate expressive, emotionally rich speech that enhances storytelling and viewer engagement. By capturing tone, rhythm, and nuance, we make AI voices feel more human and relatable.",
    image: "/images/emotional-speech.png",
  },
  {
    key: "lengthaware",
    title: "Length-aware Translation and Customization",
    desc: "We optimize translations not just for accuracy, but also for timing and pacing—crucial for video and voice alignment. Users can further customize tone, length, and phrasing to suit different content needs or audience preferences.",
    image: "/images/length-aware.jpg",
  },
  {
    key: "controlled",
    title: "Controlled Video Generation",
    desc: "We enable structured, template-driven video generation with controllable visual elements and transitions. This gives creators both creative freedom and production consistency, reducing manual effort while ensuring high-quality output.",
    image: "/images/controlled-video.gif",
  },
];

export default function AboutClient() {
  const [selectedTech, setSelectedTech] = useState(technologies[0]);

  return (
    <main className="relative mx-auto max-w-[1280px] px-6 pt-20 sm:px-10 py-16 space-y-20 bg-white text-gray-800">
      {/* Section 1: Vision */}
      <section className="text-center space-y-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Our Vision</h2>
        <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Our mission is to leverage AI technology to make video internationalization efficient, expressive, and
          effortless—empowering anyone, anywhere, to share their voice across languages and cultures.
        </p>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 italic px-6 py-4 rounded-xl shadow-md inline-block mt-4 text-2xl">
          “Empowering every voice to be heard, across every language.”
        </div>
      </section>

      {/* Section 2: Technology */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">Technology Spotlight</h2>
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <Image
              src={selectedTech.image}
              alt={selectedTech.title}
              width={480}
              height={320}
              className="rounded-lg shadow-md mx-auto"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {technologies.map((tech) => (
              <div
                key={tech.key}
                onMouseEnter={() => setSelectedTech(tech)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedTech.key === tech.key
                    ? "bg-blue-100 border-blue-400 shadow-md"
                    : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <h3 className="font-semibold text-lg mb-1">{tech.title}</h3>
                <p className="text-sm text-gray-700">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Meet the Team */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">Meet the Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              name: "Jay Wang",
              role: "Founder & CEO",
              image: "/team/jay.png",
              desc: "Ph.D., Twitter, Kuaishou, 19+ years in ML. Author, builder, visionary.",
              linkedin: "https://www.linkedin.com/in/jay-jianqiang-wang-78a6726/",
              github: "https://github.com/qqwjq1981",
            },
            {
              name: "Shengli Li",
              role: "Founding Architect",
              image: "/team/shengli.png",
              desc: "20+ years in distributed systems, search & recommendation engine architecture.",
            },
            {
              name: "Ting Zhang",
              role: "GTM & Partnerships",
              image: "/team/ting.png",
              desc: "Biz dev strategist on B2B partnerships across entertainment, education, and media industries.",
              linkedin: "https://www.linkedin.com/in/ting-zhang-91043811",
            },
            {
              name: "Rafi Ahmed Patel",
              role: "Founding ML Engineer",
              image: "/team/rafi.png",
              desc: "MSc UCL. Specializes in TTS, CV, and translation systems.",
              linkedin: "https://www.linkedin.com/in/raafi-patel-bb2954202/",
              github: "https://github.com/rafipatel",
            },
            {
              name: "Ronel Solomon",
              role: "Founding ML Engineer",
              image: "/team/ronel.png",
              desc: "MS Data Science, Expert in Generative AI - Video/Animation",
              linkedin: "https://www.linkedin.com/in/ronel-solomon/",
              github: "https://github.com/ronelsolomon",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center hover:shadow-md transition-shadow"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={120}
                height={120}
                className="mx-auto mb-3 rounded-full object-cover"
              />
              <h3 className="text-base font-semibold">{member.name}</h3>
              <p className="text-gray-600 text-sm mb-1">{member.role}</p>
              <p className="text-gray-700 text-base mb-3">{member.desc}</p>
              <div className="flex justify-center gap-4 text-gray-700 text-3xl">
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin />
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer">
                    <FaGithub />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
