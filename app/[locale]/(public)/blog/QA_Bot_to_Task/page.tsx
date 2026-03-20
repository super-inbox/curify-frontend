import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from 'next/link';
import CdnImage from '../../../_components/CdnImage';
import RelatedBlogs from '../../../_components/RelatedBlogs';
import { FaTools, FaLightbulb, FaRocket } from 'react-icons/fa';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "qaBotToTaskAgent" });

  return {
    title: t("heading"),
    description: t.has("description") ? t("description") : t("intro"),
  };
}

interface Layer {
  title: string;
  points: string[];
}

const normalizeCodeBlock = (value: unknown): string =>
  String(value).replace(/\\n/g, "\n").replace(/\\t/g, "\t");

export default async function QABotToTaskAgent({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "qaBotToTaskAgent" });
  
  return (
    <div className="pt-10 pb-8">
      {/* Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          {/* Tools & Resources section removed */}
        </div>
      </aside>

      {/* Main Content */}
      <article className="flex-1 max-w-4xl text-lg leading-8">
        <h1 className="text-4xl font-bold mb-8">
          {t("heading")}
        </h1>

        <p className="mb-6 font-semibold text-gray-700">
        {t("tldr")}
      </p>

      <p className="mb-8">
        {t("intro")}
      </p>
      
      <div className="my-8 rounded-lg overflow-hidden shadow-lg">
        <img 
          src="https://storage.googleapis.com/curify-static/taskAgent.jpg" 
          alt={t("taskAgentImageAlt")}
          className="w-full h-auto"
        />
      </div>

      {/* Core Shift Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("coreShift.title")}
        </h2>
        <div className="space-y-4 mb-6">
          {t.raw("coreShift.content")?.map((item: string, index: number) => (
            <p key={index} className="text-gray-700">{item}</p>
          ))}
        </div>
        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-r">
          <p className="font-medium">💡 {t("coreShift.keyInsight")}</p>
        </div>
      </section>

      {/* Three Layer Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          {t("threeLayerArch.title")}
        </h2>
        <div className="space-y-8">
          {(t.raw("threeLayerArch.layers") as Layer[]).map((layer: Layer, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-3">{layer.title}</h3>
              <ul className="space-y-2">
                {layer.points.map((point: string, pointIndex: number) => (
                  <li key={pointIndex} className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Project Structure */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("projectStructure.title")}
        </h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {t("projectStructure.structure")}
        </pre>
      </section>

      {/* Static Context Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("staticContextExample.title")}
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
          {t("staticContextExample.content")}
        </pre>
      </section>

      {/* Dynamic Skill Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("dynamicSkillExample.title")}
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
          {normalizeCodeBlock(t.raw("dynamicSkillExample.content"))}
        </pre>
      </section>

      {/* Deterministic Hook Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("deterministicHookExample.title")}
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
          {normalizeCodeBlock(t.raw("deterministicHookExample.content"))}
        </pre>
      </section>

      {/* Final Thought */}
      <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <p className="text-lg font-medium">{t("finalThought")}</p>
      </div>

      {/* Related Articles */}
      <RelatedBlogs currentSlug="QA_Bot_to_Task" locale={locale} />
      </article>
    </div>
  );
}
