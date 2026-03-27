import blogsData from "@/public/data/blogs.json";

// Helper function to map blog data to the expected format
export function createBlogPostsConfig() {
  const blogPosts: Record<string, any> = {};
  
  blogsData.forEach((blog) => {
    const slug = blog.slug;
    
    // Determine namespace based on slug pattern
    let namespace = slug.replace(/-/g, '');
    
    // Special cases for namespace mapping
    const namespaceMap: Record<string, string> = {
      'aiPlatform': 'aiPlatform',
      'QA_Bot_to_Task': 'qaBotToTask',
      'age_AI': 'ageAi',
      'storyboard-labeling': 'storyboardLabeling',
      'video-enhancement': 'videoEnhancement',
      'video-evaluation': 'videoEvaluation',
      'storyboard-to-pipeline': 'storyboardToPipeline',
      'agents-vs-workflows': 'agentsVsWorkflows',
      'ae-vs-comfyui': 'aeVsComfyui',
      'translate-youtube-video': 'translateYoutubevideo',
      'translate-youtube-video-to-english': 'translateYoutubeVideoToEnglish',
      'ai-youtube-video-translator': 'aiYoutubeVideoTranslator',
      'what-is-voice-cloning': 'whatIsVoiceCloning',
      'voice-cloning-tools': 'voiceCloningTools',
      'f5-tts-voice-cloning': 'f5TtsVoiceCloning',
      'asl-video-translator': 'aslVideoTranslator',
      'how-to-translate-asl-video': 'howToTranslateAslVideo',
      'chinese-herbal-medicine-visual-guide': 'chineseHerbalMedicineVisualGuide',
      'evolution-timelines-visualization': 'evolutionTimelinesVisualization',
      'chinese-costume-history-infographic': 'chineseCostumeHistoryInfographic',
      'creative-ai-tools-websites': 'creativeAiToolsWebsites',
      'nano-banana-prompt-ecosystem': 'nanoBananaPromptEcosystem',
      'video-transcription-business-guide': 'videoTranscriptionBusinessGuide',
      'video-transcription-technical-deep-dive': 'videoTranscriptionTechnicalDeepDive',
      '10-prompting-tips-nano-banana': 'tenPromptingTipsNanoBanana',
      '10-prompting-tips-video-generation': 'tenPromptingTipsVideoGeneration'
    };
    
    namespace = namespaceMap[slug] || namespace;
    
    // Determine category from blog data (use the category field if available, otherwise fallback to tag-based mapping)
    let category = blog.category;
    let relatedCategories = [category]; // simplified - just use the same category
    
    // If no category field, determine from tag (fallback for backward compatibility)
    if (!category) {
      const tag = blog.tag?.toLowerCase() || '';
      if (tag.includes('ai platform') || tag.includes('ai architecture') || tag.includes('ai industry') || tag.includes('data science')) {
        category = 'ds-ai-engineering';
      } else if (tag.includes('video translation') || tag.includes('localization')) {
        category = 'video-translation';
      } else if (tag.includes('video analysis') || tag.includes('video enhancement') || tag.includes('animation') || tag.includes('generative tools') || tag.includes('tools pipeline') || tag.includes('ai audio') || tag.includes('accessibility')) {
        category = 'creator-tools';
      } else if (tag.includes('traditional medicine') || tag.includes('data visualization')) {
        category = 'nano-banana-prompts';
      } else if (tag.includes('cultural heritage')) {
        category = 'culture';
      } else if (tag.includes('ai tools')) {
        category = 'nano-banana-prompts';
      } else {
        category = 'creator-tools'; // default
      }
      relatedCategories = [category];
    }
    
    blogPosts[slug] = {
      titleKey: "title",
      descriptionKey: "intro",
      image: blog.image,
      category: category,
      relatedCategories: relatedCategories,
      namespace: namespace
    };
  });
  
  return blogPosts;
}

// Blog post configuration - dynamically generated from blogs data
export const blogPosts = createBlogPostsConfig();

