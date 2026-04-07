"use client";

import Link from "next/link";
import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import type { UseCaseDef } from "@/lib/use-cases";

type ToolCard = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export default function UseCaseClient({
  useCase,
  nanoCards,
  locale,
  toolCards,
}: {
  useCase: UseCaseDef;
  nanoCards: NanoInspirationCardType[];
  locale: string;
  toolCards: ToolCard[];
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          {useCase.title}
        </h1>
        <p className="mt-3 text-lg font-semibold text-purple-700">
          {useCase.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-base text-neutral-600">
          {useCase.description}
        </p>

        <ul className="mt-5 space-y-2">
          {useCase.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="mt-0.5 text-purple-500">✓</span>
              {bullet}
            </li>
          ))}
        </ul>
      </section>

      {/* Tools */}
      {toolCards.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Tools</h2>
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
            Templates for {useCase.title}
          </h2>
          <NanoInspirationRow
            cards={nanoCards}
            requireAuth={() => true}
            onViewClick={() => {}}
          />
        </section>
      )}
    </main>
  );
}
