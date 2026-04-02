'use client';

import Link from 'next/link';
import blogsData from '@/public/data/blogs.json';
import categoriesData from '@/public/data/blog-categories.json';
import RelatedBlogCard from './RelatedBlogCard';
import { useTranslations } from 'next-intl';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
  category?: string;
  relatedLinks?: string[];
}

interface RelatedBlogsProps {
  currentSlug: string;
  locale: string;
  maxRelated?: number;
}

export default function RelatedBlogs({ currentSlug, locale, maxRelated = 3 }: RelatedBlogsProps) {
  const t = useTranslations('blog');
  
  // Find current blog post
  const currentBlog = blogsData.find(blog => blog.slug === currentSlug);
  if (!currentBlog) return null;

  // Get category from current blog
  const currentCategory = currentBlog.category;
  
  // Get category display name
  const categoryConfig = currentCategory ? (categoriesData as any).categories[currentCategory] : undefined;
  const categoryName = categoryConfig?.name || currentCategory || 'Uncategorized';

  // First, try to use relatedLinks if they exist
  let relatedBlogs: BlogPost[] = [];
  
  if (currentBlog.relatedLinks && currentBlog.relatedLinks.length > 0) {
    // Use explicitly configured related links
    relatedBlogs = currentBlog.relatedLinks
      .map(linkSlug => blogsData.find(blog => blog.slug === linkSlug))
      .filter(Boolean) as BlogPost[];
  } else {
    // Fallback: Find related blogs based on category
    relatedBlogs = blogsData.filter(blog => {
      if (blog.slug === currentSlug) return false; // Exclude current blog
      return blog.category === currentCategory;
    });
  }

  // Limit the number of related blogs
  const displayBlogs = relatedBlogs.slice(0, maxRelated);

  if (displayBlogs.length === 0) return null;

  // Helper function to get localized blog data
  const getLocalizedBlogData = (blog: BlogPost) => {
    try {
      // Try to get localized data from the blog posts array in translations
      const postsData = t.raw('posts') as unknown;
      const localizedPosts = Array.isArray(postsData) ? postsData as any[] : [];
      const localizedPost = localizedPosts?.find((post: any) => post.slug === blog.slug);
      
      if (localizedPost) {
        return {
          ...blog,
          title: localizedPost.title || blog.title,
          date: localizedPost.date || blog.date,
          readTime: localizedPost.readTime || blog.readTime,
          tag: localizedPost.tag || blog.tag
        };
      }
    } catch (error) {
      // Fallback to original data if localization fails
    }
    return blog;
  };

  const localizedDisplayBlogs = displayBlogs.map(getLocalizedBlogData);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('relatedArticles', { defaultValue: 'Related Articles' })}</h2>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {categoryName}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localizedDisplayBlogs.map((blog) => (
          <RelatedBlogCard 
            key={blog.slug} 
            blog={blog} 
            locale={locale} 
            category={categoryName}
          />
        ))}
      </div>
    </section>
  );
}
