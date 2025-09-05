import { apiClient } from './api';

export interface VideoUploadResponse {
  stored_filename: string;
  blob_url: string;
  video_id: string;
  thumbnail_signed_url?: string;
}

export const videoService = {
  async uploadVideo(file: File): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append("is_youtube_upload", "false");
    formData.append("video_file", file);

    return apiClient.request<VideoUploadResponse>('/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  async uploadYoutubeVideo(youtubeUrl: string): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append("is_youtube_upload", "true");
    formData.append("youtube_url", youtubeUrl);

    return apiClient.request<VideoUploadResponse>('/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }
};