// Define which keys exist for each blog post type
export const availableKeys: Record<string, string[]> = {
  'aiPlatform': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'qaBotToTask': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'ageAi': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'storyboardLabeling': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'videoEnhancement': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'videoEvaluation': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'storyboardToPipeline': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'agentsVsWorkflows': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'aeVsComfyui': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'translateYoutubevideo': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'translateYoutubeVideoToEnglish': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'step5Title', 'step5Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'aiYoutubeVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'whatIsVoiceCloning': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'voiceCloningTools': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'galleryTitle', 'galleryContent', 'PipelineTitle', 'PipelineContent', 'subtitleText', 'SubtitleContent', 'complianceTitle', 'complianceContent', 'TemplateTitle', 'TemplateContent', 'ReferencesTitle', 'ReferencesContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'f5TtsVoiceCloning': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'aslVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'videoTranscriptionBusinessGuide': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'upsellTitle', 'upsellContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'videoTranscriptionTechnicalDeepDive': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'step5Title', 'step5Content', 'challengesTitle', 'challengesContent', 'productionTitle', 'productionContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'chineseHerbalMedicineVisualGuide': ['intro', 'whatIsTitle', 'whatIsContent', 'historyTitle', 'historyContent', 'benefitsTitle', 'benefitsContent', 'popularTitle', 'popularContent', 'usageTitle', 'usageContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'evolutionTimelinesVisualization': ['intro', 'whatIsTitle', 'whatIsContent', 'importanceTitle', 'importanceContent', 'techniquesTitle', 'techniquesContent', 'examplesTitle', 'examplesContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'chineseCostumeHistoryInfographic': ['intro', 'whatIsTitle', 'whatIsContent', 'dynastiesTitle', 'dynastiesContent', 'characteristicsTitle', 'characteristicsContent', 'modernTitle', 'modernContent', 'culturalTitle', 'culturalContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'creativeAiToolsWebsites': ['intro', 'whatIsTitle', 'whatIsContent', 'inspirationTitle', 'inspirationContent', 'featuredTitle', 'featuredContent', 'aiTitle', 'aiContent', 'aiFeaturedTitle', 'aiFeaturedContent', 'conclusionTitle', 'conclusionContent'],
  'nanoBananaPromptEcosystem': ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'promptFirstTitle', 'promptFirstContent', 'bestImagePromptsTitle', 'bestImagePromptsContent', 'promptsByCategoryTitle', 'promptsByCategoryContent', 'howToWritePromptsTitle', 'howToWritePromptsContent', 'whatIsTitle', 'whatIsContent', 'ecosystemTitle', 'ecosystemContent', 'seoTitle', 'seoContent', 'generatorTitle', 'generatorContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'useCasesTitle', 'useCasesContent', 'integrationTitle', 'integrationContent', 'communityTitle', 'communityContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent', 'promptGuideTitle', 'promptGuideContent', 'promptStructureTitle', 'promptStructureContent', 'promptExamplesTitle', 'promptExamplesContent', 'promptTemplatesTitle', 'promptTemplatesContent', 'promptGenerationTitle', 'promptGenerationContent'],
  'tenPromptingTipsNanoBanana': ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'tip1Title', 'tip1Content', 'tip2Title', 'tip2Content', 'tip3Title', 'tip3Content', 'tip4Title', 'tip4Content', 'tip5Title', 'tip5Content', 'tip6Title', 'tip6Content', 'tip7Title', 'tip7Content', 'tip8Title', 'tip8Content', 'tip9Title', 'tip9Content', 'tip10Title', 'tip10Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'tenPromptingTipsVideoGeneration': ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'tip1Title', 'tip1Content', 'tip2Title', 'tip2Content', 'tip3Title', 'tip3Content', 'tip4Title', 'tip4Content', 'tip5Title', 'tip5Content', 'tip6Title', 'tip6Content', 'tip7Title', 'tip7Content', 'tip8Title', 'tip8Content', 'tip9Title', 'tip9Content', 'tip10Title', 'tip10Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent']
};
