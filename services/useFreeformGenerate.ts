"use client";

import { useRef, useState } from "react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import { freeformGenerateService } from "@/services/freeformGenerate";
import { nanoGenerateService } from "@/services/nanoGenerate";
import { useTracking, type TrackingTarget } from "@/services/useTracking";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

const CREDITS_COST = 10;

// Mirror useDirectGenerate's poll loop: backend runs gen as a background task
// (image-to-image can take >60s), so we poll /projects/{id}/status until
// COMPLETED (result_url) or FAILED (failure_reason).
const POLL_INTERVAL_MS = 2500;
const POLL_MAX_MS = 180_000;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function userError(message: string): Error {
  const e = new Error(message);
  (e as Error & { userFacing?: boolean }).userFacing = true;
  return e;
}

async function pollFreeformResult(projectId: string): Promise<string> {
  const deadline = Date.now() + POLL_MAX_MS;
  await sleep(1500);
  while (Date.now() < deadline) {
    let st;
    try {
      st = await nanoGenerateService.getProjectStatus(projectId);
    } catch {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }
    const status = (st?.status || "").toUpperCase();
    if (status === "COMPLETED") {
      if (st.result_url) return st.result_url;
      throw userError("Generation finished but no image came back — please try again.");
    }
    if (status === "FAILED") {
      throw userError(st.failure_reason || "Generation failed. Please try again.");
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw userError("This is taking longer than usual — please try again in a moment.");
}

type Options = {
  prompt: string;
  referenceImageUrl?: string;
  sourcePromptId?: string;
  tracking: TrackingTarget;
  onSuccess: (signedUrl: string) => void;
};

export function useFreeformGenerate({
  prompt,
  referenceImageUrl,
  sourcePromptId,
  tracking,
  onSuccess,
}: Options) {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const { trackAction, track } = useTracking();
  const t = useTranslations("actionButtons");

  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const pendingGenerateRef = useRef(false);

  const generate = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    if (!user) {
      pendingGenerateRef.current = true;
      isGeneratingRef.current = false;
      track({
        contentId: "auth-modal:gallery-remix",
        contentType: "topic_capsule",
        actionType: "click",
      });
      setDrawerState("signin");
      return;
    }

    const credits =
      ((user as any)?.non_expiring_credits ?? 0) +
      ((user as any)?.expiring_credits ?? 0);
    if (credits < CREDITS_COST) {
      alert(t("insufficientCredits"));
      isGeneratingRef.current = false;
      return;
    }

    if (!prompt || !prompt.trim()) {
      isGeneratingRef.current = false;
      return;
    }

    try {
      setIsGenerating(true);
      trackAction(tracking, "generate");
      const res = await freeformGenerateService.generate({
        prompt: prompt.trim(),
        ...(referenceImageUrl ? { reference_image_url: referenceImageUrl } : {}),
        ...(sourcePromptId ? { source_prompt_id: sourcePromptId } : {}),
      });
      if (!res?.success || !res.project_id) {
        throw userError(res?.message || "Generation failed");
      }
      const imageUrl = await pollFreeformResult(res.project_id);
      onSuccess(imageUrl);
    } catch (err) {
      const e = err as (Error & { userFacing?: boolean }) | undefined;
      alert(e?.userFacing && e.message ? e.message : t("generateFailed"));
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  return { generate, isGenerating };
}
