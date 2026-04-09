import React from 'react';
import { DynamicThumbnail } from './DynamicThumbnail';
import CdnImage from "@/app/[locale]/_components/CdnImage";

interface EnhancedBlogThumbnailProps {
  slug: string;
  title: string;
  category: string;
  existingImage: string;
  useAlternative?: boolean; // Toggle between traditional and alternative thumbnails
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const EnhancedBlogThumbnail: React.FC<EnhancedBlogThumbnailProps> = ({
  slug,
  title,
  category,
  existingImage,
  useAlternative = false,
  alt,
  width = 400,
  height = 250,
  className = "rounded-lg object-cover"
}) => {
  // If useAlternative is true, show infographic/Mermaid thumbnail
  if (useAlternative) {
    return (
      <div className="w-full" style={{ maxWidth: `${width}px` }}>
        <DynamicThumbnail
          slug={slug}
          title={title}
          category={category}
          existingImage={existingImage}
        />
      </div>
    );
  }

  // Otherwise, show traditional image
  return (
    <CdnImage
      src={existingImage}
      alt={alt || title}
      width={width}
      height={height}
      className={className}
    />
  );
};
