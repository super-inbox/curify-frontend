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
  href?: string; // optional for future /tools/[slug]
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
  locale?: string; // optional if you want to build hrefs later
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

    const href = locale ? `/${locale}/tools/${tool.slug}` : undefined;

    return {
      id: tool.id,
      title: titleNode,
      desc: t(tool.i18n.descKey),
      status: tool.status,
      href: tool.action?.type === "page" ? href : undefined,
      onClick:
        tool.status === "create" && tool.action?.type === "modal"
          ? () => openModal(tool.action!.mode)
          : undefined,
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