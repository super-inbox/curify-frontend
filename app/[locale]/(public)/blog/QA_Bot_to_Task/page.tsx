import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from 'next/link';
import CdnImage from '../../../_components/CdnImage';
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

export default function QABotToTaskAgent() {
  const t = useTranslations("qaBotToTaskAgent");
  
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
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
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              slug: 'agents-vs-workflows',
              title: 'Agents vs Workflows – From Control to Intelligence',
              date: 'October 28, 2025',
              readTime: '6 min read',
              tag: 'AI Architecture',
              image: 'https://storage.googleapis.com/curify-static/agents-vs-workflows.jpg',
            },
            {
              slug: 'age_AI',
              title: 'Data Science in the Age of AI: Is the "Sexiest Job" Still Sexy?',
              date: 'January 30, 2026',
              readTime: '8 min read',
              tag: 'AI Industry',
              image: 'https://storage.googleapis.com/curify-static/1_ef4wcJrfRHv5laz-yVmYMA.webp',
            },
            {
              slug: 'storyboard-to-pipeline',
              title: 'Create Your Own AI-Powered Comic Animation',
              date: 'October 28, 2025',
              readTime: '5 min read',
              tag: 'AI Tools',
              image: 'https://storage.googleapis.com/curify-static/ai-animation-pipeline.jpg',
            }
          ].map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-40 w-full">
                <CdnImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase text-red-600 font-semibold mb-1">
                  {post.tag}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition">
                  {post.title}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {post.date} • {post.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            See all blog posts
          </Link>
        </div>
      </section>
      </article>
    </div>
  );
}
