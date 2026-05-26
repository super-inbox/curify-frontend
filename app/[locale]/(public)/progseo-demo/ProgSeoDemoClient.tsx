"use client";

import { useCallback, useState } from "react";
import type { ProgSeoEntry, ProgSeoMatch } from "@/lib/progseo_demo";

type GenState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; url: string }
  | { status: "error"; message: string };

function MatchCard({
  match,
  slug,
  matchIdx,
  state,
  onGenerate,
}: {
  match: ProgSeoMatch;
  slug: string;
  matchIdx: number;
  state: GenState;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-medium text-gray-900">{match.label}</div>
      <div className="break-all text-xs text-gray-500">
        <span className="font-mono">{match.template_id}</span>
      </div>
      <div className="rounded bg-gray-50 p-2 font-mono text-xs text-gray-700">
        {Object.entries(match.params).map(([k, v]) => (
          <div key={k}>
            <span className="text-gray-500">{k}:</span> {String(v)}
          </div>
        ))}
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
        {state.status === "done" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.url}
            alt={match.label}
            className="h-full w-full object-cover"
          />
        )}
        {state.status === "running" && (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            generating…
          </div>
        )}
        {state.status === "idle" && (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            no image yet
          </div>
        )}
        {state.status === "error" && (
          <div className="flex h-full items-center justify-center p-2 text-center text-sm text-red-600">
            {state.message}
          </div>
        )}
      </div>
      <button
        onClick={onGenerate}
        disabled={state.status === "running"}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {state.status === "running" ? "Generating…" : state.status === "done" ? "Regenerate" : "Generate"}
      </button>
    </div>
  );
}

export default function ProgSeoDemoClient({ entries }: { entries: ProgSeoEntry[] }) {
  const [states, setStates] = useState<Record<string, GenState>>({});

  const keyFor = (slug: string, idx: number) => `${slug}-${idx}`;

  const generate = useCallback(
    async (entry: ProgSeoEntry, matchIdx: number) => {
      const k = keyFor(entry.slug, matchIdx);
      const m = entry.matches[matchIdx];
      const imageSlug = `${entry.slug}-${matchIdx}`;
      setStates((s) => ({ ...s, [k]: { status: "running" } }));
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
            [k]: { status: "error", message: data.error || `HTTP ${res.status}` },
          }));
          return;
        }
        const data: { url: string } = await res.json();
        // Cache-bust to force re-fetch on regenerate
        setStates((s) => ({
          ...s,
          [k]: { status: "done", url: `${data.url}?t=${Date.now()}` },
        }));
      } catch (err) {
        setStates((s) => ({
          ...s,
          [k]: {
            status: "error",
            message: err instanceof Error ? err.message : "network error",
          },
        }));
      }
    },
    [],
  );

  const generateAll = useCallback(async () => {
    // Serial so the UI updates one card at a time — better for Loom recording.
    for (const entry of entries) {
      for (let i = 0; i < entry.matches.length; i++) {
        await generate(entry, i);
      }
    }
  }, [entries, generate]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ProgSEO demo — long-tail keyword → unique images
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            10 prefilled long-tail queries. Each query has 1-2 hand-curated
            template matches with concrete parameters. Click Generate to call
            Gemini and write the result to <code className="font-mono text-xs">/tmp/progseo-demo/</code>.
          </p>
          <button
            onClick={generateAll}
            className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Generate all (serial)
          </button>
        </header>

        <div className="space-y-8">
          {entries.map((entry) => (
            <section key={entry.slug}>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                <span className="text-gray-400">query: </span>
                {entry.query}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entry.matches.map((m, idx) => (
                  <MatchCard
                    key={`${entry.slug}-${idx}`}
                    match={m}
                    slug={entry.slug}
                    matchIdx={idx}
                    state={states[keyFor(entry.slug, idx)] ?? { status: "idle" }}
                    onGenerate={() => generate(entry, idx)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
