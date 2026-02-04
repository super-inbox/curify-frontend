"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";

import { 
  InspirationCard, 
  InspirationListItem, 
  type InspirationCardType 
} from "@/app/[locale]/_components/InspirationCard";
import { 
  NanoInspirationRow, 
  type NanoInspirationCardType 
} from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";

// --- Types ---
type ViewMode = "list" | "cards";
type InterleavedItem = 
  | { type: "inspiration"; card: InspirationCardType } 
  | { type: "nano"; cards: NanoInspirationCardType[] };

type Lang = "en" | "zh";

// --- Helpers ---
function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

/** * Pure function to weave Nano cards into Inspiration cards.
 * Inserts a row of 3 Nano cards after every 4 Inspiration cards.
 */
function getInterleavedData(
  mainCards: InspirationCardType[], 
  nanoCards: NanoInspirationCardType[]
): InterleavedItem[] {
  const result: InterleavedItem[] = [];

  mainCards.forEach((card, index) => {
    // 1. Add the main card
    result.push({ type: "inspiration", card });

    // 2. Check if we need to insert a Nano row (Every 4th item)
    if ((index + 1) % 4 === 0 && nanoCards.length > 0) {
      // Calculate which "block" of nano cards to show
      const blockIndex = Math.floor(index / 4);
      // Use modulo to cycle through nano cards if we run out
      const startIdx = (blockIndex * 3) % nanoCards.length;
      const rowCards = nanoCards.slice(startIdx, startIdx + 3);
      
      if (rowCards.length > 0) {
        result.push({ type: "nano", cards: rowCards });
      }
    }
  });

  return result;
}

// --- Custom Hooks ---

/** Handles fetching and language filtering for Nano cards */
function useNanoCards(activeLang: Lang) {
  const [allNanoCards, setAllNanoCards] = useState<NanoInspirationCardType[]>([]);

  useEffect(() => {
    fetch("/data/nano_inspiration.json")
      .then((res) => res.json())
      .then((data) => setAllNanoCards(data))
      .catch((err) => console.error("Failed to load nano cards:", err));
  }, []);

  return useMemo(() => {
    return allNanoCards.filter((n) => n.language === activeLang);
  }, [allNanoCards, activeLang]);
}

/** Handles Search and Language filtering for Main cards */
function useFilteredInspiration(cards: InspirationCardType[], activeLang: Lang, query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1) Language filter
    let result = cards.filter((c) => {
      const l = (c.lang || "zh").toLowerCase();
      return activeLang === "en" ? l.startsWith("en") : l.startsWith("zh");
    });

    // 2) Text search
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

/** Handles URL and State synchronization for Language */
function useLanguageSync() {
  const router = useRouter();
  const pathname = usePathname();

  const urlLang: Lang = useMemo(() => {
    return pathname?.startsWith("/en") ? "en" : "zh";
  }, [pathname]);

  const [activeLang, setActiveLang] = useState<Lang>(urlLang);

  useEffect(() => {
    setActiveLang(urlLang);
  }, [urlLang]);

  const switchLang = (nextLang: Lang) => {
    setActiveLang(nextLang);
    const parts = (pathname || "").split("/").filter(Boolean);
    if (parts.length > 0) {
      parts[0] = nextLang;
      router.push("/" + parts.join("/"));
    }
  };

  return { activeLang, switchLang };
}

// --- Main Component ---

export default function InspirationHubClient({ cards }: { cards: InspirationCardType[] }) {
  const [query, setQuery] = useState("");
  
  // Custom Hooks for Data Logic
  const { activeLang, switchLang } = useLanguageSync();
  const nanoCards = useNanoCards(activeLang);
  const filteredCards = useFilteredInspiration(cards, activeLang, query);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: InspirationCardType | NanoInspirationCardType | null;
    type: "inspiration" | "nano";
  }>({
    isOpen: false,
    card: null,
    type: "inspiration",
  });

  // Auth Logic
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  
  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signup");
    return false;
  }, [user, setDrawerState]);

  // Handlers
  const handleOpenModal = useCallback((card: any, type: "inspiration" | "nano") => {
    setModalState({ isOpen: true, card, type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setModalState(prev => ({ ...prev, card: null }));
    }, 200);
  }, []);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3">
        {/* Filters UI */}
        <Filters 
          query={query} 
          setQuery={setQuery} 
          activeLang={activeLang} 
          onSwitchLang={switchLang} 
          count={filteredCards.length}
          total={cards.length}
        />
      </div>

      {/* List View */}
      <ListView 
        filteredMainCards={filteredCards} 
        nanoCards={nanoCards} 
        requireAuth={requireAuth}
        onOpenModal={handleOpenModal}
      />

      {filteredCards.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          <p>No cards found matching your criteria.</p>
        </div>
      )}

      {/* Card View Modal */}
      <CardViewModal
        card={modalState.card}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        cardType={modalState.type}
      />
    </section>
  );
}

// --- Sub Components ---

function Filters({ query, setQuery, activeLang, onSwitchLang, count, total }: any) {
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

        <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1">
          {(["zh", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onSwitchLang(lang)}
              className={classNames(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors uppercase",
                activeLang === lang ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
              )}
              type="button"
            >
              {lang === "zh" ? "中文" : "EN"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Showing <span className="font-medium text-neutral-700">{count}</span> of {total} cards
        </span>
      </div>
    </>
  );
}

function ListView({
  filteredMainCards,
  nanoCards,
  requireAuth,
  onOpenModal,
}: {
  filteredMainCards: InspirationCardType[];
  nanoCards: NanoInspirationCardType[];
  requireAuth: () => boolean;
  onOpenModal: (card: any, type: "inspiration" | "nano") => void;
}) {
  // Use the helper to generate the mixed list
  const data = useMemo(() => 
    getInterleavedData(filteredMainCards, nanoCards), 
  [filteredMainCards, nanoCards]);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        if (item.type === "inspiration") {
          return (
            <InspirationListItem
              key={`insp-${item.card.id}`}
              card={item.card}
              viewMode="list"
              requireAuth={requireAuth}
              onViewClick={() => onOpenModal(item.card, "inspiration")}
            />
          );
        }
        return (
          <NanoInspirationRow 
            key={`nano-row-${index}`} 
            cards={item.cards} 
            requireAuth={requireAuth}
            onViewClick={(c) => onOpenModal(c, "nano")}
          />
        );
      })}
    </div>
  );
}