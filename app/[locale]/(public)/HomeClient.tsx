"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { Inter } from "next/font/google";
import { useTranslations } from "next-intl";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import { CardViewModal } from "@/app/[locale]/_components/CardViewModal";
import type { InspirationCardType } from "@/app/[locale]/_components/InspirationCard";

import { NanoInspirationCardType } from "@/lib/nano_utils";
import { resolveContentLocale } from "@/lib/locale_utils";

import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
} from "@/lib/nano_utils";

import { buildNanoFeedCards } from "@/lib/nano_page_data";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

type Lang = "en" | "zh";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function useNanoCards(activeLang: Lang, translate: (key: string) => string) {
  return useMemo(() => {
    try {
      const reg = buildNanoRegistry(
        nanoTemplates as unknown as RawTemplate[],
        nanoInspiration as unknown as RawNanoImageRecord[]
      );

      const locale = resolveContentLocale(activeLang);

      return buildNanoFeedCards(reg, locale, {
        perTemplateMaxImages: 2,
        strictLocale: true,
        translate,
      }) as NanoInspirationCardType[];
    } catch (err) {
      console.error("[nano] failed to build nano cards:", err);
      return [];
    }
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

export default function HomeClient({
  cards = [],
}: {
  cards?: InspirationCardType[];
}) {
  const { activeLang } = useLanguageSync();
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);

  const effectiveLang: Lang = user ? activeLang : "en";

  const tHero = useTranslations("home.hero");
  const tNano = useTranslations("nano");

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

  const nanoCards = useNanoCards(effectiveLang, translateNano);

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