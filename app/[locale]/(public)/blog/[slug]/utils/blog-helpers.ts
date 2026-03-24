import { getToolBySlug } from "@/lib/tools-registry";

// Helper functions to get tool URLs from registry
export function getVideoDubbingUrl(locale: string) {
  const tool = getToolBySlug("video-dubbing");
  if (tool && tool.status === "create") {
    return `/${locale}/video-dubbing`;
  }
  return `/${locale}/tools`;
}

export function getSubtitleGeneratorUrl(locale: string) {
  const tool = getToolBySlug("bilingual-subtitles");
  if (tool && tool.status === "create") {
    return `/${locale}/bilingual-subtitles`;
  }
  return `/${locale}/tools`;
}

export function getTemplateUrl(slug: string, locale: string) {
  const templateMap: Record<string, string> = {
    'evolution-timelines-visualization': '/nano-template/evolution',
    'chinese-costume-history-infographic': '/nano-template/costume-zh',
    'chinese-herbal-medicine-visual-guide': '/nano-template/herbal-zh'
  };
  return `/${locale}${templateMap[slug] || '/nano-template'}`;
}
