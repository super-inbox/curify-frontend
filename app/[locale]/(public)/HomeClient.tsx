"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { Search, Type, Building2, Sparkles } from "lucide-react";
import { Inter } from "next/font/google";

import {
  InspirationListItem,
  type InspirationCardType,
} from "@/app/[locale]/_components/InspirationCard";
import {
  NanoInspirationRow,
  type NanoInspirationCardType,
} from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";

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

        const res = await fetch("/data/nano_inspiration.json");
        console.log(
          "[nano] fetch status:",
          res.status,
          res.headers.get("content-type")
        );

        const raw = await res.json();

        // ---- RAW SHAPE DEBUG ----
        console.log("[nano] raw type:", Array.isArray(raw) ? "array" : typeof raw);
        console.log("[nano] raw length:", Array.isArray(raw) ? raw.length : "N/A");
        console.log("[nano] raw sample:", Array.isArray(raw) ? raw.slice(0, 5) : raw);

        if (!Array.isArray(raw)) {
          console.error("[nano] ❌ nano_inspiration.json is NOT an array");
          setNanoCards([]);
          return;
        }

        // ---- FIELD SANITY CHECK ----
        const sample = raw[0];
        console.log("[nano] sample keys:", sample ? Object.keys(sample) : "NO SAMPLE");

        // ---- FILTER + GROUP DEBUG COUNTERS ----
        let total = 0;
        let langMismatch = 0;
        let noTemplateId = 0;
        let accepted = 0;

        const byTemplate = new Map<string, typeof raw>();

        for (const r of raw) {
          total++;

          if (!r?.template_id) {
            noTemplateId++;
            continue;
          }

          const recordLang = String(r.language || "").toLowerCase();
          const okLang =
            activeLang === "en"
              ? recordLang.startsWith("en")
              : recordLang.startsWith("zh");
          
          if (!okLang) {
            langMismatch++;
            continue;
          }

          accepted++;

          const arr = byTemplate.get(r.template_id) ?? [];
          arr.push(r);
          byTemplate.set(r.template_id, arr);
        }

        console.log("[nano] total records:", total);
        console.log("[nano] accepted:", accepted);
        console.log("[nano] langMismatch:", langMismatch);
        console.log("[nano] noTemplateId:", noTemplateId);
        console.log("[nano] template groups:", Array.from(byTemplate.keys()));

        // ---- BUILD UI CARDS ----
        const grouped: NanoInspirationCardType[] = [];

        for (const [templateId, records] of byTemplate.entries()) {
          const image_urls = records
            .map((r) => r.image_url)
            .filter(Boolean);

          const preview_image_urls = records
            .map((r) => r.preview_image_url || r.image_url)
            .filter(Boolean);

          grouped.push({
            id: templateId,                // IMPORTANT: template-level id
            template_id: templateId,
            language: activeLang,
            category: records[0]?.category ?? "Template",
            image_urls,
            preview_image_urls            
          });
        }

        console.log("[nano] FINAL grouped cards len:", grouped.length);
        console.log("[nano] FINAL grouped sample:", grouped[0]);

        if (!cancelled) setNanoCards(grouped);
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
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Discover Ideas{" "}
            <span className="mx-2 font-light text-neutral-300">|</span>{" "}
            Express Visually{" "}
            <span className="mx-2 font-light text-neutral-300">|</span>{" "}
            Create Content
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Curated inspirations + functional visual templates to help you
            create faster.
          </p>
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

          {/* Right: Sidebar */}
          <aside className="lg:col-span-4 lg:border-l lg:border-neutral-200/70 lg:pl-8">
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Tools */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold tracking-tight text-neutral-900">
                  Content Creation Tools
                </h3>

                <div className="space-y-3">
                  <SidebarToolItem
                    icon={
                      <img
                        src="/icons/translation-icon.png"
                        alt="Translation"
                        className="h-6 w-6"
                      />
                    }
                    colorClass="bg-blue-600"
                    title="Video Translator"
                    desc="Translate YouTube & MP4 videos"
                    onClick={() => router.push(`/${activeLang}/video-dubbing`)}
                  />

                  <SidebarToolItem
                    icon={
                      <img
                        src="/icons/subtitle-icon.png"
                        alt="Subtitle"
                        className="h-6 w-6"
                      />
                    }
                    colorClass="bg-green-500"
                    title="Subtitle Generator"
                    desc="Create accurate subtitles instantly"
                    onClick={() =>
                      router.push(`/${activeLang}/bilingual-subtitles`)
                    }
                  />

                  <SidebarToolItem
                    icon={<Type className="h-5 w-5" />}
                    colorClass="bg-purple-500"
                    title="Word Cards"
                    desc="Build vocabulary visually"
                    badge={<NanoBadge />}
                    // optional: could route to /nano-banana-pro-prompts or /n
                    onClick={() =>
                      router.push(`/${activeLang}/nano-banana-pro-prompts`)
                    }
                  />

                  <SidebarToolItem
                    icon={<Building2 className="h-5 w-5" />}
                    colorClass="bg-sky-500"
                    title="City Visual Packs"
                    desc="Visual packs for global landmarks"
                    badge={<NanoBadge />}
                    onClick={() => router.push(`/${activeLang}/inspiration-hub`)}
                  />
                </div>

                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <button
                    onClick={() => router.push(`/${activeLang}/tools`)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                    type="button"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create New Content
                  </button>
                </div>
              </div>
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