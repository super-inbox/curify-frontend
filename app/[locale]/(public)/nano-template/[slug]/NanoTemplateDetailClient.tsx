"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";

type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  // NOTE: placeholder can be string OR list of strings (prefill candidates)
  placeholder?: string | string[];
  options?: string[];
};

function fillPrompt(basePrompt: string, params: Record<string, any>) {
  let p = basePrompt || "";
  for (const [k, v] of Object.entries(params || {})) {
    const regex = new RegExp(`\\{${k}\\}`, "g");
    p = p.replace(regex, String(v || ""));
  }
  return p;
}

function normalizePrefills(p?: string | string[]) {
  if (!p) return { displayPlaceholder: "", candidates: [] as string[] };
  if (Array.isArray(p)) {
    const candidates = p.filter((x) => typeof x === "string" && x.trim() !== "");
    return { displayPlaceholder: candidates[0] ?? "", candidates };
  }
  return { displayPlaceholder: p, candidates: [] as string[] };
}

export default function NanoTemplateDetailClient(props: {
  locale: string;
  template: {
    template_id: string;
    base_prompt: string;
    parameters: TemplateParameter[];
  };
  otherNanoCards: NanoInspirationCardType[];
  showReproduce?: boolean;
  showOtherTemplates?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    locale,
    template,
    otherNanoCards,
    showReproduce = true,
    showOtherTemplates = true,
  } = props;

  const params = template.parameters || [];

  // -------- Section 1: Reproduce (only used if showReproduce) --------
  const [form, setForm] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  // Pre-fill:
  // 1) URL query params (highest priority)
  // 2) placeholders (if placeholder is a list, pick first)
  useEffect(() => {
    if (!showReproduce) return;

    const next: Record<string, any> = {};
    for (const p of params) {
      const qv = searchParams?.get(p.name);
      if (qv !== null && qv !== undefined && String(qv).trim() !== "") {
        next[p.name] = qv;
        continue;
      }

      const { candidates } = normalizePrefills(p.placeholder);
      if (candidates.length > 0) {
        next[p.name] = candidates[0];
      }
    }

    setForm(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReproduce, template.template_id, searchParams]);

  // Reactively fill the prompt whenever form changes
  const filledPrompt = useMemo(
    () => fillPrompt(template.base_prompt || "", form),
    [template.base_prompt, form]
  );

  const onChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPickPrefill = (name: string, v: string) => {
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(filledPrompt.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // Updated: This should actually trigger generation with Claude
  // You'll need to implement this based on your app's architecture
  const onGoGenerate = () => {
    // Option 1: If you want to navigate to a chat with the prompt pre-filled
    // You might need to encode the prompt and pass it to your chat interface
    const encodedPrompt = encodeURIComponent(filledPrompt.trim());
    router.push(`/${locale}/chat?prompt=${encodedPrompt}`);
    
    // Option 2: If you have a different generation mechanism, implement it here
    // For example, you might want to open a modal or call an API
  };

  // -------- Section 3: Other templates row (handlers live in client) --------
  const requireAuth = () => true;
  const onViewClick = () => {};

  return (
    <>
      {/* SECTION 1 (optional) */}
      {showReproduce && (
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Reproduce this template
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Use your inputs (or quick placeholders) — the prompt preview updates
              instantly.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Inputs */}
            <div className="lg:col-span-5">
              <div className="space-y-3">
                {params.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                    This template has no parameters. You can copy the base prompt
                    directly.
                  </div>
                ) : (
                  params.map((p) => {
                    const value = form[p.name] ?? "";
                    const { displayPlaceholder, candidates } = normalizePrefills(
                      p.placeholder
                    );

                    const common =
                      "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300";

                    return (
                      <div key={p.name}>
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-neutral-800">
                            {p.label || p.name}
                          </div>

                          {/* quick prefills (if placeholder is list) */}
                          {candidates.length > 0 && (
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {candidates.slice(0, 4).map((cand) => (
                                <button
                                  key={`${p.name}-${cand}`}
                                  type="button"
                                  onClick={() => onPickPrefill(p.name, cand)}
                                  className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors"
                                  title={`Use: ${cand}`}
                                >
                                  {cand}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {p.type === "textarea" ? (
                          <textarea
                            value={value}
                            onChange={(e) => onChange(p.name, e.target.value)}
                            placeholder={displayPlaceholder || ""}
                            className={common}
                            rows={3}
                          />
                        ) : p.type === "select" ? (
                          <select
                            value={value}
                            onChange={(e) => onChange(p.name, e.target.value)}
                            className={common}
                          >
                            <option value="">Select…</option>
                            {(p.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={value}
                            onChange={(e) => onChange(p.name, e.target.value)}
                            placeholder={displayPlaceholder || ""}
                            className={common}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onGoGenerate}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Generate
                </button>

                <button
                  type="button"
                  onClick={onCopy}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy prompt"}
                </button>
              </div>
            </div>

            {/* Prompt preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Prompt preview
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                  {filledPrompt.trim() || template.base_prompt || ""}
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3 (optional) */}
      {showOtherTemplates && (
        <section className={showReproduce ? "mt-10" : ""}>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-neutral-900">
              Other nano templates
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Explore other categories and presets.
            </p>
          </div>

          <NanoInspirationRow
            cards={otherNanoCards}
            requireAuth={requireAuth}
            onViewClick={onViewClick}
          />
        </section>
      )}
    </>
  );
}