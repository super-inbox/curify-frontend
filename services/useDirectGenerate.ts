"use client";

import { useRef, useState } from "react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import { nanoGenerateService } from "@/services/nanoGenerate";
import { buildExampleId } from "@/lib/nano_utils";
import { findDuplicate, type ExistingExampleRef } from "@/lib/editDistance";
import { useTracking, type TrackingTarget } from "@/services/useTracking";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

const CREDITS_COST = 10;

type Options = {
  templateId: string;
  params: Record<string, string>;
  existingExamples?: ExistingExampleRef[];
  tracking: TrackingTarget;
  onSuccess: (signedUrl: string, exampleId: string) => void;
};

export function useDirectGenerate({
  templateId,
  params,
  existingExamples = [],
  tracking,
  onSuccess,
}: Options) {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const { trackAction } = useTracking();
  const t = useTranslations("actionButtons");

  const [isGenerating, setIsGenerating] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    exampleId: string;
    score: number;
  } | null>(null);
  const bypassRef = useRef(false);

  const generate = async () => {
    if (isGenerating) return;
    if (!user) { setDrawerState("signin"); return; }

    const credits =
      ((user as any)?.non_expiring_credits ?? 0) +
      ((user as any)?.expiring_credits ?? 0);
    if (credits < CREDITS_COST) { alert(t("insufficientCredits")); return; }

    if (!bypassRef.current) {
      const dup = findDuplicate(templateId, params, existingExamples);
      if (dup) { setDuplicateWarning(dup); return; }
    }
    bypassRef.current = false;
    setDuplicateWarning(null);

    try {
      setIsGenerating(true);
      trackAction(tracking, "generate");
      const exId = buildExampleId(templateId, params);
      const res = await nanoGenerateService.generate({
        template_id: templateId,
        params,
        example_id: exId,
      });
      if (!res?.success || !res?.signed_url)
        throw new Error(res?.message || "Generation failed");
      onSuccess(res.signed_url, exId);
    } catch {
      alert(t("generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const dismissAndGenerate = () => {
    bypassRef.current = true;
    generate();
  };

  const clearWarning = () => setDuplicateWarning(null);

  return { generate, dismissAndGenerate, isGenerating, duplicateWarning, clearWarning };
}
