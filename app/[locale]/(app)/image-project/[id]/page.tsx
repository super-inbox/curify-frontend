"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import ReproduceWorkbench from "@/app/[locale]/_components/ReproduceWorkbench";
import { projectService } from "@/services/projects";
import { ProjectDetails } from "@/types/segments";
import { CDN_BASE } from "@/lib/constants";

function toCdnFull(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CDN_BASE}/${path.replace(/^\//, "")}`;
}

/**
 * The centralized image workflow page (Phase 1) — see
 * docs/image-workflow-page-design-2026-07-11.md. A finished image project opens
 * in the shared 3-column workbench in "result" mode: column 1 shows the result,
 * column 3 (designer pack) lets the user keep producing on it. Column 2
 * (parametric regenerate) is a later phase (needs template/params from the API).
 */
export default function ImageProjectPage() {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : (params.locale as string);
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    projectService
      .getProject(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const fullImageUrl = toCdnFull(project?.image_path);
  const previewImageUrl = toCdnFull(project?.preview_image_path) ?? fullImageUrl;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-24">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-neutral-200" />
          <div className="aspect-square rounded-2xl bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (!project || !previewImageUrl) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-24 text-center">
        <p className="text-neutral-500">
          {project ? "No image available for this project." : "Project not found."}
        </p>
        <Link href="/workspace" className="mt-4 inline-block text-sm text-purple-600 hover:underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-6">
      <Link
        href="/workspace"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800"
      >
        <ArrowLeft className="h-4 w-4" />
        My Workspace
      </Link>

      <h1 className="mb-4 text-xl font-bold text-neutral-900">{project.name}</h1>

      <ReproduceWorkbench
        locale={locale}
        templateId=""
        parameters={[]}
        initialParams={{}}
        basePrompt=""
        allowGeneration={false}
        trackingContentId={project.project_id}
        col1={{
          mode: "result",
          resultUrl: fullImageUrl ?? previewImageUrl,
          downloadHref: fullImageUrl ?? previewImageUrl,
          title: project.name,
          image: (
            <CdnImage
              src={previewImageUrl}
              alt={project.name}
              width={1200}
              height={1200}
              className="h-full w-full object-contain"
              unoptimized
            />
          ),
        }}
      />
    </div>
  );
}
