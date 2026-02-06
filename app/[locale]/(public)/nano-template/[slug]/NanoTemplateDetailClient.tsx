"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";

type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

function fillPrompt(basePrompt: string, params: Record<string, any>) {
  let p = basePrompt || "";
  for (const [k, v] of Object.entries(params || {})) {
    const regex = new RegExp(`\\{${k}\\}`, "g");
    p = p.replace(regex, String(v));
  }
  return p;
}

export default function NanoTemplateDetailClient(props: {
  locale: string;
  template: {
    template_id: string;
    base_prompt: string;
    parameters: TemplateParameter[];
  };
  timelineCards: NanoInspirationCardType[];
}) {
  const router = useRouter();
  const { locale, template, timelineCards } = props;

  // ---- Reproduce state ----
  const [form, setForm] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  const params = template.parameters || [];

  const filledPrompt = useMemo(
    () => fillPrompt(template.base_prompt || "", form),
    [template.base_prompt, form]
  );

  const onChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        (filledPrompt.trim() || template.base_prompt || "").trim()
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const onGoGenerate = () => {
    // Safe: keep your page but add query params (no server function)
    const slug = template.template_id.replace(/^template-/, "");
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(form)) {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        qs.set(k, String(v));
      }
    }
    router.push(`/${locale}/nano-template/${slug}?${qs.toString()}`);
  };

  // ---- Timeline row handlers (must be defined in client) ----
  const requireAuth = () => true;
  const onViewClick = () => {};

  return (
    <>
      {/* SECTION 1: Reproduce */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Reproduce this template
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Fill in parameters, then generate with the curated prompt.
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
                  const common =
                    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300";

                  return (
                    <div key={p.name}>
                      <div className="mb-1 text-sm font-semibold text-neutral-800">
                        {p.label || p.name}
                      </div>

                      {p.type === "textarea" ? (
                        <textarea
                          value={value}
                          onChange={(e) => onChange(p.name, e.target.value)}
                          placeholder={p.placeholder || ""}
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
                          placeholder={p.placeholder || ""}
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
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
              >
                Generate
              </button>

              <button
                type="button"
                onClick={onCopy}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-800 hover:bg-neutral-50 transition-colors"
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
                {(filledPrompt.trim() || template.base_prompt || "").trim()}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Available images (timeline UI) */}
      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-neutral-900">Example images</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {timelineCards.length} curated outputs for this template.
          </p>
        </div>

        <NanoInspirationRow
          cards={timelineCards}
          requireAuth={requireAuth}
          onViewClick={onViewClick}
        />
      </section>
    </>
  );
}
