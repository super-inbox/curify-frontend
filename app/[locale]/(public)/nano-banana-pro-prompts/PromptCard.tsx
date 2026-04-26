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
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
            {prompt.tags.slice(0, 2).map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <h3 className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900">
          {prompt.title}
        </h3>

        {prompt.prompt && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 cursor-pointer"
            aria-label={`Copy prompt: ${prompt.title}`}
          >
            {copied ? (
              <><Check className="h-3 w-3 text-green-500" /><span>Copied</span></>
            ) : (
              <><Copy className="h-3 w-3" /><span>Copy</span></>
            )}
          </button>
        )}
      </div>
    </Link>
  );
}