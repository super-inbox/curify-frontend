#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const generateBlog = (slug, title, category) => {
  const blogDir = path.join(process.cwd(), 'app/[locale]/(public)/blog', slug);
  
  // Create directory
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  // Generate page.tsx
  const pageTemplate = `import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import CdnImage from "@/components/CdnImage";
import { BreadcrumbNavigation } from "../components/BreadcrumbNavigation";
import { StructuredData } from "../components/StructuredData";
import { TableOfContents } from "../components/TableOfContents";
import { PromptBox } from "../components/PromptBox";
import { RelatedBlogs } from "../components/RelatedBlogs";
import { blogPosts } from "../utils/blog-config";
import { safeT, hasKey } from "../utils/blog-config";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    notFound();
  }

  const t = await getTranslations(blogConfig.namespace);
  const safeT = (key: string) => t.raw(key);

  const tableOfContents = [
    { level: 'H2', text: safeT("whatIsTitle"), id: "what-is" },
    { level: 'H2', text: safeT("whyTitle"), id: "why" },
    { level: 'H2', text: safeT("conclusionTitle"), id: "conclusion" },
    { level: 'H2', text: safeT("ctaTitle"), id: "cta" }
  ];

  return (
    <article className="pt-20 pb-12 text-[18px] leading-8 lg:pr-12 lg:pl-8 pl-4 pr-4 md:pl-8 md:pr-8">
      <BreadcrumbNavigation items={[{ name: "Blog", href: "/blog" }, { name: safeT("title"), href: \`/blog/\${slug}\` }]} />
      <StructuredData 
        title={safeT("title")}
        description={safeT("metaDescription")}
        publishDate={safeT("date")}
        url={\`https://www.curify-ai.com/\${locale}/blog/\${slug}\`}
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

      <RelatedBlogs currentSlug={slug} />
    </article>
  );
}
`;

  // Generate layout.tsx
  const layoutTemplate = `export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
`;

  fs.writeFileSync(path.join(blogDir, 'page.tsx'), pageTemplate);
  fs.writeFileSync(path.join(blogDir, 'layout.tsx'), layoutTemplate);

  console.log(`✅ Generated blog files for: ${slug}`);
  console.log(`📁 Directory: ${blogDir}`);
  console.log(`📝 Don't forget to update:
    - messages/en/blog.json (add to posts array and create translation keys)
    - public/data/blogs.json (add metadata)
    - blog-config.ts (add namespace and availableKeys)`);
};

// CLI interface
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node generate-blog.js <slug> <title> <category>');
  console.log('Example: node generate-blog.js "ai-content-automation" "AI Content Automation Guide" "ai-tools"');
  process.exit(1);
}

const [slug, title, category] = args;
generateBlog(slug, title, category);
