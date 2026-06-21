'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('actionButtons');
  const [copied, setCopied] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);

  const normalizedUrl = normalizeCdnImageUrl(prompt.imageURL);
  const trackingId = `nano_banana_prompts:${prompt.id}`;

  // viewMode 'cards' matches what ExampleImagesGrid emits, so the gallery
  // funnel rolls up with the template example funnel in admin analytics.
  const trackCopy = useCopyTracking(trackingId, 'nano_gallery', 'cards');
  const trackClick = useClickTracking(trackingId, 'nano_gallery', 'cards');

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
                className="rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Remix affordance — signals this prompt is generable, not just
            copyable. Mirrors the home-rail gallery tile's badge. */}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-purple-600/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          <Sparkles className="h-3 w-3" /> Remix
        </span>
      </div>

      <div className="px-3 py-2">
        <h3 className="truncate text-sm font-semibold text-gray-900">
          {prompt.title}
        </h3>

        {/* Primary CTA = "Make your own" (value-capture). The whole card links
            to the detail page, whose reproduce surface lets the user generate;
            this just makes the generate intent the visible lead instead of
            Copy. Copy is demoted to a secondary icon-only action. */}
        <div className="mt-2 flex items-center gap-2">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-purple-700">
            <Sparkles className="h-3.5 w-3.5" />
            {t('remixThis')}
          </span>

          {prompt.prompt && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 cursor-pointer"
              aria-label={copied ? 'Copied' : `Copy prompt: ${prompt.title}`}
              title={copied ? 'Copied' : 'Copy prompt'}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}