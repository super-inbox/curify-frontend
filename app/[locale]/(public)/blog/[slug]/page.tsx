import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import TemplateLink, { TemplateSuggestions } from "@/app/[locale]/_components/TemplateLink";
import { getTemplatesByCategory, TemplateLink as TemplateLinkType } from "@/utils/blogUtils";
import { notFound } from "next/navigation";
import blogsData from "@/public/data/blogs.json";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

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
      'how-to-translate-asl-video': 'howToTranslateAslVideo'
    };
    
    namespace = namespaceMap[slug] || namespace;
    
    // Determine category based on tag or slug pattern
    let category = blog.tag?.toLowerCase().replace(/\s+/g, '-') || 'general';
    let relatedCategories: string[] = [];
    
    // Set related categories based on category
    if (category === 'ai-platform' || category === 'ai-architecture') {
      relatedCategories = [category, 'ai-tools'];
    } else if (category === 'video-analysis' || category === 'video-enhancement' || category === 'animation') {
      relatedCategories = [category, 'video-tools'];
    } else if (category === 'localization') {
      relatedCategories = [category, 'video-translation'];
    } else if (category === 'generative-tools' || category === 'tools-pipeline') {
      relatedCategories = [category, 'video-tools'];
    } else if (category === 'video-translation') {
      relatedCategories = [category, 'subtitle-generation'];
    } else if (category === 'ai-industry') {
      relatedCategories = [category, 'data-science'];
    } else if (category === 'ai-audio') {
      relatedCategories = [category, 'video-dubbing'];
    } else if (category === 'accessibility') {
      relatedCategories = ['video-translation', 'subtitle-generation'];
    } else {
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
    
    return {
      title: t(blogConfig.titleKey),
      description: t(blogConfig.descriptionKey),
    };
  } catch (error) {
    // Fallback to English translations if locale translations not found
    try {
      const t = await getTranslations({ locale: 'en', namespace: `blog.${blogConfig.namespace}` });
      
      return {
        title: t(blogConfig.titleKey),
        description: t(blogConfig.descriptionKey),
      };
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
    'voiceCloningTools': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'f5TtsVoiceCloning': ['intro', 'whatIsTitle', 'whatIsContent', 'howWorksTitle', 'howWorksContent', 'toolsTitle', 'toolsContent', 'useCasesTitle', 'useCasesContent', 'ethicalTitle', 'ethicalContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'aslVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'howContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'howToTranslateAslVideo': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent']
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

  // Get related templates based on blog post categories
  const relatedTemplates = blogConfig.relatedCategories.flatMap((category: string) => 
    getTemplatesByCategory(category, locale)
  );

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
        {slug.startsWith('translate-youtube-video') && (
          <YoutubeTranslationContent slug={slug} t={safeT} />
        )}
        {(slug.startsWith('voice-cloning') || slug === 'what-is-voice-cloning' || slug === 'f5-tts-voice-cloning') && (
          <VoiceCloningContent slug={slug} t={safeT} />
        )}
        {slug.includes('asl') && (
          <AslTranslationContent slug={slug} t={t} tEn={tEn} />
        )}
        
        {/* Original blog posts - use generic content renderer */}
        {!slug.startsWith('translate-youtube-video') && 
         !slug.startsWith('voice-cloning') && 
         slug !== 'what-is-voice-cloning' && 
         slug !== 'f5-tts-voice-cloning' && 
         !slug.includes('asl') && (
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
                  🎯 {hasKey("ctaText") ? safeT("ctaText") : "Ready to get started?"} <a href="/video-dubbing" className="text-blue-600 hover:underline font-semibold">{hasKey("ctaLink") ? safeT("ctaLink") : "Try Curify's Tools"}</a>
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

      {/* Related Templates Section */}
      {relatedTemplates.length > 0 && (
        <aside className="mt-12 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✨ Related Curify Tools
          </h3>
          <div className="grid gap-3">
            {relatedTemplates.slice(0, 6).map((template: TemplateLinkType) => (
              <TemplateLink
                key={template.id}
                href={template.url}
                title={template.title}
                category={template.category}
                className="block p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}

// Content components for different blog categories
function YoutubeTranslationContent({ slug, t }: { slug: string; t: any }) {
  
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <p className="mb-4">{t("whatIsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whyTitle")}</h2>
        <p className="mb-4">{t("whyContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("howTitle")}</h2>
        {t("step1Title", { defaultValue: null }) ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">{t("step1Title")}</h3>
              <p>{t("step1Content")}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">{t("step2Title")}</h3>
              <p>{t("step2Content")}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">{t("step3Title")}</h3>
              <p>{t("step3Content")}</p>
            </div>
          </div>
        ) : (
          <p className="mb-4">{t("howContent")}</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <p className="mb-4">{t("toolsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <p className="mb-4">{t("curifyContent")}</p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 {t("ctaText")} <a href="/video-dubbing" className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-green-700 text-sm">
              🔗 Also try: <a href="/tools/bilingual-subtitles" className="text-blue-600 hover:underline">Subtitle Generator</a> | <a href="/video-dubbing" className="text-blue-600 hover:underline">Video Dubbing</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <p>{t("conclusionContent")}</p>
      </section>
    </div>
  );
}

function VoiceCloningContent({ slug, t }: { slug: string; t: any }) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-purple-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <p className="mb-4">{t("whatIsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("howWorksTitle")}</h2>
        <p className="mb-4">{t("howWorksContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <p className="mb-4">{t("toolsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("useCasesTitle")}</h2>
        <p className="mb-4">{t("useCasesContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("ethicalTitle")}</h2>
        <p className="mb-4">{t("ethicalContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <p className="mb-4">{t("curifyContent")}</p>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-purple-800">
            🎯 {t("ctaText")} <a href="/video-dubbing" className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-purple-700 text-sm">
              🔗 Also try: <a href="/video-dubbing" className="text-blue-600 hover:underline">Video Translator</a> | <a href="/tools/bilingual-subtitles" className="text-blue-600 hover:underline">Subtitle Generator</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <p>{t("conclusionContent")}</p>
      </section>
    </div>
  );
}

function AslTranslationContent({ slug, t, tEn }: { slug: string; t: any; tEn: any }) {
  // Get the namespace based on slug
  const namespace = slug === 'asl-video-translator' ? 'aslVideoTranslator' : 'howToTranslateAslVideo';
  
  // Define which keys exist for each ASL blog post type
  const availableKeys: Record<string, string[]> = {
    'aslVideoTranslator': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'howContent', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent'],
    'howToTranslateAslVideo': ['intro', 'whatIsTitle', 'whatIsContent', 'whenNeededTitle', 'whenNeededContent', 'howTitle', 'step1Title', 'step1Content', 'step2Title', 'step2Content', 'step3Title', 'step3Content', 'toolsTitle', 'toolsContent', 'curifyTitle', 'curifyContent', 'ctaText', 'ctaLink', 'conclusionTitle', 'conclusionContent']
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
        <p className="mb-4">{safeT("whatIsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("whenNeededTitle")}</h2>
        <p className="mb-4">{safeT("whenNeededContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("howTitle")}</h2>
        {hasKey("step1Title") ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step1Title")}</h3>
              <p>{safeT("step1Content")}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step2Title")}</h3>
              <p>{safeT("step2Content")}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step3Title")}</h3>
              <p>{safeT("step3Content")}</p>
            </div>
          </div>
        ) : (
          <p className="mb-4">{safeT("howContent")}</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("toolsTitle")}</h2>
        <p className="mb-4">{safeT("toolsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("curifyTitle")}</h2>
        <p className="mb-4">{safeT("curifyContent")}</p>
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-indigo-800">
            🎯 {safeT("ctaText")} <a href="/video-dubbing" className="text-blue-600 hover:underline font-semibold">{safeT("ctaLink")}</a>
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-indigo-700 text-sm">
              🔗 Also try: <a href="/tools/bilingual-subtitles" className="text-blue-600 hover:underline">Subtitle Generator</a> | <a href="/video-dubbing" className="text-blue-600 hover:underline">Video Dubbing</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("conclusionTitle")}</h2>
        <p>{safeT("conclusionContent")}</p>
      </section>
    </div>
  );
}
