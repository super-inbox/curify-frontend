// lib/tools-registry.ts
import type { ToolGroupId, ToolMode, ToolStatus } from "@/lib/tools-hub";
import type { BackendJobType } from "@/types/projects";

export type ToolAction =
  | { type: "modal"; mode: ToolMode }
  | { type: "page" }
  // Inline image2image generate block rendered on the tool page (drop a
  // reference image → generate). templateId must be a requires_image_upload
  // nano template. Bypasses the video-oriented CreateNewModal entirely.
  | { type: "generate"; templateId: string }
  // Inline product-video generate surface (structured input → mp4) on the tool
  // page — backed by the PRODUCT_VIDEO backend job.
  | { type: "product_video" }
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
    }
  | {
      // For tools whose output is a still image (product photo, character
      // card, infographic, style-transferred frame). Renders a single
      // CdnImage instead of a video player. The example caption from i18n
      // is shown beneath.
      type: "single_image";
      src: string;
      alt?: string;
    };

export type ToolDef = {
  id: string;
  slug: string;
  groupId: ToolGroupId;
  status: ToolStatus;

  // backend job type (for job submission)
  job_type: BackendJobType;

  // required namespace for SEO page
  namespace: string;

  action?: ToolAction;

  i18n: {
    titleKey: string;
    descKey: string;
    showFreeBadge?: boolean;
  };

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
    job_type: "full_translation",
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
    job_type: "subtitle_only",
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

  {
    id: "video-transcript-generator",
    slug: "video-transcript-generator",
    groupId: "video",
    status: "create",
    job_type: "video_transcript",
    namespace: "videoTranscriptGenerator",
    action: { type: "modal", mode: "translation" },
    i18n: toolKeys("video_transcript_generator"),
    seo: seoKeys("video_transcript_generator"),
  },

  {
    id: "youtube-subtitle-downloader",
    slug: "youtube-subtitle-downloader",
    groupId: "video",
    status: "coming_soon",
    job_type: "youtube_subtitles",
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
    job_type: "subtitle_only",
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
    job_type: "srt_translator",
    namespace: "translateSubtitles",
    action: { type: "none" },
    i18n: toolKeys("translate_subtitles"),
    seo: seoKeys("translate_subtitles"),
  },

  {
    id: "video-summarizer",
    slug: "video-summarizer",
    groupId: "video",
    status: "create",
    job_type: "video_summarizer",
    namespace: "videoSummarizer",
    action: { type: "modal", mode: "translation" },
    i18n: toolKeys("video_summarizer"),
    seo: seoKeys("video_summarizer"),
  },

  {
    // Real image2image generate tool (upgraded from demo 2026-07-07 — lever #1:
    // give image gen a functional, rankable /tools surface like the video tools).
    // The broad HUB for the "AI product photo generator" head term (SEMrush KD 36).
    // status stays "demo" so the card links to the page (the "create" status is
    // hard-wired to the video CreateNewModal); the action below is "generate", so
    // the card CTA reads "Create" and the page renders the inline image2image
    // reproduce block (EcommercePhotoGenerate) via the freeform pipeline.
    // Uses product-poster (a requires_image_upload template) as the initial
    // preset — FOLLOW-UP: turn this into a multi-preset picker (studio / lifestyle
    // / marketplace / outfit) so the hub delivers the parameter *variations* the
    // head term implies, while /tools/ecommerce-photo stays the focused spoke.
    id: "ai-product-photo-generator",
    slug: "ai-product-photo-generator",
    groupId: "image",
    status: "demo",
    job_type: "video_transcript",
    namespace: "aiProductPhotoGenerator",
    action: { type: "generate", templateId: "template-product-poster" },
    i18n: toolKeys("ai_product_photo_generator"),
    seo: seoKeys("ai_product_photo_generator"),
    demo: {
      type: "single_image",
      src: "/images/nano_insp/template-lifestyle-photo-grid-met-gala-red-carpet.jpg",
      alt: "AI product photo generator: 9-image grid generated from one template prompt",
    },
  },

  {
    // Demo-only SEO landing. Narrower JTBD sibling to the broader
    // /tools/ai-product-photo-generator hub — this one targets the
    // upload-your-object → e-commerce-listing-image flow specifically.
    // Backed by two shipped image2image templates:
    //   - template-product-poster (cozy warm-lit hero shots)
    //   - template-fashion-ecommerce (9:16 vertical detail-shot layouts)
    // GSC/SEMrush cluster: "ai ecommerce photo", "product photo generator",
    // "etsy product photo", "amazon product listing image". Ships against
    // the 2026-07-02 Output-Intent reframe (workstream-tooling-and-
    // engineering.md § Output-Intent) — merch-intent tool, Column-3
    // deliverable = the ready-to-list image.
    id: "ecommerce-photo",
    slug: "ecommerce-photo",
    groupId: "image",
    // "demo" keeps the card navigating to /tools/ecommerce-photo (the
    // "create" status is hard-wired to the video CreateNewModal). The page
    // itself now renders a real inline image2image generate block via the
    // "generate" action below — not a coming-soon CTA.
    status: "demo",
    // Unused for the "generate" action (that path bypasses CreateNewModal and
    // submits via useDirectGenerate against the template below). Kept because
    // job_type is a required field; there is no image BackendJobType.
    job_type: "video_transcript",
    namespace: "ecommercePhoto",
    action: { type: "generate", templateId: "template-product-poster" },
    i18n: toolKeys("ecommerce_photo"),
    seo: seoKeys("ecommerce_photo"),
    demo: {
      type: "single_image",
      src: "/images/nano_insp/template-fashion-ecommerce-cycling-jersey-aerodynamic.jpg",
      alt: "Upload a product photo, get an e-commerce ready listing image — cycling jersey rendered as a vertical detail-shot layout",
    },
  },

  {
    // Inline image2image char-batch tool — the M9 wedge (2026-07-10 Reddit
    // demand run: whitest-space merch direction). Upload ONE character →
    // a 9-pose expression sheet (表情差分) on a clean 3x3 grid. Same
    // inline-generate stack as ecommerce-photo (ReproduceWorkbench →
    // useDirectGenerate → /nano-templates/generate); "demo" status keeps
    // the card navigating to the tool page while the "generate" action
    // renders the inline block. Featured on for-merch-operators +
    // for-designers. Productization spec + P1/P2 roadmap:
    // curify-studio/docs/spec-m9-char-batch-tool.md.
    id: "character-sticker-sheet",
    slug: "character-sticker-sheet",
    groupId: "image",
    status: "demo",
    // Unused by the generate path (bypasses CreateNewModal); required field.
    job_type: "video_transcript",
    namespace: "characterStickerSheet",
    action: { type: "generate", templateId: "template-ip-character-expression-sheet" },
    i18n: toolKeys("character_sticker_sheet"),
    seo: seoKeys("character_sticker_sheet"),
    demo: {
      type: "single_image",
      src: "/images/nano_insp/template-ip-character-sprite-emoji-sheet-graduation-alpaca.jpg",
      alt: "Upload one character drawing, get a 9-pose expression sticker sheet — graduation alpaca rendered across a 3x3 grid",
    },
  },

  {
    // Merch mockup generator — upload a character/artwork, get a full flat-lay
    // merch mockup set (notebook/tote/keychain/sticker/mug/tumbler/pen/phone
    // case) with the design on every product. Same inline-generate stack as
    // ecommerce-photo / character-sticker-sheet (ReproduceWorkbench →
    // useDirectGenerate). Image2image prompt Gemini-validated 2026-07-11.
    // (No demo image yet — the tool renders the inline generate block + SEO.)
    id: "mockup",
    slug: "mockup",
    groupId: "image",
    status: "demo",
    // Unused by the generate path (bypasses CreateNewModal); required field.
    job_type: "video_transcript",
    namespace: "mockupGenerator",
    action: { type: "generate", templateId: "template-ip-creative-cultural-goods-mockup-set" },
    i18n: toolKeys("mockup"),
    seo: seoKeys("mockup"),
  },

  {
    // Demo-only SEO landing — no backend pipeline yet. The blog
    // /blog/asl-video-translator ranks at pos ~13 for "asl video translator"
    // / "sign language video translator" but as an editorial page the
    // tool-intent queries convert at 0.75% CTR. Shipping this tool route
    // closes the loop with a visible demo + waitlist CTA. 2026-05-30 GSC
    // pull: 8 distinct tool-intent ASL queries at pos 9-26, zero clicks
    // (no /tools/asl-* landing existed).
    id: "asl-video-translator",
    slug: "asl-video-translator",
    groupId: "video",
    status: "demo",
    job_type: "video_transcript",
    namespace: "aslVideoTranslator",
    action: { type: "page" },
    i18n: toolKeys("asl_video_translator"),
    seo: seoKeys("asl_video_translator"),
    demo: {
      type: "single_video",
      src: "/video/asl-demo-translation.mp4",
    },
  },

  {
    // Demo-only SEO landing — no backend pipeline yet. The blog post
    // /blog/video-enhancement already drives search traffic in this
    // capability space; the tool page closes the loop with a visible
    // before/after demo (oil_crisis_original.mp4 vs oil_crisis_enhanced.mp4).
    id: "video-enhance",
    slug: "video-enhance",
    groupId: "video",
    status: "demo",
    job_type: "video_transcript",
    namespace: "videoEnhance",
    action: { type: "page" },
    i18n: toolKeys("video_enhance"),
    seo: seoKeys("video_enhance"),
    demo: {
      // Reusing the language-switch demo as a "before/after" toggle —
      // arbitrary labels + emoji "flags". Default to enhanced so the
      // wow-factor lands first.
      type: "language_switch",
      defaultLang: "enhanced",
      languages: {
        enhanced: { flag: "✨", video: "/video/oil_crisis_enhanced.mp4", label: "Enhanced" },
        original: { flag: "🎞️", video: "/video/oil_crisis_original.mp4", label: "Original" },
      },
    },
  },

  {
    // Product photos + details → short marketing video. Productized: the
    // PRODUCT_VIDEO backend job (curify_background: images → GPT storyboard →
    // Azure TTS → moviepy compose → mp4). The tool page renders the inline
    // ProductVideoGenerate surface (structured input) via the "product_video"
    // action; the demo video below is the on-page example. status stays "demo"
    // so the grid navigates + relabels "Create" (the generate-CTA mechanism).
    id: "product-video",
    slug: "product-video",
    groupId: "video",
    status: "demo",
    job_type: "video_transcript",
    namespace: "productVideo",
    action: { type: "product_video" },
    i18n: toolKeys("product_video"),
    seo: seoKeys("product_video"),
    demo: {
      type: "single_video",
      src: "/video/demo_product_video.mp4",
    },
  },

  {
    id: "storyboard-generator",
    slug: "storyboard-generator",
    groupId: "video",
    status: "coming_soon",
    job_type: "video_transcript",
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
    job_type: "srt_translator",
    namespace: "imageTranslation",
    action: { type: "none" },
    i18n: toolKeys("image_translation"),
    seo: seoKeys("image_translation"),
  },

  {
    // Demo-only SEO landing — no backend pipeline yet. Pre-built demo
    // clip migrated from the old /tools "Upcoming products" strip.
    id: "manga-translation",
    slug: "manga-translation",
    groupId: "image",
    status: "demo",
    job_type: "srt_translator",
    namespace: "mangaTranslation",
    action: { type: "page" },
    i18n: toolKeys("manga_translation"),
    seo: seoKeys("manga_translation"),
    demo: {
      type: "single_video",
      src: "/video/demo_mangaTranslation.mp4",
    },
  },

  {
    // Demo-only SEO landing — no backend pipeline yet. Pre-built demo
    // clip migrated from the old /tools "Upcoming products" strip.
    id: "style-transfer",
    slug: "style-transfer",
    groupId: "image",
    status: "demo",
    job_type: "srt_translator",
    namespace: "styleTransfer",
    action: { type: "page" },
    i18n: toolKeys("style_transfer"),
    seo: seoKeys("style_transfer"),
    demo: {
      type: "single_video",
      src: "/video/demo_styleTransfer.mp4",
    },
  },

  // =======================
  // AUDIO
  // =======================

  {
    id: "voice-clone",
    slug: "voice-clone",
    groupId: "audio",
    status: "coming_soon",
    job_type: "video_transcript",
    namespace: "voiceClone",
    action: { type: "none" },
    i18n: toolKeys("voice_clone"),
    seo: seoKeys("voice_clone"),
  },

  {
    id: "speech-translator",
    slug: "speech-translator",
    groupId: "audio",
    status: "create",
    job_type: "speech_translator",
    namespace: "speechTranslator",
    action: { type: "modal", mode: "translation" },
    i18n: toolKeys("speech_translator"),
    seo: seoKeys("speech_translator"),
  },
];

