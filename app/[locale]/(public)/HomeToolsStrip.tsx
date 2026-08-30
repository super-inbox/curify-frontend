"use client";

// Compact tool-card strip rendered below the template grid on the home
// page. Hands the shared ToolsGrid the FUNCTIONAL tools only — same card
// visual + auth + modal wiring as /tools and /tools/[slug] related-tools,
// including the `tool_card` click tracking the grid emits per card.
//
// Shows: `create` tools + `demo`-status tools that are actually functional
// (inline `generate` / `product_video` surfaces). Excludes coming-soon AND
// the pure-demo SEO landings (status `demo`, action `page` — video-enhance,
// manga-translation, style-transfer): the home strip is a secondary CTA to
// working products, not a roadmap/demo teaser.
// NB asl-video-translator was in that exclusion list until 2026-08-29 but has
// been status `create` since 2026-08-16, so it does appear on this strip.

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { TOOL_REGISTRY } from "@/lib/tools-registry";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";

export default function HomeToolsStrip() {
  const t = useTranslations("home.toolsStrip");

  // NB this list is deliberately NARROWER than isInlineTool() in the registry,
  // which since 2026-08-30 also covers brand_direction, the three
  // design→manufacturing exports and impromptu_practice. Those all render real
  // working surfaces and say "Create" on /tools, so by this strip's own stated
  // rule they would belong here too — but widening the home page is a separate
  // decision from labelling the hub correctly. Kept explicit so the difference
  // reads as a choice rather than an oversight.
  const tools = TOOL_REGISTRY.filter(
    (tool) =>
      tool.status === "create" ||
      tool.action?.type === "generate" ||
      tool.action?.type === "product_video" ||
      tool.action?.type === "costume_tryon",
  );

  if (tools.length === 0) return null;

  return (
    <section className="mt-12 w-full max-w-[1600px]">
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
