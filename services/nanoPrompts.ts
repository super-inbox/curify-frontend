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
    id: 629,
    title: "Japanese High School Student Snap Photo - Example 1",
    description: "Prompt from Japanese High School Student Snap Photo section of Awesome Nano Banana Pro",
    prompt:
      "A daily snapshot taken with a low-quality disposable camera. A clumsy photo taken by a Japanese high school student. (Aspect ratio 3:2 is recommended)",

    imageURL: "//images/G6z7gUVa0AMf1-G?format=jpg&name=small",
    tags: ["Illustration"],
  },
];
export const mockSingularPrompt: NanoPrompt = 
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
  }

export const nanoPromptsService = {
  async getNanoPrompt(id: string | number): Promise<NanoPrompt> {
    
    const response = await apiClient.request<NanoPromptDetailResponse>(
      `/nano_prompts/${id}`
    );
    return response.data;
   ////// return mockSingularPrompt;
  },

  async getMostPopularNanoPrompts(): Promise<NanoPrompt[]> {
    //uncomment below and get rid of uncommented line once done with mock data

    const response = await apiClient.request<NanoPromptListResponse>(                                                     
          "/nano_prompts/most-popular"                                                                                        
          );                                                                                                                    
         return response.data;
   // return mockMostPopularNanoPrompts;
  },

  async getNanoPromptsByTag(tag: string): Promise<NanoPrompt[]> {
    
    const response = await apiClient.request<NanoPromptListResponse>(
      `/nano_prompts/tag/${encodeURIComponent(tag)}`
    );
    return response.data;
   // return mockMostPopularNanoPrompts.filter((p) => p.tags.includes(tag));      
                                            },
}
