'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import Link from 'next/link';

type Prompt = {
  id: number;
  title: string;
  description: string | null;
  promptText: string;
  author: string | null;
  date: string | null;
  category: string | null;
  sourceUrl: string | null;
  sourceType: string | null;
  imageUrl: string | null;
  authorHandle: string | null;
  likes: number;
  retweets: number;
  layoutCategory?: string | null;
  domainCategory?: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

interface LayoutCategory {
  category: string;
  count: number;
}

interface DomainCategory {
  category: string;
  count: number;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getSourceBadgeClass = (sourceType: string) => {
  const classes: Record<string, string> = {
    twitter: 'bg-blue-100 text-blue-800',
    youtube: 'bg-red-100 text-red-800',
    promptgather: 'bg-purple-100 text-purple-800',
  };
  return classes[sourceType] || 'bg-gray-100 text-gray-800';
};

import CdnImage from '@/app/[locale]/_components/CdnImage';

const normalizeCdnImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) {
    return '/images/default-prompt-image.jpg';
  }

  if (imageUrl.includes('static/images/')) {
    return imageUrl.replace('/static/images/', '/images/');
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/images/')) {
    return imageUrl;
  }

  if (!imageUrl.startsWith('/')) {
    return `/images/${imageUrl}`;
  }

  if (!imageUrl.includes('/images/')) {
    return imageUrl.replace('/', '/images/');
  }

  return imageUrl;
};

function PromptImage({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const placeholderImage =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop';

  const normalizedUrl = normalizeCdnImageUrl(imageUrl);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <CdnImage
        src={hasError ? placeholderImage : normalizedUrl}
        alt={title}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        onError={() => {
          console.error('CdnImage failed to load:', normalizedUrl);
          setHasError(true);
        }}
      />
    </div>
  );
}

interface NanoBananaProPromptsClientProps {
  initialData: Prompt[] | null;
  error: string | null;
}

