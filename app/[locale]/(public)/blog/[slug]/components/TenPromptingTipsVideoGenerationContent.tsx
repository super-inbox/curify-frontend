import { formatContent } from "../utils/content-formatters";

interface TenPromptingTipsVideoGenerationContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function TenPromptingTipsVideoGenerationContent({ slug, t, locale }: TenPromptingTipsVideoGenerationContentProps) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip1Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip1Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip2Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip2Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip3Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip3Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip4Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip4Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip5Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip5Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip6Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip6Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip7Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip7Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip8Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip8Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip9Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip9Content"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip10Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip10Content"))
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
            🎯 {t("ctaText")} <a href="http://localhost:3000/video-generation-tools" className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
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
