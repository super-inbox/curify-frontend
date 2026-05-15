import { apiClient } from "./api";

// Response shape from the anonymous backend endpoint. The signed Azure
// URL has a short TTL (5 min by default) — never persist it client-side.
export type EtsyPackDownloadResponse = {
  signed_url: string;
  expires_at: string; // ISO 8601
  sku: string;
  version: number;
};

export const etsyPacksService = {
  /**
   * Fetch a short-lived signed Azure URL for the given SKU pack.
   *
   * Anonymous (no auth header). The backend rate-limits by IP and logs
   * each call for funnel analytics. Optional `code` is the per-Etsy-
   * listing attribution tag (e.g. ETSY-MBTI) — passed through to the
   * server log only, not used for authorization. Optional `token` is
   * the per-SKU secret when the registry entry sets one; null in v1.
   */
  async getDownloadUrl(
    sku: string,
    opts: { code?: string | null; token?: string | null } = {}
  ): Promise<EtsyPackDownloadResponse> {
    const params = new URLSearchParams();
    if (opts.code) params.set("c", opts.code);
    if (opts.token) params.set("t", opts.token);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.request<EtsyPackDownloadResponse>(
      `/etsy_packs/${encodeURIComponent(sku)}/download${qs}`
    );
  },
};
