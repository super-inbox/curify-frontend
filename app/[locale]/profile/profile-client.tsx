"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";

type Project = {
  project_id: string;
  project_name: string;
  created_at: string;
  video_duration_seconds: number;
  thumbnail_signed_url: string;
  job_settings: {
    target_language: string;
  };
};

export default function ProfileClientPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch("/data/userInfo.json");
      const data = await res.json();
      setProjects(data.projects);
    };
    fetchProjects();
  }, []);

  const tools = [
    {
      title: "Video Dubbing",
      desc: "Translate voice to any language with native-like quality",
      color: "bg-[#6C63FF]",
      onClick: () => alert("Launch dubbing flow"),
    },
    {
      title: "Video Captioner",
      desc: "Generate or translate multilingual subtitles automatically",
      color: "bg-[#42A5F5]",
      onClick: () => alert("Launch captioner flow"),
    },
    {
      title: "Subtitle Remover",
      desc: "Remove on-screen subtitles to clean up the video",
      color: "bg-[#EF5350]",
      onClick: () => alert("Launch subtitle removal flow"),
    },
    {
      title: "Lip Syncing",
      desc: "Sync character lips to match dubbed speech naturally",
      color: "bg-[#AB47BC]",
      onClick: () => alert("Launch lip sync flow"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
      {/* Top Tool Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="rounded-2xl shadow-md p-4 bg-white flex flex-col justify-between border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{tool.desc}</p>
            <button
              onClick={tool.onClick}
              className={`text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition ${tool.color}`}
            >
              Create
            </button>
          </div>
        ))}
      </div>

      {/* Project History */}
      <h2 className="text-2xl font-bold mb-4">My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project) => {
          const duration = formatDuration(project.video_duration_seconds);
          const createdAt = format(new Date(project.created_at), "yyyy/MM/dd hh:mm a");

          return (
            <div
              key={project.project_id}
              onClick={() => router.push(`/project/${project.project_id}`)}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-md transition"
            >
              <div className="relative">
                <Image
                  src="/images/mock-thumbnail.jpg"
                  alt={project.project_name}
                  width={640}
                  height={360}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {project.job_settings.target_language.toUpperCase()} · Translated
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {duration}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{project.project_name}</p>
                <p className="text-xs text-gray-500">{createdAt}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
