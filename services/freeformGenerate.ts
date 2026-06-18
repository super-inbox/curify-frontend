import { apiClient } from "./api";

// Freeform image generation: user-edited prompt (+ optional reference image)
// → image. Mirrors services/nanoGenerate.ts but does not require a template_id.
// Used by the gallery [id] remix surface. Backend dispatches via
// JobType.NANO_FREEFORM_GENERATION; outputs land at images/nano_freeform/<id>.
export interface FreeformGenerateRequest {
  prompt: string;
  // GCS object path (or http URL) returned by POST /images/upload. Optional —
  // when omitted, runs as text-to-image; when present, image-to-image.
  reference_image_url?: string;
  // Source gallery prompt id the user remixed from. Stored on the project so
  // admin can compute remix → conversion funnels by source. Optional.
  source_prompt_id?: string;
}

export interface FreeformGenerateResponse {
  success: boolean;
  // Async flow: poll /projects/{project_id}/status for the result.
  project_id?: string;
  message?: string;
}

export const freeformGenerateService = {
  async generate(data: FreeformGenerateRequest): Promise<FreeformGenerateResponse> {
    return apiClient.request<FreeformGenerateResponse>("/nano-freeform/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
