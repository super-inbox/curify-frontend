import { Metadata } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import CdnImage from "../../_components/CdnImage";

export const metadata: Metadata = {
  title: "Data Science in the Age of AI: Is the \"Sexiest Job\" Still Sexy?",
  description: "Exploring how AI is reshaping the data science landscape and what it means for professionals in the field.",};

export default function AgeAiPost() {
  const t = useTranslations("ageAi");
  
  return (
    <article className="max-w-4xl pt-20 mx-auto px-6 pb-12 text-lg leading-8">
      <h1 className="text-4xl font-bold mb-8">
        {t("heading")}
      </h1>

      <div className="float-right ml-6 mb-6 max-w-sm rounded-lg overflow-hidden shadow-lg">
        <CdnImage
          src="https://storage.googleapis.com/curify-static/1_ef4wcJrfRHv5laz-yVmYMA.webp"
          alt={t("imageAlt")}
          width={500}
          height={300}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4 text-gray-700">
        <span className="italic">{t("intro1")}</span>
      </p>

      <p className="mb-6">
        {t("intro2")}
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        {t("realityCheck.title")} <span className="text-2xl">🔍</span>
      </h2>
      
      <p className="mb-4">
        {t("realityCheck.content")}
      </p>

      <div className="bg-blue-50 p-6 rounded-lg my-6 border-l-4 border-blue-500">
        <h3 className="font-bold text-lg mb-3">
          {t("realityCheck.lowBarTrap.title")}
        </h3>
        <p className="mb-3">
          {t("realityCheck.lowBarTrap.content")}
        </p>
        
        <h3 className="font-bold text-lg mt-4 mb-3">
          {t("realityCheck.stakeholderShift.title")}
        </h3>
        <p>
          {t("realityCheck.stakeholderShift.content")}
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">
        {t("strategicPillars.title")} <span className="text-2xl">🏗️</span>
      </h2>
      
      <p className="mb-6">
        {t("strategicPillars.intro")}
      </p>

      <div className="grid md:grid-cols-2 gap-6 my-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">1</span>
            {t("strategicPillars.buildingTools.title")}
          </h3>
          <p className="text-gray-700 mb-4">
            {t("strategicPillars.buildingTools.subtitle")}
          </p>
          <ul className="space-y-3">
            {[
              t("strategicPillars.buildingTools.points.0"),
              t("strategicPillars.buildingTools.points.1"),
              t("strategicPillars.buildingTools.points.2")
            ].map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">2</span>
            {t("strategicPillars.leveragingTools.title")}
          </h3>
          <p className="text-gray-700 mb-4">
            {t("strategicPillars.leveragingTools.subtitle")}
          </p>
          <ul className="space-y-3">
            {[
              t("strategicPillars.leveragingTools.points.0"),
              t("strategicPillars.leveragingTools.points.1"),
              t("strategicPillars.leveragingTools.points.2")
            ].map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg my-8 border-l-4 border-yellow-400">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="text-yellow-700 mr-2">💡</span>
          {t("bottomLine.title")}
        </h3>
        <p className="text-gray-800">
          {t("bottomLine.content1")}
        </p>
        <p className="mt-4 text-gray-700">
          {t("bottomLine.content2")}
        </p>
      </div>

      <p className="mt-8 text-gray-600">
        {t("conclusion")}
      </p>

      {/* Related Articles Section */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/blog/QA_Bot_to_Task"
            className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">
              From QA Bot to Task Agent: An Architecture Guide
            </h3>
            <p className="text-gray-600 mb-3">
              Learn how to evolve simple QA systems into autonomous task agents
              with our comprehensive architecture guide.
            </p>
            <span className="text-blue-600 text-sm font-medium">Read more →</span>
          </Link>

          <Link
            href="/blog/agents-vs-workflows"
            className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">
              Agents vs Workflows – From Control to Intelligence
            </h3>
            <p className="text-gray-600 mb-3">
              Explore the shift from rigid workflows to intelligent agents in
              modern AI systems.
            </p>
            <span className="text-blue-600 text-sm font-medium">Read more →</span>
          </Link>
        </div>
      </div>

      {/* Next Article */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Next Article</p>
        <Link
          href="/blog/QA_Bot_to_Task"
          className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold group-hover:text-blue-600">
              From QA Bot to Task Agent: An Architecture Guide
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Learn how to build more capable AI agents
            </p>
          </div>
          <span className="text-blue-600">→</span>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold mb-4">
          {t("discussion.title")}
        </h3>
        <p className="text-gray-700 mb-2">
          {t("discussion.prompt")} 👇
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {t.raw("hashtags").map((tag: string, index: number) => {
            const colors = [
              'bg-blue-100 text-blue-800',
              'bg-green-100 text-green-800',
              'bg-purple-100 text-purple-800',
              'bg-indigo-100 text-indigo-800',
              'bg-yellow-100 text-yellow-800',
              'bg-pink-100 text-pink-800'
            ];
            return (
              <span 
                key={index} 
                className={`${colors[index % colors.length]} text-xs font-medium px-2.5 py-0.5 rounded`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}