"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Inter } from "next/font/google";
import { useRequireAuth } from "@/services/useRequireAuth";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import HomeToolsStrip from "./HomeToolsStrip";
import HomeHero from "./HomeHero";
import HomeSolutionsGrid from "./HomeSolutionsGrid";
import HomeWorkflow from "./HomeWorkflow";
import WcRotatingSlot from "@/app/[locale]/_components/WcRotatingSlot";
import { TOP_QUERIES } from "@/app/[locale]/(public)/topics/[slug]/TopSearchSuggestions";
import HomeFusedRow, { type TopRemixPrompt } from "./HomeFusedRow";

// Canva-style topic strip (per raw/canva-strip-06-28). Server-rendered
// node passed in via the `topicStrip` prop so this client file stays
// data-light (no full topic registry import).

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
  topRemixPrompts = [],
  searchQueries = [],
  discoveryStrip,
  topicStrip,
}: {
  locale?: string;
  nanoCards?: NanoInspirationCardType[];
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
  /** Canva-style topic strip (2026-06-28). Server-rendered upstream so
   *  this client file stays light. Mounted ABOVE the fused row as the
   *  prominent "Explore templates" surface; the legacy pill-style
   *  discoveryStrip stays below for now (operator A/B before swap). */
  topicStrip?: ReactNode;
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

        {topicStrip}

        {topRemixPrompts.length > 0 ? (
          <HomeFusedRow
            templates={nanoCards}
            galleryPrompts={topRemixPrompts}
            searchQueries={searchQueries}
            locale={locale}
            requireAuth={requireAuth}
            onViewClick={handleOpenModal}
            maxRows={8}
            topRightCell={
              <WcRotatingSlot locale={locale} queries={TOP_QUERIES["world-cup"]} />
            }
          />
        ) : (
          <NanoInspirationRow
            cards={nanoCards}
            requireAuth={requireAuth}
            onViewClick={handleOpenModal}
            maxRows={8}
            topRightCell={<WcRotatingSlot locale={locale} queries={TOP_QUERIES["world-cup"]} />}
          />
        )}

        <HomeToolsStrip />

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
