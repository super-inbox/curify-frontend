// lib/create-job-ui.ts
import type { AudioOption, BackendJobType } from "@/types/projects";
import { FREE_SUBTITLE_SECONDS } from "@/lib/pricing";

export type UiConfig = {
  title: string;

  // Upload sources
  allowUpload: boolean;
  allowYoutube: boolean;

  // Kind of file the upload affordance accepts. Defaults to "video".
  // Used by the Upload component to switch MIME types, accept extensions,
  // and the on-screen file-type hint (`.mp4/.mov/…` vs `.mp3/.wav/…`).
  // "media" = video OR audio (for audio-only tools that extract the track).
  acceptedKinds?: "video" | "audio" | "media";

  // Audio-only tools: the backend only needs the audio track, so the Upload
  // component extracts audio in the browser and uploads just that (a video is
  // decoded to a 16 kHz mono WAV; audio files upload as-is). Avoids shipping
  // the whole video for transcript / summarizer / speech-translator.
  audioOnly?: boolean;

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

  // pricing (per minute). Must equal JOB_CREDIT_COST[...] in curify_background —
  // this is a hand-maintained SECOND copy of the backend's rate, and it is what the
  // modal quotes AND gates on. Four of the six entries had drifted by 2026-09-24.
  ratePerMinute: number;

  // Seconds that are free on EVERY video before ratePerMinute starts applying.
  // Only subtitle captioning has one; omitted means the whole duration bills.
  // Mirrors the SUBTITLE_ONLY branch of compute_processing_fee, which charges on
  // `duration - FREE_SUBTITLE_SECONDS` and returns 0 when that is <= 0.
  freeSecondsPerVideo?: number;

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
  asl_translation: {
    title: "Translate Sign Language Video",
    allowUpload: true,
    allowYoutube: true,
    // Source language is fixed — the input IS sign language, so there is
    // nothing for the user to pick. Target is the language of the captions.
    showSourceLang: false,
    showTargetLang: true,
    // No TTS voice-over: the pipeline produces captions and re-muxes whatever
    // audio the source had (usually none). Revisit if voiceover is wired in.
    allowVoiceover: false,
    allowSubtitles: true,
    subtitleOptions: ["Target", "Bilingual"],
    // 8/min — must stay in sync with JOB_CREDIT_COST["ASL_TRANSLATION"] in
    // curify_background. Priced on vision inference costing more per minute than
    // STT. It was zeroed on 2026-08-29 and restored on 2026-09-24.
    //
    // ⚠️ The zero was a correctness decision, not a discount, and nothing has
    // invalidated it: scored against verified human ground truth the recogniser
    // returned WER 0.92 on the one real user video we can score, and two runs of
    // the same video disagreed with each other at WER 0.97. We are billing again
    // for output documented in writing as untrustworthy, so the unverified notice
    // the pipeline stamps on every job is now the only disclosure a paying user
    // gets — a deaf viewer cannot check the captions against the source.
    // Covered by lib/__tests__/pricing.test.ts.
    ratePerMinute: 8,
    ctaLabel: "Translate Signing",
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
    ratePerMinute: 2,
    freeSecondsPerVideo: FREE_SUBTITLE_SECONDS,
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
    acceptedKinds: "media",
    audioOnly: true,
    showSourceLang: true,
    showTargetLang: false,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    ratePerMinute: 2,
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
    acceptedKinds: "media",
    audioOnly: true,
    showSourceLang: true,
    showTargetLang: false,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    ratePerMinute: 2,
    ctaLabel: "Start",
  },
  speech_translator: {
    title: "Translate Speech",
    allowUpload: true,
    allowYoutube: true,
    acceptedKinds: "media",
    audioOnly: true,
    showSourceLang: true,
    showTargetLang: true,
    allowVoiceover: false,
    allowSubtitles: false,
    subtitleOptions: ["None"],
    forceAudioOption: "dubbed",
    ratePerMinute: 3,
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

/** Credits a job of this duration will cost, as quoted to the user before submit.
 *
 *  Mirrors `compute_processing_fee` in curify_background/app/utils/credit_utils.py
 *  exactly, and must keep mirroring it: this number is both the "Credits Required"
 *  figure and the client-side affordability gate, so an estimate below the real
 *  charge lets a job through that the backend then rejects, and one above it blocks
 *  a job the user can afford. Both have happened.
 *
 *  The two shapes that matter, and that the inline version got wrong:
 *    - Minutes round UP, then multiply — `max(1, ceil(sec/60)) * rate`. Multiplying
 *      first and rounding the product under-quotes every part-minute.
 *    - A job type with a free allowance bills only the excess, and bills NOTHING
 *      when the whole video fits inside it. */
export function estimateJobCost(seconds: number, ui: UiConfig): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  const billableSeconds = Math.max(0, seconds - (ui.freeSecondsPerVideo ?? 0));
  if (billableSeconds <= 0) return 0;
  return Math.max(1, Math.ceil(billableSeconds / 60)) * ui.ratePerMinute;
}