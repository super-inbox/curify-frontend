export interface Project {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'failed' | 'queued';
  source_language: string;
  target_language: string;
  created_at: string;
  updated_at: string;
  video_url?: string;
  translated_video_url?: string;
  progress?: number;
}

export interface TranslateRequest {
  video_file: File;
  source_language: string;
  target_language: string;
  voice_settings?: {
    voice_type: string;
    speed: number;
    pitch: number;
  };
}