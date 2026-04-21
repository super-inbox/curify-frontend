"use client";

import { useState, useMemo } from "react";
import { Wand2 } from "lucide-react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import PromptBreakdown from "@/app/[locale]/_components/PromptBreakdown";
import CopyPromptButton from "@/app/[locale]/_components/CopyPromptButton";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import { buildExampleId, fillPrompt } from "@/lib/nano_utils";
import type { TemplateParameter } from "@/lib/nano_utils";
import { nanoGenerateService } from "@/services/nanoGenerate";
import { userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";

const CREDITS_COST = 10;

type Props = {
  metaChips?: ReactNode;
  title: string;
  templateId: string;
  slug: string;
  locale: string;
  parameters: TemplateParameter[];
  allowGeneration: boolean;
  initialParams: Record<string, string>;
  exampleId: string;
  basePrompt: string;
  batchEnabled: boolean;
  examplePageUrl: string;
};

export default function ExampleRightColumn({
  metaChips,
  title,
  templateId,
  slug,
  locale,
  parameters,
  allowGeneration,
  initialParams,
  exampleId,
  basePrompt,
  batchEnabled,
  examplePageUrl,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialParams);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedExampleId, setGeneratedExampleId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [clientMounted] = useAtom(clientMountedAtom);
  const t = useTranslations("actionButtons");
  const { trackAction } = useTracking();

  const filledPrompt = useMemo(() => fillPrompt(basePrompt, form), [basePrompt, form]);

  const tracking = {
    contentId: `${templateId}:${exampleId}`,
    contentType: "nano_inspiration_reproduce_section" as const,
    viewMode: "cards" as const,
  };

  const exampleUrl = (id: string) =>
    `/${locale}/nano-template/${slug}/example/${encodeURIComponent(id)}`;

  const handleDirectGenerate = async () => {
    if (isGenerating) return;
    if (!user) { setDrawerState("signin"); return; }
    const credits = ((user as any)?.non_expiring_credits ?? 0) + ((user as any)?.expiring_credits ?? 0);
    if (credits < CREDITS_COST) { alert(t("insufficientCredits")); return; }
    try {
      setIsGenerating(true);
      trackAction(tracking, "generate");
      const newExId = buildExampleId(templateId, form);
      const res = await nanoGenerateService.generate({ template_id: templateId, params: form, example_id: newExId });
      if (!res?.success || !res?.signed_url) throw new Error(res?.message || "Generation failed");
      setGeneratedImageUrl(res.signed_url);
      setGeneratedExampleId(newExId);
    } catch { alert(t("generateFailed")); }
    finally { setIsGenerating(false); }
  };

  const handleCopyGenerate = async () => {
    try {
      await navigator.clipboard.writeText(filledPrompt || basePrompt);
      trackAction(tracking, "generate");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3 lg:min-h-[520px]">
      {/* Meta chips */}
      {metaChips && (
        <div className="flex flex-wrap items-center gap-2">{metaChips}</div>
      )}

      {/* Title */}
      <h1 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
        {title}
      </h1>

      {/* Generate your own — param inputs */}
      {parameters.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-purple-100 bg-purple-50/50 px-3 py-2.5">
          <p className="text-xs font-semibold text-purple-700">Generate your own</p>
          {parameters.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs font-medium text-neutral-500">
                {p.label || p.name}
              </span>
              {p.type === "select" ? (
                <select
                  value={form[p.name] ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [p.name]: e.target.value }))}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {(p.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[p.name] ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [p.name]: e.target.value }))}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reactive prompt preview */}
      <section aria-labelledby="prompt-heading" className="flex flex-col">
        <h2
          id="prompt-heading"
          className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500"
        >
          Prompt
        </h2>
        <PromptBreakdown
          prompt={basePrompt}
          params={form}
          collapsedMaxHeight={80}
        />
      </section>

      {/* Action row: generate + copy + share + batch */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {allowGeneration ? (
          <>
            <button
              onClick={handleDirectGenerate}
              disabled={isGenerating}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60 cursor-pointer"
            >
              <Wand2 className="h-4 w-4" />
              {isGenerating ? t("generating") : t("generate")}
              {clientMounted && !user && <span className="ml-1 text-xs opacity-80">🔒</span>}
            </button>
            {clientMounted && user && (
              <span className="text-xs text-neutral-500">{CREDITS_COST} credits</span>
            )}
          </>
        ) : (
          <button
            onClick={handleCopyGenerate}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 cursor-pointer"
          >
            <Wand2 className="h-4 w-4" />
            {copied ? t("copied") : t("generate")}
          </button>
        )}

        <CopyPromptButton
          text={filledPrompt || basePrompt}
          onCopied={() => trackAction(tracking, "copy")}
        />

        <ShareButton
          url={examplePageUrl}
          title={title}
          text={`Check out this Nano Banana example: ${title}`}
          onShared={() => trackAction(tracking, "share")}
        />

        {batchEnabled && (
          <UnifiedActionBar
            tracking={tracking}
            batchDownload={{ enabled: true, templateId }}
          />
        )}
      </div>

      {/* Generated image result */}
      {generatedImageUrl && (
        <div className="flex flex-col gap-2">
          <CdnImage
            src={generatedImageUrl}
            alt="Generated result"
            className="max-h-[280px] w-auto rounded-2xl border border-neutral-200 object-contain"
          />
          <UnifiedActionBar
            tracking={tracking}
            remix={generatedExampleId ? { enabled: true, href: exampleUrl(generatedExampleId) } : undefined}
            download={{ enabled: true, url: generatedImageUrl }}
            share={{ enabled: true, url: examplePageUrl, title, text: `Check out this Nano Banana example: ${title}` }}
          />
        </div>
      )}
    </div>
  );
}
