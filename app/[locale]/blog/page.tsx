import Image from 'next/image';
import Link from 'next/link';
import CdnImage from '../_components/CdnImage';


const blogPosts = [
  {
    slug: 'video-enhancement',
    title: 'AI Video Enhancement: Storyboards, Meme Captions & SFX Automation',
    date: 'November 18, 2025',
    readTime: '7 min read',
    tag: 'Video Enhancement',
    image: '/images/video-enhancement-pipeline.png',
  },
  {
    slug: 'video-evaluation',
    title: 'Evaluating AI Video Translation: Metrics that Actually Matter',
    date: 'November 14, 2025',
    readTime: '6 min read',
    tag: 'Localization',
    image: '/images/video-translation-eval.jpg',
  },
  {
    slug: 'storyboard-to-pipeline',
    title: 'Create Your Own AI-Powered Comic Animation: A Simple Step-by-Step Guide',
    date: 'October 28, 2025',
    readTime: '5 min read',
    tag: 'Animation',
    image: '/images/ai-animation-pipeline.jpg',
  },
  {
    slug: 'agents-vs-workflows',
    title: 'Part 2: Agents vs Workflows – From Control to Intelligence',
    date: 'October 28, 2025',
    readTime: '6 min read',
    tag: 'Generative Tools',
    image: '/images/agents-vs-workflows.jpg',
  },
  {
    slug: 'ae-vs-comfyui',
    title: 'Part 3: AE vs ComfyUI – Motion Design vs Diffusion Pipelines',
    date: 'October 28, 2025',
    readTime: '7 min read',
    tag: 'Tools & Pipeline',
    image: '/images/ae-vs-comfyui.jpg',
  },
];

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
