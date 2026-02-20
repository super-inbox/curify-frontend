import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CdnImage from '../../../_components/CdnImage';
import { FaLightbulb, FaCheck, FaLayerGroup, FaCogs, FaChartLine, FaTools, FaRocket } from 'react-icons/fa';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiPlatform" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6 flex items-center">
    <Icon className="mr-3 text-blue-600" />
    {title}
  </h2>
);

const Point = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start mb-3">
    <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

export default async function AIPlatform() {
  const t = await getTranslations("aiPlatform");
  
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
      {/* Main Content */}
      <article className="flex-1">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t('subtitle')}
          </p>
          
          <div className="float-right ml-6 mb-6 w-full max-w-md rounded-lg overflow-hidden shadow-lg">
            <CdnImage
              src="https://storage.googleapis.com/curify-static/aiPlatform.png"
              alt={t('imageAlt')}
              width={800}
              height={450}
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="prose lg:prose-xl max-w-none">
            
            <p className="text-lg">{t('intro.p1')}</p>
            <p className="text-lg">{t('intro.p2')}</p>
          </div>
        </header>

        {/* Mindset Shift Section */}
        <section className="mb-16">
          <SectionHeader title={t('mindsetShift.title')} icon={FaLightbulb} />
          <div className="prose lg:prose-lg max-w-none">
            <p>{t('mindsetShift.content')}</p>
            <p className="font-semibold">{t('mindsetShift.goal')}</p>
            <p className="italic">{t('mindsetShift.reality')}</p>
            
            <div className="bg-gray-50 p-6 rounded-lg my-6">
              <h4 className="font-bold mb-3">{t('mindsetShift.supportModel.title')}</h4>
              <ul className="space-y-2">
                <Point>{t('mindsetShift.supportModel.l1')}</Point>
                <Point>{t('mindsetShift.supportModel.l2')}</Point>
                <Point>{t('mindsetShift.supportModel.l3')}</Point>
              </ul>
              <p className="mt-4 italic text-gray-700">{t('mindsetShift.conclusion')}</p>
            </div>
          </div>
        </section>

        {/* Stack Section */}
        <section className="mb-16">
          <SectionHeader title={t('stack.title')} icon={FaLayerGroup} />
          <div className="prose lg:prose-lg max-w-none">
            <p>{t('stack.intro')}</p>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 my-6">
              <h3 className="text-xl font-bold mb-3">{t('stack.gateway.title')}</h3>
              <p>{t('stack.gateway.content')}</p>
              <ul className="my-4 space-y-2">
                {t.raw('stack.gateway.points').map((point: string, i: number) => (
                  <Point key={i}>{point}</Point>
                ))}
              </ul>
              <p className="mt-4">{t('stack.gateway.conclusion')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 my-6">
              <h3 className="text-xl font-bold mb-3">{t('stack.knowledge.title')}</h3>
              <p>{t('stack.knowledge.content')}</p>
              <p className="mt-4">{t('stack.knowledge.solution')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 my-6">
              <h3 className="text-xl font-bold mb-3">{t('stack.orchestration.title')}</h3>
              <p>{t('stack.orchestration.content')}</p>
              <p className="font-medium my-3">{t('stack.orchestration.example')}</p>
              <div className="my-4 pl-4 border-l-4 border-blue-100">
                {t.raw('stack.orchestration.workflow').map((step: string, i: number) => (
                  <div key={i} className="flex items-center py-1">
                    <span className="text-blue-600 font-mono text-sm">
                      {i + 1}. {step}
                    </span>
                  </div>
                ))}
              </div>
              <p>{t('stack.orchestration.conclusion')}</p>
            </div>
          </div>
        </section>

        {/* Fine Tuning Section */}
        <section className="mb-16">
          <SectionHeader title={t('fineTuning.title')} icon={FaCogs} />
          <div className="prose lg:prose-lg max-w-none">
            <p className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: t('fineTuning.content') }} />
            <div className="grid md:grid-cols-2 gap-4 my-6">
              {t.raw('fineTuning.strategies').map((strategy: string, i: number) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                  <Point>{strategy}</Point>
                </div>
              ))}
            </div>
            <p>{t('fineTuning.conclusion')}</p>
          </div>
        </section>

        {/* Essential Work Section */}
        <section className="mb-16">
          <SectionHeader title={t('essentialWork.title')} icon={FaChartLine} />
          <div className="prose lg:prose-lg max-w-none">
            <p>{t('essentialWork.content')}</p>
            <div className="space-y-6 my-8">
              {t.raw('essentialWork.points').map((point: any, i: number) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-lg mb-2">{point.title}</h4>
                  <p className="text-gray-700">{point.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="bg-blue-50 p-8 rounded-xl mt-12">
          <h2 className="text-2xl font-bold mb-6">{t('conclusion.title')}</h2>
          <div className="prose lg:prose-lg max-w-none">
            <p className="text-lg">{t('conclusion.content')}</p>
            <p className="text-lg mt-4 italic text-gray-700">{t('conclusion.finalThoughts')}</p>
            <div className="mt-8 p-6 bg-white rounded-lg border border-blue-100 shadow-sm">
              <p className="text-center font-semibold text-lg text-blue-700">
                {t('conclusion.callToAction')}
              </p>
            </div>
          </div>
        </section>

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

      {/* Sidebar */}
      <aside className="lg:w-80 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
        </div>
      </aside>
    </div>
  );
}
