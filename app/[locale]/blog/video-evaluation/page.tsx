import Image from "next/image";
import { useTranslations } from "next-intl";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluating AI Video Translation Quality – Curify AI",
  description:
    "How Curify AI ensures high-quality video translation through metrics like WER, COMET, MOS, speaker similarity, sync timing, and user testing.",
};

export default function VideoTranslationEvaluationPost() {
  const t = useTranslations("video_translation_eval");

  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <h1 className="text-4xl font-bold mb-4">
        {t("title")} – {t("subtitle")}
      </h1>

      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <Image
          src="/images/video-translation-eval.jpg"
          alt={t("title")}
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4">{t("intro")}</p>

      {/* Section 1 */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t("section1_title")}</h2>
      <p className="mb-2">{t("section1_engine")}</p>
      <ul className="list-disc list-inside mb-4">
        {t.raw("section1_metrics").map((item: string, idx: number) => (
          <li key={`s1-${idx}`}>{item}</li>
        ))}
      </ul>

      {/* Section 2 */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t("section2_title")}</h2>
      <p className="mb-2">{t("section2_engine")}</p>
      <ul className="list-disc list-inside mb-4">
        {t.raw("section2_metrics").map((item: string, idx: number) => (
          <li key={`s2-${idx}`}>{item}</li>
        ))}
      </ul>

      {/* Section 3 */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t("section3_title")}</h2>
      <p className="mb-2">{t("section3_engine")}</p>
      <ul className="list-disc list-inside mb-4">
        {t.raw("section3_metrics").map((item: string, idx: number) => (
          <li key={`s3-${idx}`}>{item}</li>
        ))}
      </ul>

      {/* Section 4 */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t("section4_title")}</h2>
      <ul className="list-disc list-inside mb-4">
        {t.raw("section4_metrics").map((item: string, idx: number) => (
          <li key={`s4-${idx}`}>{item}</li>
        ))}
      </ul>

      {/* Section 5 */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t("section5_title")}</h2>
      <p className="mb-4">{t("section5_method")}</p>
      <blockquote className="italic border-l-4 pl-4 border-gray-300 mb-4">
        {t("section5_prompt")}
      </blockquote>

      {/* Section 6 */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t("section6_title")}</h2>
      <ul className="list-disc list-inside mb-8">
        {t.raw("section6_metrics").map((item: string, idx: number) => (
          <li key={`s6-${idx}`}>{item}</li>
        ))}
      </ul>

      {/* Outro */}
      <p className="mb-4">
        🎯 {t("closing")}{" "}
        <a
          href="https://curify.ai"
          className="text-blue-600 underline ml-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          curify.ai
        </a>
      </p>

      <p className="mt-8 font-medium">{t("available_locales")}</p>
    </article>
  );
}
