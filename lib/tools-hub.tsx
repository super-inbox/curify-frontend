// lib/tools-hub.tsx
import type { ReactNode } from "react";
import { groupTools } from "@/lib/tools-registry";

export type ToolStatus = "create" | "coming_soon";
export type ToolMode = "translation" | "subtitles";

export type ToolItem = {
  id: string;
  title: ReactNode;
  desc: ReactNode;
  status: ToolStatus;
  onClick?: () => void;
  href?: string; // unprefixed, i18n Link will add locale automatically
};

export type ToolGroupId = "video" | "image" | "audio";

export type ToolGroup = {
  groupId: ToolGroupId;
  title: ReactNode;
  items: ToolItem[];
};

export function buildToolsHub(params: {
  t: (key: string, values?: Record<string, any>) => any;

  /**
   * ✅ NEW (recommended): open by toolId (so we can route job_type / config)
   * ToolsClient can auth-gate + set CreateNewModal context
   */
  openToolModal: (toolId: string) => void;

  /**
   * optional; kept for backward compatibility but NOT used for href
   * because i18n Link already handles locale prefixing.
   */
  locale?: string;
}): ToolGroup[] {
  const { t, openToolModal } = params;
  const grouped = groupTools();

  const toItem = (tool: (typeof grouped)["video"][number]): ToolItem => {
    const showFreeBadge = !!tool.i18n.showFreeBadge;

    const titleNode = showFreeBadge ? (
      <span>
        {t(tool.i18n.titleKey)}{" "}
        <span className="text-red-600 font-bold">{t("tools.free_badge")}</span>
      </span>
    ) : (
      t(tool.i18n.titleKey)
    );

    // ✅ IMPORTANT: use unprefixed path; i18n <Link> will prefix locale
    const href = `/tools/${tool.slug}`;

    const canNavigate = tool.status !== "coming_soon";
    const canCreate = tool.status === "create";

    return {
      id: tool.id,
      title: titleNode,
      desc: t(tool.i18n.descKey),
      status: tool.status,

      // ✅ only non-coming-soon have pages
      href: canNavigate ? href : undefined,

      // ✅ only create tools open the modal
      onClick: canCreate ? () => openToolModal(tool.id) : undefined,
    };
  };

  return [
    {
      groupId: "video",
      title: t("tools.groups.video"),
      items: grouped.video.map(toItem),
    },
    {
      groupId: "image",
      title: t("tools.groups.image"),
      items: grouped.image.map(toItem),
    },
    {
      groupId: "audio",
      title: t("tools.groups.audio"),
      items: grouped.audio.map(toItem),
    },
  ];
}