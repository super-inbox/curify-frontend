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
  const startTime = Date.now();
  const maxDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  const pollStatus = async () => {
    if (isCancelled) return;
    
    // Stop polling after 4 hours (silently)
    if (Date.now() - startTime > maxDuration) {
      return;
    }

    try {
      const statusRes: ProjectStatusUpdate = await projectService.getProjectStatus(projectId);
      if (isCancelled) return;
      
      setStatus(statusRes.status);
      
      if (statusRes.status === "COMPLETED") {
        const fullProject = await projectService.getProject(projectId);
        if (!isCancelled) {
          setProjectDetails(fullProject);
          localStorage.setItem("selectedProjectDetails", JSON.stringify(fullProject));
          router.push(`/${locale}/project_details/${projectId}`);
        }
      } else if (statusRes.status === "FAILED") {
        setError("Translation failed. Please try again.");
      } else {
        // Continue polling every 20 seconds
        timeoutRef.current = setTimeout(pollStatus, 20000);
      }
    } catch (err) {
      console.error("Polling error:", err);
      if (!isCancelled) {
        // Continue polling even on error
        timeoutRef.current = setTimeout(pollStatus, 20000);
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
