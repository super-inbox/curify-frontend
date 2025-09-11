"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import { projectService } from "@/services/projects";
import { ProjectStatusUpdate, ProjectStatus } from "@/types/projects";
import { ProjectDetails } from "@/types/segments";

export default function Magic() {
  const { id } = useParams();
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
          setProjectDetails(fullProject);
        } else if (statusRes.status === "FAILED") {
          setError("Translation failed. Please try again.");
        } else {
          setTimeout(pollStatus, 3000); // keep polling
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (!isCancelled) {
          setTimeout(pollStatus, 5000); // backoff retry
        }
      }
    };

    pollStatus();

    return () => {
      isCancelled = true;
    };
  }, [projectId]);

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
    <div className="w-full h-screen p-10">
      <h2 className="text-xl font-semibold text-center mb-4">✅ Translation Complete</h2>
      <video
        src={projectDetails.translated_video_signed_url}
        controls
        className="mx-auto mt-6 max-w-xl rounded-xl shadow"
      />
    </div>
  );
}
