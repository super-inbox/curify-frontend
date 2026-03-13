import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CdnImage from "../../../_components/CdnImage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "video_translation_eval" });

  return {
    title: `${t("title")} – ${t("subtitle")}`,
    description: t("description"),
  };
}

// A simple icon for lists
const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-1"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l2.25 3a.75.75 0 001.1 0l2.25-3a.75.75 0 00-1.1-1.02l-1.95 1.56V6.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default function VideoTranslationEvaluationPost() {
  const t = useTranslations("video_translation_eval");

  return (
    // Keep the article container as the "max width" boundary
    <article className="pt-10 pb-8">

      {/* HEADER: This can remain full-width for impact */}
      <header className="mb-20 space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center leading-tight">
          {t("title")} – {t("subtitle")}
        </h1>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <CdnImage
            src="/images/video-translation-eval.jpg"
            alt={t("title")}
            width={600}
            height={350}
            className="rounded-lg shadow-xl" // Added more shadow
          />
          <p className="text-lg">{t("intro")}</p>
        </div>
      </header>

      {/* MAIN CONTENT: Constrain this part for readability */}
      <main className="max-w-4xl mx-auto space-y-12">
        {/* Section: Transcription */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">{t("section1_title")}</h2>
          <p className="mb-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
            {t("section1_engine")}
          </p>
          <ul className="space-y-3">
            {t.raw("section1_metrics").map((item: string, idx: number) => (
              <li key={`s1-${idx}`} className="flex items-start">
                <ListIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-gray-200" />

        {/* Section: Translation */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">{t("section2_title")}</h2>
          <p className="mb-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
            {t("section2_engine")}
          </p>
          <ul className="space-y-3">
            {t.raw("section2_metrics").map((item: string, idx: number) => (
              <li key={`s2-${idx}`} className="flex items-start">
                <ListIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-gray-200" />

        {/* Section: Voice Synthesis */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">{t("section3_title")}</h2>
          <p className="mb-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
            {t("section3_engine")}
          </p>
          <ul className="space-y-3">
            {t.raw("section3_metrics").map((item: string, idx: number) => (
              <li key={`s3-${idx}`} className="flex items-start">
                <ListIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-gray-200" />

        {/* Section: Lip Sync */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">{t("section4_title")}</h2>
          <ul className="space-y-3">
            {t.raw("section4_metrics").map((item: string, idx: number) => (
              <li key={`s4-${idx}`} className="flex items-start">
                <ListIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-gray-200" />

        {/* Section: Semantic Preservation */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">{t("section5_title")}</h2>
          <p className="mb-4">{t("section5_method")}</p>
          <blockquote className="border-l-4 pl-6 italic border-gray-300 text-gray-700">
            {t("section5_prompt")}
          </blockquote>
        </section>

        <hr className="border-gray-200" />

        {/* Section: GTM / Feedback */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">{t("section6_title")}</h2>
          <ul className="space-y-3">
            {t.raw("section6_metrics").map((item: string, idx: number) => (
              <li key={`s6-${idx}`} className="flex items-start">
                <ListIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing */}
        <footer className="pt-10 text-center">
          <p className="text-lg mb-4">
            🎯 {t("closing")}{" "}
            <a
              href="https://curify.ai"
              className="text-blue-600 underline font-semibold ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              curify.ai
            </a>
          </p>
        </footer>

        {/* Related Articles */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                slug: 'translate-youtube-video',
                title: 'How to Translate YouTube Videos: Complete Step-by-Step Guide',
                date: 'March 4, 2026',
                readTime: '12 min read',
                tag: 'Video Translation',
                image: '/images/youtubev2.webp',
              },
              {
                slug: 'video-enhancement',
                title: 'AI Video Enhancement: Storyboards, Meme Captions & SFX Automation',
                date: 'November 18, 2025',
                readTime: '7 min read',
                tag: 'Creator Tools',
                image: '/images/video-enhancement-pipeline.png',
              },
              {
                slug: 'translate-youtube-video-to-english',
                title: 'Translate YouTube Videos to English: AI-Powered Solutions',
                date: 'March 4, 2026',
                readTime: '10 min read',
                tag: 'Video Translation',
                image: '/images/youtubev1.webp',
              }
            ].map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.slug}
                className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative h-40 w-full">
                  <CdnImage
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-red-600 font-semibold mb-1">
                    {post.tag}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition">
                    {post.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {post.date} • {post.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              See all blog posts
            </Link>
          </div>
        </section>
       
      </main>
    </article>
  );
}
