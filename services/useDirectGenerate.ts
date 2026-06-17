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

// Async generation poll. Generation runs as a backend background task (image2image
// can take >60s — the old synchronous request timed out on the client while the
// backend completed, orphaning the result). We poll /projects/{id}/status until
// COMPLETED (returns a signed result_url) or FAILED.
const POLL_INTERVAL_MS = 2500;
const POLL_MAX_MS = 180_000; // 3 min ceiling
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Mark an error as carrying a clean, user-facing message (e.g. the backend's
// CONTENT_BLOCKED reason) so the catch surfaces it verbatim instead of the
// generic fallback. Network/unknown errors stay unmarked → generic message.
function userError(message: string): Error {
  const e = new Error(message);
  (e as Error & { userFacing?: boolean }).userFacing = true;
  return e;
}

async function pollNanoResult(projectId: string): Promise<string> {
  const deadline = Date.now() + POLL_MAX_MS;
  await sleep(1500); // let the background task start
  while (Date.now() < deadline) {
    let st;
    try {
      st = await nanoGenerateService.getProjectStatus(projectId);
    } catch {
      await sleep(POLL_INTERVAL_MS); // transient network / 429 — retry
      continue;
    }
    const status = (st?.status || "").toUpperCase();
    if (status === "COMPLETED") {
      if (st.result_url) return st.result_url;
      throw userError("Generation finished but no image came back — please try again.");
    }
    if (status === "FAILED") {
      // failure_reason is a clean user-facing line (e.g. content-blocked).
      throw userError(st.failure_reason || "Generation failed. Please try again.");
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw userError("This is taking longer than usual — please try again in a moment.");
}

type Options = {
  templateId: string;
  params: Record<string, string>;
  existingExamples?: ExistingExampleRef[];
  tracking: TrackingTarget;
  onSuccess: (signedUrl: string, exampleId: string) => void;
  // image-to-image: blob_url of the uploaded reference image. Required for
  // templates with requires_image_upload — the caller gates Generate on it
  // and passes it through here so it lands in the generate request.
  referenceImageUrl?: string;
};

export function useDirectGenerate({
  templateId,
  params,
  existingExamples = [],
  tracking,
  onSuccess,
  referenceImageUrl,
}: Options) {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const { trackAction, track } = useTracking();
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
      // auth-modal tracking — mirrors services/useRequireAuth.ts. Funnel
      // pull 2026-06-17 surfaced 0 auth-modal events because this hot
      // path (the Generate flow) bypassed useRequireAuth. Reason
      // 'generate-attempt' so we can split friction by verb.
      track({ contentId: "auth-modal:generate-attempt", contentType: "topic_capsule", actionType: "click" });
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
        ...(referenceImageUrl ? { reference_image_url: referenceImageUrl } : {}),
      });
      if (!res?.success) throw userError(res?.message || "Generation failed");

      // Legacy synchronous backend returned signed_url directly; the async
      // backend returns a project_id we poll until the render completes.
      let imageUrl = res.signed_url;
      if (!imageUrl) {
        if (!res.project_id) throw userError(res?.message || "Generation failed");
        imageUrl = await pollNanoResult(res.project_id);
      }
      lastGeneratedExIdRef.current = exId;
      onSuccess(imageUrl, exId);
    } catch (err) {
      // Surface clean user-facing messages (content-blocked, timeout, etc.);
      // fall back to the generic alert for network/unknown errors.
      const e = err as (Error & { userFacing?: boolean }) | undefined;
      alert(e?.userFacing && e.message ? e.message : t("generateFailed"));
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
