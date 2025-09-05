import { apiClient } from './api';
import { Project, CreateProjectRequest, ProjectStatusUpdate } from '@/types/projects';

export const projectService = {
  // Get user's projects
  async getUserProjects(): Promise<Project[]> {
    return apiClient.request<Project[]>('/user/projects');
  },

  // Create new translation project
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const formData = new FormData();
    formData.append('video_file', data.video_file);
    
    if (data.project_name) {
      formData.append('project_name', data.project_name);
    }
    
    // Append job settings
    formData.append('source_language', data.job_settings.source_language);
    formData.append('target_language', data.job_settings.target_language);
    
    if (data.job_settings.voice_settings) {
      Object.entries(data.job_settings.voice_settings).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`voice_${key}`, value.toString());
        }
      });
    }

    return apiClient.request<Project>('/projects/translate', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  },

  // Get single project details
  async getProject(projectId: string): Promise<Project> {
    return apiClient.request<Project>(`/projects/${projectId}`);
  },

  // Get project status
  async getProjectStatus(projectId: string): Promise<ProjectStatusUpdate> {
    return apiClient.request<ProjectStatusUpdate>(`/projects/${projectId}/status`);
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    return apiClient.request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // Download video
  async downloadVideo(projectId: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos/${projectId}/download`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    return response.blob();
  },

  // Reprocess project
  async reprocessProject(projectId: string, newSettings: Partial<JobSettings>): Promise<Project> {
    return apiClient.request<Project>('/projects/reprocess', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        job_settings: newSettings,
      }),
    });
  },
};