import CdnImage from './CdnImage';
import BlogCTACard from './BlogCTACard';
import RelatedBlogs from './RelatedBlogs';
import { getCanonicalPath } from '@/lib/canonical';

import { recentBlogEntries as entries } from "@/lib/recent-blog-entries";

export function RecentBlogHero({slug,locale}:{slug:string;locale:string}) {
  const e=entries[slug]; const [alt,label,caption]=locale==='zh'&&e.zh?e.zh:e.en;
  const href=getCanonicalPath(locale,e.target);
  return <figure data-blog-hero={slug} className="my-8">
    <a href={href} className="group block rounded-2xl border border-slate-200 bg-slate-50 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-600" aria-label={label}>
      <CdnImage src={e.image} alt={alt} width={1200} height={800} priority className="mx-auto h-auto max-h-[32rem] w-full rounded-xl object-contain transition group-hover:opacity-90" />
    </a>
    <figcaption className="mt-3 text-sm leading-6 text-slate-600">{caption}</figcaption>
    <a data-blog-cta="hero" href={href} className="mt-4 inline-flex rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold !text-white !no-underline hover:bg-purple-800">{label} →</a>
  </figure>;
}
export function RecentBlogFooter({slug,locale}:{slug:string;locale:string}) {
  const e=entries[slug];const [,label,description]=locale==='zh'&&e.zh?e.zh:e.en;
  return <div data-blog-footer={slug}>
    <BlogCTACard slug={slug} locale={locale} category={e.category} primary={{label,description,href:getCanonicalPath(locale,e.target)}} />
    <RelatedBlogs currentSlug={slug} locale={locale} maxRelated={3}/>
  </div>;
}
