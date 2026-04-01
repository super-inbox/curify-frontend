"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";

import {
  fillPrompt,
  normalizePrefills,
  type TemplateParameter,
} from "@/lib/nano_prompt_utils";

const COLLAPSED_PARAM_ROWS = 3;
const COLLAPSED_PROMPT_ROWS = 3;

export default function ReproduceTemplateSection(props: {
  template: {
    template_id: string;
    base_prompt: string;
    parameters: TemplateParameter[];
  };
}) {
  const { template } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("nanoTemplate");

  const params = template.parameters || [];
  const [form, setForm] = useState<Record<string, any>>({});
  const [showAllParams, setShowAllParams] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  useEffect(() => {
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
  }, [template.template_id, params, searchParams]);

  const filledPrompt = useMemo(
    () => fillPrompt(template.base_prompt || "", form),
    [template.base_prompt, form]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const qs = searchParams?.toString();
    return `${window.location.origin}${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, searchParams]);

  const visibleParams = showAllParams
    ? params
    : params.slice(0, COLLAPSED_PARAM_ROWS);

  const promptText = filledPrompt.trim() || template.base_prompt || "";
  const promptLines = promptText ? promptText.split("\n") : [];
  const shouldFoldPrompt = promptLines.length > COLLAPSED_PROMPT_ROWS;
  const previewPromptText = showFullPrompt
    ? promptText
    : promptLines.slice(0, COLLAPSED_PROMPT_ROWS).join("\n");

  const onChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPickPrefill = (name: string, v: string) => {
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  return (
<section>
  <h2 className="mb-4 text-lg font-bold text-neutral-900">
    {t("reproduce.title")}
  </h2>

  <p className="mb-4 text-sm text-neutral-600">
    {t("reproduce.subtitle")}
  </p>

  <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
    <div className="lg:col-span-5">
      <div className="space-y-3">
        {params.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
            {t("reproduce.noParams")}
          </div>
        ) : (
          <>
            {visibleParams.map((p) => {
              const value = form[p.name] ?? "";
              const { displayPlaceholder, candidates } = normalizePrefills(
                p.placeholder
              );

              const common =
                "w-full rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300";

              return (
                <div key={p.name}>
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-neutral-800">
                      {p.label || p.name}
                    </div>

                    {candidates.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {candidates.slice(0, 4).map((cand) => (
                          <button
                            key={`${p.name}-${cand}`}
                            type="button"
                            onClick={() => onPickPrefill(p.name, cand)}
                            className="cursor-pointer rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
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
                      placeholder={displayPlaceholder}
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
                      placeholder={displayPlaceholder}
                      className={common}
                    />
                  )}
                </div>
              );
            })}

            {params.length > COLLAPSED_PARAM_ROWS && (
              <button
                type="button"
                onClick={() => setShowAllParams((prev) => !prev)}
                className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                {showAllParams ? "Show fewer parameters" : "Show all parameters"}
              </button>
            )}
          </>
        )}
      </div>

      <UnifiedActionBar
        className="mt-4"
        tracking={{
          contentId: template.template_id,
          contentType: "nano_inspiration",
          viewMode: "cards",
        }}
        generate={{
          enabled: true,
          text: promptText,
        }}
        copy={{
          enabled: true,
          text: promptText,
        }}
        share={{
          enabled: true,
          url: shareUrl,
          title: template.template_id,
          text: "Try this Nano Banana template",
        }}
      />
    </div>

    <div className="lg:col-span-7">
      <div className="rounded-xl bg-neutral-50 p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
          {t("reproduce.previewLabel")}
        </div>

        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {previewPromptText}
        </pre>

        {!showFullPrompt && shouldFoldPrompt && (
          <div className="mt-2 text-sm text-neutral-500">...</div>
        )}

        {shouldFoldPrompt && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setShowFullPrompt((prev) => !prev)}
              className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              {showFullPrompt ? "Show less" : "Show full prompt"}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
    </section>
  );
}