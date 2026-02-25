import React from 'react';
import TemplateLink from './TemplateLink';
import { parseTemplateLinks } from '@/utils/blogUtils';

interface BlogContentRendererProps {
  content: string;
  locale?: string;
  className?: string;
}

export default function BlogContentRenderer({ 
  content, 
  locale = 'en', 
  className = '' 
}: BlogContentRendererProps) {
  // Parse content to replace template references with actual links
  const processedContent = parseTemplateLinks(content, locale);
  
  // Split content by HTML tags and process template links
  const parts = processedContent.split(/(<\/?[^>]+>)/);
  
  return (
    <div className={`blog-content ${className}`}>
      {parts.map((part, index) => {
        // If it's an HTML tag, render as-is
        if (part.startsWith('<')) {
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        }
        
        // Process template links in text content
        const textParts = part.split(/(<a[^>]*>.*?<\/a>)/);
        
        return (
          <span key={index}>
            {textParts.map((textPart, textIndex) => {
              // If it's already an HTML link, render as-is
              if (textPart.startsWith('<a')) {
                return <span key={textIndex} dangerouslySetInnerHTML={{ __html: textPart }} />;
              }
              
              // Regular text content
              return <span key={textIndex}>{textPart}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
}

// Component for rendering blog posts with automatic template linking
interface BlogPostProps {
  title: string;
  content: string;
  locale?: string;
  relatedTemplates?: Array<{
    id: string;
    title: string;
    category: string;
    url: string;
  }>;
  className?: string;
}

export function BlogPost({ 
  title, 
  content, 
  locale = 'en', 
  relatedTemplates = [],
  className = '' 
}: BlogPostProps) {
  return (
    <article className={`blog-post max-w-4xl mx-auto ${className}`}>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
      </header>
      
      <div className="prose prose-lg max-w-none">
        <BlogContentRenderer content={content} locale={locale} />
      </div>
      
      {relatedTemplates.length > 0 && (
        <aside className="mt-12 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✨ Related Nano Templates
          </h3>
          <div className="grid gap-3">
            {relatedTemplates.map((template) => (
              <TemplateLink
                key={template.id}
                href={template.url}
                title={template.title}
                category={template.category}
                className="block p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
