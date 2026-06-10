// services/image.ts
import { apiClient } from './api';

// Reference-image upload for image-to-image nano templates
// (requires_image_upload). Mirrors services/video.ts → /videos/upload.
// Backend endpoint: POST /images/upload (multipart) → { blob_url, image_id }.
export interface ImageUploadResponse {
  stored_filename?: string;
  blob_url: string;
  image_id: string;
}

export const imageService = {
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append("image_file", file);

    const res = await apiClient.request<{ data: ImageUploadResponse }>('/images/upload', {
      method: 'POST',
      body: formData,
    });

    return res.data;
  },
};
