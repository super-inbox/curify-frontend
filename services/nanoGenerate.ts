import { apiClient } from "./api";

export interface NanoGenerateRequest {
  template_id: string;
  params: Record<string, string>;
  example_id: string;
  // image-to-image: blob_url of the uploaded reference image, for templates
  // with requires_image_upload. Backend threads it into the Gemini call.
  reference_image_url?: string;
}

export interface NanoGenerateResponse {
  success: boolean;
  // Async flow: poll /projects/{project_id}/status for the result.
  project_id?: string;
  // Legacy synchronous field (older backend) — async path leaves it null.
  signed_url?: string;
  message?: string;
}

export interface NanoProjectStatus {
  project_id: string;
  status: string; // STARTED | COMPLETED | FAILED | ...
  result_url?: string | null;
  failure_code?: string | null;
  failure_reason?: string | null;
}

export const nanoGenerateService = {
  async generate(
    data: NanoGenerateRequest,
    options: { locale?: string } = {},
  ): Promise<NanoGenerateResponse> {
    return apiClient.request<NanoGenerateResponse>("/nano-templates/generate", {
      method: "POST",
      headers: options.locale
        ? { "Accept-Language": options.locale }
        : undefined,
      body: JSON.stringify(data),
    });
  },

  // Poll the async generation's project status. Returns the inner data of the
  // APIResponse wrapper. Throws on 404/network (caller handles).
  async getProjectStatus(projectId: string): Promise<NanoProjectStatus> {
    const res = await apiClient.request<{ data: NanoProjectStatus }>(
      `/projects/${encodeURIComponent(projectId)}/status`,
      { method: "GET" }
    );
    return res.data;
  },
};
