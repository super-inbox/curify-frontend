import Head from 'next/head';

interface StructuredDataProps {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  author?: string;
  image?: string;
  url: string;
  readTime?: string;
}

export default function StructuredData({
  title,
  description,
  publishDate,
  modifiedDate,
  author = 'Curify Studio',
  image,
  url,
  readTime
}: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image,
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Curify Studio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://curify-ai.com/logo.svg'
      }
    },
    datePublished: publishDate,
    dateModified: modifiedDate || publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    ...(readTime && {
      timeRequired: `PT${readTime.replace(' min read', '')}M`
    }),
    articleSection: 'AI Prompting',
    keywords: ['nano banana', 'AI prompting', 'content generation', 'prompt engineering', 'AI tips'],
    inLanguage: 'en-US'
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  );
}
