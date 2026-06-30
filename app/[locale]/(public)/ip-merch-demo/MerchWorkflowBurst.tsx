"use client";

import { useRef, useState } from "react";
import { Sparkles, Upload as UploadIcon, RotateCcw } from "lucide-react";
import type { IpMerchWorkflow } from "@/lib/ip_merch_demo";

/**
 * "Merch Workflow" instant-burst demo (for the IP-merch pitch page + the
 * 15-second screen recording): drop a rough sketch → one click → 10 print-ready
 * production sheets burst in, each with 3mm bleed, crop marks, 300 DPI/CMYK
 * spec, sized per product (mug / canvas tote / enamel badge / …).
 *
 * Pure client-side: the doodle is composited into each product's print zone via
 * CSS (no upload, no backend, no generation latency) so the burst is instant
 * and reliable for the recording. This is a DEMO surface — the 300 DPI / CMYK /
 * 3mm-bleed labels are pre-press framing, not exported print files.
 */

type Shape = "rectWide" | "square" | "circle" | "rounded" | "tall";

// Structural per-product data (dims + print-zone shape + icon). Labels come
// from the localized seed; keys must match seed.workflow.products[].key.
const PRODUCT_META: Record<string, { dims: string; shape: Shape; icon: string }> = {
  mug:       { dims: "203 × 93 mm",  shape: "rectWide", icon: "☕" },
  tote:      { dims: "350 × 400 mm", shape: "square",   icon: "👜" },
  badge:     { dims: "Ø 58 mm",      shape: "circle",   icon: "📛" },
  tshirt:    { dims: "280 × 350 mm", shape: "square",   icon: "👕" },
  sticker:   { dims: "80 × 80 mm",   shape: "rounded",  icon: "🏷️" },
  poster:    { dims: "420 × 594 mm", shape: "tall",     icon: "🖼️" },
  phonecase: { dims: "75 × 150 mm",  shape: "tall",     icon: "📱" },
  notebook:  { dims: "148 × 210 mm", shape: "tall",     icon: "📓" },
  coaster:   { dims: "Ø 90 mm",      shape: "circle",   icon: "🥤" },
  keychain:  { dims: "50 × 50 mm",   shape: "rounded",  icon: "🔑" },
};

const SHAPE_CLASS: Record<Shape, string> = {
  rectWide: "aspect-[16/7] w-[88%] rounded-sm",
  square:   "aspect-square w-[72%] rounded-sm",
  circle:   "aspect-square w-[72%] rounded-full",
  rounded:  "aspect-square w-[68%] rounded-2xl",
  tall:     "aspect-[3/4] w-[58%] rounded-sm",
};

function CornerMarks() {
  // Four L-shaped pre-press crop marks at the sheet corners.
  const base = "pointer-events-none absolute h-3 w-3 border-neutral-400";
  return (
    <>
      <span className={`${base} left-1 top-1 border-l border-t`} />
      <span className={`${base} right-1 top-1 border-r border-t`} />
      <span className={`${base} bottom-1 left-1 border-b border-l`} />
      <span className={`${base} bottom-1 right-1 border-b border-r`} />
    </>
  );
}

function ProductionSheet({
  doodle,
  label,
  productKey,
  index,
  dpi,
  color,
  bleed,
}: {
  doodle: string;
  label: string;
  productKey: string;
  index: number;
  dpi: string;
  color: string;
  bleed: string;
}) {
  const meta = PRODUCT_META[productKey] ?? PRODUCT_META.sticker;
  return (
    <div
      className="merch-sheet flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
      style={{ ["--i" as string]: String(index) }}
    >
      {/* Pre-press art board: crop marks + dashed 3mm bleed + the artwork
          sized to this product's print zone. */}
      <div className="relative aspect-square bg-[repeating-conic-gradient(#f4f4f5_0deg_90deg,#fafafa_90deg_180deg)] [background-size:14px_14px]">
        <CornerMarks />
        <div className="absolute inset-2 border border-dashed border-rose-400/70" title={bleed} />
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <div className={`relative overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)] ${SHAPE_CLASS[meta.shape]}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doodle} alt="" className="h-full w-full object-contain p-2" />
          </div>
        </div>
        <span className="absolute left-2 top-2 rounded bg-rose-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {bleed}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-100 px-2.5 py-1.5">
        <span className="truncate text-[11px] font-bold text-neutral-800">
          <span className="mr-1">{meta.icon}</span>
          {label}
        </span>
        <span className="shrink-0 font-mono text-[9px] text-neutral-400">{meta.dims}</span>
      </div>
      <div className="flex items-center gap-1 border-t border-neutral-100 px-2.5 py-1">
        {[dpi, color, bleed].map((b) => (
          <span key={b} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-neutral-500">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MerchWorkflowBurst({ workflow }: { workflow: IpMerchWorkflow }) {
  const [doodle, setDoodle] = useState<string | null>(null);
  const [runId, setRunId] = useState(0); // >0 means a burst has fired; also remounts the grid for the animation
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const setFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setDoodle(url);
    setRunId(0); // reset any previous burst when a new sketch is dropped
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setDoodle(null);
    setRunId(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const products = workflow.products;
  const ran = runId > 0;

  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-white p-5 sm:p-7">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
        {workflow.eyebrow}
      </div>
      <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
        {workflow.title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">{workflow.subtitle}</p>

      {/* Controls: drop zone + run */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files?.[0]); }}
          className={`flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed bg-white px-4 py-3 transition ${
            dragOver ? "border-indigo-500 bg-indigo-50" : "border-neutral-300 hover:border-indigo-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          {doodle ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doodle} alt="sketch" className="h-14 w-14 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-1" />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
              <UploadIcon className="h-6 w-6" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-sm font-bold text-neutral-800">{workflow.uploadPrompt}</span>
            <span className="block text-xs text-neutral-500">{workflow.uploadHint}</span>
          </span>
        </label>

        <button
          type="button"
          disabled={!doodle}
          onClick={() => setRunId((n) => n + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {workflow.runLabel}
          <span aria-hidden>→</span>
        </button>
      </div>

      {/* Result header + reset */}
      {ran && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-neutral-900">
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white">✓</span>
            {workflow.resultHeading.replace("{n}", String(products.length))}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {workflow.resetLabel}
          </button>
        </div>
      )}

      {/* The burst — remounts on each run (key=runId) so the stagger replays. */}
      {ran && doodle && (
        <div
          key={runId}
          className="merch-burst mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {products.map((p, i) => (
            <ProductionSheet
              key={p.key}
              doodle={doodle}
              label={p.label}
              productKey={p.key}
              index={i}
              dpi={workflow.dpi}
              color={workflow.color}
              bleed={workflow.bleed}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .merch-burst :global(.merch-sheet) {
          animation: merchPop 0.5s cubic-bezier(0.2, 0.8, 0.3, 1.25) both;
          animation-delay: calc(var(--i) * 55ms);
        }
        @keyframes merchPop {
          0% { opacity: 0; transform: scale(0.55) translateY(14px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .merch-burst :global(.merch-sheet) { animation: none; }
        }
      `}</style>
    </section>
  );
}
