"use client";

import { useCallback, useRef, useState } from "react";
import type { IllustratorDemoSeed, IllustratorStyle } from "@/lib/illustrator_demo";

const SCALE_COUNT = 3;

type ScaleState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; url: string }
  | { status: "error"; message: string };

function StyleCard({
  style,
  selected,
  onPick,
}: {
  style: IllustratorStyle;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`group block overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={style.preview_image_url}
          alt={style.label}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {selected && (
          <span className="absolute top-2 right-2 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            picked
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
          preview
        </span>
      </div>
      <div className="px-3 py-2">
        <div className="truncate text-sm font-semibold text-gray-900">{style.label}</div>
        <div className="mt-0.5 truncate text-[11px] text-gray-500">{style.aesthetic}</div>
      </div>
    </button>
  );
}

function ScaleTile({ index, state }: { index: number; state: ScaleState }) {
  const showImg = state.status === "done";
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={state.url}
          alt={`Scaled variant ${index + 1}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {state.status === "running" && (
            <div className="text-xs font-medium text-gray-600">generating…</div>
          )}
          {state.status === "idle" && (
            <div className="text-xs text-gray-400">variation {index + 1}</div>
          )}
          {state.status === "error" && (
            <div className="px-3 text-center text-[11px] text-red-700">{state.message}</div>
          )}
        </div>
      )}
      {state.status === "done" && (
        <span className="absolute bottom-2 left-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          generated
        </span>
      )}
    </div>
  );
}

export default function IllustratorDemoClient({ seed }: { seed: IllustratorDemoSeed }) {
  const [pickedStyleId, setPickedStyleId] = useState<string | null>(null);
  const [scaleStates, setScaleStates] = useState<ScaleState[]>(() =>
    Array.from({ length: SCALE_COUNT }, () => ({ status: "idle" as const })),
  );
  const [scaling, setScaling] = useState(false);
  // Synchronous guard — a fast double-click would otherwise fire onScale twice
  // before the `scaling` state propagates, kicking off 2 × SCALE_COUNT Gemini
  // calls instead of one batch. State alone isn't enough.
  const scalingRef = useRef(false);

  const onPickStyle = useCallback((id: string) => {
    setPickedStyleId((cur) => (cur === id ? null : id));
    // Reset any prior scale outputs when the style changes
    setScaleStates(Array.from({ length: SCALE_COUNT }, () => ({ status: "idle" as const })));
  }, []);

  const onScale = useCallback(async () => {
    if (!pickedStyleId || scalingRef.current) return;
    scalingRef.current = true;
    setScaling(true);
    const initial: ScaleState[] = Array.from({ length: SCALE_COUNT }, () => ({
      status: "running" as const,
    }));
    setScaleStates(initial);

    await Promise.all(
      Array.from({ length: SCALE_COUNT }, (_, i) => i).map(async (i) => {
        const slug = `${pickedStyleId}-${Date.now().toString(36)}-${i}`;
        try {
          const res = await fetch("/api/illustrator-demo/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ style_id: pickedStyleId, slug }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.error || `HTTP ${res.status}`);
          }
          const data: { url?: string } = await res.json();
          if (!data.url) throw new Error("no url returned");
          setScaleStates((prev) => {
            const next = [...prev];
            next[i] = { status: "done", url: data.url! };
            return next;
          });
        } catch (err) {
          setScaleStates((prev) => {
            const next = [...prev];
            next[i] = {
              status: "error",
              message: err instanceof Error ? err.message : "failed",
            };
            return next;
          });
        }
      }),
    );
    setScaling(false);
    scalingRef.current = false;
  }, [pickedStyleId]);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Illustrator demo — pick a style, scale to a series</h1>
        <p className="text-sm text-gray-600">
          Reference sketches → 4 finished aesthetics → lock one style → batch-render variations. Every output keeps the same subject (the long-eared mascot fused with a bronze ritual ding) so the comparison is apples-to-apples.
        </p>
      </header>

      {/* ── Step 1: Reference ────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Step 1 — Reference sketches
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={seed.reference_image_url}
            alt="Hand-drawn sketch grid"
            className="block h-auto w-full"
          />
        </div>
        <p className="text-xs text-gray-500">
          11 hand-drawn sketches in a single sheet. The demo uses the top-row third sketch (the long-eared mascot fused with a four-legged bronze ritual ding) as the locked subject.
        </p>
      </section>

      {/* ── Step 2: Style picker ─────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Step 2 — Pick a style
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seed.styles.map((s) => (
            <StyleCard
              key={s.id}
              style={s}
              selected={pickedStyleId === s.id}
              onPick={() => onPickStyle(s.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Step 3: Scale ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Step 3 — Scale the picked style
          </h2>
          <button
            type="button"
            onClick={onScale}
            disabled={!pickedStyleId || scaling}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {scaling ? "Generating…" : pickedStyleId ? `Scale "${seed.styles.find((s) => s.id === pickedStyleId)?.label}"` : "Pick a style first"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Fires {SCALE_COUNT} parallel Gemini generations on the locked subject in the picked style — proves the aesthetic stays consistent across runs.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {scaleStates.map((s, i) => (
            <ScaleTile key={i} index={i} state={s} />
          ))}
        </div>
      </section>
    </main>
  );
}
