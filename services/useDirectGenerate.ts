"use client";

import { useEffect, useRef, useState } from "react";
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
  const isGeneratingRef = useRef(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    exampleId: string;
    score: number;
  } | null>(null);
  const bypassRef = useRef(false);
  // Tracks the exId of the most recent successful generation so a follow-up
  // click with identical params surfaces the duplicate warning instead of
  // silently re-firing the same generate request. existingExamples (the prop)
  // is not refreshed after onSuccess, so without this guard `findDuplicate`
  // misses the just-generated example and the second click goes through.
  const lastGeneratedExIdRef = useRef<string | null>(null);

  // Auto-resume after signin. When an anonymous user clicks Generate,
  // we set pendingGenerateRef + open the signin drawer. When the user
  // finishes signing in (userAtom transitions null → truthy), the
  // useEffect below fires generate() automatically — so the user does
  // not have to click Generate a second time after the drawer closes.
  //
  // Audit 2026-06-04 (engagement funnel deep-dive): blog-landing
  // conversion was 1.5% vs template-direct 14.6%. Root cause was
  // useDirectGenerate's hard bail at !user, which sent anonymous
  // blog-referred traffic into the signin drawer and never resumed —
  // the user had to remember to click Generate again post-signin
  // (most did not). This closes the cliff.
  const pendingGenerateRef = useRef(false);

  const generate = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    if (!user) {
      // Anonymous → queue the action, open signin drawer, release the
      // re-entry guard so the post-signin auto-resume can call generate
      // again cleanly. Without releasing the ref, the post-signin call
      // would silently no-op at the top of this function.
      pendingGenerateRef.current = true;
      isGeneratingRef.current = false;
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

    const exId = buildExampleId(templateId, params);

    if (!bypassRef.current) {
      const dup = findDuplicate(templateId, params, existingExamples);
      if (dup) {
        setDuplicateWarning(dup);
        isGeneratingRef.current = false;
        return;
      }
      // Self-duplicate: the user just generated this exact exId. Without this
      // guard, a second click after success re-fires the same generate request
      // (existingExamples isn't refreshed inside this hook), which is the path
      // behind "users click twice and get the same image generated twice."
      if (lastGeneratedExIdRef.current === exId) {
        setDuplicateWarning({ exampleId: exId, score: 1 });
        isGeneratingRef.current = false;
        return;
      }
    }
    bypassRef.current = false;
    setDuplicateWarning(null);

    try {
      setIsGenerating(true);
      isGeneratingRef.current = true;
      trackAction(tracking, "generate");
      const res = await nanoGenerateService.generate({
        template_id: templateId,
        params,
        example_id: exId,
      });
      if (!res?.success || !res?.signed_url)
        throw new Error(res?.message || "Generation failed");
      lastGeneratedExIdRef.current = exId;
      onSuccess(res.signed_url, exId);
    } catch {
      alert(t("generateFailed"));
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const dismissAndGenerate = () => {
    bypassRef.current = true;
    generate();
  };

  const clearWarning = () => setDuplicateWarning(null);

  // Auto-resume after signin. Fires once when the user transitions from
  // null → truthy AND a generate was queued. The closure here captures
  // the latest `generate` on each re-render (which is itself the latest
  // closure over user/params/etc.), so the resumed call sees the freshly-
  // authenticated user and current form params.
  useEffect(() => {
    if (user && pendingGenerateRef.current) {
      pendingGenerateRef.current = false;
      generate();
    }
    // generate is intentionally omitted from deps — it changes on every
    // render via closure capture, and we only want to fire when `user`
    // transitions. The function we call is fresh by virtue of being
    // looked up at fire-time inside the effect body.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { generate, dismissAndGenerate, isGenerating, duplicateWarning, clearWarning };
}
