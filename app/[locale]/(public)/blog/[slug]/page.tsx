import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { notFound } from "next/navigation";
import blogsData from "@/public/data/blogs.json";
import categoriesData from "@/public/data/blog-categories.json";
import RelatedBlogs from "@/app/[locale]/_components/RelatedBlogs";
import { getToolBySlug } from "@/lib/tools-registry";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// Helper functions to get tool URLs from registry
function getVideoDubbingUrl(locale: string) {
  const tool = getToolBySlug("video-dubbing");
  if (tool && tool.status === "create") {
    return `/${locale}/video-dubbing`;
  }
  return `/${locale}/tools`;
}

function getSubtitleGeneratorUrl(locale: string) {
  const tool = getToolBySlug("bilingual-subtitles");
  if (tool && tool.status === "create") {
    return `/${locale}/bilingual-subtitles`;
  }
  return `/${locale}/tools`;
}

// Helper function to map blog data to the expected format
function createBlogPostsConfig() {
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
      'nano-banana-prompt-ecosystem': 'nanoBananaPromptEcosystem'
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
const blogPosts = createBlogPostsConfig();

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    return { title: "Blog Post Not Found" };
  }

  try {
    const t = await getTranslations({ locale, namespace: `blog.${blogConfig.namespace}` });
    
    console.log('Namespace:', `blog.${blogConfig.namespace}`);
    console.log('TitleKey:', blogConfig.titleKey);
    console.log('DescriptionKey:', blogConfig.descriptionKey);
    console.log('Available keys:', Object.keys(t));
    
    const metadata: Metadata = {
      title: t(blogConfig.titleKey),
      description: t(blogConfig.descriptionKey),
    };
    
    // Add SEO keywords if available
    if (t.has('seoKeywords')) {
      metadata.keywords = t('seoKeywords');
    }
    
    // Add custom meta description if available (overrides the default description)
    if (t.has('metaDescription')) {
      metadata.description = t('metaDescription');
    }
    
    return metadata;
  } catch (error) {
    // Fallback to English translations if locale translations not found
    try {
      const t = await getTranslations({ locale: 'en', namespace: `blog.${blogConfig.namespace}` });
      
      const metadata: Metadata = {
        title: t(blogConfig.titleKey),
        description: t(blogConfig.descriptionKey),
      };
      
      // Add SEO keywords if available
      if (t.has('seoKeywords')) {
        metadata.keywords = t('seoKeywords');
      }
      
      // Add custom meta description if available (overrides the default description)
      if (t.has('metaDescription')) {
        metadata.description = t('metaDescription');
      }
      
      return metadata;
    } catch (fallbackError) {
      // Final fallback if even English fails
      return {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: "Learn more about AI-powered content creation tools",
      };
    }
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: `blog` });

  // Get English fallback translations if current locale is not English
  let tEn = null;
  if (locale !== 'en') {
    try {
      tEn = await getTranslations({ locale: 'en', namespace: `blog` });
    } catch (error) {
      // If English translations fail, we'll use defaults
    }
  }

  // Try to get namespace-specific translations with fallback
  let tNamespace = null;
  try {
    tNamespace = await getTranslations({ locale, namespace: `blog.${blogConfig.namespace}` });
  } catch (error) {
    // Fallback to English if locale translations not found
    try {
      tNamespace = await getTranslations({ locale: 'en', namespace: `blog.${blogConfig.namespace}` });
    } catch (fallbackError) {
      // If even English fails, tNamespace will remain null and we'll use defaults
    }
  }

  // Define which keys exist for each blog post type
  const availableKeys: Record<string, string[]> = {
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
    'translateYoutubeVideoToEnglish': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'aiYoutubeVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'whatIsVoiceCloning': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'voiceCloningTools': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'galleryTitle', 'galleryContent', 'PipelineTitle', 'PipelineContent', 'subtitleText', 'SubtitleContent', 'complianceTitle', 'complianceContent', 'TemplateTitle', 'TemplateContent', 'ReferencesTitle', 'ReferencesContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'f5TtsVoiceCloning': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'aslVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
        'chineseHerbalMedicineVisualGuide': ['intro', 'whatIsTitle', 'whatIsContent', 'historyTitle', 'historyContent', 'benefitsTitle', 'benefitsContent', 'popularTitle', 'popularContent', 'usageTitle', 'usageContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'evolutionTimelinesVisualization': ['intro', 'whatIsTitle', 'whatIsContent', 'importanceTitle', 'importanceContent', 'techniquesTitle', 'techniquesContent', 'examplesTitle', 'examplesContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'chineseCostumeHistoryInfographic': ['intro', 'whatIsTitle', 'whatIsContent', 'dynastiesTitle', 'dynastiesContent', 'characteristicsTitle', 'characteristicsContent', 'modernTitle', 'modernContent', 'culturalTitle', 'culturalContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'creativeAiToolsWebsites': ['intro', 'whatIsTitle', 'whatIsContent', 'inspirationTitle', 'inspirationContent', 'featuredTitle', 'featuredContent', 'aiTitle', 'aiContent', 'aiFeaturedTitle', 'aiFeaturedContent', 'conclusionTitle', 'conclusionContent'],
    'nanoBananaPromptEcosystem': ['intro', 'whatIsTitle', 'whatIsContent', 'ecosystemTitle', 'ecosystemContent', 'seoTitle', 'seoContent', 'generatorTitle', 'generatorContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent']
  };

  const currentKeys = availableKeys[blogConfig.namespace] || [];

  // Safe translation helper that only accesses known keys
  const safeT = (key: string, defaultValue = "") => {
    if (!currentKeys.includes(key)) {
      return defaultValue;
    }
    
    // Use namespace-specific translations if available
    if (tNamespace) {
      try {
        const result = tNamespace(key);
        // If the result is the same as the key, it means translation wasn't found
        if (result === key) {
          return defaultValue;
        }
        return result;
      } catch (error) {
        return defaultValue;
      }
    }
    
    return defaultValue;
  };

  // Helper to check if a translation key exists
  const hasKey = (key: string) => {
    return currentKeys.includes(key);
  };

  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src={blogConfig.image}
            alt={tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            width={400}
            height={250}
            className="rounded-lg object-cover"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          {tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>
        
        <div className="text-gray-600 mb-4">
          {tNamespace ? tNamespace("date", { defaultValue: "Latest Article" }) : "Latest Article"} • {" "}
          {tNamespace ? tNamespace("readTime", { defaultValue: "5 min read" }) : "5 min read"}
        </div>
      </div>

      <div className="clear-both">
        {/* Dynamic content rendering based on slug */}
        {(slug.startsWith('translate-youtube-video') || slug === 'ai-youtube-video-translator' || slug === 'translate-youtube-video-to-english') && (
          <YoutubeTranslationContent slug={slug} t={safeT} locale={locale} />
        )}
        {(slug.startsWith('voice-cloning') || slug === 'what-is-voice-cloning' || slug === 'f5-tts-voice-cloning') && (
          <VoiceCloningContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug.includes('asl') && (
          <AslTranslationContent slug={slug} t={t} tEn={tEn} locale={locale} />
        )}
        {(slug === 'chinese-herbal-medicine-visual-guide' || slug === 'evolution-timelines-visualization' || slug === 'chinese-costume-history-infographic') && (
          <NanoTemplateContent slug={slug} t={safeT} />
        )}
        {slug === 'nano-banana-prompt-ecosystem' && (
          <NanoBananaContent slug={slug} t={safeT} locale={locale} />
        )}
        
        {/* Original blog posts - use generic content renderer */}
        {!slug.startsWith('translate-youtube-video') && 
         slug !== 'ai-youtube-video-translator' && 
         !slug.startsWith('voice-cloning') && 
         slug !== 'what-is-voice-cloning' && 
         slug !== 'f5-tts-voice-cloning' && 
         !slug.includes('asl') &&
         slug !== 'chinese-herbal-medicine-visual-guide' &&
         slug !== 'evolution-timelines-visualization' &&
         slug !== 'chinese-costume-history-infographic' &&
         slug !== 'nano-banana-prompt-ecosystem' && (
          <div className="space-y-6">
            <p className="text-lg font-semibold text-blue-600 mb-4">
              {hasKey("intro") ? safeT("intro") : "Introduction"}
            </p>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("whatIsTitle") ? safeT("whatIsTitle") : "What is this?"}</h2>
              <p className="mb-4">{hasKey("whatIsContent") ? safeT("whatIsContent") : "Content description..."}</p>
            </section>

            {(hasKey("whyTitle") || hasKey("whyContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("whyTitle") ? safeT("whyTitle") : "Why This Matters"}</h2>
                <p className="mb-4">{hasKey("whyContent") ? safeT("whyContent") : "Learn why this topic is important..."}</p>
              </section>
            )}

            {(hasKey("howTitle") || hasKey("howContent") || hasKey("step1Title")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("howTitle") ? safeT("howTitle") : "How It Works"}</h2>
                {hasKey("step1Title") ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{safeT("step1Title")}</h3>
                      <p>{safeT("step1Content")}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{safeT("step2Title")}</h3>
                      <p>{safeT("step2Content")}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{safeT("step3Title")}</h3>
                      <p>{safeT("step3Content")}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mb-4">{hasKey("howContent") ? safeT("howContent") : "Step-by-step process..."}</p>
                )}
              </section>
            )}

            {(hasKey("howWorksTitle") || hasKey("howWorksContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("howWorksTitle") ? safeT("howWorksTitle") : "How It Works"}</h2>
                <p className="mb-4">{hasKey("howWorksContent") ? safeT("howWorksContent") : "Technical explanation..."}</p>
              </section>
            )}

            {(hasKey("inspirationTitle") || hasKey("inspirationContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("inspirationTitle") ? safeT("inspirationTitle") : "Creative Inspiration"}</h2>
                <p className="mb-4">{hasKey("inspirationContent") ? safeT("inspirationContent") : "Inspiration content..."}</p>
              </section>
            )}

            {(hasKey("featuredTitle") || hasKey("featuredContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("featuredTitle") ? safeT("featuredTitle") : "Featured Inspiration Tools"}</h2>
                <div 
                  className="prose prose-lg max-w-none mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: hasKey("featuredContent") ? safeT("featuredContent").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p className="mb-4">').replace(/\n/g, '<br/>') : "Featured tools content..."
                  }} 
                />
              </section>
            )}

            {(hasKey("aiTitle") || hasKey("aiContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("aiTitle") ? safeT("aiTitle") : "AI Generation Tools"}</h2>
                <p className="mb-4">{hasKey("aiContent") ? safeT("aiContent") : "AI tools content..."}</p>
              </section>
            )}

            {(hasKey("aiFeaturedTitle") || hasKey("aiFeaturedContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("aiFeaturedTitle") ? safeT("aiFeaturedTitle") : "Featured AI Tools"}</h2>
                <div 
                  className="prose prose-lg max-w-none mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: hasKey("aiFeaturedContent") ? safeT("aiFeaturedContent").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p className="mb-4">').replace(/\n/g, '<br/>') : "Featured AI tools content..."
                  }} 
                />
              </section>
            )}

            {(hasKey("ecosystemTitle") || hasKey("ecosystemContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("ecosystemTitle") ? safeT("ecosystemTitle") : "Ecosystem"}</h2>
                <p className="mb-4">{hasKey("ecosystemContent") ? safeT("ecosystemContent") : "Ecosystem content..."}</p>
              </section>
            )}

            {(hasKey("seoTitle") || hasKey("seoContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("seoTitle") ? safeT("seoTitle") : "SEO & Optimization"}</h2>
                <p className="mb-4">{hasKey("seoContent") ? safeT("seoContent") : "SEO content..."}</p>
              </section>
            )}

            {(hasKey("generatorTitle") || hasKey("generatorContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("generatorTitle") ? safeT("generatorTitle") : "Generator"}</h2>
                <p className="mb-4">{hasKey("generatorContent") ? safeT("generatorContent") : "Generator content..."}</p>
              </section>
            )}

            {(hasKey("useCasesTitle") || hasKey("useCasesContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("useCasesTitle") ? safeT("useCasesTitle") : "Use Cases"}</h2>
                <p className="mb-4">{hasKey("useCasesContent") ? safeT("useCasesContent") : "Common applications..."}</p>
              </section>
            )}

            {(hasKey("ethicalTitle") || hasKey("ethicalContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("ethicalTitle") ? safeT("ethicalTitle") : "Ethical Considerations"}</h2>
                <p className="mb-4">{hasKey("ethicalContent") ? safeT("ethicalContent") : "Important ethical guidelines..."}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("toolsTitle") ? safeT("toolsTitle") : "Tools & Resources"}</h2>
              <p className="mb-4">{hasKey("toolsContent") ? safeT("toolsContent") : "Learn about the best tools available..."}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("curifyTitle") ? safeT("curifyTitle") : "How Curify Can Help"}</h2>
              <p className="mb-4">{hasKey("curifyContent") ? safeT("curifyContent") : "Curify offers comprehensive solutions for content creators..."}</p>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  🎯 {hasKey("ctaText") ? safeT("ctaText") : "Ready to get started?"} <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline font-semibold">{hasKey("ctaLink") ? safeT("ctaLink") : "Try Curify's Tools"}</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("conclusionTitle") ? safeT("conclusionTitle") : "Conclusion"}</h2>
              <p>{hasKey("conclusionContent") ? safeT("conclusionContent") : "Start your journey with AI-powered content creation tools today."}</p>
            </section>
          </div>
        )}
      </div>

      {/* Related Blogs */}
      <RelatedBlogs currentSlug={slug} locale={locale} />

    </article>
  );
}

// Content components for different blog categories
function YoutubeTranslationContent({ slug, t, locale }: { slug: string; t: any; locale: string }) {
  const parseMarkdownTable = (content: string): string => {
    const lines = content.split('\n');
    let result = '';
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check if this is a table header
      if (line.startsWith('|') && line.includes('|') && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        
        // Check if next line is a separator (contains dashes)
        if (nextLine.startsWith('|') && nextLine.includes('-')) {
          // Parse header
          const headerCells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
          const columnCount = headerCells.length;
          
          // Start table
          result += '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr>';
          
          headerCells.forEach(header => {
            result += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">${header}</th>`;
          });
          
          result += '</tr></thead><tbody>';
          
          // Skip header and separator lines
          i += 2;
          
          // Parse table rows
          while (i < lines.length) {
            const rowLine = lines[i].trim();
            
            // Stop if we hit an empty line or non-table line
            if (!rowLine || !rowLine.startsWith('|')) {
              break;
            }
            
            const rowCells = rowLine.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            // Skip if row doesn't match column count
            if (rowCells.length === columnCount) {
              result += '<tr class="hover:bg-gray-50">';
              rowCells.forEach((cell, index) => {
                const isHeader = index === 0; // First column is often a header
                const cellClass = isHeader 
                  ? 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b'
                  : 'px-6 py-4 text-sm text-gray-500 border-b';
                result += `<td class="${cellClass}">${cell}</td>`;
              });
              result += '</tr>';
            }
            
            i++;
          }
          
          // Close table
          result += '</tbody></table>';
          continue;
        }
      }
      
      // Add non-table lines as-is
      result += lines[i] + '\n';
      i++;
    }
    
    return result;
  };

  const formatContent = (content: string) => {
    // First parse tables
    let processed = parseMarkdownTable(content);
    
    // Then handle other markdown formatting
    return processed
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle bullet points with bold headers: **Header**: Description
      .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
      // Handle bullet points at start of line
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Handle bullet points without space after dash (e.g., "-**Bold**: text")
      .replace(/-(\*\*(.*?)\*\*:)\s*(.+?)(?=\s*-\*\*|$)/g, '<li><strong>$2:</strong> $3</li>')
      // Handle bullet points after colon (like "criteria (adapt as needed):- Quality:")
      .replace(/:- (.+)$/gm, ':<ul class="list-disc pl-6 mb-4"><li>$1</li></ul>')
      // Handle bullet points after colon with space (like "calculator: - GPU")
      .replace(/: - (.+)$/gm, ':<ul class="list-disc pl-6 mb-4"><li>$1</li></ul>')
      // Convert consecutive list items to proper lists
      .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, '<ul class="list-disc pl-6 mb-4">$&</ul>')
      // Handle paragraph breaks (but avoid breaking within lists)
      .replace(/(<\/ul>)\s*\n\s*\n/g, '$1')
      .replace(/\n\n/g, '</p><p className="mb-4">')
      // Handle remaining line breaks
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("whatIsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whyTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("whyContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("howTitle")}</h2>
        {t("step1Title", { defaultValue: null }) ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">{t("step1Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(t("step1Content"))
                }} 
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">{t("step2Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(t("step2Content"))
                }} 
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">{t("step3Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(t("step3Content"))
                }} 
              />
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("howContent"))
            }} 
          />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("curifyContent"))
          }} 
        />
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 {t("ctaText")} <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-green-700 text-sm">
              🔗 Also try: <a href={getSubtitleGeneratorUrl(locale)} className="text-blue-600 hover:underline">Bilingual Subtitles</a> | <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline">Video Dubbing</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("conclusionContent"))
          }} 
        />
      </section>
    </div>
  );
}

