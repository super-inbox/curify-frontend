import Link from 'next/link';
import relatedLinksData from '@/public/data/related-links.json';

interface RelatedLink {
  title: string;
  url: string;
  description: string;
}

interface RelatedLinksProps {
  currentSlug: string;
  locale: string;
}

export default function RelatedLinks({ currentSlug, locale }: RelatedLinksProps) {
  const links = (relatedLinksData as any).links[currentSlug] as RelatedLink[] | undefined;
  
  if (!links || links.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
      <div className="space-y-4">
        {links.map((link, index) => (
          <Link
            key={index}
            href={`/${locale}${link.url.startsWith('/') ? link.url : `/${link.url}`}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {link.description}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <svg
                  className="w-5 h-5 text-gray-400"
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
        ))}
      </div>
    </section>
  );
}
