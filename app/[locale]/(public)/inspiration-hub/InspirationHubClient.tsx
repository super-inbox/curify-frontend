"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";

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
  const [query, setQuery] = useState("");
  const activeLang = usePageLanguage();
  const filteredCards = useFilteredInspiration(cards, activeLang, query);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: InspirationCardType | null;
  }>({
    isOpen: false,
    card: null,
  });

  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signup");
    return false;
  }, [user, setDrawerState]);

  const handleOpenModal = useCallback((card: InspirationCardType) => {
    setModalState({ isOpen: true, card });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setModalState({ isOpen: false, card: null });
    }, 200);
  }, []);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3">
        <Filters
          query={query}
          setQuery={setQuery}
          count={filteredCards.length}
          total={cards.length}
        />
      </div>

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

function Filters({
  query,
  setQuery,
  count,
  total,
}: {
  query: string;
  setQuery: (value: string) => void;
  count: number;
  total: number;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signals, angles, hooks..."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Showing <span className="font-medium text-neutral-700">{count}</span>{" "}
          of {total} cards
        </span>
      </div>
    </>
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