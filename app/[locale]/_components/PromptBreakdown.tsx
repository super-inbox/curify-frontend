"use client";

import { useMemo, useState } from "react";

export default function PromptBreakdown({
  prompt,
  params,
  collapsedMaxHeight = 220,
}: {
  prompt: string;
  params: Record<string, any>;
  collapsedMaxHeight?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const parts = useMemo(() => {
    if (!prompt) return [];
    return prompt.split(/(\{[^}]+\})/g);
  }, [prompt]);

  const hasParams = Object.keys(params).length > 0;

  if (!prompt) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm text-neutral-500">No prompt data available.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
<div className="flex-1 min-h-0">
        <div
          className={[
            "rounded-2xl border border-neutral-100 bg-white p-4 font-mono text-sm leading-7 transition-all",
            expanded ? "h-auto" : "h-full overflow-hidden",
          ].join(" ")}
          style={expanded ? undefined : { maxHeight: collapsedMaxHeight }}
        >
          {parts.map((part, i) => {
            const match = part.match(/^\{(.+)\}$/);
            if (match) {
              const key = match[1];
              const value = params[key];
              return (
                <span
                  key={i}
                  className="mx-0.5 inline-block rounded border border-purple-200 bg-purple-100 px-1.5 py-0.5 text-xs font-bold text-purple-800"
                  title={value != null ? `Value: ${value}` : `Parameter: ${key}`}
                >
                  {value != null ? String(value) : `{${key}}`}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-purple-700 transition hover:text-purple-800 cursor-pointer"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>

      {hasParams && expanded && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-2 pl-4 pr-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Variable
                </th>
                <th className="py-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Value used
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(params).map(([k, v]) => (
                <tr key={k} className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-2 pl-4 pr-4 font-mono text-xs text-neutral-600">
                    {`{${k}}`}
                  </td>
                  <td className="py-2 pr-4 text-neutral-800">
                    {v != null && String(v).trim() !== "" ? (
                      String(v)
                    ) : (
                      <span className="italic text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}