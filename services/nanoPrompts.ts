import { apiClient } from "./api";
import {
  NanoPrompt,
  NanoPromptBase,
  NanoPromptDetailResponse,
  NanoPromptListResponse,
} from "@/types/nanoPrompts";

export const nanoPromptsService = {
  async getNanoPrompt(id: string | number): Promise<NanoPrompt> {
    const response = await apiClient.request<NanoPromptDetailResponse>(
      `/nano_prompts/${id}`
    );
    return response.data;
  },

  async getMostPopularNanoPrompts(): Promise<NanoPromptBase[]> {
    const response = await apiClient.request<NanoPromptListResponse>(
      "/nano_prompts/most-popular"
    );
    return response.data;
  },

  async getNanoPromptsByTag(tag: string): Promise<NanoPromptBase[]> {
    const response = await apiClient.request<NanoPromptListResponse>(
      `/nano_prompts/tag/${encodeURIComponent(tag)}`
    );
    return response.data;
  },
};