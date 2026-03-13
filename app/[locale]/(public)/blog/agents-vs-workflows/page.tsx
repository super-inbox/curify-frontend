import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CdnImage from "../../../_components/CdnImage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "agentsVsWorkflows" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AgentsVsWorkflowsPost() {  
  return (
    <article className="pt-10 pb-8">
      <h1 className="text-4xl font-bold mb-8">🤖 Agents vs Workflows</h1>

      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <CdnImage
          src="/images/agents-vs-workflows.jpg"
          alt="Agents vs workflows"
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4">
        Many successful AI creators today (like NanoBanana) rely on{" "}
        <strong>carefully engineered workflows</strong> — scripted pipelines for
        writing, dubbing, editing, and publishing.
      </p>

      <p className="mb-4">
        But agents are different. As Anthropic puts it:
        <em> “Workflows are predictable. Agents are adaptive.”</em>
      </p>

      <p className="mb-4">
        At Curify, workflows ensure consistency and scale (e.g., subtitle extraction
        and muxing), while agents introduce adaptive intelligence:
      </p>

      <ul className="list-disc list-inside mb-8 space-y-1 clear-left">
        <li>Post-editing translations based on context</li>
        <li>Adjusting pacing or emotional tone in dubs</li>
        <li>Understanding intent and speaker sentiment</li>
      </ul>

      <p>
        The future of creative automation lies in harmony: workflows provide
        <strong> control</strong>, agents bring <strong>creativity</strong>.
      </p>

      {/* Related Articles */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              slug: 'storyboard-to-pipeline',
              title: 'Create Your Own AI-Powered Comic Animation: A Simple Step-by-Step Guide',
              date: 'October 28, 2025',
              readTime: '5 min read',
              tag: 'Creator Tools',
              image: '/images/ai-animation-pipeline.jpg',
            },
            {
              slug: 'ae-vs-comfyui',
              title: 'Part 3: AE vs ComfyUI – Motion Design vs Diffusion Pipelines',
              date: 'October 28, 2025',
              readTime: '7 min read',
              tag: 'Creator Tools',
              image: '/images/ae-vs-comfyui.jpg',
            },
            {
              slug: 'video-enhancement',
              title: 'AI Video Enhancement: Storyboards, Meme Captions & SFX Automation',
              date: 'November 18, 2025',
              readTime: '7 min read',
              tag: 'Creator Tools',
              image: '/images/video-enhancement-pipeline.png',
            }
          ].map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-40 w-full">
                <CdnImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase text-red-600 font-semibold mb-1">
                  {post.tag}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition">
                  {post.title}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {post.date} • {post.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            See all blog posts
          </Link>
        </div>
      </section>
    </article>
  );
}
