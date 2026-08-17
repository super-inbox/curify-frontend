"use client";

/**
 * Shared submit + poll for the design → manufacturing tools.
 *
 * Extracted so the three forms cannot drift on the parts that touch money or
 * user trust: sign-in gating, "nothing dispatched until the button", and a poll
 * cap that reports the job as still running rather than lost. The forms differ
 * only in their fields and which endpoint they call.
 */
import { useCallback, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import { factoryExportService, type FactoryExportResponse } from "@/services/factoryExport";

export type ExportPhase = "idle" | "running" | "done" | "failed";

const POLL_MS = 4000;
/** ~5 min. Tracing, CMYK conversion and (for mockups) a Gemini call are slow. */
const MAX_POLLS = 75;

export function useFactoryExport(opts: { runningNote?: string } = {}) {
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);

  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const polls = useRef(0);

  const start = useCallback(
    async (submit: () => Promise<FactoryExportResponse>) => {
      if (!user) {
        // Gate here rather than at the endpoint: a 401 after a filled-in form
        // reads as a broken tool, not as "you need an account".
        setDrawer("signin");
        return;
      }
      setPhase("running");
      setError(null);
      setResultUrl(null);
      polls.current = 0;

      let projectId: string | undefined;
      try {
        const res = await submit();
        projectId = res.project_id;
        if (!res.success || !projectId) {
          throw new Error(res.message || "Could not start the job.");
        }
      } catch (e) {
        // Insufficient credits and out-of-range inputs are rejected BEFORE a
        // project row exists, so this message is actionable.
        setPhase("failed");
        setError(e instanceof Error ? e.message : "Could not start the job.");
        return;
      }

      const tick = async () => {
        polls.current += 1;
        try {
          const st = await factoryExportService.getProjectStatus(projectId!);
          if (st.status === "COMPLETED") {
            setResultUrl(st.result_url ?? null);
            setPhase("done");
            return;
          }
          if (st.status === "FAILED") {
            setPhase("failed");
            setError(st.failure_reason || "The job failed. Try a different input.");
            return;
          }
        } catch {
          /* transient — keep polling to the cap */
        }
        if (polls.current >= MAX_POLLS) {
          setPhase("failed");
          setError(
            "Still running — check your workspace shortly; the job continues server-side.",
          );
          return;
        }
        window.setTimeout(tick, POLL_MS);
      };
      window.setTimeout(tick, POLL_MS);
    },
    [user, setDrawer],
  );

  return {
    phase,
    error,
    resultUrl,
    busy: phase === "running",
    runningNote: opts.runningNote,
    start,
  };
}
