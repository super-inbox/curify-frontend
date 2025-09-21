"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { modalAtom, jobTypeAtom } from "@/app/atoms/atoms";
import CreateNewModal from "./CreateNewModal";
import { Project } from "@/types/projects";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import DeleteConfirmationDialog from "../_componentForPage/DeleteConfirmationDialog";
import { formatDuration } from "@/lib/format_utils";
import { projectService } from "@/services/projects";
import { authService } from "@/services/auth";

export default function ProfileClientPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setModalState] = useAtom(modalAtom);
  const [, setJobType] = useAtom(jobTypeAtom);
  const router = useRouter();
  const { locale } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
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

  // useEffect(() => {
  //   refreshUser();
  // }, [refreshUser]);

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

  const openModal = (mode: 'translation' | 'subtitles') => {
    setJobType(mode);
    setModalState("add");
  };

  const tools = [
    {
      title: "Video Translation",
      desc: "Translate your video into any language with accurate localization and voice sync",
      status: "create",
      onClick: () => openModal('translation'),
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
      onClick: () => openModal('subtitles'),
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
{/* Top Tool Buttons */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
  {tools.map((tool) => (
    <div
      key={tool.title}
      className="rounded-2xl shadow-lg p-5 flex flex-col justify-between
      bg-white bg-[linear-gradient(135deg,_#E0E7FF_0%,_#F0F4FF_100%)]
      border border-gray-100"
      // ✨ Removed cursor-pointer from the card
    >
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {tool.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {tool.desc}
        </p>
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


{/* My Projects History */}
<h2 className="text-2xl font-bold mb-4">My Projects</h2>

{isRefreshing && (
  <div className="mb-4 inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm">
    🔄 Refreshing...
  </div>
)}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
  {projects.map((project) => {
    const duration = formatDuration(project.video_duration_seconds);
    const createdAt = format(new Date(project.created_at), "yyyy/MM/dd hh:mm a");

    return (
      <div
        key={project.project_id}
        onClick={() => router.push(`/project/${project.project_id}`)}
        className="border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-md transition"
      >
        <div className="relative">
          <Image
            src="/images/mock-thumbnail.jpg"
            alt={project.project_name}
            width={640}
            height={360}
            className="w-full h-auto object-cover"
          />
          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
            {project.job_settings.target_language?.toUpperCase() ?? ""} · Translated
          </div>
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
            {duration}
          </div>
        </div>
        <div className="p-2">
          <p className="font-semibold text-sm truncate">{project.project_name}</p>
          <p className="text-xs text-gray-500">{createdAt}</p>
        </div>
      </div>
    );
  })}
</div>

      {/* Gallery Section */}
      <h2 className="text-2xl font-bold mt-12 mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {projects.map((project) => (
          <div
            key={`gallery-${project.project_id}`}
            className="border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white"
          >
            <div className="relative">
              <Image
                src="/images/mock-thumbnail.jpg"
                alt={project.project_name}
                width={640}
                height={360}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="p-2">
              <p className="font-semibold text-sm truncate">{project.project_name}</p>
            </div>
          </div>
        ))}
      </div>

      <CreateNewModal />

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {}} // Add actual logic here if needed
        projectName={projectToDelete?.project_name || ''}
      />
    </div>
  );
}
