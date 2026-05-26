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

// Compact, action-less card. Mirrors the PromptCard 3:4 layout used on
// /nano-banana-pro-prompts so the demo grid sits at the same visual
// rhythm as the existing surfaces — but with a checkbox replacing the
// Copy button since this is a batch-select UI, not a per-card action UI.
function MatchCard({
  match,
  selected,
  onToggle,
  state,
}: {
  match: ProgSeoMatch;
  selected: boolean;
  onToggle: () => void;
  state: GenState;
}) {
  const imgSrc =
    state.status === "done"
      ? state.url
      : toCdnUrl(match.preview_image_url);

  return (
    <label
      className={`group block cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"
      }`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={match.label}
          className={`h-full w-full object-cover transition-transform duration-300 ${
            state.status === "done" ? "" : "opacity-80"
          } group-hover:scale-[1.02]`}
        />

        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          disabled={state.status === "running"}
          className="absolute top-2 right-2 h-5 w-5 cursor-pointer rounded border-gray-300 shadow-sm"
          aria-label={`Select ${match.label}`}
        />

        {state.status === "running" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium text-gray-700">
            generating…
          </div>
        )}
        {state.status === "idle" && (
          <span className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
            preview
          </span>
        )}
        {state.status === "done" && (
          <span className="absolute bottom-2 left-2 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            generated
          </span>
        )}
        {state.status === "error" && (
          <div className="absolute inset-x-0 bottom-0 bg-red-50/95 p-1.5 text-center text-[11px] text-red-700">
            {state.message}
          </div>
        )}
      </div>

      <div className="px-2.5 py-2">
        <div className="truncate text-xs font-semibold text-gray-900">{match.label}</div>
        <div className="mt-0.5 truncate font-mono text-[10px] text-gray-500">
          {match.template_id.replace(/^template-/, "")}
        </div>
        <div className="mt-1.5 space-y-0.5 font-mono text-[10px] leading-tight text-gray-600">
          {Object.entries(match.params).map(([k, v]) => (
            <div key={k} className="truncate" title={`${k}: ${v}`}>
              <span className="text-gray-400">{k}:</span> {String(v)}
            </div>
          ))}
        </div>
      </div>
    </label>
  );
}

export default function ProgSeoDemoClient({ entries }: { entries: ProgSeoEntry[] }) {
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

        <div className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <section
              key={entry.slug}
              className="grid grid-cols-1 gap-4 py-5 md:grid-cols-[220px_1fr] md:gap-6"
            >
              <div className="md:pt-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  query
                </div>
                <h2 className="mt-1 text-sm font-semibold text-gray-900">
                  {entry.query}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {entry.matches.map((m, idx) => {
                  const k = keyFor(entry.slug, idx);
                  return (
                    <MatchCard
                      key={k}
                      match={m}
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
