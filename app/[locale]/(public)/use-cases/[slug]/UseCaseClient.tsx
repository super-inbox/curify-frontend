"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAtomValue, useSetAtom } from "jotai";
import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

type ToolCard = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

const BULLET_KEYS = ["bullet0", "bullet1", "bullet2", "bullet3"] as const;

export default function UseCaseClient({
  slug,
  nanoCards,
  toolCards,
}: {
  slug: string;
  nanoCards: NanoInspirationCardType[];
  toolCards: ToolCard[];
}) {
  const t = useTranslations("useCasePage");
  const title = t(`${slug}.title` as never);
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signin");
    return false;
  }, [user, setDrawerState]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-lg font-semibold text-purple-700">
          {t(`${slug}.subtitle` as never)}
        </p>
        <p className="mt-3 max-w-2xl text-base text-neutral-600">
          {t(`${slug}.description` as never)}
        </p>

        <ul className="mt-5 space-y-2">
          {BULLET_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="mt-0.5 text-purple-500">✓</span>
              {t(`${slug}.${key}` as never)}
            </li>
          ))}
        </ul>
      </section>

      {/* Tools */}
      {toolCards.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("toolsHeading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {toolCards.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
              >
                <div className="text-base font-bold text-neutral-900 transition-colors group-hover:text-purple-700">
                  {tool.title}
                </div>
                <div className="text-sm text-neutral-500">{tool.description}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nano Templates */}
      {nanoCards.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {t("templatesHeading", { title })}
          </h2>
          <NanoInspirationRow
            cards={nanoCards}
            requireAuth={requireAuth}
            onViewClick={() => {}}
          />
        </section>
      )}
    </main>
  );
}
