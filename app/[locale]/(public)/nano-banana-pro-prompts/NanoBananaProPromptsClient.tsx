'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from "next-intl";

import PromptCard from './PromptCard';
import { nanoPromptsService } from '@/services/nanoPrompts';
import type { NanoPromptBase } from '@/types/nanoPrompts';

/**
 * UI Prompt Shape (view model)
 */
type Prompt = {
  id: number;
  title: string;
  description: string | null;
  promptText: string;
  imageUrl: string | null;
  category: string | null;
  sourceType: string | null;
  domainCategory: string | null;
};

type Pagination = {
  total: number;
  hasNextPage: boolean;
};

interface DomainCategory {
  category: string;
  count: number;
}

interface Props {
  initialData: Prompt[] | null;
  error: string | null;
}

// ─────────────────────────────────────────────────────────────
// Mapping
// ─────────────────────────────────────────────────────────────

function mapNanoPromptToUI(p: NanoPromptBase): Prompt {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    promptText: p.prompt,
    imageUrl: p.imageURL ?? null,
    category: p.tags?.[0] ?? null,
    sourceType: null,
    domainCategory: p.tags?.[0] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function NanoBananaProPromptsClient({ initialData, error }: Props) {
  const t = useTranslations("nanoGallery");

  // Data
  const [allPrompts, setAllPrompts] = useState<Prompt[]>(initialData || []);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  // Derived State
  const [sources, setSources] = useState<string[]>(['all']);
  const [domainCategories, setDomainCategories] = useState<DomainCategory[]>([]);
  const [displayedCount, setDisplayedCount] = useState(20);

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    hasNextPage: false,
  });

  // ─────────────────────────────────────────────────────────────
  // Load Data
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!error) loadData();
    else setIsLoading(false);
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);

      const nanoPrompts = await nanoPromptsService.getMostPopularNanoPrompts();
      const mapped = nanoPrompts.map(mapNanoPromptToUI);

      processPrompts(mapped);
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function processPrompts(data: Prompt[]) {
    const valid = data.filter(
      (p) => p && typeof p.id === 'number' && typeof p.title === 'string'
    );

    setAllPrompts(valid);

    // Sources
    const uniqueSources = Array.from(
      new Set(valid.map((p) => p.sourceType).filter(Boolean))
    ) as string[];

    setSources(['all', ...uniqueSources]);

    // Domain categories
    const counts: Record<string, number> = {};
    valid.forEach((p) => {
      if (p.domainCategory) {
        counts[p.domainCategory] = (counts[p.domainCategory] || 0) + 1;
      }
    });

    setDomainCategories(
      Object.entries(counts).map(([category, count]) => ({
        category,
        count,
      }))
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────

  const filterPrompts = useCallback(() => {
    let filtered = [...allPrompts];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();

      filtered = filtered.filter((p) =>
        p.title?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.promptText?.toLowerCase().includes(search)
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter((p) => p.sourceType === sourceFilter);
    }

    if (domainFilter !== 'all') {
      filtered = filtered.filter((p) => p.domainCategory === domainFilter);
    }

    const total = filtered.length;
    const visible = Math.min(displayedCount, total);

    setPagination({
      total,
      hasNextPage: visible < total,
    });

    return filtered.slice(0, displayedCount);
  }, [allPrompts, searchTerm, sourceFilter, domainFilter, displayedCount]);

  useEffect(() => {
    setDisplayedCount(20);
  }, [searchTerm, sourceFilter, domainFilter]);

  useEffect(() => {
    setPrompts(filterPrompts());
  }, [filterPrompts]);

  const loadMore = () => setDisplayedCount((prev) => prev + 20);

  // ─────────────────────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            {t.rich("description", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-5 mb-8">
          <StatCard label="Total Results" value={pagination.total} />
          <StatCard label="Loaded" value={`${prompts.length} / ${pagination.total}`} />
        </section>

        {/* Categories */}
        {domainCategories.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {domainCategories.map(({ category, count }) => (
                <button
                  key={category}
                  onClick={() =>
                    setDomainFilter((prev) =>
                      prev === category ? 'all' : category
                    )
                  }
                  className={`px-3 py-2 rounded-lg border ${
                    domainFilter === category
                      ? 'bg-indigo-100 border-indigo-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {category} ({count})
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="search"
              className="pl-10 w-full border rounded-md p-2"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* Grid */}
        {prompts.length === 0 ? (
          <EmptyState onReset={() => {
            setSearchTerm('');
            setSourceFilter('all');
            setDomainFilter('all');
          }} />
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>

            {pagination.hasNextPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md"
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

// ─────────────────────────────────────────────────────────────
// Small Components
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <p className="text-gray-500">No prompts found</p>
      <button
        onClick={onReset}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Clear Filters
      </button>
    </div>
  );
}