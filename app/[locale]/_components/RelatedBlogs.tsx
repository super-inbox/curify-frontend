import Link from 'next/link';
import blogsData from '@/public/data/blogs.json';
import categoriesData from '@/public/data/blog-categories.json';
import RelatedBlogCard from './RelatedBlogCard';

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
  // Find current blog post
  const currentBlog = blogsData.find(blog => blog.slug === currentSlug);
  if (!currentBlog) return null;

  // Get category from current blog (use the category field if available, otherwise fallback to tag-based mapping)
  let currentCategory = currentBlog.category;
  
  // If no category field, determine from tag (fallback for backward compatibility)
  if (!currentCategory) {
    const tag = currentBlog.tag?.toLowerCase() || '';
    if (tag.includes('ai platform') || tag.includes('ai architecture') || tag.includes('ai industry') || tag.includes('data science')) {
      currentCategory = 'ds-ai-engineering';
    } else if (tag.includes('video translation') || tag.includes('localization')) {
      currentCategory = 'video-translation';
    } else if (tag.includes('video analysis') || tag.includes('video enhancement') || tag.includes('animation') || tag.includes('generative tools') || tag.includes('tools pipeline') || tag.includes('ai audio') || tag.includes('accessibility')) {
      currentCategory = 'creator-tools';
    } else if (tag.includes('traditional medicine') || tag.includes('data visualization')) {
      currentCategory = 'nano-banana-prompts';
    } else if (tag.includes('cultural heritage')) {
      currentCategory = 'culture';
    } else if (tag.includes('ai tools')) {
      currentCategory = 'nano-banana-prompts';
    } else {
      currentCategory = 'creator-tools'; // default
    }
  }

  // Get category display name
  const categoryConfig = (categoriesData as any).categories[currentCategory];
  const categoryName = categoryConfig?.name || currentCategory;

  // Find related blogs based on category
  const relatedBlogs = blogsData
    .filter(blog => {
      if (blog.slug === currentSlug) return false; // Exclude current blog
      
      // Use category field if available, otherwise determine from tag
      const blogCategory = blog.category;
      if (blogCategory) {
        return blogCategory === currentCategory;
      } else {
        // Fallback to tag-based mapping
        const tag = blog.tag?.toLowerCase() || '';
        if (currentCategory === 'data-science-ai') {
          return tag.includes('ai platform') || tag.includes('ai architecture') || tag.includes('ai industry') || tag.includes('data science');
        } else if (currentCategory === 'video-creator-tools') {
          return tag.includes('video translation') || tag.includes('localization') || tag.includes('video analysis') || tag.includes('video enhancement') || tag.includes('animation') || tag.includes('generative tools') || tag.includes('tools pipeline') || tag.includes('ai audio') || tag.includes('accessibility');
        } else if (currentCategory === 'nano-banana') {
          return tag.includes('traditional medicine') || tag.includes('data visualization') || tag.includes('cultural heritage');
        } else if (currentCategory === 'prompts') {
          return tag.includes('ai tools');
        }
      }
      return false;
    })
    .slice(0, maxRelated);

  if (relatedBlogs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {categoryName}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedBlogs.map((blog) => (
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
