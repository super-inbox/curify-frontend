import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Zap, DollarSign, Palette, Cpu, Globe, BarChart, Users, Code, BookOpen, TrendingUp } from 'lucide-react';
import { formatContent } from '../utils/content-formatters';

interface ImageGenerationModelComparisonContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function ImageGenerationModelComparisonContent({ slug, t, locale }: ImageGenerationModelComparisonContentProps) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section className="prose prose-lg max-w-none">
        <p className="text-xl font-semibold text-blue-600 mb-6">
          {t("intro")}
        </p>
      </section>

      {/* Understanding AI Image Generation */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <BookOpen className="mr-3 h-6 w-6 text-blue-600" />
          {t("whatIsTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("whatIsContent"))
          }} 
        />
      </section>

      {/* The Big Three Overview */}
      <section>
        <h2 className="text-2xl font-bold mb-6">{t("modelsTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-6">
          <p>{t("modelsContent")}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* DALL-E 3 */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-800">{t("dalle3Title")}</h3>
            </div>
            <p className="text-gray-700 mb-4">{t("dalle3Content")}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>ChatGPT integration</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>API access</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>High accuracy</span>
              </div>
            </div>
          </div>

          {/* Midjourney */}
          <div className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-purple-800">{t("midjourneyTitle")}</h3>
            </div>
            <p className="text-gray-700 mb-4">{t("midjourneyContent")}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Artistic quality</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Strong community</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Style variety</span>
              </div>
            </div>
          </div>

          {/* Stable Diffusion */}
          <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Cpu className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800">{t("stableDiffusionTitle")}</h3>
            </div>
            <p className="text-gray-700 mb-4">{t("stableDiffusionContent")}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Open source</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Full control</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Custom models</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Head-to-Head Comparison */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart className="mr-3 h-6 w-6 text-gray-700" />
          {t("comparisonTitle")}
        </h2>
        <p className="text-gray-700 mb-6">{t("comparisonContent")}</p>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Feature</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-600">DALL-E 3</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-purple-600">Midjourney</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-green-600">Stable Diffusion</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Resolution</td>
                <td className="border border-gray-300 px-4 py-3 text-center">1024×1024</td>
                <td className="border border-gray-300 px-4 py-3 text-center">Variable (up to 2048×2048)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">Customizable (512-2048+)</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Speed</td>
                <td className="border border-gray-300 px-4 py-3 text-center">10-30s</td>
                <td className="border border-gray-300 px-4 py-3 text-center">30-60s</td>
                <td className="border border-gray-300 px-4 py-3 text-center">2-60s (GPU dependent)</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Cost per Image</td>
                <td className="border border-gray-300 px-4 py-3 text-center">$0.04</td>
                <td className="border border-gray-300 px-4 py-3 text-center">$0.33-2.00</td>
                <td className="border border-gray-300 px-4 py-3 text-center">Free (hardware/cloud cost)</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Learning Curve</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Easy
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Medium
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Hard
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed Performance Metrics */}
      <section>
        <h3 className="text-xl font-bold mb-4">{t("qualityTitle")}</h3>
        <div 
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("qualityContent"))
          }} 
        />

        <h3 className="text-xl font-bold mb-4">{t("speedTitle")}</h3>
        <div 
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("speedContent"))
          }} 
        />

        <h3 className="text-xl font-bold mb-4">{t("costTitle")}</h3>
        <div 
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("costContent"))
          }} 
        />
      </section>

      {/* Use Cases */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Users className="mr-3 h-6 w-6 text-indigo-600" />
          {t("useCasesTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("useCasesContent"))
          }} 
        />

        {/* Use Case Examples */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">{t("marketingMaterialsTitle")}</h4>
            <p className="text-sm text-gray-600">{t("marketingMaterialsContent")}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">{t("creativeProjectsTitle")}</h4>
            <p className="text-sm text-gray-600">{t("creativeProjectsContent")}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">{t("technicalApplicationsTitle")}</h4>
            <p className="text-sm text-gray-600">{t("technicalApplicationsContent")}</p>
          </div>
        </div>
      </section>

      {/* Tools & Integration */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Code className="mr-3 h-6 w-6 text-gray-700" />
          {t("toolsTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("toolsContent"))
          }} 
        />

        {/* Integration Difficulty */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">{t("integrationDifficultyTitle")}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span><strong>DALL-E 3:</strong> Easy - Direct API and ChatGPT integration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span><strong>Midjourney:</strong> Medium - Discord-based, limited API access</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span><strong>Stable Diffusion:</strong> Hard - Requires technical setup and maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curify Integration */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Globe className="mr-3 h-6 w-6 text-green-600" />
          {t("curifyTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(t("curifyContent"))
          }} 
        />

        {/* Curify Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">{t("unifiedWorkflowTitle")}</h4>
            <p className="text-sm text-gray-600">{t("unifiedWorkflowContent")}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">{t("promptOptimizationTitle")}</h4>
            <p className="text-sm text-gray-600">{t("promptOptimizationContent")}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">{t("assetManagementTitle")}</h4>
            <p className="text-sm text-gray-600">{t("assetManagementContent")}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">{t("batchProcessingTitle")}</h4>
            <p className="text-sm text-gray-600">{t("batchProcessingContent")}</p>
          </div>
        </div>
      </section>

      {/* Future Trends */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="mr-3 h-6 w-6 text-purple-600" />
          {t("futureTrendsTitle")}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("technicalAdvancementsTitle")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Higher resolution outputs (4K+)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Real-time generation capabilities</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Improved prompt understanding</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Better style consistency</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("marketEvolutionTitle")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Decreasing costs per generation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>More specialized models</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Enterprise-grade solutions</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Integration with creative workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">{t("faqTitle")}</h2>
        
        <div className="space-y-4">
          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-semibold cursor-pointer hover:text-blue-600">
              {t("faq1Question")}
            </summary>
            <p className="mt-2 text-gray-700">
              {t("faq1Answer")}
            </p>
          </details>
          
          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-semibold cursor-pointer hover:text-blue-600">
              {t("faq2Question")}
            </summary>
            <p className="mt-2 text-gray-700">
              {t("faq2Answer")}
            </p>
          </details>
          
          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-semibold cursor-pointer hover:text-blue-600">
              {t("faq3Question")}
            </summary>
            <p className="mt-2 text-gray-700">
              {t("faq3Answer")}
            </p>
          </details>
          
          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-semibold cursor-pointer hover:text-blue-600">
              {t("faq4Question")}
            </summary>
            <p className="mt-2 text-gray-700">
              {t("faq4Answer")}
            </p>
          </details>
        </div>
      </section>

      {/* Conclusion */}
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
