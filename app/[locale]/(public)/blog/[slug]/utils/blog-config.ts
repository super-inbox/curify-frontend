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
      '10-prompting-tips-video-generation': 'tenPromptingTipsVideoGeneration',
      'image-generation-model-comparison': 'imageGenerationModelComparison',
      'lip-sync-business-guide': 'lipSyncBusinessGuide',
      'lip-sync-technical-deep-dive': 'lipSyncTechnicalDeepDive',
      'character-prompt-generator': 'characterPromptGenerator',
      'visual-learning-tools': 'visualLearningTools',
      'ai-content-distribution-system': 'aiContentDistributionSystem',
      'ai-content-production-system': 'aiContentProductionSystem',
      'what-is-infographics': 'whatIsInfographics',
      'image-to-narrative-video': 'imageToNarrativeVideo',
      'series-infographic-vs-notebooklm': 'seriesInfographicVsNotebookLM'
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
  'tenPromptingTipsNanoBanana': ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'whyNanoBananaTitle', 'whyNanoBananaContent', 'tip1Title', 'tip1Content', 'tip2Title', 'tip2Content', 'tip3Title', 'tip3Content', 'tip4Title', 'tip4Content', 'tip5Title', 'tip5Content', 'tip6Title', 'tip6Content', 'tip7Title', 'tip7Content', 'tip8Title', 'tip8Content', 'tip9Title', 'tip9Content', 'tip10Title', 'tip10Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent', 'templatesTitle', 'faq1Question', 'faq1Answer', 'faq2Question', 'faq2Answer', 'faq3Question', 'faq3Answer', 'faq4Question', 'faq4Answer', 'faq5Question', 'faq5Answer', 'tip1ExampleTitle', 'tip1Example', 'tip1PromptTitle'],
  'tenPromptingTipsVideoGeneration': ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'tip1Title', 'tip1Content', 'tip2Title', 'tip2Content', 'tip3Title', 'tip3Content', 'tip4Title', 'tip4Content', 'tip5Title', 'tip5Content', 'tip6Title', 'tip6Content', 'tip7Title', 'tip7Content', 'tip8Title', 'tip8Content', 'tip9Title', 'tip9Content', 'tip10Title', 'tip10Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent', 'successMetricsTitle', 'qualityMetricsTitle', 'engagementMetricsTitle', 'efficiencyMetricsTitle', 'nextLearningTitle', 'advancedGuideTitle', 'cinematicTechniquesTitle', 'aiModelComparisonTitle', 'commercialApplicationsTitle', 'tip1ExampleTitle', 'tip2ExampleTitle', 'tip3ExampleTitle', 'tip4ExampleTitle', 'tip5ExampleTitle', 'tip6ExampleTitle', 'tip7ExampleTitle', 'tip8ExampleTitle', 'tip9ExampleTitle', 'tip10ExampleTitle', 'successMetricsContent', 'engagementMetricsContent', 'efficiencyMetricsContent', 'learningResourcesContent', 'quickStartSummaryTitle', 'quickStartSubtitle', 'beginnerPathTitle', 'advancedPathTitle', 'quickStartBeginnerSteps', 'quickStartAdvancedSteps', 'beforeAfterTitle', 'basicPromptTitle', 'basicPromptBoxTitle', 'basicPromptText', 'basicPromptIssues', 'professionalPromptTitle', 'professionalPromptBoxTitle', 'professionalPromptText', 'professionalPromptImprovements', 'platformOptimizationTitle', 'tiktokTitle', 'youtubeTitle', 'instagramTitle', 'tiktokFeatures', 'youtubeFeatures', 'instagramFeatures', 'platformOptimizationTemplateTitle', 'platformOptimizationTemplateContent', 'platformOptimizationTemplateDisplay', 'troubleshootingTitle', 'problem1Title', 'problem1Cause', 'problem1Solution', 'problem2Title', 'problem2Cause', 'problem2Solution', 'problem3Title', 'problem3Cause', 'problem3Solution', 'problem4Title', 'problem4Cause', 'problem4Solution', 'qualityControlTitle', 'qcSubtitle', 'characterIdentityTitle', 'visualQualityTitle', 'storyFlowTitle', 'technicalSpecsTitle', 'characterIdentityChecklist', 'visualQualityChecklist', 'storyFlowChecklist', 'technicalSpecsChecklist', 'scoringText', 'platformComparisonTitle', 'platformComparisonTable', 'actionPlanTitle', 'week1Title', 'week2Title', 'week3Title', 'week4Title', 'week1Tasks', 'week2Tasks', 'week3Tasks', 'week4Tasks', 'tip1Example', 'tip2Example', 'tip3Example', 'tip4Example', 'tip5Example', 'tip6Example', 'tip7Example', 'tip8Example', 'tip9Example', 'tip10Example', 'videoGenerationToolsUrl'],
  'imageGenerationModelComparison': ['intro', 'whatIsTitle', 'whatIsContent', 'modelsTitle', 'modelsContent', 'dalle3Title', 'dalle3Content', 'midjourneyTitle', 'midjourneyContent', 'stableDiffusionTitle', 'stableDiffusionContent', 'comparisonTitle', 'comparisonContent', 'qualityTitle', 'qualityContent', 'speedTitle', 'speedContent', 'costTitle', 'costContent', 'useCasesTitle', 'useCasesContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent', 'faqTitle', 'faq1Question', 'faq1Answer', 'faq2Question', 'faq2Answer', 'faq3Question', 'faq3Answer', 'faq4Question', 'faq4Answer', 'futureTrendsTitle', 'marketingMaterialsTitle', 'marketingMaterialsContent', 'creativeProjectsTitle', 'creativeProjectsContent', 'technicalApplicationsTitle', 'technicalApplicationsContent', 'integrationDifficultyTitle', 'unifiedWorkflowTitle', 'unifiedWorkflowContent', 'promptOptimizationTitle', 'promptOptimizationContent', 'assetManagementTitle', 'assetManagementContent', 'batchProcessingTitle', 'batchProcessingContent', 'technicalAdvancementsTitle', 'marketEvolutionTitle'],
  'lipSyncBusinessGuide': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'lipSyncTechnicalDeepDive': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'step5Title', 'step5Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'character-prompt-generator': ['title', 'publishedDate', 'readTime', 'category', 'heroImageAlt', 'whatWeHave', 'whoCanBenefit', 'howToUse', 'advancedFeatures', 'realWorldApplications', 'footer', 'questions'],
  'visualLearningTools': ['title', 'publishedDate', 'readTime', 'category', 'introduction', 'whatWeOffer', 'forStudents', 'forParents', 'forTeachers', 'howToGetStarted', 'successStories', 'footer'],
  'bestAiTools': ['title', 'publishedDate', 'readTime', 'category', 'heroImageAlt', 'introduction', 'tools', 'features', 'pricing', 'bestFor', 'comparison', 'howToChoose', 'workflow', 'tips', 'future', 'footer'],
  'aiContentProductionSystem': ['title', 'date', 'readTime', 'intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'step5Title', 'step5Content', 'step6Title', 'step6Content', 'step7Title', 'step7Content', 'step8Title', 'step8Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
  'imageToNarrativeVideo': ['title', 'date', 'readTime', 'intro', 'whatIsTitle', 'whatIsContent', 'technicalTitle', 'technicalIntro', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'step4Title', 'step4Content', 'businessTitle', 'educationTitle', 'educationContent', 'educationExample1', 'educationExample2', 'educationExample3', 'marketingTitle', 'marketingContent', 'marketingExample1', 'marketingExample2', 'marketingExample3', 'trainingTitle', 'trainingContent', 'trainingExample1', 'trainingExample2', 'trainingExample3', 'entertainmentTitle', 'entertainmentContent', 'entertainmentExample1', 'entertainmentExample2', 'entertainmentExample3', 'examplesTitle', 'techStackTitle', 'toolsTitle', 'toolsContent', 'gettingStartedTitle', 'quickStartTitle', 'iranExampleTitle', 'iranExampleDescription', 'iranFeature1', 'iranFeature2', 'iranFeature3', 'iranFeature4', 'vocabularyExampleTitle', 'vocabularyExampleDescription', 'vocabularyImages', 'vocabularyFeature1', 'vocabularyFeature2', 'vocabularyFeature3', 'vocabularyFeature4', 'curifyTitle', 'curifyContent', 'conclusionTitle', 'conclusionContent', 'ctaTitle', 'ctaSubtitle', 'ctaButton', 'curifyToolTitle', 'curifyToolDesc', 'curifyFeatures', 'curifyUseCases', 'curifyPricing', 'runwayToolTitle', 'runwayToolDesc', 'runwayFeatures', 'runwayUseCases', 'runwayPricing', 'pikaToolTitle', 'pikaToolDesc', 'pikaFeatures', 'pikaUseCases', 'pikaPricing', 'stableToolTitle', 'stableToolDesc', 'stableFeatures', 'stableUseCases', 'stablePricing', 'insightsTitle', 'insight1Title', 'insight1Content', 'insight2Title', 'insight2Content', 'insight3Title', 'insight3Content', 'promptExamplesTitle', 'educationalPromptTitle', 'educationalPromptDesc', 'marketingPromptTitle', 'marketingPromptDesc', 'storytellingPromptTitle', 'storytellingPromptDesc', 'futureTitle', 'trendsTitle', 'trend1', 'trend2', 'trend3', 'trend4', 'opportunitiesTitle', 'opportunity1', 'opportunity2', 'opportunity3', 'opportunity4', 'bestPracticesTitle', 'practice1Title', 'practice1Content', 'practice2Title', 'practice2Content', 'practice3Title', 'practice3Content'],
  'whatIsInfographics': ['title', 'date', 'readTime', 'intro', 'whatIsTitle', 'introContent', 'definitionTitle', 'definitionContent', 'visualElement', 'visualElementDesc', 'contentElement', 'contentElementDesc', 'designElement', 'designElementDesc', 'useCasesTitle', 'digitalTab', 'physicalTab', 'examplesLabel', 'nanoBananaTitle', 'nanoBananaIntro', 'templateType', 'insightsTitle', 'insight1Title', 'insight1Content', 'insight2Title', 'insight2Content', 'insight3Title', 'insight3Content', 'promptExamplesTitle', 'technicalPromptTitle', 'technicalPromptDesc', 'culturalPromptTitle', 'culturalPromptDesc', 'businessPromptTitle', 'businessPromptDesc', 'futureTitle', 'trendsTitle', 'trend1', 'trend2', 'trend3', 'trend4', 'opportunitiesTitle', 'opportunity1', 'opportunity2', 'opportunity3', 'opportunity4', 'conclusionTitle', 'conclusionContent', 'digitalCase1Title', 'digitalCase1Desc', 'digitalCase1Example', 'digitalCase2Title', 'digitalCase2Desc', 'digitalCase2Example', 'digitalCase3Title', 'digitalCase3Desc', 'digitalCase3Example', 'digitalCase4Title', 'digitalCase4Desc', 'digitalCase4Example', 'physicalCase1Title', 'physicalCase1Desc', 'physicalCase1Example', 'physicalCase2Title', 'physicalCase2Desc', 'physicalCase2Example', 'physicalCase3Title', 'physicalCase3Desc', 'physicalCase3Example', 'physicalCase4Title', 'physicalCase4Desc', 'physicalCase4Example', 'nanoExample1Title', 'nanoExample1Desc', 'nanoExample1Template', 'nanoExample2Title', 'nanoExample2Desc', 'nanoExample2Template', 'nanoExample3Title', 'nanoExample3Desc', 'nanoExample3Template'],
  'seriesInfographicVsNotebookLM': ['title', 'date', 'readTime', 'introTitle', 'introContent', 'whatIsInfographicTitle', 'whatIsInfographicContent', 'exampleTitle', 'exampleContent', 'whatIsNotebookLMTitle', 'whatIsNotebookLMContent', 'notebookLMExampleTitle', 'notebookLMExampleContent', 'comparisonTitle', 'categoryHeader', 'infographicHeader', 'notebookLMHeader', 'category1', 'infographic1', 'notebooklm1', 'category2', 'infographic2', 'notebooklm2', 'category3', 'infographic3', 'notebooklm3', 'category4', 'infographic4', 'notebooklm4', 'category5', 'infographic5', 'notebooklm5', 'category6', 'infographic6', 'notebooklm6', 'whenUseInfographicTitle', 'useCase1Title', 'useCase1Content', 'useCase2Title', 'useCase2Content', 'useCase3Title', 'useCase3Content', 'useCase4Title', 'useCase4Content', 'whenUseNotebookLMTitle', 'notebookUseCase1Title', 'notebookUseCase1Content', 'notebookUseCase2Title', 'notebookUseCase2Content', 'notebookUseCase3Title', 'notebookUseCase3Content', 'notebookUseCase4Title', 'notebookUseCase4Content', 'combineTitle', 'combineContent', 'step1', 'step2', 'step3', 'step4', 'promptExampleTitle', 'promptTitle', 'promptDesc', 'conclusionTitle', 'conclusionContent', 'conclusionContent2', 'ctaText', 'ctaLink', 'seoKeywords']
};
