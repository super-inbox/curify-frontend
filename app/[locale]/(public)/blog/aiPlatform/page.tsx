import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CdnImage from '../../../_components/CdnImage';
import RelatedBlogs from '../../../_components/RelatedBlogs';
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
    description: t("description"),
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

export default async function AIPlatform({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiPlatform" });

  return (
    <div className="pt-10 pb-8">
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">{t('subtitle')}</h2>
              <ul className="space-y-2">
                {t.raw('keyPoints').map((point: string, i: number) => (
                  <Point key={i}>{point}</Point>
                ))}
              </ul>
            </div>

            <p className="text-lg">{t('intro.p1')}</p>
            <p className="text-lg">{t('intro.p2')}</p>
            <p className="text-lg">{t('intro.p3')}</p>
          </div>
        </header>

        {/* Mindset Shift Section */}
        <section className="mb-16">
          <SectionHeader title={t('mindsetShift.title')} icon={FaLightbulb} />
          <div className="prose lg:prose-lg max-w-none">
            <p>{t('mindsetShift.bottleneck')}</p>
            
            <div className="bg-gray-50 p-6 rounded-lg my-6">
              <h4 className="font-bold mb-3">{t('mindsetShift.comparison.title')}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('mindsetShift.comparison.headers.mode')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('mindsetShift.comparison.headers.aiCycle')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('mindsetShift.comparison.headers.efficiency')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('mindsetShift.comparison.headers.satisfaction')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('mindsetShift.comparison.headers.costEfficiency')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.raw('mindsetShift.comparison.modes').map((mode: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{mode.mode}</td>
                        <td className="border border-gray-300 px-4 py-2">{mode.aiCycle}</td>
                        <td className="border border-gray-300 px-4 py-2">{mode.efficiency}</td>
                        <td className="border border-gray-300 px-4 py-2">{mode.satisfaction}</td>
                        <td className="border border-gray-300 px-4 py-2">{mode.costEfficiency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-6">
              <h4 className="font-bold mb-3">{t('mindsetShift.supportModel.title')}</h4>
              <p className="mb-4">{t('mindsetShift.supportModel.intro')}</p>
              {t.raw('mindsetShift.supportModel.levels').map((level: any, i: number) => (
                <div key={i} className="mb-4">
                  <h5 className="font-semibold text-blue-700 mb-2">{level.level}</h5>
                  <ul className="space-y-1 ml-4">
                    {level.points.map((point: string, j: number) => (
                      <li key={j} className="text-sm">• {point}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="mt-4 italic text-gray-700">{t('mindsetShift.supportModel.conclusion')}</p>
            </div>
          </div>
        </section>

        {/* Stack Section */}
        <section className="mb-16">
          <SectionHeader title={t('stack.title')} icon={FaLayerGroup} />
          <div className="prose lg:prose-lg max-w-none">
            <p>{t('stack.intro')}</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <ul className="space-y-2">
                {t.raw('stack.benefits').map((benefit: string, i: number) => (
                  <Point key={i}>{benefit}</Point>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 my-6">
              <h3 className="text-xl font-bold mb-3">{t('stack.gateway.title')}</h3>
              <p>{t('stack.gateway.intro')}</p>
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('stack.gateway.headers.model')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('stack.gateway.headers.useCase')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('stack.gateway.headers.cost')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('stack.gateway.headers.speed')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('stack.gateway.headers.frequency')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.raw('stack.gateway.models').map((model: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{model.model}</td>
                        <td className="border border-gray-300 px-4 py-2">{model.useCase}</td>
                        <td className="border border-gray-300 px-4 py-2">{model.cost}</td>
                        <td className="border border-gray-300 px-4 py-2">{model.speed}</td>
                        <td className="border border-gray-300 px-4 py-2">{model.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4">{t('stack.gateway.conclusion')}</p>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">{t('stack.gateway.featuresTitle')}</h4>
                <ul className="space-y-1">
                  {t.raw('stack.gateway.features').map((feature: string, i: number) => (
                    <li key={i} className="text-sm">• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 my-6">
              <h3 className="text-xl font-bold mb-3">{t('stack.knowledge.title')}</h3>
              <p>{t('stack.knowledge.intro')}</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">{t('stack.knowledge.benefitsTitle')}</h4>
                <ul className="space-y-1">
                  {t.raw('stack.knowledge.benefits').map((benefit: string, i: number) => (
                    <li key={i} className="text-sm">• {benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">{t('stack.knowledge.dataSourcesTitle')}</h4>
                <ul className="space-y-1">
                  {t.raw('stack.knowledge.dataSources').map((source: string, i: number) => (
                    <li key={i} className="text-sm">• {source}</li>
                  ))}
                </ul>
              </div>
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
            <p className="text-lg font-medium">{t('fineTuning.intro')}</p>
            
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">{t('fineTuning.headers.strategy')}</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">{t('fineTuning.headers.cost')}</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">{t('fineTuning.headers.time')}</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">{t('fineTuning.headers.performance')}</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">{t('fineTuning.headers.roi')}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.raw('fineTuning.strategies').map((strategy: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{strategy.strategy}</td>
                      <td className="border border-gray-300 px-4 py-2">{strategy.cost}</td>
                      <td className="border border-gray-300 px-4 py-2">{strategy.time}</td>
                      <td className="border border-gray-300 px-4 py-2">{strategy.performance}</td>
                      <td className="border border-gray-300 px-4 py-2">{strategy.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-6">
              <h4 className="font-bold mb-4">{t('fineTuning.pillars.title')}</h4>
              {t.raw('fineTuning.pillars.pillars').map((pillar: any, i: number) => (
                <div key={i} className="mb-4">
                  <h5 className="font-semibold text-blue-700 mb-2">{pillar.title}</h5>
                  {pillar.content && <p className="mb-2">{pillar.content}</p>}
                  <ul className="space-y-1 ml-4">
                    {pillar.details.map((detail: string, j: number) => (
                      <li key={j} className="text-sm">• {detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg my-6">
              <h4 className="font-bold mb-3">{t('fineTuning.expertOpinion.title')}</h4>
              <p className="font-medium mb-2">{t('fineTuning.expertOpinion.expert')}</p>
              <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-4">
                {t('fineTuning.expertOpinion.quote')}
              </blockquote>
              <p>{t('fineTuning.expertOpinion.conclusion')}</p>
              <ul className="space-y-1 ml-4 mt-2">
                {t.raw('fineTuning.expertOpinion.scenarios').map((scenario: string, i: number) => (
                  <li key={i} className="text-sm">• {scenario}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Essential Work Section */}
        <section className="mb-16">
          <SectionHeader title={t('essentialWork.title')} icon={FaChartLine} />
          <div className="prose lg:prose-lg max-w-none">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('essentialWork.dataPipeline.title')}</h4>
                <p className="mb-4">{t('essentialWork.dataPipeline.intro')}</p>
                <ul className="space-y-2">
                  {t.raw('essentialWork.dataPipeline.features').map((feature: string, i: number) => (
                    <Point key={i}>{feature}</Point>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('essentialWork.observability.title')}</h4>
                <p className="mb-4">{t('essentialWork.observability.intro')}</p>
                <ul className="space-y-2">
                  {t.raw('essentialWork.observability.metrics').map((metric: string, i: number) => (
                    <Point key={i}>{metric}</Point>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('essentialWork.security.title')}</h4>
                <ul className="space-y-2">
                  {t.raw('essentialWork.security.features').map((feature: string, i: number) => (
                    <Point key={i}>{feature}</Point>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="mb-16">
          <SectionHeader title={t('caseStudies.title')} icon={FaRocket} />
          <div className="prose lg:prose-lg max-w-none">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('caseStudies.case1.title')}</h4>
                <p className="mb-4">{t('caseStudies.case1.background')}</p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">{t('caseStudies.implementationTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('caseStudies.case1.implementation').map((step: string, i: number) => (
                      <li key={i} className="text-sm">• {step}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('caseStudies.case1.results.title')}</h5>
                  <ul className="space-y-1">
                    {t.raw('caseStudies.case1.results.metrics').map((metric: string, i: number) => (
                      <li key={i} className="text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('caseStudies.case2.title')}</h4>
                <p className="mb-4">{t('caseStudies.case2.background')}</p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">{t('caseStudies.implementationTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('caseStudies.case2.implementation').map((step: string, i: number) => (
                      <li key={i} className="text-sm">• {step}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('caseStudies.case2.results.title')}</h5>
                  <ul className="space-y-1">
                    {t.raw('caseStudies.case2.results.metrics').map((metric: string, i: number) => (
                      <li key={i} className="text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="mb-16">
          <SectionHeader title={t('roadmap.title')} icon={FaTools} />
          <div className="prose lg:prose-lg max-w-none">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('roadmap.phase1.title')}</h4>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">{t('roadmap.tasksTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('roadmap.phase1.tasks').map((task: string, i: number) => (
                      <li key={i} className="text-sm">• {task}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('roadmap.outcomesTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('roadmap.phase1.outcomes').map((outcome: string, i: number) => (
                      <li key={i} className="text-sm">• {outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('roadmap.phase2.title')}</h4>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">{t('roadmap.tasksTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('roadmap.phase2.tasks').map((task: string, i: number) => (
                      <li key={i} className="text-sm">• {task}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('roadmap.outcomesTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('roadmap.phase2.outcomes').map((outcome: string, i: number) => (
                      <li key={i} className="text-sm">• {outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-3">{t('roadmap.phase3.title')}</h4>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">{t('roadmap.tasksTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('roadmap.phase3.tasks').map((task: string, i: number) => (
                      <li key={i} className="text-sm">• {task}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('roadmap.outcomesTitle')}</h5>
                  <ul className="space-y-1">
                    {t.raw('roadmap.phase3.outcomes').map((outcome: string, i: number) => (
                      <li key={i} className="text-sm">• {outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <SectionHeader title={t('faq.title')} icon={FaLightbulb} />
          <div className="prose lg:prose-lg max-w-none">
            <div className="space-y-6">
              {t.raw('faq.questions').map((qa: any, i: number) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-lg mb-3">{qa.q}</h4>
                  <p className="mb-4">{qa.a}</p>
                  {qa.budget && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">{t('faq.budgetHeaders.scale')}</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">{t('faq.budgetHeaders.size')}</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">{t('faq.budgetHeaders.monthly')}</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">{t('faq.budgetHeaders.yearly')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qa.budget.map((budget: any, j: number) => (
                            <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-300 px-4 py-2 font-medium">{budget.scale}</td>
                              <td className="border border-gray-300 px-4 py-2">{budget.size}</td>
                              <td className="border border-gray-300 px-4 py-2">{budget.monthly}</td>
                              <td className="border border-gray-300 px-4 py-2">{budget.yearly}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {qa.team && (
                    <ul className="space-y-1 ml-4">
                      {qa.team.map((member: string, j: number) => (
                        <li key={j} className="text-sm">• {member}</li>
                      ))}
                    </ul>
                  )}
                  {qa.security && (
                    <ul className="space-y-1 ml-4">
                      {qa.security.map((item: string, j: number) => (
                        <li key={j} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  )}
                  {qa.metrics && (
                    <ul className="space-y-1 ml-4">
                      {qa.metrics.map((metric: string, j: number) => (
                        <li key={j} className="text-sm">• {metric}</li>
                      ))}
                    </ul>
                  )}
                  {qa.limitations && (
                    <ul className="space-y-1 ml-4">
                      {qa.limitations.map((limitation: string, j: number) => (
                        <li key={j} className="text-sm">• {limitation}</li>
                      ))}
                    </ul>
                  )}
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
            <p className="text-lg mt-4">{t('conclusion.research')}</p>
            <p className="text-lg mt-4 italic text-gray-700">{t('conclusion.finalThoughts')}</p>
            <div className="mt-8 p-6 bg-white rounded-lg border border-blue-100 shadow-sm">
              <p className="text-center font-semibold text-lg text-blue-700">
                {t('conclusion.callToAction')}
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-gray-50 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-bold mb-3">{t('disclaimer.title')}</h3>
          <div className="prose lg:prose-sm max-w-none">
            <p className="text-sm text-gray-600 mb-2">{t('disclaimer.content')}</p>
            <p className="text-xs text-gray-500 mt-4">
              {t('disclaimer.author')} • {t('disclaimer.updated')}
            </p>
          </div>
        </section>

        {/* Related Articles */}
        <RelatedBlogs currentSlug="aiPlatform" locale={locale} />
      </article>

      {/* Sidebar */}
      <aside className="lg:w-80 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
        </div>
      </aside>
    </div>
  );
}
