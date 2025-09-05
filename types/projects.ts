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

// Job settings interface
export interface JobSettings {
  source_language: string;
  target_language: string;
  voice_settings?: VoiceSettings;
  translation_settings?: TranslationSettings;
  video_settings?: VideoSettings;
}

export interface VoiceSettings {
  voice_type?: string;
  voice_id?: string;
  speed?: number;
  pitch?: number;
  stability?: number;
  similarity_boost?: number;
}

export interface TranslationSettings {
  translation_model?: string;
  preserve_timing?: boolean;
  max_characters_per_subtitle?: number;
}

export interface VideoSettings {
  output_format?: string;
  quality?: string;
  watermark_enabled?: boolean;
}

// Computed project data
export interface ProjectComputedData {
  isCompleted: boolean;
  hasVideo: boolean;
  hasWatermarkedVideo: boolean;
  hasThumbnail: boolean;
  hasSubtitles: boolean;
  durationFormatted: string;
  statusColor: string;
  canDownload: boolean;
}

// For creating new projects
export interface CreateProjectRequest {
  video_file: File;
  project_name?: string;
  job_settings: JobSettings;
}

// Project status update
export interface ProjectStatusUpdate {
  project_id: string;
  status: Project['status'];
  progress?: number;
  message?: string;
}

// Legacy interface for backward compatibility
export interface LegacyProject {
  id: string;
  name: string;
  status: string;
  source_language: string;
  target_language: string;
  created_at: string;
  video_url?: string;
}