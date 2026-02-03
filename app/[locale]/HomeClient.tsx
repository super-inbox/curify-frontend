"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { Search, Type, Building2, Sparkles } from "lucide-react"; // Removed Video, FileText

import { 
  InspirationListItem, 
  type InspirationCardType 
} from "@/app/[locale]/_components/InspirationCard";
import { 
  NanoInspirationRow, 
  type NanoInspirationCardType 
} from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";

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
  mainCards.forEach((card, index) => {
    result.push({ type: "inspiration", card });
    if ((index + 1) % 4 === 0 && nanoCards.length > 0) {
      const blockIndex = Math.floor(index / 4);
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
function useNanoCards(activeLang: Lang) {
  const [allNanoCards, setAllNanoCards] = useState<NanoInspirationCardType[]>([]);
  useEffect(() => {
    fetch("/data/nano_inspiration.json")
      .then((res) => res.json())
      .then((data) => setAllNanoCards(data))
      .catch((err) => console.error("Failed to load nano cards:", err));
  }, []);
  return useMemo(() => allNanoCards.filter((n) => n.language === activeLang), [allNanoCards, activeLang]);
}

function useFilteredInspiration(cards: InspirationCardType[], activeLang: Lang, query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = cards.filter((c) => {
      const l = (c.lang || "zh").toLowerCase();
      return activeLang === "en" ? l.startsWith("en") : l.startsWith("zh");
    });
    if (q) {
      result = result.filter((c) => {
        const searchableText = [
          c?.signal?.summary, c?.translation?.tag, ...(c?.translation?.angles || []),
          c?.hook?.text, c?.production?.format, ...(c?.production?.beats || []),
        ].filter(Boolean).join(" ").toLowerCase();
        return searchableText.includes(q);
      });
    }
    return result;
  }, [cards, query, activeLang]);
}

function useLanguageSync() {
  const router = useRouter();
  const pathname = usePathname();
  const urlLang: Lang = useMemo(() => pathname?.startsWith("/en") ? "en" : "zh", [pathname]);
  const [activeLang, setActiveLang] = useState<Lang>(urlLang);

  useEffect(() => setActiveLang(urlLang), [urlLang]);

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

// --- Sidebar Sub-components ---
function SidebarToolItem({ 
  icon, 
  colorClass, 
  title, 
  desc, 
  badge 
}: { 
  icon: React.ReactNode; 
  colorClass: string; 
  title: string; 
  desc: string; 
  badge?: React.ReactNode 
}) {
  return (
    <div className="group flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50">
      <div className={classNames("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white", colorClass)}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-medium text-neutral-900">{title}</h4>
          {badge}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function NanoBadge() {
  return (
    <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700">
      Nano Banana
    </span>
  );
}

// --- Main Client Component ---

export default function HomeClient({ cards = [] }: { cards?: InspirationCardType[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { activeLang, switchLang } = useLanguageSync();
  const nanoCards = useNanoCards(activeLang);
  const filteredCards = useFilteredInspiration(cards, activeLang, query);

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

  const handleOpenModal = useCallback((card: any, type: "inspiration" | "nano") => {
    setModalState({ isOpen: true, card, type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => setModalState(prev => ({ ...prev, card: null })), 200);
  }, []);

  return (
    // Applied a font stack to match the screenshot
    <main 
      className="min-h-screen bg-[#FDFDFD] px-4 pt-18 pb-8 lg:px-8"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' }}
    >
      <div className="mx-auto max-w-7xl">
        
        {/* Header Headline */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
            Discover Ideas <span className="mx-2 font-light text-neutral-300">|</span> Express Visually <span className="mx-2 font-light text-neutral-300">|</span> Create Content
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Column: Feed (Span 8) */}
          <div className="lg:col-span-8">
            {/* Search Bar */}
            <div className="sticky top-24 z-10 mb-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-2 shadow-sm transition-all">
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="h-5 w-5 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for inspiration..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </div>
              <div className="flex items-center gap-3 border-l border-neutral-100 pl-3">
                <div className="flex gap-1">
                  <button 
                    onClick={() => switchLang("en")} 
                    className={classNames("text-xs font-medium transition-colors px-2 py-1 rounded", activeLang === "en" ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-600")}
                  >
                    English
                  </button>
                  <span className="text-xs text-neutral-300">|</span>
                  <button 
                    onClick={() => switchLang("zh")}
                    className={classNames("text-xs font-medium transition-colors px-2 py-1 rounded", activeLang === "zh" ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-600")}
                  >
                    中文
                  </button>
                </div>
              </div>
            </div>

            {/* List View */}
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

          {/* Right Column: Sidebar (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Tools */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Content Creation Tools</h3>
              
              <div className="space-y-4">
                {/* Using Custom PNG Icon */}
                <SidebarToolItem 
                  icon={<img src="/icons/translation-icon.png" alt="Translation" className="h-6 w-6" />}
                  colorClass="bg-blue-600"
                  title="AI Video Translator"
                  desc="Translate YouTube & MP4 videos"
                />
                
                {/* Using Custom PNG Icon */}
                <SidebarToolItem 
                  icon={<img src="/icons/subtitle-icon.png" alt="Subtitle" className="h-6 w-6" />}
                  colorClass="bg-green-500"
                  title="AI Subtitle Generator"
                  desc="Create accurate subtitles instantly"
                />

                <SidebarToolItem 
                  icon={<Type className="h-5 w-5" />}
                  colorClass="bg-purple-500"
                  title="Word Cards"
                  desc="Fun, effective way to build vocabulary visually"
                  badge={<NanoBadge />}
                />

                <SidebarToolItem 
                  icon={<Building2 className="h-5 w-5" />}
                  colorClass="bg-sky-500"
                  title="City Visual Packs"
                  desc="Detailed visual packs for global landmarks"
                  badge={<NanoBadge />}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100">
                <button 
                  onClick={() => router.push(`/${activeLang}/tools`)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate New Content
                </button>
              </div>
            </div>

          </div>
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
  const data = useMemo(() => 
    getInterleavedData(filteredMainCards, nanoCards), 
  [filteredMainCards, nanoCards]);

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