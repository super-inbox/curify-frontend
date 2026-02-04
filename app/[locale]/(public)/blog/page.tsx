import Link from 'next/link';
import CdnImage from '../../_components/CdnImage';
import blogPosts from '@/public/data/blogs.json';

export default function BlogListPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 pt-24 pb-16">
      <h1 className="text-4xl font-bold mb-10">Latest Articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {blogPosts.map((post) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.slug}
            className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-52 w-full">
              <CdnImage
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-5">
              <div className="text-xs uppercase text-red-600 font-semibold mb-2">
                {post.tag}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                {post.date} &nbsp; / &nbsp; {post.readTime}
              </div>

              <h2 className="text-lg font-semibold group-hover:text-blue-600 transition">
                {post.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
