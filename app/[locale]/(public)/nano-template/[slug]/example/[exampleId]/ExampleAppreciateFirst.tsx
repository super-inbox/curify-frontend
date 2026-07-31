"use client";

/**
 * Phase 4 — appreciate-first shell for the example page, split by example type:
 *
 *  - Info-heavy examples (MBTI, HSK, culture/recipe infographics — the SEO
 *    surfaces): LEAD with the image + description; the 3-column workbench stays
 *    hidden until the visitor clicks "Customize". Browsing/appreciating an
 *    inspiration shouldn't dump you into a form (Pinterest pattern).
 *
 *  - Generator-demo examples (expression sheets, mockups, sticker packs — the
 *    tool IS the point): render the workbench immediately on page load, exactly
 *    as before. `appreciateFirst={false}` → straight passthrough.
 *
 * The `image` ReactNode is reused verbatim in both states, so no double-fetch.
 */

import { useState, type ComponentProps } from "react";
import { Sparkles } from "lucide-react";
import ExampleReproduceSurface from "./ExampleReproduceSurface";

type Props = ComponentProps<typeof ExampleReproduceSurface> & {
  /** true → info-heavy: gate the workbench behind a "Customize" click. */
  appreciateFirst: boolean;
};

export default function ExampleAppreciateFirst({ appreciateFirst, ...surface }: Props) {
  const [revealed, setRevealed] = useState(false);

  // Generator-demo, or the visitor committed to editing → the full workbench.
  if (!appreciateFirst || revealed) {
    return <ExampleReproduceSurface {...surface} />;
  }

  // Appreciate-first: hero image + description + a single Customize CTA.
  return (
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
            Explore this example, then make it your own — tweak the details and
            generate your own version.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4" /> Customize
          </button>
          <p className="text-center text-xs text-neutral-400">
            Opens the editor with this example&apos;s settings pre-filled.
          </p>
        </div>
      </div>
    </div>
  );
}
