import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import CdnImage from "../../_components/CdnImage";
import TemplateLink, { TemplateSuggestions } from "../../_components/TemplateLink";
import { getTemplatesByCategory } from "@/utils/blogUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howToTranslateAslVideo" });

  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default function HowToTranslateAslVideoPage() {
  const t = useTranslations("howToTranslateAslVideo");

  // Get related templates for ASL translation workflow
  const translationTemplates = getTemplatesByCategory("video-translation", "en");
  const subtitleTemplates = getTemplatesByCategory("subtitle-generation", "en");

  return (
    <div className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src="/images/asl-translation-guide.jpg"
            alt="How to Translate ASL Video"
            width={400}
            height={250}
            className="rounded-lg object-cover"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-indigo-600">
          {t("title")}
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          {t("subtitle")}
        </p>
      </div>

      <div className="clear-both space-y-8">
        <section className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-2xl font-bold mb-4 text-indigo-800">
            📚 {t("whatIsTitle")}
          </h2>
          <p className="mb-4">{t("whatIsContent")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("whenNeededTitle")}</h2>
          <p className="mb-4">{t("whenNeededContent")}</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold mb-2">⚠️ Compliance Requirements</h3>
              <p className="text-sm">Meet ADA and accessibility standards for public content</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold mb-2">🌍 Global Reach</h3>
              <p className="text-sm">Expand your audience to include deaf and hard-of-hearing viewers worldwide</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold mb-2">📈 Engagement</h3>
              <p className="text-sm">Increase viewer engagement and comprehension through accessible content</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold mb-2">💼 Professional Standards</h3>
              <p className="text-sm">Maintain inclusive communication in professional and educational settings</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("howTitle")}</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                <h3 className="text-xl font-semibold">{t("step1Title")}</h3>
              </div>
              <p className="mb-4">{t("step1Content")}</p>
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">✅ Clear visibility of hands and face<br/>
                ✅ Good lighting and contrast<br/>
                ✅ Minimal background distractions<br/>
                ✅ Consistent signing speed</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                <h3 className="text-xl font-semibold">{t("step2Title")}</h3>
              </div>
              <p className="mb-4">{t("step2Content")}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border">
                  <h4 className="font-semibold mb-2">🤖 AI Translation</h4>
                  <p className="text-sm">Fast, scalable, cost-effective for standard content</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <h4 className="font-semibold mb-2">👤 Human Interpretation</h4>
                  <p className="text-sm">Highest accuracy, cultural nuance, complex content</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                <h3 className="text-xl font-semibold">{t("step3Title")}</h3>
              </div>
              <p className="mb-4">{t("step3Content")}</p>
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">🔍 Review with native ASL users<br/>
                🎯 Check cultural context and idioms<br/>
                ✏️ Make necessary adjustments<br/>
                📋 Ensure accuracy and clarity</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
          <p className="mb-4">{t("toolsContent")}</p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🎯 Professional ASL Services</h3>
              <p className="text-sm mb-2">Certified interpreters for high-stakes content</p>
              <ul className="text-sm text-gray-600 ml-4">
                <li>• Legal and medical accuracy</li>
                <li>• Cultural expertise</li>
                <li>• Quality assurance</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🤖 AI-Powered Platforms</h3>
              <p className="text-sm mb-2">Automated translation for standard content</p>
              <ul className="text-sm text-gray-600 ml-4">
                <li>• Real-time processing</li>
                <li>• Cost-effective scaling</li>
                <li>• Integration capabilities</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🔄 Hybrid Solutions</h3>
              <p className="text-sm mb-2">Combining AI efficiency with human oversight</p>
              <ul className="text-sm text-gray-600 ml-4">
                <li>• AI-first processing</li>
                <li>• Human review and refinement</li>
                <li>• Balanced quality and cost</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold mb-4 text-green-800">
            🛠️ {t("curifyTitle")}
          </h2>
          <p className="mb-4">{t("curifyContent")}</p>
          <div className="p-4 bg-white rounded border">
            <p className="text-green-700 font-semibold mb-3">
              🎯 {t("ctaText")}
            </p>
            <div className="flex gap-4">
              <a href="/video-translator" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                {t("ctaLink")}
              </a>
              <a href="/subtitle-generator" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                Create Accessible Subtitles
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
          <p>{t("conclusionContent")}</p>
        </section>

        {/* Related Tools Section */}
        <aside className="mt-12 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🛠️ Complete Accessibility Toolkit
          </h3>
          <div className="grid gap-3">
            {[...translationTemplates, ...subtitleTemplates].slice(0, 6).map((template) => (
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
      </div>
    </div>
  );
}
