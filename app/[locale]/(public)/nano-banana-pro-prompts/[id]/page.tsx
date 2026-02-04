import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';
import CopyButton from './CopyButton';
import CdnImage from '../../_components/CdnImage';

interface JsonPrompt {
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

type Prompt = {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  author: string;
  date: string;
  category: string;
  source_url: string;
  source_type: string;
  image_url: string;
  author_handle?: string;
  likes: number;
  retweets: number;
};

const fetchPrompt = async (id: string): Promise<Prompt | null> => {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'nanobanana.json');
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const data: JsonData = JSON.parse(fileContent);
    
    const prompt = data.prompts.find(p => p.id.toString() === id);
    
    if (!prompt) return null;
    
    return {
      id: prompt.id.toString(),
      title: prompt.title || 'Untitled Prompt',
      description: prompt.description || '',
      prompt_text: prompt.promptText || '',
      author: prompt.author || 'Anonymous',
      author_handle: prompt.authorHandle || undefined,
      date: prompt.date || new Date().toISOString().split('T')[0],
      category: prompt.category || 'Uncategorized',
      source_url: prompt.sourceUrl || '#',
      source_type: prompt.sourceType || 'unknown',
      image_url: prompt.imageUrl 
        ? prompt.imageUrl.includes('static/images/')
          ? prompt.imageUrl.replace('/static/images/', '/images/')
          : prompt.imageUrl.startsWith('/')
            ? prompt.imageUrl
            : `/${prompt.imageUrl}`
        : '/images/default-prompt-image.jpg',
      likes: prompt.likes ?? 0,
      retweets: prompt.retweets ?? 0
    };
  } catch (error) {
    console.error('Error fetching prompt:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

const getSourceBadgeClass = (sourceType: string) => {
  const classes = {
    twitter: 'bg-blue-100 text-blue-800',
    youtube: 'bg-red-100 text-red-800',
    promptgather: 'bg-purple-100 text-purple-800',
  };
  return classes[sourceType as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

export default async function PromptDetailPage({
  params
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  // Await params before destructuring
  const { id, locale } = await params;
  
  const prompt = await fetchPrompt(id);
  if (!prompt) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link 
              href={`/${locale}/nano-banana-pro-prompts`} 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Gallery
            </Link>
            <span className="text-sm text-gray-500">
              {new Date(prompt.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <article className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-4">
            <div className="relative w-full h-96 bg-gray-50 flex items-center justify-center">
              <CdnImage
                src={prompt.image_url}
                alt={prompt.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <div className="px-6 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {prompt.title}
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {prompt.author}
                    {prompt.author_handle && (
                      <span className="ml-1 text-gray-400">(@{prompt.author_handle.replace('@', '')})</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Created on {new Date(prompt.date).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeClass(prompt.source_type)}`}>
                      {prompt.source_type.charAt(0).toUpperCase() + prompt.source_type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {prompt.description && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{prompt.description}</p>
            </div>
          )}

          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-900">Prompt</h2>
              <CopyButton text={prompt.prompt_text} />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">{prompt.prompt_text}</pre>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {prompt.category && (
                <div>
                  <span className="font-medium text-gray-700">Category:</span> {prompt.category}
                </div>
              )}
              {prompt.source_url && prompt.source_url !== '#' && (
                <div>
                  <span className="font-medium text-gray-700">Source:</span>{' '}
                  <a 
                    href={prompt.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View original
                  </a>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}