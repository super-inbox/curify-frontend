"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { modalAtom, jobTypeAtom, userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";
import CreateNewModal from "../..//(public)/tools/CreateNewModal";
import { Project } from "@/types/projects";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import DeleteConfirmationDialog from "../../_componentForPage/DeleteConfirmationDialog";
import { formatDuration } from "@/lib/format_utils";
import { projectService } from "@/services/projects";
import { authService } from "@/services/auth";
import GalleryGrid from "../../_componentForPage/GalleryGrid";

export default function WorkspaceClient() {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [, setModalState] = useAtom(modalAtom);
  const [, setJobType] = useAtom(jobTypeAtom);
  const [clientMounted] = useAtom(clientMountedAtom);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const router = useRouter();

  const refreshProjects = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const profile = await authService.getProfile();
      if (Array.isArray(profile?.projects)) {
        setProjects(profile.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to refresh projects:", err);
      setProjects([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (clientMounted && user) {
      refreshProjects();
    }
  }, [clientMounted, user, refreshProjects]);

  const openModal = useCallback(
    (mode: "translation" | "subtitles") => {
      setJobType(mode);
      setModalState("add");
    },
    [setJobType, setModalState]
  );

  if (!clientMounted) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md bg-white">
                <div className="aspect-video bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-28 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="text-5xl">🎬</div>
          <h2 className="text-2xl font-bold text-[var(--c1)]">
            Sign in to access your workspace
          </h2>
          <p className="text-[var(--c2)] max-w-md">
            Create and manage your AI-translated video projects, track progress,
            and download results — all in one place.
          </p>
          <button
            onClick={() => setDrawerState("signin")}
            className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] text-white font-semibold hover:opacity-90 transition shadow-lg"
          >
            Sign in with Google
          </button>
        </div>

        <h2 className="text-2xl font-bold mt-4 mb-4">Gallery</h2>
        <GalleryGrid />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
      <h2 className="text-2xl font-bold mb-4">My Projects</h2>

      {isRefreshing && (
        <div className="mb-4 inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm">
          🔄 Refreshing...
        </div>
      )}

      {!isRefreshing && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center text-[var(--c2)]">
          <div className="text-4xl">📂</div>
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm max-w-xs">
            Create your first AI-translated video to get started.
          </p>
          <button
            onClick={() => openModal("translation")}
            className="mt-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] text-white font-semibold hover:opacity-90 transition shadow-md"
          >
            Create New Project
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {projects.map((project) => {
          const duration = formatDuration(project.video_duration_seconds);
          const createdAt = format(new Date(project.created_at), "yyyy/MM/dd hh:mm a");

          return (
            <div
              key={project.project_id}
              onClick={() => {
                if (openMenuId) return;

                if (project.status === "COMPLETED") {
                  router.push(`/project_details/${project.project_id}`);
                } else {
                  router.push(`/magic/${project.project_id}`);
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
                  {project.job_settings.target_language?.toUpperCase() ?? ""} ·{" "}
                  {formatStatus(project.status)}
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
                  {duration}
                </div>
              </div>

              <div className="p-3 flex-1 min-w-0 justify-between items-start relative z-10">
                <div>
                  <p className="font-semibold text-[15px] truncate block w-full">
                    {project.project_name}
                  </p>
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