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
    return apiClient.request<ProjectStatusUpdate>(
      `/projects/${projectId}/status`
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
  ): Promise<{ project_id: string }> {
    return apiClient.request<{ project_id: string }>("/projects/reprocess", {
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
