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
  href?: string;
};

export type ToolGroupId = "video" | "image" | "audio";

export type ToolGroup = {
  groupId: ToolGroupId;
  title: ReactNode;
  items: ToolItem[];
};

export function buildToolsHub(params: {
  t: (key: string, values?: Record<string, any>) => any;
  openModal: (mode: ToolMode) => void;
  locale?: string;
}): ToolGroup[] {
  const { t, openModal, locale } = params;
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

    const href = locale ? `/tools/${tool.slug}` : undefined;
    const action = tool.action;

    return {
      id: tool.id,
      title: titleNode,
      desc: t(tool.i18n.descKey),
      status: tool.status,
      href: tool.status !== "coming_soon" ? href : undefined,
    
      onClick:
        tool.status === "create" && action?.type === "modal"
          ? () => openModal(action.mode)
          : undefined,
    };
  };

  return [
    { groupId: "video", title: t("tools.groups.video"), items: grouped.video.map(toItem) },
    { groupId: "image", title: t("tools.groups.image"), items: grouped.image.map(toItem) },
    { groupId: "audio", title: t("tools.groups.audio"), items: grouped.audio.map(toItem) },
  ];
}