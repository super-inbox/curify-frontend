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
  txt_signed_url?: string | null;
  segments: Segment[];
  // nano_template_generation projects
  image_path?: string | null;
  preview_image_path?: string | null;
  // True when the delivered file is the badged copy — image_path for an image
  // project, final_video_signed_url for a video one. Drives the "remove
  // watermark" affordance on both detail pages.
  watermarked?: boolean;
  job_type?: string | null;
  // Per-job flags the pipeline writes (asl_unverified, asl_low_confidence, ...).
  // GET /projects/{id} has always returned this — ProjectDetailsResponse carries it
  // — but the type never declared it, so it was discarded on arrival.
  runtime_config?: Record<string, unknown> | null;
}

export interface SegmentUpdate {
  segment_id?: number;
  line_number: number;
  original_updated?: string | null;
  translated_updated?: string | null;
}