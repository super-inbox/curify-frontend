"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import UnifiedActionBar from "@/app/[locale]/_components/UnifiedActionBar";
import { buildExampleId } from "@/lib/nano_utils";
import type { TemplateParameter } from "@/lib/nano_utils";
import { nanoGenerateService } from "@/services/nanoGenerate";
import { userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";

const CREDITS_COST = 10;

type Props = {
  templateId: string;
  slug: string;
  locale: string;
  parameters: TemplateParameter[];
  allowGeneration: boolean;
  initialParams: Record<string, string>;
  exampleId: string;
  promptText: string;
  batchEnabled: boolean;
  examplePageUrl: string;
  title: string;
};

export default function ExampleGeneratePanel({
  templateId,
  slug,
  locale,
  parameters,
  allowGeneration,
  initialParams,
  exampleId,
  promptText,
  batchEnabled,
  examplePageUrl,
  title,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>(initialParams);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedExampleId, setGeneratedExampleId] = useState<string | null>(null);

  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [clientMounted] = useAtom(clientMountedAtom);
  const t = useTranslations("actionButtons");
  const { trackAction } = useTracking();

  const tracking = {
    contentId: `${templateId}:${exampleId}`,
    contentType: "nano_inspiration_reproduce_section" as const,
    viewMode: "cards" as const,
  };

  const remixHref = `/${locale}/nano-template/${slug}?${new URLSearchParams(form).toString()}#reproduce`;
  const exampleUrl = (id: string) =>
    `/${locale}/nano-template/${slug}/example/${encodeURIComponent(id)}`;

  const handleDirectGenerate = async () => {
    if (isGenerating) return;
    if (!user) { setDrawerState("signin"); return; }

    const credits =
      ((user as any)?.non_expiring_credits ?? 0) +
      ((user as any)?.expiring_credits ?? 0);
    if (credits < CREDITS_COST) { alert(t("insufficientCredits")); return; }

    try {
      setIsGenerating(true);
      trackAction(tracking, "generate");
      const newExId = buildExampleId(templateId, form);
      const res = await nanoGenerateService.generate({
        template_id: templateId,
        params: form,
        example_id: newExId,
      });
      if (!res?.success || !res?.signed_url)
        throw new Error(res?.message || "Generation failed");
      setGeneratedImageUrl(res.signed_url);
      setGeneratedExampleId(newExId);
    } catch {
      alert(t("generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopyGenerate = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      trackAction(tracking, "generate");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-auto flex flex-col gap-3 pt-1">
      {/* Param inputs — compact row layout */}
      {parameters.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          {parameters.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs font-semibold text-neutral-500">
                {p.label || p.name}
              </span>
              {p.type === "select" ? (
                <select
                  value={form[p.name] ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {(p.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[p.name] ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate button */}
      <div className="flex items-center gap-2">
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
              {clientMounted && !user && (
                <span className="ml-1 text-xs opacity-80">🔒</span>
              )}
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

        <UnifiedActionBar
          tracking={tracking}
          remix={{ enabled: true, href: remixHref }}
          copy={{ enabled: true, text: promptText }}
          share={{
            enabled: true,
            url: examplePageUrl,
            title,
            text: `Check out this Nano Banana example: ${title}`,
          }}
          batchDownload={{ enabled: batchEnabled, templateId }}
        />
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
            remix={
              generatedExampleId
                ? { enabled: true, href: exampleUrl(generatedExampleId) }
                : undefined
            }
            download={{ enabled: true, url: generatedImageUrl }}
            share={{
              enabled: true,
              url: examplePageUrl,
              title,
              text: `Check out this Nano Banana example: ${title}`,
            }}
          />
        </div>
      )}
    </div>
  );
}
