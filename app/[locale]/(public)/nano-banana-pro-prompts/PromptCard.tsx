'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import CdnImage from '@/app/[locale]/_components/CdnImage';

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

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop';

const normalizeCdnImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '/images/default-prompt-image.jpg';
  if (imageUrl.includes('static/images/')) return imageUrl.replace('/static/images/', '/images/');
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/images/')) return imageUrl;
  if (!imageUrl.startsWith('/')) return `/images/${imageUrl}`;
  if (!imageUrl.includes('/images/')) return imageUrl.replace('/', '/images/');
  return imageUrl;
};

const getSourceBadgeClass = (sourceType: string) => {
  const classes: Record<string, string> = {
    twitter: 'bg-blue-500/80 text-white',
    youtube: 'bg-red-500/80 text-white',
    promptgather: 'bg-purple-500/80 text-white',
  };
  return classes[sourceType] || 'bg-gray-500/80 text-white';
};

interface PromptCardProps {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [hasImgError, setHasImgError] = useState(false);

  const copyToClipboard = (e: React.MouseEvent, text: string, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const normalizedUrl = normalizeCdnImageUrl(prompt.imageUrl);

  return (
    <Link
      href={`/nano-banana-pro-prompts/${prompt.id}`}
      className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`View details for ${prompt.title}`}
    >
      {/* Image — dominant, 4:3 aspect ratio */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <CdnImage
          src={hasImgError ? PLACEHOLDER_IMAGE : normalizedUrl}
          alt={prompt.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setHasImgError(true)}
        />

        {/* Overlay badges */}
        {prompt.sourceType && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full backdrop-blur-sm ${getSourceBadgeClass(prompt.sourceType)}`}
          >
            {prompt.sourceType}
          </span>
        )}
        {prompt.domainCategory && (
          <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
            {prompt.domainCategory}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {prompt.title}
        </h3>

        {/* Prompt snippet + inline copy button */}
        {prompt.promptText && (
          <div
            className="relative bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-16"
            onClick={(e) => e.preventDefault()}
          >
            <p className="text-xs text-gray-500 line-clamp-2">
              {prompt.promptText.substring(0, 80)}{prompt.promptText.length > 80 ? '…' : ''}
            </p>
            <button
              onClick={(e) => copyToClipboard(e, prompt.promptText, prompt.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-800"
              aria-label={`Copy prompt: ${prompt.title}`}
            >
              {copiedId === prompt.id ? (
                <><Check className="w-3 h-3 text-green-500" /><span>Copied</span></>
              ) : (
                <><Copy className="w-3 h-3" /><span>Copy</span></>
              )}
            </button>
          </div>
        )}

        {/* Author line */}
        <p className="text-xs text-gray-400 truncate">
          {prompt.author || 'Unknown'}
          {prompt.authorHandle && (
            <span> · @{prompt.authorHandle.replace('@', '')}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
