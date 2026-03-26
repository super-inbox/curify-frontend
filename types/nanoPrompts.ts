export interface NanoPromptBase {
  id: number;
  title: string;
  description: string;
  prompt: string;
  imageURL: string;
  tags: string[];
}

/**
 * Detail-level prompt (used in /nano_prompts/{id})
 */
export interface NanoPrompt extends NanoPromptBase {
  related: NanoPromptBase[];
}

/**
 * Metadata for feeds / homepage
 */
export interface NanoPromptTagCount {
  tag: string;
  count: number;
}

export interface NanoPromptMetadata {
  totalPrompts: number;
  totalTags: number;
  updatedAt: string;
  topTags: NanoPromptTagCount[];
}

/**
 * Feed API response (/feeds or /feed)
 */
export interface NanoPromptFeedData {
  items: NanoPromptBase[];
  metadata: NanoPromptMetadata;
}

export interface NanoPromptFeedResponse {
  data: NanoPromptFeedData;
}

/**
 * Detail API response
 */
export interface NanoPromptDetailResponse {
  data: NanoPrompt;
}

/**
 * List API response (most-popular / tag)
 */
export interface NanoPromptListResponse {
  data: NanoPromptBase[];
}