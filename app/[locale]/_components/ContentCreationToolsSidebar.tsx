// app/[locale]/_components/ContentCreationToolsSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { Type, Building2, Sparkles } from "lucide-react";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function SidebarToolItem({
  icon,
  colorClass,
  title,
  desc,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={classNames(
        "group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-neutral-50",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div
        className={classNames(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
          colorClass
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-[15px] font-semibold text-neutral-900">{title}</h4>
          {badge}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function NanoBadge() {
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
      Nano Banana
    </span>
  );
}

export default function ContentCreationToolsSidebar({
  activeLang,
}: {
  activeLang: "en" | "zh";
}) {
  const router = useRouter();

  // ✅ New: link to dedicated nano templates (works for en/zh)
  const nanoEducationSlug = "template-education-card";
  const nanoArchitectureSlug = "template-architecture";

  const nanoEducationPath = `/${activeLang}/nano-template/${nanoEducationSlug}`;
  const nanoArchitecturePath = `/${activeLang}/nano-template/${nanoArchitectureSlug}`;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-neutral-900">
        Content Creation Tools
      </h3>

      <div className="space-y-3">
        <SidebarToolItem
          icon={
            <img
              src="/icons/translation-icon.png"
              alt="Translation"
              className="h-6 w-6"
            />
          }
          colorClass="bg-blue-600"
          title="Video Translator"
          desc="Translate YouTube & MP4 videos"
          onClick={() => router.push(`/${activeLang}/video-dubbing`)}
        />

        <SidebarToolItem
          icon={
            <img
              src="/icons/subtitle-icon.png"
              alt="Subtitle"
              className="h-6 w-6"
            />
          }
          colorClass="bg-green-500"
          title="Subtitle Generator"
          desc="Create accurate subtitles instantly"
          onClick={() => router.push(`/${activeLang}/bilingual-subtitles`)}
        />

        {/* ✅ Replaced bottom two with Nano template links */}
        <SidebarToolItem
          icon={<Type className="h-5 w-5" />}
          colorClass="bg-purple-500"
          title={activeLang === "zh" ? "学科知识卡片" : "Educational Card"}
          desc={
            activeLang === "zh"
              ? "把输入主题变成信息图（3:4）"
              : "Turn a topic into an infographic (3:4)"
          }
          badge={<NanoBadge />}
          onClick={() => router.push(nanoEducationPath)}
        />

        <SidebarToolItem
          icon={<Building2 className="h-5 w-5" />}
          colorClass="bg-sky-500"
          title={activeLang === "zh" ? "建筑分析图" : "Architecture HUD"}
          desc={
            activeLang === "zh"
              ? "地标建筑 HUD 风技术注释图"
              : "Landmark photo + dense HUD annotations"
          }
          badge={<NanoBadge />}
          onClick={() => router.push(nanoArchitecturePath)}
        />
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-4">
        <button
          onClick={() => router.push(`/${activeLang}/tools`)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          Create New Content
        </button>
      </div>
    </div>
  );
}
