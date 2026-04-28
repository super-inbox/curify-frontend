import AIFacelessChannelPipelineContent from './AIFacelessChannelPipelineContent';

interface AIFacelessChannelPipelineWrapperProps {
  slug: string;
  t: (key: string, defaultValue?: string) => string;
  locale: string;
}

export default function AIFacelessChannelPipelineWrapper({ slug, t, locale }: AIFacelessChannelPipelineWrapperProps) {
  // Pre-fetch all translation keys to avoid passing functions to client components
  const translations = {
    whatIsTitle: t('whatIsTitle'),
    whatIsContent: t('whatIsContent'),
    whyTitle: t('whyTitle'),
    whyContent: t('whyContent'),
    howTitle: t('howTitle'),
    step1Title: t('step1Title'),
    step1Content: t('step1Content'),
    step2Title: t('step2Title'),
    step2Content: t('step2Content'),
    step3Title: t('step3Title'),
    step3Content: t('step3Content'),
    step4Title: t('step4Title'),
    step4Content: t('step4Content'),
    step5Title: t('step5Title'),
    step5Content: t('step5Content'),
    toolsTitle: t('toolsTitle'),
    toolsContent: t('toolsContent'),
    curifyTitle: t('curifyTitle'),
    curifyContent: t('curifyContent'),
    ctaLink: t('ctaLink'),
    ctaText: t('ctaText'),
    monetizationTitle: t('monetizationTitle'),
    monetizationContent: t('monetizationContent'),
    examplesTitle: t('examplesTitle'),
    examplesContent: t('examplesContent'),
    metricsTitle: t('metricsTitle'),
    metricsContent: t('metricsContent'),
    scalingTitle: t('scalingTitle'),
    scalingContent: t('scalingContent'),
    conclusionTitle: t('conclusionTitle'),
    conclusionContent: t('conclusionContent')
  };

  return (
    <AIFacelessChannelPipelineContent 
      slug={slug} 
      translations={translations} 
      locale={locale} 
    />
  );
}
