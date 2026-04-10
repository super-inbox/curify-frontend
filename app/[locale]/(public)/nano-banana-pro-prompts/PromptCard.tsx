'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import type { NanoPromptBase } from '@/types/nanoPrompts';
import { useCopyTracking, useClickTracking } from "@/services/useTracking";

interface PromptCardProps {
  prompt: NanoPromptBase;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop';

const normalizeCdnImageUrl = (imageUrl: string | null | undefined): string => {
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

export default function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);

  const normalizedUrl = normalizeCdnImageUrl(prompt.imageURL);
  const trackingId = `nano_banana_prompts:${prompt.id}`;

  const trackCopy = useCopyTracking(trackingId, 'nano_gallery');
  const trackClick = useClickTracking(trackingId, 'nano_gallery');

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(prompt.prompt);
      trackCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt text:', err);
    }
  };

  return (
    <Link
      href={`/nano-banana-pro-prompts/${prompt.id}`}
      onClick={trackClick}
      className="group block overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`View details for ${prompt.title}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <CdnImage
          src={hasImgError ? PLACEHOLDER_IMAGE : normalizedUrl}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setHasImgError(true)}
        />

        {prompt.tags?.length > 0 && (
          <div className="absolute left-2 right-2 top-2 flex flex-wrap justify-end gap-1">
            {prompt.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {prompt.title}
        </h3>

        {prompt.prompt && (
          <div
            className="relative rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-16"
            onClick={(e) => e.preventDefault()}
          >
            <p className="line-clamp-2 text-xs text-gray-500">
              {prompt.prompt.slice(0, 80)}
              {prompt.prompt.length > 80 ? '…' : ''}
            </p>

            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
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
      </div>
    </Link>
  );
}