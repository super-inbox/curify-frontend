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
  const t = await getTranslations({ locale, namespace: "aslVideoTranslator" });

  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default function AslVideoTranslatorPage() {
  const t = useTranslations("aslVideoTranslator");

  // Get related templates for ASL translation
  const translationTemplates = getTemplatesByCategory("video-translation", "en");
  const subtitleTemplates = getTemplatesByCategory("subtitle-generation", "en");

  return (
    <div className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src="/images/asl-video-translator.jpg"
            alt="ASL Video Translator"
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
            🎯 {t("whatIsTitle")}
          </h2>
          <p className="mb-4">{t("whatIsContent")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("whenNeededTitle")}</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🎓 Education</h3>
              <p className="text-sm">Make educational content accessible to deaf and hard-of-hearing students</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🏥 Healthcare</h3>
              <p className="text-sm">Ensure clear communication in medical settings and patient education</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">⚖️ Legal</h3>
              <p className="text-sm">Provide equal access to legal information and proceedings</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">📺 Media</h3>
              <p className="text-sm">Create inclusive entertainment and news content for all audiences</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("howTitle")}</h2>
          <p className="mb-4">{t("howContent")}</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold mb-2">🤖 AI-Powered Recognition</h3>
              <p>Advanced computer vision analyzes hand movements, facial expressions, and body language in real-time.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold mb-2">🧠 Contextual Understanding</h3>
              <p>Machine learning models interpret signs within context, accounting for regional variations and cultural nuances.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold mb-2">⚡ Real-Time Translation</h3>
              <p>Instant conversion between ASL and text/spoken language for seamless communication.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🎥 Video Analysis Tools</h3>
              <p className="text-sm">Professional software for analyzing and translating recorded ASL content</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">📱 Mobile Apps</h3>
              <p className="text-sm">Portable solutions for on-the-go ASL translation and communication</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🔗 Integration Platforms</h3>
              <p className="text-sm">APIs and tools for integrating ASL translation into existing workflows</p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold mb-4 text-green-800">
            ✨ {t("curifyTitle")}
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
              <a href="/subtitle-generator" className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Generate Subtitles
              </a>
            </div>
            <div className="mt-3">
              <p className="text-green-600 text-sm">
                🔗 Also try: <a href="/video-dubbing" className="text-blue-600 hover:underline">Video Dubbing</a>
              </p>
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
            🛠️ Related Translation Tools
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
