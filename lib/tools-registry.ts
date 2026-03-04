// lib/tools-registry.ts
import type { ToolGroupId, ToolMode, ToolStatus } from "@/lib/tools-hub";

export type ToolAction =
  | { type: "modal"; mode: ToolMode } // opens your existing Create modal
  | { type: "page" };                 // navigates to /tools/[slug] (future)

export type ToolDef = {
  // stable identifiers
  id: string;        // internal id used in UI lists
  slug: string;      // SEO slug (recommended to match id, but can differ)

  groupId: ToolGroupId;

  // availability + behavior
  status: ToolStatus;
  action?: ToolAction; // only meaningful when status === "create" (or when you want card click)

  // i18n keys (all under tools.* as requested)
  i18n: {
    titleKey: string;
    descKey: string;
    // optional: some tools have badges (free badge)
    showFreeBadge?: boolean;
  };

  // optional SEO keys for unified /tools/[slug] pages later
  seo?: {
    titleKey: string;
    descriptionKey: string;
  };
};

// ---- helpers for building keys consistently ----
const toolKeys = (k: string) => ({
  titleKey: `tools.${k}.title`,
  descKey: `tools.${k}.desc`,
});

const seoKeys = (k: string) => ({
  titleKey: `tools.${k}.meta.title`,
  descriptionKey: `tools.${k}.meta.description`,
});

// ---- single source of truth ----
export const TOOL_REGISTRY: ToolDef[] = [
  // =======================
  // VIDEO
  // =======================
  {
    id: "video-dubbing",
    slug: "video-dubbing",
    groupId: "video",
    status: "create",
    action: { type: "modal", mode: "translation" },
    i18n: toolKeys("video_dubbing"),
    seo: seoKeys("video_dubbing"),
  },
  {
    id: "subtitle-captioner",
    slug: "bilingual-subtitles", // keep your existing slug if you want
    groupId: "video",
    status: "create",
    action: { type: "modal", mode: "subtitles" },
    i18n: { ...toolKeys("subtitle_captioner"), showFreeBadge: true },
    seo: seoKeys("subtitle_captioner"),
  },
  {
    id: "video-transcript-generator",
    slug: "video-transcript-generator",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("video_transcript_generator"),
    seo: seoKeys("video_transcript_generator"),
  },
  {
    id: "youtube-subtitle-downloader",
    slug: "youtube-subtitle-downloader",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("youtube_subtitle_downloader"),
    seo: seoKeys("youtube_subtitle_downloader"),
  },
  {
    id: "video-subtitle-extractor",
    slug: "video-subtitle-extractor",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("video_subtitle_extractor"),
    seo: seoKeys("video_subtitle_extractor"),
  },
  {
    id: "translate-subtitles",
    slug: "translate-subtitles",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("translate_subtitles"),
    seo: seoKeys("translate_subtitles"),
  },
  {
    id: "subtitle-converter",
    slug: "subtitle-converter",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("subtitle_converter"),
    seo: seoKeys("subtitle_converter"),
  },
  {
    id: "subtitle-editor",
    slug: "subtitle-editor",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("subtitle_editor"),
    seo: seoKeys("subtitle_editor"),
  },
  {
    id: "video-summarizer",
    slug: "video-summarizer",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("video_summarizer"),
    seo: seoKeys("video_summarizer"),
  },
  {
    id: "storyboard-generator",
    slug: "storyboard-generator",
    groupId: "video",
    status: "coming_soon",
    i18n: toolKeys("storyboard_generator"),
    seo: seoKeys("storyboard_generator"),
  },

  // =======================
  // IMAGE
  // =======================
  {
    id: "image-translation",
    slug: "image-translation",
    groupId: "image",
    status: "coming_soon",
    i18n: toolKeys("image_translation"),
    seo: seoKeys("image_translation"),
  },
  {
    id: "manga-translation",
    slug: "manga-translation",
    groupId: "image",
    status: "coming_soon",
    i18n: toolKeys("manga_translation"),
    seo: seoKeys("manga_translation"),
  },
  {
    id: "style-transfer",
    slug: "style-transfer",
    groupId: "image",
    status: "coming_soon",
    i18n: toolKeys("style_transfer"),
    seo: seoKeys("style_transfer"),
  },

  // =======================
  // AUDIO
  // =======================
  {
    id: "voice-clone",
    slug: "voice-clone",
    groupId: "audio",
    status: "coming_soon",
    i18n: toolKeys("voice_clone"),
    seo: seoKeys("voice_clone"),
  },
  {
    id: "speech-translator",
    slug: "speech-translator",
    groupId: "audio",
    status: "coming_soon",
    i18n: toolKeys("speech_translator"),
    seo: seoKeys("speech_translator"),
  },
];

// ---- utility fns ----
export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function allToolSlugs(): string[] {
  return TOOL_REGISTRY.map((t) => t.slug);
}

export function groupTools(): Record<ToolGroupId, ToolDef[]> {
  return TOOL_REGISTRY.reduce(
    (acc, t) => {
      acc[t.groupId].push(t);
      return acc;
    },
    { video: [], image: [], audio: [] } as Record<ToolGroupId, ToolDef[]>
  );
}