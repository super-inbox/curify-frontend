"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRequireAuth } from "@/services/useRequireAuth";

import {
  InspirationListItem,
  type InspirationCardType,
} from "@/app/[locale]/_components/InspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";

type Lang = "en" | "zh";

/**
 * Keep only inspiration cards and filter by locale + query.
 * Locale is controlled entirely by pathname:
 * - /zh/... => zh
 * - otherwise => en
 */
function useFilteredInspiration(
  cards: InspirationCardType[],
  activeLang: Lang,
  query: string
) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = cards.filter((c) => {
      const l = (c.lang || "zh").toLowerCase();
      return activeLang === "en" ? l.startsWith("en") : l.startsWith("zh");
    });

    if (q) {
      result = result.filter((c) => {
        const searchableText = [
          c?.signal?.summary,
          c?.translation?.tag,
          ...(c?.translation?.angles || []),
          c?.hook?.text,
          c?.production?.format,
          ...(c?.production?.beats || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(q);
      });
    }

    return result;
  }, [cards, query, activeLang]);
}

function usePageLanguage(): Lang {
  const pathname = usePathname();

  return useMemo(
    () => (pathname?.startsWith("/zh") ? "zh" : "en"),
    [pathname]
  );
}

export default function InspirationHubClient({
  cards,
}: {
  cards: InspirationCardType[];
}) {
  const activeLang = usePageLanguage();
  const filteredCards = useFilteredInspiration(cards, activeLang, "");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: InspirationCardType | null;
  }>({
    isOpen: false,
    card: null,
  });

  const requireAuth = useRequireAuth({ variant: "signup" });

  const handleOpenModal = useCallback((card: InspirationCardType) => {
    setModalState({ isOpen: true, card });
  }, []);

  // Deep link from a shared card: /inspiration-hub?card=<id> opens that card.
  // Share used to hand out /i/<id>, a route deleted 2026-03-26 with no redirect
  // (75 of them turned up in the 2026-09-17 GSC 404 report), so the share URL
  // now points here and this is what makes it land on the right card rather
  // than the top of the grid. Runs once: if the id is unknown the hub just
  // renders normally, which is the correct fallback for an aged-out card.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current) return;
    deepLinked.current = true;
    const id = new URLSearchParams(window.location.search).get("card");
    if (!id) return;
    const match = cards.find((c) => String(c.id) === id);
    if (match) setModalState({ isOpen: true, card: match });
  }, [cards]);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setModalState({ isOpen: false, card: null });
    }, 200);
  }, []);

  return (
    <section>
      <ListView
        filteredCards={filteredCards}
        requireAuth={requireAuth}
        onOpenModal={handleOpenModal}
      />

      {filteredCards.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          <p>No cards found matching your criteria.</p>
        </div>
      )}

      <CardViewModal
        card={modalState.card}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        cardType="inspiration"
      />
    </section>
  );
}


function ListView({
  filteredCards,
  requireAuth,
  onOpenModal,
}: {
  filteredCards: InspirationCardType[];
  requireAuth: () => boolean;
  onOpenModal: (card: InspirationCardType) => void;
}) {
  return (
    <div className="space-y-4">
      {filteredCards.map((card) => (
        <InspirationListItem
          key={`insp-${card.id}`}
          card={card}
          viewMode="list"
          requireAuth={requireAuth}
          onViewClick={() => onOpenModal(card)}
        />
      ))}
    </div>
  );
}