import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import BreadcrumbNavigation from "./BreadcrumbNavigation";
import StructuredData from "./StructuredData";
import TableOfContents from "./TableOfContents";
import PromptBox from "./PromptBox";
import RelatedBlogs from "@/app/[locale]/_components/RelatedBlogs";
import { blogPosts } from "../utils/blog-config";

interface StandardBlogPostProps {
  locale: string;
  slug: string;
  additionalSections?: Array<{
    id: string;
    titleKey: string;
    contentKey: string;
  }>;
}

export default async function StandardBlogPost({
  locale,
  slug,
  additionalSections = []
}: StandardBlogPostProps) {
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    notFound();
  }

  const t = await getTranslations(blogConfig.namespace);
  const safeT = (key: string) => t.raw(key);

  const tableOfContents = [
    { level: 'H2', text: safeT("whatIsTitle"), id: "what-is" },
    { level: 'H2', text: safeT("whyTitle"), id: "why" },
    ...additionalSections.map(section => ({
      level: 'H2' as const,
      text: safeT(section.titleKey),
      id: section.id
    })),
    { level: 'H2', text: safeT("conclusionTitle"), id: "conclusion" },
    { level: 'H2', text: safeT("ctaTitle"), id: "cta" }
  ];

  return (
    <article className="pt-20 pb-12 text-[18px] leading-8 lg:pr-12 lg:pl-8 pl-4 pr-4 md:pl-8 md:pr-8">
      <BreadcrumbNavigation items={[{ name: "Blog", href: "/blog" }, { name: safeT("title"), href: `/blog/${slug}` }]} />
      <StructuredData 
        title={safeT("title")}
        description={safeT("metaDescription")}
        publishDate={safeT("date")}
        url={`https://www.curify-ai.com/${locale}/blog/${slug}`}
        image={blogConfig.image}
        readTime={safeT("readTime")}
      />
      
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{safeT("title")}</h1>
        <p className="text-gray-600 mb-4">{safeT("date")} • {safeT("readTime")}</p>
        <CdnImage src={blogConfig.image} alt={safeT("title")} className="w-full h-64 object-cover rounded-lg" />
      </header>

      <TableOfContents headings={tableOfContents} />

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: safeT("intro") }} />
        
        <section id="what-is">
          <h2 className="text-2xl font-bold mb-4">{safeT("whatIsTitle")}</h2>
          <div dangerouslySetInnerHTML={{ __html: safeT("whatIsContent") }} />
        </section>

        <section id="why">
          <h2 className="text-2xl font-bold mb-4">{safeT("whyTitle")}</h2>
          <div dangerouslySetInnerHTML={{ __html: safeT("whyContent") }} />
        </section>

        {additionalSections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="text-2xl font-bold mb-4">{safeT(section.titleKey)}</h2>
            <div dangerouslySetInnerHTML={{ __html: safeT(section.contentKey) }} />
          </section>
        ))}

        <section id="conclusion">
          <h2 className="text-2xl font-bold mb-4">{safeT("conclusionTitle")}</h2>
          <div dangerouslySetInnerHTML={{ __html: safeT("conclusionContent") }} />
        </section>

        <section id="cta">
          <h2 className="text-2xl font-bold mb-4">{safeT("ctaTitle")}</h2>
          <p>{safeT("ctaDescription")}</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {safeT("ctaButton")}
          </button>
        </section>
      </div>

      <RelatedBlogs currentSlug={slug} locale={locale} />
    </article>
  );
}
