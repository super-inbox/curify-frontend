"use client";

// Compact tool-card strip rendered below the template grid on the home
// page. Hands the shared ToolsGrid the FUNCTIONAL tools only — same card
// visual + auth + modal wiring as /tools and /tools/[slug] related-tools,
// including the `tool_card` click tracking the grid emits per card.
//
// Shows: `create` tools + `demo`-status tools that are actually functional
// (inline `generate` / `product_video` surfaces). Excludes coming-soon AND
// the pure-demo SEO landings (status `demo`, action `page` — asl-video-
// translator, video-enhance, manga-translation, style-transfer): the home
// strip is a secondary CTA to working products, not a roadmap/demo teaser.

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { TOOL_REGISTRY } from "@/lib/tools-registry";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";

export default function HomeToolsStrip() {
  const t = useTranslations("home.toolsStrip");

  const tools = TOOL_REGISTRY.filter(
    (tool) =>
      tool.status === "create" ||
      tool.action?.type === "generate" ||
      tool.action?.type === "product_video" ||
      tool.action?.type === "costume_tryon",
  );

  if (tools.length === 0) return null;

  return (
    <section className="mt-12 w-full max-w-[1400px]">
      <div className="mb-4 flex items-end justify-between gap-3 pl-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{t("subtitle")}</p>
        </div>
        <Link
          href="/tools"
          className="shrink-0 text-sm font-semibold text-purple-700 hover:text-purple-900"
        >
          {t("seeAll")}
        </Link>
      </div>

      <ToolsGrid
        tools={tools}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      />
    </section>
  );
}
