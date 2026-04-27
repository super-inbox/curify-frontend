
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
| "nano_template_generation";


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
}

export interface File {
  name: string;
  type: string;
  downloadUrl: string;
  cost?: number;
}