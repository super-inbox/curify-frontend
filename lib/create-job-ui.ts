// lib/create-job-ui.ts
import type { AudioOption, BackendJobType } from "@/types/projects";

export type UiConfig = {
  title: string;

  // Upload sources
  allowUpload: boolean;
  allowYoutube: boolean;

  // Language selectors
  showSourceLang: boolean;
  showTargetLang: boolean;

  // Options toggles
  allowVoiceover: boolean;
  allowSubtitles: boolean;
  subtitleOptions: Array<"None" | "Source" | "Target" | "Bilingual">;

  // Subtitle-only special toggle
  allowRequireTranslationToggle?: boolean;

  // Override audio_option regardless of voiceover toggle
  forceAudioOption?: AudioOption;

  // pricing (per minute)
  ratePerMinute: number;

  // CTA label
  ctaLabel: string;
};

export const JOB_UI_CONFIG: Record<BackendJobType, UiConfig> = {
  full_translation: {
    title: "Generate Translated Video",
    allowUpload: true,
    allowYoutube: true,
    showSourceLang: true,
    showTargetLang: true,
    allowVoiceover: true,
    allowSubtitles: true,
    subtitleOptions: ["None", "Source", "Target", "Bilingual"],
    ratePerMinute: 5,
    ctaLabel: "Start Translation",
  },
  subtitle_only: {
    title: "Add Subtitles",
    allowUpload: true,
    allowYoutube: true,
    showSourceLang: true,
    showTargetLang: true, // only required when requireTranslation === "Yes"
    allowVoiceover: false,
    allowSubtitles: true,
    subtitleOptions: ["Target", "Bilingual"],
    allowRequireTranslationToggle: true,
    ratePerMinute: 0,
    ctaLabel: "Add Subtitles",
  },
  srt_translator: {
    title: "Translate Subtitles (SRT/VTT)",
    allowUpload: true, // keep video upload for now; can add SRT upload later
    allowYoutube: false,
    showSourceLang: true,
    showTargetLang: true,
    allowVoiceover: false,
    allowSubtitles: true,
    subtitleOptions: ["Target", "Bilingual"],
    ratePerMinute: 0,
    ctaLabel: "Start",
  },
  video_transcript: {
    title: "Generate Video Transcript",
    allowUpload: true,
    allowYoutube: true,
    showSourceLang: true,
    showTargetLang: false,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    ratePerMinute: 0,
    ctaLabel: "Start",
  },
  youtube_subtitles: {
    title: "Download YouTube Subtitles",
    allowUpload: false,
    allowYoutube: true,
    showSourceLang: false,
    showTargetLang: false,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    ratePerMinute: 0,
    ctaLabel: "Start",
  },
  video_summarizer: {
    title: "Summarize Video",
    allowUpload: true,
    allowYoutube: true,
    showSourceLang: true,
    showTargetLang: false,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    ratePerMinute: 0,
    ctaLabel: "Start",
  },
  speech_translator: {
    title: "Translate Speech",
    allowUpload: true,
    allowYoutube: true,
    showSourceLang: true,
    showTargetLang: true,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    forceAudioOption: "dubbed",
    ratePerMinute: 5,
    ctaLabel: "Start Translation",
  },
  nano_template_generation: {
    title: "Generate Image",
    allowUpload: false,
    allowYoutube: false,
    showSourceLang: false,
    showTargetLang: false,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    ratePerMinute: 0,
    ctaLabel: "Generate",
  },
};

export function getJobUiConfig(jobType: BackendJobType): UiConfig {
  return JOB_UI_CONFIG[jobType];
}