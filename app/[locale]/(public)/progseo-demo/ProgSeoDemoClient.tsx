"use client";

import { useCallback, useMemo, useState } from "react";
import { toCdnUrl } from "@/app/[locale]/_components/CdnImage";
import type { ProgSeoEntry, ProgSeoMatch } from "@/lib/progseo_demo";

type GenState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; url: string }
  | { status: "error"; message: string };

function keyFor(slug: string, idx: number): string {
  return `${slug}-${idx}`;
}

function MatchCard({
  match,
  k,
  selected,
  onToggle,
  state,
}: {
  match: ProgSeoMatch;
  k: string;
  selected: boolean;
  onToggle: () => void;
  state: GenState;
}) {
  // Preview source: generated image when done; the template og_image otherwise.
  const imgSrc =
    state.status === "done"
      ? state.url
      : toCdnUrl(match.preview_image_url);

  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-2 rounded-lg border bg-white p-3 shadow-sm transition ${
        selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        disabled={state.status === "running"}
        className="absolute top-2 right-2 z-10 h-5 w-5 cursor-pointer rounded border-gray-300"
        aria-label={`Select ${match.label}`}
      />
      <div className="pr-7 text-sm font-medium text-gray-900">{match.label}</div>
      <div className="break-all font-mono text-xs text-gray-500">
        {match.template_id}
      </div>
      <div className="rounded bg-gray-50 p-2 font-mono text-xs text-gray-700">
        {Object.entries(match.params).map(([key, v]) => (
          <div key={key} className="break-words">
            <span className="text-gray-500">{key}:</span> {String(v)}
          </div>
        ))}
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={match.label}
          className={`h-full w-full object-cover ${
            state.status === "done" ? "" : "opacity-70"
          }`}
        />
        {state.status === "running" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium text-gray-700">
            generating…
          </div>
        )}
        {state.status === "idle" && (
          <div className="absolute bottom-1 left-1 rounded bg-white/85 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
            template preview
          </div>
        )}
        {state.status === "done" && (
          <div className="absolute bottom-1 left-1 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            generated
          </div>
        )}
        {state.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-2 text-center text-xs text-red-700">
            {state.message}
          </div>
        )}
      </div>
    </label>
  );
}

export default function ProgSeoDemoClient({ entries }: { entries: ProgSeoEntry[] }) {
  // Pre-build the flat list of all match keys so select-all is trivial.
  const allKeys = useMemo<string[]>(() => {
    const out: string[] = [];
    for (const e of entries) {
      for (let i = 0; i < e.matches.length; i++) out.push(keyFor(e.slug, i));
    }
    return out;
  }, [entries]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Record<string, GenState>>({});
  const [running, setRunning] = useState(false);

  const toggle = useCallback((k: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => setSelected(new Set(allKeys)), [allKeys]);
  const clearAll = useCallback(() => setSelected(new Set()), []);

  const generateSelected = useCallback(async () => {
    if (selected.size === 0 || running) return;
    setRunning(true);
    // Build a flat list of (entry, idx) tuples for the selected keys,
    // preserving the page order so the UI fills top-to-bottom.
    const jobs: { entry: ProgSeoEntry; matchIdx: number; k: string }[] = [];
    for (const e of entries) {
      for (let i = 0; i < e.matches.length; i++) {
        const k = keyFor(e.slug, i);
        if (selected.has(k)) jobs.push({ entry: e, matchIdx: i, k });
      }
    }
    for (const job of jobs) {
      const m = job.entry.matches[job.matchIdx];
      const imageSlug = `${job.entry.slug}-${job.matchIdx}`;
      setStates((s) => ({ ...s, [job.k]: { status: "running" } }));
      try {
        const res = await fetch("/api/progseo-demo/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template_id: m.template_id,
            params: m.params,
            slug: imageSlug,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: res.statusText }));
          setStates((s) => ({
            ...s,
            [job.k]: { status: "error", message: data.error || `HTTP ${res.status}` },
          }));
          continue;
        }
        const data: { url: string } = await res.json();
        setStates((s) => ({
          ...s,
          [job.k]: { status: "done", url: `${data.url}?t=${Date.now()}` },
        }));
      } catch (err) {
        setStates((s) => ({
          ...s,
          [job.k]: {
            status: "error",
            message: err instanceof Error ? err.message : "network error",
          },
        }));
      }
    }
    setRunning(false);
  }, [selected, entries, running]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ProgSEO demo — long-tail keyword → unique images
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            10 prefilled long-tail queries. Tick the cards you want to generate,
            then click Generate. Output lands in{" "}
            <code className="font-mono text-xs">/tmp/progseo-demo/</code>.
          </p>
        </header>

        {/* Sticky toolbar so the Generate button stays visible while scrolling */}
        <div className="sticky top-0 z-20 mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <button
            onClick={selectAll}
            disabled={running}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select all ({allKeys.length})
          </button>
          <button
            onClick={clearAll}
            disabled={running || selected.size === 0}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-600">{selected.size} selected</span>
            <button
              onClick={generateSelected}
              disabled={running || selected.size === 0}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {running ? "Generating…" : `Generate ${selected.size > 0 ? `(${selected.size})` : ""}`}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {entries.map((entry) => (
            <section key={entry.slug}>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                <span className="text-gray-400">query: </span>
                {entry.query}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entry.matches.map((m, idx) => {
                  const k = keyFor(entry.slug, idx);
                  return (
                    <MatchCard
                      key={k}
                      match={m}
                      k={k}
                      selected={selected.has(k)}
                      onToggle={() => toggle(k)}
                      state={states[k] ?? { status: "idle" }}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
