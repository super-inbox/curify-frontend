"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import { projectService } from "@/services/projects";
import { ProjectStatusUpdate, ProjectStatus } from "@/types/projects";
import { ProjectDetails } from "@/types/segments";

export default function Magic() {
  const router = useRouter();
  const { id, locale } = useParams();
  const projectId = id as string;

  const [status, setStatus] = useState<ProjectStatus>("QUEUED");
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let isCancelled = false;
    let attempts = 0;
    const maxAttempts = 60;

    const pollStatus = async () => {
      if (isCancelled) return;

      try {
        const statusRes: ProjectStatusUpdate = await projectService.getProjectStatus(projectId);
        if (isCancelled) return;

        setStatus(statusRes.status);

        if (statusRes.status === "COMPLETED") {
          const fullProject = await projectService.getProject(projectId);
          if (!isCancelled) {
            setProjectDetails(fullProject);
            localStorage.setItem("selectedProjectDetails", JSON.stringify(fullProject));
            isCancelled = true;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            router.push(`/${locale}/project_details/${projectId}`);
          }
        } else if (statusRes.status === "FAILED") {
          isCancelled = true;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setError("Translation failed. Please try again.");
        } else {
          if (attempts++ < maxAttempts) {
            timeoutRef.current = setTimeout(pollStatus, 6000);
          } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setError("Timeout. Please try again later.");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (!isCancelled && attempts++ < maxAttempts) {
          timeoutRef.current = setTimeout(pollStatus, 10000); // Backoff
        } else if (!isCancelled) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setError("Timeout. Please try again later.");
        }
      }
    };

    pollStatus();

    return () => {
      isCancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [projectId, locale, router]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-600 text-lg font-semibold">
        {error}
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-center">
        <Loading />
        <p className="mt-4 text-sm text-gray-600">
          {status ? `Processing: ${status.replace("_", " ").toLowerCase()}...` : "Processing..."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center text-gray-500 text-sm">
      Translation complete. Redirecting...
    </div>
  );
}
