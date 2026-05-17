'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'
import '../styles/blog-styles.css'
import { BlogSection, BlogCard, BlogBorderAccent, BlogGrid, BlogHeading, BlogList, BlogListItem, getColorClasses } from '../components/BlogStyles'

export default function BlogContent() {
  const t = useTranslations('blog.characterPromptGenerator')
  const locale = 'en' // Standardized locale for consistency

  return (
    <main>
      <article className="max-w-4xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {t('title')}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span>{t('publishedDate')}</span>
            <span>•</span>
            <span>{t('readTime')}</span>
            <span>•</span>
            <span>{t('category')}</span>
          </div>
          <div className="mt-6">
            <CdnImage 
              src="/images/nano_insp_preview/template-character-analysis-zh-sha-wujing-prev.jpg" 
              className="w-full rounded-lg shadow-lg"
              alt="Character Prompt Generator Preview"
            />
          </div>
        </header>

      <BlogSection>
        <BlogHeading level={2}>{t('whatWeHave.title')}</BlogHeading>
        <p className="blog-paragraph">{t('whatWeHave.description')}</p>
        
        <BlogGrid cols={2}>
          <BlogCard variant="primary" hover>
            <BlogHeading level={3}>🎨 {t('whatWeHave.characterDesign.title')}</BlogHeading>
            <BlogList>
              {t.raw('whatWeHave.characterDesign.items').map((item: string, index: number) => (
                <BlogListItem key={index}>• <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}</BlogListItem>
              ))}
            </BlogList>
          </BlogCard>
          
          <BlogCard variant="purple" hover>
            <BlogHeading level={3}>⚔️ {t('whatWeHave.interactiveScenarios.title')}</BlogHeading>
            <BlogList>
              {t.raw('whatWeHave.interactiveScenarios.items').map((item: string, index: number) => (
                <BlogListItem key={index}>• <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}</BlogListItem>
              ))}
            </BlogList>
          </BlogCard>
        </BlogGrid>
      </BlogSection>

      <BlogSection>
        <BlogHeading level={2}>{t('whoCanBenefit.title')}</BlogHeading>
        
        <div className="space-y-4">
          <BlogBorderAccent variant="secondary">
            <div className={`p-4 rounded-r-lg ${getColorClasses('secondary').bg}`}>
              <BlogHeading level={3}>📝 {t('whoCanBenefit.writers.title')}</BlogHeading>
              <p className="blog-paragraph-sm">{t('whoCanBenefit.writers.description')}</p>
              <BlogCard>
                <p className={`font-medium mb-2 ${getColorClasses('secondary').text}`}>{t('whoCanBenefit.writers.perfectFor')}</p>
                <BlogList>
                  {t.raw('whoCanBenefit.writers.items').map((item: string, index: number) => (
                    <BlogListItem key={index}>• {item}</BlogListItem>
                  ))}
                </BlogList>
              </BlogCard>
            </div>
          </BlogBorderAccent>

          <BlogBorderAccent variant="orange">
            <div className={`p-4 rounded-r-lg ${getColorClasses('orange').bg}`}>
              <BlogHeading level={3}>🎨 {t('whoCanBenefit.artists.title')}</BlogHeading>
              <p className="blog-paragraph-sm">{t('whoCanBenefit.artists.description')}</p>
              <BlogCard>
                <p className={`font-medium mb-2 ${getColorClasses('orange').text}`}>{t('whoCanBenefit.artists.perfectFor')}</p>
                <BlogList>
                  {t.raw('whoCanBenefit.artists.items').map((item: string, index: number) => (
                    <BlogListItem key={index}>• {item}</BlogListItem>
                  ))}
                </BlogList>
              </BlogCard>
            </div>
          </BlogBorderAccent>

          <BlogBorderAccent variant="primary">
            <div className={`p-4 rounded-r-lg ${getColorClasses('primary').bg}`}>
              <BlogHeading level={3}>🎮 {t('whoCanBenefit.gameDevelopers.title')}</BlogHeading>
              <p className="blog-paragraph-sm">{t('whoCanBenefit.gameDevelopers.description')}</p>
              <BlogCard>
                <p className={`font-medium mb-2 ${getColorClasses('primary').text}`}>{t('whoCanBenefit.gameDevelopers.perfectFor')}</p>
                <BlogList>
                  {t.raw('whoCanBenefit.gameDevelopers.items').map((item: string, index: number) => (
                    <BlogListItem key={index}>• {item}</BlogListItem>
                  ))}
                </BlogList>
              </BlogCard>
            </div>
          </BlogBorderAccent>

          <BlogBorderAccent variant="purple">
            <div className={`p-4 rounded-r-lg ${getColorClasses('purple').bg}`}>
              <BlogHeading level={3}>🎭 {t('whoCanBenefit.creators.title')}</BlogHeading>
              <p className="blog-paragraph-sm">{t('whoCanBenefit.creators.description')}</p>
              <BlogCard>
                <p className={`font-medium mb-2 ${getColorClasses('purple').text}`}>{t('whoCanBenefit.creators.perfectFor')}</p>
                <BlogList>
                  {t.raw('whoCanBenefit.creators.items').map((item: string, index: number) => (
                    <BlogListItem key={index}>• {item}</BlogListItem>
                  ))}
                </BlogList>
              </BlogCard>
            </div>
          </BlogBorderAccent>
        </div>
      </BlogSection>

      <BlogSection>
        <BlogHeading level={2}>{t('howToUse.title')}</BlogHeading>
        
        <div className="space-y-6">
          <BlogCard variant="accent" hover>
            <BlogHeading level={3}>🚀 {t('howToUse.step1.title')}</BlogHeading>
            <p className="blog-paragraph">{t('howToUse.step1.description')}</p>
            <BlogGrid cols={2} spacing="sm">
              <BlogCard>
                <BlogHeading level={4}>{t('howToUse.step1.templates.character.name')}</BlogHeading>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.character.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.character.parameters')}</p>
              </BlogCard>
              <BlogCard>
                <BlogHeading level={4}>{t('howToUse.step1.templates.analysis.name')}</BlogHeading>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.analysis.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.analysis.parameters')}</p>
              </BlogCard>
              <BlogCard>
                <BlogHeading level={4}>{t('howToUse.step1.templates.comparison.name')}</BlogHeading>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.comparison.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.comparison.parameters')}</p>
              </BlogCard>
              <BlogCard>
                <BlogHeading level={4}>{t('howToUse.step1.templates.mbti.name')}</BlogHeading>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.mbti.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.mbti.parameters')}</p>
              </BlogCard>
            </BlogGrid>
          </BlogCard>

          <BlogCard variant="secondary" hover>
            <BlogHeading level={3}>⚙️ {t('howToUse.step2.title')}</BlogHeading>
            <p className="blog-paragraph">{t('howToUse.step2.description')}</p>
            <div className="space-y-3">
              {t.raw('howToUse.step2.options').map((option: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <strong>{option.title}</strong> {option.description}
                  </div>
                </div>
              ))}
            </div>
          </BlogCard>

          <BlogCard variant="primary" hover>
            <BlogHeading level={3}>✨ {t('howToUse.step3.title')}</BlogHeading>
            <p className="blog-paragraph">{t('howToUse.step3.description')}</p>
            <BlogList>
              {t.raw('howToUse.step3.features').map((feature: string, index: number) => (
                <BlogListItem key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</BlogListItem>
              ))}
            </BlogList>
          </BlogCard>
        </div>
      </BlogSection>

      <BlogSection>
        <BlogHeading level={2}>{t('advancedFeatures.title')}</BlogHeading>
        
        <BlogGrid cols={2}>
          <BlogCard variant="purple" hover>
            <BlogHeading level={3}>🎯 {t('advancedFeatures.proTips.title')}</BlogHeading>
            <BlogList variant="tight">
              {t.raw('advancedFeatures.proTips.tips').map((tip: string, index: number) => (
                <BlogListItem key={index} className="text-sm">• {tip}</BlogListItem>
              ))}
            </BlogList>
          </BlogCard>
          
          <BlogCard variant="primary" hover>
            <BlogHeading level={3}>🔧 {t('advancedFeatures.integration.title')}</BlogHeading>
            <BlogList variant="tight">
              {t.raw('advancedFeatures.integration.possibilities').map((possibility: string, index: number) => (
                <BlogListItem key={index} className="text-sm">• {possibility}</BlogListItem>
              ))}
            </BlogList>
          </BlogCard>
        </BlogGrid>
      </BlogSection>

      <BlogSection>
        <BlogHeading level={2}>{t('realWorldApplications.title')}</BlogHeading>
        
        <div className="space-y-4">
          <BlogCard hover>
            <BlogHeading level={3}>📚 {t('realWorldApplications.novelWriting.title')}</BlogHeading>
            <p className="text-sm">
              {t('realWorldApplications.novelWriting.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('realWorldApplications.novelWriting.attribution')}</p>
          </BlogCard>
          
          <BlogCard hover>
            <BlogHeading level={3}>🎮 {t('realWorldApplications.gameDevelopment.title')}</BlogHeading>
            <p className="text-sm">
              {t('realWorldApplications.gameDevelopment.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('realWorldApplications.gameDevelopment.attribution')}</p>
          </BlogCard>
          
          <BlogCard hover>
            <BlogHeading level={3}>🎭 {t('realWorldApplications.cosplay.title')}</BlogHeading>
            <p className="text-sm">
              {t('realWorldApplications.cosplay.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('realWorldApplications.cosplay.attribution')}</p>
          </BlogCard>
        </div>
      </BlogSection>

        <footer className="border-t pt-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {t.raw('footer.tags').map((tag: string, index: number) => (
              <span key={index} className={`px-3 py-1 rounded-full text-sm ${getColorClasses('primary').bg} ${getColorClasses('primary').text}`}>{tag}</span>
            ))}
          </div>
          
          <div className="text-white">
            <p>{t('footer.questions')}</p>
          </div>
        </footer>

        <RelatedBlogs currentSlug="character-prompt-generator" locale={locale} maxRelated={2} />
      </article>
    </main>
  )
}
