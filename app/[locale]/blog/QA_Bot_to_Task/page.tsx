import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "🏗️ From QA Bot to Task Agent: An Architecture Guide",
  description: "Learn how to build reliable task agents that go beyond simple question answering"
};

interface Layer {
  title: string;
  points: string[];
}

export default function QABotToTaskAgent() {
  const t = useTranslations("qaBotToTaskAgent");
  
  return (
    <article className="max-w-4xl pt-20 mx-auto px-6 pb-12 text-lg leading-8">
      <h1 className="text-4xl font-bold mb-8">
        {t("heading")}
      </h1>

      <p className="mb-6 font-semibold text-gray-700">
        {t("tldr")}
      </p>

      <p className="mb-8">
        {t("intro")}
      </p>

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
          {t("dynamicSkillExample.content")}
        </pre>
      </section>

      {/* Deterministic Hook Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("deterministicHookExample.title")}
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
          {t("deterministicHookExample.content")}
        </pre>
      </section>

      {/* Final Thought */}
      <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <p className="text-lg font-medium">{t("finalThought")}</p>
      </div>
    </article>
  );
}