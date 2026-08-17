import { apiClient } from "./api";
import { nanoGenerateService, type NanoProjectStatus } from "./nanoGenerate";

/**
 * Factory-file exports (design → manufacturing).
 *
 * Same async shape as nano generation — 202 + project_id, then poll
 * /projects/{id}/status — so the polling helper is reused rather than
 * reimplemented. These endpoints charge credits and deduct only AFTER the
 * artifact exists, so a failed run costs the user nothing.
 */
export const STICKER_EXPORT_CREDITS = 20;

export interface StickerExportRequest {
  /** blob_url from the image upload — a bucket object path, not a data URL. */
  image_url: string;
  /** Longest physical side, mm. Backend bounds this to 10–500. */
  mm?: number;
  dpi?: number;
  /** Die-cut offset from the silhouette, mm. */
  cut_mm?: number;
}

export interface FactoryExportResponse {
  success: boolean;
  project_id?: string;
  message?: string;
  cost_credits?: number;
}

export const factoryExportService = {
  async stickerExport(data: StickerExportRequest): Promise<FactoryExportResponse> {
    return apiClient.request<FactoryExportResponse>("/design-tools/sticker-export", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** The export writes a ZIP, but status polling is identical to generation. */
  getProjectStatus(projectId: string): Promise<NanoProjectStatus> {
    return nanoGenerateService.getProjectStatus(projectId);
  },
};
