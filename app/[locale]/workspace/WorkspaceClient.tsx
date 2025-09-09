"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { modalAtom } from "@/app/atoms/atoms";
import CreateNewModal from "./CreateNewModal";
import { Project } from '@/types/projects';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import DeleteConfirmationDialog from "../_componentForPage/DeleteConfirmationDialog";
import { formatDuration } from "@/lib/format_utils";
import { projectService } from "@/services/projects";

export default function ProfileClientPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setModalState] = useAtom(modalAtom);
  const router = useRouter();
  const { locale } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("curifyUser");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as { projects: Project[] };
        setProjects(user.projects || []);
      } catch (err) {
        console.error("Failed to parse saved user:", err);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setMenuPosition(null);
    };

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const closeDeleteDialog = () => {
    setProjectToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await projectService.deleteProject(projectToDelete.project_id);

      const updatedProjects = projects.filter(
        (p) => p.project_id !== projectToDelete.project_id
      );
      setProjects(updatedProjects);

      const savedUser = localStorage.getItem("curifyUser");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.projects = updatedProjects;
        localStorage.setItem("curifyUser", JSON.stringify(parsed));
      }

      closeDeleteDialog();
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleMenuClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    projectId: string
  ) => {
    e.stopPropagation();

    if (openMenuId === projectId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      setOpenMenuId(projectId);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleProjectClick = async (projectId: string) => {
    try {
      const data = await projectService.getProject(projectId);

      if (!data) {
        throw new Error("Project not found.");
      }

      console.log("📦 Project Details API Response:", data);

      localStorage.setItem("selectedProjectDetails", JSON.stringify(data));
      router.push(`/${locale}/project_details/${projectId}`);
    } catch (err) {
      console.error("❌ Error loading project details:", err);
      alert("Unable to load project details. Please try again.");
    }
  };

  const tools = [
    {
      title: "Video Translation",
      desc: "Translate your video into any language with accurate localization and voice sync",
      status: "create",
      onClick: () => setModalState("add"),
    },
    {
      title: "Lip Syncing",
      desc: "Match lips to speech perfectly with AI-powered lip sync",
      status: "coming_soon",
      onClick: () => alert("Launch lip sync flow"),
    },
    {
      title: "Add Subtitles",
      desc: "Auto-generate multilingual subtitles to enhance clarity and accessibility",
      status: "create",
      onClick: () => setModalState("add"),
    },
    {
      title: "Remove Original Subtitles",
      desc: "Remove existing subtitles to make room for translation and custom captions",
      status: "coming_soon",
      onClick: () => alert("Launch subtitle removal flow"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
      <CreateNewModal />

      <button
        onClick={() => router.push(`/${locale}/profile`)}
        className="mb-6 px-4 py-2 border border-blue-500 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
      >
        ← Return to Profile
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="rounded-2xl shadow-lg p-5 flex flex-col justify-between
            bg-white bg-[linear-gradient(135deg,_#E0E7FF_0%,_#F0F4FF_100%)]
            border border-gray-100"
          >
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{tool.desc}</p>
            </div>
            {tool.status === "create" ? (
              <button
                onClick={tool.onClick}
                className="mt-4 w-full text-white px-4 py-2 rounded-lg font-bold
                bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] hover:opacity-90 transition-opacity duration-300
                shadow-lg cursor-pointer"
              >
                Create
              </button>
            ) : (
              <p className="mt-4 text-center text-blue-500 font-semibold italic text-lg">
                Coming Soon
              </p>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {projects.map((project) => {
          const duration = formatDuration(project.video_duration_seconds);
          const createdAt = format(new Date(project.created_at), "yyyy/MM/dd hh:mm a");

          return (
            <div
              key={project.project_id}
              className="border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-md transition relative"
            >
              <div
                onClick={() => handleProjectClick(project.project_id)}
                className="relative aspect-[4/3] w-full"
              >
                <Image
                  src="/images/mock-thumbnail.jpg"
                  alt={project.project_name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                  {project.job_settings.target_language.toUpperCase()} · Translated
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                  {duration}
                </div>
              </div>
              <div className="p-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm truncate">{project.project_name}</p>
                  <p className="text-xs text-gray-500">{createdAt}</p>
                </div>
                <button
                  onClick={(e) => handleMenuClick(e, project.project_id)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {openMenuId && menuPosition && (
        <div
          className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-40"
          style={{ top: menuPosition.y + 8, left: menuPosition.x }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const project = projects.find((p) => p.project_id === openMenuId);
              if (project) openDeleteDialog(project);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
          >
            Delete Project
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mt-12 mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {projects.map((project) => (
          <div
            key={`gallery-${project.project_id}`}
            className="border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/mock-thumbnail.jpg"
                alt={project.project_name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2">
              <p className="font-semibold text-sm truncate">{project.project_name}</p>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        projectName={projectToDelete?.project_name || ''}
      />
    </div>
  );
}
