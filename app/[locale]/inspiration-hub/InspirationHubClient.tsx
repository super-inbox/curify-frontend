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

type ViewMode = "list" | "cards";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function InspirationHubClient({ cards }: { cards: InspirationCardType[] }) {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [nanoCards, setNanoCards] = useState<NanoInspirationCardType[]>([]);
  
  // Modal state
  const [modalCard, setModalCard] = useState<InspirationCardType | NanoInspirationCardType | null>(null);
  const [modalCardType, setModalCardType] = useState<"inspiration" | "nano">("inspiration");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Determine default language from URL locale prefix
  const urlLang: "en" | "zh" = useMemo(() => {
    if (pathname?.startsWith("/en")) return "en";
    return "zh";
  }, [pathname]);

  const [activeLang, setActiveLang] = useState<"en" | "zh">(urlLang);

  // Keep activeLang in sync if user navigates across locales
  useEffect(() => {
    setActiveLang(urlLang);
  }, [urlLang]);

  function switchLang(nextLang: "en" | "zh") {
    setActiveLang(nextLang);

    // Update URL locale segment: /en/... or /zh/...
    const parts = (pathname || "").split("/").filter(Boolean);
    if (parts.length === 0) return;

    // replace first segment (locale)
    parts[0] = nextLang;
    router.push("/" + parts.join("/"));
  }

  useEffect(() => {
    // Load nano banana cards (new JSON format)
    fetch("/data/nano_inspiration.json")
      .then((res) => res.json())
      .then((data) => setNanoCards(data))
      .catch((err) => console.error("Failed to load nano cards:", err));
  }, []);

  const nanoCardsForLang = useMemo(() => {
    return (nanoCards || []).filter((n) => n.language === activeLang);
  }, [nanoCards, activeLang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1) Language filter first
    let result = (cards || []).filter((c) => {
      const l = (c.lang || "zh").toLowerCase();
      return activeLang === "en" ? l.startsWith("en") : l.startsWith("zh");
    });

    // 2) Text search
    if (q) {
      result = result.filter((c) => {
        const hay = [
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

        return hay.includes(q);
      });
    }

    // 3) Rating filter
    if (minRating !== null) {
      result = result.filter((c) => c.rating && c.rating.score >= minRating);
    }

    return result;
  }, [cards, query, minRating, activeLang]);

  // ✅ Auth gate function to pass down
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const requireAuth = useMemo(() => {
    return (reason?: string) => {
      if (user) return true;
      setDrawerState("signup");
      return false;
    };
  }, [user, setDrawerState]);

  // Modal handlers
  const handleOpenInspirationModal = useCallback((card: InspirationCardType) => {
    setModalCard(card);
    setModalCardType("inspiration");
    setIsModalOpen(true);
  }, []);

  const handleOpenNanoModal = useCallback((card: NanoInspirationCardType) => {
    setModalCard(card);
    setModalCardType("nano");
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalCard(null);
    }, 200);
  }, []);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search signals, angles, hooks..."
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-300"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={minRating?.toString() || ""}
            onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-300"
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.0">4.0+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
          </select>

          {/* Language Toggle */}
          <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1">
            <button
              onClick={() => switchLang("zh")}
              className={classNames(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeLang === "zh" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
              )}
              type="button"
            >
              中文
            </button>
            <button
              onClick={() => switchLang("en")}
              className={classNames(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeLang === "en" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
              )}
              type="button"
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing <span className="font-medium text-neutral-700">{filtered.length}</span> of {cards.length} cards
          </span>
          {minRating && (
            <button onClick={() => setMinRating(null)} className="text-blue-600 hover:text-blue-700" type="button">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* List View */}
      <ListView 
        filtered={filtered} 
        nanoCards={nanoCardsForLang} 
        requireAuth={requireAuth}
        onViewInspirationClick={handleOpenInspirationModal}
        onViewNanoClick={handleOpenNanoModal}
      />

      {filtered.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          <p>No cards found matching your criteria.</p>
          {minRating && (
            <button
              onClick={() => setMinRating(null)}
              className="mt-2 text-blue-600 hover:text-blue-700"
              type="button"
            >
              Clear rating filter
            </button>
          )}
        </div>
      )}

      {/* Card View Modal */}
      <CardViewModal
        card={modalCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cardType={modalCardType}
      />
    </section>
  );
}

// List View with Nano Banana Cards Interleaved
function ListView({
  filtered,
  nanoCards,
  requireAuth,
  onViewInspirationClick,
  onViewNanoClick,
}: {
  filtered: InspirationCardType[];
  nanoCards: NanoInspirationCardType[];
  requireAuth: (reason?: string) => boolean;
  onViewInspirationClick: (card: InspirationCardType) => void;
  onViewNanoClick: (card: NanoInspirationCardType) => void;
}) {
  const interleavedContent: Array<
    { type: "inspiration"; card: InspirationCardType } | { type: "nano"; cards: NanoInspirationCardType[] }
  > = [];

  filtered.forEach((card, index) => {
    interleavedContent.push({ type: "inspiration", card });

    // Every 4 cards, insert a nano row
    if ((index + 1) % 4 === 0 && nanoCards.length > 0) {
      const block = Math.floor(index / 4);
      const startIdx = (block * 3) % nanoCards.length;
      const rowCards = nanoCards.slice(startIdx, startIdx + 3);
      if (rowCards.length > 0) interleavedContent.push({ type: "nano", cards: rowCards });
    }
  });

  return (
    <div className="space-y-4">
      {interleavedContent.map((item, index) => {
        if (item.type === "inspiration") {
          return (
            <InspirationListItem
              key={`insp-${item.card.id}`}
              card={item.card}
              viewMode="list"
              requireAuth={requireAuth}
              onViewClick={() => onViewInspirationClick(item.card)}
            />
          );
        }
        return (
          <NanoInspirationRow 
            key={`nano-${index}`} 
            cards={item.cards} 
            requireAuth={requireAuth}
            onViewClick={onViewNanoClick}
          />
        );
      })}
    </div>
  );
}
