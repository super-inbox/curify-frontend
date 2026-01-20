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
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type PaginatedResponse = {
  data: Prompt[];
  pagination: Pagination;
};

type LayoutCategory = {
  layout_category: string;
  count: number;
};

type DomainCategory = {
  layout_category: string;
  count: number;
};

type MetadataResponse = {
  sources: string[];
  layoutCategories: LayoutCategory[];
  domainCategories: DomainCategory[];
};

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

function PromptImage({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const [imgSrc, setImgSrc] = useState(imageUrl || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const placeholderImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop';

  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const correctedImageUrl = imageUrl.replace('/static/images/', '/images/');

    const img = new Image();
    img.src = correctedImageUrl;
    
    img.onload = () => {
      setImgSrc(correctedImageUrl);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setImgSrc(placeholderImage);
      setIsLoading(false);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <CdnImage
        src={hasError ? placeholderImage : imgSrc}
        alt={title}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setImgSrc(placeholderImage);
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )}
    </div>
  );
}

const NanoBananaProPromptsPage = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchPrompts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      // Add search and filter parameters
      if (searchTerm) params.append('search', searchTerm);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (domainFilter !== 'all') params.append('domain_category', domainFilter);
      if (layoutFilter !== 'all') params.append('layout_category', layoutFilter);

      const response = await fetch(`/api/prompts?${params}`);
      const data: PaginatedResponse = await response.json();
      
      if (response.ok) {
        setPrompts(prev => append ? [...prev, ...data.data] : data.data);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch prompts:', data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm, sourceFilter, domainFilter, layoutFilter]);

  // Fetch metadata (sources and layout categories) on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/prompts?metadata=true');
        const data: MetadataResponse = await response.json();
        
        if (response.ok) {
          setSources(['all', ...data.sources]);
          setLayoutCategories(data.layoutCategories || []);
          setDomainCategories(data.domainCategories || []);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    
    fetchMetadata();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPrompts(1);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sourceFilter, domainFilter, layoutFilter, fetchPrompts]);
  
  const loadMore = () => {
    if (pagination.hasNextPage && !isLoadingMore) {
      fetchPrompts(pagination.page + 1, true);
    }
  };

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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nano Banana Pro Prompts</h1>
          <p className="text-lg text-gray-600">Discover and explore creative prompts for your next project</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
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
        </div>

        {/* Domain Categories */}
        {domainCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Domain Categories</h2>
            <div className="flex flex-wrap gap-3">
              {domainCategories.map(({ layout_category, count }) => (
                <div 
                  key={layout_category}
                  className={`flex items-center px-3 py-2 rounded-lg shadow-sm border ${
                    domainFilter === layout_category 
                      ? 'bg-indigo-100 border-indigo-300' 
                      : 'bg-white border-gray-200 hover:bg-indigo-50'
                  } cursor-pointer transition-colors`}
                  onClick={() => setDomainFilter(prev => prev === layout_category ? 'all' : layout_category)}
                >
                  <span className="font-medium text-gray-900">{layout_category}</span>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Layout Categories */}
        {layoutCategories.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Layout Categories</h2>
            <div className="flex flex-wrap gap-3">
              {layoutCategories.map(({ layout_category, count }) => (
                <div 
                  key={layout_category}
                  className={`flex items-center px-3 py-2 rounded-lg shadow-sm border ${
                    layoutFilter === layout_category 
                      ? 'bg-indigo-100 border-indigo-300' 
                      : 'bg-white border-gray-200 hover:bg-indigo-50'
                  } cursor-pointer transition-colors`}
                  onClick={() => setLayoutFilter(prev => prev === layout_category ? 'all' : layout_category)}
                >
                  <span className="font-medium text-gray-900">{layout_category}</span>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                id="source"
                className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
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
              <div className="flex items-center space-x-2">
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
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
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
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Prompts Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                  <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {prompt.imageUrl ? (
                      <PromptImage imageUrl={prompt.imageUrl} title={prompt.title} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
                        <div className="text-center p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          {prompt.date ? formatDate(prompt.date) : 'Unknown date'}
                        </span>
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
                              >
                                {copiedId === prompt.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                    <span className="ml-1">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
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
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
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
                            >
                              Source
                            </a>
                          )}
                          <Link
                            href={`/nano-banana-pro-prompts/${prompt.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    `Load More (${prompts.length} of ${pagination.total})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NanoBananaProPromptsPage;