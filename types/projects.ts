import type { AslSuggestion } from "@/lib/failureActions";


// Enums to mirror backend choices
export type SubtitleFormat = 'none' | 'source' | 'target' | 'bilingual';
export type AudioOption = "dubbed" | "original" | "premium";

export type ProjectStatus =
  | "QUEUED"
  | "STARTED"
  | "PREPROCESSING"
  | "TRANSCRIBING"
  | "TRANSLATING"
  | "DUBBING"
  | "COMPLETED"
  | "FAILED";

export type BackendJobType =
| "subtitle_only"
| "full_translation"
| "srt_translator"
| "video_transcript"
| "video_summarizer"
| "speech_translator"
| "youtube_subtitles"
| "nano_template_generation"
| "asl_translation";   // ASL video → subtitles. Paid (8 credits/min), never on the free subtitle quota.


// Job settings interface aligned with backend
export interface JobSettings {
  job_type: BackendJobType;
  erase_original_subtitles: boolean;
  subtitles_enabled: SubtitleFormat;
  audio_option: AudioOption;
  allow_lip_syncing: boolean;
  speaker_count?: number;
  source_language?: string;
  target_language?: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  status: ProjectStatus;
  created_at: string; // ISO string
  job_settings: JobSettings;
  project_duration_minutes: number;
  video_duration_seconds: number;
  final_video_signed_url?: string | null;
  final_video_signed_url_withwatermark?: string | null;
  thumbnail_signed_url?: string | null;
  srt_signed_url?: string | null;
  txt_signed_url?: string | null;
  // nano_template_generation projects
  image_path?: string | null;
  preview_image_path?: string | null;
}

// For creating new projects via API
export interface CreateProjectRequest {
  video_id: string;
  project_name: string;
  description?: string;
  job_settings: JobSettings;
  runtime_params?: Record<string, any>;
  is_production?: boolean;
}

export interface ProjectStatusUpdate {
  project_id: string;
  status: ProjectStatus;
  updated_at?: string;
  progress?: number;
  message?: string;
  failure_code?: string | null;
  failure_reason?: string | null;
  // Populated by the backend only on FAILED.
  //
  // `retryable` is the exception class's own verdict on whether re-running the
  // identical job could succeed — it is not inferred from the code, so the UI
  // does not have to keep a list in sync. `asl_suggestion` is the reroute offer;
  // it is present on any no-speech failure of a video, not only when the ASL
  // detector fired (it has fired once, ever).
  retryable?: boolean | null;
  asl_suggestion?: AslSuggestion | null;
  job_type?: string | null;
}

export interface File {
  name: string;
  type: string;
  downloadUrl: string;
  cost?: number;
}