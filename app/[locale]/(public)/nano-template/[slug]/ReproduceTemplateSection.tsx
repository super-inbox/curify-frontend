"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import type { NanoTemplateForDetail } from "@/lib/nano_prompt_utils";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import { similarity, paramsToKey } from "@/lib/editDistance";
import { toSlug, buildExampleId } from "@/lib/nano_utils";

import {
  fillPrompt,
  normalizePrefills,
} from "@/lib/nano_prompt_utils";

const SIMILARITY_THRESHOLD = 0.85;
const COLLAPSED_PARAM_ROWS = 3;
const COLLAPSED_PROMPT_ROWS = 3;

export type SampleImage = {
  url: string;
  previewUrl: string;
  alt?: string;
};

export default function ReproduceTemplateSection(props: {
  template: NanoTemplateForDetail;
  sampleImage?: SampleImage;
  initialParams?: Record<string, string>;
}) {
  const { template, sampleImage, initialParams } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("nanoTemplate");

  const params = template.parameters || [];
  const [form, setForm] = useState<Record<string, any>>({});
  const [dateRangeState, setDateRangeState] = useState<Record<string, { start: string; end: string }>>({});
  const [showAllParams, setShowAllParams] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ exampleId: string; score: number } | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, any> = {};
    for (const p of params) {
      const qv = searchParams?.get(p.name) ?? initialParams?.[p.name];
      if (qv !== null && qv !== undefined && String(qv).trim() !== "") {
        next[p.name] = qv;
        continue;
      }
      const { candidates } = normalizePrefills(p.placeholder);
      if (candidates.length > 0) next[p.name] = candidates[0];
    }
    setForm(next);
  }, [template.template_id, params, searchParams, initialParams]);

  const filledPrompt = useMemo(
    () => fillPrompt(template.base_prompt || "", form),
    [template.base_prompt, form]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const qs = searchParams?.toString();
    return `${window.location.origin}${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, searchParams]);

  const visibleParams = showAllParams ? params : params.slice(0, COLLAPSED_PARAM_ROWS);

  const promptText = filledPrompt.trim() || template.base_prompt || "";
  const promptLines = promptText ? promptText.split("\n") : [];
  const shouldFoldPrompt = promptLines.length > COLLAPSED_PROMPT_ROWS;
  const previewPromptText = showFullPrompt
    ? promptText
    : promptLines.slice(0, COLLAPSED_PROMPT_ROWS).join("\n");

  const onChange = (name: string, value: any) => {
    setDuplicateWarning(null);
    setGeneratedImageUrl(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPickPrefill = (name: string, v: string) => {
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const onDateRangeChange = (name: string, field: "start" | "end", value: string) => {
    setDateRangeState((prev) => {
      const next = { ...prev, [name]: { ...(prev[name] ?? { start: "", end: "" }), [field]: value } };
      const { start, end } = next[name];
      if (start && end) {
        const formatted = `${format(new Date(start + "T00:00:00"), "M/d")}-${format(new Date(end + "T00:00:00"), "M/d")}`;
        setForm((f) => ({ ...f, [name]: formatted }));
      }
      return next;
    });
  };

  const findDuplicate = (currentForm: Record<string, any>) => {
    const existing = template.existingExamples ?? [];
    if (existing.length === 0) return null;

    const currentExampleId = buildExampleId(template.template_id, currentForm as Record<string, string>);
    const exactMatch = existing.find((ex) => ex.id === currentExampleId);
    if (exactMatch) return { exampleId: exactMatch.id, score: 1 };

    const currentKey = paramsToKey(currentForm);
    if (!currentKey) return null;
    let best: { exampleId: string; score: number } | null = null;
    for (const ex of existing) {
      const score = similarity(currentKey, paramsToKey(ex.params));
      if (score >= SIMILARITY_THRESHOLD && (!best || score > best.score)) {
        best = { exampleId: ex.id, score };
      }
    }
    return best;
  };

  const localePrefix = useMemo(() => {
    const seg = pathname.split("/")[1];
    return seg && seg.length === 2 && seg !== "na" ? `/${seg}` : "";
  }, [pathname]);

  const exampleUrl = (exampleId: string) =>
    `${localePrefix}/nano-template/${toSlug(template.template_id)}/example/${encodeURIComponent(exampleId)}`;

  const hasImages = !!(sampleImage || generatedImageUrl);

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

          {/* Left: params + prompt */}
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
                    const { displayPlaceholder, candidates } = normalizePrefills(p.placeholder);
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
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : p.type === "daterange" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={dateRangeState[p.name]?.start ?? ""}
                              onChange={(e) => onDateRangeChange(p.name, "start", e.target.value)}
                              className={common}
                            />
                            <span className="text-sm text-neutral-400">–</span>
                            <input
                              type="date"
                              value={dateRangeState[p.name]?.end ?? ""}
                              min={dateRangeState[p.name]?.start ?? ""}
                              onChange={(e) => onDateRangeChange(p.name, "end", e.target.value)}
                              className={common}
                            />
                          </div>
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

            {/* Prompt preview */}
            <div className="mt-4 rounded-xl bg-neutral-50 p-4">
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

            {duplicateWarning && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>
                  A very similar image already exists ({Math.round(duplicateWarning.score * 100)}% match).{" "}
                  <Link
                    href={exampleUrl(duplicateWarning.exampleId)}
                    className="font-semibold underline hover:text-amber-900"
                    target="_blank"
                  >
                    View it
                  </Link>
                  {" — or "}
                  <button
                    type="button"
                    className="font-semibold underline hover:text-amber-900 cursor-pointer"
                    onClick={() => setDuplicateWarning(null)}
                  >
                    dismiss and generate anyway
                  </button>
                  .
                </span>
              </div>
            )}

            <UnifiedActionBar
              className="mt-4"
              tracking={{
                contentId: template.template_id,
                contentType: "nano_inspiration",
                viewMode: "cards",
              }}
              generate={template.allow_generation ? undefined : {
                enabled: true,
                text: promptText,
              }}
              directGenerate={template.allow_generation ? {
                enabled: true,
                templateId: template.template_id,
                params: form as Record<string, string>,
                exampleId: buildExampleId(template.template_id, form as Record<string, string>),
                onBeforeGenerate: () => {
                  if (duplicateWarning) return true;
                  const dup = findDuplicate(form);
                  if (dup) {
                    setDuplicateWarning(dup);
                    return false;
                  }
                  return true;
                },
                onGenerateSuccess: (signedUrl: string) => setGeneratedImageUrl(signedUrl),
              } : undefined}
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
              batchDownload={{
                enabled: !!template.batch,
                templateId: template.template_id,
              }}
            />
          </div>

          {/* Right: images */}
          {hasImages && (
            <div className="lg:col-span-7">
              {sampleImage && generatedImageUrl ? (
                // Both sample and generated — show side by side
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Sample
                    </div>
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      <img
                        src={sampleImage.previewUrl}
                        alt={sampleImage.alt ?? "Sample"}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Generated
                    </div>
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      <img
                        src={generatedImageUrl}
                        alt="Generated result"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <a
                        href={generatedImageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                // Generated only
                <div>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Generated
                  </div>
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    <img
                      src={generatedImageUrl}
                      alt="Generated result"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <a
                      href={generatedImageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : sampleImage ? (
                // Sample only
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <img
                    src={sampleImage.previewUrl}
                    alt={sampleImage.alt ?? "Sample"}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
