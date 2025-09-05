interface Project {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  video_url?: string;
}

interface TranslateRequest {
  video_file: File;
  source_language: string;
  target_language: string;
  voice_settings?: any;
}

export const projectService = {
  async getUserProjects(): Promise<Project[]> {
    return apiClient.request('/user/projects');
  },

  async translateVideo(data: TranslateRequest) {
    const formData = new FormData();
    formData.append('video_file', data.video_file);
    formData.append('source_language', data.source_language);
    formData.append('target_language', data.target_language);
    
    return apiClient.request('/projects/translate', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  },

  async getProject(id: string): Promise<Project> {
    return apiClient.request(`/projects/${id}`);
  },

  async getProjectStatus(id: string) {
    return apiClient.request(`/projects/${id}/status`);
  },

  async deleteProject(id: string) {
    return apiClient.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};