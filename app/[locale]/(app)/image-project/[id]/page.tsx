"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft, Sparkles } from "lucide-react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { projectService } from "@/services/projects";
import { ProjectDetails } from "@/types/segments";
import { CDN_BASE } from "@/lib/constants";
import { format } from "date-fns";

function toCdnFull(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CDN_BASE}/${path.replace(/^\//, "")}`;
}

export default function ImageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const locale = Array.isArray(params.locale) ? params.locale[0] : (params.locale as string);
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectService.getProject(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const fullImageUrl = toCdnFull(project?.image_path);
  const previewImageUrl = toCdnFull(project?.preview_image_path) ?? fullImageUrl;

  const handleDownload = async () => {
    if (!fullImageUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch(fullImageUrl);
      const blob = await res.blob();
      const ext = fullImageUrl.split(".").pop()?.split("?")[0] || "jpg";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${project?.name || "image"}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(fullImageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-neutral-200 rounded" />
          <div className="aspect-square bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-10 text-center">
        <p className="text-neutral-500">Project not found.</p>
        <Link href={`/${locale}/workspace`} className="mt-4 inline-block text-sm text-purple-600 hover:underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
      {/* Back */}
      <Link
        href={`/${locale}/workspace`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        My Workspace
      </Link>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!fullImageUrl || isDownloading}
            className="flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading…" : "Download"}
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 shadow-sm">
        {previewImageUrl ? (
          <CdnImage
            src={previewImageUrl}
            alt={project.name}
            width={1200}
            height={1200}
            className="w-full h-auto object-contain"
            unoptimized
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-neutral-300 text-sm">
            No image available
          </div>
        )}
      </div>
    </div>
  );
}
