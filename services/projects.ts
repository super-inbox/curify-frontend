import { apiClient } from './api';
import {
  Project,
  CreateProjectRequest,
  ProjectStatusUpdate,
  JobSettings
} from '@/types/projects';
import { ProjectDetails } from '@/types/segments';

// ✅ Interfaces must be top-level
export interface ProjectCreateResponse {
  project_id: string;
}

/** Result of spending credits to remove an image's watermark.
 *
 *  Mirrors the backend `UnlockCleanImageResponse`, which itself mirrors
 *  `TemplatePackDownloadResponse` so the paid-download UI handler is shared. */
export interface RemoveWatermarkResult {
  success: boolean;
  message: string;
  /** Signed URL of the clean master (60 min). Absent when success is false. */
  download_url?: string;
  /** "INSUFFICIENT_CREDITS" or "NEEDS_PURCHASED_CREDITS" on a
   *  200-with-success:false — prompt a top-up rather than surfacing an error.
   *  The second means the balance exists but is free signup credit, which does
   *  not cover watermark removal. */
  code?: string;
  points_required?: number;
  balance?: number;
  /** True when this project was already unlocked, or the account never gets a
   *  watermark in the first place. Either way nothing was charged. */
  already_owned?: boolean;
}

export const projectService = {
  // ✅ Get all projects for current user
  async getUserProjects(): Promise<Project[]> {
    return apiClient.request<Project[]>('/user/projects');
  },

  // ✅ Create new project
  async createProject(data: CreateProjectRequest): Promise<ProjectCreateResponse> {
    const payload = {
      name: data.project_name,
      description: data.description ?? "",
      job_settings: data.job_settings,
      runtime_params: data.runtime_params ?? {},
      is_production: data.is_production ?? true,
      video_id: data.video_id,
    };

    const response = await apiClient.request<{ data: ProjectCreateResponse }>(
      "/projects/translate",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // ✅ unwrap
  },

  // ✅ Get detailed project info (includes segments, settings, etc.)
  async getProject(projectId: string): Promise<ProjectDetails> {
    const response = await apiClient.request<{ data: ProjectDetails }>(
      `/projects/${projectId}`
    );
    return response.data;
  },

// ✅ Get live project status
async getProjectStatus(projectId: string): Promise<ProjectStatusUpdate> {
  const response = await apiClient.request<{ data: ProjectStatusUpdate }>(
    `/projects/${projectId}/status`
  );
  return response.data;
},


  // ✅ Spend credits to remove a project's watermark (image or video).
  //
  // INSUFFICIENT_CREDITS arrives as a 200 with success=false, not a 4xx — the
  // api client throws on any non-2xx, which would turn "top up to continue"
  // into an unhandled error. Same contract as templatePacksService.downloadPack.
  async removeWatermark(projectId: string): Promise<RemoveWatermarkResult> {
    return apiClient.request<RemoveWatermarkResult>(
      `/projects/${projectId}/unlock-clean`,
      { method: "POST" },
    );
  },

  // ✅ Delete a project
  async deleteProject(projectId: string): Promise<void> {
    return apiClient.request<void>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  // ✅ Download final translated video
  async downloadVideo(projectId: string): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/videos/${projectId}/download`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Download failed");
    }

    return response.blob();
  },

  async reprocessProjectWithSegments(
    projectId: string,
    updatedSegments: Array<{
      segment_id?: number;
      line_number: number;
      original_updated?: string | null;
      translated_updated?: string | null;
    }>
  ): Promise<{ data: { project_id: string } } | { project_id: string }> {
    return apiClient.request("/projects/reprocess", {
      method: "POST",
      body: JSON.stringify({
        project_id: projectId,
        updated_segments: updatedSegments,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
