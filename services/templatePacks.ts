// services/templatePacks.ts
import { apiClient } from "./api";

export interface TemplatePackDownloadRequest {
  template_id: string;
}

export interface TemplatePackDownloadResponse {
  success: boolean;
  message: string;
  download_url?: string;
}

export const templatePacksService = {
  async downloadPack(
    data: TemplatePackDownloadRequest
  ): Promise<TemplatePackDownloadResponse> {
    return apiClient.request<TemplatePackDownloadResponse>(
      "/template-packs/download",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};