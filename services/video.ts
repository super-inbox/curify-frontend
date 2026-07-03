// services/video.ts
import { apiClient } from './api';

export interface VideoUploadResponse {
  stored_filename: string;
  blob_url: string;
  video_id: string;
  thumbnail_signed_url?: string;
}

export const videoService = {
  // opts.isAudio marks the file as an audio-only upload (extracted audio track
  // or a raw audio file) for the audio-only tools — the backend then skips mp4
  // validation and stages the audio directly. See lib/extract_audio.ts.
  async uploadVideo(file: File, opts?: { isAudio?: boolean }): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append("is_youtube_upload", "false");
    if (opts?.isAudio) formData.append("is_audio_upload", "true");
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

