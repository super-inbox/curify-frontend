export interface Segment {
  segment_id: number;
  line_number: number;
  original: string;
  translated: string;
  start: number;
  end: number;
  speaker?: string;
  post_edited?: string;
  speed?: number;
  target_duration?: number;
  created_at?: string;
}

export interface ProjectDetails {
  project_id: string;
  name: string;
  final_video_signed_url: string | null;
  original_video_signed_url: string | null;
  final_video_signed_url_withwatermark: string | null;
  srt_signed_url: string | null;
  segments: Segment[];
}

export interface SegmentUpdate {
  segment_id?: number;
  line_number: number;
  original_updated?: string | null;
  translated_updated?: string | null;
}