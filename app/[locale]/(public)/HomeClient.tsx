"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Inter } from "next/font/google";
import { useRequireAuth } from "@/services/useRequireAuth";

import TemplateStrip from "@/app/[locale]/_components/TemplateStrip";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import HomeToolsStrip from "./HomeToolsStrip";
import HomeHero from "./HomeHero";
import HomeImageWorkbench from "./HomeImageWorkbench";
import HomeSolutionsGrid from "./HomeSolutionsGrid";
import HomeWorkflow from "./HomeWorkflow";
import WcRotatingSlot from "@/app/[locale]/_components/WcRotatingSlot";
import { TOP_QUERIES } from "@/app/[locale]/(public)/topics/[slug]/TopSearchSuggestions";
import HomeFusedRow, { type TopRemixPrompt, type HomeExampleTile } from "./HomeFusedRow";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function HomeClient({
  locale = "en",
  nanoCards = [],
  homeExamples = [],
  topRemixPrompts = [],
  searchQueries = [],
  discoveryStrip,
}: {
  locale?: string;
  /** Template-collage cards for the legacy fallback rail (used when
   *  topRemixPrompts is empty / gallery snapshot hasn't run yet).
   *  Also feeds the hero montage. */
  nanoCards?: NanoInspirationCardType[];
  /** Individual examples (one inspiration per template, sorted by parent
   *  rank_score) — the new fused-row tile feed replacing template cards
   *  per the 2026-06-29 home-rail refresh. */
  homeExamples?: HomeExampleTile[];
  /** Top-25 most-copied gallery prompts (30d), pre-loaded server-side
   *  from public/data/top_remix_prompts.json. When non-empty, the home
   *  rail switches to the fused variant. Empty → stays on the
   *  template-only NanoInspirationRow. */
  topRemixPrompts?: TopRemixPrompt[];
  /** 6-8 popular queries randomly picked server-side from
   *  lib/popularPrefillQueries.ts. Rendered as interleaved nudge tiles
   *  in the fused row. */
  searchQueries?: string[];
  /** Server-rendered discovery section (topics + use-case chips) shipped
   *  2026-06-26 as W1.1+W1.4 of the indexation rescue. Rendered below
   *  the tools strip so the homepage finally links to /topics and
   *  /use-cases. */
  discoveryStrip?: ReactNode;
}) {
  const requireAuth = useRequireAuth({ variant: "signup" });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: NanoInspirationCardType | null;
  }>({ isOpen: false, card: null });

  const handleOpenModal = useCallback((card: NanoInspirationCardType) => {
    setModalState({ isOpen: true, card });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => setModalState((prev) => ({ ...prev, card: null })), 200);
  }, []);

  // Decorative montage pool for the hero — real generated outputs pulled from
  // the same cards the rail renders below (no new assets/fetch).
  const montageImages = nanoCards
    .flatMap((c) => c.preview_image_urls ?? c.image_urls ?? [])
    .filter(Boolean)
    .slice(0, 18);

  return (
    <div className={classNames(inter.className, "w-full bg-[#FDFDFD] px-4 pb-10 pt-0 md:px-6 lg:px-10")}>
      <div className="w-full max-w-[1600px]">
        {/* Storytelling flow — message + audience entry points, layered above
            the existing content rail (kept below for discovery + indexation). */}
        <HomeHero montageImages={montageImages} />
        <HomeSolutionsGrid />
        <HomeWorkflow />

        {topRemixPrompts.length > 0 ? (
          <HomeFusedRow
            examples={homeExamples}
            galleryPrompts={topRemixPrompts}
            searchQueries={searchQueries}
            locale={locale}
            maxRows={8}
            topRightCell={
              <WcRotatingSlot locale={locale} queries={TOP_QUERIES["world-cup"]} />
            }
          />
        ) : (
          // Fallback when the gallery snapshot is empty — render the
          // legacy template list as the new strip UI (name + small icon
          // + save). Live rail (above) is the primary path; this branch
          // only fires when top_remix_prompts.json is empty.
          <TemplateStrip
            cards={nanoCards}
            trackPrefix="home-fallback-template-strip"
            maxRows={24}
          />
        )}

        <HomeToolsStrip />

        <HomeImageWorkbench locale={locale} />

        {discoveryStrip}
      </div>

      <CardViewModal
        card={modalState.card}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        cardType="nano"
      />
    </div>
  );
}
