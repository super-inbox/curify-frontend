import React from 'react';
import { BlogThumbnail, getThumbnailConfigForCategory, generateMermaidCode } from '../utils/thumbnail-generator';

interface DynamicThumbnailProps {
  slug: string;
  title: string;
  category: string;
  existingImage?: string;
  forceType?: 'image' | 'infographic' | 'mermaid';
}

export const DynamicThumbnail: React.FC<DynamicThumbnailProps> = ({
  slug,
  title,
  category,
  existingImage,
  forceType
}) => {
  // Generate configuration based on category and slug
  const config = forceType ? { type: forceType } : getThumbnailConfigForCategory(category, slug);
  
  // Generate Mermaid code if needed
  if (config.type === 'mermaid' && !config.customContent) {
    config.customContent = generateMermaidCode(slug, title);
  }

  // Debug logging
  console.log('DynamicThumbnail - slug:', slug);
  console.log('DynamicThumbnail - forceType:', forceType);
  console.log('DynamicThumbnail - config.type:', config.type);
  console.log('DynamicThumbnail - config:', config);

  return (
    <BlogThumbnail
      title={title}
      category={category}
      config={config}
      fallbackImage={existingImage}
    />
  );
};

// Example usage in blog page:
// <DynamicThumbnail
//   slug="qa-bot-to-task"
//   title="From QA Bot to Task Agent: An Architecture Guide"
//   category="ds-ai-engineering"
//   existingImage="/images/qa-bot-architecture.jpg"
//   forceType="mermaid" // Optional: force specific type
// />
