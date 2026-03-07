"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import { projectService } from "@/services/projects";
import { ProjectStatus } from "@/types/projects";

export default function Magic() {
  const router = useRouter();
  const { id, locale } = useParams();

  const projectId = id as string;
  const localeStr = Array.isArray(locale) ? locale[0] : locale;

  const [status, setStatus] = useState<ProjectStatus>("QUEUED");
  const [error, setError] = useState<string | null>(null);

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

        if (projectStatus === "FAILED") {
          setError("Translation failed. Please try again.");
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

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-600 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center">
      <Loading currentStatus={status} />
    </div>
  );
}