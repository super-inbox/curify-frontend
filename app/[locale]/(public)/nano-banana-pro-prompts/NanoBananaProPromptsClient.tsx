'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import PromptCard from './PromptCard';
import { useTranslations } from "next-intl";

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

interface LayoutCategory { category: string; count: number; }
interface DomainCategory { category: string; count: number; }

interface NanoBananaProPromptsClientProps {
  initialData: Prompt[] | null;
  error: string | null;
}

export default function NanoBananaProPromptsClient({ initialData, error }: NanoBananaProPromptsClientProps) {
  const [allPrompts, setAllPrompts] = useState<Prompt[]>(initialData || []);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [layoutFilter, setLayoutFilter] = useState<string>('all');
  const [sources, setSources] = useState<string[]>(['all']);
  const [domainCategories, setDomainCategories] = useState<DomainCategory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false,
  });
  const [displayedCount, setDisplayedCount] = useState(20);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      processPrompts(initialData);
      setIsLoading(false);
    } else if (!error) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const processPrompts = (promptsData: Prompt[]) => {
    const validPrompts = promptsData.filter(
      (item): item is Prompt =>
        item && typeof item.id === 'number' && typeof item.title === 'string' && typeof item.promptText === 'string'
    );
    setAllPrompts(validPrompts);

    const uniqueSources = Array.from(new Set(validPrompts.map((p) => p.sourceType).filter(Boolean))) as string[];
    setSources(['all', ...uniqueSources]);

    const domainCounts: Record<string, number> = {};
    validPrompts.forEach((p) => {
      if (p.domainCategory) domainCounts[p.domainCategory] = (domainCounts[p.domainCategory] || 0) + 1;
    });
    setDomainCategories(Object.entries(domainCounts).map(([category, count]) => ({ category, count })));
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
  
      const response = await fetch('/api/nano_prompts');
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = await response.json();
  
      const promptsData = responseData?.prompts;
  
      if (!Array.isArray(promptsData)) {
        throw new Error('Expected a "prompts" array in the response');
      }
  
      processPrompts(promptsData);
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPrompts = useCallback(() => {
    let filtered = [...allPrompts];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.promptText?.toLowerCase().includes(search) ||
          p.author?.toLowerCase().includes(search)
      );
    }
    if (sourceFilter !== 'all') filtered = filtered.filter((p) => p.sourceType === sourceFilter);
    if (domainFilter !== 'all') filtered = filtered.filter((p) => p.domainCategory === domainFilter);
    if (layoutFilter !== 'all') filtered = filtered.filter((p) => p.layoutCategory === layoutFilter);

    const total = filtered.length;
    const displayed = Math.min(displayedCount, total);
    setPagination({ page: Math.ceil(displayed / 20), limit: 20, total, totalPages: Math.ceil(total / 20), hasNextPage: displayed < total, hasPrevPage: false });
    return filtered.slice(0, displayedCount);
  }, [allPrompts, searchTerm, sourceFilter, domainFilter, layoutFilter, displayedCount]);

  useEffect(() => { setDisplayedCount(20); }, [searchTerm, sourceFilter, domainFilter, layoutFilter]);
  useEffect(() => { setPrompts(filterPrompts()); }, [filterPrompts]);

  const loadMore = () => setDisplayedCount((prev) => prev + 20);
  const t = useTranslations("nanoGallery");

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-900">Error loading prompts</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading prompts...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

      <header className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        {t("title")}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {t.rich("description", {
          strong: (chunks) => (
            <strong>{chunks}</strong>
          ),
        })}
      </p>
    </header>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-5 mb-8" aria-label="Statistics">
          <div className="px-4 py-5 bg-white shadow rounded-lg sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Results</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{pagination.total}</dd>
          </div>
          <div className="px-4 py-5 bg-white shadow rounded-lg sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Loaded</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{prompts.length} / {pagination.total}</dd>
          </div>
        </section>

        {/* Domain Categories */}
        {domainCategories.length > 0 && (
          <section className="mb-8" aria-label="Domain Categories">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Domain Categories</h2>
            <nav className="flex flex-wrap gap-3">
              {domainCategories.map(({ category, count }) => (
                <button
                  key={category}
                  className={`flex items-center px-3 py-2 rounded-lg shadow-sm border transition-colors ${
                    domainFilter === category ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-gray-200 hover:bg-indigo-50'
                  }`}
                  onClick={() => setDomainFilter((prev) => (prev === category ? 'all' : category))}
                  aria-pressed={domainFilter === category}
                >
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">{count}</span>
                </button>
              ))}
            </nav>
          </section>
        )}

        {/* Filters */}
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
                className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              <div className="flex items-center flex-wrap gap-2" role="status" aria-live="polite">
                {domainFilter !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Domain: {domainFilter}
                    <button type="button" className="ml-1.5 h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200" onClick={() => setDomainFilter('all')} aria-label={`Remove ${domainFilter} filter`}>
                      <svg className="h-2 w-2 mx-auto" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                    </button>
                  </span>
                )}
                {layoutFilter !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Layout: {layoutFilter}
                    <button type="button" className="ml-1.5 h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200" onClick={() => setLayoutFilter('all')} aria-label={`Remove ${layoutFilter} filter`}>
                      <svg className="h-2 w-2 mx-auto" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow" role="status">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prompts found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={() => { setSearchTerm(''); setSourceFilter('all'); setDomainFilter('all'); setLayoutFilter('all'); }}
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
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </section>
            {pagination.hasNextPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
