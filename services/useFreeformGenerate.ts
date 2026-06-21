"use client";

import { useEffect, useRef, useState } from "react";
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

// Per-call arguments. The hook is now imperative — one instance fires many
// generations with different prompts/references (the custom remix + each
// production tile on the gallery reproduce surface), so prompt/reference are
// passed at call time rather than baked in at construction.
export type FreeformGenerateArgs = {
  prompt: string;
  referenceImageUrl?: string;
  sourcePromptId?: string;
  // Optional per-call tracking override (e.g. to attribute a specific
  // production tile). Falls back to the hook-level tracking target.
  tracking?: TrackingTarget;
  // Opaque caller metadata threaded back through the lifecycle callbacks
  // (e.g. {key, label} so the surface can restore the right tile spinner and
  // label the result) — survives the auth stash + post-signin resume.
  meta?: Record<string, unknown>;
};

type Options = {
  tracking: TrackingTarget;
  // Fires when a generation actually begins (after auth + credit checks pass) —
  // including a post-signin auto-resumed one. Use to set per-trigger UI state.
  onStart?: (args: FreeformGenerateArgs) => void;
  // Fired on a successful generation with the signed result URL plus the args
  // that produced it (so the caller can label/group results in a tray).
  onSuccess?: (signedUrl: string, args: FreeformGenerateArgs) => void;
  // Fires after a started generation settles (success or failure) — pair with
  // onStart to clear per-trigger UI state.
  onSettled?: (args: FreeformGenerateArgs) => void;
};

export function useFreeformGenerate({ tracking, onStart, onSuccess, onSettled }: Options) {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const { trackAction, track } = useTracking();
  const t = useTranslations("actionButtons");

  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  // Auto-resume after signin: an anonymous user's click is stashed here, the
  // signin drawer opens, and the useEffect below re-fires it once the user
  // transitions null → truthy. Mirrors useDirectGenerate — without it the
  // anon user's tile/Generate click on the gallery surface was silently
  // dropped at the drawer.
  const pendingArgsRef = useRef<FreeformGenerateArgs | null>(null);

  // Returns the signed URL on success; null when blocked (auth / credits /
  // blank prompt) or on failure (the error is surfaced via alert inside).
  const generate = async (args: FreeformGenerateArgs): Promise<string | null> => {
    if (isGeneratingRef.current) return null;
    isGeneratingRef.current = true;

    if (!user) {
      // Queue the action, open signin; the post-signin effect resumes it.
      pendingArgsRef.current = args;
      isGeneratingRef.current = false;
      track({
        contentId: "auth-modal:gallery-remix",
        contentType: "topic_capsule",
        actionType: "click",
      });
      setDrawerState("signin");
      return null;
    }

    const credits =
      ((user as any)?.non_expiring_credits ?? 0) +
      ((user as any)?.expiring_credits ?? 0);
    if (credits < CREDITS_COST) {
      alert(t("insufficientCredits"));
      isGeneratingRef.current = false;
      return null;
    }

    if (!args.prompt || !args.prompt.trim()) {
      isGeneratingRef.current = false;
      return null;
    }

    try {
      setIsGenerating(true);
      onStart?.(args);
      trackAction(args.tracking ?? tracking, "generate");
      const res = await freeformGenerateService.generate({
        prompt: args.prompt.trim(),
        ...(args.referenceImageUrl ? { reference_image_url: args.referenceImageUrl } : {}),
        ...(args.sourcePromptId ? { source_prompt_id: args.sourcePromptId } : {}),
      });
      if (!res?.success || !res.project_id) {
        throw userError(res?.message || "Generation failed");
      }
      const imageUrl = await pollFreeformResult(res.project_id);
      onSuccess?.(imageUrl, args);
      return imageUrl;
    } catch (err) {
      const e = err as (Error & { userFacing?: boolean }) | undefined;
      alert(e?.userFacing && e.message ? e.message : t("generateFailed"));
      return null;
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
      onSettled?.(args);
    }
  };

  // Fire once when the user transitions null → truthy AND a generate was queued.
  // The looked-up `generate` is fresh by virtue of being read at effect-fire
  // time. `user` is the only intended trigger.
  useEffect(() => {
    if (user && pendingArgsRef.current) {
      const args = pendingArgsRef.current;
      pendingArgsRef.current = null;
      generate(args);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { generate, isGenerating };
}
