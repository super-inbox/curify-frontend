"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!projectId) return;

    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const statusRes: ProjectStatusUpdate = await projectService.getProjectStatus(projectId);

        if (isCancelled) return;

        setStatus(statusRes.status);

        if (statusRes.status === "COMPLETED") {
          const fullProject = await projectService.getProject(projectId);
          if (!isCancelled) {
            // ✅ Save project details to localStorage
            localStorage.setItem("selectedProjectDetails", JSON.stringify(fullProject));

            // ✅ Redirect to project details page
            router.push(`/${locale}/project_details/${projectId}`);
          }
        } else if (statusRes.status === "FAILED") {
          setError("Translation failed. Please try again.");
        } else {
          setTimeout(pollStatus, 3000); // Continue polling
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (!isCancelled) {
          setTimeout(pollStatus, 5000); // Backoff retry
        }
      }
    };

    pollStatus();

    return () => {
      isCancelled = true;
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
// ✅ Should never render unless redirect fails
return (
  <div className="w-full h-screen flex items-center justify-center text-gray-500 text-sm">
    Translation complete. Redirecting...
  </div>
);
}
