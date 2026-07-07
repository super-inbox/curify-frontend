import { apiClient } from "./api";

// Structured product-video generation. Mirrors services/nanoGenerate.ts:
// generate() returns a project_id; poll /projects/{id}/status for the mp4.
export interface ProductVideoRequest {
  image_urls: string[];
  product_name: string;
  features: string[];
  price?: string;
  cta?: string;
}

export interface ProductVideoResponse {
  success: boolean;
  project_id?: string;
  message?: string;
}

export interface ProductVideoStatus {
  status: string; // STARTED | COMPLETED | FAILED | ...
  result_url?: string | null;
  failure_reason?: string | null;
  failure_code?: string | null;
}

export const productVideoService = {
  async generate(data: ProductVideoRequest): Promise<ProductVideoResponse> {
    return apiClient.request<ProductVideoResponse>("/product-video/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getStatus(projectId: string): Promise<ProductVideoStatus> {
    const res = await apiClient.request<{ data: ProductVideoStatus }>(
      `/projects/${encodeURIComponent(projectId)}/status`,
      { method: "GET" }
    );
    return res.data;
  },
};
