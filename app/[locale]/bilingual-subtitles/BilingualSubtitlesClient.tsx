'use client';

import { useTranslations } from "next-intl";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, drawerAtom, modalAtom, jobTypeAtom } from "@/app/atoms/atoms";

export default function BilingualSubtitlesClient() {
  const t = useTranslations("bilingual");
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setModal = useSetAtom(modalAtom);
  const setJobType = useSetAtom(jobTypeAtom);

  const handleTryItClick = () => {
    if (user?.user_id) {
      setJobType("subtitles");
      setModal("add");
    } else {
      setDrawer("signin");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-[var(--c2)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--c1)]">{t("title")}</h1>
      <p className="text-lg mb-6">{t("intro")}</p>

      <video
        className="w-full rounded-xl shadow mb-4"
        controls
        poster="/thumbnails/jensen_ai_strategy.jpg"
        src="/video/demo_bilingual_subtitles.mp4"
      />
      <p className="text-sm text-gray-500 mb-8">{t("example")}</p>

      <div className="mt-8 text-center">
        <button
          onClick={handleTryItClick}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 px-6 rounded-xl transition"
        >
          {t("cta")}
        </button>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">{t("why.title")}</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>{t("why.point1")}</li>
          <li>{t("why.point2")}</li>
          <li>{t("why.point3")}</li>
          <li>{t("why.point4")}</li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--c1)]">{t("faq.title")}</h2>
        <p className="text-base mb-2">{t("faq.q1")}</p>
        <p className="text-sm text-gray-600 mb-4">{t("faq.a1")}</p>

        <p className="text-base mb-2">{t("faq.q2")}</p>
        <p className="text-sm text-gray-600 mb-4">{t("faq.a2")}</p>
      </section>
    </main>
  );
}