function VoiceCloningContent({ slug, t, locale }: { slug: string; t: any; locale: string }) {
  const formatContent = (content: string) => {
    // Ensure content is a string, fallback to empty string if not
    const safeContent = typeof content === 'string' ? content : '';
    
    return safeContent
      // Handle code blocks first (before other markdown processing)
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const lang = language || 'text';
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code class="language-${lang}">${code.trim()}</code></pre>`;
      })
      // Handle inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Handle markdown tables first - support both with and without spaces
      // 4-column table header
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n\|---?\|---?\|---?\|---?\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$4</th></tr></thead><tbody>')
      // 3-column table header
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n\|---?\|---?\|---?\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th></tr></thead><tbody>')
      // Handle table rows - support both with and without spaces
      // 4-column table rows
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\s*$/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$4</td></tr>')
      // 3-column table rows
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td></tr>')
      // Close table tags
      .replace(/(<tr class="hover:bg-gray-50">[\s\S]*?<\/tr>)(\s*(?!<tr))/g, '$1</tbody></table>$2')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle bullet points with bold headers: **Header**: Description
      .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
      // Handle bullet points at start of line
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Handle bullet points after colon (like "criteria (adapt as needed):- Quality:")
      .replace(/:- (.+)$/gm, ':<ul class="list-disc pl-6 mb-4"><li>$1</li></ul>')
      // Handle bullet points after colon with space (like "calculator: - GPU")
      .replace(/: - (.+)$/gm, ':<ul class="list-disc pl-6 mb-4"><li>$1</li></ul>')
      // Convert consecutive list items to proper lists
      .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, '<ul class="list-disc pl-6 mb-4">$&</ul>')
      // Handle paragraph breaks (but avoid breaking within lists)
      .replace(/(<\/ul>)\s*\n\s*\n/g, '$1')
      .replace(/\n\n/g, '</p><p className="mb-4">')
      // Handle remaining line breaks
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-purple-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("whatIsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("howWorksTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("howWorksContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("useCasesTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("useCasesContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("ethicalTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("ethicalContent"))
          }} 
        />
      </section>

      {(t("galleryTitle", { defaultValue: null }) || t("galleryContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("galleryTitle") || "Gallery"}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("galleryContent") || "")
            }} 
          />
        </section>
      )}

      {t("PipelineTitle", { defaultValue: null }) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("PipelineTitle")}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("PipelineContent") || "Pipeline integration content...")
            }} 
          />
        </section>
      )}

      {(t("subtitleText", { defaultValue: null }) || t("SubtitleContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("subtitleText") || "Subtitles and Lip-sync"}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("SubtitleContent") || "")
            }} 
          />
        </section>
      )}

      {(t("complianceTitle", { defaultValue: null }) || t("complianceContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("complianceTitle") || "Compliance"}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("complianceContent") || "")
            }} 
          />
        </section>
      )}

      {(t("TemplateTitle", { defaultValue: null }) || t("TemplateContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("TemplateTitle") || "Templates"}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("TemplateContent") || "")
            }} 
          />
        </section>
      )}

      {(t("ReferencesTitle", { defaultValue: null }) || t("ReferencesContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("ReferencesTitle") || "References"}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(t("ReferencesContent") || "")
            }} 
          />
        </section>
      )}

      <section>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-purple-800">
            🎯 {t("ctaText")} <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-purple-700 text-sm">
              🔗 Also try: <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline">Video Dubbing</a> | <a href={getSubtitleGeneratorUrl(locale)} className="text-blue-600 hover:underline">Subtitle Generator</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("conclusionContent"))
          }} 
        />
      </section>
    </div>
  );
}

function AslTranslationContent({ slug, t, tEn, locale }: { slug: string; t: any; tEn: any; locale: string }) {
  // Get the namespace based on slug
  const namespace = 'aslVideoTranslator';
  
  const formatContent = (content: string) => {
    return content
      // Handle markdown tables first
      .replace(/\| (.+?) \| (.+?) \| (.+?) \|\n\| :--- \| :--- \| :--- \|\n/g, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th></tr></thead><tbody>')
      .replace(/\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n\| :--- \| :--- \| :--- \| :--- \|\n/g, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$4</th></tr></thead><tbody>')
      // Handle table rows
      .replace(/\| (.+?) \| (.+?) \| (.+?) \|/g, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td></tr>')
      .replace(/\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|/g, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$4</td></tr>')
      // Close table tags
      .replace(/(<tr class="hover:bg-gray-50">[\s\S]*?<\/tr>)(\s*(?!<tr))/g, '$1</tbody></table>$2')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle bullet points with bold headers: **Header**: Description
      .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
      // Handle regular bullet points
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Convert consecutive list items to proper lists
      .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, '<ul class="list-disc pl-6 mb-4">$&</ul>')
      // Handle paragraph breaks
      .replace(/\n\n/g, '</p><p className="mb-4">')
      // Handle remaining line breaks
      .replace(/\n/g, '<br/>');
  };
  
  // Define which keys exist for each ASL blog post type
  const availableKeys: Record<string, string[]> = {
    'aslVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent']
  };

  const currentKeys = availableKeys[namespace] || [];

  // Safe translation helper that mimics the parent logic but with correct namespace
  const safeT = (key: string, defaultValue = "") => {
    if (!currentKeys.includes(key)) {
      return defaultValue;
    }
    try {
      const result = t(`${namespace}.${key}`);
      // If the result is the same as the key, it means translation wasn't found
      if (result === `${namespace}.${key}`) {
        // Try English fallback
        if (tEn) {
          try {
            const englishResult = tEn(`${namespace}.${key}`);
            return englishResult !== `${namespace}.${key}` ? englishResult : defaultValue;
          } catch (error) {
            return defaultValue;
          }
        }
        return defaultValue;
      }
      return result;
    } catch (error) {
      // Try English fallback
      if (tEn) {
        try {
          return tEn(`${namespace}.${key}`);
        } catch (error) {
          return defaultValue;
        }
      }
      return defaultValue;
    }
  };

  // Helper to check if a translation key exists
  const hasKey = (key: string) => {
    return currentKeys.includes(key);
  };
  
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-indigo-600 mb-4">
        {safeT("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(safeT("whatIsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("whenNeededTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(safeT("whenNeededContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("howTitle")}</h2>
        {hasKey("step1Title") ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step1Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(safeT("step1Content"))
                }} 
              />
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step2Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(safeT("step2Content"))
                }} 
              />
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step3Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(safeT("step3Content"))
                }} 
              />
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(safeT("howContent"))
            }} 
          />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(safeT("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("curifyTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(safeT("curifyContent"))
          }} 
        />
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-indigo-800">
            🎯 {safeT("ctaText")} <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline font-semibold">{safeT("ctaLink")}</a>
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-indigo-700 text-sm">
              🔗 Also try: <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline">Video Dubbing</a> | <a href={getSubtitleGeneratorUrl(locale)} className="text-blue-600 hover:underline">Subtitle Generator</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(safeT("conclusionContent"))
          }} 
        />
      </section>
    </div>
  );
}

function getTemplateUrl(slug: string) {
  const templateMap: Record<string, string> = {
    'evolution-timelines-visualization': '/nano-template/evolution',
    'chinese-costume-history-infographic': '/nano-template/costume-zh',
    'chinese-herbal-medicine-visual-guide': '/nano-template/herbal-zh'
  };
  return templateMap[slug] || '/nano-template';
}

function NanoTemplateContent({ slug, t }: { slug: string; t: any }) {
  const formatContent = (content: string) => {
    return content
      // Handle markdown tables first - support both with and without spaces
      // 4-column table header
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n\|-+\s*\|[- ]+\s*\|[- ]+\s*\|[- ]+\s*\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$4</th></tr></thead><tbody>')
      // 3-column table header
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n\|-+\s*\|[- ]+\s*\|[- ]+\s*\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th></tr></thead><tbody>')
      // Handle table rows - support both with and without spaces
      // 4-column table rows
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$4</td></tr>')
      // 3-column table rows
      .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td></tr>')
      // Close table tags
      .replace(/(<tr class="hover:bg-gray-50">[\s\S]*?<\/tr>)(\s*(?!<tr))/g, '$1</tbody></table>$2')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle bullet points with bold headers: **Header**: Description
      .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
      // Handle regular bullet points
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Convert consecutive list items to proper lists
      .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, '<ul class="list-disc pl-6 mb-4">$&</ul>')
      // Handle paragraph breaks
      .replace(/\n\n/g, '</p><p className="mb-4">')
      // Handle remaining line breaks
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-green-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("whatIsContent"))
          }} 
        />
      </section>

      {(slug === 'chinese-herbal-medicine-visual-guide') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("historyTitle")}</h2>
            <p className="mb-4">{t("historyContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("benefitsTitle")}</h2>
            <p className="mb-4">{t("benefitsContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("popularTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(t("popularContent"))
              }} 
            />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("usageTitle")}</h2>
            <p className="mb-4">{t("usageContent")}</p>
          </section>
        </>
      )}

      {(slug === 'evolution-timelines-visualization') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("importanceTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(t("importanceContent"))
              }} 
            />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("techniquesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(t("techniquesContent"))
              }} 
            />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("examplesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(t("examplesContent"))
              }} 
            />
          </section>
        </>
      )}

      {(slug === 'chinese-costume-history-infographic') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("dynastiesTitle")}</h2>
            <p className="mb-4">{t("dynastiesContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("characteristicsTitle")}</h2>
            <p className="mb-4">{t("characteristicsContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("modernTitle")}</h2>
            <p className="mb-4">{t("modernContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("culturalTitle")}</h2>
            <p className="mb-4">{t("culturalContent")}</p>
          </section>
        </>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <p className="mb-4">{t("curifyContent")}</p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 {t("ctaText")} <a href={getTemplateUrl(slug)} className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: t("conclusionContent")
              .replace(/## (.+)/g, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/- \*\*Individual Herb Resources\*\*:/g, '<li><strong>Individual Herb Resources:</strong><ul class="list-disc pl-6 ml-4 mt-2 mb-2">')
              .replace(/- \*\*Research Reviews\*\*:/g, '<li><strong>Research Reviews:</strong><ul class="list-disc pl-6 ml-4 mt-2 mb-2">')
              .replace(/    - (.+)/g, '<li class="ml-6 text-sm">$1</li>')
              .replace(/^- (.+)(?!\n    -)/gm, '<li class="mb-1">$1</li></ul>')
              .replace(/\n\n/g, '<br /><br />')
          }}
        />
      </section>
    </div>
  );
}

function NanoBananaContent({ slug, t, locale }: { slug: string; t: any; locale: string }) {
  const formatContent = (content: string) => {
    return content
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle paragraph breaks
      .replace(/\n\n/g, '</p><p className="mb-4">')
      // Handle remaining line breaks
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("whatIsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("ecosystemTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("ecosystemContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("seoTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("seoContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("generatorTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("generatorContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("curifyContent"))
          }} 
        />
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 {t("ctaText")} <a href="http://localhost:3000/nano-banana-pro-prompts" className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("conclusionContent"))
          }} 
        />
      </section>
    </div>
  );
}
