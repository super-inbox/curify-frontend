// app/[locale]/(public)/tools/[slug]/tool-generic-client.tsx
"use client";

import { useTranslations } from "next-intl";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import {
  userAtom,
  drawerAtom,
  modalAtom,
  createJobContextAtom,
  clientMountedAtom,
} from "@/app/atoms/atoms";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
import { getToolBySlug } from "@/lib/tools-registry";
import LanguageSwitchVideoDemo from "@/app/[locale]/_components/LanguageSwitchVideoDemo";
import CreateNewModal from "../CreateNewModal";

export default function ToolGenericClient({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const t = useTranslations(tool.namespace);
  const tGlobal = useTranslations();

  const user = useAtomValue(userAtom);
  const clientMounted = useAtomValue(clientMountedAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const [, setModalState] = useAtom(modalAtom);
  const setCreateJobCtx = useSetAtom(createJobContextAtom);

  const handleTryItClick = () => {
    if (tool.action?.type !== "modal") return;

    if (!user) {
      setDrawer("signin");
      return;
    }

    setCreateJobCtx({ toolId: tool.id, slug: tool.slug, job_type: tool.job_type });
    setModalState("add");
  };

  const demo = tool.demo;

  return (
    <main className="max-w-5xl mx-auto pt-20 px-6 py-12 text-[var(--c2)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--c1)]">{t("title")}</h1>
      <p className="text-lg mb-6">{t("description")}</p>

      {demo?.type === "language_switch" ? (
        <LanguageSwitchVideoDemo
          ariaLabel={t("demo.aria")}
          caption={t("demo.caption")}
          nowPlayingText={(label) => t("demo.nowPlaying", { lang: label })}
          languages={demo.languages}
          defaultLang={demo.defaultLang}
        />
      ) : demo?.type === "single_video" ? (
        <>
          <CdnVideo
            className="w-full rounded-xl shadow mb-4"
            controls
            poster={demo.poster}
            src={demo.src}
          />
          <p className="text-sm text-gray-500 mb-8">{t("example")}</p>
        </>
      ) : null}

      <div className="mt-8 text-center">
        {tool.status === "create" && tool.action?.type === "modal" ? (
          <button
            onClick={handleTryItClick}
            className="mt-4 text-white px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] hover:opacity-90 transition-opacity duration-300 shadow-lg cursor-pointer relative text-lg"
            type="button"
          >
            {tGlobal("tools.create")}
            {clientMounted && !user && (
              <span className="ml-2 text-xs opacity-80">🔒</span>
            )}
          </button>
        ) : (
          <p className="text-blue-600 font-semibold italic text-lg">
            {tGlobal("tools.coming_soon")}
          </p>
        )}
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
      <CreateNewModal />
    </main>
  );
}
