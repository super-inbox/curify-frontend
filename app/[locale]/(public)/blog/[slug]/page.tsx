import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import CdnImage from "../../_components/CdnImage";
import TemplateLink, { TemplateSuggestions } from "../../_components/TemplateLink";
import { getTemplatesByCategory } from "@/utils/blogUtils";
import { notFound } from "next/navigation";

// Blog post configuration - this will contain all our blog posts
const blogPosts = {
  // YouTube Translation blogs
  "translate-youtube-video": {
    titleKey: "translateYoutubeVideo.title",
    descriptionKey: "translateYoutubeVideo.intro",
    image: "/images/youtube-translation.jpg",
    category: "video-translation",
    relatedCategories: ["video-translation", "subtitle-generation"]
  },
  "translate-youtube-video-to-english": {
    titleKey: "translateYoutubeVideoToEnglish.title", 
    descriptionKey: "translateYoutubeVideoToEnglish.intro",
    image: "/images/youtube-english-translation.jpg",
    category: "video-translation",
    relatedCategories: ["video-translation", "video-dubbing"]
  },
  "ai-youtube-video-translator": {
    titleKey: "aiYoutubeVideoTranslator.title",
    descriptionKey: "aiYoutubeVideoTranslator.intro", 
    image: "/images/ai-youtube-translator.jpg",
    category: "video-translation",
    relatedCategories: ["video-translation", "ai-tools"]
  },
  
  // Voice Cloning blogs
  "what-is-voice-cloning": {
    titleKey: "whatIsVoiceCloning.title",
    descriptionKey: "whatIsVoiceCloning.intro",
    image: "/images/voice-cloning-basics.jpg",
    category: "audio-ai",
    relatedCategories: ["audio-ai", "video-dubbing"]
  },
  "voice-cloning-tools": {
    titleKey: "voiceCloningTools.title",
    descriptionKey: "voiceCloningTools.intro",
    image: "/images/voice-cloning-tools.jpg", 
    category: "audio-ai",
    relatedCategories: ["audio-ai", "video-dubbing"]
  },
  "f5-tts-voice-cloning": {
    titleKey: "f5TtsVoiceCloning.title",
    descriptionKey: "f5TtsVoiceCloning.intro",
    image: "/images/f5-tts-voice-cloning.jpg",
    category: "audio-ai", 
    relatedCategories: ["audio-ai", "video-dubbing"]
  },

  // ASL Translation pages (tool-oriented landing pages)
  "asl-video-translator": {
    titleKey: "aslVideoTranslator.title",
    descriptionKey: "aslVideoTranslator.intro",
    image: "/images/asl-video-translator.jpg",
    category: "accessibility",
    relatedCategories: ["video-translation", "subtitle-generation"]
  },
  "how-to-translate-asl-video": {
    titleKey: "howToTranslateAslVideo.title",
    descriptionKey: "howToTranslateAslVideo.intro",
    image: "/images/asl-translation-guide.jpg",
    category: "accessibility", 
    relatedCategories: ["video-translation", "accessibility"]
  }
};

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
    const t = await getTranslations({ locale, namespace: `blog.${slug}` });
    
    return {
      title: t(blogConfig.titleKey),
      description: t(blogConfig.descriptionKey),
    };
  } catch (error) {
    // Fallback if translation not found
    return {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: "Learn more about AI-powered content creation tools",
    };
  }
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const t = useTranslations();
  const { locale, slug } = params;
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    notFound();
  }

  // Get related templates based on blog post categories
  const relatedTemplates = blogConfig.relatedCategories.flatMap(category => 
    getTemplatesByCategory(category, locale)
  );

  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src={blogConfig.image}
            alt={t(`blog.${slug}.${blogConfig.titleKey}`)}
            width={400}
            height={250}
            className="rounded-lg object-cover"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          {t(`blog.${slug}.${blogConfig.titleKey}`)}
        </h1>
        
        <div className="text-gray-600 mb-4">
          {t(`blog.${slug}.date`, { defaultValue: "Latest Article" })} • {" "}
          {t(`blog.${slug}.readTime`, { defaultValue: "5 min read" })}
        </div>
      </div>

      <div className="clear-both">
        {/* Dynamic content rendering based on slug */}
        {slug.startsWith('translate-youtube-video') && (
          <YoutubeTranslationContent slug={slug} />
        )}
        {slug.startsWith('voice-cloning') || slug === 'what-is-voice-cloning' || slug === 'f5-tts-voice-cloning' && (
          <VoiceCloningContent slug={slug} />
        )}
        {slug.includes('asl') && (
          <AslTranslationContent slug={slug} />
        )}
      </div>

      {/* Related Templates Section */}
      {relatedTemplates.length > 0 && (
        <aside className="mt-12 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✨ Related Curify Tools
          </h3>
          <div className="grid gap-3">
            {relatedTemplates.slice(0, 6).map((template) => (
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
function YoutubeTranslationContent({ slug }: { slug: string }) {
  const t = useTranslations(`blog.${slug}`);
  
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
            🎯 {t("ctaText")} <a href="/video-translator" className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <p>{t("conclusionContent")}</p>
      </section>
    </div>
  );
}

function VoiceCloningContent({ slug }: { slug: string }) {
  const t = useTranslations(`blog.${slug}`);
  
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
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <p>{t("conclusionContent")}</p>
      </section>
    </div>
  );
}

function AslTranslationContent({ slug }: { slug: string }) {
  const t = useTranslations(`blog.${slug}`);
  
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-indigo-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <p className="mb-4">{t("whatIsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whenNeededTitle")}</h2>
        <p className="mb-4">{t("whenNeededContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("howTitle")}</h2>
        <p className="mb-4">{t("howContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <p className="mb-4">{t("toolsContent")}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <p className="mb-4">{t("curifyContent")}</p>
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-indigo-800">
            🎯 {t("ctaText")} <a href="/video-translator" className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <p>{t("conclusionContent")}</p>
      </section>
    </div>
  );
}
