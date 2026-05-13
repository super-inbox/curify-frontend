import { apiClient } from "./api";
import {
  NanoPrompt,
  NanoPromptBase,
  NanoPromptDetailResponse,
  NanoPromptListResponse,
} from "@/types/nanoPrompts";

// Revalidate windows tuned by data freshness:
//   - per-id detail: practically immutable (text + image authored once),
//     revalidate every 30 days as a safety net. Use revalidateTag from
//     the admin approve/edit flow for on-demand busting.
//   - most-popular and per-tag lists: refreshes when new prompts are
//     approved; 24 hours is the right ceiling for that drift, plus the
//     'nano_prompts' tag for explicit invalidation.
const REVALIDATE_DETAIL_SEC = 60 * 60 * 24 * 30;  // 30 days
const REVALIDATE_LIST_SEC = 60 * 60 * 24;         // 24 hours

export const nanoPromptsService = {
  async getNanoPrompt(id: string | number): Promise<NanoPrompt> {
    const response = await apiClient.request<NanoPromptDetailResponse>(
      `/nano_prompts/${id}`,
      {
        next: {
          revalidate: REVALIDATE_DETAIL_SEC,
          tags: ["nano_prompts", `nano_prompt:${id}`],
        },
      }
    );
    return response.data;
  },

  async getMostPopularNanoPrompts(): Promise<NanoPromptBase[]> {
    const response = await apiClient.request<NanoPromptListResponse>(
      "/nano_prompts/most-popular",
      {
        next: {
          revalidate: REVALIDATE_LIST_SEC,
          tags: ["nano_prompts", "nano_prompts:most_popular"],
        },
      }
    );
    return response.data;
  },

  async getNanoPromptsByTag(tag: string): Promise<NanoPromptBase[]> {
    const response = await apiClient.request<NanoPromptListResponse>(
      `/nano_prompts/tag/${encodeURIComponent(tag)}`,
      {
        next: {
          revalidate: REVALIDATE_LIST_SEC,
          tags: ["nano_prompts", `nano_prompts:tag:${tag}`],
        },
      }
    );
    return response.data;
  },
};