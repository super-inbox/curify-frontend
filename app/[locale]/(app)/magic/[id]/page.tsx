"use client";

import { useParams } from "next/navigation";
import { JOB_UI_CONFIG } from "@/lib/create-job-ui";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { modalAtom, topUpContextAtom } from "@/app/atoms/atoms";
import Loading from "../Loading";
import { projectService } from "@/services/projects";
import { ProjectStatus, ProjectStatusUpdate } from "@/types/projects";
import { buildFailureView, type FailureView } from "@/lib/failureActions";

import { isAwaitingCredits, creditShortfall } from "@/lib/awaitingCredits";
import { useTracking } from "@/services/useTracking";
import { creditsToDollars } from "@/lib/pricing";

export default function Magic() {
  const router = useRouter();
  const { id } = useParams();
  const t = useTranslations("magic.errors");

  const waitingT = useTranslations("awaitingCredits");
  const { trackAction } = useTracking();
  const trackedWaiting = useRef<string | null>(null);
  const [waiting, setWaiting] = useState<ProjectStatusUpdate | null>(null);
  const [pollVersion, setPollVersion] = useState(0);
  const [, setTopUpContext] = useAtom(topUpContextAtom);
  const projectId = id as string;

  const [status, setStatus] = useState<ProjectStatus>("QUEUED");
  const [failure, setFailure] = useState<FailureView | null>(null);
  const [jobType, setJobType] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(false);
  const [, setModal] = useAtom(modalAtom);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (!projectId) return;

    setWaiting(null);
    setFailure(null);
    isRedirectingRef.current = false;
    let isCancelled = false;
    const startTime = Date.now();
    const maxDuration = 4 * 60 * 60 * 1000;

    const pollStatus = async () => {
      if (isCancelled || isRedirectingRef.current) return;

      if (Date.now() - startTime > maxDuration) {
        console.warn("Polling timeout reached.");
        return;
      }

      try {
        const statusRes = await projectService.getProjectStatus(projectId);

        console.log("Project status response:", statusRes);

        if (isCancelled || isRedirectingRef.current) return;

        const projectStatus = statusRes?.status;

        console.log("Resolved project status:", projectStatus);

        if (!projectStatus) {
          console.error("Status missing in response:", statusRes);
          timeoutRef.current = setTimeout(pollStatus, 20000);
          return;
        }

        setStatus(projectStatus);
        if (isAwaitingCredits(statusRes)) {
          if (trackedWaiting.current !== projectId) {
            trackedWaiting.current = projectId;
            trackAction({ contentType: "topic_capsule", contentId: `paywall:awaiting-credits:${statusRes.job_type ?? "project"}` }, "click");
          }
          setWaiting(statusRes);
          setFailure(null);
          timeoutRef.current = setTimeout(pollStatus, 20000);
          return;
        }
        setWaiting(null);

        if (projectStatus === "COMPLETED") {
          console.log("Project completed → redirecting");

          isRedirectingRef.current = true;

          try {
            const fullProject = await projectService.getProject(projectId);

            if (!isCancelled) {
              localStorage.setItem(
                "selectedProjectDetails",
                JSON.stringify(fullProject)
              );
            }
          } catch (e) {
            console.warn("Failed to prefetch project details:", e);
          }

          if (!isCancelled) {
            router.replace(statusRes.job_type === "nano_template_generation" ? `/image-project/${projectId}` : `/project_details/${projectId}`);
          }

          return;
        }

        if (statusRes?.job_type) {
          setJobType(statusRes.job_type);
        }

        if (projectStatus === "FAILED") {
          // Message selection and which buttons apply live in lib/failureActions
          // so they can be tested without mounting this page.
          setFailure(buildFailureView(statusRes, (k) => t.has(k)));
          return;
        }

        timeoutRef.current = setTimeout(pollStatus, 20000);
      } catch (err) {
        console.error("Polling error:", err);

        if (!isCancelled && !isRedirectingRef.current) {
          timeoutRef.current = setTimeout(pollStatus, 20000);
        }
      }
    };

    pollStatus();

    return () => {
      isCancelled = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projectId, router, pollVersion]);

  const runRetry = async (jobType?: string) => {
    setRetrying(true);
    setRetryError(false);
    try {
      const res = await projectService.retryProject(projectId, jobType);
      // The new project polls on this same screen.
      router.replace(`/magic/${res.project_id}`);
    } catch (err) {
      console.error("Retry failed:", err);
      setRetrying(false);
      setRetryError(true);
    }
  };

  if (waiting) {
    const shortfall = creditShortfall(waiting);
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="text-2xl font-semibold">{waitingT("title")}</h1>
        <p>{waitingT("saved")}</p>
        {waiting.required_credits != null && <p>{waitingT("required", { credits: waiting.required_credits, price: creditsToDollars(waiting.required_credits).toFixed(2) })}</p>}
        {waiting.available_credits != null && <p>{waitingT("available", { credits: waiting.available_credits })}</p>}
        {shortfall != null && <p>{waitingT("shortfall", { credits: shortfall, price: creditsToDollars(shortfall).toFixed(2) })}</p>}
        <button disabled={retrying} className="px-5 py-2.5 rounded-full bg-blue-600 text-white disabled:opacity-60" onClick={async () => {
          if (shortfall !== 0) {
            setTopUpContext({
              projectId, resumeAfterPayment: true,
              required: waiting.required_credits ?? 0, available: waiting.available_credits ?? 0,
              shortfall: shortfall ?? undefined,
              jobLabel: waitingT("jobLabel"), surface: "awaiting-credits",
            });
            setModal("topup");
            return;
          }
          setRetrying(true);
          setRetryError(false);
          try {
            const resumed = await projectService.resumeProject(projectId);
            if (isAwaitingCredits(resumed)) setWaiting(resumed);
            else { setWaiting(null); setStatus(resumed.status); setPollVersion(v => v + 1); }
          } catch { setRetryError(true); }
          finally { setRetrying(false); }
        }}>{waitingT(shortfall === 0 ? "resume" : "topUp")}</button>
        {retryError && <p role="alert">{waitingT("resumeFailed")}</p>}
      </div>
    );
  }

  if (failure) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-red-600 text-lg font-semibold max-w-md">
          {t(failure.messageKey)}
        </p>

        {failure.showAslOffer && (
          <div className="flex flex-col items-center gap-2 max-w-md">
            <button
              onClick={() => runRetry("asl_translation")}
              disabled={retrying}
              className="px-5 py-2.5 rounded-full bg-[var(--p-blue)] text-white font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {t(
                failure.aslStrength === "suspected" ? "aslCtaSuspected" : "aslCta",
                // These buttons read "— free" until 2026-09-24, when ASL went back
                // to a per-minute charge. Offering the most expensive per-minute
                // tool we sell as the free consolation for a failed job is the
                // worst possible place to be wrong about a price, so the rate is
                // passed in rather than written into ten locale files.
                { credits: JOB_UI_CONFIG.asl_translation.ratePerMinute },
              )}
            </button>
            {/* Always directly beneath the button, never optional. The
                recogniser scores WER 0.92 against the one real user video with
                a human reference; a green button with no caveat would be
                overselling it at the worst possible moment. */}
            <p className="text-xs text-gray-500">{t("aslCaveat")}</p>
          </div>
        )}

        {failure.showRetry && !failure.showAslOffer && (
          <button
            onClick={() => runRetry()}
            disabled={retrying}
            className="px-5 py-2.5 rounded-full border border-gray-300 font-medium hover:bg-gray-50 transition disabled:opacity-60"
          >
            {t("retryCta")}
          </button>
        )}

        {failure.showTopUp && (
          <button
            onClick={() => setModal("topup")}
            className="px-5 py-2.5 rounded-full bg-[var(--p-blue)] text-white font-medium hover:opacity-90 transition"
          >
            {t("topUpCta")}
          </button>
        )}

        {retryError && (
          <p className="text-sm text-red-500">{t("retryFailed")}</p>
        )}

        {/* The backend's own English sentence, kept reachable for support but
            no longer the headline — it used to be rendered verbatim to every
            user whose failure code the UI did not recognise. */}
        {failure.detail && (
          <details className="text-xs text-gray-400 max-w-md">
            <summary className="cursor-pointer">{t("detailsToggle")}</summary>
            <p className="mt-1 break-words">{failure.detail}</p>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center">
      <Loading currentStatus={status} jobType={jobType} />
    </div>
  );
}