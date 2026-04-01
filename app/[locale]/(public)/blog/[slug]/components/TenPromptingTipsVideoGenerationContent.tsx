import { formatContent } from "../utils/content-formatters";
import PromptBox from "./PromptBox";

interface TenPromptingTipsVideoGenerationContentProps {
  slug: string;
  t: any;
  arrayData: Record<string, any>;
  locale: string;
}

export default function TenPromptingTipsVideoGenerationContent({ slug, t, arrayData, locale }: TenPromptingTipsVideoGenerationContentProps) {
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
        {t("tip1Example") && (
          <PromptBox 
            title={`${t("tip1Title")} - Example Prompt`}
            promptText={t("tip1Example")}
          >
            <pre>{t("tip1Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip2Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip2Content"))
          }} 
        />
        {t("tip2Example") && (
          <PromptBox 
            title={`${t("tip2Title")} - Example Prompt`}
            promptText={t("tip2Example")}
          >
            <pre>{t("tip2Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip3Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip3Content"))
          }} 
        />
        {t("tip3Example") && (
          <PromptBox 
            title={`${t("tip3Title")} - Example Prompt`}
            promptText={t("tip3Example")}
          >
            <pre>{t("tip3Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip4Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip4Content"))
          }} 
        />
        {t("tip4Example") && (
          <PromptBox 
            title={`${t("tip4Title")} - Example Prompt`}
            promptText={t("tip4Example")}
          >
            <pre>{t("tip4Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip5Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip5Content"))
          }} 
        />
        {t("tip5Example") && (
          <PromptBox 
            title={`${t("tip5Title")} - Example Prompt`}
            promptText={t("tip5Example")}
          >
            <pre>{t("tip5Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip6Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip6Content"))
          }} 
        />
        {t("tip6Example") && (
          <PromptBox 
            title={`${t("tip6Title")} - Example Prompt`}
            promptText={t("tip6Example")}
          >
            <pre>{t("tip6Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip7Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip7Content"))
          }} 
        />
        {t("tip7Example") && (
          <PromptBox 
            title={`${t("tip7Title")} - Example Prompt`}
            promptText={t("tip7Example")}
          >
            <pre>{t("tip7Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip8Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip8Content"))
          }} 
        />
        {t("tip8Example") && (
          <PromptBox 
            title={`${t("tip8Title")} - Example Prompt`}
            promptText={t("tip8Example")}
          >
            <pre>{t("tip8Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip9Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip9Content"))
          }} 
        />
        {t("tip9Example") && (
          <PromptBox 
            title={`${t("tip9Title")} - Example Prompt`}
            promptText={t("tip9Example")}
          >
            <pre>{t("tip9Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tip10Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("tip10Content"))
          }} 
        />
        {t("tip10Example") && (
          <PromptBox 
            title={`${t("tip10Title")} - Example Prompt`}
            promptText={t("tip10Example")}
          >
            <pre>{t("tip10Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("quickStartSummaryTitle")}</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("quickStartSubtitle")}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800">{t("beginnerPathTitle")}</h4>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                {(arrayData["quickStartBeginnerSteps"] || []).map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">{t("advancedPathTitle")}</h4>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                {(arrayData["quickStartAdvancedSteps"] || []).map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("beforeAfterTitle")}</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-red-600">{t("basicPromptTitle")}</h3>
          <PromptBox 
            title={t("basicPromptBoxTitle")}
            promptText={t("basicPromptText")}
          >
            <pre>{t("basicPromptText")}</pre>
          </PromptBox>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
            <p className="text-red-800"><strong>{t("basicPromptIssues")}</strong></p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-green-600">{t("professionalPromptTitle")}</h3>
          <PromptBox 
            title={t("professionalPromptBoxTitle")}
            promptText={t("professionalPromptText")}
          >
            <pre>{t("professionalPromptText")}</pre>
          </PromptBox>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
            <p className="text-green-800"><strong>{t("professionalPromptImprovements")}</strong></p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("platformOptimizationTitle")}</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-black text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{t("tiktokTitle")}</h3>
            <ul className="text-sm space-y-1">
              {(arrayData["tiktokFeatures"] || []).map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
          <div className="bg-red-600 text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{t("youtubeTitle")}</h3>
            <ul className="text-sm space-y-1">
              {(arrayData["youtubeFeatures"] || []).map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{t("instagramTitle")}</h3>
            <ul className="text-sm space-y-1">
              {(arrayData["instagramFeatures"] || []).map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>

        <PromptBox 
          title={t("platformOptimizationTemplateTitle")}
          promptText={t("platformOptimizationTemplateContent")}
        >
          <pre dangerouslySetInnerHTML={{ __html: arrayData["platformOptimizationTemplateDisplay"] || "" }} />
        </PromptBox>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("troubleshootingTitle")}</h2>
        
        <div className="space-y-4">
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">{t("problem1Title")}</h3>
            <p className="text-yellow-700 mb-2"><strong>Cause:</strong> {t("problem1Cause")}</p>
            <p className="text-yellow-700"><strong>Solution:</strong> {t("problem1Solution")}
            </p>
          </div>

          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">{t("problem2Title")}</h3>
            <p className="text-orange-700 mb-2"><strong>Cause:</strong> {t("problem2Cause")}</p>
            <p className="text-orange-700"><strong>Solution:</strong> {t("problem2Solution")}
            </p>
          </div>

          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">{t("problem3Title")}</h3>
            <p className="text-red-700 mb-2"><strong>Cause:</strong> {t("problem3Cause")}</p>
            <p className="text-red-700"><strong>Solution:</strong> {t("problem3Solution")}
            </p>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">{t("problem4Title")}</h3>
            <p className="text-blue-700 mb-2"><strong>Cause:</strong> {t("problem4Cause")}</p>
            <p className="text-blue-700"><strong>Solution:</strong> {t("problem4Solution")}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("qualityControlTitle")}</h2>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{t("qcSubtitle")}</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">{t("characterIdentityTitle")}</h4>
              <ul className="space-y-2 text-sm">
                {(arrayData["characterIdentityChecklist"] || []).map((item: string, index: number) => (
                  <li key={index}>□ {item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">{t("visualQualityTitle")}</h4>
              <ul className="space-y-2 text-sm">
                {(arrayData["visualQualityChecklist"] || []).map((item: string, index: number) => (
                  <li key={index}>□ {item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">{t("storyFlowTitle")}</h4>
              <ul className="space-y-2 text-sm">
                {(arrayData["storyFlowChecklist"] || []).map((item: string, index: number) => (
                  <li key={index}>□ {item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">{t("technicalSpecsTitle")}</h4>
              <ul className="space-y-2 text-sm">
                {(arrayData["technicalSpecsChecklist"] || []).map((item: string, index: number) => (
                  <li key={index}>□ {item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800 font-semibold">{t("scoringText")}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("toolsContent"))
          }} 
        />
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">{t("platformComparisonTitle")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yellow-300">
                  <th className="text-left p-2">Platform</th>
                  <th className="text-left p-2">Best For</th>
                  <th className="text-left p-2">Pricing</th>
                  <th className="text-left p-2">Quality</th>
                  <th className="text-left p-2">Learning Curve</th>
                </tr>
              </thead>
              <tbody>
                {(arrayData["platformComparisonTable"] || []).map((platform: any, index: number) => (
                  <tr key={index} className={index < 3 ? "border-b border-yellow-200" : ""}>
                    <td className="p-2 font-semibold">{platform.platform}</td>
                    <td className="p-2">{platform.bestFor}</td>
                    <td className="p-2">{platform.pricing}</td>
                    <td className="p-2">{platform.quality}</td>
                    <td className="p-2">{platform.learningCurve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
            🎯 {t("ctaText")} <a href={t("videoGenerationToolsUrl")} className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("actionPlanTitle")}</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">{t("week1Title")}</h3>
            <ul className="space-y-2 text-sm text-green-800">
              {(arrayData["week1Tasks"] || []).map((task: string, index: number) => (
                <li key={index}>✅ {task}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("week2Title")}</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              {(arrayData["week2Tasks"] || []).map((task: string, index: number) => (
                <li key={index}>✅ {task}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">{t("week3Title")}</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              {(arrayData["week3Tasks"] || []).map((task: string, index: number) => (
                <li key={index}>✅ {task}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">{t("week4Title")}</h3>
            <ul className="space-y-2 text-sm text-orange-800">
              {(arrayData["week4Tasks"] || []).map((task: string, index: number) => (
                <li key={index}>✅ {task}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("conclusionContent"))
          }} 
        />
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 {t("successMetricsTitle")}</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800">{t("qualityMetricsTitle")}</h4>
              <ul className="text-blue-700 space-y-1">
                {(arrayData["successMetricsContent"] || []).map((metric: string, index: number) => (
                  <li key={index}>• {metric}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">{t("engagementMetricsTitle")}</h4>
              <ul className="text-blue-700 space-y-1">
                {(arrayData["engagementMetricsContent"] || []).map((metric: string, index: number) => (
                  <li key={index}>• {metric}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">{t("efficiencyMetricsTitle")}</h4>
              <ul className="text-blue-700 space-y-1">
                {(arrayData["efficiencyMetricsContent"] || []).map((metric: string, index: number) => (
                  <li key={index}>• {metric}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">{t("nextLearningTitle")}</h3>
          <ul className="space-y-2 text-green-800">
            {(arrayData["learningResourcesContent"] || []).map((resource: string, index: number) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: resource }} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
