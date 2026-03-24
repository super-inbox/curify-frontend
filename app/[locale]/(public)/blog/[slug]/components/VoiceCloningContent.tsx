import { getVideoDubbingUrl, getSubtitleGeneratorUrl } from "../utils/blog-helpers";
import { formatVoiceCloningContent } from "../utils/content-formatters";

interface VoiceCloningContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function VoiceCloningContent({ slug, t, locale }: VoiceCloningContentProps) {
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
            __html: formatVoiceCloningContent(t("whatIsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("howWorksTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatVoiceCloningContent(t("howWorksContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatVoiceCloningContent(t("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("useCasesTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatVoiceCloningContent(t("useCasesContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("ethicalTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatVoiceCloningContent(t("ethicalContent"))
          }} 
        />
      </section>

      {(t("galleryTitle", { defaultValue: null }) || t("galleryContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("galleryTitle") || ""}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatVoiceCloningContent(t("galleryContent") || "")
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
              __html: formatVoiceCloningContent(t("PipelineContent") || "")
            }} 
          />
        </section>
      )}

      {(t("subtitleText", { defaultValue: null }) || t("SubtitleContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("subtitleText") || ""}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatVoiceCloningContent(t("SubtitleContent") || "")
            }} 
          />
        </section>
      )}

      {(t("complianceTitle", { defaultValue: null }) || t("complianceContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("complianceTitle") || ""}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatVoiceCloningContent(t("complianceContent") || "")
            }} 
          />
        </section>
      )}

      {(t("TemplateTitle", { defaultValue: null }) || t("TemplateContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("TemplateTitle") || ""}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatVoiceCloningContent(t("TemplateContent") || "")
            }} 
          />
        </section>
      )}

      {(t("ReferencesTitle", { defaultValue: null }) || t("ReferencesContent", { defaultValue: null })) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("ReferencesTitle") || ""}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatVoiceCloningContent(t("ReferencesContent") || "")
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
            __html: formatVoiceCloningContent(t("conclusionContent"))
          }} 
        />
      </section>
    </div>
  );
}
