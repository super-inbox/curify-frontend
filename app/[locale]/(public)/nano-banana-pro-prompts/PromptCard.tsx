'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import CdnImage from '@/app/[locale]/_components/CdnImage';

export type PromptCardData = {
  id: number;
  title: string;
  description: string | null;
  promptText: string;
  imageUrl: string | null;
  category: string | null;
  sourceType: string | null;
  domainCategory: string | null;
};

interface PromptCardProps {
  prompt: PromptCardData;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop';

const normalizeCdnImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '/images/default-prompt-image.jpg';
  if (imageUrl.includes('static/images/')) {
    return imageUrl.replace('/static/images/', '/images/');
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
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

export default function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);

  const normalizedUrl = normalizeCdnImageUrl(prompt.imageUrl);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt text:', err);
    }
  };

  return (
    <Link
      href={`/nano-banana-pro-prompts/${prompt.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`View details for ${prompt.title}`}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <CdnImage
          src={hasImgError ? PLACEHOLDER_IMAGE : normalizedUrl}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setHasImgError(true)}
        />

        {prompt.sourceType && (
          <span
            className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${getSourceBadgeClass(
              prompt.sourceType
            )}`}
          >
            {prompt.sourceType}
          </span>
        )}

        {prompt.domainCategory && (
          <span className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {prompt.domainCategory}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {prompt.title}
        </h3>

        {prompt.description && (
          <p className="line-clamp-2 text-xs text-gray-500">
            {prompt.description}
          </p>
        )}

        {prompt.promptText && (
          <div
            className="relative rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-16"
            onClick={(e) => e.preventDefault()}
          >
            <p className="line-clamp-2 text-xs text-gray-500">
              {prompt.promptText.slice(0, 80)}
              {prompt.promptText.length > 80 ? '…' : ''}
            </p>

            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-800"
              aria-label={`Copy prompt: ${prompt.title}`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {prompt.category && (
          <p className="truncate text-xs text-gray-400">
            {prompt.category}
          </p>
        )}
      </div>
    </Link>
  );
}