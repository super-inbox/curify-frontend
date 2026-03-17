"use client";

import { useMemo, useState } from "react";

export default function PromptBreakdown({
  prompt,
  params,
}: {
  prompt: string;
  params: Record<string, any>;
}) {
  const [expanded, setExpanded] = useState(false);

  const parts = useMemo(() => {
    if (!prompt) return [];
    return prompt.split(/(\{[^}]+\})/g);
  }, [prompt]);

  if (!prompt) {
    return <p className="text-sm text-neutral-500">No prompt data available.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Variables in{" "}
        <span className="rounded border border-amber-200 bg-amber-50 px-1 py-0.5 font-mono text-xs text-amber-800">
          {"{curly braces}"}
        </span>{" "}
        are replaced with your inputs:
      </p>

      <div className="relative">
        <div
          className={[
            "rounded-2xl border border-neutral-100 bg-neutral-50 p-4 font-mono text-sm leading-7 transition-all",
            expanded ? "" : "line-clamp-3",
          ].join(" ")}
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

        {!expanded && (
          <>
            {/* fade bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-neutral-50 to-transparent" />

            {/* expand control */}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="absolute bottom-2 right-3 font-mono text-sm font-bold text-neutral-600 hover:text-neutral-900"
              aria-label="Expand prompt"
            >
              ....
            </button>
          </>
        )}
      </div>

      {Object.keys(params).length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                Variable
              </th>
              <th className="py-2 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                Value used
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(params).map(([k, v]) => (
              <tr key={k} className="border-b border-neutral-100">
                <td className="py-2 pr-4 font-mono text-xs text-neutral-600">{`{${k}}`}</td>
                <td className="py-2 text-neutral-800">
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
      )}
    </div>
  );
}