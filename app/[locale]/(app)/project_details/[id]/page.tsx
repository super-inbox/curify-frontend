"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter, useParams } from "next/navigation";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import ExportDialog from "../../../_componentForPage/ExportDialog";
import { ProjectDetails } from "@/types/segments";
import { projectService } from "@/services/projects";
import { useSetAtom } from "jotai";
import { jobTypeAtom } from "@/app/atoms/atoms";
import { File } from "@/types/projects";

const TEXT_ONLY_JOB_TYPES = new Set(["video_transcript", "video_summarizer"]);

export default function ProjectDetailsPage() {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const router = useRouter();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFiles, setExportFiles] = useState<File[]>([]);
  const [modifiedSegments, setModifiedSegments] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const setJobType = useSetAtom(jobTypeAtom);

  const buildExportFiles = (data: ProjectDetails): File[] => {
    const extractFileName = (url: string) => {
      try {
        return decodeURIComponent(new URL(url).pathname.split("/").pop() || "download");
      } catch {
        return "download";
      }
    };

    const files: File[] = [];

    if (data.final_video_signed_url) {
      files.push({
        name: extractFileName(data.final_video_signed_url),
        type: "MP4",
        downloadUrl: data.final_video_signed_url,
      });
    }

    if (data.final_video_signed_url_withwatermark) {
      files.push({
        name: extractFileName(data.final_video_signed_url_withwatermark),
        type: "MP4",
        downloadUrl: data.final_video_signed_url_withwatermark,
      });
    }

    if (data.srt_signed_url) {
      files.push({
        name: extractFileName(data.srt_signed_url),
        type: "SRT",
        downloadUrl: data.srt_signed_url,
      });
    }

    if (data.txt_signed_url) {
      files.push({
        name: extractFileName(data.txt_signed_url),
        type: "TXT",
        downloadUrl: data.txt_signed_url,
      });
    }

    return files;
  };

  useEffect(() => {
    const loadProject = async () => {
      if (!id || typeof id !== "string") {
        console.error("Missing project id in route params");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const data = await projectService.getProject(id);
        setProjectDetails(data);
        setExportFiles(buildExportFiles(data));

        localStorage.setItem("selectedProjectDetails", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load project by id:", err);

        // fallback to cache only if it matches the same project id
        try {
          const cached = localStorage.getItem("selectedProjectDetails");
          if (cached) {
            const parsed = JSON.parse(cached) as ProjectDetails;
            if (parsed?.project_id === id) {
              setProjectDetails(parsed);
              setExportFiles(buildExportFiles(parsed));
            }
          }
        } catch (cacheErr) {
          console.error("Failed to parse project data from localStorage:", cacheErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const updateTranslation = (index: number, newText: string) => {
    if (!projectDetails) return;

    const updatedSegments = [...projectDetails.segments];
    updatedSegments[index].translated = newText;

    setProjectDetails({
      ...projectDetails,
      segments: updatedSegments,
    });

    setModifiedSegments((prev) => ({ ...prev, [index]: newText }));
  };

  const handleSave = () => {
    if (!projectDetails) return;
    localStorage.setItem("selectedProjectDetails", JSON.stringify(projectDetails));
    setStatusMessage("Change Saved");
  };

  const handleReprocess = async () => {
    if (!projectDetails) return;

    const updatedSegments = Object.entries(modifiedSegments).map(
      ([index, translatedUpdated]) => {
        const seg = projectDetails.segments[Number(index)];

        return {
          segment_id: seg.segment_id,
          line_number: seg.line_number,
          translated_updated: translatedUpdated,
          original_updated: null,
        };
      }
    );

    try {
      const res = await projectService.reprocessProjectWithSegments(
        projectDetails.project_id,
        updatedSegments
      );
      const projectId = "data" in res ? res.data.project_id : (res as any).project_id;

      setModifiedSegments({});
      setJobType("reprocessing");
      router.push(`/${locale}/magic/${projectId}/`);
    } catch (err) {
      console.error("Failed to send reprocess request:", err);
      alert("Error submitting reprocess request.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 pt-20 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors cursor-pointer"
          >
            <img src="/icons/arrow_left.svg" alt="Back" className="w-4 h-4" />
            Return to Workspace
          </Link>
        </div>
        <div className="text-gray-600">Loading project details...</div>
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <div className="min-h-screen bg-white p-6 pt-20 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors cursor-pointer"
          >
            <img src="/icons/arrow_left.svg" alt="Back" className="w-4 h-4" />
            Return to Workspace
          </Link>
        </div>
        <div className="text-red-600">Unable to load project details.</div>
      </div>
    );
  }

  // Text-only result page for transcript and summarizer jobs
  if (TEXT_ONLY_JOB_TYPES.has(projectDetails.job_type ?? "")) {
    const isTranscript = projectDetails.job_type === "video_transcript";
    const label = isTranscript ? "Transcript" : "Summary";

    return (
      <div className="min-h-screen bg-white p-6 pt-20 max-w-3xl mx-auto">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors cursor-pointer mb-8"
        >
          <img src="/icons/arrow_left.svg" alt="Back" className="w-4 h-4" />
          Return to Workspace
        </Link>

        <h1 className="text-2xl font-bold mb-1">{projectDetails.name}</h1>
        <p className="text-sm text-gray-500 mb-8">{label} ready</p>

        <div className="flex flex-col gap-4">
          {projectDetails.srt_signed_url && (
            <a
              href={projectDetails.srt_signed_url}
              download
              className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
            >
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-semibold text-neutral-800">Download SRT</p>
                <p className="text-xs text-neutral-500">Timestamped transcript file</p>
              </div>
            </a>
          )}
          {projectDetails.txt_signed_url && (
            <a
              href={projectDetails.txt_signed_url}
              download
              className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
            >
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-semibold text-neutral-800">Download TXT</p>
                <p className="text-xs text-neutral-500">Plain text {label.toLowerCase()}</p>
              </div>
            </a>
          )}
          {!projectDetails.srt_signed_url && !projectDetails.txt_signed_url && (
            <p className="text-gray-500">No files available yet. Please check back shortly.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white p-6 pt-20 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors cursor-pointer"
          >
            <img src="/icons/arrow_left.svg" alt="Back" className="w-4 h-4" />
            Return to Workspace
          </Link>

          <div className="flex items-center">
            <h2 className="text-2xl font-bold">Video Preview</h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          <div className="lg:w-2/3 w-full flex flex-col justify-between">
            <div>
              <div className="grid grid-cols-2 mb-2">
                <div className="bg-[#ede9fe] text-purple-800 font-semibold px-4 py-2 rounded-t-lg">
                  Auto Detect
                </div>
                <div className="bg-[#e0f2fe] text-sky-800 font-semibold px-4 py-2 rounded-t-lg">
                  Translated
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 bg-white text-sm">
                {projectDetails.segments
                  .sort((a, b) => a.segment_id - b.segment_id)
                  .map((seg, i) => {
                    const modified = modifiedSegments[i] !== undefined;

                    return (
                      <React.Fragment key={seg.line_number}>
                        <div className="px-4 py-1.5 whitespace-pre-line">{seg.original}</div>
                        <div
                          className={clsx(
                            "px-4 py-1.5 whitespace-pre-line border rounded-md focus:outline-none",
                            modified
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-transparent hover:border-gray-300"
                          )}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateTranslation(i, e.currentTarget.textContent || "")}
                        >
                          {seg.translated}
                        </div>
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mt-8">
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg text-base border border-blue-600 hover:bg-blue-50 cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={handleReprocess}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-base hover:bg-blue-700 cursor-pointer"
                >
                  Regenerate
                </button>
              </div>

              <div className="text-sm text-gray-600 mt-1">
                {Object.keys(modifiedSegments).length > 0
                  ? `${Object.keys(modifiedSegments).length} line(s) updated`
                  : "No changes yet"}
                {statusMessage && (
                  <span className="ml-2 text-green-600 font-medium">{statusMessage}</span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 w-full flex flex-col justify-between">
            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
                <Tab
                  className={({ selected }) =>
                    clsx("w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg", {
                      "bg-white shadow": selected,
                    })
                  }
                >
                  Original Video
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx("w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg", {
                      "bg-white shadow": selected,
                    })
                  }
                >
                  Translated Video
                </Tab>
              </Tab.List>

              <Tab.Panels className="mt-4">
                <Tab.Panel className="aspect-[16/9] relative bg-black rounded-xl overflow-hidden">
                  {projectDetails.original_video_signed_url ? (
                    <video
                      src={projectDetails.original_video_signed_url}
                      controls
                      className="absolute w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Original video not available
                    </div>
                  )}
                </Tab.Panel>

                <Tab.Panel className="aspect-[16/9] relative bg-black rounded-xl overflow-hidden">
                  {projectDetails.final_video_signed_url ? (
                    <video
                      src={projectDetails.final_video_signed_url}
                      controls
                      className="absolute w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Translated video not available
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setIsExportDialogOpen(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg text-base border border-blue-600 hover:bg-blue-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <img
                  src="/icons/output.svg"
                  alt="Export"
                  className="w-4 h-4"
                  style={{
                    filter:
                      "invert(34%) sepia(85%) saturate(3029%) hue-rotate(204deg) brightness(92%) contrast(92%)",
                  }}
                />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExportDialogOpen && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          files={exportFiles}
        />
      )}
    </>
  );
}