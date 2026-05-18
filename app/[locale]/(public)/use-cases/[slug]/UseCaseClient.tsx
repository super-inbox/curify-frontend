"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAtomValue, useSetAtom } from "jotai";
import { Download } from "lucide-react";
import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import { templatePacksService } from "@/services/templatePacks";
import { useTracking } from "@/services/useTracking";
import ToolsGrid from "@/app/[locale]/_components/ToolsGrid";
import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";
import RelatedBlogsByCategory from "@/app/[locale]/_components/RelatedBlogsByCategory";
import type { ToolDef } from "@/lib/tools-registry";
import { USE_CASES, PERSONA_BLOG_CATEGORIES } from "@/lib/use-cases";

type LearningMaterial = {
  templateId: string;
  title: string;
  description: string;
  /** Cover preview, resolved server-side from the first inspiration
   *  record under the template. May be a relative path to /images/...
   *  or an absolute CDN URL — CdnImage handles both. */
  coverImage?: string;
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {material.coverImage ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <CdnImage
            src={material.coverImage}
            alt={material.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        // Fallback for templates that have no inspiration records yet —
        // a soft purple-tinted swatch with a Download glyph so the card
        // still reads as visual rather than three lines of text.
        <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
          <Download className="h-12 w-12 text-purple-300" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="text-base font-bold text-neutral-900">{material.title}</div>
        <div className="line-clamp-3 text-sm text-neutral-500">{material.description}</div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? t("downloadingPack") : t("downloadPack")}
        </button>
      </div>
    </div>
  );
}

export default function UseCaseClient({
  slug,
  nanoCards,
  tools,
  learningMaterials,
}: {
  slug: string;
  nanoCards: NanoInspirationCardType[];
  tools: ToolDef[];
  learningMaterials?: LearningMaterial[];
}) {
  const t = useTranslations("useCasePage");
  const tGlobal = useTranslations();
  const locale = useLocale();
  const title = t(`${slug}.title` as never);
  // P0 #3 — blog categories that match this persona. Drives the
  // "Related reading" block at the bottom. See docs/interconnection.md.
  const relatedBlogCategories = PERSONA_BLOG_CATEGORIES[slug] ?? [];
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signin");
    return false;
  }, [user, setDrawerState]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
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
      ) : tools.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("toolsHeading")}
          </h2>
          <ToolsGrid
            tools={tools}
            gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2"
          />
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

      {/* P0 #3 — Related reading from the blog categories that match
          this persona. Sits between the templates grid and the sibling
          persona chips so the page closes with content depth, then a
          cross-link back into other personas. */}
      {relatedBlogCategories.length > 0 && (
        <RelatedBlogsByCategory
          categories={relatedBlogCategories}
          locale={locale}
          max={6}
          heading={tGlobal("interconnection.relatedReading", {
            defaultValue: "Related reading",
          })}
        />
      )}

      {/* Explore other use cases — cross-link to the five sibling
          persona pages. UseCaseChipsRow filters its source list to the
          slugs we pass, in order, and renders nothing if empty. */}
      <section className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="mb-4 text-xl font-bold text-neutral-900">
          {t("exploreOtherHeading")}
        </h2>
        <UseCaseChipsRow
          filterTo={USE_CASES.filter((uc) => uc.slug !== slug).map((uc) => uc.slug)}
        />
      </section>
    </main>
  );
}
