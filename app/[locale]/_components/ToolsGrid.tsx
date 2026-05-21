"use client";

// Shared tool-card grid used on /tools, /use-cases/[slug], and the
// "Other tools" footer of /tools/[slug]. Same visual treatment across
// surfaces so the tools landing page card is the single source of truth.
//
// Auth + modal wiring lives here (instead of being duplicated in each
// caller) — every caller just passes a list of ToolDefs to render.

import { Link } from "@/i18n/navigation";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import {
  modalAtom,
  userAtom,
  drawerAtom,
  clientMountedAtom,
  createJobContextAtom,
} from "@/app/atoms/atoms";
import type { ToolDef } from "@/lib/tools-registry";

type Props = {
  tools: ToolDef[];
  /** Override the responsive grid template — defaults to the 4-up grid
   *  used on /tools. /use-cases/[slug] passes a 2-up grid since it
   *  typically shows ≤4 tools and a wider card reads better. */
  gridClassName?: string;
};

const DEFAULT_GRID =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6";

export default function ToolsGrid({ tools, gridClassName }: Props) {
  const [, setModalState] = useAtom(modalAtom);
  const [, setCreateJobCtx] = useAtom(createJobContextAtom);
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [clientMounted] = useAtom(clientMountedAtom);
  const t = useTranslations();

  const openToolModal = (tool: ToolDef) => {
    if (!user) {
      setDrawerState("signin");
      return;
    }
    setCreateJobCtx({ toolId: tool.id, slug: tool.slug, job_type: tool.job_type });
    setModalState("add");
  };

  return (
    <div className={gridClassName ?? DEFAULT_GRID}>
      {tools.map((tool) => {
        const showFreeBadge = !!tool.i18n.showFreeBadge;
        const title = showFreeBadge ? (
          <span>
            {t(tool.i18n.titleKey)}{" "}
            <span className="text-red-600 font-bold">{t("tools.free_badge")}</span>
          </span>
        ) : (
          t(tool.i18n.titleKey)
        );
        const desc = t(tool.i18n.descKey);

        const canCreate = tool.status === "create";
        const isDemo = tool.status === "demo";
        const canNavigate = tool.status !== "coming_soon";
        const isModal = tool.action?.type === "modal";

        const card = (
          <div
            className={`group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white bg-[linear-gradient(135deg,_#E0E7FF_0%,_#F0F4FF_100%)] p-5 shadow-lg transition-shadow ${
              canNavigate ? "cursor-pointer hover:shadow-xl" : ""
            }`}
          >
            <div className="flex-grow">
              <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mb-4 text-sm text-gray-600">{desc}</p>
            </div>

            {canCreate ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isModal) openToolModal(tool);
                }}
                type="button"
                className="relative mt-4 w-full cursor-pointer rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2 font-bold text-white shadow-lg transition-opacity duration-300 hover:opacity-90"
              >
                {t("tools.create")}
                {clientMounted && !user && (
                  <span className="ml-2 text-xs opacity-80">🔒</span>
                )}
              </button>
            ) : isDemo ? (
              // Card itself is wrapped in <Link> below (canNavigate=true for
              // demo tools), so this just needs to look button-like for
              // affordance. Lighter purple accent signals "demo / early
              // access" vs the bold gradient on Create — matches the /tools
              // index treatment so the Related-tools row reads identically.
              <span className="mt-4 block w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-center font-semibold text-purple-700 transition-colors duration-200 group-hover:border-purple-400 group-hover:bg-purple-100">
                {t("tools.see_demo")}
              </span>
            ) : (
              <p className="mt-4 text-center text-lg font-semibold italic text-blue-500">
                {t("tools.coming_soon")}
              </p>
            )}
          </div>
        );

        if (canNavigate) {
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="block hover:no-underline"
            >
              {card}
            </Link>
          );
        }

        return <div key={tool.id}>{card}</div>;
      })}
    </div>
  );
}
