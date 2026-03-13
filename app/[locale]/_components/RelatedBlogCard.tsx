import Link from 'next/link';
import CdnImage from './CdnImage';

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
  return (
    <Link
      href={`/${locale}/blog/${blog.slug}`}
      className="group block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <CdnImage
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
            {category || blog.tag}
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
          {blog.title}
        </h3>
        
        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
          <span>Read more</span>
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
