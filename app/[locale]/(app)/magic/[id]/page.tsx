"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { modalAtom } from "@/app/atoms/atoms";
import Loading from "../Loading";
import { projectService } from "@/services/projects";
import { ProjectStatus } from "@/types/projects";
import { buildFailureView, type FailureView } from "@/lib/failureActions";

export default function Magic() {
  const router = useRouter();
  const { id, locale } = useParams();
  const t = useTranslations("magic.errors");

  const projectId = id as string;
  const localeStr = Array.isArray(locale) ? locale[0] : locale;

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
            router.replace(`/project_details/${projectId}`);
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
  }, [projectId, router]);

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
              {t(failure.aslStrength === "suspected" ? "aslCtaSuspected" : "aslCta")}
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