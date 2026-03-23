import { loadNanoData } from '@/lib/nano_data_source';

export interface JsonPrompt {
  id: number;
  title: string | null;
  description: string | null;
  promptText: string;
  author: string | null;
  authorHandle: string | null;
  date: string | null;
  category: string | null;
  sourceUrl: string | null;
  sourceType: string | null;
  imageUrl: string | null;
  likes: number | null;
  retweets: number | null;
  layoutCategory?: string | null;
  domainCategory?: string | null;
}

interface JsonData {
  prompts: JsonPrompt[];
  metadata: {
    sources: string[];
    layoutCategories: Array<{ category: string; count: number }>;
    domainCategories: Array<{ category: string; count: number }>;
    total: number;
    lastUpdated: string;
  };
}

export async function getPrompts(
  page: number = 1,
  limit: number = 20,
  searchTerm: string = '',
  sourceFilter: string = 'all',
  domainFilter: string = 'all',
  layoutFilter: string = 'all'
) {
  const data: JsonData = await loadNanoData();

  let filteredPrompts = [...data.prompts];

  // Apply filters
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredPrompts = filteredPrompts.filter(prompt =>
      prompt.title?.toLowerCase().includes(searchLower) ||
      prompt.description?.toLowerCase().includes(searchLower) ||
      prompt.promptText?.toLowerCase().includes(searchLower)
    );
  }

  if (sourceFilter !== 'all') {
    filteredPrompts = filteredPrompts.filter(prompt =>
      prompt.sourceType === sourceFilter
    );
  }

  if (domainFilter !== 'all') {
    filteredPrompts = filteredPrompts.filter(prompt =>
      prompt.domainCategory === domainFilter
    );
  }

  if (layoutFilter !== 'all') {
    filteredPrompts = filteredPrompts.filter(prompt =>
      prompt.layoutCategory === layoutFilter
    );
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPrompts = filteredPrompts.slice(startIndex, endIndex);

  return {
    data: paginatedPrompts,
    pagination: {
      page,
      limit,
      total: filteredPrompts.length,
      totalPages: Math.ceil(filteredPrompts.length / limit),
      hasNextPage: endIndex < filteredPrompts.length,
      hasPrevPage: page > 1
    }
  };
}

export async function getMetadata() {
  const data: JsonData = await loadNanoData();

  return {
    sources: data.metadata.sources,
    layoutCategories: data.metadata.layoutCategories,
    domainCategories: data.metadata.domainCategories
  };
}

export async function getPromptById(id: string) {
  const data: JsonData = await loadNanoData();

  return data.prompts.find(prompt => prompt.id.toString() === id) || null;
}