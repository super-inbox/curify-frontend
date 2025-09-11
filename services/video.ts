// services/video.ts
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

    const res = await apiClient.request<{ data: VideoUploadResponse }>('/videos/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });

    return res.data;
  },

  async uploadYoutubeVideo(youtubeUrl: string): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append("is_youtube_upload", "true");
    formData.append("youtube_url", youtubeUrl);

    const res = await apiClient.request<{ data: VideoUploadResponse }>('/videos/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });

    return res.data;
  }
};
