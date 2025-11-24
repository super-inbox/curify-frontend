'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import ExportDialog from "../../_componentForPage/ExportDialog";
import { ProjectDetails } from "@/types/segments";
import { projectService } from "@/services/projects";
import { useSetAtom } from "jotai";
import { jobTypeAtom } from "@/app/atoms/atoms";
import { File } from "@/types/projects";

export default function ProjectDetailsPage() {
  const { locale } = useParams();
  const router = useRouter(); 
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFiles, setExportFiles] = useState<File[]>([]);
  const [modifiedSegments, setModifiedSegments] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>("");

  const setJobType = useSetAtom(jobTypeAtom);

  useEffect(() => {
    const cached = localStorage.getItem("selectedProjectDetails");
    if (!cached) return;

    try {
      const data = JSON.parse(cached) as ProjectDetails;
      console.log("📦 Loaded cached project details:", data);

      setProjectDetails(data);

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
      setExportFiles(files);
    } catch (err) {
      console.error("Failed to parse project data from localStorage:", err);
    }
  }, []);

  const updateTranslation = (index: number, newText: string) => {
    if (!projectDetails) return;

    const updatedSegments = [...projectDetails.segments];
    updatedSegments[index].translated = newText;
    setProjectDetails({ ...projectDetails, segments: updatedSegments });

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
          original_updated: null        // do NOT send unchanged original
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
      setJobType("reprocessing"); // ✅ Set job type here
      router.push(`/${locale}/magic/${projectId}/`);

    } catch (err) {
      console.error("Failed to send reprocess request:", err);
      alert("Error submitting reprocess request.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white p-6 pt-20 flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/${locale}/workspace`}
            className="inline-flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors cursor-pointer"
          >
            <img src="/icons/arrow_left.svg" alt="Back" className="w-4 h-4" />
            Return to Workspace
          </Link>

          <div className="flex items-center">
            <h2 className="text-2xl font-bold">Video Preview</h2>
          </div>
        </div>

        {/* Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          {/* Left: Segments */}
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
                {projectDetails?.segments
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

          {/* Right: Video Preview */}
          <div className="lg:w-1/3 w-full flex flex-col justify-between">
            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg",
                      { "bg-white shadow": selected }
                    )
                  }
                >
                  Original Video
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg",
                      { "bg-white shadow": selected }
                    )
                  }
                >
                  Translated Video
                </Tab>
              </Tab.List>

              <Tab.Panels className="mt-4">
                <Tab.Panel className="aspect-[16/9] relative bg-black rounded-xl overflow-hidden">
                  {projectDetails?.original_video_signed_url ? (
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
                  {projectDetails?.final_video_signed_url ? (
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
