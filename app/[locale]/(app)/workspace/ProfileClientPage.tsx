"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import CreateNewModal from "../..//(public)/tools/CreateNewModal";
import { Project } from "@/types/projects";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import DeleteConfirmationDialog from "../../_componentForPage/DeleteConfirmationDialog";
import { formatDuration } from "@/lib/format_utils";
import { projectService } from "@/services/projects";
import { authService } from "@/services/auth";
import GalleryGrid from "../../_componentForPage/GalleryGrid";

export default function ProfileClientPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setModalState] = useAtom(modalAtom);
  const [, setJobType] = useAtom(jobTypeAtom);

  const router = useRouter();
  const { locale } = useParams();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const profile = await authService.getProfile();
      if (Array.isArray(profile?.projects)) {
        setProjects(profile.projects);
        localStorage.setItem("curifyUser", JSON.stringify(profile));
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("⚠️ Failed to refresh user profile:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromAuth = searchParams.get("fromLocalStorage") === "true";

    if (fromAuth) {
      const savedUser = localStorage.getItem("curifyUser");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (Array.isArray(parsed.projects)) {
            setProjects(parsed.projects);
          }
        } catch (err) {
          console.error("❌ Failed to parse cached user:", err);
        }
      }
    } else {
      refreshUser();
    }
  }, [refreshUser]);

  // (Optional) If you still need these atoms here for other UI:
  // kept to avoid unused warnings if you later call them again.
  const openModal = useCallback(
    (mode: "translation" | "subtitles") => {
      setJobType(mode);
      setModalState("add");
    },
    [setJobType, setModalState]
  );
  void openModal; // prevents lint unused if not used now

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
      {/* Tools section extracted */}
      <ToolsClient />

      <h2 className="text-2xl font-bold mb-4">My Projects</h2>

      {isRefreshing && (
        <div className="mb-4 inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm">
          🔄 Refreshing...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {projects.map((project) => {
          const duration = formatDuration(project.video_duration_seconds);
          const createdAt = format(new Date(project.created_at), "yyyy/MM/dd hh:mm a");

          return (
            <div
              key={project.project_id}
              onClick={async () => {
                if (openMenuId) return;

                if (project.status === "COMPLETED") {
                  try {
                    const fullProject = await projectService.getProject(project.project_id);
                    localStorage.setItem("selectedProjectDetails", JSON.stringify(fullProject));
                    router.push(`/${locale}/project_details/${project.project_id}`);
                  } catch (err) {
                    console.error("❌ Failed to fetch full project:", err);
                  }
                } else {
                  router.push(`/${locale}/magic/${project.project_id}`);
                }
              }}
              className="relative border border-gray-200 rounded-lg overflow-visible shadow-md bg-white cursor-pointer transform scale-[1.05] hover:scale-[1.08] transition"
            >
              <div className="relative w-full aspect-video bg-gray-100">
                <Image
                  src={project.thumbnail_signed_url || "/mock-thumbnail.jpg"}
                  alt={project.project_name}
                  fill
                  className="object-cover"
                />

                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
                  {project.job_settings.target_language?.toUpperCase() ?? ""} · {formatStatus(project.status)}
                </div>

                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
                  {duration}
                </div>
              </div>

              <div className="p-3 flex-1 min-w-0 justify-between items-start relative z-10">
                <div>
                  <p className="font-semibold text-[15px] truncate block w-full">{project.project_name}</p>
                  <p className="text-sm text-gray-500">{createdAt}</p>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === project.project_id ? null : project.project_id);
                  }}
                  className="absolute bottom-2 right-2 z-50"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />

                  {openMenuId === project.project_id && (
                    <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-[9999] text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setIsDeleteDialogOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                        type="button"
                      >
                        Delete project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">Gallery</h2>
      <GalleryGrid />

      <CreateNewModal />

      {projectToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setProjectToDelete(null);
          }}
          projectId={projectToDelete.project_id}
        />
      )}
    </div>
  );
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
