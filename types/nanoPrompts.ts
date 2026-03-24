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