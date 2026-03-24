import { apiClient } from "./api";

export interface NanoPrompt {
  id: number;
  title: string;
  description: string;
  prompt: string;
  imageURL: string;
  tags: string[];
}

export interface NanoPromptDetailResponse {
  data: NanoPrompt;
}

export interface NanoPromptListResponse {
  data: NanoPrompt[];
}

export const mockMostPopularNanoPrompts: NanoPrompt[] = [
  {
    id: 4319,
    title: "Grok: The Futuristic Cyborg Redefining AI Visuals",
    description:
      "Behold a sleek black matte cyborg, its striking neon aura illuminating advanced laser optics. Grok stands at the forefront of AI with unmatched precision.",
    prompt:
      "A sleek black futuristic cyborg with a humanoid form, standing against a yellow background, is illuminated by neon lights that accentuate its mechanical components.",
    imageURL:
      "/images/45658b99d089618b244c024b1ea93cc9_thumb_1762921242171.jpg",
    tags: ["Illustration"],
  },
  {
    id: 5120,
    title: "Minimalist Fashion Portrait for Editorial Campaigns",
    description:
      "A clean high-fashion portrait prompt for modern editorial shoots with controlled lighting and strong silhouette contrast.",
    prompt:
      "Create a minimalist editorial fashion portrait of a model in a monochrome outfit, standing against a plain studio backdrop.",
    imageURL: "/images/mock-fashion-editorial.jpg",
    tags: ["Fashion", "Portrait"],
  },
];

export const nanoPromptsService = {
  async getNanoPrompt(id: string | number): Promise<NanoPrompt> {
    const response = await apiClient.request<NanoPromptDetailResponse>(
      `/nano_prompts/${id}`
    );
    return response.data;
  },

  async getMostPopularNanoPrompts(): Promise<NanoPrompt[]> {
    const response = await apiClient.request<NanoPromptListResponse>(
      "/nano_prompts/most-popular"
    );
    return response.data;
  },

  async getNanoPromptsByTag(tag: string): Promise<NanoPrompt[]> {
    const response = await apiClient.request<NanoPromptListResponse>(
      `/nano_prompts/tag/${encodeURIComponent(tag)}`
    );
    return response.data;
  },
};