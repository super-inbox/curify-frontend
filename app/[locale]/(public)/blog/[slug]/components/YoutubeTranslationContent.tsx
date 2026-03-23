import { getVideoDubbingUrl, getSubtitleGeneratorUrl } from "../utils/blog-helpers";
import { formatContent } from "../utils/content-formatters";

interface YoutubeTranslationContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function YoutubeTranslationContent({ slug, t, locale }: YoutubeTranslationContentProps) {
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
            {t("step4Title", { defaultValue: null }) && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{t("step4Title")}</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(t("step4Content"))
                  }} 
                />
              </div>
            )}
            {t("step5Title", { defaultValue: null }) && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{t("step5Title")}</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(t("step5Content"))
                  }} 
                />
              </div>
            )}
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
