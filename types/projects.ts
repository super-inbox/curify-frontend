// Enums to mirror backend choices
export type SubtitleFormat = 'none' | 'source' | 'target' | 'bilingual';
export type AudioOption = 'original' | 'dubbed' | 'premium';

// Job settings interface aligned with backend
export interface JobSettings {
  erase_original_subtitles: boolean;
  subtitles_enabled: SubtitleFormat;
  audio_option: AudioOption;
  allow_lip_syncing: boolean;
  speaker_count?: number;
  source_language?: string;
  target_language?: string;
}

// Main project interface matching backend response
export interface Project {
  project_id: string;
  project_name: string;
  status: 'processing' | 'completed' | 'failed' | 'queued' | 'pending';
  created_at: string; // ISO date string
  job_settings: JobSettings;
  project_duration_minutes: number;
  video_duration_seconds: number;
  final_video_signed_url?: string | null;
  final_video_signed_url_withwatermark?: string | null;
  thumbnail_signed_url?: string | null;
  srt_signed_url?: string | null;
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

// For polling or handling status updates
export interface ProjectStatusUpdate {
  project_id: string;
  status: Project['status'];
  progress?: number;
  message?: string;
}
