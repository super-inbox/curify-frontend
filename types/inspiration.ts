export interface InspirationCardDTO {
  id: string;
  lang: string;
  
  // Source
  source_text: string | null;
  source_title: string | null;
  source_platforms: string[];
  signal_source: string | null; // Coze signal

  // Classification
  subtitle: string | null; // Translation tag
  inspiration_tags: string[]; // Angles
  audiences: string[];

  // Output / Script
  output_title: string | null; // Hook
  output: string | null; // Script Body
  prompt: string | null; // Image prompt
  
  // Format
  video_format: string | null;
  video_duration_sec: number | null;

  // Metadata
  feedback: string | null;
  star_rating: number | null;
  scoring_reason: string | null;
  review_status: "DRAFT" | "APPROVED" | "REJECTED";

  image_url?: string | null;
  preview_image_url?: string | null; // optional if you have it

}

// The Clean UI Object
export interface InspirationCardUI {
  id: string;
  lang: string;
  
  signal: {
    summary: string;
    sources: { label: string }[];
  };

  translation: {
    tag?: string;
    angles: string[];
  };

  hook: {
    text: string;
  };

  production: {
    title: string;
    format?: string;
    beats: string[];
    durationSec?: number;
  };

  rating?: {
    score: number;
    reason: string;
  };

  // Pre-calculated clipboard text
  copyPayload: string; 
  shareUrl: string;

  visual?: {
    images?: { image_url: string; preview_image_url?: string; alt?: string }[];
  };
  actions?: {
    copy?: { payload?: string };
    share?: { url?: string };
  };
}