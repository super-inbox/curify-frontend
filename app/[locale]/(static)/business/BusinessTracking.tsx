'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useTracking } from '@/services/useTracking';
import type { BusinessLang } from './copy';

// Keep the copy server rendered; this boundary instruments only the page's
// explicit links and video playback, without duplicating shared form events.
export default function BusinessTracking({ lang, children }: { lang: BusinessLang; children: ReactNode }) {
  const { trackAction } = useTracking();
  const viewed = useRef<string | null>(null);
  const played = useRef(new Set<string>());

  useEffect(() => {
    if (viewed.current === lang) return;
    viewed.current = lang;
    played.current.clear();
    trackAction({ contentId: `business:${lang}`, contentType: 'page' }, 'view');
  }, [lang, trackAction]);

  return (
    <div id="business-page" lang={lang} className="mx-auto max-w-6xl px-5 py-10 text-neutral-900 sm:px-8 sm:py-16"
      onClick={(event) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-business-event]');
        if (!link || !event.currentTarget.contains(link)) return;
        trackAction({ contentId: `business:${lang}:${link.dataset.businessEvent}`, contentType: 'menu_link' }, 'click');
      }}
      onPlayingCapture={(event) => {
        const video = event.target as HTMLVideoElement;
        const id = video.dataset.businessVideo;
        if (!id || played.current.has(id)) return;
        played.current.add(id);
        trackAction({ contentId: `business:${lang}:video:${id}`, contentType: 'page' }, 'video_play');
      }}
    >{children}</div>
  );
}
