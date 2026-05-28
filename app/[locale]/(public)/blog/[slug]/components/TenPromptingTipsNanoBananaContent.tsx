import { formatNanoBananaContent } from "../utils/content-formatters";
import PromptBox from "./PromptBox";
import TableOfContents from "./TableOfContents";
import FAQSection from "./FAQSection";
import StructuredData from "./StructuredData";
import NanoBananaExamples from "../NanoBananaExamples";
import Head from 'next/head';

interface TenPromptingTipsNanoBananaContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function TenPromptingTipsNanoBananaContent({ slug, t, locale }: TenPromptingTipsNanoBananaContentProps) {
  // Generate headings for table of contents
  const headings = [
    { level: 'H2', text: t("whyNanoBananaTitle"), id: 'why-nano-banana' },
    { level: 'H2', text: t("tip1Title"), id: 'tip-1-gallery' },
    { level: 'H2', text: t("tip2Title"), id: 'tip-2-remix' },
    { level: 'H2', text: t("tip3Title"), id: 'tip-3-specificity' },
    { level: 'H2', text: t("tip4Title"), id: 'tip-4-tags' },
    { level: 'H2', text: t("tip5Title"), id: 'tip-5-params' },
    { level: 'H2', text: t("tip6Title"), id: 'tip-6-iteration' },
    { level: 'H2', text: t("tip7Title"), id: 'tip-7-workspace' },
    { level: 'H2', text: t("tip8Title"), id: 'tip-8-batch' },
    { level: 'H2', text: t("tip9Title"), id: 'tip-9-language' },
    { level: 'H2', text: t("tip10Title"), id: 'tip-10-credits' },
    { level: 'H2', text: t("toolsTitle"), id: 'tools-section' },
    { level: 'H2', text: t("templatesTitle"), id: 'templates-section' },
    { level: 'H2', text: t("curifyTitle"), id: 'curify-section' },
    { level: 'H2', text: t("conclusionTitle"), id: 'conclusion-section' }
  ];

  // FAQ data
  const faqs = [
    {
      question: t("faq1Question"),
      answer: t("faq1Answer")
    },
    {
      question: t("faq2Question"),
      answer: t("faq2Answer")
    },
    {
      question: t("faq3Question"),
      answer: t("faq3Answer")
    },
    {
      question: t("faq4Question"),
      answer: t("faq4Answer")
    },
    {
      question: t("faq5Question"),
      answer: t("faq5Answer")
    }
  ];

  return (
    <>
      <StructuredData
        title={t('title')}
        description={t('metaDescription')}
        publishDate={t('date')}
        author={t("author")}
        url={`${t("baseUrl")}${slug}`}
        readTime={t('readTime')}
      />
      {/* Single-column layout. The [slug] page header already floats the
          hero image to the right; removing the xl:flex-row sidebar lets
          text wrap around the hero naturally. Cap reading width at
          max-w-4xl (wider than the previous max-w-3xl, bounded for
          readability). TOC sits inline below the intro instead of as a
          side rail. */}
      <div className="max-w-4xl">
        <p className="text-lg font-semibold text-blue-600 mb-4">
          {t("intro")}
        </p>
        <TableOfContents headings={headings} />

      {(t("whyNanoBananaTitle") || t("whyNanoBananaContent")) && (
        <section id="why-nano-banana">
          <h2 className="text-2xl font-bold mb-4">{t("whyNanoBananaTitle")}</h2>
          <div 
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: formatNanoBananaContent(t("whyNanoBananaContent"))
            }} 
          />
        </section>
      )}
      
      <section id="tip-1-gallery">
        <h2 className="text-2xl font-bold mb-4">{t("tip1Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip1Content"))
          }} 
        />
        {t("tip1Example") && t("tip1Example").trim().length > 0 && (
          <PromptBox 
            title={t("tip1ExampleTitle")}
            promptText={t("tip1Example")}
          >
            <pre>{t("tip1Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-2-remix">
        <h2 className="text-2xl font-bold mb-4">{t("tip2Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip2Content"))
          }} 
        />
        {t("tip2Example") && (
          <PromptBox 
            title={`${t("tip2Title")} - Example Prompt`}
            promptText={t("tip2Example")}
          >
            <pre>{t("tip2Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-3-specificity">
        <h2 className="text-2xl font-bold mb-4">{t("tip3Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip3Content"))
          }} 
        />
        {t("tip3Example") && (
          <PromptBox 
            title={`${t("tip3Title")} - Example Prompt`}
            promptText={t("tip3Example")}
          >
            <pre>{t("tip3Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-4-tags">
        <h2 className="text-2xl font-bold mb-4">{t("tip4Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip4Content"))
          }} 
        />
        {t("tip4Example") && (
          <PromptBox 
            title={`${t("tip4Title")} - Example Prompt`}
            promptText={t("tip4Example")}
          >
            <pre>{t("tip4Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-5-params">
        <h2 className="text-2xl font-bold mb-4">{t("tip5Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip5Content"))
          }} 
        />
        {t("tip5Example") && (
          <PromptBox 
            title={`${t("tip5Title")} - Example Prompt`}
            promptText={t("tip5Example")}
          >
            <pre>{t("tip5Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-6-iteration">
        <h2 className="text-2xl font-bold mb-4">{t("tip6Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip6Content"))
          }} 
        />
        {t("tip6Example") && (
          <PromptBox 
            title={`${t("tip6Title")} - Example Prompt`}
            promptText={t("tip6Example")}
          >
            <pre>{t("tip6Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-7-workspace">
        <h2 className="text-2xl font-bold mb-4">{t("tip7Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip7Content"))
          }} 
        />
        {t("tip7Example") && (
          <PromptBox 
            title={`${t("tip7Title")} - Example Prompt`}
            promptText={t("tip7Example")}
          >
            <pre>{t("tip7Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-8-batch">
        <h2 className="text-2xl font-bold mb-4">{t("tip8Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip8Content"))
          }} 
        />
        {t("tip8Example") && (
          <PromptBox 
            title={`${t("tip8Title")} - Example Prompt`}
            promptText={t("tip8Example")}
          >
            <pre>{t("tip8Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-9-language">
        <h2 className="text-2xl font-bold mb-4">{t("tip9Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip9Content"))
          }} 
        />
        {t("tip9Example") && (
          <PromptBox 
            title={`${t("tip9Title")} - Example Prompt`}
            promptText={t("tip9Example")}
          >
            <pre>{t("tip9Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tip-10-credits">
        <h2 className="text-2xl font-bold mb-4">{t("tip10Title")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("tip10Content"))
          }} 
        />
        {t("tip10Example") && (
          <PromptBox 
            title={`${t("tip10Title")} - Example Prompt`}
            promptText={t("tip10Example")}
          >
            <pre>{t("tip10Example")}</pre>
          </PromptBox>
        )}
      </section>

      <section id="tools-section">
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("toolsContent"))
          }} 
        />
      </section>

      <section id="templates-section">
        <NanoBananaExamples locale={locale} blogSlug="10-prompting-tips-nano-banana" />
      </section>

      <section id="curify-section">
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("curifyContent"))
          }} 
        />
      </section>

      <section id="conclusion-section">
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoBananaContent(t("conclusionContent"))
          }} 
        />
      </section>

      <FAQSection faqs={faqs} />
      </div>
    </>
  );
}
