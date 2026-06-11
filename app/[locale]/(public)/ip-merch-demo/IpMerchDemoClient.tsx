"use client";

import { useState } from "react";
import { toCdnUrl } from "@/app/[locale]/_components/CdnImage";
import type { IpMerchDemoSeed, IpMerchStage } from "@/lib/ip_merch_demo";

function StageDotNav({
  stages,
  activeOrder,
  onPick,
}: {
  stages: IpMerchStage[];
  activeOrder: number;
  onPick: (order: number) => void;
}) {
  return (
    <ol className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
      {stages.map((s) => {
        const active = s.order === activeOrder;
        const past = s.order < activeOrder;
        return (
          <li key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onPick(s.order)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                  : past
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  active
                    ? "bg-white text-indigo-700"
                    : past
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {s.order}
              </span>
              <span className="hidden sm:inline">{s.step_label.replace(/^Stage \d+ — /, "")}</span>
              <span className="inline sm:hidden">Stage {s.order}</span>
            </button>
            {s.order < stages.length && (
              <span className="mx-1 hidden text-gray-300 sm:inline">→</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StagePanel({ stage }: { stage: IpMerchStage }) {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toCdnUrl(stage.image_url)}
          alt={`${stage.template_caption} — example IP "${stage.ip_info}"`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
          {stage.step_label}
        </div>
        <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
          {stage.template_caption}
        </h2>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono">
            template: {stage.template_id}
          </span>
          <span className="rounded bg-amber-50 px-2 py-0.5 font-mono text-amber-700">
            ip_info: "{stage.ip_info}"
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">{stage.operator_outcome}</p>
      </div>
    </div>
  );
}

export default function IpMerchDemoClient({ seed }: { seed: IpMerchDemoSeed }) {
  const [activeOrder, setActiveOrder] = useState(1);
  const activeStage = seed.stages.find((s) => s.order === activeOrder) ?? seed.stages[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
          IP-merch design demo · pitch-mode
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{seed.hero.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
          {seed.hero.subtitle}
        </p>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          {seed.hero.workflow_summary}
        </p>
      </header>

      <StageDotNav
        stages={seed.stages}
        activeOrder={activeOrder}
        onPick={setActiveOrder}
      />

      <StagePanel stage={activeStage} />

      <nav className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setActiveOrder((n) => Math.max(1, n - 1))}
          disabled={activeOrder === 1}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous stage
        </button>
        <div className="text-xs text-gray-500">
          Stage {activeOrder} of {seed.stages.length}
        </div>
        <button
          type="button"
          onClick={() =>
            setActiveOrder((n) => Math.min(seed.stages.length, n + 1))
          }
          disabled={activeOrder === seed.stages.length}
          className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next stage →
        </button>
      </nav>

      <section className="mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 text-center sm:p-8">
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          {seed.cta.closing_line}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={seed.cta.primary_href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            {seed.cta.primary_label}
          </a>
          <a
            href={seed.cta.secondary_href}
            className="rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            {seed.cta.secondary_label} →
          </a>
        </div>
      </section>
    </main>
  );
}
