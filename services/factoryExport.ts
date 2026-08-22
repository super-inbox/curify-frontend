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
// Re-exported, NOT redefined. These three used to be declared here with their
// own literals, which is how the UI kept rendering "20 credits" on 2026-08-21
// after lib/pricing.ts and the backend had both moved to 190 — the pricing test
// only guards lib/pricing.ts, so a second copy drifts silently. lib/pricing.ts
// is the single source of truth for anything shown to a user.
export {
  STICKER_EXPORT_CREDITS,
  ACRYLIC_EXPORT_CREDITS,
  PACKAGING_MOCKUP_CREDITS,
  USD_PER_CREDIT,
} from "@/lib/pricing";

export interface StickerExportRequest {
  /** blob_url from the image upload — a bucket object path, not a data URL. */
  image_url: string;
  /** Longest physical side, mm. Backend bounds this to 10–500. */
  mm?: number;
  dpi?: number;
  /** Die-cut offset from the silhouette, mm. */
  cut_mm?: number;
}

export interface AcrylicExportRequest {
  image_url: string;
  mm?: number;
  dpi?: number;
  cut_mm?: number;
  /** Keychain hole diameter, mm. Backend bounds 2–12. */
  hole_mm?: number;
  thickness_mm?: number;
  /** Emit a hole at all; refused server-side if no legal position exists. */
  hole?: boolean;
}

export interface PackagingMockupRequest {
  /** Dieline. See the note on the form: the upload path is image-only today. */
  image_url: string;
  w_mm: number;
  h_mm: number;
  d_mm: number;
  angle?: "45" | "front";
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

  async acrylicExport(data: AcrylicExportRequest): Promise<FactoryExportResponse> {
    return apiClient.request<FactoryExportResponse>("/design-tools/acrylic-export", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async packagingMockup(data: PackagingMockupRequest): Promise<FactoryExportResponse> {
    return apiClient.request<FactoryExportResponse>("/design-tools/packaging-mockup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** The export writes a ZIP, but status polling is identical to generation. */
  getProjectStatus(projectId: string): Promise<NanoProjectStatus> {
    return nanoGenerateService.getProjectStatus(projectId);
  },
};
