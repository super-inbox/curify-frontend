"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { Search } from "lucide-react";
import { Inter } from "next/font/google";
import ContentCreationToolsSidebar from "@/app/[locale]/_components/ContentCreationToolsSidebar";
import { useTranslations } from "next-intl";

import {
  InspirationListItem,
  type InspirationCardType,
} from "@/app/[locale]/_components/InspirationCard";
import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";

import { NanoInspirationCardType } from "@/lib/nano_utils";

import {
  buildNanoRegistry,
  buildNanoFeedCards,
  normalizeLocale,
  type RawTemplate,
  type RawNanoImageRecord,
} from "@/lib/nano_utils";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";

// --- Font ---
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// --- Types ---
type Lang = "en" | "zh";
type InterleavedItem =
  | { type: "inspiration"; card: InspirationCardType }
  | { type: "nano"; cards: NanoInspirationCardType[] };

// --- Helpers ---
function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function getInterleavedData(
  mainCards: InspirationCardType[],
  nanoCards: NanoInspirationCardType[]
): InterleavedItem[] {
  const result: InterleavedItem[] = [];

  if (nanoCards.length > 0) {
    result.push({ type: "nano", cards: nanoCards.slice(0, 3) });
  }

  mainCards.forEach((card, index) => {
    result.push({ type: "inspiration", card });

    if ((index + 1) % 3 === 0 && nanoCards.length > 0) {
      const blockIndex = Math.floor((index + 1) / 3);
      const startIdx = (blockIndex * 3) % nanoCards.length;
      const rowCards = nanoCards.slice(startIdx, startIdx + 3);
      if (rowCards.length > 0) {
        result.push({ type: "nano", cards: rowCards });
      }
    }
  });

  return result;
}

/**
 * Builds nano feed cards with i18n-resolved category + description.
 * `translate` is a safe wrapper around tNano(key) — see HomeClient.
 */
function useNanoCards(activeLang: Lang, translate: (key: string) => string) {
  return useMemo(() => {
    try {
      console.log("[nano] building nano cards, activeLang =", activeLang);

      const reg = buildNanoRegistry(
        nanoTemplates as unknown as RawTemplate[],
        nanoInspiration as unknown as RawNanoImageRecord[]
      );

      const locale = normalizeLocale(activeLang);

      const cards = buildNanoFeedCards(reg, locale, {
        perTemplateMaxImages: 2,
        strictLocale: true,
        translate,
      });

      console.log(
        "[nano] built feed cards:",
        cards.length,
        "sample=",
        cards[0]
      );

      return cards as NanoInspirationCardType[];
    } catch (err) {
      console.error("[nano] ❌ failed to build nano cards:", err);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang, translate]);
}

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

function useLanguageSync() {
  const pathname = usePathname();

  const urlLang: Lang = useMemo(
    () => (pathname?.startsWith("/zh") ? "zh" : "en"),
    [pathname]
  );
  const [activeLang, setActiveLang] = useState<Lang>(urlLang);

  useEffect(() => setActiveLang(urlLang), [urlLang]);

  return { activeLang };
}

// --- Main Client Component ---
export default function HomeClient({
  cards = [],
}: {
  cards?: InspirationCardType[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { activeLang } = useLanguageSync();

  const tHero = useTranslations("home.hero");

  const tNano = useTranslations("nano");

  /** Safe wrapper — returns "" for any key not yet in nano.json */
  const translateNano = useCallback(
    (key: string): string => {
      try {
        return tNano(key as any) ?? "";
      } catch {
        return "";
      }
    },
    [tNano]
  );

  const nanoCards = useNanoCards(activeLang, translateNano);
  const filteredCards = useFilteredInspiration(cards, activeLang, query);

  useEffect(() => {
    console.log("[home] activeLang:", activeLang);
    console.log("[home] nanoCards len:", nanoCards.length);
    if (nanoCards.length) console.log("[home] nanoCards[0]:", nanoCards[0]);
  }, [activeLang, nanoCards]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: InspirationCardType | NanoInspirationCardType | null;
    type: "inspiration" | "nano";
  }>({ isOpen: false, card: null, type: "inspiration" });

  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signup");
    return false;
  }, [user, setDrawerState]);

  const handleOpenModal = useCallback(
    (card: any, type: "inspiration" | "nano") => {
      setModalState({ isOpen: true, card, type });
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => setModalState((prev) => ({ ...prev, card: null })), 200);
  }, []);

  return (
    <main
      className={classNames(
        inter.className,
        "min-h-screen bg-[#FDFDFD] px-4 pt-18 pb-10 lg:px-6"
      )}
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Headline */}
        <div className="pt-10 pb-6">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900 md:text-4xl">
              {tHero("title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              {tHero("description")}
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: Feed */}
          <div className="lg:col-span-8">
            {/* Search */}
            <div className="sticky top-24 z-10 mb-6 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 px-2">
                <Search className="h-5 w-5 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for inspiration..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Feed */}
            <ListView
              filteredMainCards={filteredCards}
              nanoCards={nanoCards}
              requireAuth={requireAuth}
              onOpenModal={handleOpenModal}
            />

            {filteredCards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                <Search className="mb-4 h-10 w-10 opacity-20" />
                <p>No results found for your search.</p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 lg:border-l lg:border-neutral-200/70 lg:pl-8">
            <div className="space-y-6 lg:sticky lg:top-24">
              <ContentCreationToolsSidebar activeLang={activeLang} />
            </div>
          </aside>
        </div>
      </div>

      <CardViewModal
        card={modalState.card}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        cardType={modalState.type}
      />
    </main>
  );
}

// --- ListView Helper ---
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
  const data = useMemo(
    () => getInterleavedData(filteredMainCards, nanoCards),
    [filteredMainCards, nanoCards]
  );

  return (
    <div className="space-y-6">
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
