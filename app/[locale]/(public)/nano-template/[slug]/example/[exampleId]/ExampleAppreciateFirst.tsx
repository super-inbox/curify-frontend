"use client";

/**
 * Phase 4 — example page shell, split by example type.
 *
 *  - Info-heavy examples (MBTI, HSK, culture/recipe infographics — the SEO
 *    surfaces): a top-right FLIPPER toggles between the "Info" view (two-column
 *    hero image + description — appreciate first) and the "Customize" workbench
 *    (the three-column ReproduceWorkbench). Both occupy the SAME space, so the
 *    visitor can flip back and forth. Info is the default.
 *
 *  - Generator-demo examples (expression sheets, mockups, sticker packs — the
 *    tool IS the point): no flipper, workbench on load. appreciateFirst={false}
 *    → straight passthrough.
 *
 * Share lives in the common header (it's meaningful in both views); Copy lives
 * next to Generate inside the workbench. The `image` ReactNode is reused across
 * views (only one view is mounted at a time).
 */

import { useState, type ComponentProps } from "react";
import { Eye, Sparkles, Wand2 } from "lucide-react";
import ExampleReproduceSurface from "./ExampleReproduceSurface";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import { useTracking } from "@/services/useTracking";

type Props = ComponentProps<typeof ExampleReproduceSurface> & {
  /** true → info-heavy: show the Info⇄Customize flipper (Info default). */
  appreciateFirst: boolean;
};

type View = "info" | "workbench";

export default function ExampleAppreciateFirst({ appreciateFirst, ...surface }: Props) {
  const [view, setView] = useState<View>("info");
  const { trackAction } = useTracking();

  // Generator-demo → no flipper, workbench on load (unchanged).
  if (!appreciateFirst) {
    return <ExampleReproduceSurface {...surface} />;
  }

  const tracking = {
    contentId: `${surface.templateId}:${surface.exampleId}`,
    contentType: "nano_inspiration_reproduce_section" as const,
    viewMode: "cards" as const,
  };

  const tabBase =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors";
  const tabOn = "bg-white text-purple-700 shadow-sm";
  const tabOff = "text-neutral-500 hover:text-neutral-800";

  return (
    <div>
      {/* Common header — Share (both views) + the Info⇄Customize flipper. */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <ShareButton
          url={surface.shareUrl}
          title={surface.title}
          compact
          onShared={() => trackAction(tracking, "share")}
        />
        <div
          className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-0.5"
          role="tablist"
          aria-label="Info or customize"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "info"}
            onClick={() => setView("info")}
            className={`${tabBase} ${view === "info" ? tabOn : tabOff}`}
          >
            <Eye className="h-4 w-4" /> Info
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "workbench"}
            onClick={() => setView("workbench")}
            className={`${tabBase} ${view === "workbench" ? tabOn : tabOff}`}
          >
            <Wand2 className="h-4 w-4" /> Customize
          </button>
        </div>
      </div>

      {view === "workbench" ? (
        <ExampleReproduceSurface {...surface} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            <div className="relative aspect-[4/5] w-full max-h-[72vh]">
              {surface.image}
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            {surface.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {surface.description}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-neutral-500">
                Explore this example, then make it your own — tweak the details
                and generate your own version.
              </p>
            )}

            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setView("workbench")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4" /> Customize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
