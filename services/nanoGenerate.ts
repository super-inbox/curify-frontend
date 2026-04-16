import { apiClient } from "./api";

export interface NanoGenerateRequest {
  template_id: string;
  params: Record<string, string>;
  example_id: string;
}

export interface NanoGenerateResponse {
  success: boolean;
  signed_url?: string;
  message?: string;
}

export const nanoGenerateService = {
  async generate(data: NanoGenerateRequest): Promise<NanoGenerateResponse> {
    return apiClient.request<NanoGenerateResponse>("/nano-templates/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
