'use client';

import Link from 'next/link';
import CdnImage from './CdnImage';
import { DynamicThumbnail } from '@/app/[locale]/(public)/blog/[slug]/components/DynamicThumbnail';
import { useTranslations } from 'next-intl';
import blogsData from '@/public/data/blogs.json';
import { blogPosts as blogPostsConfig } from '@/app/[locale]/(public)/blog/[slug]/utils/blog-config';
import { useClickTracking } from '@/services/useTracking';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
  category?: string;
}

interface RelatedBlogCardProps {
  blog: BlogPost;
  locale: string;
  category?: string;
}

export default function RelatedBlogCard({ blog, locale, category }: RelatedBlogCardProps) {
  const t = useTranslations('blog');

  // Per-post localized title from messages/<locale>/blog.json. Same lookup
  // pattern as the blog index page (fd6a67a) — falls back to the catalog's
  // English title when the namespace or the localized key is missing, so a
  // catalog/namespace title drift doesn't render an empty card.
  const namespace = blogPostsConfig[blog.slug as keyof typeof blogPostsConfig]?.namespace;
  const localizedTitle =
    namespace && t.has(`${namespace}.title`) ? t(`${namespace}.title`) : blog.title;

  // Find the full blog data to check for useMermaidThumbnail
  const blogData = blogsData.find((b: any) => b.slug === blog.slug) as any;
  const useMermaidThumbnail = blogData?.useMermaidThumbnail || false;
  const thumbnailType = blogData?.thumbnailType || '';

  // Track related-blog clicks so the admin funnel can answer "does
  // related-articles deliver across-category navigation, or just same-
  // category churn?". content_id is greppable: related-blog:<slug>.
  const trackClick = useClickTracking(
    `related-blog:${blog.slug}`,
    'menu_link',
    'cards'
  );

  return (
    <Link
      href={`/${locale}/blog/${blog.slug}`}
      onClick={trackClick}
      className="group block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {useMermaidThumbnail ? (
          <div className="w-full h-full">
            <DynamicThumbnail
              slug={thumbnailType || blog.slug}
              title={typeof localizedTitle === 'string' ? localizedTitle : blog.title}
              category={blog.category || category || ''}
              existingImage={blog.image}
              forceType="mermaid"
            />
          </div>
        ) : (
          <CdnImage
            src={blog.image}
            alt={localizedTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>{blog.date}</span>
          <span className="mx-2">•</span>
          <span>{blog.readTime}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
          {localizedTitle}
        </h3>
        
        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
          <span>{t('readMore', { defaultValue: 'Read more' })}</span>
          <svg
            className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
