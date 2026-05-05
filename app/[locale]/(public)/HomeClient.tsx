"use client";

import { useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { Inter } from "next/font/google";
import { useTranslations } from "next-intl";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";
import type { InspirationCardType } from "@/app/[locale]/_components/InspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function HomeClient({
  cards = [],
  nanoCards = [],
}: {
  cards?: InspirationCardType[];
  nanoCards?: NanoInspirationCardType[];
}) {
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);

  const tHero = useTranslations("home.hero");

  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signup");
    return false;
  }, [user, setDrawerState]);

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
      <div className="w-full max-w-[1400px]">
        <div className="w-full max-w-[1400px] pb-6 pl-3">
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900 md:text-4xl">
            {tHero("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-700">
            {tHero("description")}
          </p>
        </div>

        <NanoInspirationRow
          cards={nanoCards}
          requireAuth={requireAuth}
          onViewClick={handleOpenModal}
        />
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
