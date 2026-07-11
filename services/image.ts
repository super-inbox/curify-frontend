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

    // Bound the upload. The shared apiClient never applies its own timeout, so a
    // stalled /images/upload (e.g. the single web worker blocking on a slow GCS
    // write under several concurrent uploads — the product-video tool fires 3 at
    // once) would otherwise pend forever, leaving the caller's slot silently
    // "uploading" with no error and no result. Abort at 60s so a stall surfaces
    // as a retryable error instead of a stuck UI.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const res = await apiClient.request<{ data: ImageUploadResponse | null; message?: string }>(
        '/images/upload',
        { method: 'POST', body: formData, signal: controller.signal },
      );
      // The backend returns HTTP 200 even for validation failures (APIResponse
      // envelope carries data:null). Treat a missing blob_url as an error so an
      // upload never "succeeds" with an empty reference the generate step can't
      // use — which previously read as a stuck/unrecognized upload.
      if (!res?.data?.blob_url) {
        throw new Error(res?.message || "Upload didn't complete. Please try again.");
      }
      return res.data;
    } finally {
      clearTimeout(timer);
    }
  },
};
