"use client";

import { useCallback, useState } from "react";
import { Inter } from "next/font/google";
import { useRequireAuth } from "@/services/useRequireAuth";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import HomeToolsStrip from "./HomeToolsStrip";
import WcRotatingSlot from "@/app/[locale]/_components/WcRotatingSlot";
import { TOP_QUERIES } from "@/app/[locale]/(public)/topics/[slug]/TopSearchSuggestions";

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
}: {
  locale?: string;
  nanoCards?: NanoInspirationCardType[];
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

  return (
    <div className={classNames(inter.className, "w-full bg-[#FDFDFD] px-4 pb-10 pt-0 md:px-6 lg:px-10")}>
      <div className="w-full max-w-[1600px]">
        <NanoInspirationRow
          cards={nanoCards}
          requireAuth={requireAuth}
          onViewClick={handleOpenModal}
          maxRows={8}
          topRightCell={<WcRotatingSlot locale={locale} queries={TOP_QUERIES["world-cup"]} />}
        />

        <HomeToolsStrip />
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
