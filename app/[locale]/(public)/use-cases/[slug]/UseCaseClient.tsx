"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAtomValue, useSetAtom } from "jotai";
import { Download } from "lucide-react";
import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import { templatePacksService } from "@/services/templatePacks";
import { useTracking } from "@/services/useTracking";

type ToolCard = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

type LearningMaterial = {
  templateId: string;
  title: string;
  description: string;
};

const BULLET_KEYS = ["bullet0", "bullet1", "bullet2", "bullet3"] as const;

function LearningMaterialCard({ material }: { material: LearningMaterial }) {
  const t = useTranslations("actionButtons");
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const { trackAction } = useTracking();
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);

  const handleDownload = async () => {
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;
    if (!user) { setDrawerState("signin"); isDownloadingRef.current = false; return; }

    try {
      setIsDownloading(true);
      const res = await templatePacksService.downloadPack({ template_id: material.templateId });
      if (!res?.success || !res?.download_url) throw new Error(res?.message || "Missing download_url");
      const a = document.createElement("a");
      a.href = res.download_url;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      trackAction({ contentId: material.templateId, contentType: "nano_inspiration_template_card" as const, viewMode: "list" as const }, "download");
    } catch {
      alert(t("batchDownloadFailed"));
    } finally {
      setIsDownloading(false);
      isDownloadingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-base font-bold text-neutral-900">{material.title}</div>
      <div className="text-sm text-neutral-500">{material.description}</div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="mt-auto inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {isDownloading ? t("downloadingPack") : t("downloadPack")}
      </button>
    </div>
  );
}

export default function UseCaseClient({
  slug,
  nanoCards,
  toolCards,
  learningMaterials,
}: {
  slug: string;
  nanoCards: NanoInspirationCardType[];
  toolCards: ToolCard[];
  learningMaterials?: LearningMaterial[];
}) {
  const t = useTranslations("useCasePage");
  const title = t(`${slug}.title` as never);
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signin");
    return false;
  }, [user, setDrawerState]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-lg font-semibold text-purple-700">
          {t(`${slug}.subtitle` as never)}
        </p>
        <p className="mt-3 max-w-2xl text-base text-neutral-600">
          {t(`${slug}.description` as never)}
        </p>

        <ul className="mt-5 space-y-2">
          {BULLET_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="mt-0.5 text-purple-500">✓</span>
              {t(`${slug}.${key}` as never)}
            </li>
          ))}
        </ul>
      </section>

      {/* Learning Materials (for-parents) or Tools (other use cases) */}
      {learningMaterials && learningMaterials.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("learningMaterialsHeading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learningMaterials.map((m) => (
              <LearningMaterialCard key={m.templateId} material={m} />
            ))}
          </div>
        </section>
      ) : toolCards.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("toolsHeading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {toolCards.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
              >
                <div className="text-base font-bold text-neutral-900 transition-colors group-hover:text-purple-700">
                  {tool.title}
                </div>
                <div className="text-sm text-neutral-500">{tool.description}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nano Templates */}
      {nanoCards.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("templatesHeading", { title })}
          </h2>
          <NanoInspirationRow
            cards={nanoCards}
            requireAuth={requireAuth}
            onViewClick={() => {}}
          />
        </section>
      )}
    </main>
  );
}