export default function NanoBananaProPromptsClient({ initialData, error }: NanoBananaProPromptsClientProps) {
  const [allPrompts, setAllPrompts] = useState<Prompt[]>(initialData || []);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [layoutFilter, setLayoutFilter] = useState<string>('all');
  const [sources, setSources] = useState<string[]>(['all']);
  const [layoutCategories, setLayoutCategories] = useState<LayoutCategory[]>([]);
  const [domainCategories, setDomainCategories] = useState<DomainCategory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [displayedCount, setDisplayedCount] = useState(20);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Initialize with server data or load from client
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      // Use server-provided data
      processPrompts(initialData);
      setIsLoading(false);
    } else if (!error) {
      // Fallback to client-side loading
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const processPrompts = (promptsData: Prompt[]) => {
    const validPrompts = promptsData.filter((item): item is Prompt =>
      item &&
      typeof item.id === 'number' &&
      typeof item.title === 'string' &&
      typeof item.promptText === 'string'
    );

    setAllPrompts(validPrompts);

    // Extract unique sources
    const uniqueSources = Array.from(
      new Set(validPrompts.map(p => p.sourceType).filter(Boolean))
    ) as string[];
    setSources(['all', ...uniqueSources]);

    // Calculate layout categories
    const layoutCounts: Record<string, number> = {};
    validPrompts.forEach(p => {
      if (p.layoutCategory) {
        layoutCounts[p.layoutCategory] = (layoutCounts[p.layoutCategory] || 0) + 1;
      }
    });
    const layoutCats = Object.entries(layoutCounts).map(([category, count]) => ({ category, count }));
    setLayoutCategories(layoutCats);

    // Calculate domain categories
    const domainCounts: Record<string, number> = {};
    validPrompts.forEach(p => {
      if (p.domainCategory) {
        domainCounts[p.domainCategory] = (domainCounts[p.domainCategory] || 0) + 1;
      }
    });
    const domainCats = Object.entries(domainCounts).map(([category, count]) => ({ category, count }));
    setDomainCategories(domainCats);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/data/nanobanana.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const promptsData = responseData?.prompts;

      if (!Array.isArray(promptsData)) {
        throw new Error('Expected a "prompts" array in the response');
      }

      processPrompts(promptsData);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and paginate prompts
  const filterPrompts = useCallback(() => {
    let filtered = [...allPrompts];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.promptText?.toLowerCase().includes(search) ||
        p.author?.toLowerCase().includes(search)
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(p => p.sourceType === sourceFilter);
    }

    if (domainFilter !== 'all') {
      filtered = filtered.filter(p => p.domainCategory === domainFilter);
    }

    if (layoutFilter !== 'all') {
      filtered = filtered.filter(p => p.layoutCategory === layoutFilter);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / 20);
    const displayed = Math.min(displayedCount, total);

    setPagination({
      page: Math.ceil(displayed / 20),
      limit: 20,
      total,
      totalPages,
      hasNextPage: displayed < total,
      hasPrevPage: false
    });

    return filtered.slice(0, displayedCount);
  }, [allPrompts, searchTerm, sourceFilter, domainFilter, layoutFilter, displayedCount]);

  useEffect(() => {
    setDisplayedCount(20);
  }, [searchTerm, sourceFilter, domainFilter, layoutFilter]);

  useEffect(() => {
    setPrompts(filterPrompts());
  }, [filterPrompts]);

  const loadMore = () => {
    setDisplayedCount(prev => prev + 20);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading prompts</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with semantic HTML */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nano Banana Pro Prompts</h1>
          <p className="text-lg text-gray-600">Discover and explore creative prompts for your next project</p>
        </header>

        {/* Stats with semantic HTML */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8" aria-label="Statistics">
          <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Results</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{pagination.total}</dd>
          </div>
          <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Loaded</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {prompts.length} / {pagination.total}
            </dd>
          </div>
        </section>

        {/* Domain Categories */}
        {domainCategories.length > 0 && (
          <section className="mb-8" aria-label="Domain Categories">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Domain Categories</h2>
            <nav className="flex flex-wrap gap-3" aria-label="Filter by domain">
              {domainCategories.map(({ category, count }) => (
                <button
                  key={category}
                  className={`flex items-center px-3 py-2 rounded-lg shadow-sm border ${
                    domainFilter === category
                      ? 'bg-indigo-100 border-indigo-300'
                      : 'bg-white border-gray-200 hover:bg-indigo-50'
                  } cursor-pointer transition-colors`}
                  onClick={() => setDomainFilter(prev => (prev === category ? 'all' : category))}
                  aria-pressed={domainFilter === category}
                  aria-label={`Filter by ${category} domain (${count} prompts)`}
                >
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </button>
              ))}
            </nav>
          </section>
        )}


        {/* Filters with semantic HTML and ARIA labels */}
        <section className="bg-white shadow rounded-lg p-6 mb-8" aria-label="Search and filter prompts">
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  id="search"
                  name="search"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search prompts by title, description, or author"
                />
              </div>
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                id="source"
                name="source"
                className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                aria-label="Filter by source"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active Filters</label>
              <div className="flex items-center space-x-2" role="status" aria-live="polite">
                {domainFilter !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Domain: {domainFilter}
                    <button
                      type="button"
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDomainFilter('all');
                      }}
                      aria-label={`Remove ${domainFilter} domain filter`}
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8" aria-hidden="true">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                )}
                {layoutFilter !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Layout: {layoutFilter}
                    <button
                      type="button"
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayoutFilter('all');
                      }}
                      aria-label={`Remove ${layoutFilter} layout filter`}
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8" aria-hidden="true">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Prompts Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow" role="status">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prompts found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  setSearchTerm('');
                  setSourceFilter('all');
                  setDomainFilter('all');
                  setLayoutFilter('all');
                }}
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <section aria-label="Prompts list">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {prompts.map((prompt) => (
                  <article key={prompt.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                    <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {prompt.imageUrl ? (
                        <PromptImage imageUrl={prompt.imageUrl} title={prompt.title} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
                          <div className="text-center p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-indigo-600">No preview available</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          {prompt.sourceType && (
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getSourceBadgeClass(prompt.sourceType)}`}>
                              {prompt.sourceType}
                            </span>
                          )}
                          <time className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full" dateTime={prompt.date || undefined}>
                            {prompt.date ? formatDate(prompt.date) : 'Unknown date'}
                          </time>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">{prompt.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {prompt.description || 'No description available'}
                        </p>

                        {prompt.promptText && (
                          <div className="mt-4">
                            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h4 className="text-xs font-medium text-gray-500">Prompt</h4>
                                <button
                                  onClick={() => copyToClipboard(prompt.promptText, prompt.id)}
                                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                                  aria-label={`Copy prompt: ${prompt.title}`}
                                >
                                  {copiedId === prompt.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                                      <span className="ml-1">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span className="ml-1">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="p-3 text-sm text-gray-800 max-h-32 overflow-y-auto">
                                {prompt.promptText.length > 100 ? `${prompt.promptText.substring(0, 100)}...` : prompt.promptText}
                              </div>
                            </div>
                          </div>
                        )}

                        {prompt.category && prompt.category !== 'NANO BANANA PRO' && (
                          <div className="mt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {prompt.category}
                            </span>
                          </div>
                        )}
                      </div>

                      <footer className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{prompt.author || 'Unknown'}</p>
                              {prompt.authorHandle && (
                                <p className="text-xs text-gray-500">@{prompt.authorHandle.replace('@', '')}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {prompt.sourceUrl && (
                              <a
                                href={prompt.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                aria-label={`View source for ${prompt.title}`}
                              >
                                Source
                              </a>
                            )}
                            <Link
                              href={`/nano-banana-pro-prompts/${prompt.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              aria-label={`View details for ${prompt.title}`}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label={`Load more prompts. Currently showing ${prompts.length} of ${pagination.total}`}
                >
                  Load More ({prompts.length} of {pagination.total})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}