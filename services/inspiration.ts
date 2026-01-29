// api/inspiration.ts
import { apiClient } from "./api";

/**
 * Updated DTO matching the new backend schema with:
 * - Removed 'status' field (now only review_status)
 * - Added signal_source, star_rating, scoring_reason
 * - review_status values: DRAFT | APPROVED | REJECTED
 */
export interface InspirationCardDTO {
  id: string;
  group_id: string;
  variant_rank: number | null;

  // Source information
  source_type: "TEXT" | "URL";
  source_url: string | null;
  source_text: string | null;
  source_title: string | null;
  source_domain: string | null;
  source_published_at: string | null;

  lang: string;

  // Content metadata
  creator_style: string | null;
  content_type: string | null;

  // Generated content
  prompt: string | null;  // Maps to image_prompt from Coze
  output: string | null;  // Maps to script_body from Coze
  output_title: string | null;

  preview_image_url: string | null;
  preview_images: string[];

  subtitle: string | null;

  // Rich metadata
  source_platforms: string[];
  inspiration_tags: string[];

  video_format: string | null;
  video_duration_sec: number | null;

  // NEW: Signal source from Coze
  signal_source: string | null;

  // Audience and feedback
  audiences: string[];
  feedback: string | null;

  // Quality metrics
  quality_score: number | null;  // Legacy field
  star_rating: number | null;  // NEW: AI-generated rating (0-5)
  scoring_reason: string | null;  // NEW: Rating explanation

  // Review status (SIMPLIFIED - no more 'status' field)
  review_status: "DRAFT" | "APPROVED" | "REJECTED";

  // Curation metadata
  curated_by: string | null;
  curated_at: string | null;
  curation_note: string | null;

  // Usage tracking
  copy_text: string | null;
  copy_count: number;
  view_count: number;

  // Generation metadata
  generated_by: string | null;
  generator: string | null;
  gen_version: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export const inspirationService = {
  /**
   * Fetch inspiration cards
   * @param params.review_status - Filter by DRAFT | APPROVED | REJECTED
   * @param params.lang - Filter by language
   * @param params.min_rating - Filter by minimum star rating (0-5)
   */
  async getCards(params?: {
    review_status?: "DRAFT" | "APPROVED" | "REJECTED";
    lang?: string;
    min_rating?: number;
    limit?: number;
    offset?: number;
  }): Promise<InspirationCardDTO[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.review_status) {
      queryParams.append("review_status", params.review_status);
    }
    if (params?.lang) {
      queryParams.append("lang", params.lang);
    }
    if (params?.min_rating !== undefined) {
      queryParams.append("min_rating", params.min_rating.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append("offset", params.offset.toString());
    }

    const url = `/inspiration/cards${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    return apiClient.request<InspirationCardDTO[]>(url, {
      method: "GET",
    });
  },

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    draft: number;
    approved: number;
    avg_rating?: number;
  }> {
    return apiClient.request("/inspiration/stats", {
      method: "GET",
    });
  },
};