/* Server-only equivalents: article navigation remains usable without JS. */
import "server-only";
import blogs from "@/public/data/blogs.json";
import { recentBlogEntries } from "@/lib/recent-blog-entries";
import { getCanonicalPath } from "@/lib/canonical";
import { CDN_BASE } from "@/lib/constants";

function imageUrl(src: string) {
  return src.startsWith("/images/") && CDN_BASE ? `${CDN_BASE}${src}` : src;
}

export function EditorialHero({ slug, locale }: { slug: string; locale: string }) {
  const entry = recentBlogEntries[slug];
  const [alt, label, caption] = locale === "zh" && entry.zh ? entry.zh : entry.en;
  const href = getCanonicalPath(locale, entry.target);
  return <figure data-blog-hero={slug} className="my-8">
    <a href={href} aria-label={label} className="block rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {/* A plain image avoids making this read-only article depend on a client image module. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl(entry.image)} alt={alt} width={1200} height={800} fetchPriority="high" className="mx-auto h-auto max-h-[32rem] w-full rounded-xl object-contain" />
    </a>
    <figcaption className="mt-3 text-sm leading-6 text-slate-600">{caption}</figcaption>
    <a data-blog-cta="hero" href={href} className="mt-4 inline-flex rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold !text-white !no-underline">{label} →</a>
  </figure>;
}

export function EditorialFooter({ slug, locale }: { slug: string; locale: string }) {
  const entry = recentBlogEntries[slug];
  const [, label, description] = locale === "zh" && entry.zh ? entry.zh : entry.en;
  const current = blogs.find(blog => blog.slug === slug);
  const explicit = current?.relatedLinks ?? [];
  const related = (explicit.length ? explicit.map(id => blogs.find(blog => blog.slug === id)).filter(Boolean) : blogs.filter(blog => blog.slug !== slug && blog.category === current?.category)).slice(0, 3);
  return <div data-blog-footer={slug} className="pb-10">
    <aside className="rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-semibold">{label}</h2>
      <p className="my-3 leading-7">{description}</p>
      <a data-blog-cta="footer" href={getCanonicalPath(locale, entry.target)} className="inline-flex rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white">{label} →</a>
    </aside>
    <section aria-labelledby="related-articles" className="mt-12 border-t pt-8">
      <h2 id="related-articles" className="mb-6 text-2xl font-bold">Related articles</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {related.map(blog => {
          if (!blog) return null;
          const targetLocale = blog.locales && !blog.locales.includes(locale) ? "en" : locale;
          return <a key={blog.slug} href={getCanonicalPath(targetLocale, `/blog/${blog.slug}`)} className="overflow-hidden rounded-xl border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(blog.image)} alt="" width={640} height={360} loading="lazy" className="aspect-video w-full object-cover" />
            <div className="p-5"><p className="text-sm text-slate-500">{blog.date} · {blog.readTime}</p><h3 className="mt-2 text-lg font-semibold">{blog.title}</h3></div>
          </a>;
        })}
      </div>
    </section>
  </div>;
}
