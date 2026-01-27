// api/inspirationService.ts
import { apiClient } from "./api";

/**
 * This matches exactly what /inspiration/cards returns
 * (based on your provided sample)
 */
export interface InspirationCardDTO {
  id: string;
  group_id: string;
  variant_rank: number | null;

  source_type: "TEXT" | "URL";
  source_url: string | null;
  source_text: string | null;
  source_title: string | null;
  source_domain: string | null;
  source_published_at: string | null;

  lang: string;

  creator_style: string | null;
  content_type: string | null;

  prompt: string | null;

  output: string | null;
  output_title: string | null;

  preview_image_url: string | null;
  preview_images: string[];

  subtitle: string | null;

  source_platforms: string[];
  inspiration_tags: string[];

  video_format: string | null;
  video_duration_sec: number | null;

  audiences: string[];
  feedback: string | null;

  quality_score: number | null;
  review_status: string | null;
  status: "DRAFT" | "PUBLISHED" | string;

  curated_by: string | null;
  curated_at: string | null;
  curation_note: string | null;

  copy_text: string | null;
  copy_count: number;
  view_count: number;

  generated_by: string | null;
  generator: string | null;
  gen_version: string | null;

  created_at: string;
  updated_at: string;
}

export const inspirationService = {
  /**
   * Fetch all inspiration cards
   * MVP: no params, no pagination
   */
  async getCards(): Promise<InspirationCardDTO[]> {
    return apiClient.request<InspirationCardDTO[]>(
      "/inspiration/cards",
      {
        method: "GET",
      }
    );
  },
};