export function getToolBySlug(slug: string) {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function getToolById(id: string) {
  return TOOL_REGISTRY.find((t) => t.id === id);
}

export function groupTools(): Record<ToolGroupId, ToolDef[]> {
  return TOOL_REGISTRY.reduce(
    (acc, tool) => {
      acc[tool.groupId].push(tool);
      return acc;
    },
    { video: [], image: [], audio: [] } as Record<ToolGroupId, ToolDef[]>
  );
}

/** Same-group sibling tools (excluding the current one and any coming-soon
 *  entries). Powers the "Related tools" block on each tool detail page. */
export function getSiblingTools(slug: string, max = 3): ToolDef[] {
  const current = getToolBySlug(slug);
  if (!current) return [];
  return TOOL_REGISTRY
    .filter(
      (t) =>
        t.slug !== slug &&
        t.groupId === current.groupId &&
        t.status !== "coming_soon"
    )
    .slice(0, max);
}

// Tool slug → blog categories to surface as "Related reading" on each
// tool detail page. Source of truth: docs/interconnection.md (Tool slug
// → Blog categories table). Keep in sync when adding a new tool.
export const TOOL_BLOG_CATEGORIES: Record<string, string[]> = {
  "video-dubbing":               ["video-translation-dubbing", "video-dubbing"],
  "bilingual-subtitles":         ["video-translation-dubbing", "creator-tools"],
  "voice-clone":                 ["video-translation-dubbing"],
  "speech-translator":           ["video-translation-dubbing"],
  "video-transcript-generator":  ["creator-tools", "video-translation-dubbing"],
  "youtube-subtitle-downloader": ["creator-tools", "video-translation-dubbing"],
  "video-subtitle-extractor":    ["creator-tools", "video-translation-dubbing"],
  "translate-subtitles":         ["video-translation-dubbing"],
  "video-summarizer":            ["creator-tools"],
  "video-enhance":               ["creator-tools", "video-translation-dubbing"],
  "storyboard-generator":        ["creator-tools"],
  "image-translation":           ["video-translation-dubbing", "creator-tools"],
  "manga-translation":           ["video-translation-dubbing"],
  "style-transfer":              ["creator-tools", "nano-template"],
};