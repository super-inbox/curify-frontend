import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
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
    description: t("intro"),
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
    <article className="max-w-6xl mx-auto px-6 py-20 text-[18px] leading-8">
      
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
      </main>
    </article>
  );
}
