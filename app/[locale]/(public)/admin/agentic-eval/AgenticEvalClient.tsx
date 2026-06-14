"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

export type Candidate = {
  template_id: string;
  confidence: number;
  reason: string;
  params: Record<string, unknown>;
  title: string;
  thumbnail?: string;
};

export type EvalRow = {
  query: string;
  source: string;
  expected: string;
  candidates: Candidate[];
};

type Label =
  | { kind: "gold"; template_id: string; notes?: string }
  | { kind: "none"; expected_template_id?: string; notes?: string }
  | { kind: "skip"; notes?: string };

type LabelsMap = Record<string, Label>; // keyed by query

const STORAGE_KEY = "taic-l1-labels";

function loadLabels(date: string): LabelsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${date}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLabels(date: string, labels: LabelsMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${date}`, JSON.stringify(labels));
  } catch {
    /* quota / private-mode etc — swallow */
  }
}

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AgenticEvalClient({ date, rows }: { date: string; rows: EvalRow[] }) {
  const [labels, setLabels] = useState<LabelsMap>({});
  const [filter, setFilter] = useState<"all" | "labeled" | "unlabeled">("all");
  const [importText, setImportText] = useState("");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setLabels(loadLabels(date));
  }, [date]);

  // Autosave on every change
  useEffect(() => {
    if (Object.keys(labels).length > 0) saveLabels(date, labels);
  }, [labels, date]);

  const setLabel = useCallback((query: string, label: Label) => {
    setLabels((prev) => ({ ...prev, [query]: label }));
  }, []);

  const stats = useMemo(() => {
    const labeled = rows.filter((r) => labels[r.query]);
    const gold = labeled.filter((r) => labels[r.query]?.kind === "gold");
    const none = labeled.filter((r) => labels[r.query]?.kind === "none");
    const skip = labeled.filter((r) => labels[r.query]?.kind === "skip");
    return {
      total: rows.length,
      labeled: labeled.length,
      gold: gold.length,
      none: none.length,
      skip: skip.length,
      // Template accuracy = gold / (gold + none) (skip excluded)
      accuracy:
        gold.length + none.length > 0
          ? Math.round((100 * gold.length) / (gold.length + none.length))
          : null,
    };
  }, [labels, rows]);

  const visibleRows = useMemo(() => {
    if (filter === "labeled") return rows.filter((r) => labels[r.query]);
    if (filter === "unlabeled") return rows.filter((r) => !labels[r.query]);
    return rows;
  }, [rows, labels, filter]);

  const onExport = useCallback(() => {
    downloadJSON(`taic-l1-labels-${date}.json`, {
      meta: {
        date,
        total: rows.length,
        labeled: stats.labeled,
        accuracy_pct: stats.accuracy,
        exported_at: new Date().toISOString(),
      },
      labels,
      rows: rows.map((r) => ({
        query: r.query,
        source: r.source,
        expected: r.expected,
        candidates: r.candidates.map((c) => ({
          template_id: c.template_id,
          confidence: c.confidence,
        })),
      })),
    });
  }, [date, labels, rows, stats]);

  const onImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importText);
      const incoming = parsed?.labels;
      if (incoming && typeof incoming === "object") {
        setLabels((prev) => ({ ...prev, ...incoming }));
        setImportText("");
      } else {
        alert("No `labels` key found in JSON.");
      }
    } catch (err) {
      alert(`Parse failed: ${(err as Error).message}`);
    }
  }, [importText]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">TAIC L1 — Template Selection Accuracy</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Daily sample for <code className="bg-neutral-100 px-1 rounded">{date}</code>.
        Same 30 queries land on every refresh today; tomorrow rotates.
        Labels autosave to localStorage. Export when done.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
        <div>
          <span className="font-semibold">{stats.labeled}</span> / {stats.total} labeled
        </div>
        <div className="text-neutral-500">|</div>
        <div>
          gold: <span className="font-semibold text-green-700">{stats.gold}</span>
        </div>
        <div>
          none-of-these: <span className="font-semibold text-red-700">{stats.none}</span>
        </div>
        <div>
          skip: <span className="font-semibold text-neutral-500">{stats.skip}</span>
        </div>
        <div className="text-neutral-500">|</div>
        <div>
          template accuracy:{" "}
          <span className="font-semibold">
            {stats.accuracy === null ? "—" : `${stats.accuracy}%`}
          </span>
          <span className="text-xs text-neutral-500 ml-1">
            (gold ÷ (gold + none), skip excluded)
          </span>
        </div>
        <div className="ml-auto flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "labeled" | "unlabeled")}
            className="rounded border border-neutral-300 px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="unlabeled">Unlabeled</option>
            <option value="labeled">Labeled</option>
          </select>
          <button
            onClick={onExport}
            className="rounded bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700"
          >
            Export JSON
          </button>
        </div>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-neutral-600">Import / merge labels from JSON</summary>
        <div className="mt-2 flex gap-2">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste {"labels": {...}} from a previous export'
            className="flex-1 rounded border border-neutral-300 px-2 py-1 text-xs font-mono"
            rows={4}
          />
          <button
            onClick={onImport}
            className="self-start rounded bg-neutral-200 px-3 py-1 text-sm hover:bg-neutral-300"
          >
            Merge
          </button>
        </div>
      </details>

      <ol className="mt-6 space-y-6">
        {visibleRows.map((row, idx) => {
          const label = labels[row.query];
          const realIdx = rows.indexOf(row) + 1;
          return (
            <li key={row.query} className="rounded-lg border border-neutral-200 p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold">
                  <span className="text-neutral-400 mr-2">#{realIdx}</span>
                  {row.query}
                </h2>
                <div className="text-xs text-neutral-500">
                  source: {row.source} · expected: {row.expected}
                </div>
              </div>

              {row.candidates.length === 0 ? (
                <div className="mt-3 rounded bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  Matcher returned <code>[]</code> — no templates surfaced.
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {row.candidates.map((c) => {
                    const isPicked = label?.kind === "gold" && label.template_id === c.template_id;
                    return (
                      <label
                        key={c.template_id}
                        className={`block rounded border-2 p-2 cursor-pointer transition-colors ${
                          isPicked
                            ? "border-green-500 bg-green-50"
                            : "border-neutral-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`gold-${idx}`}
                          checked={isPicked}
                          onChange={() =>
                            setLabel(row.query, { kind: "gold", template_id: c.template_id })
                          }
                          className="sr-only"
                        />
                        {c.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="w-full h-32 object-cover rounded"
                            loading="lazy"
                          />
                        )}
                        <div className="mt-2 text-sm font-medium line-clamp-2">{c.title}</div>
                        <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                          <span>conf {c.confidence.toFixed(2)}</span>
                          <a
                            href={`/nano-template/${c.template_id.replace(/^template-/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:underline"
                          >
                            open ↗
                          </a>
                        </div>
                        {c.reason && (
                          <div className="mt-1 text-xs text-neutral-400 line-clamp-2">
                            {c.reason}
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setLabel(row.query, { kind: "none" })}
                  className={`rounded px-3 py-1 ${
                    label?.kind === "none"
                      ? "bg-red-600 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  None of these
                </button>
                <button
                  type="button"
                  onClick={() => setLabel(row.query, { kind: "skip" })}
                  className={`rounded px-3 py-1 ${
                    label?.kind === "skip"
                      ? "bg-neutral-500 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  Skip
                </button>
                {label && (
                  <button
                    type="button"
                    onClick={() =>
                      setLabels((prev) => {
                        const next = { ...prev };
                        delete next[row.query];
                        return next;
                      })
                    }
                    className="ml-auto text-xs text-neutral-500 hover:text-neutral-800"
                  >
                    clear
                  </button>
                )}
              </div>

              {(label?.kind === "none" || label?.kind === "skip") && (
                <input
                  type="text"
                  placeholder={
                    label.kind === "none"
                      ? "Optional: expected template id (if you know it) + notes"
                      : "Optional: why skipped"
                  }
                  defaultValue={label.notes ?? ""}
                  onBlur={(e) =>
                    setLabel(row.query, { ...label, notes: e.target.value })
                  }
                  className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-xs"
                />
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
