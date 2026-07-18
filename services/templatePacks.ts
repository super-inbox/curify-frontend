// services/templatePacks.ts
import { apiClient } from "./api";

export interface TemplatePackDownloadRequest {
  template_id: string;
  /** Pack size: 5 = free sampler; 50 / 100 = paid (points). Defaults to 5. */
  size?: 5 | 50 | 100;
  /** "zip" (legacy pack) or "pdf" (a print-ready PDF of the pack images). */
  format?: "zip" | "pdf";
}

export interface TemplatePackDownloadResponse {
  success: boolean;
  message: string;
  download_url?: string;
  /** Set to "INSUFFICIENT_CREDITS" (on a 200-with-success:false) when a paid pack
   *  can't be afforded — the caller should prompt a top-up rather than error. */
  code?: string;
  /** Points the paid pack costs (present with INSUFFICIENT_CREDITS). */
  points_required?: number;
  /** The user's current points balance (present with INSUFFICIENT_CREDITS). */
  balance?: number;
  /** True when a paid pack was already purchased (free re-download, no charge). */
  already_owned?: boolean;
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