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
    });

    return res.data;
  },

  // Lightweight metadata-only probe (no download) so the UI can show the
  // upfront "Credits Required" prompt + gate on credits BEFORE downloading the
  // whole video — parity with the uploaded-file flow.
  async getYoutubeMetadata(youtubeUrl: string): Promise<YoutubeMetadata> {
    const formData = new FormData();
    formData.append("youtube_url", youtubeUrl);

    const res = await apiClient.request<{ data: YoutubeMetadata }>('/videos/youtube-metadata', {
      method: 'POST',
      body: formData,
    });

    return res.data;
  }
};

export interface YoutubeMetadata {
  duration_seconds: number;
  title?: string;
  thumbnail?: string;
}

