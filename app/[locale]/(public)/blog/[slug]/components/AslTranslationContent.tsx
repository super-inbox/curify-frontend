import { getVideoDubbingUrl, getSubtitleGeneratorUrl } from "../utils/blog-helpers";
import { formatAslContent } from "../utils/content-formatters";

interface AslTranslationContentProps {
  slug: string;
  t: any;
  tEn: any;
  locale: string;
}

export default function AslTranslationContent({ slug, t, tEn, locale }: AslTranslationContentProps) {
  // Get the namespace based on slug
  const namespace = 'aslVideoTranslator';
  
  // Define which keys exist for ASL blog post type
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

      <div className="border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-lg my-2 not-prose">
        <p className="font-semibold mb-2">Looking for the tool, not the guide?</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          See a working ASL → English subtitle demo on a real signed clip, then join early access for your own uploads.
        </p>
        <a
          href="/tools/asl-video-translator"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          Try the ASL Video Translator →
        </a>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatAslContent(safeT("whatIsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("whenNeededTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatAslContent(safeT("whenNeededContent"))
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
                  __html: formatAslContent(safeT("step1Content"))
                }} 
              />
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step2Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatAslContent(safeT("step2Content"))
                }} 
              />
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold mb-2">{safeT("step3Title")}</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatAslContent(safeT("step3Content"))
                }} 
              />
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatAslContent(safeT("howContent"))
            }} 
          />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatAslContent(safeT("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("curifyTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatAslContent(safeT("curifyContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{safeT("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatAslContent(safeT("conclusionContent"))
          }} 
        />
      </section>
    </div>
  );
}
