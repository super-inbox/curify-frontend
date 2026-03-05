// lib/tools-registry.ts
import type { ToolGroupId, ToolMode, ToolStatus } from "@/lib/tools-hub";

export type ToolAction =
  | { type: "modal"; mode: ToolMode }
  | { type: "page" }
  | { type: "none" };

  export type ToolDemo =
  | {
      type: "language_switch";
      defaultLang?: string;
      languages: Record<string, { flag: string; video: string; label: string }>;
    }
  | {
      type: "single_video";
      src: string;
      poster?: string;
    };

export type ToolDef = {
  id: string;
  slug: string;
  groupId: ToolGroupId;
  status: ToolStatus;

  // ✅ required: generic tool SEO page namespace
  // This MUST exist under messages/en/home.json (per your requirement)
  namespace: string;

  action?: ToolAction;

  // Hub card keys (existing)
  i18n: {
    titleKey: string;
    descKey: string;
    showFreeBadge?: boolean;
  };

  // Optional tool-level SEO keys (NOT required if you use namespace.metadata)
  // You can keep them for future, but generic page will use namespace.metadata.
  seo?: {
    titleKey: string;
    descriptionKey: string;
  };
  demo?: ToolDemo;

};

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
    // ✅ you probably want a separate namespace, not bilingual
    namespace: "videoDubbing",
    action: { type: "modal", mode: "translation" },
    i18n: toolKeys("video_dubbing"),
    seo: seoKeys("video_dubbing"),
    demo: {
      type: "language_switch",
      defaultLang: "en",
      languages: {
        en: { flag: "🇺🇸", video: "/video/training_en.mp4", label: "EN" },
        zh: { flag: "🇨🇳", video: "/video/training_zh.mp4", label: "ZH" },
        es: { flag: "🇪🇸", video: "/video/training_es.mp4", label: "ES" },
      },
    },
  },
  {
    id: "subtitle-captioner",
    slug: "bilingual-subtitles",
    groupId: "video",
    status: "create",
    namespace: "bilingual",
    action: { type: "modal", mode: "subtitles" },
    i18n: { ...toolKeys("subtitle_captioner"), showFreeBadge: true },
    seo: seoKeys("subtitle_captioner"),
    demo: {
      type: "single_video",
      src: "/video/demo_bilingual_subtitles.mp4",
      poster: "/thumbnails/jensen_ai_strategy.jpg",
    },
  },

  // 🚧 coming soon (still appear in hub; detail page only if namespace exists)
  {
    id: "video-transcript-generator",
    slug: "video-transcript-generator",
    groupId: "video",
    status: "coming_soon",
    namespace: "videoTranscriptGenerator",
    action: { type: "none" },
    i18n: toolKeys("video_transcript_generator"),
    seo: seoKeys("video_transcript_generator"),
  },
  {
    id: "youtube-subtitle-downloader",
    slug: "youtube-subtitle-downloader",
    groupId: "video",
    status: "coming_soon",
    namespace: "youtubeSubtitleDownloader",
    action: { type: "none" },
    i18n: toolKeys("youtube_subtitle_downloader"),
    seo: seoKeys("youtube_subtitle_downloader"),
  },
  {
    id: "video-subtitle-extractor",
    slug: "video-subtitle-extractor",
    groupId: "video",
    status: "coming_soon",
    namespace: "videoSubtitleExtractor",
    action: { type: "none" },
    i18n: toolKeys("video_subtitle_extractor"),
    seo: seoKeys("video_subtitle_extractor"),
  },
  {
    id: "translate-subtitles",
    slug: "translate-subtitles",
    groupId: "video",
    status: "coming_soon",
    namespace: "translateSubtitles",
    action: { type: "none" },
    i18n: toolKeys("translate_subtitles"),
    seo: seoKeys("translate_subtitles"),
  },
  {
    id: "video-summarizer",
    slug: "video-summarizer",
    groupId: "video",
    status: "coming_soon",
    namespace: "videoSummarizer",
    action: { type: "none" },
    i18n: toolKeys("video_summarizer"),
    seo: seoKeys("video_summarizer"),
  },
  {
    id: "storyboard-generator",
    slug: "storyboard-generator",
    groupId: "video",
    status: "coming_soon",
    namespace: "storyboardGenerator",
    action: { type: "none" },
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
    namespace: "imageTranslation",
    action: { type: "none" },
    i18n: toolKeys("image_translation"),
    seo: seoKeys("image_translation"),
  },
  {
    id: "manga-translation",
    slug: "manga-translation",
    groupId: "image",
    status: "coming_soon",
    namespace: "mangaTranslation",
    action: { type: "none" },
    i18n: toolKeys("manga_translation"),
    seo: seoKeys("manga_translation"),
  },
  {
    id: "style-transfer",
    slug: "style-transfer",
    groupId: "image",
    status: "coming_soon",
    namespace: "styleTransfer",
    action: { type: "none" },
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
    namespace: "voiceClone",
    action: { type: "none" },
    i18n: toolKeys("voice_clone"),
    seo: seoKeys("voice_clone"),
  },
  {
    id: "speech-translator",
    slug: "speech-translator",
    groupId: "audio",
    status: "coming_soon",
    namespace: "speechTranslator",
    action: { type: "none" },
    i18n: toolKeys("speech_translator"),
    seo: seoKeys("speech_translator"),
  },
];

export function getToolBySlug(slug: string) {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

// ✅ NEW: group tools for tools-hub.tsx
export function groupTools(): Record<ToolGroupId, ToolDef[]> {
  return TOOL_REGISTRY.reduce(
    (acc, tool) => {
      acc[tool.groupId].push(tool);
      return acc;
    },
    { video: [], image: [], audio: [] } as Record<ToolGroupId, ToolDef[]>
  );
}

// (optional) sometimes handy
export function getToolById(id: string) {
  return TOOL_REGISTRY.find((t) => t.id === id);
}