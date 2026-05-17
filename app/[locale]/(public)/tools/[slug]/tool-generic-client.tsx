// app/[locale]/(public)/tools/[slug]/tool-generic-client.tsx
"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import {
  userAtom,
  drawerAtom,
  modalAtom,
  createJobContextAtom,
  clientMountedAtom,
} from "@/app/atoms/atoms";
import CdnVideo from "@/app/[locale]/_components/CdnVideo";
import {
  getToolBySlug,
  getSiblingTools,
  TOOL_BLOG_CATEGORIES,
} from "@/lib/tools-registry";
import { getPersonasForTool } from "@/lib/use-cases";
import LanguageSwitchVideoDemo from "@/app/[locale]/_components/LanguageSwitchVideoDemo";
import RelatedBlogsByCategory from "@/app/[locale]/_components/RelatedBlogsByCategory";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";
import CreateNewModal from "../CreateNewModal";

// Map the existing "deep.usecases.X" subsection keys to the persona slugs
// they describe, so each subsection's h3 becomes a link to the matching
// /use-cases/<persona> landing page. Wraps a static text section in a
// cross-link without rewriting the i18n content.
const USECASE_SECTION_TO_PERSONA: Record<string, string> = {
  creators: "for-creators",
  education: "for-parents",
  business: "for-marketers",
};

export default function ToolGenericClient({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const t = useTranslations(tool.namespace);
  const tGlobal = useTranslations();
  // Locale string needed by RelatedBlogsByCategory and (less directly) for
  // future per-locale routing inside the linked use-case headers.
  const locale = useLocale();

  // P0 #1 interconnection data — all server-deterministic, derived from
  // the tool slug. See docs/interconnection.md.
  const siblingTools = getSiblingTools(slug, 3);
  const personas = getPersonasForTool(slug);
  const relatedBlogCategories = TOOL_BLOG_CATEGORIES[slug] ?? [];

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

          {/* Each subsection header is now a link to the matching
              /use-cases/<persona> landing page so the prose "Who Uses
              X?" block gains the same persona-fan-out the chip row
              below adds. USECASE_SECTION_TO_PERSONA holds the mapping. */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">
              <Link
                href={`/use-cases/${USECASE_SECTION_TO_PERSONA.creators}`}
                className="hover:text-purple-700 hover:underline"
              >
                {t("deep.usecases.creatorsTitle")} →
              </Link>
            </h3>
            <p className="text-base">{t("deep.usecases.creatorsBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">
              <Link
                href={`/use-cases/${USECASE_SECTION_TO_PERSONA.education}`}
                className="hover:text-purple-700 hover:underline"
              >
                {t("deep.usecases.educationTitle")} →
              </Link>
            </h3>
            <p className="text-base">{t("deep.usecases.educationBody")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--c1)]">
              <Link
                href={`/use-cases/${USECASE_SECTION_TO_PERSONA.business}`}
                className="hover:text-purple-700 hover:underline"
              >
                {t("deep.usecases.businessTitle")} →
              </Link>
            </h3>
            <p className="text-base">{t("deep.usecases.businessBody")}</p>
          </div>
        </div>
      </section>

      {/* ---------- P0 #1 interconnection footer ---------- */}

      {/* P0 #1b — "Who it's for" persona chips. Inverse lookup of
          USE_CASES[].toolSlugs: every persona that lists this tool. */}
      {personas.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold text-[var(--c1)]">
            {tGlobal("interconnection.whoItsFor", {
              defaultValue: "Who it’s for",
            })}
          </h2>
          <UseCaseChipsRow filterTo={personas} />
        </section>
      )}

      {/* P0 #1c — sibling tools in the same group. Reuses ToolsGrid in a
          2-up layout to match the rest of the page width. */}
      {siblingTools.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-[var(--c1)]">
            {tGlobal("interconnection.relatedTools", {
              defaultValue: "Related tools",
            })}
          </h2>
          <ToolsGrid
            tools={siblingTools}
            gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          />
        </section>
      )}

      {/* P0 #1a — related reading from the blog categories the
          tool maps to. Renders nothing if no posts match. */}
      {relatedBlogCategories.length > 0 && (
        <RelatedBlogsByCategory
          categories={relatedBlogCategories}
          locale={locale}
          max={3}
          heading={tGlobal("interconnection.relatedReading", {
            defaultValue: "Related reading",
          })}
        />
      )}

      <CreateNewModal />
    </main>
  );
}
