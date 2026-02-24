"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { Search, Type, Building2, Sparkles } from "lucide-react";
import { Inter } from "next/font/google";
import ContentCreationToolsSidebar from "@/app/[locale]/_components/ContentCreationToolsSidebar";
import { useTranslations } from "next-intl";

import {
  InspirationListItem,
  type InspirationCardType,
} from "@/app/[locale]/_components/InspirationCard";
import {
  NanoInspirationRow,  
} from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";

import { NanoInspirationCardType } from "@/lib/nano_utils";

import {
  buildNanoRegistry,
  buildNanoFeedCards,
  normalizeLocale,
  type RawTemplate,
  type RawNanoImageRecord,
} from "@/lib/nano_utils";

// --- Font (modern SaaS look) ---
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

function getInterleavedData(mainCards: InspirationCardType[], nanoCards: NanoInspirationCardType[]): InterleavedItem[] {
  const result: InterleavedItem[] = [];
  let inserted = false;

  mainCards.forEach((card, index) => {
    result.push({ type: "inspiration", card });
    if ((index + 1) % 4 === 0 && nanoCards.length > 0) {
      const blockIndex = Math.floor(index / 4);
      const startIdx = (blockIndex * 3) % nanoCards.length;
      const rowCards = nanoCards.slice(startIdx, startIdx + 3);
      if (rowCards.length > 0) {
        result.push({ type: "nano", cards: rowCards });
        inserted = true;
      }
    }
  });

  if (!inserted && nanoCards.length > 0) {
    result.push({ type: "nano", cards: nanoCards.slice(0, 3) });
  }

  return result;
}


function useNanoCards(activeLang: Lang) {
  const [nanoCards, setNanoCards] = useState<NanoInspirationCardType[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        console.log("[nano] loading nano cards, activeLang =", activeLang);

        // Fetch both template metadata + image-level records
        const [tplRes, imgRes] = await Promise.all([
          fetch("/data/nano_templates.json"),
          fetch("/data/nano_inspiration.json"),
        ]);

        const templatesRaw = (await tplRes.json()) as RawTemplate[];
        const imagesRaw = (await imgRes.json()) as RawNanoImageRecord[];

        const reg = buildNanoRegistry(templatesRaw, imagesRaw);

        const locale = normalizeLocale(activeLang);

        // Build 1 card per template (same shape home timeline consumes)
        // Preload 1-2 images per card for carousel
        const cards = buildNanoFeedCards(reg, locale, {
          perTemplateMaxImages: 2,
          strictLocale: true,
        });

        // One-line sanity log
        console.log(
          "[nano] built feed cards:",
          cards.length,
          "sample=",
          cards[0]
        );

        if (!cancelled) setNanoCards(cards as any);
      } catch (err) {
        console.error("[nano] ❌ failed to load nano cards:", err);
        if (!cancelled) setNanoCards([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeLang]);

  return nanoCards;
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

  // Robustly determine current lang from URL
  const urlLang: Lang = useMemo(
    () => (pathname?.startsWith("/zh") ? "zh" : "en"),
    [pathname]
  );
  const [activeLang, setActiveLang] = useState<Lang>(urlLang);

  useEffect(() => setActiveLang(urlLang), [urlLang]);

  return { activeLang };
}

// --- Sidebar Sub-components ---
function SidebarToolItem({
  icon,
  colorClass,
  title,
  desc,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={classNames(
        "group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-neutral-50",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div
        className={classNames(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
          colorClass
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-[15px] font-semibold text-neutral-900">
            {title}
          </h4>
          {badge}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function NanoBadge() {
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
      Nano Banana
    </span>
  );
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
  const nanoCards = useNanoCards(activeLang);
  const filteredCards = useFilteredInspiration(cards, activeLang, query);

  const tHero = useTranslations("home.hero"); // ✅

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

            {/* ✅ If you keep hero.description as ONE paragraph */}
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              {tHero("description")}
            </p>

            {/* ✅ If you prefer two paragraphs, use hero.descriptionLine1/2 instead (see note below) */}
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