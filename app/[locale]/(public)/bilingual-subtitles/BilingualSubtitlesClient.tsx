'use client';

import { useTranslations } from "next-intl";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { userAtom, drawerAtom, modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";

export default function BilingualSubtitlesClient() {
  const t = useTranslations("bilingual");
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const [, setModalState] = useAtom(modalAtom);
  const setJobType = useSetAtom(jobTypeAtom);

  const handleTryItClick = () => {
    if (user?.user_id) {
      setJobType("subtitles");
      setModalState("add");
    } else {
      setDrawer("signin");
    }
  };

  return (
    <main className="max-w-5xl mx-auto pt-24 px-6 py-12 text-[var(--c2)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--c1)]">{t("title")}</h1>
      <p className="text-lg mb-6">{t("intro")}</p>

      <CdnVideo
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

      {/* ✅ New: High-authority SEO content */}
      <section className="mt-20 space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.what.title")}</h2>
          <p className="text-base">{t("deep.what.p1")}</p>
          <p className="text-base">{t("deep.what.p2")}</p>
          <p className="text-base">{t("deep.what.p3")}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.how.title")}</h2>
          <p className="text-base">{t("deep.how.p1")}</p>
          <p className="text-base">{t("deep.how.p2")}</p>
          <p className="text-base">{t("deep.how.p3")}</p>
          <p className="text-base">{t("deep.how.p4")}</p>
          <p className="text-base">{t("deep.how.p5")}</p>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--c1)]">{t("deep.usecases.title")}</h2>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">{t("deep.usecases.creatorsTitle")}</h3>
            <p className="text-base">{t("deep.usecases.creatorsBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">{t("deep.usecases.educationTitle")}</h3>
            <p className="text-base">{t("deep.usecases.educationBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">{t("deep.usecases.businessTitle")}</h3>
            <p className="text-base">{t("deep.usecases.businessBody")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}