import React from 'react';
import { EnhancedBlogThumbnail } from '../components/EnhancedBlogThumbnail';

// Example: How to integrate alternative thumbnails into the blog page
// This shows the modified section of page.tsx that would replace lines 219-227

export const ThumbnailIntegrationExample: React.FC<{
  slug: string;
  title: string;
  category: string;
  existingImage: string;
  useAlternativeThumbnails: boolean;
}> = ({ slug, title, category, existingImage, useAlternativeThumbnails }) => {
  return (
    <div className="mb-8">
      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <EnhancedBlogThumbnail
          slug={slug}
          title={title}
          category={category}
          existingImage={existingImage}
          useAlternative={useAlternativeThumbnails}
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>
    </div>
  );
};

// Example blog page modification:
/*
// In page.tsx, replace the thumbnail section (lines 218-227) with:

import { EnhancedBlogThumbnail } from './components/EnhancedBlogThumbnail';

// Add a state or configuration to control thumbnail types
const useAlternativeThumbnails = process.env.NEXT_PUBLIC_USE_ALTERNATIVE_THUMBNAILS === 'true';

// In the return statement, replace the CdnImage section with:
<div className="mb-8">
  <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
    <EnhancedBlogThumbnail
      slug={slug}
      title={tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      category={blogConfig.category}
      existingImage={blogConfig.image}
      useAlternative={useAlternativeThumbnails}
      alt={tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      width={400}
      height={250}
      className="rounded-lg object-cover"
    />
  </div>
  
  <h1 className="text-4xl font-bold mb-4">
    {tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </h1>
  
  <div className="text-gray-600 mb-4">
    {tNamespace ? tNamespace("date", { defaultValue: "Latest Article" }) : "Latest Article"} • {" "}
    {tNamespace ? tNamespace("readTime", { defaultValue: "5 min read" }) : "5 min read"}
  </div>
</div>
*/

// Environment variable configuration:
// Add to .env.local:
// NEXT_PUBLIC_USE_ALTERNATIVE_THUMBNAILS=true

// Or control per-blog-post in blogs.json:
/*
{
  "slug": "qa-bot-to-task",
  "title": "From QA Bot to Task Agent: An Architecture Guide",
  "image": "/images/qa-bot-architecture.jpg",
  "category": "ds-ai-engineering",
  "useAlternativeThumbnail": true,
  "thumbnailType": "mermaid"
}
*/

export default ThumbnailIntegrationExample;
